// components/QRScanner.tsx
import React, { useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';

QrScanner.WORKER_PATH = 'https://unpkg.com/qr-scanner@1.4.2/qr-scanner-worker.min.js';

interface QRScannerProps {
  onScan: (result: string) => void;
  style?: React.CSSProperties;
}

export default function QRScanner({ onScan, style }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const onScanRef = useRef(onScan);

  // Immer die aktuelle onScan-Funktion speichern
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (videoRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          onScanRef.current(result);
        }
      );
      scannerRef.current.start();

      return () => {
        scannerRef.current?.stop();
        scannerRef.current?.destroy();
      };
    }
  }, []);

  return <video ref={videoRef} style={{ width: '300px', margin: 'auto', display: 'block', ...style }} />;
}
