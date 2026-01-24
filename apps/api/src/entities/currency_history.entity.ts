import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  PrimaryKey,
  PrimaryKeyProp,
  Property,
  Unique
} from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
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
