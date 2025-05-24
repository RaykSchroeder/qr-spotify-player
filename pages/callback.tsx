import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const clientId = '349608c2c10e4aaf84adc17e8d44e520';
const redirectUri = 'https://v0-spotify-qr-code-script-2o.vercel.app/callback';

export default function Callback() {
  const router = useRouter();
  const [message, setMessage] = useState('Lade...');

  useEffect(() => {
    const fetchToken = async () => {
      const code = router.query.code as string;
      const state = router.query.state as string;
      const storedState = localStorage.getItem('auth_state');
      const verifier = localStorage.getItem('verifier');

      if (!code || !verifier || state !== storedState) {
        setMessage('Fehler bei der Authentifizierung.');
        return;
      }

      try {
        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', redirectUri);
        params.append('code_verifier', verifier);

        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        const data = await response.json();

        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
          setMessage('Login erfolgreich! Weiterleitung...');
          router.push('/player'); // z. B. dein Player
        } else {
          setMessage('Token konnte nicht abgerufen werden.');
        }
      } catch (err) {
        setMessage('Fehler beim Token-Tausch.');
      }
    };

    if (router.isReady) fetchToken();
  }, [router]);

  return <p style={{ textAlign: 'center' }}>{message}</p>;
}
