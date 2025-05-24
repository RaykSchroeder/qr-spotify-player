import { useEffect, useState } from 'react';

type CurrentlyPlaying = {
  item: {
    name: string;
    artists: { name: string }[];
    album: { images: { url: string }[] };
  } | null;
  is_playing: boolean;
};

export default function Player() {
  const [token, setToken] = useState<string | null>(null);
  const [playing, setPlaying] = useState<CurrentlyPlaying | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setError('Kein Access Token gefunden. Bitte zuerst einloggen.');
      return;
    }
    setToken(accessToken);

    const fetchPlaying = async () => {
      try {
        const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.status === 204) {
          setPlaying(null); // Nichts wird gerade abgespielt
          return;
        }
        if (!res.ok) {
          setError('Fehler beim Laden der aktuellen Wiedergabe.');
          return;
        }

        const data = await res.json();
        setPlaying(data);
      } catch {
        setError('Netzwerkfehler.');
      }
    };

    fetchPlaying();

    // Optional: alle 10 Sekunden aktualisieren
    const interval = setInterval(fetchPlaying, 10000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>;
  }

  if (!playing) {
    return <p style={{ textAlign: 'center' }}>Momentan wird nichts abgespielt.</p>;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Jetzt läuft:</h1>
      <img src={playing.item?.album.images[0]?.url} alt="Album Cover" style={{ width: 200, borderRadius: 8 }} />
      <h2>{playing.item?.name}</h2>
      <p>
        {playing.item?.artists.map((artist) => artist.name).join(', ')}
      </p>
      <p>{playing.is_playing ? '🎵 Wiedergabe läuft' : '⏸️ Wiedergabe pausiert'}</p>
    </div>
  );
}
