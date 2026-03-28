import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';
import { Subscription } from '@/entities/subscription.entity';
import Permissions from '@/enum/permissions';
import Status from '@/enum/status';

import { z } from 'zod';

export const schemas = {
  get: {
    res: z.object({
      id: z.string(),
      plan_id: z.string(),
      plan_name: z.string(),
      monthly_ai_credits: z.number(),
      assets_max: z.number(),
      stop_loss: z.boolean(),
      real_time: z.boolean(),
      trading_view: z.boolean(),
      price: z.number(),
      started_at: z.date(),
      expires_at: z.date().nullable()
    })
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  try {
    const requester = await req.getUser();
    const isAdmin =
      (requester.permissions & Permissions.Admin) === Permissions.Admin;

    if (!isAdmin) {
      return res.error(Status.Forbidden, 'Admin access required');
    }

    const { id } = req.params;
    const db = (await orm).em.fork();

    const user = await db.findOne(User, { id: BigInt(id) });
    if (!user) {
      return res.error(Status.NotFound, 'User not found');
    }

    const sub = await db.findOne(
      Subscription,
      { user },
      { populate: ['plan'] }
    );

    if (!sub) {
      return res.error(Status.NotFound, 'No subscription found for this user');
    }

    return res.status(Status.Ok).json({
      id: sub.id.toString(),
      plan_id: sub.plan.id.toString(),
      plan_name: sub.plan.name,
      monthly_ai_credits: sub.plan.monthlyAiCredits,
      assets_max: sub.plan.assetsMax,
      stop_loss: sub.plan.stopLoss,
      real_time: sub.plan.realTime,
      trading_view: sub.plan.displayFeatures.tradingView,
      price: sub.plan.price,
      started_at: sub.startedAt,
      expires_at: sub.expiresAt ?? null
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return res.error(Status.Unauthorized, 'Invalid or missing token');
    }
    return res.error(
      Status.InternalServerError,
      'Failed to fetch subscription'
    );
  }
};
