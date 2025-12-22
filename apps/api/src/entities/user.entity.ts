import snowflake from '@/util/snowflake';
import {
  BigIntType,
  Entity,
  PrimaryKey,
  Property,
  Unique
} from '@mikro-orm/core';

@Entity()
export class User {
  @PrimaryKey({ type: BigIntType })
  id: bigint = snowflake.getUniqueID() as bigint;

  @Property({ length: 1024 })
  name!: string;

  @Property({ length: 320 })
  @Unique()
  email!: string;

  @Property({ length: 72 })
  password!: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
