import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const clientId = '349608c2c10e4aaf84adc17e8d44e520';
const redirectUri = 'https://v0-spotify-qr-code-script-2o.vercel.app/callback';

export default function Callback() {
  const router = useRouter();
  const [message, setMessage] = useState('Authentifiziere...');

  useEffect(() => {
    const handleAuth = async () => {
      const query = new URLSearchParams(window.location.search);
      const code = query.get('code');
      const returnedState = query.get('state');
      const storedState = localStorage.getItem('auth_state');
      const verifier = localStorage.getItem('verifier');

      if (!code || !returnedState || !storedState || !verifier) {
        setMessage('Fehlende Parameter.');
        return;
      }

      if (returnedState !== storedState) {
        setMessage('State-Parameter stimmt nicht überein.');
        return;
      }

      try {
        const body = new URLSearchParams({
          client_id: clientId,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          code_verifier: verifier,
        });

        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        });

        const data = await response.json();

        if (data.access_token) {
          setMessage('Authentifizierung erfolgreich!');
          // Hier kannst du Access Token speichern und weiterleiten
          localStorage.removeItem('auth_state');
          localStorage.removeItem('verifier');
          // Beispiel: Weiterleitung auf Hauptseite
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setMessage('Token-Austausch fehlgeschlagen.');
        }
      } catch (error) {
        setMessage('Fehler beim Authentifizieren.');
      }
    };

    if (router.isReady) {
      handleAuth();
    }
  }, [router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Spotify Authentifizierung</h1>
      <p>{message}</p>
    </div>
  );
}
