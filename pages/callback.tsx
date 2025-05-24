import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      const storedState = localStorage.getItem('auth_state');
      if (state !== storedState) {
        alert('State mismatch! Auth failed.');
        return;
      }

      const verifier = localStorage.getItem('verifier');

      if (!code || !verifier) {
        alert('Missing code or verifier');
        return;
      }

      // Token Request
      const body = new URLSearchParams({
        client_id: '349608c2c10e4aaf84adc17e8d44e520',
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${window.location.origin}/callback`,
        code_verifier: verifier,
      });

      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.removeItem('verifier');
        localStorage.removeItem('auth_state');

        router.replace('/');
      } else {
        alert('Token request failed');
      }
    }

    handleCallback();
  }, [router]);

  return <p>Authentifiziere...</p>;
}
