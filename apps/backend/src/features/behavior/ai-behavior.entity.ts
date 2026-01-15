import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import {
  AI_BEHAVIOR_STATUS,
  BEHAVIOR_TITLE_MAX_LENGTH,
  type AIBehaviorStatus,
} from '@web24/shared';
import { BaseIdCreatedUpdatedDeletedEntity } from '../../common/entities/base.entity';
import { User } from '../user/user.entity';
import { Goal } from '../goal/goal.entity';

@Entity({ name: 'ai_behaviors' })
export class AIBehavior extends BaseIdCreatedUpdatedDeletedEntity {
  @ManyToOne(() => Goal, (goal) => goal.behaviors, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'goalId' })
  goal!: Goal;

  @Column({ type: 'varchar', length: BEHAVIOR_TITLE_MAX_LENGTH })
  title!: string;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'date' })
  date!: string; // YYYY-MM-DD

  @Column({ type: 'enum', enum: AI_BEHAVIOR_STATUS })
  status!: AIBehaviorStatus;
}
