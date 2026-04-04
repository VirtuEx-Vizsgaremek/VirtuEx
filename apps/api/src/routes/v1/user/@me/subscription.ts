import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';
import { Subscription } from '@/entities/subscription.entity';
import { SubscriptionPlan } from '@/entities/subscription_plan.entity';
import Status from '@/enum/status';
import { formatSub, subscriptionShape } from '../subscription.shared';

import { z } from 'zod';

export const schemas = {
  get: { res: subscriptionShape },
  post: {
    req: z.object({ plan_name: z.string() }),
    res: subscriptionShape
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  try {
    const user = await req.getUser();
    const db = (await orm).em.fork();

    const sub = await db.findOne(
      Subscription,
      { user },
      { populate: ['plan'] }
    );

    if (!sub) {
      return res.error(Status.NotFound, 'No subscription found');
    }

    return res.status(Status.Ok).json(formatSub(sub));
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

export const post = async (
  req: Request,
  res: Response<z.infer<typeof schemas.post.res>>
) => {
  try {
    const authUser = await req.getUser();
    const db = (await orm).em.fork();

    const { plan_name } = req.validateBody(schemas.post.req);

    const plan = await db.findOne(SubscriptionPlan, { name: plan_name });
    if (!plan) {
      return res.error(Status.NotFound, `Plan '${plan_name}' not found`);
    }

    // Re-fetch user within this fork to avoid cross-EM-fork contamination
    const user = db.getReference(User, authUser.id);

    let sub = await db.findOne(
      Subscription,
      { user: authUser.id as any },
      { populate: ['plan'] }
    );

    if (!sub) {
      sub = new Subscription();
      sub.user = user;
      sub.plan = plan;
      sub.startedAt = new Date();
      sub.expiresAt =
        plan.price > 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;
      db.persist(sub);
    } else {
      sub.plan = plan;
      sub.startedAt = new Date();
      sub.expiresAt =
        plan.price > 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;
    }

    await db.flush();

    console.log(
      `[subscription] User ${authUser.username} switched to plan: ${plan_name}`
    );

    return res.status(Status.Ok).json(formatSub(sub));
  } catch (error) {
    console.error('[subscription POST] Error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return res.error(Status.Unauthorized, 'Invalid or missing token');
    }
    return res.error(
      Status.InternalServerError,
      'Failed to update subscription'
    );
  }
};
