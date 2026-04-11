/**
 * Market API Service
 *
 * Frontend service layer for fetching currency/stock market data from the backend API.
 * This service abstracts the API communication and provides type-safe data fetching.
 *
 * Features:
 * - Type-safe API calls with TypeScript interfaces
 * - Environment-based API URL configuration
 * - Comprehensive error handling
 * - Reusable across multiple components
 *
 * Configuration:
 * - Set NEXT_PUBLIC_API_URL in .env.local (e.g., http://localhost:3001)
 * - Falls back to http://localhost:3001 if not set
 *
 * Endpoints used:
 * - GET /v1/currency/:id         — fetch currency metadata
 * - GET /v1/currency/:id/history — fetch OHLC history (query: start, end)
 */

// ---------------------------------------------------------------------------
// Types mirroring backend entities
// ---------------------------------------------------------------------------

/**
 * Currency metadata returned by GET /v1/currency/:id
 */
export interface Currency {
  id: string;
  symbol: string;
  name: string;
  precision: number;
  updateFreqency: string;
  type: 'fiat' | 'crypto' | 'stock' | 'etf';
  createdAt: string;
  updatedAt: string;
}

/**
 * Raw history entry returned by GET /v1/currency/:id/history
 * OHLC values are bigints stored as strings over JSON.
 */
export interface CurrencyHistoryEntry {
  timestamp: string; // ISO date string
  open: string; // bigint serialised as string
  high: string;
  low: string;
  close: string;
}

// ---------------------------------------------------------------------------
// Types consumed by charting components (unchanged public contract)
// ---------------------------------------------------------------------------

/**
 * Candlestick data structure for OHLC charts
 */
export interface CandlestickData {
  time: string; // Date string (YYYY-MM-DD)
  open: number; // Opening price
  high: number; // Highest price
  low: number; // Lowest price
  close: number; // Closing price
}

/**
 * Area chart data structure (simplified format)
 */
export interface AreaData {
  time: string; // Date string (YYYY-MM-DD)
  value: number; // Price value (close price)
}

/**
 * Complete response structure returned by fetchMarketData — kept identical to
 * the previous /v1/market contract so that all existing callers continue to
 * work without modification.
 */
