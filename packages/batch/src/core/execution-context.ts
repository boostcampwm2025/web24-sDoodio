export class ExecutionContext {
  private store: Record<string, any>;

  constructor(initial: Record<string, any> = {}) {
    this.store = { ...initial };
  }

  get<T>(key: string): T | undefined {
    return this.store[key] as T | undefined;
  }

  set<T>(key: string, value: T): void {
    this.store[key] = value;
  }

  /**
   * merge: shallow merge (필요하면 deep merge로 확장 가능)
   */
  merge(obj: Record<string, any>): void {
    this.store = { ...this.store, ...obj };
  }

  toJSON(): Record<string, any> {
    return { ...this.store };
  }
}
