import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { Wallet } from '@/entities/wallet.entity';
import { Asset } from '@/entities/asset.entity';

import Status from '@/enum/status';
import { CurrencyType } from '@/enum/currency_type';

import { z } from 'zod';

export const schemas = {
  get: {
    res: z.array(
      z.object({
        id: z.string(),
        currency: z.string(),
        symbol: z.string(),
        amount: z.string(),
        type: z.nativeEnum(CurrencyType),
        precision: z.number()
      })
    )
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  try {
    const db = (await orm).em.fork();
    const { id } = req.params;

    // Convert string ID to BigInt for database query
    const walletId = BigInt(id);
    const wallet = await db.findOne(Wallet, { id: walletId });

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

    return res.status(Status.Ok).json(formattedAssets);
  } catch (error) {
    console.error('Error fetching wallet assets:', error);

    return res.error(
      Status.InternalServerError,
      'Failed to fetch wallet assets'
    );
  }
};
