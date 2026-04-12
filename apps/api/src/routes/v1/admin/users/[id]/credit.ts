/**
 * Admin API — Credit User Wallet
 *
 * POST /v1/admin/users/:id/credit
 *
 * Admin-only. Credits a user's wallet with a specified amount in a given currency.
 */

import Status from '@/enum/status';
import Permissions from '@/enum/permissions';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';
import { Currency } from '@/entities/currency.entity';
import { Asset } from '@/entities/asset.entity';
import { AuditLog } from '@/entities/log.entity';
import { Action } from '@/enum/action';

import { z } from 'zod';

const creditRequestSchema = z.preprocess(
  (input) => {
    if (!input || typeof input !== 'object') return input;

    const body = input as {
      currency_id?: unknown;
      currency_symbol?: unknown;
    };

    if (typeof body.currency_id === 'string') {
      const trimmed = body.currency_id.trim();
      const hasSymbol =
        typeof body.currency_symbol === 'string' &&
        body.currency_symbol.trim().length > 0;

      if (trimmed.length > 0 && !/^[0-9]+$/.test(trimmed)) {
        return {
          ...body,
          currency_id: undefined,
          currency_symbol: hasSymbol ? body.currency_symbol : trimmed
        };
      }
    }

    return input;
  },
  z
    .object({
      currency_id: z
        .string()
        .regex(/^[0-9]+$/, 'Currency id must be a numeric string')
        .optional(),
      currency_symbol: z
        .string()
        .trim()
        .min(1, 'Currency symbol must be a non-empty string')
        .optional(),
      amount: z
        .string()
        .regex(/^[0-9]+$/, 'Amount must be a positive integer string'),
      reason: z.string().optional()
    })
    .refine((data) => data.currency_id || data.currency_symbol, {
      message: 'Either currency_id or currency_symbol is required',
      path: ['currency_id']
    })
);

export const schemas = {
  post: {
    req: creditRequestSchema,
    res: z.object({
      asset_id: z.string(),
      wallet_id: z.string(),
      currency_id: z.string(),
      credited: z.string(),
      balance: z.string()
    })
  }
};

export const post = async (
  req: Request,
  res: Response<z.infer<typeof schemas.post.res>>
) => {
  const requester = await req.getUser();
  const isAdmin =
    (requester.permissions & Permissions.Admin) === Permissions.Admin;

  if (!isAdmin) {
    return res.error(Status.Forbidden, 'Admin access required');
  }

  const db = (await orm).em.fork();

  const { id } = req.params;
  const userIdStr = String(id);
  if (!/^[0-9]+$/.test(userIdStr))
    return res.error(Status.BadRequest, 'Invalid user id.');

  const {
    currency_id,
    currency_symbol,
    amount: amountStr,
    reason
  } = req.validateBody(schemas.post.req);

  const creditAmount = BigInt(amountStr);

  if (creditAmount <= 0n) {
    return res.error(Status.BadRequest, 'Amount must be greater than zero.');
  }

  const targetUser = await db.findOne(
    User,
    { id: BigInt(userIdStr) },
    { populate: ['wallet'] }
  );

  if (!targetUser)
    return res.error(Status.NotFound, 'User with this id is not found.');

  if (!targetUser.wallet)
    return res.error(Status.BadRequest, 'User has no wallet.');

  const currency = currency_id
    ? await db.findOne(Currency, {
        id: BigInt(currency_id)
      })
    : await db.findOne(Currency, {
        symbol: currency_symbol!.toUpperCase()
      });

  if (!currency)
    return res.error(Status.NotFound, 'Currency with this id is not found.');

  let asset = await db.findOne(
    Asset,
    { wallet: targetUser.wallet, currency },
    { populate: ['wallet', 'currency'] }
  );

  if (!asset) {
    asset = new Asset();
    asset.wallet = targetUser.wallet;
    asset.currency = currency;
    asset.amount = 0n;
    db.persist(asset);
  }

  asset.amount += creditAmount;

  const log = new AuditLog();
  log.user = targetUser;
  log.data = {
    action: Action.AdminCredit,
    currency: asset.id,
    amount: creditAmount,
    admin_user_id: requester.id,
    ...(reason ? { reason } : {})
  };
  db.persist(log);

  await db.flush();

  return res.status(Status.Created).json({
    asset_id: asset.id.toString(),
    wallet_id: targetUser.wallet.id.toString(),
    currency_id: currency.id.toString(),
    credited: creditAmount.toString(),
    balance: asset.amount.toString()
  });
};
