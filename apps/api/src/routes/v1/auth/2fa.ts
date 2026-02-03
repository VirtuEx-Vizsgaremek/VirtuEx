import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';

import { z } from 'zod';

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

export const post = async (req: Request, res: Response<void>) => {
  const { action } = req.validateBody(schemas.post.req);

  if (action === 'check') {
    const { code } = req.body;

    console.log(code);

    return res.status(Status.NoContent).end();
  }

  if (action === 'new') {
    return res.status(Status.NoContent).end();
  }
};
