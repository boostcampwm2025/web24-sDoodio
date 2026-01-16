import { USER_NICKNAME_MAX_LENGTH } from '@web24/shared';
import { Column, Entity } from 'typeorm';
import { BaseIdCreatedUpdatedDeletedEntity } from '../../common/entities/base.entity';

@Entity({ name: 'users' })
export class User extends BaseIdCreatedUpdatedDeletedEntity {
  @Column({ type: 'varchar', length: USER_NICKNAME_MAX_LENGTH })
  nickname!: string;
}
