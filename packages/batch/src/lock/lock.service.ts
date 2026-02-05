import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BatchError } from '../core/types';

@Injectable()
export class LockService {
  constructor(private readonly dataSource: DataSource) {}

  async withLock<T>(lockKey: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const acquired = await this.tryAcquire(lockKey, ttlSeconds);
    if (!acquired) throw new BatchError(`Job is already running (lock: ${lockKey})`, 'LOCKED');

    try {
      return await fn();
    } finally {
      // 정상적으로 끝나면 즉시 락 제거(= 다음 실행 바로 가능)
      await this.release(lockKey).catch(() => {});
    }
  }

  async tryAcquire(lockKey: string, ttlSeconds: number): Promise<boolean> {
    const rows = await this.dataSource.query(
      `
      INSERT INTO job_lock (lock_key, expires_at)
      VALUES ($1, now() + ($2 || ' seconds')::interval)
      ON CONFLICT (lock_key)
      DO UPDATE SET expires_at = EXCLUDED.expires_at
      WHERE job_lock.expires_at < now()
      RETURNING lock_key
      `,
      [lockKey, ttlSeconds],
    );
    return Array.isArray(rows) && rows.length > 0;
  }

  async release(lockKey: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM job_lock WHERE lock_key = $1`, [lockKey]);
  }

  /**
   * TTL 지난 락 정리 (선택: 크론으로 돌리거나, runner 시작 시 한 번 호출)
   */
  async cleanupExpired(): Promise<number> {
    const res = await this.dataSource.query(
      `DELETE FROM job_lock WHERE expires_at < now() RETURNING lock_key`,
    );
    return Array.isArray(res) ? res.length : 0;
  }
}
