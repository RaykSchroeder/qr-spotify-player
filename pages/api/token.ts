// pages/api/token.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const clientId = '349608c2c10e4aaf84adc17e8d44e520';
const redirectUri = 'https://qr-spotify-player.vercel.app/callback';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code, code_verifier } = req.body;
  if (!code || !code_verifier) return res.status(400).json({ error: 'Missing code or code_verifier' });

  const params = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier,
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
