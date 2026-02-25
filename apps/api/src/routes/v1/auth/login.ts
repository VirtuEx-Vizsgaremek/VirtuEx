import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';

import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { z } from 'zod';
import moment from 'moment';

export const schemas = {
  post: {
    res: z.object({
      jwt: z.string(),
      mfa: z.boolean(),
      expires: z.date()
    }),
    req: z.object({
      email: z.email(),
      password: z.string()
    })
  }
};

export const post = async (
  req: Request,
  res: Response<z.infer<typeof schemas.post.res>>
) => {
  const { email, password } = req.validateBody(schemas.post.req);

  const db = (await orm).em.fork();

  const user = await db.findOne(User, { email });
  if (!user)
    return res.error(
      Status.Forbidden,
      'Either the email or password was wrong.'
    );

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.error(
      Status.Forbidden,
      'Either the email or password was wrong.'
    );

  const hasMfa = user.mfaSecret !== null && user.mfaSecret !== undefined;

  const token = sign(
    {
      id: user.id.toString(),
      email: user.email,
      mfa: hasMfa
    },
    process.env.JWT_SECRET!,
    { expiresIn: hasMfa ? '15m' : '30d' }
  );

  return res.status(Status.Ok).send({
    jwt: token,
    mfa: hasMfa,
    expires: moment()
      .add(hasMfa ? { minutes: 15 } : { months: 1 })
      .toDate()
  });
};
