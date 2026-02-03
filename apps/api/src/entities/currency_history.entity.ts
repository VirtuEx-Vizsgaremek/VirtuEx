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

  // Price to USD.
  @Property()
  price: bigint = BigInt(0) as bigint;

  [PrimaryKeyProp]?: ['currency', 'timestamp'];
}
