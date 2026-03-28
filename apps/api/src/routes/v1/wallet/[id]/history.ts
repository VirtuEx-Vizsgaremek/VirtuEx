import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { Wallet } from '@/entities/wallet.entity';
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
    const user = await req.getUser();
    const db = (await orm).em.fork();
    const { id } = req.params;

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

    if (wallet.user.id !== user.id) {
      return res.error(Status.Forbidden, 'Access denied');
    }

    const transactions = await db.find(
      Transaction,
      { asset: { wallet } },
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
      wallet_id: wallet.id.toString(),
      total_transactions: transactions.length,
      transactions: formattedTransactions
    });
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
