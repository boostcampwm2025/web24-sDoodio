import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseIdCreatedEntity } from '../../common/entities/base.entity';
import { User } from '../user/user.entity';

export const DODO_CHAT_ROLE = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;
export type DodoChatRole = (typeof DODO_CHAT_ROLE)[keyof typeof DODO_CHAT_ROLE];

@Entity({ name: 'dodo_chat_messages' })
export class DodoChatMessage extends BaseIdCreatedEntity {
  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 20 })
  role!: DodoChatRole;

  @Column({ type: 'text' })
  content!: string;
}
