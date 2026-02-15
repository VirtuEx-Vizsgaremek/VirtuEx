/* eslint-disable no-useless-catch */
// This file should be named as 'history'
import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';
import { Transaction } from '@/entities/transaction.entity';

import Status from '@/enum/status';
import { z } from 'zod';

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
    const db = (await orm).em.fork();

    // const user = await req.getUser();
    // From cookie

    // if (!user) {
    //   return res.error(Status.Unauthorized, 'User not authenticated');
    // }

    // const userWithWallet = await db.findOne(
    //   User,
    //   { id: user.id },
    //   { populate: ['wallet'] }
    // );

    // ----------- Temp dev block -----------//
    const userWithWallet = await db.findOne(
      User,
      { wallet: { $ne: null } },
      { populate: ['wallet'] }
    );

    if (!userWithWallet || !userWithWallet.wallet) {
      return res.error(
        Status.NotFound,
        '[DEV] User with wallet does not exist.'
      );
    }

    const transactions = await db.find(
      Transaction,
      { asset: { wallet: userWithWallet.wallet } },
      {
        populate: ['asset', 'asset.currency'],
        orderBy: { createdAt: 'DESC' }
      }
    );

    const formattedTransactions = transactions.map((tx) => ({
      id: tx.id.toString(),
      asset_id: tx.asset.id.toString(),
      currency: tx.asset.currency.name,
      symbol: tx.asset.currency.symbol,
      amount: tx.amount.toString(),
      direction: tx.direction,
      status: tx.status,
      created_at: tx.createdAt,
      updated_at: tx.updatedAt
    }));

    return res.status(Status.Ok).json({
      wallet_id: userWithWallet.wallet.id.toString(),
      total_transactions: transactions.length,
      transactions: formattedTransactions
    });
  } catch (e: any) {
    throw e;
  }
};
