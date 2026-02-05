import { GOAL_COLORS, GOAL_TITLE_MAX_LENGTH, type GoalColor } from '@web24/shared';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { Behavior } from '../behavior/behavior.entity';
import { BaseIdCreatedUpdatedDeletedEntity } from '../../common/entities/base.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'goals' })
@Unique('uq_goals_userId_title', ['user', 'title'])
export class Goal extends BaseIdCreatedUpdatedDeletedEntity {
  @Column({ type: 'varchar', length: GOAL_TITLE_MAX_LENGTH })
  title!: string;

  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'enum', enum: Object.values(GOAL_COLORS) })
  color!: GoalColor;

  @Column({ type: 'varchar', nullable: true })
  templateId?: string | null;

  @OneToMany(() => Behavior, (behavior) => behavior.goal)
  behaviors!: Behavior[];
}
