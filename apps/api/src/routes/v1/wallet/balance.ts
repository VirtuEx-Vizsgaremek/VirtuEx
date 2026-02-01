import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';
import { Asset } from '@/entities/asset.entity';

import Status from '@/enum/status';
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
          type: z.enum(['fiat', 'crypto']),
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
    const user = await req.getUser();

    if (!user) {
      return res.error(Status.Unauthorized, 'User not authenticated');
    }

    const db = (await orm).em.fork();

    const userWithWallet = await db.findOne(
      User,
      { id: user.id },
      { populate: ['wallet'] }
    );

    if (!userWithWallet || !userWithWallet.wallet) {
      return res.error(Status.NotFound, 'Wallet not found');
    }

    const assets = await db.find(
      Asset,
      { wallet: userWithWallet.wallet },
      { populate: ['currency'] }
    );

    const formattedAssets = assets.map((asset) => ({
      id: asset.id.toString(),
      currency: asset.currency.name,
      symbol: asset.currency.symbol,
      amount: asset.amount.toString(),
      type: asset.currency.type,
      precision: asset.currency.precision
    }));

    return res.status(Status.Ok).json({
      wallet_id: userWithWallet.wallet.id.toString(),
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
