/**
 * Chart Crosshair Overlay Component
 *
 * Displays price data and market information when the user touches or hovers
 * over chart data points. Supports a collapsible two-row layout so it doesn't
 * cover the chart on small screens.
 *
 * Layout:
 *   Row 1 (always visible): Logo · Name · Date · Interval · [toggle btn]
 *   Row 2 (collapsible):    O/H/L/C  or  single value  · change indicator
 */

'use client';

import { useState } from 'react';
import StockLogo from './StockLogo';

interface ChartOverlayProps {
  type: 'ohlc' | 'simple';
  data: {
    symbol: string;
    assetName: string;
    time?: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    value?: number;
  };
  interval: string;
  changeAmount: number;
  changePercent: number;
  isPositive: boolean;
  upColor: string;
  downColor: string;
}

const ChartOverlay = ({
  type,
  data,
  changeAmount,
  changePercent,
  isPositive,
  upColor,
  downColor,
  interval
}: ChartOverlayProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const indicatorColor = isPositive ? upColor : downColor;

  return (
    <div
      className="absolute top-2 left-2 z-10 font-mono bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg"
      style={{ maxWidth: 'calc(100vw - 4rem)' }}
    >
      {/* ── Row 1: identity + date + interval + collapse toggle ── */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 text-xs">
        {/* Logo + name */}
        {data.assetName === 'generated' ? (
          <span className="text-muted-foreground shrink-0">Generated</span>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <StockLogo ticker={data.symbol} />
            <span className="text-muted-foreground truncate max-w-[7rem]">
              {data.assetName}
            </span>
          </div>
        )}

        {/* Date */}
        {data.time && (
          <span className="text-muted-foreground shrink-0">{data.time}</span>
        )}

        {/* Interval */}
        <span className="text-muted-foreground font-medium shrink-0">
          {interval}
        </span>

        {/* When collapsed: show compact change indicator inline */}
        {isCollapsed && (
          <span
            style={{ color: indicatorColor }}
            className="font-semibold shrink-0 ml-1"
          >
            {isPositive ? '▲' : '▼'} {Math.abs(changeAmount).toFixed(2)} (
            {isPositive ? '+' : ''}
            {changePercent.toFixed(2)}%)
          </span>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setIsCollapsed((v) => !v)}
          className="ml-auto shrink-0 text-muted-foreground hover:text-foreground transition-colors pointer-events-auto"
          title={isCollapsed ? 'Expand' : 'Collapse'}
          aria-label={isCollapsed ? 'Expand overlay' : 'Collapse overlay'}
        >
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
            {isCollapsed ? (
              <polyline points="6 9 12 15 18 9" />
            ) : (
              <polyline points="18 15 12 9 6 15" />
            )}
          </svg>
        </button>
      </div>

      {/* ── Row 2: price data + change indicator ── */}
      {!isCollapsed && (
        <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 px-2.5 pb-1.5 text-xs">
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

          {type === 'simple' && (
            <span className="text-foreground font-bold">
              {data.value?.toFixed(2)}
            </span>
          )}

          <span style={{ color: indicatorColor }} className="font-semibold">
            {isPositive ? '▲' : '▼'} {Math.abs(changeAmount).toFixed(2)} (
            {isPositive ? '+' : ''}
            {changePercent.toFixed(2)}%)
          </span>
        </div>
      )}
    </div>
  );
};

export default ChartOverlay;
