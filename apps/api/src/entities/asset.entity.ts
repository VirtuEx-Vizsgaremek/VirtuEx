import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
import { Wallet } from '@/entities/wallet.entity';
import { Currency } from '@/entities/currency.entity';

@Entity()
export class Asset extends BaseEntity {
  @ManyToOne(() => Wallet)
  wallet!: Wallet;

  @ManyToOne(() => Currency)
  currency!: Currency;

  // Dunno if this should be kept or if it should be calulated from the transactions.
  @Property()
  amount!: bigint;
}
