/**
 * Stock Selection Sidebar Component
 *
 * Displays a scrollable list of stock symbols that users can select from.
 * When a stock is clicked, it notifies the parent component to update the chart.
 *
 * Features:
 * - Search field to filter by symbol or company name
 * - Category filters: All, Stocks, ETFs, Crypto
 * - Scrollable list of all available stocks from stocks.ts
 * - Visual indication of currently selected stock
 * - Smooth hover and selection animations
 * - Fixed header with scrollable content
 *
 * Props:
 * - selectedSymbol: Currently selected stock symbol (e.g., "AAPL")
 * - onSelectSymbol: Callback function to notify parent when user selects a stock
 */

'use client';

import { useState, useMemo } from 'react';
import tickerToDomain, { tickerToName, tickerToType } from '@/lib/stocks';
import { X, Search } from 'lucide-react';
import StockLogo from './StockLogo';
import { Card } from './ui/card';
import { Input } from './ui/input';

type FilterType = 'all' | 'stock' | 'etf' | 'crypto';

const FILTER_LABELS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'stock', label: 'Stocks' },
  { value: 'etf', label: 'ETFs' },
  { value: 'crypto', label: 'Crypto' }
];

/**
 * Props interface for the Sidenav component
 */
interface SidenavProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  showAssetNav: boolean;
  onClose: () => void;
}

export default function SideNav({
  selectedSymbol,
  onSelectSymbol,
  showAssetNav,
  onClose
}: SidenavProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const allStocks = useMemo(
    () =>
      Object.keys(tickerToDomain).map((symbol) => ({
        symbol,
        name: tickerToName[symbol] || symbol,
        type: tickerToType[symbol] ?? 'stock'
      })),
    []
  );

  const filteredStocks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allStocks.filter((stock) => {
      const matchesFilter =
        activeFilter === 'all' || stock.type === activeFilter;
      const matchesSearch =
        query === '' ||
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [allStocks, searchQuery, activeFilter]);

  return (
    <div
      className={`
        absolute bottom-0 bg-background transition-transform duration-300 z-30
        left-0 top-0 w-full
        md:left-14 md:top-14 md:w-96
        ${showAssetNav ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="relative h-full">
        <div className="absolute top-4 right-4 z-100 flex gap-2">
          <button
            onClick={onClose}
            className="p-2 bg-card hover:bg-muted rounded-full border border-border transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        <Card className="w-full h-full flex flex-col rounded-none! rounded-r-2xl!">
          {/* Header */}
          <div className="p-4 border-b space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase">
              Select Asset
            </h2>

            {/* Search */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="pl-8 h-8 text-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-1">
              {FILTER_LABELS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  className={`flex-1 text-xs py-1 rounded-md font-medium transition-colors ${
                    activeFilter === value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Asset list */}
          <div
            className="flex-1 overflow-y-auto p-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--primary) var(--muted)'
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 8px;
              }
              div::-webkit-scrollbar-track {
                background: var(--muted);
                border-radius: 10px;
              }
              div::-webkit-scrollbar-thumb {
                background: var(--primary);
                border-radius: 10px;
                transition: background 0.2s;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: var(--primary);
                opacity: 0.8;
              }
            `}</style>

            {filteredStocks.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No assets found.
              </p>
            ) : (
              <ul className="space-y-1">
                {filteredStocks.map((stock) => {
                  const isSelected = selectedSymbol === stock.symbol;

                  return (
                    <li key={stock.symbol}>
                      <button
                        onClick={() => onSelectSymbol(stock.symbol)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <StockLogo ticker={stock.symbol} />

                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {stock.name}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
