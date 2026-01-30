import Status from '@/enum/status';

import { Request, Response } from '@/util/handler';

import S3 from '@/util/s3';

import sharp from 'sharp';
import crypto from 'node:crypto';
import { orm } from '@/util/orm';

const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];

export const patch = async (req: Request, res: Response<string>) => {
  const files = req.files;

  const user = await req.getUser();
  const db = (await orm).em.fork();

  // only allow a single file.
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

  res.status(Status.NoContent).end();
};

export const del = (req: Request, res: Response<string>) => {
  res.status(Status.Ok).send('Hello, World!');
};
