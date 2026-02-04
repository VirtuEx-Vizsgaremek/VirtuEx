import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';

import { orm } from '@/util/orm';

import { sign } from 'jsonwebtoken';
import { z } from 'zod';
import { generateSecret, generate, verify } from 'otplib';
import moment from 'moment';

export const schemas = {
  post: {
    req: z.union([
      z.object({
        action: 'check',
        code: z
          .string()
          .regex(/[0-9]{6}/)
          .optional()
      }),
      z.object({
        action: 'new'
      })
    ])
  }
};

export const post = async (req: Request, res: Response<any>) => {
  const { action } = req.validateBody(schemas.post.req);

  const user = await req.getUser(true);
  const db = (await orm).em.fork();

  if (action === 'check') {
    const { code } = req.body;

    const result = await verify({ secret: user.mfaSecret!, token: code });

    if (result.valid) {
      const token = sign(
        {
          id: user.id.toString(),
          email: user.email,
          mfa: false
        },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      );

      return res.status(Status.Ok).json({
        token,
        espires: moment().add({ months: 1 }).toDate()
      });
    }
    return res.error(Status.Unauthorized, 'Invalid token.');
  }

  if (action === 'new') {
    const secret = generateSecret();

    user.mfaSecret = secret;
    await db.persist(user).flush();

    return res.status(Status.Ok).json({
      secret
    });
  }
};
