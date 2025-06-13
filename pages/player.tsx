import { useEffect, useState, useRef } from 'react';
import QRScanner from '@/components/QRScanner';
import RulesModal from '@/components/RulesModal';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlay, faPause, faBackward, faForward, faQrcode, faBook } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

library.add(faPlay, faPause, faBackward, faForward, faQrcode, faBook);

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
  const [showRules, setShowRules] = useState(false);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      const newToken = await refreshAccessToken();
      if (newToken) {
        setToken(newToken);
      } else {
        setError('Token konnte nicht aktualisiert werden. Bitte neu einloggen.');
      }
    }, 1000 * 60 * 50);

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchDevices = async () => {
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
          setActiveDeviceId(data.devices[0].id);
        } else {
          setError('Kein verfügbares Gerät gefunden. Bitte Spotify auf einem Gerät öffnen.');
        }
      } catch {
        setError('Netzwerkfehler beim Abrufen der Geräte.');
      }
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
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
    if (!token || !activeDeviceId) {
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
        clearKeepAlive();
      }
    } catch {
      setError('Netzwerkfehler beim Abspielen.');
    }
  };

  const clearKeepAlive = () => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
  };

  const sendKeepAlivePing = async () => {
    if (!token || !activeDeviceId) return;

    try {
      await fetch('https://api.spotify.com/v1/me/player', {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
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

        if (action === 'pause') {
          clearKeepAlive();
          keepAliveIntervalRef.current = setInterval(() => {
            sendKeepAlivePing();
          }, 10000);
        } else {
          clearKeepAlive();
        }
      }
    } catch {
      setError('Fehler bei der Playersteuerung.');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: '0 1rem' }}>
      <h1 style={{ color: '#1DB954', marginBottom: '0.5rem' }}>Spotify Player</h1>

      {devices.length > 0 && (
        <div style={{ margin: '1rem 0' }}>
          <label htmlFor="device-select" style={{ marginRight: '0.5rem' }}>🎧 Gerät wählen:</label>
          <select
            id="device-select"
            value={activeDeviceId || ''}
            onChange={async (e) => {
              const selectedId = e.target.value;
              setActiveDeviceId(selectedId);
              await activateDevice(selectedId);
            }}
            style={{
              padding: '0.5rem',
              fontSize: '1rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              minWidth: 200
            }}
          >
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.type}) {device.is_active ? '✅' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {devices.length === 0 && (
        <p style={{ color: 'gray' }}>🔍 Keine Spotify-Geräte gefunden. Bitte Spotify auf einem Gerät öffnen.</p>
      )}

      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
      {!currentUri && <QRScanner onScan={(data) => playTrack(data)} />}

      {currentUri && (
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => controlPlayer('play')} style={buttonStyle}><FontAwesomeIcon icon="play" /> Play</button>
          <button onClick={() => controlPlayer('pause')} style={buttonStyle}><FontAwesomeIcon icon="pause" /> Pause</button>
          <button onClick={() => controlPlayer('seek_backward')} style={buttonStyle}><FontAwesomeIcon icon="backward" /> 10s zurück</button>
          <button onClick={() => controlPlayer('seek_forward')} style={buttonStyle}><FontAwesomeIcon icon="forward" /> 10s vor</button>
          <button onClick={() => setCurrentUri(null)} style={{ ...buttonStyle, backgroundColor: '#f0f0f0', color: '#333' }}>
            Stop & Neuer Scan
          </button>
        </div>
      )}

      <button
        onClick={() => setShowRules(true)}
        style={{ marginTop: '2rem', backgroundColor: '#1DB954', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '4px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon="book" /> Spielregeln anzeigen
      </button>

      <RulesModal show={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#1DB954',
  border: 'none',
  padding: '0.75rem 1.25rem',
  color: 'white',
  fontWeight: 'bold',
  borderRadius: '4px',
  cursor: 'pointer',
  minWidth: 90,
  fontSize: '0.9rem',
};

async function refreshAccessToken() {
  return null; // Muss durch deine Logik ersetzt werden
}
