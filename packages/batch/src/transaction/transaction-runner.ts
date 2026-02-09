import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BATCH_DATA_SOURCE } from '../core/tokens';

@Injectable()
export class TransactionRunner {
  constructor(@Inject(BATCH_DATA_SOURCE) private readonly dataSource: DataSource) {}

  async runInTransaction<T>(fn: (manager: DataSource['manager']) => Promise<T>): Promise<T> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const result = await fn(qr.manager);
      await qr.commitTransaction();
      return result;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }
}
