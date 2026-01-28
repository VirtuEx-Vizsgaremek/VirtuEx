import { User } from '@/entities/user.entity';
import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
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
      permissions: z.bigint(),
      subscription: z.string(),
      activated: z.boolean()
    })
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  const user = await req.getUser();

  // TODO: omit password
  res.status(Status.Ok).json({
    id: user.id,
    username: user.username,
    full_name: user.fullName,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    wallet: user.wallet.id,
    permissions: user.permissions,
    subscription: user.subscription,
    activated: user.activated
  });
};

export const patch = (req: Request, res: Response<string>) => {
  res.status(Status.Ok).send('Hello, World!');
};

export const del = (req: Request, res: Response<string>) => {
  res.status(Status.Ok).send('Hello, World!');
};
