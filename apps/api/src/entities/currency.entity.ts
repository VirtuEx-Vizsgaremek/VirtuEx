import { Entity, Enum, Property, Unique } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';

@Entity()
export class Currency extends BaseEntity {
  @Property()
  symbol!: string;

  @Property()
  name!: string;

  @Property()
  precision!: number;
}
