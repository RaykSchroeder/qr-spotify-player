// pages/callback.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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
        const response = await fetch('/api/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, code_verifier: verifier }),
        });

        const data = await response.json();

        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
          setMessage('Login erfolgreich! Weiterleitung...');
          router.push('/player');
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
