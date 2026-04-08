import { EntityManager } from '@mikro-orm/core';

import { User } from '@/entities/user.entity';
import { Subscription } from '@/entities/subscription.entity';
import { Asset } from '@/entities/asset.entity';
import { Currency } from '@/entities/currency.entity';
import { Transaction } from '@/entities/transaction.entity';
import { CurrencyType } from '@/enum/currency_type';
import { TransactionDirection, TransactionStatus } from '@/enum/transaction';

const PLAN_PRICE_IN_CENTS = false;

export type BillingPeriod = 'monthly' | 'yearly';

export const toCents = (priceUsdNumber: number): bigint => {
  const normalized = PLAN_PRICE_IN_CENTS
    ? Math.round(priceUsdNumber)
    : Math.round(priceUsdNumber * 100);
  return BigInt(normalized);
};

export const getPlanPriceCents = (
  priceUsdNumber: number,
  period: BillingPeriod
): bigint => {
  const monthly = toCents(priceUsdNumber);
  if (period === 'yearly') {
    return monthly * BigInt(12);
  }
  return monthly;
};

export const getPeriodDays = (period: BillingPeriod): number => {
  return period === 'yearly' ? 365 : 30;
};

export type ExpiryApplyAction = 'none' | 'pending_applied' | 'renewed';

export async function applyPendingOrRenewIfExpired(
  em: EntityManager,
  user: User
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
  const expiresAt = sub.expiresAt;

  console.log('[subscription.lazy.check]', {
    userId: user.id.toString(),
    now: now.toISOString(),
    expiresAt: expiresAt?.toISOString() ?? null,
    pendingPlan: sub.pendingPlan?.name ?? null
  });

  if (!expiresAt || expiresAt > now) {
    return { subscription: sub, action: 'none' };
  }

  if (sub.pendingPlan) {
    const pendingPlan = sub.pendingPlan;
    const pendingPeriod: BillingPeriod = sub.pendingBillingPeriod ?? 'monthly';
    const pendingAmount = getPlanPriceCents(pendingPlan.price, pendingPeriod);

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
      pendingPlan.price > 0
        ? new Date(now.getTime() + getPeriodDays(pendingPeriod) * 86400000)
        : null;

    if (pendingPlan.price > 0) {
      await chargeUsdForSubscription(em, user, pendingAmount, {
        reason: 'subscription',
        planName: pendingPlan.name,
        period: pendingPeriod
      });
    }

    return { subscription: sub, action: 'pending_applied' };
  }

  const currentPeriod: BillingPeriod = sub.billingPeriod ?? 'monthly';
  const renewalAmount = getPlanPriceCents(sub.plan.price, currentPeriod);

  console.log('[subscription.lazy.renew]', {
    userId: user.id.toString(),
    plan: sub.plan.name,
    period: currentPeriod,
    amountCents: renewalAmount.toString()
  });

  sub.startedAt = now;
  sub.expiresAt =
    sub.plan.price > 0
      ? new Date(now.getTime() + getPeriodDays(currentPeriod) * 86400000)
      : null;

  if (sub.plan.price > 0) {
    await chargeUsdForSubscription(em, user, renewalAmount, {
      reason: 'subscription',
      planName: sub.plan.name,
      period: currentPeriod
    });
  }

  return { subscription: sub, action: 'renewed' };
}

export class InsufficientFundsError extends Error {
  constructor(message: string) {
    super(message);
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
    throw new Error('User wallet not found');
  }

  const usdCurrency = await em.findOne(Currency, {
    symbol: 'USD',
    type: CurrencyType.Fiat
  });

  if (!usdCurrency) {
    throw new Error('USD currency not found');
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

  if (!usdAsset || balanceBefore < amountCents) {
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
