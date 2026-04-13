/**
 * All-Time History Backfill Script
 *
 * Fetches all available historical price data from Yahoo Finance for every
 * currency in the database and upserts it into the CurrencyHistory table.
 *
 * Safe to re-run: existing records are skipped (composite PK prevents duplicates).
 *
 * Usage:
 *   pnpm tsx src/scripts/backfill_history.ts
 */

import { MikroORM } from '@mikro-orm/postgresql';
import YahooFinance from 'yahoo-finance2';

import config from '@/mikro-orm.config';
import { Currency } from '@/entities/currency.entity';
import { CurrencyHistory } from '@/entities/currency_history.entity';
import { CurrencyType } from '@/enum/currency_type';

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 1000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toBI = (n: number) =>
  BigInt((parseFloat(n.toFixed(2)) * 100).toFixed(0)) as bigint;

async function backfill() {
  const orm = await MikroORM.init(config);
  const db = orm.em.fork();
  const yahoo = new YahooFinance();

  // Deduplicate by symbol — keep the lowest-id entry per symbol
  const allCurrencies = await db.findAll(Currency);
  const seen = new Set<string>();
  const currencies = allCurrencies
    .sort((a, b) => (a.id < b.id ? -1 : 1))
    .filter((c) => {
      if (seen.has(c.symbol)) return false;
      seen.add(c.symbol);
      return true;
    })
    // Fiat currencies have no price history on Yahoo Finance
    .filter((c) => c.type !== CurrencyType.Fiat);

  console.log(`[backfill] Found ${currencies.length} currencies to process.`);

  for (let i = 0; i < currencies.length; i += BATCH_SIZE) {
    const batch = currencies.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (c) => {
        try {
          console.log(`[backfill] Fetching all-time history for ${c.symbol}…`);

          const yahooData = await yahoo.chart(c.symbol, {
            period1: new Date('1900-01-01'), // Yahoo returns earliest available data
            period2: new Date(),
            interval: '1d'
          });

          let inserted = 0;
          let skipped = 0;

          for (const d of yahooData.quotes) {
            if (!d.close || d.close <= 0 || !d.open || !d.high || !d.low)
              continue;

            // Check if this data point already exists
            const existing = await db.findOne(CurrencyHistory, {
              currency: c,
              timestamp: d.date
            });

            if (existing) {
              skipped++;
              continue;
            }

            const h = db.create(CurrencyHistory, {
              currency: c,
              timestamp: d.date,
              open: toBI(d.open as number),
              high: toBI(d.high as number),
              low: toBI(d.low as number),
              close: toBI(d.close as number)
            });
            db.persist(h);
            inserted++;
          }

          await db.flush();
          console.log(
            `[backfill] ${c.symbol}: inserted ${inserted}, skipped ${skipped} existing records.`
          );
        } catch (e) {
          console.error(
            `[backfill] Failed to fetch history for ${c.symbol}:`,
            e
          );
        }
      })
    );

    if (i + BATCH_SIZE < currencies.length) {
      console.log(`[backfill] Batch done, waiting ${BATCH_DELAY_MS}ms…`);
      await delay(BATCH_DELAY_MS);
    }
  }

  console.log('[backfill] All done.');
  await orm.close();
}

backfill().catch((e) => {
  console.error('[backfill] Fatal error:', e);
  process.exit(1);
});
