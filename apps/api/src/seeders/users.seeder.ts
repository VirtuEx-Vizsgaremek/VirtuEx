import { User } from '@/entities/user.entity';
import { Wallet } from '@/entities/wallet.entity';
import { Asset } from '@/entities/asset.entity';
import { Currency } from '@/entities/currency.entity';
import { Subscription } from '@/entities/subscription.entity';
import { SubscriptionPlan } from '@/entities/subscription_plan.entity';
import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import Permissions from '@/enum/permissions';

import bcrypt from 'bcrypt';

const DEV_WALLET_ID = BigInt('66626843268088832');
const ADMIN_WALLET_ID = BigInt('66626843268088833');

export class UsersSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const saltedPassword = await bcrypt.hash('SecurePassword123', 10);

    let regularUser = await em.findOne(
      User,
      { username: 'john643' },
      { populate: ['wallet'] }
    );

    if (!regularUser) {
      regularUser = new User();
      regularUser.fullName = 'John Doe';
      regularUser.username = 'john643';
      regularUser.email = 'john@example.com';
      regularUser.password = saltedPassword;
      regularUser.activated = true;
    }

    if (!regularUser.wallet || regularUser.wallet.id !== DEV_WALLET_ID) {
      const regularWallet = new Wallet();
      regularWallet.id = DEV_WALLET_ID;
      regularUser.wallet = regularWallet;
    }

    regularUser.activated = true;

    let adminUser = await em.findOne(
      User,
      { username: 'admin' },
      { populate: ['wallet'] }
    );

    if (!adminUser) {
      adminUser = new User();
      adminUser.fullName = 'Admin User';
      adminUser.username = 'admin';
      adminUser.email = 'admin@example.com';
      adminUser.password = saltedPassword;
      adminUser.permissions = Permissions.Admin;
      adminUser.activated = true;
    }

    if (!adminUser.wallet || adminUser.wallet.id !== ADMIN_WALLET_ID) {
      const adminWallet = new Wallet();
      adminWallet.id = ADMIN_WALLET_ID;
      adminUser.wallet = adminWallet;
    }

    adminUser.permissions = Permissions.Admin;
    adminUser.activated = true;

    em.persist(regularUser);
    em.persist(adminUser);
    await em.flush();

    // ── Subscription Plans ───────────────────────────────────────────────────
    const planConfigs = [
      {
        name: 'Free',
        monthlyAiCredits: 5,
        assetsMax: 10,
        stopLoss: false,
        realTime: false,
        displayFeatures: { version: 1 as const, tradingView: false },
        price: 0
      },
      {
        name: 'Standard',
        monthlyAiCredits: 30,
        assetsMax: 50,
        stopLoss: false,
        realTime: true,
        displayFeatures: { version: 1 as const, tradingView: false },
        price: 35
      },
      {
        name: 'Pro',
        monthlyAiCredits: 100,
        assetsMax: 0,
        stopLoss: true,
        realTime: true,
        displayFeatures: { version: 1 as const, tradingView: true },
        price: 49
      }
    ];

    const plans: Record<string, SubscriptionPlan> = {};
    for (const cfg of planConfigs) {
      let plan = await em.findOne(SubscriptionPlan, { name: cfg.name });
      if (!plan) {
        plan = new SubscriptionPlan();
        plan.name = cfg.name;
        plan.monthlyAiCredits = cfg.monthlyAiCredits;
        plan.assetsMax = cfg.assetsMax;
        plan.stopLoss = cfg.stopLoss;
        plan.realTime = cfg.realTime;
        plan.displayFeatures = cfg.displayFeatures;
        plan.price = cfg.price;
        em.persist(plan);
      }
      plans[cfg.name] = plan;
    }
    await em.flush();

    // ── Assign Free plan to seeded users if they have no subscription ────────
    for (const user of [regularUser, adminUser]) {
      const existingSub = await em.findOne(Subscription, { user });
      if (!existingSub) {
        const sub = new Subscription();
        sub.user = user;
        sub.plan = plans['Free'];
        sub.billingPeriod = 'monthly';
        em.persist(sub);
      }
    }
    await em.flush();

    // Add assets to the dev wallet
    const usd = await em.findOne(Currency, { symbol: 'USD' });
    const appl = await em.findOne(Currency, { symbol: 'AAPL' });
    const msft = await em.findOne(Currency, { symbol: 'MSFT' });

    // $100,000.00 USD — stored as cents (precision = 2), so × 100
    if (usd) {
      const usdAsset = await em.findOne(Asset, {
        wallet: regularUser.wallet,
        currency: usd
      });

      if (!usdAsset) {
        const newUsdAsset = new Asset();
        newUsdAsset.wallet = regularUser.wallet;
        newUsdAsset.currency = usd;
        newUsdAsset.amount = BigInt(100_000_00); // $100,000.00
        em.persist(newUsdAsset);
      }
    }

    if (appl && msft) {
      // Check if assets already exist
      const applAsset = await em.findOne(Asset, {
        wallet: regularUser.wallet,
        currency: appl
      });

      const msftAsset = await em.findOne(Asset, {
        wallet: regularUser.wallet,
        currency: msft
      });

      if (!applAsset) {
        const newApplAsset = new Asset();
        newApplAsset.wallet = regularUser.wallet;
        newApplAsset.currency = appl;
        newApplAsset.amount = BigInt(100);
        em.persist(newApplAsset);
      }

      if (!msftAsset) {
        const newMsftAsset = new Asset();
        newMsftAsset.wallet = regularUser.wallet;
        newMsftAsset.currency = msft;
        newMsftAsset.amount = BigInt(50);
        em.persist(newMsftAsset);
      }

      await em.flush();
    }
  }
}
