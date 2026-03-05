import { User } from '@/entities/user.entity';
import { Wallet } from '@/entities/wallet.entity';
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
  }
}
