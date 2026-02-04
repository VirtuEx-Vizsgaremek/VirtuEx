/**
 * Chart Crosshair Overlay Component
 *
 * Displays price data and market information when user hovers over chart points.
 * Shows different data formats based on chart type (OHLC for candlestick, simple price for area).
 *
 * Features:
 * - Displays asset logo and name (or "Generated" for mock data)
 * - Shows time/date of hovered data point (formatted by TradingView.tsx)
 * - Shows OHLC values for candlestick charts or simple price for area charts
 * - Displays price change with color-coded direction indicator (▲/▼)
 * - Interactive interval button to switch time periods
 * - Positioned at top-left of chart with semi-transparent backdrop
 *
 * Data Flow:
 * TradingView.tsx -> [formatChartTime + calculateChange] -> ChartOverlay props
 */

import StockLogo from './StockLogo';

/**
 * Props for ChartOverlay component
 * Receives formatted/calculated data from TradingView component
 */
interface ChartOverlayProps {
  // Chart type determines which price data to display
  type: 'ohlc' | 'simple'; // 'ohlc' for candlestick, 'simple' for area chart

  // Price and symbol data from hovered chart point
  data: {
    symbol: string; // Stock ticker symbol (e.g., "AAPL")
    assetName: string; // Company name or "generated" for mock data
    time?: string; // Formatted date string from formatChartTime() utility
    // OHLC values (only for candlestick charts)
    open?: number; // Opening price
    high?: number; // Highest price
    low?: number; // Lowest price
    close?: number; // Closing price
    // Area value (only for area charts)
    value?: number; // Single price value
  };

  // Time period and change metrics (calculated by chartCalculations.ts functions)
  interval: number; // Time period in days (e.g., 1, 7, 30)
  changeAmount: number; // Absolute price change (from calculateChange/calculateOHLCChange/calculateAreaChange)
  changePercent: number; // Percentage change (from calculation functions)
  isPositive: boolean; // True if price increased, false if decreased

  // Color scheme (from CHART_THEMES)
  upColor: string; // Color for positive change (e.g., green)
  downColor: string; // Color for negative change (e.g., red)

  // Event handler for interval button
  onIntervalClick: () => void; // Called when user clicks interval button to switch chart period
}

const ChartOverlay = ({
  type,
  data,
  changeAmount,
  changePercent,
  isPositive,
  upColor,
  downColor,
  interval,
  onIntervalClick
}: ChartOverlayProps) => {
  // Choose color based on direction of price movement
  const indicatorColor = isPositive ? upColor : downColor;

  return (
    // Fixed position overlay at top-left of chart
    // pointer-events-none prevents blocking chart interactions, except on button (pointer-events-auto)
    <div className="absolute top-2 left-2 flex gap-4 items-center text-sm font-mono bg-card/95 backdrop-blur-sm border border-border p-3 rounded-lg shadow-lg pointer-events-none z-10">
      {/* Asset Logo and Name Section */}
      {/* Shows stock company name and logo, or "Generated" for mock data */}
      {data.assetName === 'generated' ? (
        <span className="text-muted-foreground h-min">Generated</span>
      ) : (
        <>
          <StockLogo ticker={data.symbol} />
          <span className="text-muted-foreground">{data.assetName}</span>
        </>
      )}

      {/* Time/Date Display */}
      {/* Shows the date of the hovered data point (formatted by formatChartTime in TradingView) */}
      {data.time && <span className="text-muted-foreground">{data.time}</span>}

      {/* Interval Button */}
      {/* Clickable button to switch chart time period (1D, 7D, 30D, etc.) */}
      <button
        className="pointer-events-auto text-foreground hover:font-bold"
        onClick={onIntervalClick}
      >
        {interval}D
      </button>

      {/* OHLC Data Display for Candlestick Charts */}
      {/* Shows Open, High, Low, Close prices from candlestick data */}
      {type === 'ohlc' && (
        <>
          <span className="text-muted-foreground">
            O{' '}
            <span className="text-foreground font-semibold">
              {data.open?.toFixed(2)}
            </span>
          </span>
          <span className="text-muted-foreground">
            H{' '}
            <span className="text-foreground font-semibold">
              {data.high?.toFixed(2)}
            </span>
          </span>
          <span className="text-muted-foreground">
            L{' '}
            <span className="text-foreground font-semibold">
              {data.low?.toFixed(2)}
            </span>
          </span>
          <span className="text-muted-foreground">
            C{' '}
            <span className="text-foreground font-semibold">
              {data.close?.toFixed(2)}
            </span>
          </span>
        </>
      )}

      {/* Simple Price Display for Area Charts */}
      {/* Shows single price value for area chart data */}
      {type === 'simple' && (
        <span className="text-foreground font-bold">
          {data.value?.toFixed(2)}
        </span>
      )}

      {/* Price Change Indicator */}
      {/* Colored indicator showing price movement with direction arrow and percentage */}
      {/* Color comes from theme: green (up) or red (down) */}
      <span style={{ color: indicatorColor }} className="font-semibold">
        {isPositive ? '▲' : '▼'} {Math.abs(changeAmount).toFixed(2)} (
        {isPositive ? '+' : ''}
        {changePercent.toFixed(2)}%)
      </span>
    </div>
  );
};

export default ChartOverlay;
