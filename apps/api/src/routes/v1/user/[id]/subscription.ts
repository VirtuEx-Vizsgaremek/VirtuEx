import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';
import { Subscription } from '@/entities/subscription.entity';
import { SubscriptionPlan } from '@/entities/subscription_plan.entity';
import Permissions from '@/enum/permissions';
import Status from '@/enum/status';
import { formatSub, subscriptionShape } from '../subscription.shared';

import { z } from 'zod';

export const schemas = {
  get: {
    res: subscriptionShape
  },
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
    const requester = await req.getUser();
    const isAdmin =
      (requester.permissions & Permissions.Admin) === Permissions.Admin;

    if (!isAdmin) {
      return res.error(Status.Forbidden, 'Admin access required');
    }

    const { id } = req.params;
    const targetUserId = BigInt(id);
    const db = (await orm).em.fork();

    const { plan_name } = req.validateBody(schemas.post.req);

    const plan = await db.findOne(SubscriptionPlan, { name: plan_name });
    if (!plan) {
      return res.error(Status.NotFound, `Plan '${plan_name}' not found`);
    }

    const user = await db.findOne(User, { id: targetUserId });
    if (!user) {
      return res.error(Status.NotFound, 'User not found');
    }

    let sub = await db.findOne(Subscription, { user }, { populate: ['plan'] });

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

    return res.status(Status.Ok).json(formatSub(sub));
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return res.error(Status.Unauthorized, 'Invalid or missing token');
    }
    return res.error(
      Status.InternalServerError,
      'Failed to update subscription'
    );
  }
};
