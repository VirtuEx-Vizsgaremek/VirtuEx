/**
 * TradingView Chart Component
 *
 * Advanced financial chart component that displays stock market data using
 * TradingView's Lightweight Charts library. Supports both area and candlestick
 * chart types with real-time data from the backend API.
 *
 * Features:
 * - Dual chart types: Area chart and Candlestick (OHLC) chart
 * - Interval selector: 1D, 1W, 1M, 1Y (aggregated from daily DB data)
 * - Infinite pan: scrolling left/right loads older/newer data automatically
 * - Interactive crosshair with price overlays
 * - Dark/light theme support with smooth transitions
 * - Responsive design with automatic resizing
 * - Error handling and loading states
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
import {
  ChartInterval,
  INTERVAL_WINDOW_DAYS,
  fetchChartData,
  fetchCurrency
} from '@/lib/marketApi';
import {
  BuyResult,
  fetchCurrencies,
  fetchCurrencyId,
  SellResult
} from '@/lib/tradeApi';
import { getToken } from '@/lib/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type chartType = 'area' | 'candle';
type dataSource = 'generated' | 'realtime';

type OHLCData = {
  open: number;
  high: number;
  low: number;
  close: number;
  time: string | number | { year: number; month: number; day: number };
} | null;

type AreaData = {
  value: number;
  time: string | number | { year: number; month: number; day: number };
} | null;

interface TradingViewProps {
  symbol: string;
  onClearSelection?: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHART_INTERVALS: ChartInterval[] = ['1D', '1W', '1M', '1Y'];

/**
 * How many candles from the left edge trigger a "load more older data" fetch.
 */
const LOAD_MORE_THRESHOLD = 30;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * How many candles to display by default based on screen width and interval.
 * Wider screens show more candles; coarser intervals show fewer (so candles
 * stay a reasonable width and the chart looks dense like TradingView).
 *
 * Columns:  ≥1800px  ≥1200px  ≥768px  <768px
 */
const TARGET_CANDLES: Record<ChartInterval, [number, number, number, number]> =
  {
    '1D': [200, 130, 70, 35],
    '1W': [80, 52, 36, 20],
    '1M': [48, 36, 24, 14],
    '1Y': [15, 10, 8, 5]
  };

