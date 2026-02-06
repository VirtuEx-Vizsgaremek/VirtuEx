import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
import { Subscription } from '@/entities/subscription.entity';

interface DisplayFeaturesV1 {
  version: 1;
  tradingView: boolean;
}

type DisplayFeatures = DisplayFeaturesV1;

@Entity()
export class SubscriptionPlan extends BaseEntity {
  @Property()
  name!: string;

  @Property()
  monthlyAiCredits!: number;

  @Property()
  assetsMax!: number;

  @Property()
  stopLoss: boolean = false;

  @Property()
  realTime: boolean = false;

  @Property({ type: 'jsonb' })
  displayFeatures: DisplayFeatures = { version: 1, tradingView: false };

  @Property()
  price!: number;

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions = new Collection<Subscription>(this);
}
