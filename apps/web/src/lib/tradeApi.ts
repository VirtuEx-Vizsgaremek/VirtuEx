/**
 * Trade API Service
 *
 * Frontend service layer for executing buy/sell orders and looking up currencies
 * from the backend API. Abstracts HTTP communication and provides type-safe operations.
 *
 * Features:
 * - Type-safe buy and sell order execution
 * - Currency ID lookup with in-memory session cache
 * - Structured error type carrying HTTP status codes
 * - Reusable across components (TradeModal, TradingView, etc.)
 *
 * Configuration:
 * - Set NEXT_PUBLIC_API_URL in .env.local (e.g., http://localhost:3001)
 * - Falls back to http://localhost:3001 if not set
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Response types ───────────────────────────────────────────────────────────

/** Successful response from POST /v1/trade/@buy */
export interface BuyResult {
  order_id: string;
  status: string;
  spent: string; // amount deducted from the source asset (cents string)
  received: string; // units credited to the target asset (integer, precision-scaled)
  received_exact: string; // full decimal string, e.g. "0.10000000" for 8 decimals
  price_per_unit: string; // execution price (cents string)
}

/** Successful response from POST /v1/trade/@sell */
export interface SellResult {
  order_id: string;
  status: string;
  sold: string; // units deducted from the source asset
  received: string; // proceeds credited to the target asset (cents string)
  price_per_unit: string; // execution price (cents string)
}

/** Successful response from POST /v1/trade/@exchange */
export interface ExchangeResult {
  order_id: string;
  status: string;
  sold: string; // precision-scaled units deducted from from_asset
  sold_exact: string; // full decimal string, e.g. "1.00"
  received: string; // precision-scaled units credited to to_asset
  received_exact: string; // full decimal string, e.g. "0.85123456"
  from_price_per_unit: string; // USD cents per unit of from_currency
  to_price_per_unit: string; // USD cents per unit of to_currency
}

export type TradeResult = BuyResult | SellResult | ExchangeResult;

/** Raw error shape returned by the backend on non-2xx responses. */
export interface TradeError {
  error: number;
  message: string;
}

// ─── Internal helper ──────────────────────────────────────────────────────────

/**
 * Performs an authenticated POST request to the given endpoint.
 * Throws a `TradeApiError` if the response is not ok.
 */
async function request<T>(
  endpoint: string,
  token: string,
  body: Record<string, string>
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    const err = data as TradeError;
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return data as T;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Place a market buy order.
 *
 * @param token           JWT access token
 * @param fromCurrencyId  ID of the currency being spent (e.g. USD)
 * @param toCurrencyId    ID of the currency being bought (e.g. AAPL)
 * @param amount          Amount to spend in cents as an integer string
 *                        e.g. "1750000" = $17,500.00
 */
export async function buyAsset(
  token: string,
  fromCurrencyId: string,
  toCurrencyId: string,
  amount: string
): Promise<BuyResult> {
  return request<BuyResult>('/v1/trade/@buy', token, {
    from_currency_id: fromCurrencyId,
    to_currency_id: toCurrencyId,
    amount
  });
}

/**
 * Place a market sell order.
 *
 * @param token           JWT access token
 * @param fromCurrencyId  ID of the currency being sold (e.g. AAPL)
 * @param toCurrencyId    ID of the currency to receive (e.g. USD)
 * @param amount          Number of units to sell as an integer string
 *                        e.g. "100" = 100 units (precision-adjusted)
 */
export async function sellAsset(
  token: string,
  fromCurrencyId: string,
  toCurrencyId: string,
  amount: string
): Promise<SellResult> {
  return request<SellResult>('/v1/trade/@sell', token, {
    from_currency_id: fromCurrencyId,
    to_currency_id: toCurrencyId,
    amount
  });
}

/**
 * Place a direct exchange order (asset → asset, bridged through USD internally).
 *
 * @param token           JWT access token
 * @param fromCurrencyId  ID of the currency being exchanged away (e.g. AAPL)
 * @param toCurrencyId    ID of the currency being received (e.g. GOOGL)
 * @param amount          Units of from_currency to exchange, precision-scaled integer string
 *                        e.g. precision=2, 1 share → "100"
 */
export async function exchangeAsset(
  token: string,
  fromCurrencyId: string,
  toCurrencyId: string,
  amount: string
): Promise<ExchangeResult> {
  return request<ExchangeResult>('/v1/trade/@exchange', token, {
    from_currency_id: fromCurrencyId,
    to_currency_id: toCurrencyId,
    amount
  });
}

// ─── Currency lookup ──────────────────────────────────────────────────────────

/** Currency record as returned by GET /v1/currency. */
export interface Currency {
  id: string;
  symbol: string;
  name: string;
  type: string;
  precision: number;
}

// Simple in-memory cache — populated on the first call and reused for the session.
let _currencyCache: Currency[] | null = null;

/**
 * Fetches all currencies from GET /v1/currency and caches the result.
 * Subsequent calls within the same session return the cached list.
 */
export async function fetchCurrencies(): Promise<Currency[]> {
  if (_currencyCache) return _currencyCache;

  const res = await fetch(`${API_URL}/v1/currency`);
  if (!res.ok) throw new Error('Failed to fetch currencies');

  const data: Currency[] = await res.json();
  _currencyCache = data;
  return data;
}

/**
 * Looks up a currency ID by ticker symbol (case-insensitive).
 * Returns null if the symbol is not found in the currency list.
 */
export async function fetchCurrencyId(symbol: string): Promise<string | null> {
  const currencies = await fetchCurrencies();
  const match = currencies.find(
    (c) => c.symbol.toUpperCase() === symbol.toUpperCase()
  );
  return match ? match.id.toString() : null;
}
