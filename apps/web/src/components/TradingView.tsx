/**
 * TradingView Chart Component
 *
 * Advanced financial chart component that displays stock market data using
 * TradingView's Lightweight Charts library. Supports both area and candlestick
 * chart types with real-time and mock data sources.
 *
 * Features:
 * - Dual chart types: Area chart and Candlestick (OHLC) chart
 * - Data sources: Generated mock data or real-time data from backend API
 * - Interactive crosshair with price overlays
 * - Dark/light theme support with smooth transitions
 * - Responsive design with automatic resizing
 * - Error handling and loading states
 *
 * Dependencies:
 * - lightweight-charts: TradingView's charting library
 * - marketApi: Backend API service for fetching real stock data
 * - dataGenerator: Generates realistic mock data for testing
 * - chartCalculations: Calculates price changes and percentages
 */

'use client';
import { useTheme } from '@/contexts/ThemeContext';
import {
  calculateAreaChange,
  calculateOHLCChange
} from '@/lib/chartCalculations';
import { CHART_THEMES } from '@/lib/chartThemes';
import {
  generateCandlestickData,
  generateTradingViewChartData
} from '@/lib/dataGenerator';
import { fetchMarketData } from '@/lib/marketApi';
import { BuyResult, fetchCurrencyId, SellResult } from '@/lib/tradeApi';
import { tickerToName } from '@/lib/stocks';
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  TrackingModeExitMode,
  createChart
} from 'lightweight-charts';
import { useCallback, useEffect, useRef, useState } from 'react';
import ChartOverlay from './ChartOverlay';
import TradeModal from './TradeModal';

// Chart type: area (line chart) or candlestick (OHLC bars)
type chartType = 'area' | 'candle';

// Data source: generated (mock) or realtime (from API)
type dataSource = 'generated' | 'realtime';

/**
 * OHLC data structure for candlestick overlay display
 * Null when no data is hovered or chart is in area mode
 */
type OHLCData = {
  open: number; // Opening price
  high: number; // Highest price
  low: number; // Lowest price
  close: number; // Closing price
  time: string | number | { year: number; month: number; day: number }; // Date string
} | null;

/**
 * Area data structure for area chart overlay display
 * Null when no data is hovered or chart is in candlestick mode
 */
type AreaData = {
  value: number; // Price value
  time: string | number | { year: number; month: number; day: number }; // Date string
} | null;

/**
 * Props interface for TradingView component
 * Symbol is now controlled by parent (MarketPage) instead of internal state
 */
interface TradingViewProps {
  symbol: string; // Stock symbol passed from parent (e.g., "AAPL")
  onClearSelection?: () => void; // Optional callback to clear selection when switching to generated data
}

/**
 * Returns the number of days to display on the time axis based on the container
 * width in pixels.  Wider viewports (ultrawide) show a full year; narrower ones
 * (tablet / phone) show progressively shorter windows so the chart always looks
 * dense and readable without wasted space.
 *
 * Breakpoints (approximate):
 *   ≥ 1800 px  → 365 days  (ultrawide / 21:9)
 *   ≥ 1200 px  → 180 days  (16:9 desktop)
 *   ≥  768 px  → 90 days   (tablet)
 *           <  → 30 days   (phone)
 */
function getVisibleDaysForWidth(widthPx: number): number {
  if (widthPx >= 1800) return 365;
  if (widthPx >= 1200) return 180;
  if (widthPx >= 768) return 90;
  return 30;
}

/**
 * Given the last data point's date string ("YYYY-MM-DD") and a number of days,
 * returns a lightweight-charts TimeRange ({ from, to }) expressed as UTC
 * timestamp seconds so the chart shows exactly that window ending at `toDate`.
 */
function buildVisibleRange(
  toDateStr: string,
  days: number
): { from: number; to: number } | null {
  // Parse as UTC explicitly (appending T00:00:00Z) to avoid timezone shifting.
  const toMs = Date.parse(toDateStr + 'T00:00:00Z');
  if (isNaN(toMs)) return null;
  const to = Math.floor(toMs / 1000);
  const from = to - days * 24 * 60 * 60;
  return { from, to };
}

const formatChartTime = (
  time: string | number | { year: number; month: number; day: number } | null
) => {
  if (!time) return '';
  if (typeof time === 'string') return time;
  if (typeof time === 'number') {
    return new Date(time * 1000).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }
  return `${time.year}-${String(time.month).padStart(2, '0')}-${String(time.day).padStart(2, '0')}`;
};

