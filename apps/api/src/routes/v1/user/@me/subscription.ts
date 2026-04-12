import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';
import { ValidationError } from '@/util/errors';

import { User } from '@/entities/user.entity';
import { Subscription } from '@/entities/subscription.entity';
import { SubscriptionPlan } from '@/entities/subscription_plan.entity';
import Status from '@/enum/status';
import { formatSub, subscriptionShape } from '../subscription.shared';
import { toDateOrNull, toIsoOrNull } from '@/util/dates';
import {
  BillingPeriod,
  applyPendingOrRenewIfExpired,
  BillingError,
  chargeUsdForSubscription,
  getPeriodDays,
  getPlanPriceCents,
  InsufficientFundsError
} from '@/util/billing';

import { randomUUID } from 'crypto';

class SubscriptionUnexpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionUnexpectedError';
  }
}

import { z } from 'zod';

export const schemas = {
  get: { res: subscriptionShape },
  post: {
    req: z.object({
      plan_name: z.string(),
      billing_period: z.enum(['monthly', 'yearly']).optional()
    }),
    res: subscriptionShape
  }
};

export const get = async (
  req: Request,
  res: Response<z.infer<typeof schemas.get.res>>
) => {
  let authUser: User | null = null;

  try {
    const db = (await orm).em.fork();
    authUser = await req.getUser();
    if (!authUser) {
      return res.error(Status.Unauthorized, 'Invalid or missing token');
    }

    const currentUser = authUser;

    const sub = await db.transactional(async (em) => {
      const user = await em.findOne(
        User,
        { id: currentUser.id },
        { populate: ['wallet'] }
      );

      if (!user) {
        throw new Error('User not found');
      }

      const applyResult = await applyPendingOrRenewIfExpired(em, user);
      if (!applyResult) {
        return null;
      }

      if (applyResult.action !== 'none') {
        await em.flush();
      }

      return applyResult.subscription;
    });

    if (!sub) {
      return res.error(Status.NotFound, 'No subscription found');
    }

    return res.status(Status.Ok).json(formatSub(sub));
  } catch (error) {
    if (error instanceof InsufficientFundsError) {
      if (!authUser) {
        return res.error(Status.Unauthorized, 'Invalid or missing token');
      }

      const fallbackEm = (await orm).em.fork();
      const sub = await fallbackEm.findOne(
        Subscription,
        { user: authUser.id },
        { populate: ['plan', 'pendingPlan'] }
      );

      if (!sub) {
        return res.error(Status.NotFound, 'No subscription found');
      }

      return res.status(Status.Ok).json(formatSub(sub));
    }
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
  const reqId = randomUUID();
  const logUnexpected = (err: unknown) => {
    const safeErr =
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : { message: String(err) };
    console.error('[subscription] error', { reqId, err: safeErr });
  };

  try {
    const authUser = await req.getUser();
    if (!authUser) {
      return res.error(Status.Unauthorized, 'Invalid or missing token');
    }
    const db = (await orm).em.fork();

    const { plan_name, billing_period } = req.validateBody(schemas.post.req);
    const period: BillingPeriod = billing_period ?? 'monthly';

    const plan = await db.findOne(SubscriptionPlan, { name: plan_name });
    if (!plan) {
      return res.error(Status.NotFound, `Plan '${plan_name}' not found`);
    }

    const updatedSub = await db.transactional(async (em) => {
      const user = await em.findOne(
        User,
        { id: authUser.id },
        { populate: ['wallet'] }
      );

      if (!user) {
        throw new Error('User not found');
      }

      const targetPlan = await em.findOne(SubscriptionPlan, { id: plan.id });
      if (!targetPlan) {
        throw new Error('Target plan not found');
      }

      const lazyApplyResult = await applyPendingOrRenewIfExpired(em, user, {
        reqId
      });
      let sub = lazyApplyResult?.subscription ?? null;

      if (sub && !sub.billingPeriod) {
        sub.billingPeriod = 'monthly';
      }

      const currentPlanName = sub?.plan?.name ?? 'none';
      const currentPeriod: BillingPeriod = sub?.billingPeriod ?? 'monthly';
      const comparisonPeriod: BillingPeriod = period;
      const currentPriceCents = sub
        ? getPlanPriceCents(sub.plan, comparisonPeriod)
        : BigInt(0);
      const targetPriceCents = getPlanPriceCents(targetPlan, comparisonPeriod);
      const isDowngrade = !!sub && targetPriceCents < currentPriceCents;

      console.log('[subscription.change.request]', {
        userId: user.id.toString(),
        username: authUser.username,
        currentPlan: currentPlanName,
        targetPlan: targetPlan.name,
        currentPeriod,
        targetPeriod: period,
        currentPriceCents: currentPriceCents.toString(),
        targetPriceCents: targetPriceCents.toString(),
        decision: isDowngrade ? 'downgrade_scheduled' : 'upgrade'
      });

      const now = new Date();

      if (!sub) {
        sub = new Subscription();
        sub.user = user;
        em.persist(sub);
      }

      if (!isDowngrade) {
        const expiresAt =
          targetPriceCents > BigInt(0)
            ? new Date(
                now.getTime() + getPeriodDays(period) * 24 * 60 * 60 * 1000
              )
            : null;

        sub.plan = targetPlan;
        sub.billingPeriod = period;
        sub.startedAt = now;
        sub.expiresAt = expiresAt;
        sub.pendingPlan = null;
        sub.pendingBillingPeriod = null;
        sub.pendingEffectiveAt = null;

        if (targetPriceCents > BigInt(0)) {
          try {
            await chargeUsdForSubscription(em, user, targetPriceCents, {
              reason: 'subscription',
              planName: targetPlan.name,
              period
            });
          } catch (err) {
            if (
              err instanceof BillingError ||
              err instanceof InsufficientFundsError
            ) {
              throw err;
            }
            logUnexpected(err);
            throw new SubscriptionUnexpectedError('Subscription charge failed');
          }
        }

        console.log('[subscription.change.applied]', {
          userId: user.id.toString(),
          plan: targetPlan.name,
          period,
          startedAt: toIsoOrNull(sub.startedAt),
          expiresAt: toIsoOrNull(sub.expiresAt)
        });
      } else {
        sub.pendingPlan = targetPlan;
        sub.pendingBillingPeriod = period;
        sub.pendingEffectiveAt = toDateOrNull(sub.expiresAt);

        console.log('[subscription.change.scheduled]', {
          userId: user.id.toString(),
          currentPlan: sub.plan.name,
          pendingPlan: targetPlan.name,
          pendingPeriod: period,
          pendingEffectiveAt: toIsoOrNull(sub.pendingEffectiveAt)
        });
      }

      try {
        await em.flush();
      } catch (err) {
        logUnexpected(err);
        throw new SubscriptionUnexpectedError(
          'Subscription persistence failed'
        );
      }

      return sub;
    });

    return res.status(Status.Ok).json(formatSub(updatedSub));
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.error(Status.BadRequest, 'Invalid request body');
    }
    if (error instanceof InsufficientFundsError) {
      return res.error(Status.Conflict, 'Insufficient balance');
    }
    if (error instanceof BillingError) {
      return res.error(Status.Conflict, error.message);
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return res.error(Status.Unauthorized, 'Invalid or missing token');
    }
    if (error instanceof Error && error.message === 'User not found') {
      return res.error(Status.NotFound, 'User not found');
    }
    if (error instanceof SubscriptionUnexpectedError) {
      return res.error(
        Status.InternalServerError,
        `Subscription change failed. Ref: ${reqId}`
      );
    }

    logUnexpected(error);
    return res.error(
      Status.InternalServerError,
      `Subscription change failed. Ref: ${reqId}`
    );
  }
};
