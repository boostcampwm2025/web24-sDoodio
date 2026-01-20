import { USER_KINDS, USER_NICKNAME_MAX_LENGTH, type UserKind } from '@web24/shared';
import { Column, Entity } from 'typeorm';
import { BaseIdCreatedUpdatedDeletedEntity } from '../../common/entities/base.entity';

@Entity({ name: 'users' })
export class User extends BaseIdCreatedUpdatedDeletedEntity {
  @Column({ type: 'varchar', length: USER_NICKNAME_MAX_LENGTH })
  nickname!: string;

  @Column({ type: 'enum', enum: Object.values(USER_KINDS), default: USER_KINDS.guest })
  kind!: UserKind;
}
