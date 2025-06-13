import { useEffect, useRef, useState } from 'react';
import QRScanner from '@/components/QRScanner';
import RulesModal from '@/components/RulesModal';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlay, faPause, faBackward, faForward, faQrcode, faBook } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

library.add(...[faPlay, faPause, faBackward, faForward, faQrcode, faBook]);

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
  const [isPaused, setIsPaused] = useState(false);

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
          await activateDevice(data.devices[0].id);
          setActiveDeviceId(data.devices[0].id);
        } else {
          setError('Kein verfügbares Gerät gefunden. Bitte Spotify auf einem Gerät öffnen.');
        }
      } catch {
        setError('Netzwerkfehler beim Abrufen der Geräte.');
      }
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, 3000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token || !activeDeviceId || !isPaused) {
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
        keepAliveIntervalRef.current = null;
      }
      return;
    }

    if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);

    keepAliveIntervalRef.current = setInterval(() => {
      sendKeepAliveSeek();
    }, 3000);

    return () => {
      if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
    };
  }, [token, activeDeviceId, isPaused]);

  const activateDevice = async (deviceId: string) => {
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
  };

  const handleDeviceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    await activateDevice(selectedId);
    setActiveDeviceId(selectedId);
  };

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
        setIsPaused(false); // Stoppe KeepAlive wenn neuer Song gespielt wird
      }
    } catch {
      setError('Netzwerkfehler beim Abspielen.');
    }
  };

  const sendKeepAliveSeek = async () => {
    if (!token || !activeDeviceId) return;
    try {
      const res = await fetch('https://api.spotify.com/v1/me/player', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const currentPos = data.progress_ms || 0;
      const seekRes = await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${currentPos}&device_id=${activeDeviceId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Fehler ignorieren
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
        const data = await posRes.json();
        const currentPos = data.progress_ms || 0;
        const offset = action === 'seek_forward' ? 10000 : -10000;
        const newPos = Math.max(currentPos + offset, 0);
        await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${newPos}&device_id=${activeDeviceId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        const endpoint = action === 'play' ? 'play' : 'pause';
        const res = await fetch(`https://api.spotify.com/v1/me/player/${endpoint}?device_id=${activeDeviceId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setIsPaused(action === 'pause');
        if (!res.ok) setError(`Fehler beim ${endpoint} des Players.`);
      }
    } catch {
      setError('Fehler bei der Playersteuerung.');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: '0 1rem' }}>
      <h1 style={{ color: '#1DB954', marginBottom: '0.5rem' }}>Spotify Player</h1>
      {userName && <p>Angemeldet als: <strong>{userName}</strong></p>}
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      {devices.length > 0 && (
        <div style={{ margin: '1rem 0' }}>
          <label htmlFor="deviceSelect" style={{ marginRight: '0.5rem' }}>Gerät wählen:</label>
          <select id="deviceSelect" value={activeDeviceId || ''} onChange={handleDeviceChange}>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name} {device.is_active ? '✅' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {!currentUri && <QRScanner onScan={(data) => playTrack(data)} />}

      {currentUri && (
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => controlPlayer('play')} style={buttonStyle}><FontAwesomeIcon icon="play" /> Play</button>
          <button onClick={() => controlPlayer('pause')} style={buttonStyle}><FontAwesomeIcon icon="pause" /> Pause</button>
          <button onClick={() => controlPlayer('seek_backward')} style={buttonStyle}><FontAwesomeIcon icon="backward" /> 10s zurück</button>
          <button onClick={() => controlPlayer('seek_forward')} style={buttonStyle}><FontAwesomeIcon icon="forward" /> 10s vor</button>
          <button onClick={() => { setCurrentUri(null); setIsPaused(false); }} style={{ ...buttonStyle, backgroundColor: '#f0f0f0', color: '#333' }}>
            Neuen Song scannen
          </button>
        </div>
      )}

      <button onClick={() => setShowRules(true)} style={{ marginTop: '2rem', backgroundColor: '#1DB954', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '4px', cursor: 'pointer' }}>
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
  return null; // Ersetze durch echte Refresh-Token-Logik
}
