import type { NextApiRequest, NextApiResponse } from 'next';

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'Missing refresh_token' });

  const params = new URLSearchParams({
    client_id: clientId!,
    grant_type: 'refresh_token',
    refresh_token,
  });

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await tokenRes.json();
    if (!tokenRes.ok) return res.status(tokenRes.status).json(data);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
