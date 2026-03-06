import { Currency } from '@/entities/currency.entity';
import { CurrencyHistory } from '@/entities/currency_history.entity';
import { CurrencyType } from '@/enum/currency_type';
import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import moment from 'moment';

import YahooFinance from 'yahoo-finance2';

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function batchedMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  batchSize = BATCH_SIZE,
  delayMs = BATCH_DELAY_MS
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
    if (i + batchSize < items.length) await delay(delayMs);
  }
  return results;
}

export class MarketDataSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Skip seeding if currencies already exist in the database
    const existingCount = await em.count(Currency);
    if (existingCount > 0) {
      console.log(
        `[MarketDataSeeder] ${existingCount} currencies already exist, skipping seed.`
      );
      return;
    }

    const yahoo = new YahooFinance();

    const tickers: { symbol: string; type: CurrencyType }[] = [
      // Big Tech
      { symbol: 'AAPL', type: CurrencyType.Stock },
      { symbol: 'MSFT', type: CurrencyType.Stock },
      { symbol: 'GOOGL', type: CurrencyType.Stock },
      { symbol: 'AMZN', type: CurrencyType.Stock },
      { symbol: 'TSLA', type: CurrencyType.Stock },
      { symbol: 'NVDA', type: CurrencyType.Stock },
      { symbol: 'META', type: CurrencyType.Stock },
      { symbol: 'NFLX', type: CurrencyType.Stock },
      { symbol: 'AMD', type: CurrencyType.Stock },
      { symbol: 'INTC', type: CurrencyType.Stock },
      { symbol: 'UBER', type: CurrencyType.Stock },
      { symbol: 'ABNB', type: CurrencyType.Stock },
      { symbol: 'ADBE', type: CurrencyType.Stock },
      { symbol: 'CRM', type: CurrencyType.Stock },
      { symbol: 'ORCL', type: CurrencyType.Stock },
      { symbol: 'CSCO', type: CurrencyType.Stock },
      { symbol: 'IBM', type: CurrencyType.Stock },
      { symbol: 'QCOM', type: CurrencyType.Stock },
      { symbol: 'TXN', type: CurrencyType.Stock },
      { symbol: 'AVGO', type: CurrencyType.Stock },
      { symbol: 'SHOP', type: CurrencyType.Stock },
      { symbol: 'SQ', type: CurrencyType.Stock },
      { symbol: 'PYPL', type: CurrencyType.Stock },
      { symbol: 'SPOT', type: CurrencyType.Stock },
      { symbol: 'SNAP', type: CurrencyType.Stock },
      { symbol: 'TWTR', type: CurrencyType.Stock },
      { symbol: 'RBLX', type: CurrencyType.Stock },
      { symbol: 'ROKU', type: CurrencyType.Stock },
      // Financial Services
      { symbol: 'JPM', type: CurrencyType.Stock },
      { symbol: 'BAC', type: CurrencyType.Stock },
      { symbol: 'WFC', type: CurrencyType.Stock },
      { symbol: 'GS', type: CurrencyType.Stock },
      { symbol: 'MS', type: CurrencyType.Stock },
      { symbol: 'C', type: CurrencyType.Stock },
      { symbol: 'BLK', type: CurrencyType.Stock },
      { symbol: 'SCHW', type: CurrencyType.Stock },
      { symbol: 'AXP', type: CurrencyType.Stock },
      { symbol: 'V', type: CurrencyType.Stock },
      { symbol: 'MA', type: CurrencyType.Stock },
      { symbol: 'COF', type: CurrencyType.Stock },
      // Healthcare & Pharma
      { symbol: 'JNJ', type: CurrencyType.Stock },
      { symbol: 'UNH', type: CurrencyType.Stock },
      { symbol: 'PFE', type: CurrencyType.Stock },
      { symbol: 'ABBV', type: CurrencyType.Stock },
      { symbol: 'TMO', type: CurrencyType.Stock },
      { symbol: 'ABT', type: CurrencyType.Stock },
      { symbol: 'MRK', type: CurrencyType.Stock },
      { symbol: 'LLY', type: CurrencyType.Stock },
      { symbol: 'BMY', type: CurrencyType.Stock },
      { symbol: 'AMGN', type: CurrencyType.Stock },
      { symbol: 'GILD', type: CurrencyType.Stock },
      { symbol: 'CVS', type: CurrencyType.Stock },
      // Consumer Goods & Retail
      { symbol: 'WMT', type: CurrencyType.Stock },
      { symbol: 'HD', type: CurrencyType.Stock },
      { symbol: 'PG', type: CurrencyType.Stock },
      { symbol: 'KO', type: CurrencyType.Stock },
      { symbol: 'PEP', type: CurrencyType.Stock },
      { symbol: 'COST', type: CurrencyType.Stock },
      { symbol: 'NKE', type: CurrencyType.Stock },
      { symbol: 'MCD', type: CurrencyType.Stock },
      { symbol: 'SBUX', type: CurrencyType.Stock },
      { symbol: 'TGT', type: CurrencyType.Stock },
      { symbol: 'LOW', type: CurrencyType.Stock },
      { symbol: 'TJX', type: CurrencyType.Stock },
      { symbol: 'DIS', type: CurrencyType.Stock },
      // Energy
      { symbol: 'XOM', type: CurrencyType.Stock },
      { symbol: 'CVX', type: CurrencyType.Stock },
      { symbol: 'COP', type: CurrencyType.Stock },
      { symbol: 'SLB', type: CurrencyType.Stock },
      { symbol: 'EOG', type: CurrencyType.Stock },
      // Automotive
      { symbol: 'F', type: CurrencyType.Stock },
      { symbol: 'GM', type: CurrencyType.Stock },
      { symbol: 'RIVN', type: CurrencyType.Stock },
      { symbol: 'LCID', type: CurrencyType.Stock },
      // Industrial & Manufacturing
      { symbol: 'BA', type: CurrencyType.Stock },
      { symbol: 'CAT', type: CurrencyType.Stock },
      { symbol: 'GE', type: CurrencyType.Stock },
      { symbol: 'MMM', type: CurrencyType.Stock },
      { symbol: 'HON', type: CurrencyType.Stock },
      { symbol: 'UPS', type: CurrencyType.Stock },
      { symbol: 'RTX', type: CurrencyType.Stock },
      // Telecom
      { symbol: 'T', type: CurrencyType.Stock },
      { symbol: 'VZ', type: CurrencyType.Stock },
      { symbol: 'TMUS', type: CurrencyType.Stock },
      // Real Estate
      { symbol: 'AMT', type: CurrencyType.Stock },
      { symbol: 'PLD', type: CurrencyType.Stock },
      // Consumer Discretionary
      { symbol: 'BKNG', type: CurrencyType.Stock },
      { symbol: 'EXPE', type: CurrencyType.Stock },
      // Materials & Chemicals
      { symbol: 'LIN', type: CurrencyType.Stock },
      { symbol: 'APD', type: CurrencyType.Stock },
      // ETFs
      { symbol: 'VOO', type: CurrencyType.ETF },
      { symbol: 'QQQ', type: CurrencyType.ETF },
      { symbol: 'SPY', type: CurrencyType.ETF },
      // Crypto
      { symbol: 'BTC-USD', type: CurrencyType.Crypto },
      { symbol: 'ETH-USD', type: CurrencyType.Crypto }
    ];

    // usd
    const usd = new Currency();
    usd.symbol = 'USD';
    usd.name = 'United States Dollar';
    usd.precision = 2;
    usd.type = CurrencyType.Fiat;

    em.persist(usd);

    const cc: Currency[] = [];

    // Fetch currency metadata in batches to avoid Yahoo Finance rate limits
    await batchedMap(tickers, async (t) => {
      try {
        const yahooData = await yahoo.quote(t.symbol);
        const c = new Currency();
        c.symbol = t.symbol;
        c.name = (yahooData.longName ?? t.symbol) as string;
        c.precision = yahooData.priceHint as number;
        c.type = t.type;
        if (t.type === CurrencyType.Crypto) c.updateFreqency = '1m';
        em.persist(c);
        cc.push(c);
      } catch (e: unknown) {
        console.error('failed to fetch quote for', t.symbol, e);
      }
    });

    // Fetch 1-year price history in batches to avoid Yahoo Finance rate limits
    await batchedMap(cc, async (c) => {
      try {
        const yahooData = await yahoo.chart(c.symbol, {
          period1: moment().subtract(1, 'y').toDate(),
          period2: new Date(),
          interval: '1d'
        });

        for (const d of yahooData.quotes) {
          if (!d.close || d.close <= 0 || !d.open || !d.high || !d.low)
            continue;
          const h = new CurrencyHistory();
          h.currency = c;
          h.timestamp = d.date;
          h.open = BigInt(
            (parseFloat((d.open as number).toFixed(2)) * 100).toFixed(0)
          ) as bigint;
          h.high = BigInt(
            (parseFloat((d.high as number).toFixed(2)) * 100).toFixed(0)
          ) as bigint;
          h.low = BigInt(
            (parseFloat((d.low as number).toFixed(2)) * 100).toFixed(0)
          ) as bigint;
          h.close = BigInt(
            (parseFloat((d.close as number).toFixed(2)) * 100).toFixed(0)
          ) as bigint;
          em.persist(h);
        }
      } catch (e: unknown) {
        console.error('failed to fetch history for', c.symbol, e);
      }
    });

    await em.flush();
  }
}
