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

export default function TradingView() {
  // ========== Context & Theme ==========
  const { theme } = useTheme(); // Get current theme (dark/light) from context

  // ========== Refs for Chart Management ==========
  const chartContainerRef = useRef<HTMLDivElement>(null); // Container DOM element
  const chartRef = useRef<any>(null); // Chart instance
  const seriesRef = useRef<any>(null); // Current series (area or candlestick)

  // ========== State Management ==========

  // Client-side rendering flag (prevents hydration errors in Next.js)
  const [isClient, setIsClient] = useState(false);

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
  const [symbol, setSymbol] = useState('AAPL'); // Stock symbol to fetch
  const [isLoading, setIsLoading] = useState(false); // Loading state during API call
  const [error, setError] = useState<string | null>(null); // Error message display

  // Crosshair hover data for overlay display
  const [ohlcData, setOhlcData] = useState<OHLCData>(null); // OHLC data when hovering candlestick
  const [areaDisplayData, setAreaDisplayData] = useState<AreaData>(null); // Price data when hovering area

  // ========== Initialization Effect ==========
  // Runs once on component mount to enable client-side rendering
  useEffect(() => {
    setIsClient(true); // Signal that we're now on the client (not SSR)
  }, []);

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
      height: 400,
      layout: {
        textColor: theme === 'dark' ? '#D1D5DB' : '#1F2937', // Text color based on theme
        background: {
          type: ColorType.Solid,
          color: theme === 'dark' ? '#1F2937' : '#FFFFFF' // Background color
        }
      },
      grid: {
        vertLines: {
          color: theme === 'dark' ? '#374151' : '#E5E7EB' // Vertical grid lines
        },
        horzLines: {
          color: theme === 'dark' ? '#374151' : '#E5E7EB' // Horizontal grid lines
        }
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

    if (chartType === 'area') {
      // ===== Area Chart Mode =====
      setOhlcData(null); // Clear candlestick overlay data

      // Create area series with blue gradient
      const areaSeries = chartRef.current.addSeries(AreaSeries, {
        lineColor: '#2962FF', // Solid blue line
        topColor: '#2962FF', // Top of gradient (solid blue)
        bottomColor: 'rgba(41, 98, 255, 0.28)' // Bottom of gradient (transparent blue)
      });
      seriesRef.current = areaSeries;
      areaSeries.setData(areaData); // Load area data points

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

      // Create candlestick series with green/red colors
      const candleSeries = chartRef.current.addSeries(CandlestickSeries, {
        upColor: '#26a69a', // Green for bullish (close > open)
        downColor: '#ef5350', // Red for bearish (close < open)
        borderVisible: false, // No borders around candles
        wickUpColor: '#26a69a', // Green wicks for bullish candles
        wickDownColor: '#ef5350' // Red wicks for bearish candles
      });
      seriesRef.current = candleSeries;
      candleSeries.setData(candleData); // Load candlestick data points

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

    // Fit all data points on screen (auto-scale time axis)
    chartRef.current.timeScale().fitContent();
  }, [chartType, isClient, areaData, candleData, theme]);

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
          textColor: theme === 'dark' ? '#D1D5DB' : '#1F2937', // Axis labels color
          background: {
            type: ColorType.Solid,
            color: theme === 'dark' ? '#1F2937' : '#FFFFFF' // Chart background
          }
        },
        grid: {
          vertLines: {
            color: theme === 'dark' ? '#374151' : '#E5E7EB' // Vertical grid lines
          },
          horzLines: {
            color: theme === 'dark' ? '#374151' : '#E5E7EB' // Horizontal grid lines
          }
        }
      });
    }
  }, [theme, isClient]);

  // ========== SSR Prevention ==========
  // ========== Component Render ==========
  return (
    <div className="m-5">
      {/* ========== Control Panel ========== */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Real-Time Data Controls: Symbol Input + Fetch Button */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())} // Auto-uppercase input
            placeholder="Symbol (e.g., AAPL)"
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={isLoading} // Disable during API call
          />
          <button
            onClick={handleFetchRealData}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Fetch Real Data'}
          </button>
        </div>

        {/* Mock Data Generation Button */}
        <button
          onClick={handleRegenerateData}
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          Generate Mock Data
        </button>

        {/* Chart Type Toggle Button */}
        <button
          onClick={handleToggleChartType}
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
        >
          Switch to {chartType === 'area' ? 'Candlestick' : 'Area'} Chart
        </button>

        {/* Data Source Indicator Badge */}
        <div className="flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg">
          <span className="text-gray-600 dark:text-gray-400">Source:</span>
          <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
            {dataSource === 'realtime' ? `Real (${symbol})` : 'Generated'}
          </span>
        </div>
      </div>

      {/* ========== Error Message Display ========== */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* ========== Chart Container with Overlays ========== */}
      <div className="relative w-full h-[400px]">
        {/* Main chart canvas - always rendered */}
        <div ref={chartContainerRef} className="w-full h-[400px]" />

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
              />
            );
          })()}
      </div>
    </div>
  );
}
