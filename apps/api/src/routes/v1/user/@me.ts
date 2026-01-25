import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';

export const get = (req: Request, res: Response<string>) => {
  res.status(Status.Ok).send('Hello, World!');
};

export const patch = (req: Request, res: Response<string>) => {
  res.status(Status.Ok).send('Hello, World!');
};

export const del = (req: Request, res: Response<string>) => {
  res.status(Status.Ok).send('Hello, World!');
};
