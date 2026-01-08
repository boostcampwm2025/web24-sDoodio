import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import {
  BEHAVIOR_DIFFICULTIES,
  BEHAVIOR_TITLE_MAX_LENGTH,
  type BehaviorDifficulty,
} from '@web24/shared';
import { BaseIdCreatedUpdatedDeletedEntity } from '../../common/entities/base.entity';
import { Goal } from '../goal/goal.entity';

@Entity({ name: 'behaviors' })
export class Behavior extends BaseIdCreatedUpdatedDeletedEntity {
  @ManyToOne(() => Goal, (goal) => goal.behaviors, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'goalId' })
  goal!: Goal;

  @Column({ type: 'varchar', length: BEHAVIOR_TITLE_MAX_LENGTH })
  title!: string;

  @Column({ type: 'enum', enum: BEHAVIOR_DIFFICULTIES })
  difficulty!: BehaviorDifficulty;
}
