import { getStore } from '@netlify/blobs';

export default async function () {
  try {
    const store = getStore({ name: 'zaynron-media', consistency: 'strong' });
    const settings = await store.get('settings', { type: 'json' });
    if (!settings?.hasPhoto) return new Response('Foto não publicada', { status: 404 });
    const bytes = await store.get('founder-photo', { type: 'arrayBuffer' });
    if (!bytes) return new Response('Foto indisponível', { status: 404 });
    return new Response(bytes, { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch (error) {
    console.error('Photo error', error);
    return new Response('Erro ao carregar foto', { status: 500 });
  }
}
