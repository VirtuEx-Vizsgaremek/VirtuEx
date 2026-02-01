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
import { CHART_THEMES } from '@/lib/chartThemes';
import {
  generateCandlestickData,
  generateTradingViewChartData
} from '@/lib/dataGenerator';
import { fetchMarketData } from '@/lib/marketApi';
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  createChart
} from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import ChartOverlay from './ChartOverlay';
import {
  calculateOHLCChange,
  calculateAreaChange
} from '@/lib/chartCalculations';

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
  time: string; // Date string
} | null;

/**
 * Area data structure for area chart overlay display
 * Null when no data is hovered or chart is in candlestick mode
 */
type AreaData = {
  value: number; // Price value
  time: string; // Date string
} | null;

/**
 * Props interface for TradingView component
 * Symbol is now controlled by parent (MarketPage) instead of internal state
 */
interface TradingViewProps {
  symbol: string; // Stock symbol passed from parent (e.g., "AAPL")
  onClearSelection?: () => void; // Optional callback to clear selection when switching to generated data
}

export default function TradingView({
  symbol,
  onClearSelection
}: TradingViewProps) {
  // ========== Context & Theme ==========
  const { theme, colorTheme } = useTheme(); // Get current theme (dark/light) and color theme from context

  // Get active color scheme based on theme and selected color theme
  const colors =
    theme === 'dark'
      ? CHART_THEMES[colorTheme].dark
      : CHART_THEMES[colorTheme].light;

  // ========== Refs for Chart Management ==========
  const chartContainerRef = useRef<HTMLDivElement>(null); // Container DOM element
  const chartRef = useRef<any>(null); // Chart instance
  const seriesRef = useRef<any>(null); // Current series (area or candlestick)

  // ========== State Management ==========

  // Client-side rendering flag (prevents hydration errors in Next.js)
  const [isClient, setIsClient] = useState(false);

  // Animation state for progressive rendering
  const [isAnimating, setIsAnimating] = useState(false);

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

  // Candlestick color scheme preference (theme colors vs standard red/green)
  const [useThemeColors, setUseThemeColors] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('useThemeColors');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

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
     * Handle window resize to keep chart responsive
     */
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function: remove event listener and destroy chart
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove(); // Destroy chart instance
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [isClient, theme]);

  // ========== Chart Series Update Effect ==========
  /**
   * Updates the chart series when chart type or data changes
   * Removes old series and creates new one based on current chart type
   * Runs whenever: chartType, areaData, candleData, or theme changes
   */
  useEffect(() => {
    if (!chartRef.current || !isClient) return;

    // Remove existing series if present (when switching chart types)
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    const animateChartData = (data: any[], series: any) => {
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

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          // Fit all data points on screen after animation completes
          chartRef.current?.timeScale().fitContent();
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
  }, [chartType, isClient, areaData, candleData, theme, colors]);

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

  // ========== SSR Prevention ==========
  // ========== Component Render ==========
  return (
    <>
      {/* ========== Control Panel ========== */}
      <div className="flex flex-wrap gap-2 mb-4">
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

        {/* Candlestick Color Legend - Only show for candlestick chart */}
        {chartType === 'candle' && (
          <div className="flex items-center gap-4 px-3 py-2 text-sm bg-card border border-border rounded-lg">
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: candleColors.up }}
              ></div>
              <span className="text-muted-foreground">Bullish</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: candleColors.down }}
              ></div>
              <span className="text-muted-foreground">Bearish</span>
            </div>
          </div>
        )}

        {/* Toggle switch between theme colors and standard red/green */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Standard</span>
          <button
            onClick={() => setUseThemeColors(!useThemeColors)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            style={{
              backgroundColor: useThemeColors ? candleColors.up : '#94a3b8'
            }}
            title={
              useThemeColors
                ? 'Using theme colors - Click for standard'
                : 'Using standard colors - Click for theme'
            }
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                useThemeColors ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-xs text-muted-foreground">Theme</span>
        </div>
      </div>

      {/* ========== Error Message Display ========== */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* ========== Chart Container with Overlays ========== */}
      <div className="relative w-full h-full">
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
                data={{ value: areaDisplayData.value }}
                changeAmount={changeAmount}
                changePercent={changePercent}
                isPositive={isPositive}
                upColor={candleColors.up}
                downColor={candleColors.down}
              />
            );
          })()}
      </div>
    </>
  );
}
