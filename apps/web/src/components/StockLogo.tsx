/**
 * Stock Company Logo Component
 *
 * Displays company logo for a given stock ticker symbol.
 * Fetches logos from logo.dev API using the company domain from stocks.ts mapping.
 *
 * Features:
 * - Fetches real company logos via external API (logo.dev)
 * - Shows gradient-colored fallback with ticker initials while loading
 * - Gracefully handles loading failures with fallback UI
 * - Rounded circular design matching market data UI style
 *
 * Data Flow:
 * ticker (prop) -> tickerToDomain lookup -> logo.dev API -> Image display/Fallback
 *
 * Fallback Behavior:
 * - While loading: Shows gradient background with ticker initials
 * - If load fails: Shows gradient background with ticker initials (permanent)
 * - If no domain found: Shows gradient background with ticker initials
 */

import tickerToDomain from '@/lib/stocks';
import Image from 'next/image';
import { useState } from 'react';

/**
 * Props for StockLogo component
 */
interface StockLogoProps {
  ticker: string; // Stock symbol (e.g., "AAPL", "TSLA")
}

/**
 * Display company logo for a stock
 *
 * @param ticker - Stock ticker symbol to fetch logo for
 *
 * Usage:
 * <StockLogo ticker="AAPL" />
 * // Shows Apple logo or fallback with "AP" initials
 */
const StockLogo = ({ ticker }: StockLogoProps) => {
  // Look up company domain from ticker (e.g., "AAPL" -> "apple.com")
  const domain = tickerToDomain[ticker];

  // Track image loading state for conditional rendering
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Show fallback if no domain OR (tried to load but failed/blocked)
  const showFallback = !domain || imageError || (!imageLoaded && imageError);

  // Fallback UI: Gradient circle with ticker initials
  if (showFallback) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm">
        {ticker.substring(0, 2)}
      </div>
    );
  }

  // Construct logo URL from domain
  // logo.dev: Service that provides company logos from domains
  const logoUrl = `https://img.logo.dev/${domain}?token=pk_ACIo6LHNR2WfPA7mZXBqZA`;

  return (
    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-white">
      {/* Loading Placeholder */}
      {/* Shows gradient with initials while image is loading */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
          <span className="text-white text-xs font-bold">
            {ticker.substring(0, 2)}
          </span>
        </div>
      )}

      {/* Actual Logo Image */}
      {/* Fetched from logo.dev API using company domain */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <Image
        src={logoUrl}
        alt={`${ticker} logo`}
        width={32}
        height={32}
        className="object-cover rounded-full"
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
