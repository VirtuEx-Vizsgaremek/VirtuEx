import { EntityManager } from '@mikro-orm/core';

import { User } from '@/entities/user.entity';
import { Subscription } from '@/entities/subscription.entity';
import { SubscriptionPlan } from '@/entities/subscription_plan.entity';
import { Asset } from '@/entities/asset.entity';
import { Currency } from '@/entities/currency.entity';
import { Transaction } from '@/entities/transaction.entity';
import { CurrencyType } from '@/enum/currency_type';
import { TransactionDirection, TransactionStatus } from '@/enum/transaction';
import { toIsoOrNull } from '@/util/dates';

const PLAN_PRICE_IN_CENTS = false;

export type BillingPeriod = 'monthly' | 'yearly';

export const toCents = (priceUsdNumber: number): bigint => {
  const normalized = PLAN_PRICE_IN_CENTS
    ? Math.round(priceUsdNumber)
    : Math.round(priceUsdNumber * 100);
  return BigInt(normalized);
};

export const getPlanPriceCents = (
  planOrPrice: SubscriptionPlan | number,
  period: BillingPeriod
): bigint => {
  if (typeof planOrPrice === 'number') {
    const monthly = toCents(planOrPrice);
    return period === 'yearly' ? monthly * BigInt(12) : monthly;
  }

  const monthlyCents =
    planOrPrice.monthlyPrice && planOrPrice.monthlyPrice > 0
      ? BigInt(planOrPrice.monthlyPrice)
      : toCents(planOrPrice.price);
  const yearlyCents =
    planOrPrice.yearlyPrice && planOrPrice.yearlyPrice > 0
      ? BigInt(planOrPrice.yearlyPrice)
      : monthlyCents * BigInt(12);

  return period === 'yearly' ? yearlyCents : monthlyCents;
};

export const getPeriodDays = (period: BillingPeriod): number => {
  return period === 'yearly' ? 365 : 30;
};

export type ExpiryApplyAction = 'none' | 'pending_applied' | 'renewed';

let invalidExpiryLogged = false;

const normalizeExpiresAt = (
  value: unknown,
  context?: { reqId?: string; userId?: string }
): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    if (!Number.isNaN(value.getTime())) return value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  if (!invalidExpiryLogged) {
    invalidExpiryLogged = true;
    console.warn('[subscription.lazy.invalid_expires_at]', {
      reqId: context?.reqId,
      userId: context?.userId,
      value
    });
  }

  return null;
};

export async function applyPendingOrRenewIfExpired(
  em: EntityManager,
  user: User,
  context?: { reqId?: string }
): Promise<{ subscription: Subscription; action: ExpiryApplyAction } | null> {
  const sub = await em.findOne(
    Subscription,
    { user },
    { populate: ['plan', 'pendingPlan'] }
  );

  if (!sub) {
    return null;
  }

  const now = new Date();
  const expiresAt = normalizeExpiresAt(sub.expiresAt, {
    reqId: context?.reqId,
    userId: user.id?.toString()
  });

  console.log('[subscription.lazy.check]', {
    userId: user.id.toString(),
    now: now.toISOString(),
    expiresAt: toIsoOrNull(expiresAt),
    pendingPlan: sub.pendingPlan?.name ?? null
  });

  if (!expiresAt || expiresAt > now) {
    return { subscription: sub, action: 'none' };
  }

  if (sub.pendingPlan) {
    const pendingPlan = sub.pendingPlan;
    const pendingPeriod: BillingPeriod = sub.pendingBillingPeriod ?? 'monthly';
    const pendingAmount = getPlanPriceCents(pendingPlan, pendingPeriod);

    console.log('[subscription.lazy.pending_apply]', {
      userId: user.id.toString(),
      fromPlan: sub.plan.name,
      toPlan: pendingPlan.name,
      period: pendingPeriod,
      amountCents: pendingAmount.toString()
    });

    sub.plan = pendingPlan;
    sub.billingPeriod = pendingPeriod;
    sub.pendingPlan = null;
    sub.pendingBillingPeriod = null;
    sub.pendingEffectiveAt = null;
    sub.startedAt = now;
    sub.expiresAt =
      pendingAmount > BigInt(0)
        ? new Date(now.getTime() + getPeriodDays(pendingPeriod) * 86400000)
        : null;

    if (pendingAmount > BigInt(0)) {
      await chargeUsdForSubscription(em, user, pendingAmount, {
        reason: 'subscription',
        planName: pendingPlan.name,
        period: pendingPeriod
      });
    }

    return { subscription: sub, action: 'pending_applied' };
  }

  const currentPeriod: BillingPeriod = sub.billingPeriod ?? 'monthly';
  const renewalAmount = getPlanPriceCents(sub.plan, currentPeriod);

  console.log('[subscription.lazy.renew]', {
    userId: user.id.toString(),
    plan: sub.plan.name,
    period: currentPeriod,
    amountCents: renewalAmount.toString()
  });

  sub.startedAt = now;
  sub.expiresAt =
    renewalAmount > BigInt(0)
      ? new Date(now.getTime() + getPeriodDays(currentPeriod) * 86400000)
      : null;

  if (renewalAmount > BigInt(0)) {
    await chargeUsdForSubscription(em, user, renewalAmount, {
      reason: 'subscription',
      planName: sub.plan.name,
      period: currentPeriod
    });
  }

  return { subscription: sub, action: 'renewed' };
}

