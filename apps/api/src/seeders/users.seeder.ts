import { User } from '@/entities/user.entity';
import { Wallet } from '@/entities/wallet.entity';
import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import Permissions from '@/enum/permissions';

import bcrypt from 'bcrypt';

export class UsersSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Check if users already exist
    const regularUserExists = await em.findOne(User, { username: 'john643' });
    const adminUserExists = await em.findOne(User, { username: 'admin' });

    if (regularUserExists && adminUserExists) {
      return; // Users already seeded
    }

    const saltedPassword = await bcrypt.hash('SecurePassword123', 10);

    if (!regularUserExists) {
      const regularUser = new User();
      const regularWallet = new Wallet();

      regularUser.fullName = 'John Doe';
      regularUser.username = 'john643';
      regularUser.email = 'john@example.com';
      regularUser.password = saltedPassword;
      regularUser.wallet = regularWallet;

      em.persist(regularUser);
    }

    if (!adminUserExists) {
      const adminUser = new User();
      const adminWallet = new Wallet();

      adminUser.fullName = 'Admin User';
      adminUser.username = 'admin';
      adminUser.email = 'admin@example.com';
      adminUser.password = saltedPassword;
      adminUser.permissions = Permissions.Admin;
      adminUser.wallet = adminWallet;

      em.persist(adminUser);
    }

    await em.flush();
  }
}
