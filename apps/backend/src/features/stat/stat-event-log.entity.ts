import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseIdCreatedEntity } from '../../common/entities/base.entity';
import { User } from '../user/user.entity';

export const EVENT_TYPES = {
  CHECK_IN: 'CHECK_IN',
  DUDU_CATCH: 'DUDU_CATCH',
  DUDU_MISS: 'DUDU_MISS',
  REFRESH_TODAY_BEHAVIORS: 'REFRESH_TODAY_BEHAVIORS',
} as const;

export type StatEventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

@Index('idx_stat_event_logs_user_id', ['user'])
@Entity({ name: 'stat_event_logs' })
export class StatEventLog extends BaseIdCreatedEntity {
  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'enum', enum: Object.values(EVENT_TYPES) })
  eventType!: StatEventType;
}
