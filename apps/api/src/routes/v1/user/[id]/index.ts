import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';

import Permissions from '@/enum/permissions';

import { z } from 'zod';
import { orm } from '@/util/orm';
import { User } from '@/entities/user.entity';
import { UniqueConstraintViolationException } from '@mikro-orm/core';

export const schemas = {
  get: {
    res: z.object({
      id: z.bigint(),
      username: z.string(),
      full_name: z.string(),
      email: z.email().optional(),
      bio: z.string().nullable().optional(),
      avatar: z.string().nullable().optional(),
      wallet: z.bigint(),
      permissions: z.number(),
      subscription: z.bigint().optional(),
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
  const rUser = await req.getUser();
  const { id } = req.params;

  const db = (await orm).em.fork();
  const user = await db.findOne(
    User,
    { id: BigInt(id) },
    { populate: ['wallet', 'subscription'] }
  );

  if (!user)
    return res.error(Status.NotFound, 'User with this id is not found.');

  const showEmail =
    (rUser.permissions & Permissions.Admin) === Permissions.Admin ||
    rUser.id === user.id;

  res.status(Status.Ok).json({
    id: user.id,
    username: user.username,
    full_name: user.fullName,
    email: showEmail ? user.email : undefined,
    bio: user.bio,
    avatar: user.avatar,
    wallet: user.wallet.id,
    permissions: user.permissions,
    subscription: user.subscription.id,
    activated: user.activated
  });
};

export const patch = async (req: Request, res: Response<void>) => {
  const requester = await req.getUser();
  const isAdmin =
    (requester.permissions & Permissions.Admin) === Permissions.Admin;

  if (!isAdmin) {
    return res.error(Status.Forbidden, 'Admin access required');
  }

  const { id } = req.params;
  const {
    email,
    username,
    full_name: fullName,
    bio
  } = req.validateBody(schemas.patch.req);

  const db = (await orm).em.fork();
  const user = await db.findOne(User, { id: BigInt(id) });

  if (!user)
    return res.error(Status.NotFound, 'User with this id is not found.');

  try {
    if (email) user.email = email;
    if (username) user.username = username;
    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;

    await db.persist(user).flush();

    return res.status(Status.NoContent).end();
  } catch (e: unknown) {
    if (e instanceof UniqueConstraintViolationException)
      return res.error(
        Status.Conflict,
        'A user with this email or username already exists.'
      );

    throw e;
  }
};

export const del = async (req: Request, res: Response<void>) => {
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
    { populate: ['wallet'] }
  );

  if (!user)
    return res.error(Status.NotFound, 'User with this id is not found.');

  try {
    console.log('[ADMIN DELETE] Starting account deletion for user:', user.id);

    const walletId = user.wallet?.id;
    console.log('[ADMIN DELETE] Wallet ID:', walletId);

    if (walletId) {
      const assets = await db.find('Asset', { wallet: walletId });
      console.log('[ADMIN DELETE] Found assets:', assets.length);

      for (const asset of assets) {
        console.log('[ADMIN DELETE] Deleting transactions for asset');
        await db.nativeDelete('Transaction', { asset });
      }
      console.log('[ADMIN DELETE] All transactions deleted');

      console.log('[ADMIN DELETE] Deleting assets for wallet:', walletId);
      await db.nativeDelete('Asset', { wallet: walletId });
      console.log('[ADMIN DELETE] All assets deleted');
    }

    console.log('[ADMIN DELETE] Deleting subscription for user:', user.id);
    await db.nativeDelete('Subscription', { user: user.id });
    console.log('[ADMIN DELETE] Subscription deleted');

    console.log('[ADMIN DELETE] Deleting codes for user:', user.id);
    await db.nativeDelete('Code', { user: user.id });
    console.log('[ADMIN DELETE] Codes deleted');

    if (walletId) {
      console.log('[ADMIN DELETE] Deleting wallet:', walletId);
      await db.nativeDelete('Wallet', { id: walletId });
      console.log('[ADMIN DELETE] Wallet deleted');
    }

    console.log('[ADMIN DELETE] Deleting user:', user.id);
    await db.nativeDelete('User', { id: user.id });
    console.log('[ADMIN DELETE] User deleted successfully');

    return res.status(Status.NoContent).end();
  } catch (error) {
    console.error('[ADMIN DELETE] Error during account deletion:', error);
    return res.error(Status.InternalServerError, 'Failed to delete account');
  }
};
