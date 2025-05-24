// pages/player.tsx
import { useEffect, useState } from 'react';
import QRScanner from '@/components/QRScanner';

export default function Player() {
  const [token, setToken] = useState<string | null>(null);
  const [currentUri, setCurrentUri] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setError('Kein Access Token gefunden. Bitte zuerst einloggen.');
      return;
    }
    setToken(accessToken);
  }, []);

  const checkActiveDevice = async (): Promise<boolean> => {
    if (!token) return false;

    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const activeDevice = data.devices.find((device: any) => device.is_active);
      return !!activeDevice;
    } catch {
      setError('Fehler beim Abrufen der Geräte.');
      return false;
    }
  };

  const playTrack = async (uri: string) => {
    if (!token) return;

    const hasDevice = await checkActiveDevice();
    if (!hasDevice) {
      setError('Kein aktives Gerät gefunden. Bitte Spotify auf einem Gerät öffnen.');
      return;
    }

    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uris: [uri] }),
      });
      if (!res.ok) setError('Konnte Song nicht abspielen.');
      else {
        setError('');
        setCurrentUri(uri);
      }
    } catch {
      setError('Netzwerkfehler.');
    }
  };

  const controlPlayer = async (action: string) => {
    if (!token) return;
    let endpoint = '';
    let body: any = {};
    if (action === 'pause') endpoint = 'pause';
    else if (action === 'play') endpoint = 'play';
    else if (action === 'seek_forward') endpoint = 'seek';
    else if (action === 'seek_backward') endpoint = 'seek';

    if (action === 'seek_forward') body = { position_ms: 10000 }; // +10s
    if (action === 'seek_backward') body = { position_ms: -10000 }; // nicht erlaubt, wir müssen position holen

    try {
      if (endpoint === 'seek') {
        // aktuelle Position holen
        const posRes = await fetch('https://api.spotify.com/v1/me/player', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await posRes.json();
        const currentPos = data.progress_ms || 0;
        const newPos = action === 'seek_forward' ? currentPos + 10000 : Math.max(currentPos - 10000, 0);
        await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${newPos}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      setError('Fehler beim Steuern des Players.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Spotify Player</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!currentUri && <QRScanner onScan={(data) => playTrack(data)} />}

      {currentUri && (
        <>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => controlPlayer('play')}>▶️ Play</button>
            <button onClick={() => controlPlayer('pause')}>⏸️ Pause</button>
            <button onClick={() => controlPlayer('seek_backward')}>⏪ 10s zurück</button>
            <button onClick={() => controlPlayer('seek_forward')}>⏩ 10s vor</button>
            <button onClick={() => setCurrentUri(null)}>🔄 Nächster Song (scannen)</button>
          </div>
        </>
      )}
    </div>
  );
}
