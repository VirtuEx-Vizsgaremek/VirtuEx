import { Entity, Enum, ManyToOne, Property, Unique } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
import { Asset } from '@/entities/asset.entity';
import { TransactionDirection, TransactionStatus } from '@/enum/transaction';
import { User } from '@/entities/user.entity';
import { OrderStatus, OrderType } from '@/enum/order';
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
