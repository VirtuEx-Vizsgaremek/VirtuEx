import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { Wallet } from '@/entities/wallet.entity';

import Status from '@/enum/status';
import Permissions from '@/enum/permissions';
import { z } from 'zod';

import { getWalletHistory } from '@/util/wallet';

export const schemas = {
  get: {
    res: z.object({
      wallet_id: z.string(),
      total_transactions: z.number(),
      transactions: z.array(
        z.object({
          id: z.string(),
          asset_id: z.string(),
          currency: z.string(),
          symbol: z.string(),
          amount: z.string(),
          direction: z.enum(['in', 'out']),
          status: z.enum(['pending', 'completed', 'failed']),
          created_at: z.date(),
          updated_at: z.date()
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

    const walletHistory = await getWalletHistory(db, wallet);

    return res.status(Status.Ok).json(walletHistory);
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return res.error(Status.Unauthorized, 'Invalid or missing token');
    }

    return res.error(
      Status.InternalServerError,
      'Failed to fetch wallet transactions'
    );
  }
};
