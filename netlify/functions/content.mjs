import { getStore } from '@netlify/blobs';

export default async function () {
  try {
    const store = getStore({ name: 'zaynron-media', consistency: 'strong' });
    const settings = await store.get('settings', { type: 'json' });
    return Response.json({
      hasPhoto: Boolean(settings?.hasPhoto),
      photoUrl: settings?.hasPhoto ? `/.netlify/functions/photo?v=${encodeURIComponent(settings.updatedAt || '')}` : null,
      videoTitle: settings?.videoTitle || '',
      videoUrl: settings?.videoUrl || ''
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Content error', error);
    return Response.json({ error: 'Não foi possível consultar o conteúdo.' }, { status: 500 });
  }
}
