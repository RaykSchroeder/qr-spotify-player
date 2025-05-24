import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    async function getToken() {
      const { code, state } = router.query;
      if (!code) return;

      const verifier = localStorage.getItem('verifier');
      const redirectUri = `${window.location.origin}/callback`;

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: redirectUri,
        client_id: '349608c2c10e4aaf84adc17e8d44e520',
        code_verifier: verifier || '',
      });

      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('access_token', data.access_token);
        router.push('/player');
      } else {
        console.error('Token Request fehlgeschlagen', await res.text());
      }
    }

    if (router.isReady) {
      getToken();
    }
  }, [router]);

  return <p>Token wird geladen...</p>;
}
