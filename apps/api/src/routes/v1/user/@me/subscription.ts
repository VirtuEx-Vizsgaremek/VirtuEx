import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';
import { Subscription } from '@/entities/subscription.entity';
import { SubscriptionPlan } from '@/entities/subscription_plan.entity';
import Status from '@/enum/status';

import { z } from 'zod';

const subscriptionShape = z.object({
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
});

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

function formatSub(sub: Subscription) {
  return {
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
  };
}
