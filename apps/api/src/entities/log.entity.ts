import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
import { User } from '@/entities/user.entity';

import { Action } from '@/enum/action';

interface ActionNone {
  action: Action.None;
}

export interface ActionBuy {
  action: Action.Buy;
  currency: bigint;
  amount: bigint;
}

export interface ActionSell {
  action: Action.Sell;
  currency: bigint;
  amount: bigint;
}

type ActionData = ActionNone | ActionBuy | ActionSell;

@Entity()
export class AuditLog extends BaseEntity {
  @ManyToOne(() => User)
  user!: User;

  @Property({ type: 'jsonb' })
  data: ActionData = {
    action: Action.None
  };
}
