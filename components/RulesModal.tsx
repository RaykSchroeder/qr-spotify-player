import React, { useState } from 'react';

type Props = {
  show: boolean;
  onClose: () => void;
};

const RulesModal: React.FC<Props> = ({ show, onClose }) => {
  const [selectedVersion, setSelectedVersion] = useState<null | number>(null);

  if (!show) return null;

  const renderVersionSelection = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: '#1DB954' }}>🎵 Wähle eine Spielanleitung</h2>
      <button onClick={() => setSelectedVersion(1)} style={buttonStyle}>
        📘 Version 1
      </button>
      <button onClick={() => setSelectedVersion(2)} style={{ ...buttonStyle, marginLeft: '1rem' }}>
        🆕 Version 2
      </button>
    </div>
  );

  const renderRulesV1 = () => (
    <>
      <h2 style={{ marginTop: 0, color: '#1DB954' }}>🎵 SPIELANLEITUNG – Musik-Zeitreise</h2>

      <h3>📲 Vor dem Spiel</h3>
      <ol>
        <li><strong>Spotify starten:</strong> Öffne Spotify und spiele ein beliebiges Lied ab.</li>
        <li><strong>Web-App öffnen:</strong> Rufe den Link zur Web-App auf und logge dich mit deinem Spotify-Account ein.</li>
        <li><strong>Startspieler festlegen:</strong> Entscheidet gemeinsam (und bitte ohne Schlägerei), welches Team beginnt.</li>
        <li><strong>Startkarten ziehen:</strong> Jedes Team erhält eine Startkarte. Diese wird offen vor das jeweilige Team gelegt.</li>
      </ol>

      <h3>🎮 So wird gespielt</h3>
      <ol>
        <li><strong>Karte scannen:</strong> Das aktive Team scannt den QR-Code der obersten Karte vom Stapel.</li>
        <li><strong>Song anhören:</strong> Der Song wird über Spotify automatisch abgespielt.</li>
        <li><strong>Einordnen:</strong> Das Team überlegt, wo die neue Karte zeitlich (chronologisch) einsortiert werden soll – also vor, zwischen oder nach den bereits ausliegenden Karten.</li>
        <li><strong>Einloggen:</strong> Ist das Team sicher, sagt es laut: „Eingeloggt!“ – ab jetzt darf nichts mehr geändert werden.</li>
        <li><strong>Auflösung:</strong>
          <ul>
            <li><strong>Richtig eingeordnet:</strong> Die Karte bleibt beim Team.</li>
            <li><strong>Falsch eingeordnet:</strong> Die Karte kommt aus dem Spiel, und das andere Team ist an der Reihe.</li>
          </ul>
        </li>
      </ol>

      <h3>🕵️‍♀️ Karten klauen</h3>
      <ul>
        <li>Nach dem „Eingeloggt!“ darf das gegnerische Team vermuten, dass die Karte falsch einsortiert wurde.</li>
        <li>Es muss genau gesagt werden, an welcher Stelle die Karte stattdessen korrekt gehört.</li>
        <li>Wenn die Vermutung richtig ist: → Das gegnerische Team erhält die Karte und sortiert sie bei sich ein.</li>
        <li>Wenn die Vermutung falsch ist: → Das aktive Team darf als Belohnung sofort eine weitere Karte ziehen und das nächste Lied erraten.</li>
      </ul>

      <h3>🛡️ Karte safen</h3>
      <ul>
        <li>Nennt das aktive Team korrekt den Interpreten und den Songtitel, ist die Karte gesichert – sie kann nicht geklaut werden.</li>
        <li>Achtung: Die Karte muss trotzdem richtig einsortiert sein! Nur dann bleibt sie im Spiel.</li>
        <li>Kennt nur das gegnerische Team Interpret & Titel, darf es eine risikofreie Korrektur-Vermutung äußern:
          <ul>
            <li>Wenn korrekt: → Die Karte wird geklaut und einsortiert.</li>
            <li>Wenn falsch: → Es passiert nichts, das Spiel läuft wie geplant weiter.</li>
          </ul>
        </li>
        <li><em>💡 Tipp: Karten klauen ohne Risiko lohnt sich fast immer!</em></li>
      </ul>

      <h3>🏁 Spielende</h3>
      <ul>
        <li>Das Spiel endet, wenn ein Team 10 Karten korrekt einsortiert vor sich liegen hat.</li>
        <li>Das andere Team (falls es nicht begonnen hat) bekommt eine letzte Runde, um gleichzuziehen.</li>
        <li>Alternativ könnt ihr vor Spielbeginn eine andere Zielanzahl (z. B. 15 oder 20 Karten) vereinbaren.</li>
      </ul>
    </>
  );

  const renderRulesV2 = () => (
  <>
    <h2 style={{ marginTop: 0, color: '#1DB954' }}>🎵 SPIELANLEITUNG – Musik-Zeitreise</h2>

    <h3>📲 Vor dem Spiel</h3>
    <ol>
      <li><strong>Spotify starten:</strong> Öffne Spotify und spiele ein beliebiges Lied ab.</li>
      <li><strong>Web-App öffnen:</strong> Rufe den Link zur Web-App auf und logge dich mit deinem Spotify-Account ein.</li>
      <li><strong>Startspieler festlegen:</strong> Entscheidet gemeinsam (und bitte ohne Schlägerei), welches Team beginnt.</li>
      <li><strong>Startkarten ziehen:</strong> Jedes Team erhält eine Startkarte. Diese wird offen vor das jeweilige Team gelegt.</li>
    </ol>

    <h3>🎮 So wird gespielt</h3>
    <ol>
      <li><strong>Karte scannen:</strong> Das aktive Team scannt den QR-Code der obersten Karte vom Stapel.</li>
      <li><strong>Song anhören:</strong> Der Song wird über Spotify automatisch abgespielt.</li>
      <li><strong>Einordnen:</strong> Das Team überlegt, wo die neue Karte zeitlich (chronologisch) einsortiert werden soll – also vor, zwischen oder nach den bereits ausliegenden Karten.</li>
      <li><strong>Einloggen:</strong> Ist das Team sicher, sagt es laut: „Eingeloggt!“ – ab jetzt darf nichts mehr geändert werden.</li>
      <li><strong>Auflösung:</strong>
        <ul>
          <li><strong>Richtig eingeordnet:</strong> Die Karte bleibt beim Team.</li>
          <li><strong>Falsch eingeordnet:</strong> Die Karte kommt aus dem Spiel, und das andere Team ist an der Reihe.</li>
        </ul>
      </li>
      <li><strong>Interpret & Titel richtig genannt:</strong> Kennt das aktive Team Interpret und Songtitel korrekt, darf es sofort eine weitere Karte ziehen und erraten und bleibt somit am Zug.</li>
    </ol>

    <h3>🕵️‍♀️ Karten klauen</h3>
    <ul>
      <li>Nach dem „Eingeloggt!“ darf das gegnerische Team vermuten, dass die Karte falsch einsortiert wurde.</li>
      <li>Es muss genau gesagt werden, an welcher Stelle die Karte stattdessen korrekt gehört.</li>
      <li>Wenn die Vermutung richtig ist: → Das gegnerische Team erhält die Karte und sortiert sie bei sich ein.</li>
      <li>Wenn die Vermutung falsch ist: → Das aktive Team darf als Belohnung sofort eine weitere Karte ziehen und das nächste Lied erraten.</li>
    </ul>

    <h3>🛡️ Karte klauen mit schutz</h3>
    <ul>
      <li>Kennt nur das gegnerische Team Interpret & Titel, darf es eine risikofreie Korrektur-Vermutung äußern:
        <ul>
          <li>Wenn korrekt: → Die Karte wird geklaut und einsortiert.</li>
          <li>Wenn falsch: → Es passiert nichts, das Spiel läuft wie geplant weiter.</li>
        </ul>
      </li>
      <li><em>💡 Tipp: Karten klauen ohne Risiko lohnt sich fast immer!</em></li>
    </ul>

    <h3>🏁 Spielende</h3>
    <ul>
      <li>Das Spiel endet, wenn ein Team 10 Karten korrekt einsortiert vor sich liegen hat.</li>
      <li>Das andere Team (falls es nicht begonnen hat) bekommt eine letzte Runde, um gleichzuziehen.</li>
      <li>Alternativ könnt ihr vor Spielbeginn eine andere Zielanzahl (z. B. 15 oder 20 Karten) vereinbaren.</li>
    </ul>
  </>
);


  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        {selectedVersion === null && renderVersionSelection()}
        {selectedVersion === 1 && renderRulesV1()}
        {selectedVersion === 2 && renderRulesV2()}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          {selectedVersion !== null && (
            <button onClick={() => setSelectedVersion(null)} style={buttonStyle}>
              🔙 Zurück zur Auswahl
            </button>
          )}
          <button onClick={onClose} style={{ ...buttonStyle, marginLeft: '1rem' }}>
            ❌ Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

const backdropStyle: React.CSSProperties = {
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
};

const modalStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '1rem',
  maxWidth: '700px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  textAlign: 'left',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  fontSize: '0.95rem',
  lineHeight: '1.5'
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#1DB954',
  color: 'white',
  border: 'none',
  padding: '0.6rem 1.2rem',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: '1rem'
};

export default RulesModal;
