import Status from '@/enum/status';
import Permissions from '@/enum/permissions';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { Wallet } from '@/entities/wallet.entity';
import { Asset } from '@/entities/asset.entity';

import { CurrencyType } from '@/enum/currency_type';
import { z } from 'zod';

export const schemas = {
  get: {
    res: z.object({
      id: z.string(),
      currency: z.string(),
      symbol: z.string(),
      amount: z.string(),
      type: z.nativeEnum(CurrencyType),
      precision: z.number()
    })
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  const rUser = await req.getUser();
  const { id, asset_id } = req.params;

  const db = (await orm).em.fork();
  const wallet = await db.findOne(Wallet, { id }, { populate: ['user'] });

  if (!wallet) return res.error(Status.NotFound, 'Wallet not found.');

  const isAdmin = (rUser.permissions & Permissions.Admin) === Permissions.Admin;
  if (!isAdmin && wallet.user.id !== rUser.id)
    return res.error(Status.Forbidden, 'Insufficient permissions.');

  const asset = await db.findOne(
    Asset,
    { id: asset_id, wallet },
    { populate: ['currency'] }
  );

  if (!asset) return res.error(Status.NotFound, 'Asset not found.');

  return res.status(Status.Ok).json({
    id: asset.id.toString(),
    currency: asset.currency.name,
    symbol: asset.currency.symbol,
    amount: asset.amount.toString(),
    type: asset.currency.type,
    precision: asset.currency.precision
  });
};
