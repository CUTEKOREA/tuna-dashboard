type ThrottleRuntime = {
  now: () => number;
  sleep: (milliseconds: number) => Promise<void>;
};

const defaultRuntime: ThrottleRuntime = {
  now: () => Date.now(),
  sleep: (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
};

export function createRoundRobinThrottle<T>(
  credentials: T[],
  minimumIntervalMs: number,
  runtime: ThrottleRuntime = defaultRuntime,
) {
  if (credentials.length === 0) throw new Error('At least one credential is required');
  const nextAvailableAt = credentials.map(() => 0);
  let cursor = 0;

  return {
    async acquire(): Promise<T> {
      const credentialIndex = cursor % credentials.length;
      cursor += 1;
      const scheduledAt = Math.max(runtime.now(), nextAvailableAt[credentialIndex]);
      nextAvailableAt[credentialIndex] = scheduledAt + minimumIntervalMs;
      const waitMs = scheduledAt - runtime.now();
      if (waitMs > 0) await runtime.sleep(waitMs);
      return credentials[credentialIndex];
    },
  };
}
