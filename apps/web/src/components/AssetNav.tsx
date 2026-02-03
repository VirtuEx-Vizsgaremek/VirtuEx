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
import StockLogo from './StockLogo';
import { Card } from './ui/card';

/**
 * Props interface for the Sidenav component
 * Defines the data contract between parent and child component
 */
interface SidenavProps {
  selectedSymbol: string; // Current stock symbol being displayed in chart
  onSelectSymbol: (symbol: string) => void; // Function to call when user clicks a stock
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
  onSelectSymbol
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
    <Card className="w-full h-full flex flex-col">
      {/* Fixed Header Section */}
      {/*
        - p-4: Padding 16px all around
        - border-b: Bottom border for visual separation
        - This section stays at top while list below scrolls
      */}
      <div className="p-4 border-b">
        <h2 className="text-xs font-bold text-muted-foreground uppercase">
          Select Asset
        </h2>
      </div>

      {/* Scrollable Stock List Container */}
      {/*
        - flex-1: Takes all remaining vertical space in parent
        - overflow-y-auto: Enables vertical scrolling when content overflows
        - p-2: Small padding (8px) around the list
        - Combined with parent's flex-col, this creates scrollable area
      */}
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
          {/* Map over stocks array to render each stock as a button */}
          {stocks.map((stock) => {
            // Check if this stock is currently selected (for styling)
            const isSelected = selectedSymbol === stock.symbol;

            return (
              <li key={stock.symbol}>
                {/*
                  Stock Selection Button
                  
                  onClick={() => onSelectSymbol(stock.symbol)}:
                  - Arrow function delays execution until user clicks
                  - Without arrow function, onSelectSymbol would execute immediately on render
                  - Arrow function creates: function() { onSelectSymbol('AAPL') }
                  - When clicked, calls parent's callback with this stock's symbol
                  
                  className breakdown:
                  - w-full: Full width of parent container
                  - text-left: Align text to left (buttons default to center)
                  - px-3 py-2: Padding 12px horizontal, 8px vertical
                  - rounded-lg: Rounded corners (8px radius)
                  - transition-all: Smooth animation on all property changes (150ms)
                  - flex items-center gap-3: Flexbox with items vertically centered, 12px gap
                  - Conditional classes based on isSelected:
                    * If selected: Blue background, blue text, bold font
                    * If not: Gray text, gray background on hover
                */}
                <button
                  onClick={() => onSelectSymbol(stock.symbol)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {/* Trending Up Icon - Changes color based on selection state */}
                  <StockLogo ticker={stock.symbol} />

                  {/* Stock Information Container */}
                  {/*
                    - flex-1: Takes up remaining horizontal space
                    - min-w-0: Allows text truncation (without this, text won't ellipsis)
                  */}
                  <div className="flex-1 min-w-0">
                    {/* Stock Symbol (e.g., "AAPL") */}
                    <div className="font-medium">{stock.symbol}</div>

                    {/* Full Company/Asset Name */}
                    {/*
                      - text-xs: Extra small text (12px)
                      - text-muted-foreground: Theme-aware muted text color
                      - truncate: Cuts off long text with ellipsis (...)
                    */}
                    <div className="text-xs text-muted-foreground truncate">
                      {stock.name}
                    </div>
                  </div>

                  {/* Selection Indicator Dot - Only shows when selected */}
                  {/*
                    Conditional rendering: {condition && <element>}
                    - Only renders if isSelected is true
                    - Creates primary-colored circular dot as visual indicator
                  */}
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
  );
}
