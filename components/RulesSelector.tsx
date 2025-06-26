import React, { useState } from 'react';
import RulesModal from './components/RulesModal';

const RulesSelector = () => {
  const [showModal, setShowModal] = useState(false);
  const [version, setVersion] = useState<1 | 2>(1);

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Wähle deine Spielregel-Version</h1>
      <label style={{ cursor: 'pointer', userSelect: 'none' }}>
        <input
          type="radio"
          value="1"
          checked={version === 1}
          onChange={() => setVersion(1)}
          style={{ marginRight: 8 }}
        />
        Version 1 (Standard)
      </label>
      <br />
      <label style={{ cursor: 'pointer', userSelect: 'none' }}>
        <input
          type="radio"
          value="2"
          checked={version === 2}
          onChange={() => setVersion(2)}
          style={{ marginRight: 8 }}
        />
        Version 2 (Weitere Karte bei korrektem Interpret & Titel)
      </label>
      <br /><br />
      <button onClick={() => setShowModal(true)} style={{
        backgroundColor: '#1DB954',
        color: 'white',
        border: 'none',
        padding: '0.8rem 1.5rem',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: '1rem'
      }}>
        Spielregeln anzeigen
      </button>

      <RulesModal
        show={showModal}
        onClose={() => setShowModal(false)}
        version={version}
      />
    </div>
  );
};

export default RulesSelector;
