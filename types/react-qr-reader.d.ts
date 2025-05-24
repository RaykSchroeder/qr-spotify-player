// types/react-qr-reader.d.ts
declare module 'react-qr-reader' {
  import * as React from 'react';

  export interface QrReaderProps {
    delay?: number | false;
    style?: React.CSSProperties;
    onError?: (error: any) => void;
    onScan?: (data: string | null) => void;
    facingMode?: 'user' | 'environment';
  }

  const QrReader: React.FC<QrReaderProps>;

  export default QrReader;
}
