import React, { useState } from 'react';
import RulesModalV1 from './RulesModalV1';
// import RulesModalV2 from './RulesModalV2'; // später hinzufügen

const RulesSelector: React.FC = () => {
  const [version, setVersion] = useState<'v1' /* | 'v2' */>('v1');
  const [show, setShow] = useState(false);

  return (
    <div style={{ marginTop: '2rem' }}>
      <label style={{ marginRight: '1rem' }}>Version wählen:</label>
      <select value={version} onChange={(e) => setVersion(e.target.value as 'v1' /* | 'v2' */)}>
        <option value="v1">Spielregeln Version 1</option>
        {/* <option value="v2">Spielregeln Version 2</option> */}
      </select>

      <button onClick={() => setShow(true)} style={{ marginLeft: '1rem' }}>
        Anzeigen
      </button>

      {version === 'v1' && <RulesModalV1 show={show} onClose={() => setShow(false)} />}
      {/* {version === 'v2' && <RulesModalV2 show={show} onClose={() => setShow(false)} />} */}
    </div>
  );
};

export default RulesSelector;
