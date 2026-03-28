import Status from '@/enum/status';
import Permissions from '@/enum/permissions';

import { Request, Response } from '@/util/handler';

import S3 from '@/util/s3';

import sharp from 'sharp';
import crypto from 'node:crypto';
import { orm } from '@/util/orm';
import { User } from '@/entities/user.entity';

const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];

export const patch = async (req: Request, res: Response<void>) => {
  const requester = await req.getUser();
  const isAdmin =
    (requester.permissions & Permissions.Admin) === Permissions.Admin;

  if (!isAdmin) {
    return res.error(Status.Forbidden, 'Admin access required');
  }

  const files = req.files;
  const { id } = req.params;

  const db = (await orm).em.fork();
  const user = await db.findOne(User, { id: BigInt(id) });

  if (!user)
    return res.error(Status.NotFound, 'User with this id is not found.');

  if (!(files.length > 0 && files.length <= 1))
    return res.error(
      Status.BadRequest,
      'No file or more than one file was provided.'
    );

  const file = files[0];

  if (!allowedMime.includes(file.mimetype))
    return res.error(
      Status.BadRequest,
      `Only ${allowedMime.join(', ')} are allowed.`
    );

  const img = await sharp(file.buffer).webp().toBuffer();
  const sha = crypto.createHash('sha1').update(file.filename).digest('hex');
  const key = `avatars/${user.id}/${sha}.webp`;

  user.avatar = sha;

  await S3.putFile(key, img);
  await db.persist(user).flush();

  return res.status(Status.NoContent).end();
};
