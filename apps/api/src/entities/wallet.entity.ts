import { Entity, OneToOne } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
import { User } from './user.entity';

@Entity()
export class Wallet extends BaseEntity {
  @OneToOne(() => User, (user) => user.wallet, { mappedBy: 'wallet' })
  user!: User;
}
