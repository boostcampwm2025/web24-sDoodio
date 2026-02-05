import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { JobStatus } from '../../core/types';

@Entity({ name: 'job_execution' })
@Index(['jobName', 'paramsHash'])
export class JobExecutionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'job_name', type: 'varchar', length: 200 })
  jobName!: string;

  @Column({ name: 'params_hash', type: 'varchar', length: 64 })
  paramsHash!: string;

  @Column({ name: 'params', type: 'jsonb' })
  params!: Record<string, any>;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status!: JobStatus;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt?: Date | null;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt?: Date | null;

  @Column({ name: 'exit_message', type: 'text', nullable: true })
  exitMessage?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
