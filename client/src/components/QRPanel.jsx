import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRPanel({ url, label = 'Scan to explore', title = 'Carry the archive with you' }) {
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(url, { width: 260, margin: 1, errorCorrectionLevel: 'H', color: { dark: '#27251f', light: '#f6f3ec' } })
      .then((value) => { if (active) setQrData(value); })
      .catch(() => { if (active) setQrData(''); });
    return () => { active = false; };
  }, [url]);

  return (
    <section className="qr-panel" aria-label={label}>
      <div className="qr-copy"><p className="eyebrow">Digital access</p><h2>{title}</h2><p>Scan the code to open the collection on your phone. Each object record also has its own direct QR code.</p><a className="text-link" href={url}>Open collection <span aria-hidden="true">↗</span></a></div>
      {qrData ? <img className="qr-image" src={qrData} alt={`QR code linking to ${url}`} /> : <div className="qr-placeholder" aria-hidden="true" />}
      <span className="qr-caption">{label}</span>
    </section>
  );
}
