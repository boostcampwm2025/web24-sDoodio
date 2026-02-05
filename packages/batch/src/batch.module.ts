import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscoveryModule } from '@nestjs/core';

import { JobExecutionEntity } from './repository/entities/job-execution.entity';
import { StepExecutionEntity } from './repository/entities/step-execution.entity';
import { ExecutionContextEntity } from './repository/entities/execution-context.entity';
import { JobLockEntity } from './repository/entities/job-lock.entity';

import { JobRepository } from './repository/job-repository';
import { TransactionRunner } from './transaction/transaction-runner';
import { JobRegistry } from './core/job-registry';
import { BatchRunnerService } from './core/runner.service';
import { StepFactory } from './dsl/builder';
import { JobDiscoveryService } from './core/job-discovery.service';
import { LockService } from './lock/lock.service';

export type BatchOptions = {
  /**
   * 기본 lock TTL (runner에서 옵션으로 override 가능)
   */
  defaultLockTtlSeconds?: number;
};

@Global()
@Module({})
export class BatchModule {
  static forRoot(options: BatchOptions = {}): DynamicModule {
    const entities = [
      JobExecutionEntity,
      StepExecutionEntity,
      ExecutionContextEntity,
      JobLockEntity,
    ];

    return {
      module: BatchModule,
      imports: [
        TypeOrmModule.forFeature(entities),
        DiscoveryModule, // job auto-discovery
      ],
      providers: [
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

        // entities for app migrations/tests (optional)
        TypeOrmModule,
      ],
    };
  }
}
