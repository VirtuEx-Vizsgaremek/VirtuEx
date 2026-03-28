import Status from '@/enum/status';
import Permissions from '@/enum/permissions';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';
import { z } from 'zod';

export const schemas = {
  get: {
    res: z.object({
      id: z.bigint(),
      permissions: z.number(),
      activated: z.boolean()
    })
  },
  patch: {
    req: z.object({
      permissions: z.number().optional(),
      activated: z.boolean().optional()
    })
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  const requester = await req.getUser();
  const { id } = req.params;

  const db = (await orm).em.fork();
  const user = await db.findOne(User, { id: BigInt(id) });

  if (!user)
    return res.error(Status.NotFound, 'User with this id is not found.');

  const isAdmin =
    (requester.permissions & Permissions.Admin) === Permissions.Admin;
  if (!isAdmin && requester.id !== user.id)
    return res.error(Status.Forbidden, 'Insufficient permissions.');

  return res.status(Status.Ok).json({
    id: user.id,
    permissions: user.permissions,
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
  const { permissions, activated } = req.validateBody(schemas.patch.req);

  if (permissions === undefined && activated === undefined)
    return res.error(Status.BadRequest, 'No restriction fields provided.');

  const db = (await orm).em.fork();
  const user = await db.findOne(User, { id: BigInt(id) });

  if (!user)
    return res.error(Status.NotFound, 'User with this id is not found.');

  if (permissions !== undefined) user.permissions = permissions;
  if (activated !== undefined) user.activated = activated;

  await db.persist(user).flush();

  return res.status(Status.NoContent).end();
};
