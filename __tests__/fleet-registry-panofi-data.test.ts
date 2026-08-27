import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

type FleetRegistryRow = {
  n: string;
  l: number | null;
};

const registry = JSON.parse(
  readFileSync(join(process.cwd(), 'public/data/tuna_fleet_db_v1.json'), 'utf8'),
) as { rows: FleetRegistryRow[] };

function lengthOf(name: string) {
  return registry.rows.find((row) => row.n === name)?.l;
}

describe('ICCAT fleet registry decimal lengths', () => {
  it('preserves decimal-comma vessel lengths instead of inflating them by ten', () => {
    expect(lengthOf('PANOFI MASTER')).toBe(56.6);
    expect(lengthOf('PANOFI DISCOVERER')).toBe(70.6);
    expect(lengthOf('PANOFI COMMANDER')).toBe(71.8);
    expect(lengthOf('PANOFI GRACE')).toBe(69.4);
    expect(lengthOf('VOLTA GLORY')).toBe(93.8);
  });
});
