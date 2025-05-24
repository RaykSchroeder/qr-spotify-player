// pages/player.tsx
import { useEffect, useState } from 'react';
import QRScanner from '@/components/QRScanner';

type Device = {
  id: string;
  name: string;
  is_active: boolean;
  is_restricted: boolean;
  type: string;
};

export default function Player() {
  const [token, setToken] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
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

  // Geräte auslesen und aktives Gerät setzen
  useEffect(() => {
    if (!token) return;

    async function fetchDevices() {
      try {
        const res = await fetch('https://api.spotify.com/v1/me/player/devices', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          setError('Fehler beim Abrufen der Geräte.');
          return;
        }

        setDevices(data.devices || []);

        const active = data.devices.find((d: Device) => d.is_active);
        if (active) {
          setActiveDeviceId(active.id);
        } else if (data.devices.length > 0) {
          // Wenn kein aktives Gerät, aktiviere das erste verfügbare
          await activateDevice(data.devices[0].id);
          setActiveDeviceId(data.devices[0].id);
        } else {
          setError('Kein verfügbares Gerät gefunden. Bitte Spotify auf einem Gerät öffnen.');
        }
      } catch {
        setError('Netzwerkfehler beim Abrufen der Geräte.');
      }
    }

    fetchDevices();
  }, [token]);

  // Gerät aktivieren
  async function activateDevice(deviceId: string) {
    if (!token) return;

    try {
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_ids: [deviceId], play: true }),
      });
    } catch {
      setError('Fehler beim Aktivieren des Geräts.');
    }
  }

  // Track abspielen
  const playTrack = async (uri: string) => {
    if (!token) return;
    if (!activeDeviceId) {
      setError('Kein aktives Gerät zum Abspielen gefunden.');
      return;
    }

    try {
      const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${activeDeviceId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uris: [uri] }),
      });
      if (!res.ok) setError('Konnte Song nicht abspielen.');
      else {
        setCurrentUri(uri);
        setError('');
      }
    } catch {
      setError('Netzwerkfehler beim Abspielen.');
    }
  };

  // Player steuern: play, pause, seek_forward, seek_backward
  const controlPlayer = async (action: string) => {
    if (!token) return;
    if (!activeDeviceId) {
      setError('Kein aktives Gerät zum Steuern gefunden.');
      return;
    }

    try {
      if (action === 'seek_forward' || action === 'seek_backward') {
        // Position holen
        const posRes = await fetch('https://api.spotify.com/v1/me/player', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!posRes.ok) {
          setError('Fehler beim Abrufen der aktuellen Position.');
          return;
        }
        const data = await posRes.json();
        const currentPos = data.progress_ms || 0;
        const offset = action === 'seek_forward' ? 10000 : -10000;
        const newPos = Math.max(currentPos + offset, 0);

        const seekRes = await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${newPos}&device_id=${activeDeviceId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!seekRes.ok) {
          setError('Fehler beim Suchen im Song.');
        }
      } else {
        // Play oder Pause
        const endpoint = action === 'play' ? 'play' : 'pause';
        const res = await fetch(`https://api.spotify.com/v1/me/player/${endpoint}?device_id=${activeDeviceId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) setError(`Fehler beim ${endpoint} des Players.`);
      }
    } catch {
      setError('Fehler bei der Playersteuerung.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Spotify Player</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!currentUri && <QRScanner onScan={(data) => playTrack(data)} />}

      {currentUri && (
        <>
          <p>Aktuelles Lied URI: {currentUri}</p>

          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => controlPlayer('play')}>▶️ Play</button>
            <button onClick={() => controlPlayer('pause')}>⏸️ Pause</button>
            <button onClick={() => controlPlayer('seek_backward')}>⏪ 10s zurück</button>
            <button onClick={() => controlPlayer('seek_forward')}>⏩ 10s vor</button>
            <button onClick={() => setCurrentUri(null)}>🔄 Neuer Song (scannen)</button>
          </div>
        </>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>Verfügbare Geräte:</h2>
        <ul>
          {devices.map((device) => (
            <li key={device.id}>
              {device.name} {device.is_active && '(Aktiv)'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
