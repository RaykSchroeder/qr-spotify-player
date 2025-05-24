import React, { useEffect, useRef, useState } from "react";

type QRScannerProps = {
  onScan: (data: string) => void;
};

export default function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const barcodeDetectorRef = useRef<BarcodeDetector | null>(null);

  useEffect(() => {
    async function startScanner() {
      if (!("BarcodeDetector" in window)) {
        setError("BarcodeDetector API wird von diesem Browser nicht unterstützt.");
        return;
      }

      try {
        barcodeDetectorRef.current = new BarcodeDetector({ formats: ["qr_code"] });
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setScanning(true);
          scanFrame();
        }
      } catch (err) {
        setError("Kamera konnte nicht geöffnet werden: " + (err as Error).message);
      }
    }

    async function scanFrame() {
      if (!videoRef.current || !barcodeDetectorRef.current || !scanning) return;

      try {
        const barcodes = await barcodeDetectorRef.current.detect(videoRef.current);
        if (barcodes.length > 0) {
          onScan(barcodes[0].rawValue);
          setScanning(false);
          // Kamera stoppen nach Scan
          if (videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
          }
        } else {
          requestAnimationFrame(scanFrame);
        }
      } catch (err) {
        setError("Fehler beim Scannen: " + (err as Error).message);
      }
    }

    startScanner();

    return () => {
      setScanning(false);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [onScan, scanning]);

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <video ref={videoRef} style={{ width: "100%", maxHeight: "400px" }} muted playsInline />
      {!error && !scanning && <p>Scannen abgeschlossen oder pausiert.</p>}
    </div>
  );
}
