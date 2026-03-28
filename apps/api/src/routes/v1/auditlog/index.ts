import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';

import { AuditLog } from '@/entities/log.entity';
import { orm } from '@/util/orm';

export const get = async (req: Request, res: Response<AuditLog[]>) => {
  const db = (await orm).em.fork();

  const logs = await db.findAll(AuditLog);

  res.status(Status.Ok).json(logs);
};
