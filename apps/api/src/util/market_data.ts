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
        const current = await this.yahooFinance.quote(c.symbol);

        db.create(CurrencyHistory, {
          currency: c,
          timestamp: new Date(),
          price: BigInt(
            (
              parseFloat((current.regularMarketPrice as number).toFixed(2)) *
              100
            ).toFixed(0)
          ) as bigint
        });
      })
    );

    await db.flush();
  }
}

export default MarketData;