function getTargetCandles(widthPx: number, interval: ChartInterval): number {
  const [xl, lg, md, sm] = TARGET_CANDLES[interval];
  if (widthPx >= 1800) return xl;
  if (widthPx >= 1200) return lg;
  if (widthPx >= 768) return md;
  return sm;
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TradingView({
  symbol,
  onClearSelection
}: TradingViewProps) {
  // ========== Context & Theme ==========
  const { theme, colorTheme } = useTheme();

  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    getToken()
      .then(setToken)
      .catch(() => setToken(null));
  }, []);

  const isLoggedIn = isClient && !!token;

  const colors =
    theme === 'dark'
      ? CHART_THEMES[colorTheme].dark
      : CHART_THEMES[colorTheme].light;

  // ========== Chart Refs ==========
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const activeDataRef = useRef<any[]>([]);

  // ========== Interval & loading refs (stable across re-renders) ==========
  const chartIntervalRef = useRef<ChartInterval>('1D');
  const currencyPrecisionRef = useRef<number>(2);
  // Earliest date we have loaded for the current symbol+interval
  const loadedStartRef = useRef<Date | null>(null);
  // Latest date we have loaded
  const loadedEndRef = useRef<Date | null>(null);
  // Whether there is older data to fetch
  const hasMoreLeftRef = useRef(true);
  // Whether there is newer data to fetch (rare — only at chart boot)
  const hasMoreRightRef = useRef(false);
  // Guard against concurrent fetches
  const isFetchingMoreRef = useRef(false);
  // After a prepend we restore the visible time range to prevent the view jumping
  const restoreTimeRangeRef = useRef<{ from: number; to: number } | null>(null);
  // Skip the load-in animation when appending/prepending
  const skipAnimationRef = useRef(false);
  // Current symbol, kept as a ref so async callbacks can access the latest value
  const symbolRef = useRef(symbol);

  // ========== State ==========
  const [isCrosshairVisible, setIsCrosshairVisible] = useState(true);
  const [chartInterval, setChartInterval] = useState<ChartInterval>('1D');

  const [areaData, setAreaData] = useState(() =>
    generateTradingViewChartData(365, new Date('2024-01-01'), 100)
  );
  const [candleData, setCandleData] = useState(() =>
    generateCandlestickData(365, new Date('2024-01-01'), 100)
  );

  const [chartType, setChartType] = useState<chartType>('area');
  const [dataSource, setDataSource] = useState<dataSource>('generated');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ohlcData, setOhlcData] = useState<OHLCData>(null);
  const [areaDisplayData, setAreaDisplayData] = useState<AreaData>(null);

  // ========== Mock generator panel state ==========
  const [showMockPanel, setShowMockPanel] = useState(false);
  const [mockYears, setMockYears] = useState(1);
  const [mockMonths, setMockMonths] = useState(0);
  const [mockDays, setMockDays] = useState(0);
  const [simSpeed, setSimSpeed] = useState(300); // ms per candle
  const [isLiveSimulating, setIsLiveSimulating] = useState(false);

  // Refs used by the live-sim interval so it never reads stale closures
  const simLastPriceRef = useRef(100);
  const simLastDateRef = useRef(new Date());
  const isLiveSimRef = useRef(false); // guards the series-update effect
  const chartTypeRef = useRef(chartType);
  useEffect(() => {
    chartTypeRef.current = chartType;
  }, [chartType]);

  const [tradeMode, setTradeMode] = useState<'buy' | 'sell' | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [tradeNotification, setTradeNotification] = useState<{
    type: 'buy' | 'sell';
    result: BuyResult | SellResult;
  } | null>(null);

  const [usdCurrencyId, setUsdCurrencyId] = useState<string | null>(null);
  const [symbolCurrencyId, setSymbolCurrencyId] = useState<string | null>(null);
  const [symbolPrecision, setSymbolPrecision] = useState<number>(8);

  const [useThemeColors, setUseThemeColors] = useState<boolean>(true);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('useThemeColors');
      if (saved !== null) setUseThemeColors(saved === 'true');
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const candleColors = useThemeColors
    ? { up: colors.candleUp, down: colors.candleDown }
    : { up: '#22c55e', down: '#ef4444' };

  // Keep refs in sync with state
  useEffect(() => {
    chartIntervalRef.current = chartInterval;
  }, [chartInterval]);

  useEffect(() => {
    symbolRef.current = symbol;
  }, [symbol]);

  // ========== Responsive visible range ==========
  /**
   * Sets the chart's visible logical range so that the last N candles fill the
   * viewport (N depends on screen width and the active interval).  A small
   * right-side padding (3 bars) replicates TradingView's "future space" feel.
   */
  const applyResponsiveRange = useCallback((data?: any[]) => {
    if (!chartContainerRef.current || !chartRef.current) return;
    const dataset = data ?? activeDataRef.current ?? [];
    if (dataset.length === 0) {
      try {
        chartRef.current.timeScale().fitContent();
      } catch {
        /* tearing down */
      }
      return;
    }

    const width = chartContainerRef.current.clientWidth;
    const candles = getTargetCandles(width, chartIntervalRef.current);
    const total = dataset.length;
    // `to` slightly past the last bar gives TradingView-style right padding.
    const to = total + 3;
    const from = to - candles;

    try {
      chartRef.current.timeScale().setVisibleLogicalRange({ from, to });
    } catch {
      // chart tearing down
    }
  }, []);

  // ========== Color preference effects ==========
  useEffect(() => {
    localStorage.setItem('useThemeColors', String(useThemeColors));
  }, [useThemeColors]);

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

  // ========== Data loading ==========

  /**
   * Core fetch: gets data for [start, end), merges into state.
   * mode:
   *   'replace' — clear existing data (initial load / interval change)
   *   'prepend' — insert older candles at the front
   *   'append'  — insert newer candles at the back
   */
  const loadData = useCallback(
    async (
      sym: string,
      start: Date,
      end: Date,
      interval: ChartInterval,
      mode: 'replace' | 'prepend' | 'append'
    ) => {
      try {
        // Resolve precision (cache it so prepend/append don't re-fetch metadata)
        let precision = currencyPrecisionRef.current;
        if (mode === 'replace') {
          const currency = await fetchCurrency(sym);
          precision = currency.precision;
          currencyPrecisionRef.current = precision;
        }

        const result = await fetchChartData(
          sym,
          start,
          end,
          interval,
          precision
        );

        // If nothing came back and we were looking for older data, mark exhausted
        if (result.candlestick.length === 0) {
          if (mode === 'prepend') hasMoreLeftRef.current = false;
          if (mode === 'append') hasMoreRightRef.current = false;
          return;
        }

        if (mode === 'replace') {
          skipAnimationRef.current = false; // not a prepend
          setCandleData(result.candlestick);
          setAreaData(result.area);
          loadedStartRef.current = start;
          loadedEndRef.current = end;
          hasMoreLeftRef.current = true;
          hasMoreRightRef.current = false;
        } else if (mode === 'prepend') {
          // Save the visible time range so we can restore it after the data
          // is spliced in (otherwise the chart jumps to the newly added candles)
          const currentRange = chartRef.current
            ?.timeScale()
            .getVisibleRange() as { from: number; to: number } | null;
          restoreTimeRangeRef.current = currentRange;

          skipAnimationRef.current = true;

          setCandleData((prev) => {
            const merged = [...result.candlestick, ...prev];
            const seen = new Set<string>();
            return merged.filter((d) => {
              const k = d.time as string;
              if (seen.has(k)) return false;
              seen.add(k);
              return true;
            });
          });
          setAreaData((prev) => {
            const merged = [...result.area, ...prev];
            const seen = new Set<string>();
            return merged.filter((d) => {
              const k = d.time as string;
              if (seen.has(k)) return false;
              seen.add(k);
              return true;
            });
          });
          loadedStartRef.current = start;
        } else if (mode === 'append') {
          skipAnimationRef.current = true;
          setCandleData((prev) => {
            const merged = [...prev, ...result.candlestick];
            const seen = new Set<string>();
            return merged.filter((d) => {
              const k = d.time as string;
              if (seen.has(k)) return false;
              seen.add(k);
              return true;
            });
          });
          setAreaData((prev) => {
            const merged = [...prev, ...result.area];
            const seen = new Set<string>();
            return merged.filter((d) => {
              const k = d.time as string;
              if (seen.has(k)) return false;
              seen.add(k);
              return true;
            });
          });
          loadedEndRef.current = end;
        }
      } catch (err) {
        console.error('loadData error:', err);
        if (mode === 'replace') {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
        }
      }
    },
    []
  );

  /**
   * Load the initial window of data for the current symbol + interval.
   * Resets all pan state.
   */
  const loadInitialData = useCallback(
    async (sym: string, interval: ChartInterval) => {
      setIsLoading(true);
      setError(null);
      setDataSource('realtime');

      const windowDays = INTERVAL_WINDOW_DAYS[interval];
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - windowDays);

      await loadData(sym, start, end, interval, 'replace');
      setIsLoading(false);
    },
    [loadData]
  );

  /**
   * Load more older data when the user pans to the left edge.
   */
  const loadMoreLeft = useCallback(async () => {
    if (
      isFetchingMoreRef.current ||
      !hasMoreLeftRef.current ||
      !loadedStartRef.current
    )
      return;

    const sym = symbolRef.current;
    const interval = chartIntervalRef.current;

    isFetchingMoreRef.current = true;
    const windowDays = INTERVAL_WINDOW_DAYS[interval];
    const end = new Date(loadedStartRef.current);
    const start = new Date(loadedStartRef.current);
    start.setDate(start.getDate() - windowDays);

    await loadData(sym, start, end, interval, 'prepend');
    isFetchingMoreRef.current = false;
  }, [loadData]);

  /**
   * Load more newer data when the user pans to the right edge
   * (only relevant if the initial load didn't reach today).
   */
  const loadMoreRight = useCallback(async () => {
    if (
      isFetchingMoreRef.current ||
      !hasMoreRightRef.current ||
      !loadedEndRef.current
    )
      return;

    const sym = symbolRef.current;
    const interval = chartIntervalRef.current;

    isFetchingMoreRef.current = true;
    const start = new Date(loadedEndRef.current);
    const end = new Date();

    await loadData(sym, start, end, interval, 'append');
    isFetchingMoreRef.current = false;
  }, [loadData]);

  // Keep stable refs to pan handlers so the chart subscription (created once)
  // always calls the latest version.
  const loadMoreLeftRef = useRef(loadMoreLeft);
  const loadMoreRightRef = useRef(loadMoreRight);
  useEffect(() => {
    loadMoreLeftRef.current = loadMoreLeft;
  }, [loadMoreLeft]);
  useEffect(() => {
    loadMoreRightRef.current = loadMoreRight;
  }, [loadMoreRight]);

  // ========== Mock data handlers ==========

  // Days each candle advances for the current interval
  const INTERVAL_STEP: Record<ChartInterval, number> = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '1Y': 365
  };

  const stopLiveSim = useCallback(() => {
    isLiveSimRef.current = false;
    setIsLiveSimulating(false);
    // The useEffect below cleans up the actual setInterval
  }, []);

  // Stop sim when chart type changes (series gets replaced)
  useEffect(() => {
    if (isLiveSimRef.current) stopLiveSim();
  }, [chartType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerateMock = useCallback(() => {
    stopLiveSim();
    const iv = chartIntervalRef.current;
    const stepDays = INTERVAL_STEP[iv];
    const totalDays = Math.max(1, mockYears * 365 + mockMonths * 30 + mockDays);
    const totalCandles = Math.max(1, Math.ceil(totalDays / stepDays));

    const startDate = new Date();
    startDate.setTime(
      startDate.getTime() - totalCandles * stepDays * 86_400_000
    );

    const candles = generateCandlestickData(
      totalCandles,
      startDate,
      100,
      stepDays
    );
    const area = generateTradingViewChartData(
      totalCandles,
      startDate,
      100,
      stepDays
    );

    // Seed live-sim refs so Live can continue from the last generated bar
    if (candles.length > 0) {
      const last = candles[candles.length - 1];
      simLastPriceRef.current = last.close;
      simLastDateRef.current = new Date(last.time + 'T00:00:00Z');
    }

    skipAnimationRef.current = false;
    setCandleData(candles);
    setAreaData(area);
    setDataSource('generated');
    loadedStartRef.current = null;
    loadedEndRef.current = null;
    hasMoreLeftRef.current = true;
    onClearSelection?.();
    setError(null);
  }, [mockYears, mockMonths, mockDays, stopLiveSim, onClearSelection]); // chartIntervalRef is a ref, not listed

  // Re-generate mock data when the interval changes (same as real data re-fetch)
  useEffect(() => {
    if (dataSource === 'generated') handleGenerateMock();
  }, [chartInterval]); // eslint-disable-line react-hooks/exhaustive-deps

  // Single stable tick function — reads everything from refs so it never goes stale
  const doSimTick = useCallback(() => {
    if (!seriesRef.current) return;

    const stepDays = INTERVAL_STEP[chartIntervalRef.current];
    const open = simLastPriceRef.current;
    const close = parseFloat(
      Math.max(open * (1 + (Math.random() - 0.5) * 0.06), 0.01).toFixed(2)
    );
    const high = parseFloat(
      (Math.max(open, close) * (1 + Math.random() * 0.02)).toFixed(2)
    );
    const low = parseFloat(
      (Math.min(open, close) * (1 - Math.random() * 0.02)).toFixed(2)
    );

    simLastDateRef.current = new Date(
      simLastDateRef.current.getTime() + stepDays * 86_400_000
    );
    const time = simLastDateRef.current.toISOString().slice(0, 10);
    const candle = {
      time,
      open: parseFloat(open.toFixed(2)),
      high,
      low,
      close
    };
    const area = { time, value: close };

    try {
      seriesRef.current.update(chartTypeRef.current === 'area' ? area : candle);
    } catch {
      /* series may have been replaced */
    }

    setCandleData((prev) => [...prev, candle]);
    setAreaData((prev) => [...prev, area]);
    simLastPriceRef.current = close;
  }, []); // all state is accessed via stable refs

  // Drives the simulation interval. Re-runs when speed changes → instant update.
  useEffect(() => {
    if (!isLiveSimulating) return;
    const id = setInterval(doSimTick, simSpeed);
    return () => clearInterval(id);
  }, [isLiveSimulating, simSpeed, doSimTick]);

  const startLiveSim = useCallback(() => {
    if (isLiveSimRef.current) return;
    if (candleData.length === 0) handleGenerateMock();
    isLiveSimRef.current = true;
    setIsLiveSimulating(true);
    setDataSource('generated');
  }, [candleData.length, handleGenerateMock]);

  const handleToggleChartType = () => {
    setChartType((prev) => (prev === 'area' ? 'candle' : 'area'));
  };

  // ========== Chart Initialization ==========
  useEffect(() => {
    if (!chartContainerRef.current || !isClient) return;
    if (chartRef.current) return;

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
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor }
      },
      timeScale: { borderColor: colors.borderColor },
      rightPriceScale: { borderColor: colors.borderColor },
      crosshair: { mode: CrosshairMode.Normal },
      trackingMode: { exitMode: TrackingModeExitMode.OnTouchEnd }
    });

    chartRef.current = chart;

    // Crosshair overlay
    chart.subscribeCrosshairMove((param: any) => {
      if (!param.time || !param.seriesData || !seriesRef.current) return;
      const data = param.seriesData.get(seriesRef.current);
      if (!data) return;

      if (data.open !== undefined) {
        setOhlcData({
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          time: param.time
        });
      } else if (data.value !== undefined) {
        setAreaDisplayData({ value: data.value, time: param.time });
      }
    });

    // Restore crosshair after double-click fitContent
    const handleDblClick = () => {
      chart.applyOptions({ crosshair: { mode: CrosshairMode.Normal } });
    };
    chartContainerRef.current.addEventListener('dblclick', handleDblClick);

    // Infinite pan: watch the logical range
    chart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
      if (!range) return;

      const total = activeDataRef.current.length;

      // Near the left edge → load older data
      if (
        range.from < LOAD_MORE_THRESHOLD &&
        !isFetchingMoreRef.current &&
        hasMoreLeftRef.current
      ) {
        loadMoreLeftRef.current();
      }

      // Near the right edge → load newer data
      if (
        range.to > total - LOAD_MORE_THRESHOLD &&
        !isFetchingMoreRef.current &&
        hasMoreRightRef.current
      ) {
        loadMoreRightRef.current();
      }
    });

    // Resize handlers
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
        applyResponsiveRange();
      }
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        });
        applyResponsiveRange();
      }
    });
    if (chartContainerRef.current)
      resizeObserver.observe(chartContainerRef.current);

    return () => {
      chartContainerRef.current?.removeEventListener(
        'dblclick',
        handleDblClick
      );
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [isClient, theme, applyResponsiveRange]);

  // ========== Active dataset ==========
  const activeData = chartType === 'area' ? areaData : candleData;

  // ========== Chart Series Update Effect ==========
  useEffect(() => {
    if (!chartRef.current || !isClient) return;
    // During live simulation candles are pushed via series.update() directly;
    // running setData here would recreate the series and cause a visible flash.
    if (isLiveSimRef.current) return;

    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    const isPrepend = skipAnimationRef.current;
    skipAnimationRef.current = false;

    /**
     * Instantly render data and set the correct visible range.
     * For prepend operations we restore the previously saved time range so
     * the viewport doesn't jump to the newly loaded older candles.
     */
    const applyData = (data: any[], series: any) => {
      // Deduplicate by time string, keep the last occurrence, then sort ascending.
      // Guards against duplicate DB rows (e.g. seeder + backfill both ran).
      const seen = new Map<string, any>();
      for (const bar of data) seen.set(bar.time as string, bar);
      const clean = Array.from(seen.values()).sort((a, b) =>
        (a.time as string) < (b.time as string)
          ? -1
          : (a.time as string) > (b.time as string)
            ? 1
            : 0
      );

      activeDataRef.current = clean;
      series.setData(clean);

      if (isPrepend && restoreTimeRangeRef.current) {
        // Restore the exact time range the user was looking at before the prepend.
        const savedRange = restoreTimeRangeRef.current;
        restoreTimeRangeRef.current = null;
        requestAnimationFrame(() => {
          try {
            chartRef.current?.timeScale().setVisibleRange(savedRange);
          } catch {
            /* chart may have been destroyed */
          }
        });
      } else {
        applyResponsiveRange(data);
      }
    };

    if (chartType === 'area') {
      setOhlcData(null);
      const areaSeries = chartRef.current.addSeries(AreaSeries, {
        lineColor: colors.areaLine,
        topColor: colors.areaTop,
        bottomColor: colors.areaBottom
      });
      seriesRef.current = areaSeries;
      applyData(areaData, areaSeries);

      if (areaData.length > 0) {
        const last = areaData[areaData.length - 1];
        setAreaDisplayData({ value: last.value, time: last.time });
      }
    } else {
      setAreaDisplayData(null);
      const candleSeries = chartRef.current.addSeries(CandlestickSeries, {
        upColor: candleColors.up,
        downColor: candleColors.down,
        borderVisible: false,
        wickUpColor: candleColors.up,
        wickDownColor: candleColors.down
      });
      seriesRef.current = candleSeries;
      applyData(candleData, candleSeries);

      if (candleData.length > 0) {
        const last = candleData[candleData.length - 1];
        setOhlcData({
          open: last.open,
          high: last.high,
          low: last.low,
          close: last.close,
          time: last.time
        });
      }
    }
  }, [chartType, isClient, activeData, theme, colors]);

  // ========== Theme Update Effect ==========
  useEffect(() => {
    if (chartRef.current && isClient) {
      chartRef.current.applyOptions({
        layout: {
          textColor: colors.textColor,
          background: { type: ColorType.Solid, color: colors.background }
        },
        grid: {
          vertLines: { color: colors.gridColor },
          horzLines: { color: colors.gridColor }
        },
        timeScale: { borderColor: colors.borderColor },
        rightPriceScale: { borderColor: colors.borderColor }
      });
    }
  }, [theme, isClient, colors]);

  // ========== Auto-fetch on symbol change ==========
  useEffect(() => {
    if (symbol) {
      loadInitialData(symbol, chartInterval);
    }
  }, [symbol]); // eslint-disable-line react-hooks/exhaustive-deps

  // ========== Re-fetch / re-generate on interval change ==========
  useEffect(() => {
    if (dataSource === 'realtime' && symbol) {
      loadInitialData(symbol, chartInterval);
    }
    // generated case is handled by the effect inside the mock handlers section
  }, [chartInterval]); // eslint-disable-line react-hooks/exhaustive-deps

  // ========== Crosshair toggle ==========
  useEffect(() => {
    if (!chartRef.current || !isClient) return;
    chartRef.current.applyOptions({
      crosshair: {
        mode: isCrosshairVisible ? CrosshairMode.Normal : CrosshairMode.Hidden
      },
      trackingMode: {
        exitMode: isCrosshairVisible
          ? TrackingModeExitMode.OnTouchEnd
          : TrackingModeExitMode.OnNextTap
      }
    });
  }, [isCrosshairVisible, isClient]);

  // ========== Currency IDs for trade modal ==========
  useEffect(() => {
    if (!symbol) return;

    setUsdCurrencyId(null);
    setSymbolCurrencyId(null);
    setSymbolPrecision(8);

    fetchCurrencyId('USD')
      .then(setUsdCurrencyId)
      .catch(() => setUsdCurrencyId(null));

    fetchCurrencies()
      .then((currencies) => {
        const match = currencies.find(
          (c) => c.symbol.toUpperCase() === symbol.toUpperCase()
        );
        if (match) {
          setSymbolCurrencyId(match.id.toString());
          setSymbolPrecision(match.precision);
        }
      })
      .catch(() => setSymbolCurrencyId(null));
  }, [symbol]);

  // ========== Shared interval button renderer ==========
  const intervalButtons = (size: 'sm' | 'md') =>
    CHART_INTERVALS.map((iv) => (
      <button
        key={iv}
        onClick={() => setChartInterval(iv)}
        disabled={isLoading}
        className={`${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} rounded-lg font-medium transition-all disabled:opacity-50 ${
          chartInterval === iv
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border border-border text-muted-foreground hover:bg-muted'
        }`}
      >
        {iv}
      </button>
    ));

  // ========== Render ==========
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ── Mobile toolbar ── */}
      <div className="flex md:hidden items-center gap-1.5 px-2 py-1.5 shrink-0 border-b border-border">
        {/* Crosshair */}
        <button
          onClick={() => setIsCrosshairVisible((v) => !v)}
          title={isCrosshairVisible ? 'Hide crosshair' : 'Show crosshair'}
          className={`p-2 rounded-lg border transition-all ${
            isCrosshairVisible
              ? 'border-primary/50 bg-primary/10 text-primary'
              : 'border-border bg-card text-muted-foreground'
          }`}
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
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="7" />
            <line x1="12" y1="17" x2="12" y2="22" />
            <line x1="2" y1="12" x2="7" y2="12" />
            <line x1="17" y1="12" x2="22" y2="12" />
          </svg>
        </button>

        {/* Regenerate (mobile: just generates with current settings) */}
        <button
          onClick={handleGenerateMock}
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

        {/* Interval buttons */}
        <div className="flex gap-0.5">{intervalButtons('sm')}</div>

        {/* Source badge */}
        <div className="px-2 py-1 text-xs bg-card border border-border rounded-lg text-muted-foreground">
          {dataSource === 'realtime' ? symbol : 'Mock'}
        </div>

        {/* Color legend + toggle */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-card border border-border rounded-lg">
          <div
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: candleColors.up }}
          />
          <div
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: candleColors.down }}
          />
        </div>
        <button
          onClick={() => setUseThemeColors(!useThemeColors)}
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

      {/* ── Desktop toolbar ── */}
      <div className="hidden md:flex m-3 flex-wrap gap-2 shrink-0">
        {/* Crosshair */}
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

        {/* Mock generator toggle */}
        <button
          onClick={() => setShowMockPanel((v) => !v)}
          disabled={isLoading}
          className={`px-4 py-2 text-sm rounded-lg border transition-all flex items-center gap-2 ${
            showMockPanel
              ? 'bg-primary/10 border-primary/50 text-primary'
              : 'bg-card border-border text-muted-foreground hover:bg-muted'
          }`}
        >
          Mock data
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {showMockPanel ? (
              <polyline points="18 15 12 9 6 15" />
            ) : (
              <polyline points="6 9 12 15 18 9" />
            )}
          </svg>
        </button>

        {/* Chart type */}
        <button
          onClick={handleToggleChartType}
          disabled={isLoading}
          className="px-4 py-2 text-sm border border-primary/30 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Switch to {chartType === 'area' ? 'Candlestick' : 'Area'} Chart
        </button>

        {/* Interval buttons */}
        <div className="flex gap-1">{intervalButtons('md')}</div>

        {/* Source indicator */}
        <div className="flex items-center px-3 py-2 text-sm bg-card border border-border rounded-lg">
          <span className="text-muted-foreground">Source:</span>
          <span className="ml-2 font-semibold text-foreground">
            {dataSource === 'realtime' ? `Real (${symbol})` : 'Generated'}
          </span>
        </div>

        {/* Color legend */}
        <div className="flex items-center gap-4 px-3 py-2 text-sm bg-card border border-border rounded-lg">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: candleColors.up }}
            />
            <span className="text-muted-foreground">Bullish</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: candleColors.down }}
            />
            <span className="text-muted-foreground">Bearish</span>
          </div>
        </div>

        {/* Color toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Standard</span>
          <button
            onClick={() => setUseThemeColors(!useThemeColors)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${useThemeColors ? 'bg-[rgb(var(--color-success)/1)]' : 'bg-[#94a3b8]'}`}
            title={
              isClient
                ? useThemeColors
                  ? 'Using theme colors'
                  : 'Using standard colors'
                : 'Toggle colors'
            }
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useThemeColors ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
          <span className="text-xs text-muted-foreground">Theme</span>
        </div>

        {/* Buy / Sell */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              if (!isLoggedIn) setShowAuthDialog(true);
              else setTradeMode('buy');
            }}
            disabled={
              !isClient || !symbol || dataSource !== 'realtime' || isLoading
            }
            title={
              !isClient
                ? 'Loading…'
                : !symbol
                  ? 'Select an asset first'
                  : dataSource !== 'realtime'
                    ? 'Switch to real data first'
                    : !isLoggedIn
                      ? 'Sign in to buy'
                      : 'Buy this asset'
            }
            className="px-4 py-2 text-sm rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-[rgb(var(--color-success)/1)] hover:bg-[rgb(var(--color-success)/0.75)]"
          >
            Buy
          </button>
          <button
            onClick={() => {
              if (!isLoggedIn) setShowAuthDialog(true);
              else setTradeMode('sell');
            }}
            disabled={
              !isClient || !symbol || dataSource !== 'realtime' || isLoading
            }
            title={
              !isClient
                ? 'Loading…'
                : !symbol
                  ? 'Select an asset first'
                  : dataSource !== 'realtime'
                    ? 'Switch to real data first'
                    : !isLoggedIn
                      ? 'Sign in to sell'
                      : 'Sell this asset'
            }
            className="px-4 py-2 text-sm rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-[rgb(var(--color-danger)/1)] hover:bg-[rgb(var(--color-danger)/0.75)]"
          >
            Sell
          </button>
        </div>

        {/* Auth gate dialog */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-xl">Sign in to trade</DialogTitle>
              <DialogDescription>
                You need an account to buy or sell assets. It&apos;s free to get
                started.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-col gap-2 pt-2">
              <Button className="w-full" asChild>
                <Link
                  href="/auth/login"
                  onClick={() => setShowAuthDialog(false)}
                >
                  Log In
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link
                  href="/auth/register"
                  onClick={() => setShowAuthDialog(false)}
                >
                  Create Account
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Mock generator panel (desktop, below toolbar) ── */}
      {showMockPanel && (
        <div className="hidden md:flex items-center gap-3 px-4 pb-2 shrink-0 flex-wrap">
          {/* Range inputs */}
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
            <span className="text-xs text-muted-foreground">Range</span>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="number"
                min={0}
                max={100}
                value={mockYears}
                onChange={(e) => setMockYears(Math.max(0, +e.target.value))}
                className="w-10 bg-transparent text-foreground text-center outline-none border-b border-border focus:border-primary"
              />
              <span className="text-muted-foreground">yr</span>
            </label>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="number"
                min={0}
                max={11}
                value={mockMonths}
                onChange={(e) => setMockMonths(Math.max(0, +e.target.value))}
                className="w-10 bg-transparent text-foreground text-center outline-none border-b border-border focus:border-primary"
              />
              <span className="text-muted-foreground">mo</span>
            </label>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="number"
                min={0}
                max={365}
                value={mockDays}
                onChange={(e) => setMockDays(Math.max(0, +e.target.value))}
                className="w-10 bg-transparent text-foreground text-center outline-none border-b border-border focus:border-primary"
              />
              <span className="text-muted-foreground">d</span>
            </label>
          </div>

          {/* Generate static data */}
          <button
            onClick={handleGenerateMock}
            className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-all"
          >
            Generate
          </button>

          {/* Speed control */}
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
            <span className="text-xs text-muted-foreground">Speed</span>
            <input
              type="range"
              min={50}
              max={2000}
              step={50}
              value={simSpeed}
              onChange={(e) => setSimSpeed(+e.target.value)}
              className="w-24 accent-primary"
            />
            {/* Decrement */}
            <button
              onClick={() => setSimSpeed((v) => Math.max(50, v - 50))}
              className="w-5 h-5 flex items-center justify-center rounded border border-border bg-muted hover:bg-muted/70 text-foreground transition-colors"
              title="Decrease speed by 50ms"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            {/* Editable value */}
            <input
              type="number"
              min={50}
              max={2000}
              step={50}
              value={simSpeed}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v)) setSimSpeed(Math.min(2000, Math.max(50, v)));
              }}
              onBlur={(e) => {
                const v = parseInt(e.target.value, 10);
                setSimSpeed(isNaN(v) ? 300 : Math.min(2000, Math.max(50, v)));
              }}
              className="w-14 text-xs text-center bg-transparent border-b border-border focus:border-primary outline-none text-foreground"
            />
            <span className="text-xs text-muted-foreground">ms/bar</span>
            {/* Increment */}
            <button
              onClick={() => setSimSpeed((v) => Math.min(2000, v + 50))}
              className="w-5 h-5 flex items-center justify-center rounded border border-border bg-muted hover:bg-muted/70 text-foreground transition-colors"
              title="Increase speed by 50ms"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {/* Live play / stop */}
          {isLiveSimulating ? (
            <button
              onClick={stopLiveSim}
              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 text-white bg-[rgb(var(--color-danger)/1)] hover:bg-[rgb(var(--color-danger)/0.8)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="4" y="4" width="16" height="16" />
              </svg>
              Stop
            </button>
          ) : (
            <button
              onClick={startLiveSim}
              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 text-white bg-[rgb(var(--color-success)/1)] hover:bg-[rgb(var(--color-success)/0.8)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Live
            </button>
          )}

          {/* Live indicator dot */}
          {isLiveSimulating && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-[rgb(var(--color-danger)/1)] animate-pulse" />
              Simulating…
            </div>
          )}
        </div>
      )}

      {/* Trade notification */}
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
              ? (() => {
                  const r = tradeNotification.result as BuyResult;
                  const exact =
                    'received_exact' in r && r.received_exact
                      ? r.received_exact
                      : (
                          Number(r.received) / Math.pow(10, symbolPrecision)
                        ).toFixed(symbolPrecision);
                  return `✓ Bought ${symbol} — received ${exact} ${symbol}`;
                })()
              : (() => {
                  const r = tradeNotification.result as SellResult;
                  const dollars = (
                    parseInt(r.received, 10) / 100
                  ).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  });
                  return `✓ Sold ${symbol} — received $${dollars} USD`;
                })()}
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

      {/* Error message */}
      {error && (
        <div className="m-2 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 text-sm shrink-0">
          {error}
        </div>
      )}

      {/* Chart area */}
      <div className="relative w-full flex-1 min-h-0">
        <div
          ref={chartContainerRef}
          className="w-full h-full rounded-2xl overflow-hidden"
        />

        {/* Loading indicator for pan fetches */}
        {isLoading && (
          <div className="absolute top-2 right-2 z-20 px-2 py-1 text-xs bg-card/90 border border-border rounded-lg text-muted-foreground">
            Loading…
          </div>
        )}

        {/* OHLC overlay */}
        {ohlcData &&
          chartType === 'candle' &&
          (() => {
            const { changeAmount, changePercent, isPositive } =
              calculateOHLCChange(ohlcData, candleData);
            return (
              <ChartOverlay
                type="ohlc"
                data={{
                  symbol,
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
                interval={chartInterval}
              />
            );
          })()}

        {/* Area overlay */}
        {areaDisplayData &&
          chartType === 'area' &&
          (() => {
            const { changeAmount, changePercent, isPositive } =
              calculateAreaChange(areaDisplayData, areaData);
            return (
              <ChartOverlay
                type="simple"
                data={{
                  symbol,
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
                interval={chartInterval}
              />
            );
          })()}
      </div>

      {/* Trade modal */}
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
          targetPrecision={symbolPrecision}
          token={token ?? ''}
          onClose={() => setTradeMode(null)}
          onSuccess={(result) => {
            setTradeNotification({ type: tradeMode, result });
            setTradeMode(null);
            setTimeout(() => setTradeNotification(null), 5000);
          }}
        />
      )}
    </div>
  );
}
