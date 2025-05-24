import type { NextApiRequest, NextApiResponse } from 'next';

const clientId = '349608c2c10e4aaf84adc17e8d44e520';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code, code_verifier } = req.body;

  if (!code || !code_verifier) {
    return res.status(400).json({ error: 'Missing code or code_verifier' });
  }

  // Dynamische Redirect URI passend zur Umgebung
  const redirectUri =
    process.env.NODE_ENV === 'production'
      ? 'https://qr-spotify-player.vercel.app/callback'
      : 'http://localhost:3000/callback';

  try {
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    params.append('code_verifier', code_verifier);

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Token error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
