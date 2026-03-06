'use client';

/**
 * TradeModal Component
 *
 * Modal dialog for placing a market buy or sell order on a selected asset.
 * Opened by the Buy / Sell buttons in TradingView and communicates directly
 * with the backend trade endpoints via tradeApi.
 *
 * Features:
 * - Buy and Sell modes with distinct theme colors (success / danger)
 * - Buy mode: toggle between "spend USD" and "buy by units"
 * - Live estimated outcome preview based on the last known price
 * - Minimum spend hint shown below the input
 * - Loading state with spinner while the API request is in flight
 * - Inline error display for API and validation failures
 * - Keyboard-friendly: Enter to confirm, Escape to close
 * - Closes on backdrop click
 *
 * Dependencies:
 * - tradeApi: buyAsset / sellAsset service functions
 * - token prop: JWT forwarded from TradingView, resolved via the `getToken` server action
 */

import { buyAsset, BuyResult, sellAsset, SellResult } from '@/lib/tradeApi';
import { useEffect, useRef, useState } from 'react';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TradeModalProps {
  /** Whether this is a buy or sell action — controls labels, colors, and input units. */
  mode: 'buy' | 'sell';
  /** Ticker symbol displayed in the header, e.g. "AAPL". */
  symbol: string;
  /** Currency ID of the asset being spent (buy mode) or sold (sell mode). */
  fromCurrencyId: string;
  /** Currency ID of the asset being received. */
  toCurrencyId: string;
  /**
   * Latest known price in dollars — used only for the live preview estimate.
   * The backend always recalculates using its own latest CurrencyHistory entry;
   * this value is display-only and may differ slightly from the execution price.
   */
  currentPrice: number;
  /**
   * Precision (decimal places) of the target asset, e.g. 8 for BTC.
   * Used to format the unit display and calculate minimum spend.
   */
  targetPrecision?: number;
  /** JWT access token for the authenticated user, forwarded to the API. */
  token: string;
  /** Called when the modal should be dismissed (cancel, backdrop click, Escape). */
  onClose: () => void;
  /** Called after a successful trade with the API response payload. */
  onSuccess: (result: BuyResult | SellResult) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format a dollar amount properly.
 * e.g. 1.5 → "$1.50 USD", 17500.00 → "$17,500.00 USD"
 */
function formatUSD(dollars: number): string {
  return (
    '$' +
    dollars.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) +
    ' USD'
  );
}

/**
 * Format a unit amount with full precision.
 * e.g. 0.10000000 with precision 8 → "0.10000000"
 */
function formatUnits(units: number, precision: number): string {
  return units.toFixed(precision);
}

