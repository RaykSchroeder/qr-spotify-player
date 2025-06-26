import React, { useState } from 'react';
import RulesModal from './RulesModal';

const RulesSelector: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ textAlign: 'center', margin: '2rem 0' }}>
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        📖 Spielregeln anzeigen
      </button>

      <RulesModal
        show={showModal}
        onClose={() => setShowModal(false)}
        version="1.0"
      />
    </div>
  );
};

export default RulesSelector;
