import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import z from 'zod';

export const schemas = {
  get: {
    res: z.object({
      id: z.bigint(),
      username: z.string(),
      full_name: z.string(),
      email: z.email(),
      bio: z.string().nullable().optional(),
      avatar: z.string().nullable().optional(),
      wallet: z.bigint(),
      permissions: z.number(),
      subscription: z.bigint().nullable(),
      subscription_plan: z.string().nullable(),
      activated: z.boolean()
    })
  },
  patch: {
    req: z.object({
      username: z.string().optional(),
      full_name: z.string().optional(),
      email: z.email().optional(),
      bio: z.string().nullable().optional()
    })
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  const user = await req.getUser();
  const db = (await orm).em.fork();

  await db.populate(user, ['subscription.plan']);

  res.status(Status.Ok).json({
    id: user.id,
    username: user.username,
    full_name: user.fullName,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    wallet: user.wallet.id,
    permissions: user.permissions,
    subscription: user.subscription?.id ?? null,
    subscription_plan: user.subscription?.plan?.name ?? null,
    activated: user.activated
  });
};

export const patch = async (req: Request, res: Response<void>) => {
  const user = await req.getUser();
  const db = (await orm).em.fork();

  const {
    email,
    username,
    full_name: fullName,
    bio
  } = req.validateBody(schemas.patch.req);

  try {
    if (email) user.email = email;
    if (username) user.username = username;
    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;

    await db.persist(user).flush();

    res.status(Status.NoContent).end();
  } catch (e: unknown) {
    if (e instanceof UniqueConstraintViolationException)
      return res.error(
        Status.Conflict,
        'A user with this username already exists.'
      );

    throw e;
  }
};

export const del = async (req: Request, res: Response<void>) => {
  const user = await req.getUser();
  const db = (await orm).em.fork();

  try {
    console.log('[DELETE] Starting account deletion for user:', user.id);

    // Populate wallet to access it
    await db.populate(user, ['wallet']);
    const walletId = user.wallet?.id;
    console.log('[DELETE] Wallet ID:', walletId);

    // Delete all transactions for each asset in this wallet
    if (walletId) {
      const assets = await db.find('Asset', { wallet: walletId });
      console.log('[DELETE] Found assets:', assets.length);

      for (const asset of assets) {
        console.log('[DELETE] Deleting transactions for asset');
        await db.nativeDelete('Transaction', { asset });
      }
      console.log('[DELETE] All transactions deleted');

      // Delete all assets for this wallet
      console.log('[DELETE] Deleting assets for wallet:', walletId);
      await db.nativeDelete('Asset', { wallet: walletId });
      console.log('[DELETE] All assets deleted');
    }

    // Delete subscription if exists
    console.log('[DELETE] Deleting subscription for user:', user.id);
    await db.nativeDelete('Subscription', { user: user.id });
    console.log('[DELETE] Subscription deleted');

    // Delete codes
    console.log('[DELETE] Deleting codes for user:', user.id);
    await db.nativeDelete('Code', { user: user.id });
    console.log('[DELETE] Codes deleted');

    // Delete wallet last (after all references are gone)
    if (walletId) {
      console.log('[DELETE] Deleting wallet:', walletId);
      await db.nativeDelete('Wallet', { id: walletId });
      console.log('[DELETE] Wallet deleted');
    }

    // Finally delete user
    console.log('[DELETE] Deleting user:', user.id);
    await db.nativeDelete('User', { id: user.id });
    console.log('[DELETE] User deleted successfully');

    res.status(Status.NoContent).end();
  } catch (error) {
    console.error('[DELETE] Error during account deletion:', error);
    res.error(Status.InternalServerError, 'Failed to delete account');
  }
};
