import { Currency } from '@/entities/currency.entity';
import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';
import { z } from 'zod';
import Permissions from '@/enum/permissions';
import { CurrencyType } from '@/enum/currency_type';

export const get = async (req: Request, res: Response<Currency>) => {
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

  return res.status(Status.Ok).json(currency);
};

const patchSchema = z.object({
  symbol: z.string().optional(),
  name: z.string().optional(),
  precision: z.number().int().min(0).optional(),
  update_freqency: z
    .enum([
      '1m',
      '2m',
      '5m',
      '15m',
      '30m',
      '60m',
      '90m',
      '1h',
      '1d',
      '5d',
      '1wk',
      '1mo',
      '3mo'
    ])
    .optional(),
  type: z.nativeEnum(CurrencyType).optional()
});

export const patch = async (req: Request, res: Response<void>) => {
  const requester = await req.getUser();
  const isAdmin =
    (requester.permissions & Permissions.Admin) === Permissions.Admin;

  if (!isAdmin) {
    return res.error(Status.Forbidden, 'Admin access required');
  }

  const { id } = req.params;
  const body = req.validateBody(patchSchema);

  const db = (await orm).em.fork();
  const currency = await db.findOne(Currency, { id: BigInt(id) });

  if (!currency)
    return res.error(
      Status.NotFound,
      'This currency/stock/etf is non-existant!!!!!!'
    );

  if (body.symbol !== undefined) currency.symbol = body.symbol;
  if (body.name !== undefined) currency.name = body.name;
  if (body.precision !== undefined) currency.precision = body.precision;
  if (body.update_freqency !== undefined)
    currency.updateFreqency = body.update_freqency;
  if (body.type !== undefined) currency.type = body.type;

  await db.persist(currency).flush();

  return res.status(Status.NoContent).end();
};