export interface MarketDataResponse {
  candlestick: CandlestickData[]; // Full OHLC data array
  area: AreaData[]; // Simplified close-price array
  symbol: string; // Currency symbol (e.g. "AAPL")
  dataPoints: number; // Number of data points returned
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a bigint-as-string value coming from the API into a plain JS number.
 * The backend stores prices as scaled integers (precision digits after the
 * implied decimal point).  We divide by 10^precision so callers receive a
 * human-readable float.
 */
function toFloat(raw: string, precision: number): number {
  const int = BigInt(raw);
  const divisor = BigInt(10 ** precision);
  // Keep fractional part by doing integer division and then reattaching it
  const whole = int / divisor;
  const remainder = int % divisor;
  return Number(whole) + Number(remainder) / 10 ** precision;
}

/**
 * Format a Date object as YYYY-MM-DD for lightweight-charts compatibility.
 */
function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch a single currency's metadata from GET /v1/currency/:id.
 *
 * @param idOrSymbol - Symbol (e.g. "AAPL") or numeric snowflake ID string
 * @returns Promise resolving to the Currency object
 */
export async function fetchCurrency(idOrSymbol: string): Promise<Currency> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const response = await fetch(
    `${apiUrl}/v1/currency/${encodeURIComponent(idOrSymbol)}`
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<Currency>;
}

/**
 * Fetch all currencies from GET /v1/currency.
 *
 * @returns Promise resolving to a Currency array
 */
export async function fetchAllCurrencies(): Promise<Currency[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const response = await fetch(`${apiUrl}/v1/currency`);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<Currency[]>;
}

/**
 * Fetch raw OHLC history for a currency from GET /v1/currency/:id/history.
 *
 * @param idOrSymbol - Symbol (e.g. "AAPL") or numeric snowflake ID string
 * @param start      - Start of date range (inclusive)
 * @param end        - End of date range (exclusive)
 * @param interval   - Candle size: '1d' (default), '1w', '1m', '1y'
 * @returns Promise resolving to a CurrencyHistoryEntry array
 */
export async function fetchCurrencyHistory(
  idOrSymbol: string,
  start: Date,
  end: Date,
  interval: string = '1d'
): Promise<CurrencyHistoryEntry[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const params = new URLSearchParams({
    start: start.toISOString(),
    end: end.toISOString(),
    interval
  });

  const response = await fetch(
    `${apiUrl}/v1/currency/${encodeURIComponent(idOrSymbol)}/history?${params}`
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<CurrencyHistoryEntry[]>;
}

// ---------------------------------------------------------------------------
// Chart-ready data fetcher (used by TradingView for all interval/pan loading)
// ---------------------------------------------------------------------------

export type ChartInterval = '1D' | '1W' | '1M' | '1Y';

/** Maps a UI interval label to the backend's interval parameter string. */
const INTERVAL_PARAM: Record<ChartInterval, string> = {
  '1D': '1d',
  '1W': '1w',
  '1M': '1m',
  '1Y': '1y'
};

/**
 * How many days of raw daily data to request per fetch window.
 * Larger intervals need wider windows to produce enough candles.
 */
export const INTERVAL_WINDOW_DAYS: Record<ChartInterval, number> = {
  '1D': 365, // ~365 daily candles
  '1W': 365 * 3, // ~156 weekly candles
  '1M': 365 * 10, // ~120 monthly candles
  '1Y': 365 * 60 // covers all available stock history
};

/**
 * Fetch and transform chart data for a date window and interval.
 * Returns both candlestick and area arrays ready for lightweight-charts.
 *
 * @param symbol   - Ticker symbol (e.g. "AAPL")
 * @param start    - Window start (inclusive)
 * @param end      - Window end (exclusive)
 * @param interval - Candle size
 * @param precision - Decimal precision from the Currency metadata (pass 0 to
 *                    auto-fetch; supplying it avoids an extra round-trip)
 */
export async function fetchChartData(
  symbol: string,
  start: Date,
  end: Date,
  interval: ChartInterval,
  precision?: number
): Promise<{
  candlestick: CandlestickData[];
  area: AreaData[];
  precision: number;
}> {
  // Only fetch currency metadata when precision wasn't supplied by the caller.
  let resolvedPrecision = precision;
  if (resolvedPrecision === undefined) {
    const currency = await fetchCurrency(symbol);
    resolvedPrecision = currency.precision;
  }

  const history = await fetchCurrencyHistory(
    symbol,
    start,
    end,
    INTERVAL_PARAM[interval]
  );

  const candlestick: CandlestickData[] = history.map((entry) => ({
    time: toDateString(new Date(entry.timestamp)),
    open: toFloat(entry.open, resolvedPrecision!),
    high: toFloat(entry.high, resolvedPrecision!),
    low: toFloat(entry.low, resolvedPrecision!),
    close: toFloat(entry.close, resolvedPrecision!)
  }));

  const area: AreaData[] = history.map((entry) => ({
    time: toDateString(new Date(entry.timestamp)),
    value: toFloat(entry.close, resolvedPrecision!)
  }));

  return { candlestick, area, precision: resolvedPrecision! };
}

/**
 * Fetch stock/currency market data and transform it into the chart-ready
 * MarketDataResponse format consumed by TradingView and other components.
 *
 * Replaces the previous /v1/market endpoint by composing two calls:
 *   1. GET /v1/currency/:symbol  — to retrieve precision metadata
 *   2. GET /v1/currency/:symbol/history?start=…&end=…  — to retrieve OHLC rows
 *
 * @param symbol - Currency/stock ticker symbol (e.g. "AAPL", "BTC", "ETH")
 * @param days   - Number of historical days to fetch (default: 365)
 *
 * @returns Promise resolving to MarketDataResponse with both candlestick and
 *          area data arrays, maintaining full backwards compatibility with all
 *          existing callers.
 *
 * @throws Error with a descriptive message if:
 *         - Either network request fails
 *         - The backend returns an error status (400, 404, 500)
 *         - The symbol does not exist
 *         - Response parsing fails
 *
 * @example
 * ```typescript
 * try {
 *   const data = await fetchMarketData('AAPL', 30);
 *   console.log(data.candlestick); // 30 days of OHLC data
 * } catch (error) {
 *   console.error('Failed to load data:', error.message);
 * }
 * ```
 */
export async function fetchMarketData(
  symbol: string,
  days: number = 365
): Promise<MarketDataResponse> {
  try {
    // Step 1: Resolve currency metadata (we need `precision` to decode bigints)
    const currency = await fetchCurrency(symbol);

    // Step 2: Build the date range
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    // Step 3: Fetch raw OHLC history
    const history = await fetchCurrencyHistory(symbol, start, end);

    // Step 4: Transform raw history rows into chart-ready structures
    const candlestick: CandlestickData[] = history.map((entry) => ({
      time: toDateString(new Date(entry.timestamp)),
      open: toFloat(entry.open, currency.precision),
      high: toFloat(entry.high, currency.precision),
      low: toFloat(entry.low, currency.precision),
      close: toFloat(entry.close, currency.precision)
    }));

    const area: AreaData[] = history.map((entry) => ({
      time: toDateString(new Date(entry.timestamp)),
      value: toFloat(entry.close, currency.precision)
    }));

    return {
      candlestick,
      area,
      symbol: currency.symbol,
      dataPoints: history.length
    };
  } catch (error) {
    // Log for debugging (visible in browser console / server logs)
    console.error('Error fetching market data:', error);

    // Re-throw so callers can surface user-friendly messages
    throw error;
  }
}