/**
 * Converts a cents integer string to a display dollar amount.
 * e.g. "150" → "$1.50 USD"
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function centsToDisplay(cents: string): string {
  const n = parseInt(cents, 10);
  if (isNaN(n)) return '$0.00 USD';
  return formatUSD(n / 100);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TradeModal({
  mode,
  symbol,
  fromCurrencyId,
  toCurrencyId,
  currentPrice,
  targetPrecision = 8,
  token,
  onClose,
  onSuccess
}: TradeModalProps) {
  const isBuy = mode === 'buy';

  // ── State ─────────────────────────────────────────────────────────────────
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /**
   * buyInputMode: only relevant when isBuy === true.
   * 'usd'   — user enters how many USD to spend
   * 'units' — user enters how many units to buy
   */
  const [buyInputMode, setBuyInputMode] = useState<'usd' | 'units'>('usd');

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Side effects ──────────────────────────────────────────────────────────

  // Focus the amount input as soon as the modal mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close the modal when the user presses Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Reset amount when toggling buy input mode
  useEffect(() => {
    setAmount('');
    setError(null);
  }, [buyInputMode]);

  // ── Derived values ────────────────────────────────────────────────────────
  const parsedAmount = parseFloat(amount);
  const validAmount = !isNaN(parsedAmount) && parsedAmount > 0;

  /**
   * Minimum spend in USD to receive at least one smallest unit.
   * minSpend = pricePerUnit / 10^precision
   * e.g. AAPL @ $175.00, precision 2 → min $1.75
   */
  const minSpendUSD =
    currentPrice > 0 ? currentPrice / Math.pow(10, targetPrecision) : null;

  /**
   * Live preview estimate using the frontend-known price.
   * The backend recalculates; this is display only.
   */
  const previewLine = (() => {
    if (!validAmount || currentPrice <= 0) return null;

    if (isBuy) {
      if (buyInputMode === 'usd') {
        // spending USD → how many units?
        const units = parsedAmount / currentPrice;
        return `≈ ${formatUnits(units, targetPrecision)} ${symbol}`;
      } else {
        // buying N units → how much USD?
        const cost = parsedAmount * currentPrice;
        return `≈ ${formatUSD(cost)}`;
      }
    } else {
      // selling units → how much USD?
      const proceeds = parsedAmount * currentPrice;
      return `≈ ${formatUSD(proceeds)}`;
    }
  })();

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);

    if (!validAmount) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (!token) {
      setError('You must be logged in to trade.');
      return;
    }

    let amountInCents: string;

    if (isBuy) {
      if (buyInputMode === 'usd') {
        // User entered USD → convert to cents
        amountInCents = String(Math.round(parsedAmount * 100));
      } else {
        // User entered units → convert to USD spend, then to cents.
        // We multiply units × currentPrice to get dollars, then × 100 for cents.
        const spendDollars = parsedAmount * currentPrice;
        amountInCents = String(Math.round(spendDollars * 100));
      }
    } else {
      // Sell: user entered units. Backend expects integer units × 10^precision.
      // e.g. 0.5 units with precision 8 → 50000000
      const unitsInt = Math.round(parsedAmount * Math.pow(10, targetPrecision));
      amountInCents = String(unitsInt);
    }

    if (amountInCents === '0' || parseInt(amountInCents, 10) <= 0) {
      setError('Amount is too small. Please enter a larger value.');
      return;
    }

    setIsLoading(true);
    try {
      const result = isBuy
        ? await buyAsset(token, fromCurrencyId, toCurrencyId, amountInCents)
        : await sellAsset(token, fromCurrencyId, toCurrencyId, amountInCents);

      onSuccess(result);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Trade failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Submit on Enter key inside the amount input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  // ── Input label / placeholder helpers ────────────────────────────────────
  const inputLabel = (() => {
    if (isBuy) {
      return buyInputMode === 'usd'
        ? 'Amount to spend (USD)'
        : `Units of ${symbol} to buy`;
    }
    return `Units of ${symbol} to sell`;
  })();

  const inputPlaceholder = (() => {
    if (isBuy && buyInputMode === 'usd') return '0.00';
    return '0';
  })();

  const showDollarPrefix = isBuy && buyInputMode === 'usd';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Card */}
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            {isBuy ? 'Buy' : 'Sell'}{' '}
            <span
              style={{
                color: isBuy
                  ? 'rgb(var(--color-success))'
                  : 'rgb(var(--color-danger))'
              }}
            >
              {symbol}
            </span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* ── Current price hint ── */}
        {currentPrice > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 px-3 py-2 rounded-lg bg-muted/40 border border-border">
            <span>Current price</span>
            <span className="text-foreground font-medium tabular-nums">
              {formatUSD(currentPrice)}
            </span>
          </div>
        )}

        {/* ── Buy mode toggle (USD vs Units) — only shown in buy mode ── */}
        {isBuy && (
          <div className="flex gap-1 mb-4 p-1 rounded-lg bg-muted border border-border">
            <button
              onClick={() => setBuyInputMode('usd')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                buyInputMode === 'usd'
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Spend USD
            </button>
            <button
              onClick={() => setBuyInputMode('units')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                buyInputMode === 'units'
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Buy Units
            </button>
          </div>
        )}

        {/* ── Amount input ── */}
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
          {inputLabel}
        </label>
        <div className="relative mb-1">
          {showDollarPrefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
              $
            </span>
          )}
          <input
            ref={inputRef}
            type="number"
            min="0"
            step={
              showDollarPrefix ? '0.01' : `${Math.pow(10, -targetPrecision)}`
            }
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={inputPlaceholder}
            className={`w-full px-3 py-2.5 rounded-lg border bg-background text-foreground text-sm
              focus:outline-none focus:ring-2 transition-all
              ${showDollarPrefix ? 'pl-7' : ''}
              ${
                error
                  ? 'border-[rgb(var(--color-danger)/0.8)] focus:ring-[rgb(var(--color-danger)/0.3)]'
                  : 'border-border focus:ring-primary/40'
              }`}
          />
        </div>

        {/* ── Minimum spend hint ── */}
        {isBuy && minSpendUSD !== null && minSpendUSD > 0 && (
          <p className="text-xs text-muted-foreground mb-1">
            Minimum:{' '}
            <span className="text-foreground font-medium">
              {buyInputMode === 'usd'
                ? formatUSD(minSpendUSD)
                : formatUnits(
                    1 / Math.pow(10, targetPrecision),
                    targetPrecision
                  ) + ` ${symbol}`}
            </span>
          </p>
        )}

        {/* ── Live preview ── */}
        <div className="h-5 mb-4">
          {previewLine && !error && (
            <p className="text-xs text-muted-foreground">{previewLine}</p>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-[rgb(var(--color-danger)/0.1)] border border-[rgb(var(--color-danger)/0.3)] text-sm text-[rgb(var(--color-danger))]">
            {error}
          </div>
        )}

        {/* ── Divider ── */}
        <div className="border-t border-border mb-4" />

        {/* ── Actions ── */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !validAmount}
            style={{
              backgroundColor:
                isLoading || !validAmount
                  ? undefined
                  : isBuy
                    ? 'rgb(var(--color-success) / 1)'
                    : 'rgb(var(--color-danger) / 1)'
            }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white
              disabled:opacity-40 disabled:cursor-not-allowed transition-all
              ${!isLoading && validAmount ? 'hover:opacity-90' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Processing…
              </span>
            ) : isBuy ? (
              'Confirm Buy'
            ) : (
              'Confirm Sell'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
