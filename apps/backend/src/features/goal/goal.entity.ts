import { GOAL_TITLE_MAX_LENGTH, GoalColors } from '@web24/shared';
import { BaseIdCreatedUpdatedDeletedEntity } from 'src/common/entities/base-id-created-updated-deleted.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Behavior } from '../behavior/behavior.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'goals' })
export class Goal extends BaseIdCreatedUpdatedDeletedEntity {
  @Column({ type: 'varchar', length: GOAL_TITLE_MAX_LENGTH })
  title!: string;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'enum', enum: GoalColors })
  color!: GoalColors;

  @OneToMany(() => Behavior, (behavior) => behavior.goal)
  behaviors!: Behavior[];
}
