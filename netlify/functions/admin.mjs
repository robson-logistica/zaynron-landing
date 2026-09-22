import { timingSafeEqual, createHash } from 'node:crypto';
import { getStore } from '@netlify/blobs';

const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
function authorized(request, secret) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') || '';
  const digest = input => createHash('sha256').update(input).digest();
  return Boolean(token && secret && timingSafeEqual(digest(token), digest(secret)));
}
function jpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset++] !== 0xff) return null;
    let marker = buffer[offset++];
    while (marker === 0xff) marker = buffer[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (offset + 2 > buffer.length) return null;
    const size = buffer.readUInt16BE(offset);
    if (size < 2 || offset + size > buffer.length) return null;
    if ([0xc0, 0xc1, 0xc2, 0xc3].includes(marker) && size >= 7) {
      return [buffer.readUInt16BE(offset + 3), buffer.readUInt16BE(offset + 5)];
    }
    offset += size;
  }
  return null;
}

export default async function (request) {
  if (request.method !== 'POST') return json({ error: 'Método inválido.' }, 405);
  const secret = process.env.ZAYNRON_ADMIN_PASSWORD;
  if (!secret) return json({ error: 'Configure ZAYNRON_ADMIN_PASSWORD no Netlify e publique novamente.' }, 503);
  if (!authorized(request, secret)) return json({ error: 'Senha incorreta.' }, 401);
  try {
    const body = await request.json();
    const store = getStore({ name: 'zaynron-media', consistency: 'strong' });
    const current = await store.get('settings', { type: 'json' }) || {};
    const action = body.action;
    if (action === 'upload') {
      if (typeof body.image !== 'string' || body.image.length > 1_400_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(body.image)) {
        return json({ error: 'Arquivo inválido ou grande demais.' }, 400);
      }
      const bytes = Buffer.from(body.image, 'base64');
      const dims = jpegDimensions(bytes);
      if (bytes.length > 900_000 || dims?.[0] !== 1500 || dims?.[1] !== 1200) {
        return json({ error: 'A foto deve ser JPG com 1200 × 1500 px e até 900 KB.' }, 400);
      }
      await store.set('founder-photo', bytes);
      await store.setJSON('settings', { ...current, hasPhoto: true, updatedAt: Date.now() });
    } else if (action === 'hide') {
      await store.setJSON('settings', { ...current, hasPhoto: false, updatedAt: Date.now() });
    } else if (action === 'video') {
      const title = String(body.title || '').trim().slice(0, 120);
      const url = String(body.url || '').trim();
      if (url && (!/^https:\/\//i.test(url) || url.length > 500)) return json({ error: 'Use um link HTTPS válido.' }, 400);
      await store.setJSON('settings', { ...current, videoTitle: title, videoUrl: url, updatedAt: Date.now() });
    } else return json({ error: 'Ação inválida.' }, 400);
    return json({ success: true });
  } catch (error) {
    console.error('Admin error', error);
    return json({ error: 'Não foi possível salvar. Tente novamente.' }, 500);
  }
}
