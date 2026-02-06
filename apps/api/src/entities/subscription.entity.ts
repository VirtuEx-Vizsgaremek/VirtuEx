import { Entity, ManyToOne, OneToOne, Property } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
import { User } from '@/entities/user.entity';
import { SubscriptionPlan } from '@/entities/subscription_plan.entity';

@Entity()
export class Subscription extends BaseEntity {
  @OneToOne(() => User, (user) => user.subscription, { owner: true })
  user!: User;

  @ManyToOne(() => SubscriptionPlan)
  plan!: SubscriptionPlan;

  @Property()
  startedAt: Date = new Date();

  @Property({ nullable: true })
  expiresAt?: Date;
}
