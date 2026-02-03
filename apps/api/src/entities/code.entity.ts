import {
  Entity,
  Property,
  Enum,
  Index,
  ManyToOne,
  PrimaryKey,
  BigIntType
} from '@mikro-orm/core';

import { User } from '@/entities/user.entity';

import { CodeType } from '@/enum/code_type';

import snowflake from '@/util/snowflake';

@Entity()
export class Code {
  @PrimaryKey({ type: BigIntType })
  id: bigint = snowflake.getUniqueID() as bigint;

  @Property()
  @Index()
  code!: string;

  @Enum({
    items: () => CodeType,
    nativeEnumName: 'code_type'
  })
  type!: CodeType;

  @ManyToOne(() => User)
  user!: User;

  @Property()
  expiresAt!: Date;
}
