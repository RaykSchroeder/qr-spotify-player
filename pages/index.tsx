import React, { useEffect, useState } from 'react';
import { QrReader } from '@blackbox-vision/react-qr-reader';
import { generateCodeChallenge, generateCodeVerifier } from '@/utils/pkce';

const clientId = '349608c2c10e4aaf84adc17e8d44e520';

const scopes = [
  'user-read-private',
  'user-read-email',
  'streaming',
  'user-modify-playback-state',
  'user-read-playback-state',
];

export default function Home() {
  const [authUrl, setAuthUrl] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [qrResult, setQrResult] = useState<string | null>(null);

  useEffect(() => {
    async function setupAuth() {
      const redirectUri = `${window.location.origin}/callback`;

      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      const state = Math.random().toString(36).substring(2);

      localStorage.setItem('verifier', verifier);
      localStorage.setItem('auth_state', state);

      const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
        scopes.join(' ')
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge_method=S256&code_challenge=${challenge}&state=${state}`;

      setAuthUrl(url);
    }

    setupAuth();

    // Prüfe z.B. hier, ob du schon authentifiziert bist (Token in localStorage?)
    // setIsAuthenticated(true);  // Beispiel, je nach deinem Auth-Flow
  }, []);

  if (!authUrl) return <p>Lade Login-Daten...</p>;

  if (!isAuthenticated) {
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

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Spotify QR Scanner Player</h1>
      <p>QR-Code scannen:</p>
      <QrReader
        onResult={(result, error) => {
          if (!!result) {
            setQrResult(result.getText());
          }
          if (!!error) {
            console.error(error);
          }
        }}
        style={{ width: '300px', margin: 'auto' }}
      />
      {qrResult && (
        <div style={{ marginTop: '1rem' }}>
          <strong>Erkannter QR-Code:</strong> <br />
          {qrResult}
        </div>
      )}
    </div>
  );
}
