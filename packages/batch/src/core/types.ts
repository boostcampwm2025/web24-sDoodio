export type JobParameters = Record<string, string | number | boolean | null>;

export type JobStatus = 'STARTING' | 'STARTED' | 'COMPLETED' | 'FAILED' | 'STOPPED';

export type CountsDelta = {
  read?: number;
  write?: number;
  skip?: number;
  commit?: number;
};

export class BatchError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
  }
}
