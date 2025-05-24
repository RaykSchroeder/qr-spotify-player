import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

QrScanner.WORKER_PATH = 'https://unpkg.com/qr-scanner@1.4.2/qr-scanner-worker.min.js';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    qrScannerRef.current = new QrScanner(
      videoRef.current,
      (result) => setQrResult(result.data)
    );
    qrScannerRef.current.start();

    return () => {
      qrScannerRef.current?.destroy();
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ width: '100%', maxWidth: 400 }} />
      {qrResult && <p>Scan Ergebnis: {qrResult}</p>}
    </div>
  );
}
