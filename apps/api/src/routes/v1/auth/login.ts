import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';

import { z } from 'zod';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const schemas = {
  post: {
    res: z.object({
      jwt: z.string(),
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

  try {
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

    const token = sign(
      {
        id: user.id.toString(),
        email: user.email
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    return res.status(Status.Ok).send({
      jwt: token,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    });
  } catch (e: any) {
    throw e;
  }
};
