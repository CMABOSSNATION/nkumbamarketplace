import { json } from '../_utils.js';

export async function onRequestGet({ env }) {
  const query = await env.DB.prepare('SELECT * FROM listings ORDER BY created_at DESC').all();
  return json(query.results);
}
