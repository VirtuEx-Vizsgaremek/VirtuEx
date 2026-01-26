import { User } from '@/entities/user.entity';
import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';

export const get = async (req: Request, res: Response<User>) => {
  const user = await req.getUser();

  // TODO: omit password
  res.status(Status.Ok).send(user);
};

export const patch = (req: Request, res: Response<string>) => {
  res.status(Status.Ok).send('Hello, World!');
};

export const del = (req: Request, res: Response<string>) => {
  res.status(Status.Ok).send('Hello, World!');
};
