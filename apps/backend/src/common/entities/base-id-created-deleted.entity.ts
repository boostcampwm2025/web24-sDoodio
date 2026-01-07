import { DeleteDateColumn } from 'typeorm';
import { BaseIdCreatedEntity } from './base-id-created.entity';

export abstract class BaseIdCreatedDeletedEntity extends BaseIdCreatedEntity {
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
