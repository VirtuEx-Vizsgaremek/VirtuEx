import { Entity, Enum, ManyToOne, Property, Unique } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
import { Asset } from '@/entities/asset.entity';
import { TransactionStatus } from '@/enum/transaction_status';

@Entity()
export class Transaction extends BaseEntity {
  @ManyToOne()
  from_asset!: Asset;

  @ManyToOne()
  to_asset!: Asset;

  @Property()
  amount!: bigint;

  @Enum({
    items: () => TransactionStatus,
    nativeEnumName: 'transaction_status'
  })
  status: TransactionStatus = TransactionStatus.Pending;
}
