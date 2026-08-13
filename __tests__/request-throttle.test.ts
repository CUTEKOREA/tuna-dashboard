import { describe, expect, it } from 'vitest';
import { createRoundRobinThrottle } from '../lib/request-throttle';

describe('round-robin request throttle', () => {
  it('rotates credentials and spaces reuse of each credential', async () => {
    let now = 1_000;
    const waits: number[] = [];
    const throttle = createRoundRobinThrottle(['primary', 'secondary'], 250, {
      now: () => now,
      sleep: async (milliseconds) => {
        waits.push(milliseconds);
        now += milliseconds;
      },
    });

    expect(await throttle.acquire()).toBe('primary');
    expect(await throttle.acquire()).toBe('secondary');
    expect(await throttle.acquire()).toBe('primary');
    expect(await throttle.acquire()).toBe('secondary');
    expect(waits).toEqual([250]);
  });
});