export default function TradingView({
  symbol,
  onClearSelection
}: TradingViewProps) {
  // ========== Context & Theme ==========
  const { theme, colorTheme } = useTheme(); // Get current theme (dark/light) and color theme from context

  // TODO: Replace this with useAuth() from AuthContext once the login branch is merged.
  // Client-side hydration: declare mounting flag and hydrate client-only values after mount
  // to avoid SSR <-> CSR mismatches during React hydration.
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Mark mounted and hydrate localStorage-backed values only on the client.
    setIsClient(true);
    try {
      const t = localStorage.getItem('token');
      setToken(t);
    } catch {
      setToken(null);
    }
  }, []);

  const isLoggedIn = isClient && !!token;

  // Get active color scheme based on theme and selected color theme
  const colors =
    theme === 'dark'
      ? CHART_THEMES[colorTheme].dark
      : CHART_THEMES[colorTheme].light;

  // ========== Refs for Chart Management ==========
  const chartContainerRef = useRef<HTMLDivElement>(null); // Container DOM element
  const chartRef = useRef<any>(null); // Chart instance
  const seriesRef = useRef<any>(null); // Current series (area or candlestick)
  // Always holds the latest rendered dataset so resize / range helpers can
  // access it without going stale inside closures.
  const activeDataRef = useRef<any[]>([]);

  /**
   * Applies a responsive visible time range to the chart based on the current
   * container width. Called after animation completes and after every resize.
   * Falls back to fitContent() when no data is available yet.
   * Defined at component scope so both the chart-init and series-update
   * useEffects can reference it without closure staleness.
   */
  const applyResponsiveRange = useCallback(
    (data?: any[]) => {
      if (!chartContainerRef.current || !chartRef.current) return;
      const width = chartContainerRef.current.clientWidth;
      const days = getVisibleDaysForWidth(width);

      // Prefer the explicitly passed data, then the always-current ref, then empty.
      const dataset = data ?? activeDataRef.current ?? [];
      const lastPoint = dataset[dataset.length - 1];

      try {
        if (lastPoint?.time) {
          const toStr =
            typeof lastPoint.time === 'string'
              ? lastPoint.time
              : `${lastPoint.time.year}-${String(lastPoint.time.month).padStart(2, '0')}-${String(lastPoint.time.day).padStart(2, '0')}`;

          const range = buildVisibleRange(toStr, days);
          if (range) {
            chartRef.current.timeScale().setVisibleRange(range);
            return;
          }
        }
        // Fall back to showing all data if range can't be computed.
        chartRef.current.timeScale().fitContent();
      } catch {
        // If the chart is being torn down, ignore the error gracefully.
      }
    },
    [] // refs are stable — no deps needed
  );

  // ========== State Management ==========

  // Client-side rendering flag moved above; preserved here as a note to keep hook order stable.
  // (Initialisation happens earlier to avoid reordering hooks.)

  // Animation state for progressive rendering
  const [isAnimating, setIsAnimating] = useState(false);

  // Crosshair mode toggle.
  // On desktop: switches CrosshairMode between Normal and Hidden.
  // On touch: switches TrackingModeExitMode between OnNextTap (default, tap-to-exit)
  // and OnTouchEnd (crosshair stays while finger is down, lifts to drag).
  // Both are needed so the button works correctly on all devices.
  const [isCrosshairVisible, setIsCrosshairVisible] = useState(true);

  // Chart data arrays
  const [areaData, setAreaData] = useState(
    () => generateTradingViewChartData(365, new Date('2024-01-01'), 100) // Initial mock area data
  );
  const [candleData, setCandleData] = useState(
    () => generateCandlestickData(365, new Date('2024-01-01'), 100) // Initial mock candlestick data
  );

  // Chart display options
  const [chartType, setChartType] = useState<chartType>('area'); // Current chart type
  const [dataSource, setDataSource] = useState<dataSource>('generated'); // Data source indicator

  // Real-time data controls
  const [isLoading, setIsLoading] = useState(false); // Loading state during API call
  const [error, setError] = useState<string | null>(null); // Error message display

  // Crosshair hover data for overlay display
  const [ohlcData, setOhlcData] = useState<OHLCData>(null); // OHLC data when hovering candlestick
  const [areaDisplayData, setAreaDisplayData] = useState<AreaData>(null); // Price data when hovering area

  // Trade modal state
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell' | null>(null);
  const [tradeNotification, setTradeNotification] = useState<{
    type: 'buy' | 'sell';
    result: BuyResult | SellResult;
  } | null>(null);

  // Currency IDs for the trade modal — resolved dynamically from /v1/currency
  const [usdCurrencyId, setUsdCurrencyId] = useState<string | null>(null);
  const [symbolCurrencyId, setSymbolCurrencyId] = useState<string | null>(null);

  // Candlestick color scheme preference (theme colors vs standard red/green)
  // Candlestick color preference. Use a deterministic default for SSR, then hydrate
  // the user's saved preference from localStorage after mount to avoid hydration mismatch.
  const [useThemeColors, setUseThemeColors] = useState<boolean>(true);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('useThemeColors');
      if (saved !== null) setUseThemeColors(saved === 'true');
    } catch {
      // ignore localStorage errors
    }
  }, []);

  // Get candlestick colors based on user preference
  const candleColors = useThemeColors
    ? { up: colors.candleUp, down: colors.candleDown }
    : { up: '#22c55e', down: '#ef4444' };

  // ========== Initialization Effect ==========
  // Runs once on component mount to enable client-side rendering
  useEffect(() => {
    setIsClient(true); // Signal that we're now on the client (not SSR)
  }, []);

  // ========== Color Preference Effects ==========
  // Persist color preference to localStorage
  useEffect(() => {
    localStorage.setItem('useThemeColors', String(useThemeColors));
  }, [useThemeColors]);

  // Update candlestick colors when preference or colors change
  useEffect(() => {
    if (seriesRef.current && chartType === 'candle') {
      seriesRef.current.applyOptions({
        upColor: candleColors.up,
        downColor: candleColors.down,
        wickUpColor: candleColors.up,
        wickDownColor: candleColors.down
      });
    }
  }, [candleColors.up, candleColors.down, chartType]);

  // ========== Event Handlers ==========

  /**
   * Fetch real-time stock data from backend API
   * Triggered when user clicks "Fetch Real Data" button
   */
  const handleFetchRealData = async () => {
    setIsLoading(true); // Show loading state
    setError(null); // Clear any previous errors

    try {
      // Call backend API to get stock data
      const data = await fetchMarketData(symbol, 365);

      // Update both chart formats with real data
      setCandleData(data.candlestick);
      setAreaData(data.area);
      setDataSource('realtime'); // Update source indicator
    } catch (err) {
      // Display user-friendly error message
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  /**
   * Generate new mock data for testing/demo purposes
   * Triggered when user clicks "Generate Mock Data" button
   */
  const handleRegenerateData = () => {
    // Generate realistic-looking mock data
    setAreaData(
      generateTradingViewChartData(365, new Date('2024-01-01'), 10000)
    );
    setCandleData(generateCandlestickData(365, new Date('2024-01-01'), 10000));
    setDataSource('generated'); // Update source indicator
    setError(null); // Clear any errors

    // Clear selection in AssetNav (unselect all stocks)
    onClearSelection?.();
  };

  /**
   * Toggle between area and candlestick chart types
   * Triggered when user clicks "Switch to X Chart" button
   */
  const handleToggleChartType = () => {
    setChartType((prev) => (prev === 'area' ? 'candle' : 'area'));
  };

  // ========== Chart Initialization Effect ==========
  /**
   * Creates the chart instance and sets up event listeners
   * Runs once when component mounts on client-side
   */
  useEffect(() => {
    // Wait for client-side rendering and DOM element to be ready
    if (!chartContainerRef.current || !isClient) return;

    // Prevent double initialization in React Strict Mode (development only)
    if (chartRef.current) return;

    // Create new chart instance with initial configuration
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        textColor: colors.textColor,
        background: {
          type: ColorType.Solid,
          color: colors.background
        }
      },
      grid: {
        vertLines: {
          color: colors.gridColor
        },
        horzLines: {
          color: colors.gridColor
        }
      },
      timeScale: {
        borderColor: colors.borderColor
      },
      rightPriceScale: {
        borderColor: colors.borderColor
      },
      // Always keep crosshair in Normal mode on init.
      // Without this, a dblclick (fitContent) in lightweight-charts v5 can
      // silently switch the mode to Hidden, breaking the hover overlay.
      crosshair: {
        mode: CrosshairMode.Normal
      },
      // Default touch tracking: OnTouchEnd so crosshair follows the finger
      // while held, then drag resumes on lift — matches isCrosshairVisible=true.
      trackingMode: {
        exitMode: TrackingModeExitMode.OnTouchEnd
      }
    });

    chartRef.current = chart;

    /**
     * Subscribe to crosshair move events for overlay display
     * Updates OHLC or area data when user hovers over chart
     */
    chart.subscribeCrosshairMove((param: any) => {
      // Exit if no time or series data available
      if (!param.time || !param.seriesData || !seriesRef.current) {
        return;
      }

      // Get data for the current hovered point
      const data = param.seriesData.get(seriesRef.current);
      if (!data) {
        return;
      }

      // Update overlay data based on chart type
      if (data.open !== undefined) {
        // Candlestick data (has open, high, low, close)
        setOhlcData({
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          time: param.time
        });
      } else if (data.value !== undefined) {
        // Area data (has only value)
        setAreaDisplayData({
          value: data.value,
          time: param.time
        });
      }
    });

    /**
     * lightweight-charts fires a dblclick internally to trigger fitContent.
     * In v5 this can leave the crosshair in a hidden state.
     * Re-apply Normal mode every time the user double-clicks so the crosshair
     * is always restored.
     */
    const handleDblClick = () => {
      chart.applyOptions({ crosshair: { mode: CrosshairMode.Normal } });
    };

    chartContainerRef.current.addEventListener('dblclick', handleDblClick);

    /**
     * Handle window resize to keep chart responsive
     */
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
        applyResponsiveRange();
      }
    };

    window.addEventListener('resize', handleResize);

    /**
     * Use ResizeObserver to detect container size changes
     * This handles layout shifts (e.g., when AssetNav is pinned)
     */
    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        });
        applyResponsiveRange();
      }
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    // Cleanup function: remove event listeners and destroy chart
    return () => {
      chartContainerRef.current?.removeEventListener(
        'dblclick',
        handleDblClick
      );
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove(); // Destroy chart instance
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [isClient, theme, applyResponsiveRange]);

  // Active dataset for current chart type
  const activeData = chartType === 'area' ? areaData : candleData;

  // ========== Chart Series Update Effect ==========
  /**
   * Updates the chart series when chart type or active data changes
   * Removes old series and creates new one based on current chart type
   * Runs whenever: chartType, activeData, or theme changes
   */
  useEffect(() => {
    if (!chartRef.current || !isClient) return;

    // Remove existing series if present (when switching chart types)
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    const animateChartData = (data: any[], series: any) => {
      // Keep the ref up-to-date so resize observers can access current data.
      activeDataRef.current = data;
      setIsAnimating(true);
      const duration = 1500; // Animation duration in ms
      const startTime = Date.now();
      const totalPoints = data.length;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOutCubic(progress);

        const pointsToShow = Math.floor(easedProgress * totalPoints);
        const visibleData = data.slice(0, Math.max(1, pointsToShow));

        series.setData(visibleData);

        // During animation keep the full range visible so the chart fills from
        // the left as data is drawn in.
        chartRef.current?.timeScale().fitContent();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          // Animation complete — apply responsive visible range based on current
          // container width instead of showing all data at once.
          applyResponsiveRange(data);
        }
      };

      requestAnimationFrame(animate);
    };

    if (chartType === 'area') {
      // ===== Area Chart Mode =====
      setOhlcData(null); // Clear candlestick overlay data

      // Create area series with gradient
      const areaSeries = chartRef.current.addSeries(AreaSeries, {
        lineColor: colors.areaLine,
        topColor: colors.areaTop,
        bottomColor: colors.areaBottom
      });
      seriesRef.current = areaSeries;

      // Animate data loading
      animateChartData(areaData, areaSeries);

      // Set initial overlay data to most recent data point
      if (areaData.length > 0) {
        const lastData = areaData[areaData.length - 1];
        setAreaDisplayData({
          value: lastData.value,
          time: lastData.time
        });
      }
    } else {
      // ===== Candlestick Chart Mode =====
      setAreaDisplayData(null); // Clear area overlay data

      // Create candlestick series with themed colors
      const candleSeries = chartRef.current.addSeries(CandlestickSeries, {
        upColor: candleColors.up,
        downColor: candleColors.down,
        borderVisible: false, // No borders around candles
        wickUpColor: candleColors.up,
        wickDownColor: candleColors.down
      });
      seriesRef.current = candleSeries;

      // Animate data loading
      animateChartData(candleData, candleSeries);

      // Set initial overlay data to most recent candlestick
      if (candleData.length > 0) {
        const lastCandle = candleData[candleData.length - 1];
        setOhlcData({
          open: lastCandle.open,
          high: lastCandle.high,
          low: lastCandle.low,
          close: lastCandle.close,
          time: lastCandle.time
        });
      }
    }
  }, [chartType, isClient, activeData, theme, colors]);

  // ========== Theme Update Effect ==========
  /**
   * Updates chart colors when theme changes (dark/light mode toggle)
   * Does NOT recreate the chart - only updates color options for performance
   * Runs whenever: theme changes
   */
  useEffect(() => {
    if (chartRef.current && isClient) {
      chartRef.current.applyOptions({
        layout: {
          textColor: colors.textColor,
          background: {
            type: ColorType.Solid,
            color: colors.background
          }
        },
        grid: {
          vertLines: {
            color: colors.gridColor
          },
          horzLines: {
            color: colors.gridColor
          }
        },
        timeScale: {
          borderColor: colors.borderColor
        },
        rightPriceScale: {
          borderColor: colors.borderColor
        }
      });
    }
  }, [theme, isClient, colors]);

  // ========== Auto-Fetch Effect ==========
  /**
   * Automatically fetches new data when symbol changes
   *
   * When user selects a different stock in AssetNav:
   * 1. Parent updates selectedSymbol state
   * 2. This component re-renders with new symbol prop
   * 3. useEffect detects symbol changed
   * 4. Automatically sets dataSource to 'realtime'
   * 5. Calls handleFetchRealData() to load stock data
   * 6. Chart updates with new stock data
   *
   * Dependency: [symbol] - runs whenever symbol prop changes
   */
  useEffect(() => {
    if (symbol) {
      // Automatically switch to realtime mode when symbol changes
      setDataSource('realtime');
      handleFetchRealData();
    }
  }, [symbol]);

  // ========== Crosshair Toggle ==========
  useEffect(() => {
    if (!chartRef.current || !isClient) return;
    chartRef.current.applyOptions({
      // Desktop: show or hide the crosshair lines visually.
      crosshair: {
        mode: isCrosshairVisible ? CrosshairMode.Normal : CrosshairMode.Hidden
      },
      // Touch: when crosshair is "on", use OnTouchEnd so the crosshair follows
      // the finger as long as it's held down, and drag resumes on lift.
      // When "off", use OnNextTap (default) so a single tap dismisses the
      // crosshair and subsequent drags scroll freely.
      trackingMode: {
        exitMode: isCrosshairVisible
          ? TrackingModeExitMode.OnTouchEnd
          : TrackingModeExitMode.OnNextTap
      }
    });
  }, [isCrosshairVisible, isClient]);

  // Resolve currency IDs whenever symbol changes
  useEffect(() => {
    if (!symbol) return;

    setUsdCurrencyId(null);
    setSymbolCurrencyId(null);

    fetchCurrencyId('USD')
      .then(setUsdCurrencyId)
      .catch(() => setUsdCurrencyId(null));

    fetchCurrencyId(symbol)
      .then(setSymbolCurrencyId)
      .catch(() => setSymbolCurrencyId(null));
  }, [symbol]);

  const onIntervalClick = () => {};

  // TODO: Fix touch crosshair behaviour on mobile.
  //       lightweight-charts v5 does not expose a reliable API for keeping the
  //       crosshair active during a finger drag. The CrosshairMode / TrackingMode
  //       approaches were tried and did not produce the expected UX. A manual
  //       touchmove → setCrosshairPosition approach was also attempted but broke
  //       the pan/scroll interaction. Needs a proper solution before shipping mobile.

  // ========== SSR Prevention ==========
  // ========== Component Render ==========
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ========== Control Panel ========== */}

      {/* ── Mobile toolbar (< md) — icon buttons in a single tight row ── */}
      <div className="flex md:hidden items-center gap-1.5 px-2 py-1.5 shrink-0 border-b border-border">
        {/* Crosshair toggle */}
        <button
          onClick={() => setIsCrosshairVisible((v) => !v)}
          title={isCrosshairVisible ? 'Hide crosshair' : 'Show crosshair'}
          className={`p-2 rounded-lg border transition-all ${
            isCrosshairVisible
              ? 'border-primary/50 bg-primary/10 text-primary'
              : 'border-border bg-card text-muted-foreground'
          }`}
        >
          {/* Crosshair icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="7" />
            <line x1="12" y1="17" x2="12" y2="22" />
            <line x1="2" y1="12" x2="7" y2="12" />
            <line x1="17" y1="12" x2="22" y2="12" />
          </svg>
        </button>

        {/* Regenerate */}
        <button
          onClick={handleRegenerateData}
          disabled={isLoading}
          title="Generate mock data"
          className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-3.17" />
          </svg>
        </button>

        {/* Chart type toggle */}
        <button
          onClick={handleToggleChartType}
          disabled={isLoading}
          title={`Switch to ${chartType === 'area' ? 'Candlestick' : 'Area'} chart`}
          className="p-2 rounded-lg border border-primary/30 bg-primary/10 text-primary disabled:opacity-50 transition-all"
        >
          {chartType === 'area' ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="4" height="16" />
              <rect x="10" y="8" width="4" height="12" />
              <rect x="18" y="2" width="4" height="18" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          )}
        </button>

        {/* Source badge */}
        <div className="px-2 py-1 text-xs bg-card border border-border rounded-lg text-muted-foreground">
          {dataSource === 'realtime' ? symbol : 'Mock'}
        </div>

        {/* Color legend dots */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-card border border-border rounded-lg">
          <div
            className={`w-2.5 h-2.5 rounded-sm ${useThemeColors ? 'bg-[rgb(var(--color-success)/1)]' : 'bg-[#22c55e]'}`}
          />
          <div
            className={`w-2.5 h-2.5 rounded-sm ${useThemeColors ? 'bg-[rgb(var(--color-danger)/1)]' : 'bg-[#ef4444]'}`}
          />
        </div>

        {/* Theme color toggle */}
        <button
          onClick={() => setUseThemeColors(!useThemeColors)}
          title={
            isClient
              ? useThemeColors
                ? 'Using theme colors'
                : 'Using standard colors'
              : 'Toggle colors'
          }
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${useThemeColors ? 'bg-[rgb(var(--color-success)/1)]' : 'bg-[#94a3b8]'}`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${useThemeColors ? 'translate-x-5' : 'translate-x-1'}`}
          />
        </button>

        {/* Buy / Sell */}
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setTradeMode('buy')}
            disabled={
              !isClient ||
              !symbol ||
              dataSource !== 'realtime' ||
              isLoading ||
              !isLoggedIn
            }
            title={
              !isClient
                ? 'Loading…'
                : !isLoggedIn
                  ? 'Sign in to trade'
                  : !symbol
                    ? 'Select an asset first'
                    : dataSource !== 'realtime'
                      ? 'Switch to real data first'
                      : 'Buy'
            }
            className="px-3 py-1.5 text-xs rounded-lg text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-[rgb(var(--color-success)/1)] hover:bg-[rgb(var(--color-success)/0.75)]"
          >
            Buy
          </button>
          <button
            onClick={() => setTradeMode('sell')}
            disabled={
              !isClient ||
              !symbol ||
              dataSource !== 'realtime' ||
              isLoading ||
              !isLoggedIn
            }
            title={
              !isClient
                ? 'Loading…'
                : !isLoggedIn
                  ? 'Sign in to trade'
                  : !symbol
                    ? 'Select an asset first'
                    : dataSource !== 'realtime'
                      ? 'Switch to real data first'
                      : 'Sell'
            }
            className="px-3 py-1.5 text-xs rounded-lg text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-[rgb(var(--color-danger)/1)] hover:bg-[rgb(var(--color-danger)/0.75)]"
          >
            Sell
          </button>
        </div>
      </div>

      {/* ── Desktop toolbar (>= md) — full labeled row, same as before ── */}
      <div className="hidden md:flex m-3 flex-wrap gap-2 shrink-0">
        {/* Crosshair toggle */}
        <button
          onClick={() => setIsCrosshairVisible((v) => !v)}
          title={isCrosshairVisible ? 'Hide crosshair' : 'Show crosshair'}
          className={`px-3 py-2 text-sm rounded-lg border transition-all flex items-center gap-2 ${
            isCrosshairVisible
              ? 'border-primary/50 bg-primary/10 text-primary'
              : 'border-border bg-card text-muted-foreground hover:bg-muted'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="7" />
            <line x1="12" y1="17" x2="12" y2="22" />
            <line x1="2" y1="12" x2="7" y2="12" />
            <line x1="17" y1="12" x2="22" y2="12" />
          </svg>
          Crosshair
        </button>

        {/* Mock Data Generation Button */}
        <button
          onClick={handleRegenerateData}
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Generate Mock Data
        </button>

        {/* Chart Type Toggle Button */}
        <button
          onClick={handleToggleChartType}
          disabled={isLoading}
          className="px-4 py-2 text-sm border border-primary/30 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Switch to {chartType === 'area' ? 'Candlestick' : 'Area'} Chart
        </button>

        {/* Data Source Indicator Badge */}
        <div className="flex items-center px-3 py-2 text-sm bg-card border border-border rounded-lg">
          <span className="text-muted-foreground">Source:</span>
          <span className="ml-2 font-semibold text-foreground">
            {dataSource === 'realtime' ? `Real (${symbol})` : 'Generated'}
          </span>
        </div>

        {/* Candlestick Color Legend */}
        <div className="flex items-center gap-4 px-3 py-2 text-sm bg-card border border-border rounded-lg">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-3 h-3 rounded-sm ${useThemeColors ? 'bg-[rgb(var(--color-success)/1)]' : 'bg-[#22c55e]'}`}
            />
            <span className="text-muted-foreground">Bullish</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-3 h-3 rounded-sm ${useThemeColors ? 'bg-[rgb(var(--color-danger)/1)]' : 'bg-[#ef4444]'}`}
            />
            <span className="text-muted-foreground">Bearish</span>
          </div>
        </div>

        {/* Toggle switch between theme colors and standard red/green */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Standard</span>
          <button
            onClick={() => setUseThemeColors(!useThemeColors)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${useThemeColors ? 'bg-[rgb(var(--color-success)/1)]' : 'bg-[#94a3b8]'}`}
            title={
              isClient
                ? useThemeColors
                  ? 'Using theme colors - Click for standard'
                  : 'Using standard colors - Click for theme'
                : 'Toggle colors'
            }
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useThemeColors ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
          <span className="text-xs text-muted-foreground">Theme</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setTradeMode('buy')}
            disabled={
              !isClient ||
              !symbol ||
              dataSource !== 'realtime' ||
              isLoading ||
              !isLoggedIn
            }
            title={
              !isClient
                ? 'Loading…'
                : !isLoggedIn
                  ? 'Sign in to trade'
                  : !symbol
                    ? 'Select an asset first'
                    : dataSource !== 'realtime'
                      ? 'Switch to real data first'
                      : 'Buy this asset'
            }
            className="px-4 py-2 text-sm rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-[rgb(var(--color-success)/1)] hover:bg-[rgb(var(--color-success)/0.75)]"
          >
            Buy
          </button>
          <button
            onClick={() => setTradeMode('sell')}
            disabled={
              !isClient ||
              !symbol ||
              dataSource !== 'realtime' ||
              isLoading ||
              !isLoggedIn
            }
            title={
              !isClient
                ? 'Loading…'
                : !isLoggedIn
                  ? 'Sign in to trade'
                  : !symbol
                    ? 'Select an asset first'
                    : dataSource !== 'realtime'
                      ? 'Switch to real data first'
                      : 'Sell this asset'
            }
            className="px-4 py-2 text-sm rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-[rgb(var(--color-danger)/1)] hover:bg-[rgb(var(--color-danger)/0.75)]"
          >
            Sell
          </button>
        </div>
      </div>

      {/* ========== Trade Success Notification ========== */}
      {tradeNotification && (
        <div
          className="mx-3 mb-2 px-4 py-2.5 rounded-lg border text-sm flex items-center justify-between shrink-0 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            backgroundColor:
              tradeNotification.type === 'buy'
                ? 'rgb(var(--color-success) / 0.12)'
                : 'rgb(var(--color-danger) / 0.12)',
            borderColor:
              tradeNotification.type === 'buy'
                ? 'rgb(var(--color-success) / 0.35)'
                : 'rgb(var(--color-danger) / 0.35)',
            color:
              tradeNotification.type === 'buy'
                ? 'rgb(var(--color-success))'
                : 'rgb(var(--color-danger))'
          }}
        >
          <span>
            {tradeNotification.type === 'buy'
              ? `✓ Bought ${symbol} — received ${'received' in tradeNotification.result ? tradeNotification.result.received : '?'} units`
              : `✓ Sold ${symbol} — received ${'received' in tradeNotification.result ? (parseInt(tradeNotification.result.received) / 100).toFixed(2) : '?'} USD`}
          </span>
          <button
            onClick={() => setTradeNotification(null)}
            className="ml-4 opacity-60 hover:opacity-100 transition-opacity leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* ========== Error Message Display ========== */}
      {error && (
        <div className="m-2 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 text-sm shrink-0">
          {error}
        </div>
      )}

      {/* ========== Chart Container with Overlays ========== */}
      <div className="relative w-full flex-1 min-h-0">
        {/* Main chart canvas - always rendered */}
        <div
          ref={chartContainerRef}
          className="w-full h-full rounded-2xl overflow-hidden"
        />

        {/* OHLC Data Overlay - shown when hovering candlestick chart */}
        {ohlcData &&
          chartType === 'candle' &&
          (() => {
            // Calculate price change from previous day
            const { changeAmount, changePercent, isPositive } =
              calculateOHLCChange(ohlcData, candleData);

            return (
              <ChartOverlay
                type="ohlc"
                data={{
                  symbol: symbol,
                  assetName:
                    dataSource === 'realtime'
                      ? tickerToName[symbol]
                      : 'generated',
                  time: formatChartTime(ohlcData.time),
                  open: ohlcData.open,
                  high: ohlcData.high,
                  low: ohlcData.low,
                  close: ohlcData.close
                }}
                changeAmount={changeAmount}
                changePercent={changePercent}
                isPositive={isPositive}
                upColor={candleColors.up}
                downColor={candleColors.down}
                onIntervalClick={onIntervalClick}
                interval={1}
              />
            );
          })()}

        {/* Area Data Overlay - shown when hovering area chart */}
        {areaDisplayData &&
          chartType === 'area' &&
          (() => {
            // Calculate price change from previous day
            const { changeAmount, changePercent, isPositive } =
              calculateAreaChange(areaDisplayData, areaData);

            return (
              <ChartOverlay
                type="simple"
                data={{
                  symbol: symbol,
                  assetName:
                    dataSource === 'realtime'
                      ? tickerToName[symbol]
                      : 'generated',
                  time: formatChartTime(areaDisplayData.time),
                  value: areaDisplayData.value
                }}
                changeAmount={changeAmount}
                changePercent={changePercent}
                isPositive={isPositive}
                upColor={candleColors.up}
                downColor={candleColors.down}
                onIntervalClick={onIntervalClick}
                interval={1}
              />
            );
          })()}
      </div>

      {/* ========== Trade Modal ========== */}
      {tradeMode && (
        <TradeModal
          mode={tradeMode}
          symbol={symbol}
          fromCurrencyId={
            tradeMode === 'buy'
              ? (usdCurrencyId ?? '')
              : (symbolCurrencyId ?? '')
          }
          toCurrencyId={
            tradeMode === 'buy'
              ? (symbolCurrencyId ?? '')
              : (usdCurrencyId ?? '')
          }
          currentPrice={
            chartType === 'area' && areaData.length > 0
              ? (areaData[areaData.length - 1] as { value: number }).value
              : chartType === 'candle' && candleData.length > 0
                ? (candleData[candleData.length - 1] as { close: number }).close
                : 0
          }
          token={token ?? ''}
          onClose={() => setTradeMode(null)}
          onSuccess={(result) => {
            setTradeNotification({ type: tradeMode, result });
            setTradeMode(null);
            // Auto-dismiss after 5 seconds
            setTimeout(() => setTradeNotification(null), 5000);
          }}
        />
      )}
    </div>
  );
}

