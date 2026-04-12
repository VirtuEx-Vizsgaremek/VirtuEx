import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { Wallet } from '@/entities/wallet.entity';

import Status from '@/enum/status';
import Permissions from '@/enum/permissions';
import { CurrencyType } from '@/enum/currency_type';

import { getWalletAssetsWithPrices } from '@/util/wallet';

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
          precision: z.number(),
          price: z.number()
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
    const db = (await orm).em.fork();
    const { id } = req.params;
    const isAdmin =
      (user.permissions & Permissions.Admin) === Permissions.Admin;

    // Convert string ID to BigInt for database query
    const walletId = BigInt(id);
    const wallet = await db.findOne(
      Wallet,
      { id: walletId },
      { populate: ['user'] }
    );

    if (!wallet) {
      return res.error(Status.NotFound, 'Wallet not found');
    }

    if (!isAdmin && wallet.user.id !== user.id) {
      return res.error(Status.Forbidden, 'Access denied');
    }

    const walletAssets = await getWalletAssetsWithPrices(db, wallet);

    return res.status(Status.Ok).json(walletAssets);
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
