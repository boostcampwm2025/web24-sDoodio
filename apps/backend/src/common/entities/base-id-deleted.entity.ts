import { DeleteDateColumn } from 'typeorm';
import { BaseIdEntity } from './base-id.entity';

export abstract class BaseIdDeletedEntity extends BaseIdEntity {
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
