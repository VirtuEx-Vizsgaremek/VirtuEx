import { Currency } from '@/entities/currency.entity';
import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

export const get = async (req: Request, res: Response<Currency[]>) => {
  const db = (await orm).em.fork();

  const currencies = await db.findAll(Currency);

  if (!currencies)
    return res.error(
      Status.NotFound,
      'Currencies is undefined for some reason...'
    );

  return res.status(Status.Ok).json(currencies);
};
