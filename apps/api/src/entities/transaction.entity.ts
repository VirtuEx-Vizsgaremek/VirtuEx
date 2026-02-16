import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
import { Asset } from '@/entities/asset.entity';
import { TransactionDirection, TransactionStatus } from '@/enum/transaction';

@Entity()
export class Transaction extends BaseEntity {
  @ManyToOne()
  asset!: Asset;

  @Property()
  amount!: bigint;

  @Enum({
    items: () => TransactionStatus,
    nativeEnumName: 'transaction_status'
  })
  status: TransactionStatus = TransactionStatus.Pending;

  @Enum({
    items: () => TransactionDirection,
    nativeEnumName: 'transaction_direction'
  })
  direction!: TransactionDirection;
}
