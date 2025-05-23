import React, { useEffect, useState } from 'react';
import { generateCodeChallenge, generateCodeVerifier } from '@/utils/pkce';

const clientId = '349608c2c10e4aaf84adc17e8d44e520';
const redirectUri = 'https://v0-spotify-qr-code-script-2o.vercel.app/callback';
const scopes = [
  'user-read-private',
  'user-read-email',
  'streaming',
  'user-modify-playback-state',
  'user-read-playback-state',
];

export default function Home() {
  const [authUrl, setAuthUrl] = useState('');

  useEffect(() => {
    const setupAuth = async () => {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      const state = Math.random().toString(36).substring(2);

      localStorage.setItem('verifier', verifier);
      localStorage.setItem('auth_state', state);

      const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
        scopes.join(' ')
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge_method=S256&code_challenge=${challenge}&state=${state}`;

      setAuthUrl(url);
    };

    setupAuth();
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Spotify QR Scanner Player</h1>
      <p>Bitte logge dich zuerst mit deinem Spotify-Account ein.</p>
      <a href={authUrl}>
        <button>Mit Spotify einloggen</button>
      </a>
    </div>
  );
}
