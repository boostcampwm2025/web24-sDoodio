import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { JobStatus } from '../../core/types';

@Entity({ name: 'step_execution' })
@Index(['jobExecutionId', 'stepName'], { unique: true })
export class StepExecutionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'job_execution_id', type: 'uuid' })
  jobExecutionId!: string;

  @Column({ name: 'step_name', type: 'varchar', length: 200 })
  stepName!: string;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status!: JobStatus;

  @Column({ name: 'read_count', type: 'int', default: 0 })
  readCount!: number;

  @Column({ name: 'write_count', type: 'int', default: 0 })
  writeCount!: number;

  @Column({ name: 'skip_count', type: 'int', default: 0 })
  skipCount!: number;

  @Column({ name: 'commit_count', type: 'int', default: 0 })
  commitCount!: number;

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
