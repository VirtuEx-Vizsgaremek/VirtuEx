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

import { Card } from './ui/card';
import tickerToDomain from '@/lib/stocks';
import { TrendingUp } from 'lucide-react';

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
  /**
   * Convert stock ticker object to array format for easier rendering
   *
   * Process:
   * 1. Object.keys() extracts all stock symbols ['AAPL', 'TSLA', ...]
   * 2. .map() transforms each symbol into an object with symbol and name
   * 3. Creates array: [{ symbol: 'AAPL', name: 'apple.com' }, ...]
   *
   * Why? Arrays are easier to iterate over in JSX than objects
   */
  const stocks = Object.keys(tickerToDomain).map((symbol) => ({
    symbol, // Stock ticker symbol (e.g., "AAPL")
    name: tickerToDomain[symbol] // Company domain/name (e.g., "apple.com")
  }));

  return (
    <Card className="w-64 m-7 h-[calc(100vh-7rem)] flex flex-col">
      {/* Fixed Header Section */}
      {/*
        - p-4: Padding 16px all around
        - border-b: Bottom border for visual separation
        - This section stays at top while list below scrolls
      */}
      <div className="p-4 border-b">
        <h2 className="text-xs font-bold text-gray-400 uppercase">
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
      <div className="flex-1 overflow-y-auto p-2">
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
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-3 ${isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  {/* Trending Up Icon - Changes color based on selection state */}
                  <TrendingUp
                    size={16}
                    className={isSelected ? 'text-blue-500' : 'text-gray-400'}
                  />

                  {/* Stock Information Container */}
                  {/*
                    - flex-1: Takes up remaining horizontal space
                    - min-w-0: Allows text truncation (without this, text won't ellipsis)
                  */}
                  <div className="flex-1 min-w-0">
                    {/* Stock Symbol (e.g., "AAPL") */}
                    <div className="font-medium">{stock.symbol}</div>

                    {/* Company Name/Domain */}
                    {/*
                      - text-xs: Extra small text (12px)
                      - text-gray-500: Medium gray color
                      - truncate: Cuts off long text with ellipsis (...)
                    */}
                    <div className="text-xs text-gray-500 truncate">
                      {stock.name}
                    </div>
                  </div>

                  {/* Selection Indicator Dot - Only shows when selected */}
                  {/*
                    Conditional rendering: {condition && <element>}
                    - Only renders if isSelected is true
                    - Creates blue circular dot as visual indicator
                  */}
                  {isSelected && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
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
