import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import {
  TODAY_BEHAVIOR_ORIGIN,
  TODAY_BEHAVIOR_STATUS,
  type TodayBehaviorOrigin,
  type TodayBehaviorStatus,
} from '@web24/shared';
import { BaseIdCreatedUpdatedDeletedEntity } from '../../common/entities/base.entity';
import { Behavior } from './behavior.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'today_behaviors' })
export class TodayBehavior extends BaseIdCreatedUpdatedDeletedEntity {
  @ManyToOne(() => Behavior, (behavior) => behavior.todayBehaviors, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'behaviorId' })
  behavior!: Behavior;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'date' })
  date!: string; // YYYY-MM-DD

  @Column({ type: 'enum', enum: TODAY_BEHAVIOR_STATUS })
  status!: TodayBehaviorStatus;

  @Column({ type: 'enum', enum: TODAY_BEHAVIOR_ORIGIN })
  origin!: TodayBehaviorOrigin;
}
