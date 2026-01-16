import { DeleteDateColumn } from 'typeorm';
import { BaseIdCreatedUpdatedEntity } from './base-id-created-updated.entity';

export abstract class BaseIdCreatedUpdatedDeletedEntity extends BaseIdCreatedUpdatedEntity {
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
