import { Transaction } from '@/entities/transaction.entity';
import Status from '@/enum/status';
import Permissions from '@/enum/permissions';
import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

export const get = async (req: Request, res: Response<object[]>) => {
  const requester = await req.getUser();
  const isAdmin =
    (requester.permissions & Permissions.Admin) === Permissions.Admin;

  if (!isAdmin) return res.error(Status.Forbidden, 'Admin access required');

  const db = (await orm).em.fork();

  const transactions = await db.findAll(Transaction, {
    populate: ['asset', 'asset.currency', 'asset.wallet', 'asset.wallet.user']
  });

  return res.status(Status.Ok).json(
    transactions.map((tx) => ({
      id: tx.id.toString(),
      user: {
        id: tx.asset.wallet.user.id.toString(),
        username: tx.asset.wallet.user.username,
        fullName: tx.asset.wallet.user.fullName
      },
      currencySymbol: tx.asset.currency.symbol,
      currencyName: tx.asset.currency.name,
      amount: tx.amount.toString(),
      direction: tx.direction,
      status: tx.status,
      createdAt: tx.createdAt.getTime(),
      updatedAt: tx.updatedAt.getTime()
    }))
  );
};
