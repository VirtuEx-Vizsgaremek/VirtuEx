import { User } from '@/entities/user.entity';
import Status from '@/enum/status';
import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { z } from 'zod';

export const schemas = {
  get: {
    res: z.object({
      wallet_id: z.string()
    })
  }
};

export const get = async (
  _req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  try {
    const db = (await orm).em.fork();

    const devUser = await db.findOne(
      User,
      { username: 'john643' },
      { populate: ['wallet'] }
    );

    if (!devUser?.wallet) {
      return res.error(Status.NotFound, 'Default wallet not found');
    }

    return res.status(Status.Ok).json({
      wallet_id: devUser.wallet.id.toString()
    });
  } catch (error) {
    console.error('Error resolving default wallet:', error);

    return res.error(
      Status.InternalServerError,
      'Failed to resolve default wallet'
    );
  }
};
