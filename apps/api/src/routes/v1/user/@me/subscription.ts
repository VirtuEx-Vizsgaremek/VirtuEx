import { Request, Response } from '@/util/handler';
import { orm } from '@/util/orm';

import { User } from '@/entities/user.entity';
import { Subscription } from '@/entities/subscription.entity';
import { SubscriptionPlan } from '@/entities/subscription_plan.entity';
import Status from '@/enum/status';
import { formatSub, subscriptionShape } from '../subscription.shared';
import {
  BillingPeriod,
  applyPendingOrRenewIfExpired,
  chargeUsdForSubscription,
  getPeriodDays,
  getPlanPriceCents,
  InsufficientFundsError
} from '@/util/billing';

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
  try {
    const authUser = await req.getUser();
    const db = (await orm).em.fork();

    const sub = await db.transactional(async (em) => {
      const user = await em.findOne(
        User,
        { id: authUser.id },
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
      return res.error(Status.Conflict, 'Insufficient USD balance');
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
  try {
    const authUser = await req.getUser();
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

      const lazyApplyResult = await applyPendingOrRenewIfExpired(em, user);
      let sub = lazyApplyResult?.subscription ?? null;

      if (sub && !sub.billingPeriod) {
        sub.billingPeriod = 'monthly';
      }

      const currentPlanName = sub?.plan?.name ?? 'none';
      const currentPeriod: BillingPeriod = sub?.billingPeriod ?? 'monthly';
      const currentPriceCents = sub
        ? getPlanPriceCents(sub.plan.price, currentPeriod)
        : BigInt(0);
      const targetPriceCents = getPlanPriceCents(targetPlan.price, period);
      const isUpgrade = !sub || targetPriceCents >= currentPriceCents;

      console.log('[subscription.change.request]', {
        userId: user.id.toString(),
        username: authUser.username,
        currentPlan: currentPlanName,
        targetPlan: targetPlan.name,
        currentPeriod,
        targetPeriod: period,
        currentPriceCents: currentPriceCents.toString(),
        targetPriceCents: targetPriceCents.toString(),
        decision: isUpgrade ? 'upgrade' : 'downgrade_scheduled'
      });

      const now = new Date();

      if (!sub) {
        sub = new Subscription();
        sub.user = user;
        em.persist(sub);
      }

      if (isUpgrade) {
        const expiresAt =
          targetPlan.price > 0
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

        if (targetPlan.price > 0) {
          await chargeUsdForSubscription(em, user, targetPriceCents, {
            reason: 'subscription',
            planName: targetPlan.name,
            period
          });
        }

        console.log('[subscription.change.applied]', {
          userId: user.id.toString(),
          plan: targetPlan.name,
          period,
          startedAt: sub.startedAt.toISOString(),
          expiresAt: sub.expiresAt?.toISOString() ?? null
        });
      } else {
        sub.pendingPlan = targetPlan;
        sub.pendingBillingPeriod = period;
        sub.pendingEffectiveAt = sub.expiresAt ?? null;

        console.log('[subscription.change.scheduled]', {
          userId: user.id.toString(),
          currentPlan: sub.plan.name,
          pendingPlan: targetPlan.name,
          pendingPeriod: period,
          pendingEffectiveAt: sub.pendingEffectiveAt?.toISOString() ?? null
        });
      }

      await em.flush();

      return sub;
    });

    return res.status(Status.Ok).json(formatSub(updatedSub));
  } catch (error) {
    console.error('[subscription POST] Error:', error);
    if (error instanceof InsufficientFundsError) {
      return res.error(Status.Conflict, 'Insufficient USD balance');
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return res.error(Status.Unauthorized, 'Invalid or missing token');
    }
    return res.error(
      Status.InternalServerError,
      'Failed to update subscription'
    );
  }
};
