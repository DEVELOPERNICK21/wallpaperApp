'use client';

import {QRCodeSVG} from 'qrcode.react';
import {useMemo} from 'react';

interface IPADownloadQRProps {
  ipaUrl: string;
  title?: string;
  description?: string;
}

export function IPADownloadQR({
  ipaUrl,
  title = 'Scan to Install on iOS',
  description = 'Open your iPhone camera and scan this QR code to download and install the app.',
}: IPADownloadQRProps) {
  // Convert relative URL to absolute URL for QR code scanning
  // QR codes need absolute URLs to work when scanned from a phone
  const absoluteUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      // Server-side: return as-is (will be handled on client)
      return ipaUrl;
    }
    
    // If already absolute URL, return as-is
    if (ipaUrl.startsWith('http://') || ipaUrl.startsWith('https://')) {
      return ipaUrl;
    }
    
    // Convert relative URL to absolute
    return `${window.location.origin}${ipaUrl.startsWith('/') ? ipaUrl : '/' + ipaUrl}`;
  }, [ipaUrl]);

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        )}
      </div>
      <div className="rounded-xl bg-white p-4 shadow-lg">
        <QRCodeSVG
          value={absoluteUrl}
          size={200}
          level="H"
          includeMargin={false}
        />
      </div>
      <a
        href={ipaUrl}
        className="text-sm text-sky-400 hover:text-sky-300 underline"
        target="_blank"
        rel="noopener noreferrer">
        Or click to download directly
      </a>
    </div>
  );
}

