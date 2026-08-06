import { json } from '../_utils.js';

export async function onRequestPatch({ request, env, params }) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'Invalid request body' }, 400);
  }

  const { status } = body;
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return json({ error: 'Invalid status' }, 400);
  }

  if (status === 'approved') {
    await env.DB.prepare('UPDATE listings SET status = ?, verified = 1 WHERE id = ?')
      .bind(status, params.id).run();
  } else {
    await env.DB.prepare('UPDATE listings SET status = ? WHERE id = ?')
      .bind(status, params.id).run();
  }

  return json({ success: true });
}

export async function onRequestDelete({ env, params }) {
  await env.DB.prepare('DELETE FROM listings WHERE id = ?').bind(params.id).run();
  return json({ success: true });
}
