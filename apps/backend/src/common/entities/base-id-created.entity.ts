import { CreateDateColumn } from 'typeorm';
import { BaseIdEntity } from './base-id.entity';

export abstract class BaseIdCreatedEntity extends BaseIdEntity {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
