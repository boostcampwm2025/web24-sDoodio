import { Column, Entity } from 'typeorm';
import { BaseIdCreatedEntity } from './common/entities/base.entity';

@Entity({ name: 'app_samples' })
export class AppEntitySample extends BaseIdCreatedEntity {
  @Column({ type: 'text' })
  name!: string;
}
