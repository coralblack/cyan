export function TraceableError(originalError: Error): Error {
  originalError.stack = originalError.stack + "\n" + (new Error().stack).split("\n")[2];

  return originalError;
}