export type BillingErrorCode =
  | 'MISSING_WALLET'
  | 'USD_CURRENCY_NOT_FOUND'
  | 'USD_ASSET_NOT_FOUND'
  | 'INSUFFICIENT_FUNDS';

export class BillingError extends Error {
  public code: BillingErrorCode;

  constructor(code: BillingErrorCode, message: string) {
    super(message);
    this.name = 'BillingError';
    this.code = code;
  }
}

export class InsufficientFundsError extends BillingError {
  constructor(message: string) {
    super('INSUFFICIENT_FUNDS', message);
    this.name = 'InsufficientFundsError';
  }
}

export async function chargeUsdForSubscription(
  em: EntityManager,
  user: User,
  amountCents: bigint,
  meta: {
    reason: 'subscription';
    planName: string;
    period: BillingPeriod;
  }
): Promise<void> {
  if (amountCents <= BigInt(0)) {
    console.log('[billing.charge.skip]', {
      userId: user.id.toString(),
      amountCents: amountCents.toString(),
      planName: meta.planName,
      period: meta.period,
      reason: meta.reason
    });
    return;
  }

  const userWithWallet = await em.findOne(
    User,
    { id: user.id },
    { populate: ['wallet'] }
  );

  if (!userWithWallet?.wallet) {
    throw new BillingError('MISSING_WALLET', 'User wallet not found');
  }

  const usdCurrency = await em.findOne(Currency, {
    symbol: 'USD',
    type: CurrencyType.Fiat
  });

  if (!usdCurrency) {
    throw new BillingError('USD_CURRENCY_NOT_FOUND', 'USD currency not found');
  }

  const usdAsset = await em.findOne(
    Asset,
    { wallet: userWithWallet.wallet, currency: usdCurrency },
    { populate: ['currency'] }
  );

  const balanceBefore = usdAsset?.amount ?? BigInt(0);

  console.log('[billing.charge.check]', {
    userId: user.id.toString(),
    planName: meta.planName,
    period: meta.period,
    amountCents: amountCents.toString(),
    balanceBefore: balanceBefore.toString(),
    reason: meta.reason
  });

  if (!usdAsset) {
    console.log('[billing.charge.missing_asset]', {
      userId: user.id.toString(),
      planName: meta.planName,
      period: meta.period,
      amountCents: amountCents.toString(),
      balanceBefore: balanceBefore.toString()
    });
    throw new BillingError('USD_ASSET_NOT_FOUND', 'USD asset not found');
  }

  if (balanceBefore < amountCents) {
    console.log('[billing.charge.insufficient]', {
      userId: user.id.toString(),
      planName: meta.planName,
      period: meta.period,
      amountCents: amountCents.toString(),
      balanceBefore: balanceBefore.toString()
    });
    throw new InsufficientFundsError('Insufficient USD balance');
  }

  usdAsset.amount = balanceBefore - amountCents;

  const transaction = new Transaction();
  transaction.asset = usdAsset;
  transaction.amount = amountCents;
  transaction.direction = TransactionDirection.Outgoing;
  transaction.status = TransactionStatus.Completed;

  em.persist(transaction);

  console.log('[billing.charge.applied]', {
    userId: user.id.toString(),
    planName: meta.planName,
    period: meta.period,
    amountCents: amountCents.toString(),
    balanceAfter: usdAsset.amount.toString(),
    transactionId: transaction.id.toString()
  });
}
