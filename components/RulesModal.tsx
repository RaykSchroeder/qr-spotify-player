import React from 'react';

type Props = {
  show: boolean;
  onClose: () => void;
};

const RulesModal: React.FC<Props> = ({ show, onClose }) => {
  if (!show) return null; // << WICHTIG: Nur anzeigen, wenn show true ist

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        textAlign: 'left',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        fontSize: '0.95rem',
        lineHeight: '1.5'
      }}>
        <h2 style={{ marginTop: 0, color: '#1DB954' }}>🎵 SPIELANLEITUNG – Musik-Zeitreise</h2>

        <h3>📲 Vor dem Spiel</h3>
        <ol>
          <li><strong>Spotify starten:</strong> Öffne Spotify und spiele ein beliebiges Lied ab.</li>
          <li><strong>Web-App öffnen:</strong> Rufe den Link zur Web-App auf und logge dich mit deinem Spotify-Account ein.</li>
          <li><strong>Startspieler festlegen:</strong> Entscheidet gemeinsam, welches Team beginnt.</li>
          <li><strong>Startkarten ziehen:</strong> Jedes Team erhält eine Startkarte. Diese wird offen vor das jeweilige Team gelegt.</li>
        </ol>

        <h3>🎮 So wird gespielt</h3>
        <ol>
          <li><strong>Karte scannen:</strong> Das aktive Team scannt den QR-Code der obersten Karte vom Stapel.</li>
          <li><strong>Song anhören:</strong> Der Song wird über Spotify automatisch abgespielt.</li>
          <li><strong>Einordnen:</strong> Das Team überlegt, wo die neue Karte zeitlich einsortiert werden soll.</li>
          <li><strong>Einloggen:</strong> Ist das Team sicher, sagt es laut: „Eingeloggt!“</li>
          <li><strong>Auflösung:</strong>
            <ul>
              <li><strong>Richtig eingeordnet:</strong> Die Karte bleibt beim Team.</li>
              <li><strong>Falsch eingeordnet:</strong> Die Karte kommt aus dem Spiel.</li>
            </ul>
          </li>
        </ol>

        <h3>🕵️‍♀️ Karten klauen</h3>
        <ul>
          <li>Nach dem „Eingeloggt!“ darf das gegnerische Team vermuten, dass die Karte falsch einsortiert wurde.</li>
          <li><strong>Wenn richtig:</strong> → Karte wird geklaut.</li>
          <li><strong>Wenn falsch:</strong> → Das aktive Team darf sofort weiterspielen.</li>
        </ul>

        <h3>🛡️ Karte safen</h3>
        <ul>
          <li> Nennt das aktive Team korrekt Interpret & Songtitel, ist die Karte gesichert.</li>
        </ul>

        <h3>🏁 Spielende</h3>
        <ul>
          <li>Das Spiel endet, wenn ein Team 10 Karten korrekt einsortiert hat.</li>
        </ul>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button onClick={onClose} style={{
            backgroundColor: '#1DB954',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '1rem'
          }}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
