import { Currency } from '@/entities/currency.entity';
import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

export const get = async (req: Request, res: Response<Currency>) => {
  const { id } = req.params;
  const db = (await orm).em.fork();

  let currency;
  if ((id as string).match(/[a-zA-Z]{3}/))
    currency = await db.findOne(Currency, {
      symbol: (id as string).toUpperCase()
    });
  else currency = await db.findOne(Currency, { id });

  if (!currency)
    return res.error(
      Status.NotFound,
      'This currency/stock/etf is non-existant!!!!!!'
    );

  return res.status(Status.Ok).json(currency);
};
