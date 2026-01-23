import { Entity, Enum, Property, Unique } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
import { CurrencyType } from '@/enum/currency_type';

@Entity()
export class Currency extends BaseEntity {
  @Property()
  symbol!: string;

  @Property()
  name!: string;

  @Property()
  precision!: number;

  @Enum({ items: () => CurrencyType, nativeEnumName: 'currency_type' })
  type: CurrencyType = CurrencyType.Crypto;
}
