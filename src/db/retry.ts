const defaultRetryDelaysMs = [250, 500, 1_000, 2_000, 4_000] as const;

export async function withDatabaseRetry<T>(
  label: string,
  operation: () => Promise<T>,
  retryDelaysMs: readonly number[] = defaultRetryDelaysMs,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retryDelaysMs.length; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const delay = retryDelaysMs[attempt];
      if (delay === undefined) break;
      process.stderr.write(`${label} failed; retrying in ${delay}ms.\n`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(`${label} failed after ${retryDelaysMs.length + 1} attempts.`, {
    cause: lastError,
  });
}
