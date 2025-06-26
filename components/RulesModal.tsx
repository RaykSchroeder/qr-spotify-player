import React from 'react';

interface Props {
  show: boolean;
  onClose: () => void;
  version: string;
}

const RulesModal: React.FC<Props> = ({ show, onClose, version }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          position: 'relative',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
        }}
        onClick={e => e.stopPropagation()} // Klick im Modal selbst verhindert Schließen
      >
        <h2 style={{ marginBottom: '1rem' }}>📜 Spielregeln</h2>
        <p><strong>Version:</strong> {version}</p>
        <ol style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
          <li>Jede*r Spieler*in darf nur einen Song pro Runde wählen.</li>
          <li>Die Songs müssen aus der bereitgestellten Playlist stammen.</li>
          <li>Der QR-Code wird alle 10 Minuten aktualisiert.</li>
          <li>Bei technischen Problemen bitte den Veranstalter kontaktieren.</li>
          <li>Fairplay steht an erster Stelle – kein Spam, keine Trollsongs.</li>
        </ol>
        <button
          onClick={onClose}
          style={{
            marginTop: '2rem',
            padding: '0.5rem 1.5rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Schließen
        </button>
      </div>
    </div>
  );
};

export default RulesModal;
