import React, { useEffect, useState } from 'react';
import { generateCodeChallenge, generateCodeVerifier } from '@/utils/pkce';

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;


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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        gap: '1.5rem',
        fontFamily: 'Arial, sans-serif',
        color: '#1DB954',
        padding: '2rem',
        backgroundColor: '#121212',
        borderRadius: '12px',
        width: '320px',
        margin: '4rem auto',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
      }}
    >
      <h1 style={{ marginBottom: '0.5rem' }}>Spotify Auth Demo</h1>
      <p style={{ color: '#b3b3b3' }}>Logge dich mit deinem Spotify-Account ein, um zu starten.</p>
      {authUrl && (
        <a href={authUrl} style={{ textDecoration: 'none', width: '100%' }}>
          <button
            style={{
              width: '100%',
              backgroundColor: '#1DB954',
              color: 'white',
              fontSize: '1.1rem',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(29, 185, 84, 0.6)',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#17a64b')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1DB954')}
            aria-label="Mit Spotify einloggen"
          >
            <svg
              height="24"
              width="24"
              viewBox="0 0 168 168"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M84 0C37.6364 0 0 37.6364 0 84C0 130.364 37.6364 168 84 168C130.364 168 168 130.364 168 84C168 37.6364 130.364 0 84 0ZM122.182 120.73C118.909 123.013 114.99 122.496 112.707 119.223C93.0273 92.0106 53.6366 88.1262 38.9882 78.6386C35.4167 76.4831 34.2387 71.8557 36.3941 68.2842C38.5496 64.7127 43.177 63.5347 46.7485 65.6902C65.884 77.4172 101.592 81.8428 123.949 112.511C126.232 115.784 125.715 119.703 122.182 120.73ZM131.49 104.034C127.949 107.424 122.671 107.031 119.282 103.49C94.9491 79.0207 50.3135 73.1994 36.8956 66.5389C33.3403 65.0049 32.1267 60.4528 33.6607 56.8975C35.1948 53.3423 39.7469 52.1286 43.3021 53.6627C58.5576 60.434 107.141 67.8911 133.419 106.164C136.82 109.58 136.156 114.629 131.49 104.034ZM136.742 85.1354C132.088 90.7537 124.567 91.4157 119.949 86.7616C92.0331 57.6829 48.8123 55.7551 41.6383 52.7247C38.2094 51.4235 37.0523 46.9555 38.3535 43.5266C39.6546 40.0977 44.1226 38.9406 47.5515 40.2418C57.5688 43.9744 99.1799 45.6269 129.254 82.4873C134.372 88.1651 135.396 94.187 136.742 85.1354Z" />
            </svg>
            Mit Spotify einloggen
          </button>
        </a>
      )}
    </div>
  );
}
