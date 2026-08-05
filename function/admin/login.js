import { json } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'Invalid request body' }, 400);
  }

  const { pin } = body;

  if (!pin || pin !== env.ADMIN_PIN) {
    return json({ error: 'Incorrect PIN' }, 401);
  }

  const token = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + 12 * 60 * 60 * 1000; // 12 hours

  await env.DB.prepare(
    'INSERT INTO sessions (token, created_at, expires_at) VALUES (?, ?, ?)'
  ).bind(token, now, expiresAt).run();

  return json({ token });
}
