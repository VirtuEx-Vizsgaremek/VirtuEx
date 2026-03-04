import {
  Entity,
  ManyToOne,
  PrimaryKey,
  PrimaryKeyProp,
  Property
} from '@mikro-orm/core';

import { Currency } from '@/entities/currency.entity';

@Entity()
export class CurrencyHistory {
  @ManyToOne(() => Currency, { primary: true })
  currency!: Currency;

  @PrimaryKey()
  timestamp!: Date;

  @Property()
  open: bigint = BigInt(0) as bigint;

  @Property()
  high: bigint = BigInt(0) as bigint;

  @Property()
  low: bigint = BigInt(0) as bigint;

  @Property()
  close: bigint = BigInt(0) as bigint;

  [PrimaryKeyProp]?: ['currency', 'timestamp'];
}
