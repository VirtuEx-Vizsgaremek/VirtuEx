import { Currency } from '@/entities/currency.entity';
import { CurrencyHistory } from '@/entities/currency_history.entity';
import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type AggregatedBar = {
  timestamp: Date;
  open: bigint;
  high: bigint;
  low: bigint;
  close: bigint;
};

/**
 * Returns a grouping key for a given date and interval.
 * The key determines which candle a daily row belongs to.
 */
function getGroupKey(date: Date, interval: string): string {
  const d = new Date(date);
  const y = d.getUTCFullYear();
  const mo = d.getUTCMonth(); // 0-based
  const day = d.getUTCDate();

  if (interval === '1w') {
    // ISO week: advance to Monday of this week
    const dow = d.getUTCDay(); // 0 = Sun … 6 = Sat
    const diffToMonday = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(Date.UTC(y, mo, day + diffToMonday));
    const iso = monday.toISOString().slice(0, 10);
    return iso;
  }
  if (interval === '1m') {
    return `${y}-${String(mo + 1).padStart(2, '0')}`;
  }
  if (interval === '1y') {
    return `${y}`;
  }
  // default: 1d
  return d.toISOString().slice(0, 10);
}

/**
 * Aggregates raw daily CurrencyHistory rows into coarser OHLC bars.
 * Each group's:
 *   - timestamp = the first (oldest) day in the period
 *   - open      = open of the first day
 *   - high      = max high across all days
 *   - low       = min low across all days
 *   - close     = close of the last day
 */
function aggregateHistory(
  daily: CurrencyHistory[],
  interval: string
): AggregatedBar[] {
  if (daily.length === 0) return [];

  const groups = new Map<string, CurrencyHistory[]>();
  for (const row of daily) {
    const key = getGroupKey(row.timestamp, interval);
    const bucket = groups.get(key);
    if (bucket) bucket.push(row);
    else groups.set(key, [row]);
  }

  const bars: AggregatedBar[] = [];
  for (const rows of groups.values()) {
    rows.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const first = rows[0];
    const last = rows[rows.length - 1];

    let high = first.high;
    let low = first.low;
    for (const r of rows) {
      if (r.high > high) high = r.high;
      if (r.low < low) low = r.low;
    }

    bars.push({
      timestamp: first.timestamp,
      open: first.open,
      high,
      low,
      close: last.close
    });
  }

  bars.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  return bars;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const get = async (
  req: Request,
  res: Response<AggregatedBar[] | CurrencyHistory[]>
) => {
  const { id } = req.params;
  const db = (await orm).em.fork();

  let currency;
  if ((id as string).match(/[a-zA-Z]{3}/))
    currency = await db.findOne(Currency, {
      symbol: (id as string).toUpperCase()
    });
  else currency = await db.findOne(Currency, { id: BigInt(id) });
  if (!currency)
    return res.error(
      Status.NotFound,
      'This currency/stock/etf is non-existant!!!!!!'
    );

  const { start, end } = req.query;
  const interval = ((req.query.interval as string) || '1d').toLowerCase();

  const daily = await db.find(
    CurrencyHistory,
    {
      currency,
      timestamp: {
        $gte: new Date(start as string),
        $lt: new Date(end as string)
      }
    },
    { orderBy: { timestamp: 'ASC' } }
  );

  if (!daily)
    return res.error(
      Status.InternalServerError,
      'History is undefined for some reason...'
    );

  if (interval === '1d') {
    return res.status(Status.Ok).json(daily);
  }

  const aggregated = aggregateHistory(daily, interval);
  return res.status(Status.Ok).json(aggregated);
};
