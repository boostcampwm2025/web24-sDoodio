import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'job_lock' })
@Index(['lockKey'], { unique: true })
export class JobLockEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'lock_key', type: 'varchar', length: 300 })
  lockKey!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
