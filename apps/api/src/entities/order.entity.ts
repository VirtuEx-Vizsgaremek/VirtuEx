import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
import { Asset } from '@/entities/asset.entity';
import { User } from '@/entities/user.entity';
import { OrderStatus, OrderType } from '@/enum/order';

@Entity()
export class Order extends BaseEntity {
  @ManyToOne()
  user!: User;

  @ManyToOne()
  from_asset!: Asset;

  @ManyToOne()
  to_asset!: Asset;

  @Property()
  amount!: bigint;

  @Enum({
    items: () => OrderStatus,
    nativeEnumName: 'order_status'
  })
  status: OrderStatus = OrderStatus.Pending;

  @Enum({
    items: () => OrderType,
    nativeEnumName: 'order_type'
  })
  type!: OrderType;
}
