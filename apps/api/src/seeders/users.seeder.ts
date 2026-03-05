import { User } from '@/entities/user.entity';
import { Wallet } from '@/entities/wallet.entity';
import { Asset } from '@/entities/asset.entity';
import { Currency } from '@/entities/currency.entity';
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

    // Add assets to the dev wallet
    const appl = await em.findOne(Currency, { symbol: 'AAPL' });
    const msft = await em.findOne(Currency, { symbol: 'MSFT' });

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
