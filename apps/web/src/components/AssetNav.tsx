/**
 * Stock Selection Sidebar Component
 *
 * Displays a scrollable list of stock symbols that users can select from.
 * When a stock is clicked, it notifies the parent component to update the chart.
 *
 * Features:
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

import { useTheme } from '@/contexts/ThemeContext';
import tickerToDomain, { tickerToName } from '@/lib/stocks';
import { Pin, X } from 'lucide-react';
import StockLogo from './StockLogo';
import { Card } from './ui/card';

/**
 * Props interface for the Sidenav component
 * Defines the data contract between parent and child component
 */
interface SidenavProps {
  selectedSymbol: string; // Current stock symbol being displayed in chart
  onSelectSymbol: (symbol: string) => void; // Function to call when user clicks a stock
  showAssetNav: boolean;
  onClose: () => void;
}

/**
 * Sidenav Component
 * Renders a sidebar with selectable stock list
 *
 * @param selectedSymbol - Currently active stock symbol (passed from parent)
 * @param onSelectSymbol - Callback to update parent's state when stock is clicked
 */
export default function SideNav({
  selectedSymbol,
  onSelectSymbol,
  showAssetNav,
  onClose
}: SidenavProps) {
  const { theme } = useTheme();

  /**
   * Convert stock ticker object to array format for easier rendering
   *
   * Process:
   * 1. Object.keys() extracts all stock symbols ['AAPL', 'TSLA', ...]
   * 2. .map() transforms each symbol into an object with symbol and full name
   * 3. Creates array: [{ symbol: 'AAPL', name: 'Apple Inc.' }, ...]
   *
   * Why? Arrays are easier to iterate over in JSX than objects
   */
  const stocks = Object.keys(tickerToDomain).map((symbol) => ({
    symbol, // Stock ticker symbol (e.g., "AAPL")
    name: tickerToName[symbol] || symbol // Full company name (e.g., "Apple Inc."), fallback to symbol
  }));

  return (
    <div
      className={`absolute left-[56px] top-[56px] bottom-0 w-96 bg-background transition-transform duration-300 z-30 ${
        showAssetNav ? 'translate-x-0' : '-translate-x-full'
      }`}
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

        <Card className="w-full h-full flex flex-col !rounded-none !rounded-r-2xl">
          <div className="p-4 border-b">
            <h2 className="text-xs font-bold text-muted-foreground uppercase">
              Select Asset
            </h2>
          </div>

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
            <ul className="space-y-1">
              {stocks.map((stock) => {
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
          </div>
        </Card>
      </div>
    </div>
  );
}
