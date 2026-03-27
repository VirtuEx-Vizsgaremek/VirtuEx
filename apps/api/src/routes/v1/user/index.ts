import Status from '@/enum/status';
import Permissions from '@/enum/permissions';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';
import { z } from 'zod';

export const schemas = {
  get: {
    res: z.array(
      z.object({
        id: z.bigint(),
        username: z.string(),
        full_name: z.string(),
        email: z.email(),
        bio: z.string().nullable().optional(),
        avatar: z.string().nullable().optional(),
        wallet: z.bigint(),
        permissions: z.number(),
        subscription: z.bigint().nullable(),
        activated: z.boolean()
      })
    )
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  const requester = await req.getUser();
  const isAdmin =
    (requester.permissions & Permissions.Admin) === Permissions.Admin;

  if (!isAdmin) {
    return res.error(Status.Forbidden, 'Admin access required');
  }

  const db = (await orm).em.fork();
  const users = await db.find(
    User,
    {},
    { populate: ['wallet', 'subscription'] }
  );

  return res.status(Status.Ok).json(
    users.map((user) => ({
      id: user.id,
      username: user.username,
      full_name: user.fullName,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      wallet: user.wallet.id,
      permissions: user.permissions,
      subscription: user.subscription?.id ?? null,
      activated: user.activated
    }))
  );
};
