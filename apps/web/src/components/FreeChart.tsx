'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AreaSeries,
  ColorType,
  CrosshairMode,
  createChart
} from 'lightweight-charts';
import { Lock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { CHART_THEMES } from '@/lib/chartThemes';
import { cn } from '@/lib/utils';
import {
  createSimulator,
  generateCandlestickData,
  type Simulator
} from '@/lib/dataGenerator';
import { fetchCurrency, fetchCurrencyHistory } from '@/lib/marketApi';
import {
  fetchCurrencies,
  fetchCurrencyId,
  type BuyResult,
  type SellResult
} from '@/lib/tradeApi';
import TradeModal from '@/components/TradeModal';
import { getToken } from '@/lib/actions';

// ─── Config ───────────────────────────────────────────────────────────────────

const GENERATED_COLOR = '#06b6d4'; // cyan — distinct from all three asset colors

const FREE_ASSETS = [
  { name: 'Apple Inc.', symbol: 'AAPL', initialPrice: 185, color: '#3b82f6' }, // blue
  {
    name: 'Alphabet Inc.',
    symbol: 'GOOGL',
    initialPrice: 140,
    color: '#f97316'
  }, // orange
  { name: 'NVIDIA Corp.', symbol: 'NVDA', initialPrice: 495, color: '#a855f7' } // purple
];

const GENERATE_PERIODS = [
  { label: '1Y', days: 365 },
  { label: '2Y', days: 730 },
  { label: '3Y', days: 1095 }
];

const WINDOW_DAYS = 365;
const LOAD_MORE_THRESHOLD = 20;
const SIM_INTERVAL_MS = 1000;

// localStorage key per period (generated data is not tied to a real symbol)
const genStorageKey = (days: number) => `freechart_generated_${days}`;

// ─── Types ────────────────────────────────────────────────────────────────────

type DataMode = 'real' | 'generated';
type AreaRow = { time: string; value: number };

interface Props {
  selectedSymbol?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safe ISO-date extractor that handles string, number, or Date timestamps. */
function toDateStr(ts: unknown): string {
  if (typeof ts === 'string') return ts.slice(0, 10);
  return new Date(ts as string | number).toISOString().slice(0, 10);
}

function dedup(rows: AreaRow[]): AreaRow[] {
  const seen = new Map<string, AreaRow>();
  for (const r of rows) seen.set(r.time, r);
  return Array.from(seen.values()).sort((a, b) => (a.time < b.time ? -1 : 1));
}

function fmtPrice(v: number): string {
  return v >= 1_000 ? `$${(v / 1_000).toFixed(2)}k` : `$${v.toFixed(2)}`;
}
function fmtPct(v: number): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}
function fmtDate(s: string): string {
  const [y, m, d] = s.split('-').map(Number);
  const mo = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ][m - 1];
  return `${d} ${mo} ${y}`;
}

function loadCachedRows(days: number): AreaRow[] | null {
  try {
    const raw = localStorage.getItem(genStorageKey(days));
    if (!raw) return null;
    return JSON.parse(raw) as AreaRow[];
  } catch {
    return null;
  }
}

