import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { Currency } from '@/entities/currency.entity';
import { Asset } from '@/entities/asset.entity';

import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { z } from 'zod';

const TOPUP_AMOUNT = 1000_00n;
const TOPUP_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

const parseNextTopupAt = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  return 0;
};

export const schemas = {
  post: {
    res: z.object({
      credited: z.string(),
      balance: z.string(),
      next_topup_at: z.number(),
      token: z.string()
    })
  }
};

export const post = async (
  req: Request,
  res: Response<z.infer<typeof schemas.post.res>>
) => {
  const user = await req.getUser();
  const db = (await orm).em.fork();

  const authHeader = req.getHeader('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return res.error(Status.Unauthorized, 'Invalid or missing token');

  let tokenData: JwtPayload & {
    next_topup_at?: number | string;
    mfa?: boolean;
  };

  try {
    tokenData = verify(token, process.env.JWT_SECRET!) as JwtPayload & {
      next_topup_at?: number | string;
      mfa?: boolean;
    };
  } catch (error) {
    return res.error(Status.Unauthorized, 'Invalid or missing token');
  }

  const now = Date.now();
  const nextTopupAt = parseNextTopupAt(tokenData.next_topup_at);
  if (now < nextTopupAt) {
    return res.status(Status.TooManyRequests).json({
      next_topup_at: nextTopupAt,
      remaining_ms: nextTopupAt - now
    } as any);
  }

  await db.populate(user, ['wallet']);
  if (!user.wallet) {
    return res.error(Status.BadRequest, 'User has no wallet.');
  }

  const currency = await db.findOne(Currency, { symbol: 'USD' });
  if (!currency)
    return res.error(
      Status.NotFound,
      'Currency with this symbol is not found.'
    );

  let asset = await db.findOne(
    Asset,
    { wallet: user.wallet, currency },
    { populate: ['wallet', 'currency'] }
  );

  if (!asset) {
    asset = new Asset();
    asset.wallet = user.wallet;
    asset.currency = currency;
    asset.amount = 0n;
    db.persist(asset);
  }

  asset.amount += TOPUP_AMOUNT;

  await db.flush();

  const newNextTopupAt = now + TOPUP_COOLDOWN_MS;
  const newToken = sign(
    {
      id: user.id.toString(),
      email: user.email,
      mfa: tokenData.mfa ?? false,
      next_topup_at: newNextTopupAt
    },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  );

  return res.status(Status.Ok).json({
    credited: TOPUP_AMOUNT.toString(),
    balance: asset.amount.toString(),
    next_topup_at: newNextTopupAt,
    token: newToken
  });
};
