import type { Provider } from '@nestjs/common';
import { DynamicModule, Global, Module } from '@nestjs/common';
import type { InjectionToken } from '@nestjs/common/interfaces';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DiscoveryModule } from '@nestjs/core';

import { JobRepository } from './repository/job-repository';
import { TransactionRunner } from './transaction/transaction-runner';
import { JobRegistry } from './core/job-registry';
import { BATCH_DATA_SOURCE } from './core/tokens';
import { BatchRunnerService } from './core/runner.service';
import { StepFactory } from './dsl/builder';
import { JobDiscoveryService } from './core/job-discovery.service';
import { LockService } from './lock/lock.service';

export type BatchOptions = {
  /**
   * 기본 lock TTL (runner에서 옵션으로 override 가능)
   */
  defaultLockTtlSeconds?: number;
  /**
   * TypeORM DataSource provider token
   * - 기본값: getDataSourceToken()
   */
  dataSourceToken?: InjectionToken;
};

@Global()
@Module({})
export class BatchModule {
  static forRoot(options: BatchOptions = {}): DynamicModule {
    const batchDataSourceToken = getDataSourceToken();
    const dataSourceToken = options.dataSourceToken ?? batchDataSourceToken;
    const dataSourceProvider: Provider = {
      provide: BATCH_DATA_SOURCE,
      useExisting: dataSourceToken,
    };
    const dataSourceAliasProvider: Provider | null =
      dataSourceToken === batchDataSourceToken
        ? null
        : {
            provide: batchDataSourceToken,
            useExisting: dataSourceToken,
          };

    return {
      module: BatchModule,
      imports: [DiscoveryModule], // job auto-discovery
      providers: [
        dataSourceProvider,
        ...(dataSourceAliasProvider ? [dataSourceAliasProvider] : []),
        JobRepository,
        TransactionRunner,
        LockService,

        JobRegistry,
        BatchRunnerService,
        StepFactory,

        JobDiscoveryService,
        {
          provide: 'BATCH_OPTIONS',
          useValue: { defaultLockTtlSeconds: options.defaultLockTtlSeconds ?? 3600 },
        },
      ],
      exports: [
        // core
        BatchRunnerService,
        JobRegistry,
        StepFactory,

        // repository/infra (원하면 숨겨도 됨)
        JobRepository,
        TransactionRunner,
        LockService,
        BATCH_DATA_SOURCE,
      ],
    };
  }
}
