import Image from 'next/image';
import tickerToDomain from '@/lib/stocks';

interface StockLogoProps {
  ticker: string;
}

const StockLogo = ({ ticker }: StockLogoProps) => {
  const domain = tickerToDomain[ticker];

  if (!domain) {
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs">
        {ticker.substring(0, 2)}
      </div>
    );
  }

  const logoUrl = `https://logo.clearbit.com/${domain}`;

  return (
    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-300">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={`${ticker} logo`}
        className="object-cover w-full h-full"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
};

export default StockLogo;
