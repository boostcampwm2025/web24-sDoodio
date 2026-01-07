import { USER_NICKNAME_MAX_LENGTH } from '@web24/shared';
import { BaseIdCreatedUpdatedDeletedEntity } from 'src/common/entities/base-id-created-updated-deleted.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'users' })
export class User extends BaseIdCreatedUpdatedDeletedEntity {
  @Column({ type: 'varchar', length: USER_NICKNAME_MAX_LENGTH })
  nickname!: string;
}