/**
 * ========== KEY TECHNICAL DECISIONS & PATTERNS ==========
 *
 * 1. ResizeObserver Implementation (Lines 283-292)
 *    Problem: Chart needs to resize when AssetNav pin state changes
 *    Solution: ResizeObserver monitors container size changes without remounting
 *    Benefits: No key prop switching, no chart flicker, smooth transitions
 *    Alternative avoided: Using key prop would destroy and recreate chart instance
 *
 * 2. TimeValue Type Union (Lines 53-77)
 *    Problem: Different data sources use different time formats
 *      - API: ISO string "2024-01-01"
 *      - Mock data: ISO string "2024-01-01"
 *      - TradingView Lightweight Charts: Unix timestamp (number)
 *      - Some legacy sources: {year, month, day} object
 *    Solution: TimeValue = string | number | { year, month, day }
 *    Benefit: Single type supports all sources without conversion overhead
 *    Usage: formatChartTime() normalizes display, calculateChange() uses normalizeTime()
 *
 * 3. Active Data Filtering (Line 328)
 *    Problem: Effect triggered on both areaData and candleData changes
 *    Result: Animation played 3x (once for each state update)
 *    Solution: Select only current chart's data into local variable
 *    Code: const activeData = chartType === 'area' ? areaData : candleData
 *    Effect: Depends only on activeData, not on unused data array
 *    Result: Animation plays once per data load
 *
 * 4. Crosshair Overlay Data Flow (Lines 596-676)
 *    Source: TradingView's subscribeCrosshairMove() event
 *    Processing: Extract OHLC/area data + format time + calculate change
 *    Display: ChartOverlay component shows formatted data with calculations
 *    Components:
 *      - formatChartTime(): Converts any time format to readable date
 *      - calculateOHLCChange/calculateAreaChange(): Compute price movement
 *      - ChartOverlay: Renders styled overlay with color coding
 *
 * 5. Theme Colors & Candlestick Styling (Lines 119-145)
 *    Feature: useThemeColors toggle (localStorage persistence)
 *    Options: Theme colors vs standard green/red
 *    Logic: Dynamically update candlestick colors when preference changes
 *    Usage: User-facing toggle in floating navbar control section
 *
 * 6. Client-Side Rendering Guard (Lines 175-178)
 *    Problem: SSR would try to access DOM (chartContainerRef.current)
 *    Solution: isClient state ensures rendering only on client
 *    Pattern: Common Next.js pattern for client-only libraries
 *    Impact: Prevents hydration mismatches with TradingView library
 */
