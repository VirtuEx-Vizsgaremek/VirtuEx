import { Currency } from '@/entities/currency.entity';
import { CurrencyHistory } from '@/entities/currency_history.entity';
import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

export const get = async (req: Request, res: Response<CurrencyHistory[]>) => {
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
  console.log(start, end);

  const history = await db.find(CurrencyHistory, {
    currency,
    timestamp: {
      $gte: new Date(start),
      $lt: new Date(end)
    }
  });
  if (!history)
    return res.error(
      Status.InternalServerError,
      'History is undefined for some reason...'
    );

  return res.status(Status.Ok).json(history);
};