function saveCachedRows(days: number, rows: AreaRow[]): void {
  try {
    localStorage.setItem(genStorageKey(days), JSON.stringify(rows));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function FreeChart({ selectedSymbol }: Props) {
  const { theme, colorTheme } = useTheme();
  const colors =
    CHART_THEMES[colorTheme]?.[theme] ?? CHART_THEMES.MIDNIGHT[theme];

  const activeAsset =
    FREE_ASSETS.find((a) => a.symbol === selectedSymbol) ?? FREE_ASSETS[0];

  // ── State ──────────────────────────────────────────────────────────────────
  const [isClient, setIsClient] = useState(false);
  const [dataMode, setDataMode] = useState<DataMode>('real');
  const [generateDays, setGenerateDays] = useState(365);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Price overlay
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<string | null>(null);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [firstPrice, setFirstPrice] = useState<number | null>(null);

  // Trade
  const [token, setToken] = useState<string | null>(null);
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell' | null>(null);
  const [usdCurrencyId, setUsdCurrencyId] = useState<string | null>(null);
  const [symbolCurrencyId, setSymbolCurrencyId] = useState<string | null>(null);
  const [symbolPrecision, setSymbolPrecision] = useState<number>(2);

  // Trade notification
  const [tradeNotif, setTradeNotif] = useState<{
    type: 'buy' | 'sell';
    result: BuyResult | SellResult;
  } | null>(null);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const activeDataRef = useRef<AreaRow[]>([]);

  const loadedStartRef = useRef<Date | null>(null);
  const loadedEndRef = useRef<Date | null>(null);
  const isFetchingRef = useRef(false);
  const hasMoreLeftRef = useRef(true);
  const loadMoreLeftRef = useRef<() => void>(() => {});
  const loadMoreRightRef = useRef<() => void>(() => {});

  const precisionRef = useRef<Record<string, number>>({});
  const simulatorRef = useRef<Simulator | null>(null);
  const simDateRef = useRef<Date>(new Date());
  const activeAssetRef = useRef(activeAsset);
  const dataModeRef = useRef(dataMode);

  // Track prev symbol in the color/series effect to avoid setting stale data
  const prevColorSymbolRef = useRef('');

  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    activeAssetRef.current = activeAsset;
  }, [activeAsset]);
  useEffect(() => {
    dataModeRef.current = dataMode;
  }, [dataMode]);

  // Auth token
  useEffect(() => {
    getToken()
      .then(setToken)
      .catch(() => setToken(null));
  }, []);

  const isLoggedIn = isClient && !!token;

  // ── Currency IDs for trading ───────────────────────────────────────────────
  useEffect(() => {
    setUsdCurrencyId(null);
    setSymbolCurrencyId(null);
    setSymbolPrecision(2);
    fetchCurrencyId('USD')
      .then(setUsdCurrencyId)
      .catch(() => {});
    fetchCurrencies()
      .then(
        (
          currencies: {
            id: number | string;
            symbol: string;
            precision: number;
          }[]
        ) => {
          const match = currencies.find(
            (c: { symbol: string }) =>
              c.symbol.toUpperCase() === activeAsset.symbol.toUpperCase()
          );
          if (match) {
            setSymbolCurrencyId(match.id.toString());
            setSymbolPrecision(match.precision);
          }
        }
      )
      .catch(() => {});
  }, [activeAsset.symbol]);

  // ── Precision helper ───────────────────────────────────────────────────────
  const getPrecision = useCallback(async (symbol: string) => {
    if (precisionRef.current[symbol] !== undefined)
      return precisionRef.current[symbol];
    try {
      const c = await fetchCurrency(symbol);
      precisionRef.current[symbol] = c.precision;
      return c.precision;
    } catch {
      precisionRef.current[symbol] = 2;
      return 2;
    }
  }, []);

  // ── Load real data ─────────────────────────────────────────────────────────
  const loadData = useCallback(
    async (
      symbol: string,
      start: Date,
      end: Date,
      mode: 'replace' | 'prepend' | 'append'
    ) => {
      try {
        const precision = await getPrecision(symbol);
        const raw = await fetchCurrencyHistory(symbol, start, end);
        const rows: AreaRow[] = dedup(
          raw.map((e) => ({
            time: toDateStr(e.timestamp),
            value: Number(BigInt(e.close)) / 10 ** precision
          }))
        );

        if (mode === 'replace') {
          activeDataRef.current = rows;
          loadedStartRef.current = start;
          loadedEndRef.current = end;
          hasMoreLeftRef.current = rows.length >= 10;
          seriesRef.current?.setData(rows);
          if (rows.length > 0) {
            setLastPrice(rows[rows.length - 1].value);
            setFirstPrice(rows[0].value);
          }
        } else if (mode === 'prepend') {
          const merged = dedup([...rows, ...activeDataRef.current]);
          activeDataRef.current = merged;
          loadedStartRef.current = start;
          hasMoreLeftRef.current = rows.length >= 10;
          seriesRef.current?.setData(merged);
        } else {
          const merged = dedup([...activeDataRef.current, ...rows]);
          activeDataRef.current = merged;
          loadedEndRef.current = end;
          seriesRef.current?.setData(merged);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch data');
      }
    },
    [getPrecision]
  );

  // ── Pan callbacks ──────────────────────────────────────────────────────────
  useEffect(() => {
    loadMoreLeftRef.current = async () => {
      if (
        isFetchingRef.current ||
        !hasMoreLeftRef.current ||
        !loadedStartRef.current
      )
        return;
      if (dataModeRef.current !== 'real') return;
      isFetchingRef.current = true;
      const end = new Date(loadedStartRef.current);
      const start = new Date(end);
      start.setDate(start.getDate() - WINDOW_DAYS);
      await loadData(activeAssetRef.current.symbol, start, end, 'prepend');
      isFetchingRef.current = false;
    };
    loadMoreRightRef.current = async () => {
      if (isFetchingRef.current || !loadedEndRef.current) return;
      if (dataModeRef.current !== 'real') return;
      isFetchingRef.current = true;
      const start = new Date(loadedEndRef.current);
      await loadData(
        activeAssetRef.current.symbol,
        start,
        new Date(),
        'append'
      );
      isFetchingRef.current = false;
    };
  }, [loadData]);

  // ── Initial load when asset changes ───────────────────────────────────────
  useEffect(() => {
    if (!isClient || dataMode !== 'real') return;
    setIsLive(false);
    setIsLoading(true);
    setError(null);
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - WINDOW_DAYS);
    loadData(activeAsset.symbol, start, end, 'replace').finally(() =>
      setIsLoading(false)
    );
  }, [isClient, activeAsset.symbol, dataMode, loadData]);

  // ── Switch to real data when a new asset is picked from AssetNav ───────────
  const prevSymbolRef = useRef(selectedSymbol);
  useEffect(() => {
    if (selectedSymbol && selectedSymbol !== prevSymbolRef.current) {
      prevSymbolRef.current = selectedSymbol;
      setDataMode('real');
      setIsLive(false);
    }
  }, [selectedSymbol]);

  // ── Chart init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current || !isClient) return;
    if (chartRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        textColor: colors.textColor,
        background: { type: ColorType.Solid, color: colors.background }
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor }
      },
      timeScale: { borderColor: colors.borderColor },
      rightPriceScale: { borderColor: colors.borderColor },
      crosshair: { mode: CrosshairMode.Normal }
    });

    chart.subscribeCrosshairMove((param: any) => {
      if (!param.time || !seriesRef.current) {
        setHoverPrice(null);
        setHoverTime(null);
        return;
      }
      const d = param.seriesData?.get(seriesRef.current);
      if (d?.value !== undefined) {
        setHoverPrice(d.value);
        setHoverTime(typeof param.time === 'string' ? param.time : null);
      }
    });

    chart.timeScale().subscribeVisibleLogicalRangeChange((range: any) => {
      if (!range) return;
      const total = activeDataRef.current.length;
      if (range.from < LOAD_MORE_THRESHOLD) loadMoreLeftRef.current();
      if (range.to > total - LOAD_MORE_THRESHOLD) loadMoreRightRef.current();
    });

    const ro = new ResizeObserver(() => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        });
      }
    });
    ro.observe(chartContainerRef.current);

    chartRef.current = chart;
    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [isClient]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Theme/asset color updates ──────────────────────────────────────────────
  // When symbol changes, clear stale data so the new asset's data loading
  // effects can repopulate without hitting the "duplicate timestamps" assertion.
  useEffect(() => {
    if (!chartRef.current || !isClient) return;

    chartRef.current.applyOptions({
      layout: {
        textColor: colors.textColor,
        background: { type: ColorType.Solid, color: colors.background }
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor }
      }
    });

    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }
    // Use the asset color; generated-mode color will be applied by the separate effect below
    const s = chartRef.current.addSeries(AreaSeries, {
      lineColor: activeAsset.color,
      topColor: activeAsset.color + '55',
      bottomColor: activeAsset.color + '08'
    });
    seriesRef.current = s;

    const symbolChanged = prevColorSymbolRef.current !== activeAsset.symbol;
    prevColorSymbolRef.current = activeAsset.symbol;

    if (symbolChanged) {
      // Clear stale data — data loading effects will repopulate for the new asset
      activeDataRef.current = [];
    } else if (activeDataRef.current.length > 0) {
      // Theme-only change: restore the existing data on the new series instance
      s.setData(dedup(activeDataRef.current));
    }
  }, [isClient, activeAsset.symbol, colors]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Series color: update when dataMode or asset changes ───────────────────
  // Runs after the series-recreation effect; series is already mounted.
  useEffect(() => {
    if (!seriesRef.current) return;
    const color =
      dataMode === 'generated' ? GENERATED_COLOR : activeAsset.color;
    seriesRef.current.applyOptions({
      lineColor: color,
      topColor: color + '55',
      bottomColor: color + '08'
    });
  }, [dataMode, activeAsset.color]);

  // ── Apply generated data helper ────────────────────────────────────────────
  const applyGeneratedRows = useCallback((rows: AreaRow[], days: number) => {
    activeDataRef.current = rows;
    loadedStartRef.current = null;
    loadedEndRef.current = null;
    seriesRef.current?.setData(rows);
    chartRef.current?.timeScale().fitContent();
    if (rows.length > 0) {
      setLastPrice(rows[rows.length - 1].value);
      setFirstPrice(rows[0].value);
      simDateRef.current = new Date(rows[rows.length - 1].time + 'T00:00:00Z');
      simulatorRef.current = createSimulator(rows[rows.length - 1].value);
    }
    setGenerateDays(days);
    setDataMode('generated');
  }, []);

  // ── Generate mock data ─────────────────────────────────────────────────────
  // Always generates fresh data for the given period and saves it to localStorage.
  const handleGenerate = useCallback(
    (days: number) => {
      setIsLive(false);
      setError(null);
      const start = new Date();
      start.setDate(start.getDate() - days);
      const candles = generateCandlestickData(
        days,
        start,
        activeAsset.initialPrice
      );
      const rows: AreaRow[] = candles.map((c) => ({
        time: c.time,
        value: c.close
      }));
      saveCachedRows(days, rows);
      applyGeneratedRows(rows, days);
    },
    [activeAsset, applyGeneratedRows]
  );

  // ── Load cached or generate for period button click ────────────────────────
  // Prefers cached data so that existing generated data isn't wiped by
  // switching periods. Only generates fresh data if no cache exists.
  const handleSelectPeriod = useCallback(
    (days: number) => {
      setIsLive(false);
      setError(null);
      const cached = loadCachedRows(days);
      if (cached && cached.length > 0) {
        applyGeneratedRows(cached, days);
      } else {
        handleGenerate(days);
      }
    },
    [applyGeneratedRows, handleGenerate]
  );

  // ── Live sim ───────────────────────────────────────────────────────────────
  // Keep a ref to generateDays so the interval closure can access the current value
  const generateDaysRef = useRef(generateDays);
  useEffect(() => {
    generateDaysRef.current = generateDays;
  }, [generateDays]);

  useEffect(() => {
    if (!isLive || dataMode !== 'generated') return;
    const id = setInterval(() => {
      if (!seriesRef.current || !simulatorRef.current) return;
      simDateRef.current = new Date(simDateRef.current.getTime() + 86_400_000);
      const time = simDateRef.current.toISOString().split('T')[0];
      const candle = simulatorRef.current.nextCandle(time, 1);
      const bar: AreaRow = { time, value: candle.close };
      activeDataRef.current = [...activeDataRef.current, bar];
      seriesRef.current.update(bar);
      setLastPrice(candle.close);
      // Persist the live-extended data so it survives a pause/resume
      saveCachedRows(generateDaysRef.current, activeDataRef.current);
    }, SIM_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isLive, dataMode]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const displayPrice = hoverPrice ?? lastPrice;
  const priceChange =
    lastPrice !== null && firstPrice !== null
      ? ((lastPrice - firstPrice) / firstPrice) * 100
      : null;
  const isPositive = (priceChange ?? 0) >= 0;

  const canTrade =
    isLoggedIn &&
    dataMode === 'real' &&
    !isLoading &&
    !!symbolCurrencyId &&
    !!usdCurrencyId;

  const tradeDisabledTitle = !isLoggedIn
    ? 'Sign in to trade'
    : dataMode !== 'real'
      ? 'Switch to real data to trade'
      : isLoading
        ? 'Loading…'
        : 'Trade';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: colors.background }}
    >
      {/* ── Main toolbar ── */}
      <div className="shrink-0 flex flex-wrap items-center gap-2 px-3 py-2 border-b border-border">
        {/* Generate period shortcuts — uses cache, only generates if no cache exists */}
        <div className="flex gap-0.5">
          {GENERATE_PERIODS.map((p) => (
            <button
              key={p.label}
              onClick={() => handleSelectPeriod(p.days)}
              className={cn(
                'px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all',
                dataMode === 'generated' && generateDays === p.days
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted'
              )}
              title={`Load ${p.label} of simulated data`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Re-generate with current period (always generates fresh + saves cache) */}
        <button
          onClick={() => handleGenerate(generateDays)}
          disabled={dataMode === 'real'}
          title={
            dataMode === 'real'
              ? 'Select a period (1Y / 2Y / 3Y) first'
              : 'Re-generate with current period'
          }
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium bg-card border border-border text-muted-foreground hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-3.17" />
          </svg>
          Generate
        </button>

        {/* Live — next to Generate */}
        <button
          onClick={() => setIsLive((v) => !v)}
          disabled={dataMode === 'real'}
          title={
            dataMode === 'real'
              ? 'Select a period (1Y / 2Y / 3Y) first'
              : isLive
                ? 'Pause simulation'
                : 'Start live simulation'
          }
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 disabled:cursor-not-allowed',
            isLive
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'
              : 'bg-card border-border text-muted-foreground hover:bg-muted disabled:hover:bg-card'
          )}
        >
          {isLive ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
          {isLive ? 'Pause' : 'Live'}
        </button>

        {/* Locked: Candlestick */}
        <button
          disabled
          title="Upgrade to Pro to unlock candlestick charts"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-muted-foreground/40 cursor-not-allowed select-none"
        >
          <Lock size={9} /> Candlestick
        </button>

        {/* Locked: Interval */}
        <button
          disabled
          title="Upgrade to Pro to unlock 1W / 1M intervals"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-muted-foreground/40 cursor-not-allowed select-none"
        >
          <Lock size={9} /> 1W / 1M
        </button>

        {/* Locked: Volume */}
        <button
          disabled
          title="Upgrade to Pro to unlock volume histogram"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-muted-foreground/40 cursor-not-allowed select-none"
        >
          <Lock size={9} /> Volume
        </button>

        {/* Locked: Speed */}
        <button
          disabled
          title="Upgrade to Pro to control simulation speed"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-border bg-card text-muted-foreground/40 cursor-not-allowed select-none"
        >
          <Lock size={9} /> 1s/bar
        </button>

        {/* Buy / Sell */}
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setTradeMode('buy')}
            disabled={!canTrade}
            title={canTrade ? 'Buy' : tradeDisabledTitle}
            className="px-3 py-1.5 text-xs rounded-lg text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-[rgb(var(--color-success)/1)] hover:bg-[rgb(var(--color-success)/0.75)]"
          >
            Buy
          </button>
          <button
            onClick={() => setTradeMode('sell')}
            disabled={!canTrade}
            title={canTrade ? 'Sell' : tradeDisabledTitle}
            className="px-3 py-1.5 text-xs rounded-lg text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-[rgb(var(--color-danger)/1)] hover:bg-[rgb(var(--color-danger)/0.75)]"
          >
            Sell
          </button>
        </div>
      </div>

      {/* ── Price overlay ── */}
      <div className="shrink-0 px-4 py-2 flex items-center gap-3 min-h-[3.5rem]">
        {isLoading ? (
          <span
            className="text-sm animate-pulse"
            style={{ color: colors.textColor, opacity: 0.4 }}
          >
            Loading…
          </span>
        ) : error ? (
          <span className="text-sm text-red-400">{error}</span>
        ) : displayPrice !== null ? (
          <>
            <div>
              <div
                className="text-[11px] uppercase tracking-wide font-medium"
                style={{ color: colors.textColor, opacity: 0.55 }}
              >
                {dataMode === 'generated'
                  ? 'Generated'
                  : `${activeAsset.name} · ${activeAsset.symbol}`}
                {isLive && (
                  <span className="ml-2 inline-flex items-center gap-1 normal-case tracking-normal">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-500 font-semibold">LIVE</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: activeAsset.color }}
                >
                  {fmtPrice(displayPrice)}
                </span>
                {priceChange !== null && !hoverPrice && (
                  <span
                    className={cn(
                      'text-sm font-semibold px-2 py-0.5 rounded-full',
                      isPositive
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : 'bg-red-500/15 text-red-400'
                    )}
                  >
                    {fmtPct(priceChange)}
                  </span>
                )}
                {hoverTime && (
                  <span
                    className="text-xs"
                    style={{ color: colors.textColor, opacity: 0.5 }}
                  >
                    {fmtDate(hoverTime)}
                  </span>
                )}
              </div>
            </div>

            {/* Trade notification */}
            {tradeNotif && (
              <div
                className={cn(
                  'ml-auto text-xs px-3 py-1.5 rounded-lg font-medium',
                  tradeNotif.type === 'buy'
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : 'bg-red-500/15 text-red-400'
                )}
              >
                {tradeNotif.type === 'buy' ? 'Buy' : 'Sell'} executed
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* ── Chart ── */}
      <div ref={chartContainerRef} className="flex-1 min-h-0" />

      {/* ── Pro upgrade banner ── */}
      <div className="shrink-0 flex flex-wrap items-center gap-2 px-4 py-2 border-t border-border bg-muted/20">
        <span className="text-[11px] text-muted-foreground font-medium mr-1">
          Upgrade to Pro:
        </span>
        {[
          'Candlestick charts',
          'Volume histogram',
          '1W / 1M / 1Y intervals',
          'Simulation speed control',
          'More assets'
        ].map((label) => (
          <span
            key={label}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/50"
          >
            <Lock size={9} />
            {label}
          </span>
        ))}
        <button className="ml-auto px-3 py-1 text-xs font-medium rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted transition-all">
          Upgrade
        </button>
      </div>

      {/* ── Trade modal ── */}
      {tradeMode && symbolCurrencyId && usdCurrencyId && (
        <TradeModal
          mode={tradeMode}
          symbol={activeAsset.symbol}
          fromCurrencyId={
            tradeMode === 'buy' ? usdCurrencyId : symbolCurrencyId
          }
          toCurrencyId={tradeMode === 'buy' ? symbolCurrencyId : usdCurrencyId}
          currentPrice={lastPrice ?? 0}
          targetPrecision={symbolPrecision}
          token={token ?? ''}
          onClose={() => setTradeMode(null)}
          onSuccess={(result) => {
            setTradeNotif({ type: tradeMode, result });
            setTradeMode(null);
            setTimeout(() => setTradeNotif(null), 5000);
          }}
        />
      )}
    </div>
  );
}
