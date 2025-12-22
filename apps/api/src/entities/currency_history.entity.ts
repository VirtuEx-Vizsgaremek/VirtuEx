import { Entity, Enum, ManyToOne, Property, Unique } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
import { Currency } from '@/entities/currency.entity';

@Entity()
export class CurrencyHistory extends BaseEntity {
  @ManyToOne()
  currency!: Currency;

  // Price to USD.
  @Property()
  price: bigint = BigInt(0) as bigint;
}
