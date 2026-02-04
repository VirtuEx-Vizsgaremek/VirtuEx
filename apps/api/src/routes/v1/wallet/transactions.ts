import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';
import { Asset } from '@/entities/asset.entity';

import Status from '@/enum/status';
import { z } from 'zod';

export const schemas = {
  get: {
    res: z.object({
      wallet_id: z.string(),
      total_assets: z.number(),
      assets: z.array(
        z.object({
          id: z.string(),
          currency: z.string(),
          symbol: z.string(),
          amount: z.string(),
          type: z.enum(['fiat', 'crypto']),
          precision: z.number()
        })
      )
    })
  }
};

// export const get = async (
//     req: Request,
//     res: Response<z.infer<typeof schemas.get.res>>
//   ) => {
//     try {
//       const db = (await orm).em.fork();
