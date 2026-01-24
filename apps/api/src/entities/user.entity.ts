import { Entity, Enum, OneToOne, Property, Unique } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
import { Wallet } from '@/entities/wallet.entity';

import { Subscription } from '@/enum/subscription';

@Entity()
export class User extends BaseEntity {
  @Property({ length: 1024 })
  fullName!: string;

  @Property({ length: 32 })
  username!: string;

  @Property({ length: 320 })
  @Unique()
  email!: string;

  @Property({ length: 72 })
  password!: string;

  @Property({ length: 256, nullable: true })
  bio: string | undefined | null;

  @OneToOne(() => Wallet, (wallet) => wallet.user, {
    owner: true,
    orphanRemoval: true
  })
  wallet!: Wallet;

  @Property()
  permissions: bigint = BigInt(0) as bigint;

  @Property()
  activated: boolean = false;

  @Enum({ items: () => Subscription, nativeEnumName: 'subscription' })
  subscription: Subscription = Subscription.Free;
}
