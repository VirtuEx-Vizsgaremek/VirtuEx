import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';
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
      subscription: z.bigint(),
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

  res.status(Status.Ok).json({
    id: user.id,
    username: user.username,
    full_name: user.fullName,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    wallet: user.wallet.id,
    permissions: user.permissions,
    subscription: user.subscription.id,
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
  } catch (e: any) {
    if (e.name === 'UniqueConstraintViolationException')
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

  await db.remove(user).flush();
  res.status(Status.NoContent).end();
};
