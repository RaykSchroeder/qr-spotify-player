// components/QRScanner.tsx
import React, { useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';

QrScanner.WORKER_PATH = 'https://unpkg.com/qr-scanner@1.4.2/qr-scanner-worker.min.js';

interface QRScannerProps {
  onScan: (result: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          onScan(result);
        }
      );
      scannerRef.current.start();

      return () => {
        scannerRef.current?.stop();
        scannerRef.current?.destroy();
      };
    }
  }, [onScan]);

  return <video ref={videoRef} style={{ width: '300px', margin: 'auto', display: 'block' }} />;
}
