import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';

import { Wallet } from '@/entities/wallet.entity';
import { CodeType } from '@/enum/code_type';
import CodeUtil from '@/util/code';
import EMail from '@/util/email';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { z } from 'zod';
import { UniqueConstraintViolationException } from '@mikro-orm/core';

export const schemas = {
  post: {
    res: z.object({
      jwt: z.string(),
      expires: z.date()
    }),
    req: z.object({
      full_name: z.string(),
      username: z.string().min(3).max(32),
      email: z.email(),
      password: z.string()
    })
  }
};

export const post = async (
  req: Request,
  res: Response<z.infer<typeof schemas.post.res>>
) => {
  const {
    full_name: fullName,
    username,
    email,
    password
  } = req.validateBody(schemas.post.req);

  const db = (await orm).em.fork();

  try {
    const saltedPassword = await bcrypt.hash(password, 10);

    const userObject = new User();
    const walletObject = new Wallet();

    userObject.fullName = fullName;
    userObject.username = username;
    userObject.email = email;
    userObject.password = saltedPassword;
    userObject.wallet = walletObject;

    await db.persist(userObject).flush();

    const code = await CodeUtil.genCode(CodeType.AccountActivation, userObject);
    await EMail.sendTemplate(`"${fullName}" <${email}>`, 'verify', {
      fullName,
      link: `http://localhost:3000/auth/verify?code=${code}`,
      year: new Date().getFullYear()
    });

    const token = sign(
      {
        id: userObject.id.toString(),
        email: email
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    return res.status(Status.Ok).send({
      jwt: token,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    });
  } catch (e: unknown) {
    if (e instanceof UniqueConstraintViolationException)
      return res.error(
        Status.Conflict,
        'A user with this email or username already exists.'
      );

    throw e;
  }
};
