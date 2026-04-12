// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Box-Muller transform: produces a standard-normal sample. */
function randn(): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ─── Market regime ────────────────────────────────────────────────────────────

type Regime = 'bull' | 'bear' | 'sideways';

interface RegimeConfig {
  drift: number; // annualised log-return
  sigma: number; // annualised volatility
  minDays: number;
  maxDays: number;
}

const REGIMES: Record<Regime, RegimeConfig> = {
  bull: { drift: 0.25, sigma: 0.18, minDays: 20, maxDays: 90 },
  bear: { drift: -0.2, sigma: 0.22, minDays: 15, maxDays: 60 },
  sideways: { drift: 0.02, sigma: 0.12, minDays: 20, maxDays: 70 }
};

function pickNextRegime(current: Regime): Regime {
  const transitions: Record<Regime, Regime[]> = {
    bull: ['sideways', 'bear', 'bull'],
    bear: ['sideways', 'bull', 'bear'],
    sideways: ['bull', 'bear', 'sideways']
  };
  const opts = transitions[current];
  return opts[Math.floor(Math.random() * opts.length)];
}

// ─── Core GBM step ────────────────────────────────────────────────────────────

/**
 * Advances the price by one candle-period using Geometric Brownian Motion.
 *
 * S(t+dt) = S(t) · exp((μ – σ²/2)·dt + σ·√dt·Z)
 *
 * @param price      Current price
 * @param drift      Annualised log-drift
 * @param annualSigma  Annualised volatility
 * @param dt         Fraction of a trading year (e.g. 1/252 for 1 day, 7/252 for 1 week)
 * @param shockMult  Volatility multiplier for news-event days (applied to random term only)
 */
function gbmStep(
  price: number,
  drift: number,
  annualSigma: number,
  dt: number,
  shockMult: number = 1
): number {
  // Itô drift uses unshocked sigma so the correction term never blows up
  const logReturn =
    (drift - 0.5 * annualSigma * annualSigma) * dt +
    annualSigma * shockMult * Math.sqrt(dt) * randn();
  return Math.max(price * Math.exp(logReturn), 0.0001);
}

// ─── OHLC construction ────────────────────────────────────────────────────────

function buildCandle(
  time: string,
  open: number,
  close: number,
  dailySigma: number,
  volume: number
): SimCandle {
  const body = Math.abs(close - open);
  const shadowBase = Math.max(body, open * dailySigma * 0.4);
  const upperShadow = shadowBase * (0.2 + Math.random() * 0.7);
  const lowerShadow = shadowBase * (0.2 + Math.random() * 0.7);

  const high = Math.max(open, close) + upperShadow;
  const low = Math.max(Math.min(open, close) - lowerShadow, 0.0001);

  return {
    time,
    open: Number(open.toFixed(4)),
    high: Number(high.toFixed(4)),
    low: Number(low.toFixed(4)),
    close: Number(close.toFixed(4)),
    volume
  };
}

// ─── Simulation engine ────────────────────────────────────────────────────────

interface SimCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SimOptions {
  candles: number;
  startDate: Date;
  initialPrice: number;
  stepDays: number;
}

function simStep(
  price: number,
  regime: Regime,
  ewmaVol: number,
  stepDays: number
): {
  open: number;
  close: number;
  effectiveSigma: number;
  newEwmaVol: number;
  volume: number;
} {
  const cfg = REGIMES[regime];
  // dt correctly accounts for the candle period (weekly, monthly, etc.)
  const dt = stepDays / 252;
  const baseDailySigma = cfg.sigma / Math.sqrt(252);

  // Blend EWMA vol with regime base; cap it so a single shock can't cascade
  const rawEffective = 0.6 * ewmaVol + 0.4 * baseDailySigma;
  const maxSigma = baseDailySigma * 2.5;
  const effectiveSigma = Math.min(rawEffective, maxSigma);
  const annualSigma = effectiveSigma * Math.sqrt(252);

  // Shock event: ~0.3% of candles (~1-2 per year on daily data)
  const isShock = Math.random() < 0.003;
  // shockMult affects only the random (diffusion) term, not the Itô correction
  const shockMult = isShock ? 1.5 + Math.random() * 0.8 : 1; // 1.5–2.3×

  // Gap open: small overnight move independent of intraday GBM
  // Shock days get a slightly larger gap but not compounded with shockMult
  const gapMult = isShock ? 0.8 : 0.3;
  const gapPct = effectiveSigma * gapMult * (Math.random() - 0.5);
  const open = price * (1 + gapPct);

  const close = gbmStep(open, cfg.drift, annualSigma, dt, shockMult);

  // Update EWMA vol: scale return back to daily-equivalent before storing
  const periodReturn = Math.abs(Math.log(close / open));
  const dailyEquivReturn = periodReturn / Math.sqrt(stepDays);
  const newEwmaVol = 0.06 * dailyEquivReturn + 0.94 * ewmaVol;

  // Simulated volume: log-normal, correlated with absolute return magnitude.
  // Larger moves attract more volume (a well-known empirical market property).
  const absReturn = Math.abs(Math.log(close / open));
  const volume = Math.round(500_000 * Math.exp(absReturn * 6 + 0.4 * randn()));

  return { open, close, effectiveSigma, newEwmaVol, volume };
}

