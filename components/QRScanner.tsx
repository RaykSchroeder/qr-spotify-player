// components/QRScanner.tsx
import { useState } from 'react';
import dynamic from 'next/dynamic';

const QrReader = dynamic(() => import('react-qr-reader'), { ssr: false });

export default function QRScanner({ onScan }: { onScan: (data: string) => void }) {
  const [error, setError] = useState('');

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>QR-Code scannen</h2>
      <QrReader
        delay={300}
        onError={(err) => setError('Fehler: ' + err.message)}
        onScan={(data) => {
          if (data) onScan(data);
        }}
        style={{ width: '100%' }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
