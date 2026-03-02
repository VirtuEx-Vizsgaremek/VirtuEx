'use client';

/**
 * TradeModal Component
 *
 * A modal dialog that appears when the user clicks Buy or Sell in the TradingView chart.
 * Allows the user to enter an amount, previews the expected outcome, and submits
 * the trade to the backend API.
 *
 * Features:
 * - Buy and Sell modes with distinct colors (green / red) following the theme tokens
 * - Amount input with live preview of expected units received / proceeds
 * - Loading state during API call
 * - Inline error display
 * - Keyboard-friendly (Enter to confirm, Escape to close)
 * - Closes on backdrop click
 */

import { buyAsset, BuyResult, sellAsset, SellResult } from '@/lib/tradeApi';
import { useEffect, useRef, useState } from 'react';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface TradeModalProps {
  mode: 'buy' | 'sell';
  /** Display symbol, e.g. "AAPL" */
  symbol: string;
  /** Currency ID of the asset being spent (buy) or sold (sell) */
  fromCurrencyId: string;
  /** Currency ID of the asset being received */
  toCurrencyId: string;
  /**
   * Latest known price in dollars (used only for the live preview label).
   * The backend always uses its own latest CurrencyHistory price for the
   * actual calculation — this is display-only.
   */
  currentPrice: number;
  /** JWT access token for the authenticated user */
  token: string;
  onClose: () => void;
  onSuccess: (result: BuyResult | SellResult) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Format a cents-string to a human-readable dollar amount, e.g. "17500" → "$175.00" */
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

  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the modal opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape key
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
   * Preview the expected outcome based on the frontend-known price.
   * The actual server-side result may differ slightly because the backend
   * uses the latest CurrencyHistory entry.
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

    // Convert the human-readable dollar/unit amount to cents string
    // (matches the backend bigint convention where 1 dollar = 100 cents)
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
