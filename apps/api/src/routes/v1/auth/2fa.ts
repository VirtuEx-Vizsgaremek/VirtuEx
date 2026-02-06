import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';

import { orm } from '@/util/orm';

import { sign } from 'jsonwebtoken';
import { z } from 'zod';
import { generateSecret, verify } from 'otplib';
import moment from 'moment';

export const schemas = {
  post: {
    req: z.object({
      action: z.enum(['check', 'new']),
      code: z.string().regex(/[0-9]{6}/)
    }),
    res: z.union([
      z.object({
        token: z.string(),
        expires: z.date()
      }),
      z.object({
        secret: z.string()
      })
    ])
  }
};

export const post = async (
  req: Request,
  res: Response<z.infer<typeof schemas.post.res>>
) => {
  const { action, code } = req.validateBody(schemas.post.req);

  const user = await req.getUser(true);
  const db = (await orm).em.fork();

  let result;

  if (user.mfaSecret)
    result = await verify({ secret: user.mfaSecret!, token: code });
  else result = { valid: true };

  if (action === 'check' && user.mfaSecret) {
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
        expires: moment().add({ months: 1 }).toDate()
      });
    }
    return res.error(Status.Unauthorized, 'Invalid code.');
  }

  if (action === 'new') {
    if (!result.valid) return res.error(Status.Unauthorized, 'Invalid code.');

    const secret = generateSecret();

    user.mfaSecret = secret;
    await db.persist(user).flush();

    return res.status(Status.Ok).json({
      secret
    });
  }

  return res.error(Status.BadRequest, 'Invalid action.');
};
