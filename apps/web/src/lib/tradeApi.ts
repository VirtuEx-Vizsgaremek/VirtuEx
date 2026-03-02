/**
 * Trade API Service
 *
 * Frontend service layer for executing buy/sell orders against the backend API.
 * Abstracts HTTP communication and provides type-safe trade operations.
 *
 * Configuration:
 * - Set NEXT_PUBLIC_API_URL in .env.local (e.g., http://localhost:3001)
 * - Falls back to http://localhost:3001 if not set
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Response types ────────────────────────────────────────────────────────────

export interface BuyResult {
  order_id: string;
  status: string;
  spent: string; // amount deducted from the source asset (cents string)
  received: string; // units credited to the target asset
  price_per_unit: string; // price at execution time (cents string)
}

export interface SellResult {
  order_id: string;
  status: string;
  sold: string; // units deducted from the source asset
  received: string; // proceeds credited to the target asset (cents string)
  price_per_unit: string; // price at execution time (cents string)
}

export type TradeResult = BuyResult | SellResult;

// ─── Shared error type ─────────────────────────────────────────────────────────

export interface TradeError {
  error: number;
  message: string;
}

// ─── Internal helper ───────────────────────────────────────────────────────────

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

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Buy an asset.
 *
 * @param token           JWT access token
 * @param fromCurrencyId  ID of the currency being spent (e.g. USD)
 * @param toCurrencyId    ID of the currency being bought (e.g. AAPL)
 * @param amount          Amount to spend in smallest unit (cents), as a string
 *                        e.g. "1750000" = $17 500.00
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
 * Sell an asset.
 *
 * @param token           JWT access token
 * @param fromCurrencyId  ID of the currency being sold (e.g. AAPL)
 * @param toCurrencyId    ID of the currency to receive  (e.g. USD)
 * @param amount          Number of units to sell, as a string
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

// ─── Currency lookup ───────────────────────────────────────────────────────────

export interface Currency {
  id: string;
  symbol: string;
  name: string;
  type: string;
  precision: number;
}

let _currencyCache: Currency[] | null = null;

/**
 * Fetch all currencies from the backend and cache them for the session.
 * Uses the existing GET /v1/currency endpoint.
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
 * Look up a currency's ID by its symbol (e.g. "AAPL", "USD").
 * Returns null if the symbol is not found.
 */
export async function fetchCurrencyId(symbol: string): Promise<string | null> {
  const currencies = await fetchCurrencies();
  const match = currencies.find(
    (c) => c.symbol.toUpperCase() === symbol.toUpperCase()
  );
  return match ? match.id.toString() : null;
}
