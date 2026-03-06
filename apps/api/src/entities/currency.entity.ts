import { Entity, Enum, Property } from '@mikro-orm/core';

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

  @Property()
  updateFreqency:
    | '1m'
    | '2m'
    | '5m'
    | '15m'
    | '30m'
    | '60m'
    | '90m'
    | '1h'
    | '1d'
    | '5d'
    | '1wk'
    | '1mo'
    | '3mo' = '1d';

  @Enum({ items: () => CurrencyType, nativeEnumName: 'currency_type' })
  type: CurrencyType = CurrencyType.Crypto;
}
