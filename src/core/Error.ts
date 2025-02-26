export function TraceableError(originalError: Error): Error {
  originalError.stack = originalError.stack + "\n" + new Error().stack?.split("\n")[2];

  return originalError;
}

export class ExtendedError extends Error {
  constructor(message: string, public readonly originalError: any) {
    super(message);
  }
}
