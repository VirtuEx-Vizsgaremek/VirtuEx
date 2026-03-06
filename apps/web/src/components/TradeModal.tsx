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
 * - Dollar amount input (buy) or unit amount input (sell)
 * - Live estimated outcome preview based on the last known price
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
  /** JWT access token for the authenticated user, forwarded to the API. */
  token: string;
  /** Called when the modal should be dismissed (cancel, backdrop click, Escape). */
  onClose: () => void;
  /** Called after a successful trade with the API response payload. */
  onSuccess: (result: BuyResult | SellResult) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts a cents integer string to a display dollar amount, e.g. "17500" → "$175.00". */
function centsToDisplay(cents: string): string {
  const n = parseInt(cents, 10);
  if (isNaN(n)) return '$0.00';
  return `$${(n / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TradeModal({
  mode,
  symbol,
  fromCurrencyId,
  toCurrencyId,
  currentPrice,
  token,
  onClose,
  onSuccess
}: TradeModalProps) {
  const isBuy = mode === 'buy';

  // ── State ─────────────────────────────────────────────────────────────────
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // ── Live preview ──────────────────────────────────────────────────────────
  const parsedAmount = parseFloat(amount);
  const validAmount = !isNaN(parsedAmount) && parsedAmount > 0;

  /**
   * Estimate the expected outcome using the frontend-known price.
   * The backend recalculates with its own latest CurrencyHistory entry,
   * so the actual result may differ slightly from this preview.
   */
  const previewLine = (() => {
    if (!validAmount || currentPrice <= 0) return null;

    if (isBuy) {
      // How many units does the spend amount buy?
      const units = parsedAmount / currentPrice;
      return `≈ ${units.toLocaleString('en-US', { maximumFractionDigits: 6 })} ${symbol}`;
    } else {
      // How many dollars do the sold units yield?
      const proceeds = parsedAmount * currentPrice;
      return `≈ $${proceeds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
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

    // Convert the human-readable dollar (buy) or unit (sell) amount to an
    // integer cents string — matches the backend BigInt convention (1 USD = 100).
    const amountInCents = String(Math.round(parsedAmount * 100));

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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        // Close when clicking the backdrop (not the card itself)
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
              $
              {currentPrice.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
        )}

        {/* ── Amount input ── */}
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
          {isBuy ? 'Amount to spend (USD)' : `Units of ${symbol} to sell`}
        </label>
        <div className="relative mb-1">
          {isBuy && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
              $
            </span>
          )}
          <input
            ref={inputRef}
            type="number"
            min="0"
            step={isBuy ? '0.01' : '1'}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isBuy ? '0.00' : '0'}
            className={`w-full px-3 py-2.5 rounded-lg border bg-background text-foreground text-sm
              focus:outline-none focus:ring-2 transition-all
              ${isBuy ? 'pl-7' : ''}
              ${
                error
                  ? 'border-[rgb(var(--color-danger)/0.8)] focus:ring-[rgb(var(--color-danger)/0.3)]'
                  : 'border-border focus:ring-primary/40'
              }`}
          />
        </div>

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
              ${
                !isLoading && validAmount
                  ? isBuy
                    ? 'hover:opacity-90'
                    : 'hover:opacity-90'
                  : ''
              }`}
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
