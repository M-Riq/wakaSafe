import { DomainError } from '@wakasafe/domain';

/** Deep copy, so callers can never mutate the in-memory database. */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createDelay(latencyMs: number): () => Promise<void> {
  if (latencyMs <= 0) return () => Promise.resolve();
  return () => new Promise((resolve) => setTimeout(resolve, latencyMs));
}

let sequence = 0;
/** Unique enough for a local demo; the real backend will generate uuids. */
export function newId(prefix: string): string {
  sequence += 1;
  const random = Math.floor(Math.random() * 0x100000).toString(36);
  return `${prefix}-${Date.now().toString(36)}-${sequence.toString(36)}${random}`;
}

/** Placeholder for operations delivered in a later roadmap phase. */
export function notImplemented(operation: string, phase: number): Promise<never> {
  return Promise.reject(
    new DomainError('NOT_IMPLEMENTED', `${operation} is planned for phase ${phase}`, {
      operation,
      phase,
    }),
  );
}

export function notFound(entity: string, id: string): DomainError {
  return new DomainError('NOT_FOUND', `${entity} ${id} not found`, { entity, id });
}
