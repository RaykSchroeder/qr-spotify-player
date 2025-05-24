import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js'; // Arbeiter-Script laden (muss in public/ liegen)

export default function QrScannerComponent({ onScan }: { onScan: (result: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const qrScanner = new QrScanner(
      videoRef.current,
      (result) => {
        onScan(result);
        qrScanner.stop(); // Scanner stoppen, sobald Ergebnis da ist
      },
      {
        onDecodeError: (err) => {
          // Fehler ignorieren oder anzeigen
          // console.log('Decode error:', err);
        },
        highlightScanRegion: true,
        maxScansPerSecond: 5,
      }
    );

    qrScanner.start().catch((e) => setError('Kamera Zugriff verweigert oder nicht verfügbar'));

    setScanner(qrScanner);

    return () => {
      qrScanner.destroy();
    };
  }, [onScan]);

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <video ref={videoRef} style={{ width: '100%', maxWidth: '400px' }} />
    </div>
  );
}
