import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';

import Permissions from '@/enum/permissions';

import { z } from 'zod';
import { orm } from '@/util/orm';
import { User } from '@/entities/user.entity';

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
      subscription: z.string(),
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
  const user = await db.findOne(User, { id });

  if (!user)
    return res.error(Status.NotFound, 'User with this id is not found.');

  const showEmail =
    (rUser.permissions & Permissions.Admin) !== Permissions.Admin ||
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
    subscription: user.subscription,
    activated: user.activated
  });
};
