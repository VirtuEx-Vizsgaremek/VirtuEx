import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { Wallet } from '@/entities/wallet.entity';
import { Asset } from '@/entities/asset.entity';

import Status from '@/enum/status';
import { CurrencyType } from '@/enum/currency_type';

import { z } from 'zod';

export const schemas = {
  get: {
    res: z.object({
      wallet_id: z.string(),
      total_assets: z.number(),
      assets: z.array(
        z.object({
          id: z.string(),
          currency: z.string(),
          symbol: z.string(),
          amount: z.string(),
          type: z.enum(CurrencyType),
          precision: z.number()
        })
      )
    })
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  try {
    const db = (await orm).em.fork();
    const { id } = req.params;

    const wallet = await db.findOne(Wallet, { id }, { populate: ['user'] });

    if (!wallet) {
      return res.error(Status.NotFound, 'Wallet not found');
    }

    const assets = await db.find(Asset, { wallet }, { populate: ['currency'] });

    const formattedAssets = assets.map((asset) => ({
      id: asset.id.toString(),
      currency: asset.currency.name,
      symbol: asset.currency.symbol,
      amount: asset.amount.toString(),
      type: asset.currency.type,
      precision: asset.currency.precision
    }));

    return res.status(Status.Ok).json({
      wallet_id: wallet.id.toString(),
      total_assets: assets.length,
      assets: formattedAssets
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return res.error(Status.Unauthorized, 'Invalid or missing token');
    }

    return res.error(
      Status.InternalServerError,
      'Failed to fetch wallet balance'
    );
  }
};
