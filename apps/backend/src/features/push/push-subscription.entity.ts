import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { type PushSubscription } from '@web24/shared';
import { BaseIdCreatedUpdatedEntity } from '../../common/entities/base.entity';
import { User } from '../user/user.entity';

@Index('idx_push_subscriptions_user_id', ['user'])
@Entity({ name: 'push_subscriptions' })
export class PushSubscriptionEntity extends BaseIdCreatedUpdatedEntity {
  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'text', unique: true })
  endpoint!: string;

  @Column({ type: 'jsonb' })
  subscription!: PushSubscription;
}
