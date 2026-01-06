import { UpdateDateColumn } from 'typeorm';
import { BaseIdCreatedEntity } from './base-id-created.entity';

export abstract class BaseIdCreatedUpdatedEntity extends BaseIdCreatedEntity {
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
