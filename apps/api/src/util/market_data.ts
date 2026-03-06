import YahooFinance from 'yahoo-finance2';

import { orm } from '@/util/orm';
import { Currency } from '@/entities/currency.entity';
import { CurrencyHistory } from '@/entities/currency_history.entity';

class MarketData {
  private static yahooFinance = new YahooFinance();

  public static async updateData() {
    const db = (await orm).em.fork();

    // Deduplicate by symbol — the seeder may have created multiple rows for the
    // same ticker; only process the lowest-id (original) entry per symbol.
    const allCurrencies = await db.findAll(Currency);
    const seen = new Set<string>();
    const currencies = allCurrencies
      .sort((a, b) => (a.id < b.id ? -1 : 1))
      .filter((c) => {
        if (seen.has(c.symbol)) return false;
        seen.add(c.symbol);
        return true;
      });

    for (const c of currencies) {
      let shouldUpdate = false;

      if (c.updateFreqency === '1m') {
        shouldUpdate = true;
      } else if (c.updateFreqency === '1d') {
        const lastUpdate = await db.findOne(
          CurrencyHistory,
          { currency: c },
          { orderBy: { timestamp: 'DESC' } }
        );
        const alreadyUpdatedToday =
          lastUpdate &&
          Number(lastUpdate.close) > 0 &&
          new Date(lastUpdate.timestamp).toDateString() ===
            new Date().toDateString();
        shouldUpdate = !alreadyUpdatedToday;
      }

      if (!shouldUpdate) continue;

      try {
        const current = await this.yahooFinance.quote(c.symbol);

        const rawClose = (current.regularMarketPrice ??
          current.close ??
          0) as number;
        const rawOpen = (current.regularMarketOpen ??
          current.open ??
          rawClose) as number;
        const rawHigh = (current.regularMarketDayHigh ??
          current.high ??
          rawClose) as number;
        const rawLow = (current.regularMarketDayLow ??
          current.low ??
          rawClose) as number;

        // Skip if the exchange is closed / Yahoo returned no price data
        if (!rawClose || rawClose <= 0) continue;

        const toBI = (n: number) =>
          BigInt((parseFloat(n.toFixed(2)) * 100).toFixed(0)) as bigint;

        db.create(CurrencyHistory, {
          currency: c,
          timestamp: new Date(),
          open: toBI(rawOpen),
          high: toBI(rawHigh),
          low: toBI(rawLow),
          close: toBI(rawClose)
        });
      } catch (e: unknown) {
        console.error('failed to update market data for', c.symbol, e);
      }
    }

    await db.flush();
  }
}

export default MarketData;
