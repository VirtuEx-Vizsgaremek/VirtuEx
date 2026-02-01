import Image from 'next/image';
import tickerToDomain from '@/lib/stocks';
import { useState } from 'react';

interface StockLogoProps {
  ticker: string;
}

const StockLogo = ({ ticker }: StockLogoProps) => {
  const domain = tickerToDomain[ticker];
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Show fallback if no domain OR (tried to load but failed/blocked)
  const showFallback = !domain || imageError || (!imageLoaded && imageError);

  if (showFallback) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm">
        {ticker.substring(0, 2)}
      </div>
    );
  }

  const logoUrl = `https://img.logo.dev/${domain}?token=pk_ACIo6LHNR2WfPA7mZXBqZA`;

  return (
    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-white">
      {/* Fallback shown while loading or if error */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
          <span className="text-white text-xs font-bold">
            {ticker.substring(0, 2)}
          </span>
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={`${ticker} logo`}
        className="object-cover w-full h-full relative z-10"
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(false);
        }}
      />
    </div>
  );
};

export default StockLogo;
