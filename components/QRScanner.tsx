import React, { useEffect, useRef, useState } from 'react';
import QrScanner, { ScanResult } from 'qr-scanner';

// Stelle sicher, dass die Worker-Datei in /public liegt (also public/qr-scanner-worker.min.js)
QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js';

type QrScannerComponentProps = {
  onScan: (result: string) => void;
};

export default function QrScannerComponent({ onScan }: QrScannerComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const qrScanner = new QrScanner(
      videoRef.current,
      (result: ScanResult) => {
        onScan(result.data); // Fix: Nutze das data-Property aus ScanResult
        qrScanner.stop(); // Scanner stoppen, sobald Ergebnis da ist
      },
      {
        onDecodeError: (err) => {
          // Optional: Fehler anzeigen oder ignorieren
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
