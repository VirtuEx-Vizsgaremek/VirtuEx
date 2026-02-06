import { Code } from '@/entities/code.entity';
import { User } from '@/entities/user.entity';
import { CodeType } from '@/enum/code_type';
import Status from '@/enum/status';
import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { z } from 'zod';

export const schemas = {
  post: {
    req: z.object({
      code: z.string()
    })
  }
};

export const post = async (req: Request, res: Response<void>) => {
  const { code } = req.validateBody(schemas.post.req);

  const db = (await orm).em.fork();
  const has = await db.findOne(Code, {
    code,
    type: CodeType.AccountActivation
  });

  if (has) {
    const user = await db.findOne(User, { id: has.user.id });
    if (!user) throw new Error('Ran into a very critical error with the db!');

    // check again to make sure
    if (has.code === code) {
      user.activated = true;

      await db.persist(user).flush();
      await db.remove(has).flush();

      return res.status(Status.NoContent).end();
    }
  }

  return res.error(Status.BadRequest, 'Invalid code.');
};