/**
 * Full simulation: regime switching + GBM + volatility clustering + rare shocks.
 */
function simulate({
  candles,
  startDate,
  initialPrice,
  stepDays
}: SimOptions): SimCandle[] {
  const result: SimCandle[] = [];

  let price = initialPrice;
  let regime: Regime = 'sideways'; // start neutral, let it evolve naturally
  let regimeRemaining = 20 + Math.floor(Math.random() * 30);
  let ewmaVol = REGIMES[regime].sigma / Math.sqrt(252);

  for (let i = 0; i < candles; i++) {
    if (regimeRemaining <= 0) {
      regime = pickNextRegime(regime);
      const cfg = REGIMES[regime];
      regimeRemaining =
        cfg.minDays + Math.floor(Math.random() * (cfg.maxDays - cfg.minDays));
    }
    regimeRemaining--;

    const { open, close, effectiveSigma, newEwmaVol, volume } = simStep(
      price,
      regime,
      ewmaVol,
      stepDays
    );
    ewmaVol = newEwmaVol;

    const date = new Date(
      startDate.getTime() + i * stepDays * 24 * 60 * 60 * 1000
    );
    const time = date.toISOString().split('T')[0];

    result.push(buildCandle(time, open, close, effectiveSigma, volume));
    price = close;
  }

  return result;
}

// ─── Stateful simulator (for live tick-by-tick use) ──────────────────────────

export interface Simulator {
  /** Advance by one candle and return the OHLC bar for the given date string. */
  nextCandle(time: string, stepDays?: number): SimCandle;
}

/**
 * Creates a stateful simulator that produces one candle at a time.
 * Carries regime, volatility clustering, and drift state between calls so that
 * tick-by-tick live generation is statistically identical to batch generation.
 */
export function createSimulator(initialPrice: number): Simulator {
  let price = initialPrice;
  let regime: Regime = 'sideways';
  let regimeRemaining = 20 + Math.floor(Math.random() * 30);
  let ewmaVol = REGIMES[regime].sigma / Math.sqrt(252);

  return {
    nextCandle(time: string, stepDays: number = 1) {
      if (regimeRemaining <= 0) {
        regime = pickNextRegime(regime);
        const cfg = REGIMES[regime];
        regimeRemaining =
          cfg.minDays + Math.floor(Math.random() * (cfg.maxDays - cfg.minDays));
      }
      regimeRemaining--;

      const { open, close, effectiveSigma, newEwmaVol, volume } = simStep(
        price,
        regime,
        ewmaVol,
        stepDays
      );
      ewmaVol = newEwmaVol;
      price = close;
      return buildCandle(time, open, close, effectiveSigma, volume);
    }
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generates data for asset price tracking (single or multiple assets).
 */
export function generateShadCnChartData(
  days: number = 365,
  startDate: Date = new Date('2024-01-01'),
  assets: { name: string; initialPrice: number; symbol: string }[] = [
    { name: 'Bitcoin', symbol: 'BTC', initialPrice: 40000 },
    { name: 'Ethereum', symbol: 'ETH', initialPrice: 2000 },
    { name: 'Cardano', symbol: 'ADA', initialPrice: 0.5 }
  ]
) {
  const simulations: Record<string, SimCandle[]> = {};
  for (const asset of assets) {
    simulations[asset.symbol] = simulate({
      candles: days,
      startDate,
      initialPrice: asset.initialPrice,
      stepDays: 1
    });
  }

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const point: Record<string, number | string> = { date };
    for (const asset of assets) {
      point[asset.symbol] = Number(
        simulations[asset.symbol][i].close.toFixed(2)
      );
    }
    return point;
  });
}

/**
 * Generates area-chart data (time/value) for the TradingView component.
 */
export function generateTradingViewChartData(
  candles: number = 90,
  startDate: Date = new Date('2024-01-01'),
  initialPrice: number = 100,
  stepDays: number = 1
) {
  return simulate({ candles, startDate, initialPrice, stepDays }).map((c) => ({
    time: c.time,
    value: Number(c.close.toFixed(2))
  }));
}

/**
 * Generates OHLC candlestick data for the TradingView component.
 */
export function generateCandlestickData(
  candles: number = 90,
  startDate: Date = new Date('2024-01-01'),
  initialPrice: number = 100,
  stepDays: number = 1
) {
  return simulate({ candles, startDate, initialPrice, stepDays }).map((c) => ({
    time: c.time,
    open: Number(c.open.toFixed(2)),
    high: Number(c.high.toFixed(2)),
    low: Number(c.low.toFixed(2)),
    close: Number(c.close.toFixed(2)),
    volume: c.volume
  }));
}
