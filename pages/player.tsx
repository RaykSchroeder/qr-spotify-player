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
  const [userName, setUserName] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setError('Kein Access Token gefunden. Bitte zuerst einloggen.');
      return;
    }
    setToken(accessToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    async function fetchUser() {
      try {
        const res = await fetch('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setError('Fehler beim Abrufen der Benutzerinfos. Bitte überprüfe deinen Login.');
          return;
        }
        const data = await res.json();
        setUserName(data.display_name || data.id);
      } catch {
        setError('Netzwerkfehler beim Abrufen der Benutzerinfos.');
      }
    }

    fetchUser();
  }, [token]);

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

  const controlPlayer = async (action: string) => {
    if (!token || !activeDeviceId) {
      setError('Kein aktives Gerät zum Steuern gefunden.');
      return;
    }

    try {
      if (action === 'seek_forward' || action === 'seek_backward') {
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
        if (!seekRes.ok) setError('Fehler beim Suchen im Song.');
      } else {
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
    <div style={{ maxWidth: 420, margin: '2rem auto', fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: '0 1rem' }}>
      <h1 style={{ color: '#1DB954', marginBottom: '0.5rem' }}>Spotify Player</h1>

      {userName && <p style={{ fontSize: '1rem' }}>Angemeldet als: <strong>{userName}</strong></p>}
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      {!currentUri && <QRScanner onScan={(data) => playTrack(data)} />}

      {currentUri && (
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => controlPlayer('play')}
            style={buttonStyle}
            aria-label="Play"
          >
            <i className="fa fa-play" /> Play
          </button>
          <button
            onClick={() => controlPlayer('pause')}
            style={buttonStyle}
            aria-label="Pause"
          >
            <i className="fa fa-pause" /> Pause
          </button>
          <button
            onClick={() => controlPlayer('seek_backward')}
            style={buttonStyle}
            aria-label="10 Sekunden zurück"
          >
            <i className="fa fa-backward" /> 10s zurück
          </button>
          <button
            onClick={() => controlPlayer('seek_forward')}
            style={buttonStyle}
            aria-label="10 Sekunden vor"
          >
            <i className="fa fa-forward" /> 10s vor
          </button>
          <button
            onClick={() => setCurrentUri(null)}
            style={{ ...buttonStyle, backgroundColor: '#f0f0f0', color: '#333' }}
            aria-label="Neuen Song scannen"
          >
            <i className="fa fa-qrcode" /> Neuer Song (scannen)
          </button>
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'left' }}>
        <h2 style={{ borderBottom: '2px solid #1DB954', paddingBottom: '0.25rem' }}>Verfügbare Geräte:</h2>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {devices.map((device) => (
            <li
              key={device.id}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: device.is_active ? '#1DB954' : '#eee',
                color: device.is_active ? 'white' : '#333',
                borderRadius: 8,
                marginBottom: '0.5rem',
                cursor: 'pointer',
                userSelect: 'none',
                fontWeight: device.is_active ? 'bold' : 'normal',
                transition: 'background-color 0.2s',
              }}
              onClick={() => {
                if (!device.is_active) {
                  activateDevice(device.id);
                  setActiveDeviceId(device.id);
                  setError('');
                }
              }}
              title={device.is_active ? 'Aktives Gerät' : 'Auf dieses Gerät wechseln'}
            >
              {device.name} {device.is_active && '(Aktiv)'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#1DB954',
  color: 'white',
  border: 'none',
  padding: '0.6rem 1.2rem',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  transition: 'background-color 0.2s',
};
