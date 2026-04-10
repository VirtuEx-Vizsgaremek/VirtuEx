import { z } from 'zod';

import { Subscription } from '@/entities/subscription.entity';
import { toDateOrNull, toIsoOrNull } from '@/util/dates';

export const subscriptionShape = z.object({
  id: z.string(),
  plan_id: z.string(),
  plan_name: z.string(),
  monthly_ai_credits: z.number(),
  assets_max: z.number(),
  stop_loss: z.boolean(),
  real_time: z.boolean(),
  trading_view: z.boolean(),
  price: z.number(),
  billing_period: z.enum(['monthly', 'yearly']),
  started_at: z.string().nullable(),
  expires_at: z.string().nullable(),
  is_expired: z.boolean(),
  pending_plan_id: z.string().nullable(),
  pending_plan_name: z.string().nullable(),
  pending_billing_period: z.enum(['monthly', 'yearly']).nullable(),
  pending_effective_at: z.string().nullable()
});

export function formatSub(sub: Subscription) {
  const monthlyPriceCents =
    sub.plan.monthlyPrice && sub.plan.monthlyPrice > 0
      ? sub.plan.monthlyPrice
      : Math.round(sub.plan.price * 100);
  const expiresAtDate = toDateOrNull(sub.expiresAt);
  const isExpired = expiresAtDate ? expiresAtDate <= new Date() : false;

  return {
    id: sub.id.toString(),
    plan_id: sub.plan.id.toString(),
    plan_name: sub.plan.name,
    monthly_ai_credits: sub.plan.monthlyAiCredits,
    assets_max: sub.plan.assetsMax,
    stop_loss: sub.plan.stopLoss,
    real_time: sub.plan.realTime,
    trading_view: sub.plan.displayFeatures.tradingView,
    price: monthlyPriceCents / 100,
    billing_period: sub.billingPeriod ?? 'monthly',
    started_at: toIsoOrNull(sub.startedAt),
    expires_at: toIsoOrNull(sub.expiresAt),
    is_expired: isExpired,
    pending_plan_id: sub.pendingPlan?.id.toString() ?? null,
    pending_plan_name: sub.pendingPlan?.name ?? null,
    pending_billing_period: sub.pendingBillingPeriod ?? null,
    pending_effective_at: toIsoOrNull(sub.pendingEffectiveAt)
  };
}
