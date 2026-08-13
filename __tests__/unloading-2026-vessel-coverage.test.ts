import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

type UnloadingVessel = {
  vessel_id: string;
  name: string;
  location: string;
  status: string;
  reported_total: number;
  date_range: string;
  annual_actual_total?: number;
  annual_start_date?: string;
  hold_data_available?: boolean;
};

type UnloadingReport = {
  vessel_id: string;
  report_year?: number;
  report_date: string;
  daily_amount: number;
  cumulative_amount: number;
  quality_notes: string;
};

type UnloadingSpecies = {
  vessel_id: string;
  species_id: string;
  reported_amount: number;
  actual_amount: number;
};

type UnloadingDb = {
  unloading_vessels: UnloadingVessel[];
  unloading_reports: UnloadingReport[];
  unloading_species: UnloadingSpecies[];
};

const loadDb = (): UnloadingDb => JSON.parse(
  readFileSync(join(process.cwd(), 'public/data/unloading/local_db.json'), 'utf8'),
);

const expectedVoyages = [
  {
    id: 'sein-phoenix-2025-12',
    name: 'M/V SEIN PHOENIX',
    reported: 3740,
    actual: 3668.71,
    annualActual: 1687.73,
    annualStart: '2026.01.05',
    dates: ['12/18', '12/19', '12/22', '12/23', '12/24', '12/25', '12/26', '12/27', '1/5', '1/6', '1/7', '1/8', '1/9', '1/10', '1/12', '1/13'],
    daily: [15.13, 104.61, 205.06, 224.65, 239.09, 502.16, 457.32, 232.96, 304.69, 287.62, 274.83, 271.89, 223.95, 144.36, 117.38, 63.01],
  },
  {
    id: 'volta-victory-2026-01',
    name: 'M/V VOLTA VICTORY',
    reported: 2675,
    actual: 2652.97,
    annualActual: 2652.97,
    annualStart: '2026.01.05',
    dates: ['1/5', '1/6', '1/7', '1/8', '1/9', '1/12', '1/13', '1/14', '1/15', '1/16', '1/17', '1/19'],
    daily: [161.4, 61.97, 358.11, 141.85, 110.02, 100.04, 151.49, 208.18, 479.08, 268.5, 285.75, 326.58],
  },
  {
    id: 'angara-2026-01',
    name: 'M/V ANGARA',
    reported: 2657,
    actual: 2683.08,
    annualActual: 2683.08,
    annualStart: '2026.01.20',
    dates: ['1/20', '1/21', '1/22', '1/23', '1/24', '1/26', '1/27', '1/28', '1/29', '1/30', '1/31', '2/2'],
    daily: [239.15, 143.5, 156.47, 175.23, 186.96, 226.61, 287.4, 274.07, 468.39, 245.38, 228.35, 51.57],
  },
  {
    id: 'salt-lake-2026-01',
    name: 'M/V SALT LAKE',
    reported: 200,
    actual: 204.3,
    annualActual: 204.3,
    annualStart: '2026.01.13',
    dates: ['1/13', '1/14'],
    daily: [102.65, 101.65],
  },
] as const;

describe('2026 unloading vessel coverage', () => {
  it('adds every Bangkok voyage that was absent from the dashboard', () => {
    const db = loadDb();

    for (const expected of expectedVoyages) {
      const vessel = db.unloading_vessels.find(item => item.vessel_id === expected.id);
      expect(vessel).toMatchObject({
        name: expected.name,
        location: '방콕, 태국',
        status: '하역완료 (Completed)',
        reported_total: expected.reported,
        annual_actual_total: expected.annualActual,
        annual_start_date: expected.annualStart,
        hold_data_available: false,
      });
    }
  });

  it('matches each daily XLS series and final cumulative amount', () => {
    const db = loadDb();

    for (const expected of expectedVoyages) {
      const reports = db.unloading_reports.filter(item => item.vessel_id === expected.id);
      expect(reports.map(item => item.report_date)).toEqual(expected.dates);
      expect(reports.map(item => item.daily_amount)).toEqual(expected.daily);
      expect(reports.at(-1)?.cumulative_amount).toBeCloseTo(expected.actual, 6);
      expect(reports.reduce((sum, item) => sum + item.daily_amount, 0)).toBeCloseTo(expected.actual, 6);

      let runningTotal = 0;
      for (const report of reports) {
        runningTotal += report.daily_amount;
        expect(report.cumulative_amount).toBeCloseTo(runningTotal, 6);
      }
    }
  });

  it('counts only the 2026 portion of the cross-year SEIN PHOENIX voyage', () => {
    const db = loadDb();
    const reports = db.unloading_reports.filter(item => item.vessel_id === 'sein-phoenix-2025-12');
    const vessel = db.unloading_vessels.find(item => item.vessel_id === 'sein-phoenix-2025-12');
    const year2026Total = reports
      .filter(item => item.report_year === 2026)
      .reduce((sum, item) => sum + item.daily_amount, 0);

    expect(year2026Total).toBeCloseTo(1687.73, 6);
    expect(vessel?.annual_actual_total).toBeCloseTo(year2026Total, 6);
    expect(reports.at(-1)?.quality_notes).toContain('63.310 MT는 누계 산술과 불일치');
  });

  it('keeps species totals aligned with the final voyage totals', () => {
    const db = loadDb();

    for (const expected of expectedVoyages) {
      const species = db.unloading_species.filter(item => item.vessel_id === expected.id);
      expect(species.reduce((sum, item) => sum + item.reported_amount, 0)).toBeCloseTo(expected.reported, 6);
      expect(species.reduce((sum, item) => sum + item.actual_amount, 0)).toBeCloseTo(expected.actual, 6);
    }
  });

  it('uses annual totals in the KPI and marks unverified hold detail unavailable', () => {
    const source = readFileSync(join(process.cwd(), 'components/UnloadingStatus.tsx'), 'utf8');
    const apiSource = readFileSync(join(process.cwd(), 'app/api/unloading-db/route.ts'), 'utf8');

    expect(source).toContain('annualActualTotal?: number');
    expect(source).toContain('holdDataAvailable?: boolean');
    expect(source).toContain('v.annualActualTotal ?? v.actualTotal');
    expect(source).toContain('화물창별 원자료 없음');
    expect(apiSource).toContain('annualActualTotal');
    expect(apiSource).toContain('holdDataAvailable');
    expect(apiSource).toContain('report_year');
  });
});
