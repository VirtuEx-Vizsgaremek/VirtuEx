import YahooFinance from 'yahoo-finance2';

import { orm } from '@/util/orm';
import { Currency } from '@/entities/currency.entity';
import { CurrencyHistory } from '@/entities/currency_history.entity';

class MarketData {
  private static yahooFinance = new YahooFinance();

  public static async updateData() {
    const db = (await orm).em.fork();

    const currencies = await db.findAll(Currency);
    await Promise.all(
      currencies.map(async (c) => {
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
            new Date(lastUpdate.timestamp).toDateString() ===
              new Date().toDateString();
          shouldUpdate = !alreadyUpdatedToday;
        }

        if (!shouldUpdate) return;

        const current = await this.yahooFinance.quote(c.symbol);
        try {
          db.create(CurrencyHistory, {
            currency: c,
            timestamp: new Date(),
            open: BigInt(
              (parseFloat((current.open as number).toFixed(2)) * 100).toFixed(0)
            ) as bigint,
            high: BigInt(
              (parseFloat((current.high as number).toFixed(2)) * 100).toFixed(0)
            ) as bigint,
            low: BigInt(
              (parseFloat((current.low as number).toFixed(2)) * 100).toFixed(0)
            ) as bigint,
            close: BigInt(
              (parseFloat((current.close as number).toFixed(2)) * 100).toFixed(
                0
              )
            ) as bigint
          });
        } catch (e: unknown) {
          console.error('failed to update market data for', c.symbol, e);
        }
      })
    );

    await db.flush();
  }
}

export default MarketData;
