import { getSession, json } from './_utils.js';

export async function onRequestGet({ request, env }) {
  const session = await getSession(env, request);

  const query = session
    ? await env.DB.prepare('SELECT * FROM listings ORDER BY created_at DESC').all()
    : await env.DB.prepare("SELECT * FROM listings WHERE status = 'approved' ORDER BY created_at DESC").all();

  return json(query.results);
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'Invalid request body' }, 400);
  }

  const { category, title, price, location, sellerWhatsapp, description, image } = body;

  if (!title || !sellerWhatsapp) {
    return json({ error: 'Title and WhatsApp number are required' }, 400);
  }

  const createdAt = Date.now();

  const result = await env.DB.prepare(
    `INSERT INTO listings (category, title, price, location, seller_whatsapp, description, image, verified, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'pending', ?)`
  ).bind(
    category || 'Notices',
    title,
    price || 'Negotiable',
    location || 'Nkumba Campus',
    sellerWhatsapp,
    description || '',
    image || null,
    createdAt
  ).run();

  return json({ success: true, id: result.meta.last_row_id });
}
