import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Hier musst du deinen Auth-Check implementieren
  const [qrResult, setQrResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

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
  }, []);

  useEffect(() => {
    if (isAuthenticated && videoRef.current) {
      // QR-Scanner mit Worker vom CDN laden
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => setQrResult(result),
        { workerPath: 'https://unpkg.com/qr-scanner@1.4.2/qr-scanner-worker.min.js' }
      );
      qrScannerRef.current.start();

      return () => {
        qrScannerRef.current?.stop();
        qrScannerRef.current?.destroy();
      };
    }
  }, [isAuthenticated]);

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
      <video ref={videoRef} style={{ width: '300px', margin: 'auto' }}></video>
      {qrResult && (
        <div style={{ marginTop: '1rem' }}>
          <strong>Erkannter QR-Code:</strong> <br />
          {qrResult}
        </div>
      )}
    </div>
  );
}
