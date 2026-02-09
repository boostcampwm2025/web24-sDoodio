import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type ContextScope = 'JOB' | 'STEP';

@Entity({ name: 'execution_context' })
@Index(['scope', 'scopeId'], { unique: true })
export class ExecutionContextEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'scope', type: 'varchar', length: 10 })
  scope!: ContextScope;

  @Column({ name: 'scope_id', type: 'uuid' })
  scopeId!: string;

  @Column({ name: 'context', type: 'jsonb' })
  context!: Record<string, any>;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
