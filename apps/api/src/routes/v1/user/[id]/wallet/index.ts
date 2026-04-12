import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';

import Permissions from '@/enum/permissions';
import Status from '@/enum/status';
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
    const requester = await req.getUser();
    const isAdmin =
      (requester.permissions & Permissions.Admin) === Permissions.Admin;

    if (!isAdmin) {
      return res.error(Status.Forbidden, 'Admin access required');
    }

    const { id } = req.params;
    const db = (await orm).em.fork();

    const user = await db.findOne(
      User,
      { id: BigInt(id) },
      {
        populate: ['wallet']
      }
    );

    if (!user) {
      return res.error(Status.NotFound, 'User not found');
    }

    if (!user.wallet) {
      return res.error(Status.NotFound, 'Wallet not found');
    }

    const walletAssets = await getWalletAssetsWithPrices(db, user.wallet);

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
