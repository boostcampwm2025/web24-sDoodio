import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { JobRegistry, type Job } from './job-registry';
import { BATCH_JOB_METADATA, type BatchJobMeta } from '../dsl/decorators';

export interface BatchJobDefinition {
  buildJob(): Job;
}

@Injectable()
export class JobDiscoveryService implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly registry: JobRegistry,
  ) {}

  onModuleInit() {
    const providers = this.discovery.getProviders();

    providers
      .map((wrapper) => wrapper.instance)
      .filter((instance): instance is BatchJobDefinition => !!instance)
      .forEach((instance) => {
        const ctor = instance.constructor;
        const ctorName = ctor.name ?? 'UnknownClass';
        const meta = this.reflector.get<BatchJobMeta>(BATCH_JOB_METADATA, ctor);
        if (!meta) return;

        if (typeof instance.buildJob !== 'function') {
          throw new TypeError(`@BatchJob(${meta.name}) class must implement buildJob(): Job`);
        }

        const job = instance.buildJob();
        if (!job?.name || !Array.isArray(job.steps)) {
          throw new TypeError(`Invalid job built by ${ctorName}`);
        }

        this.registry.register(job);
      });
  }
}
