import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
import { User } from '@/entities/user.entity';
import { Order } from './order.entity';

@Entity()
export class FulfilledOrder extends BaseEntity {
  @ManyToOne()
  user!: User;

  @ManyToOne()
  buy_order!: Order;

  @ManyToOne()
  sell_order!: Order;

  @Property()
  amount!: bigint;

  @Property()
  price!: bigint;
}
