import snowflake from '@/util/snowflake';
import {
  BigIntType,
  Entity,
  Enum,
  PrimaryKey,
  Property,
  Unique
} from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
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

  @Property()
  bio: string | undefined;

  @Property()
  permissions: bigint = BigInt(0) as bigint;

  @Enum({ items: () => Subscription, nativeEnumName: 'subscription' })
  subscription: Subscription = Subscription.Free;
}
