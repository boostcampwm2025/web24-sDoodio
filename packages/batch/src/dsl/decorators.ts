import 'reflect-metadata';

export const BATCH_JOB_METADATA = Symbol('BATCH_JOB_METADATA');

export type BatchJobMeta = {
  name: string;
};

export function BatchJob(name: string): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(BATCH_JOB_METADATA, { name } satisfies BatchJobMeta, target);
  };
}
