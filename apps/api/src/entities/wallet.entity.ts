import { Entity, Enum, Property, Unique } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';

@Entity()
export class Wallet extends BaseEntity {}
