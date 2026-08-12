import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

type UnloadingVessel = {
  vessel_id: string;
  name: string;
  status: string;
  reported_total: number;
  date_range: string;
};

type UnloadingReport = {
  vessel_id: string;
  report_date: string;
  work_time: string;
  daily_amount: number;
  cumulative_amount: number;
  target_holds: string;
  quality_notes: string;
};

type UnloadingSpecies = {
  vessel_id: string;
  species_id: string;
  species_name: string;
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

describe('SEIN VENUS unloading data', () => {
  it('keeps the Bangkok discharge target separate from the 5,200 MT folder label', () => {
    const db = loadDb();
    const vessel = db.unloading_vessels.find((item) => item.vessel_id === 'sein-venus');

    expect(vessel).toMatchObject({
      name: 'M/V SEIN VENUS',
      status: '하역중',
      reported_total: 3275,
      date_range: '2026.08.07 ~ 진행중',
    });
  });

  it('matches the four daily XLS reports through August 11', () => {
    const db = loadDb();
    const reports = db.unloading_reports.filter((item) => item.vessel_id === 'sein-venus');

    expect(reports.map((item) => item.report_date)).toEqual(['8/7', '8/8', '8/10', '8/11']);
    expect(reports.map((item) => item.work_time)).toEqual([
      '10:10 ~ 19:00',
      '08:10 ~ 13:00',
      '08:10 ~ 16:10',
      '08:10 ~ 14:40',
    ]);
    expect(reports.map((item) => item.daily_amount)).toEqual([174.64, 109.07, 331.47, 462.81]);
    expect(reports.map((item) => item.cumulative_amount)).toEqual([174.64, 283.71, 615.18, 1077.99]);
    expect(reports.reduce((sum, item) => sum + item.daily_amount, 0)).toBeCloseTo(1077.99, 6);
    expect(3275 - reports.at(-1)!.cumulative_amount).toBeCloseTo(2197.01, 6);
    expect(reports.at(-1)!.target_holds).toContain('#1-A:80.670');
    expect(reports.at(-1)!.target_holds).toContain('#1-B:41.170');
    expect(reports.at(-1)!.quality_notes).toContain('-22.0℃ ~ -23.0℃');
    expect(reports.at(-1)!.quality_notes).toContain('8/12 공휴일');
    expect(reports[0].quality_notes).toContain('-21.0℃ ~ -23.0℃');
    expect(reports[0].quality_notes).toContain('8/8 약 160톤');
    expect(reports[1].quality_notes).toContain('8/9 공휴일');
    expect(reports[1].quality_notes).toContain('8/10 약 310톤');
    expect(reports[2].quality_notes).toContain('S/PIO(#1-A)');
    expect(reports[2].quality_notes).toContain('N/STAR(#2-A)');
    expect(reports[2].quality_notes).toContain('8/11 약 420톤');
  });

  it('labels the XLS combined SJ column without inventing a BE actual split', () => {
    const db = loadDb();
    const species = db.unloading_species.filter((item) => item.vessel_id === 'sein-venus');

    expect(species).toEqual([
      expect.objectContaining({
        species_id: 'SJ',
        species_name: '가다랑어·눈다랑어 합산',
        reported_amount: 2844,
        actual_amount: 904.39,
      }),
      expect.objectContaining({
        species_id: 'YF',
        species_name: '황다랑어',
        reported_amount: 431,
        actual_amount: 173.6,
      }),
    ]);
    expect(species.reduce((sum, item) => sum + item.reported_amount, 0)).toBe(3275);
    expect(species.reduce((sum, item) => sum + item.actual_amount, 0)).toBeCloseTo(1077.99, 6);
  });

  it('wires the stowage plan and defaults the detail view to the active vessel', () => {
    const source = readFileSync(join(process.cwd(), 'components/UnloadingStatus.tsx'), 'utf8');
    const analyticsSource = readFileSync(join(process.cwd(), 'components/UnloadingAnalytics.tsx'), 'utf8');

    expect(source).toContain("'sein-venus': {");
    expect(source).toContain("'#4-B': 90");
    expect(source).toContain("'#3-B': 420");
    expect(source).toContain("'#2-A': 410");
    expect(source).toContain("'#1-A': 250");
    expect(source).toContain("useState('sein-venus')");
    expect(source).toContain('원적재선별 하역 비중');
    expect(analyticsSource).toContain("getVesselStatusKind(status) === 'progress'");
    expect(analyticsSource).toContain('timedAmount += t.dailyAmount');
    expect(analyticsSource).toContain('getAnalyticsStatus(selectedVessel.status).completed && surplusPct > 3');
  });

  it('prioritizes active operations and groups the long detail view by task', () => {
    const source = readFileSync(join(process.cwd(), 'components/UnloadingStatus.tsx'), 'utf8');

    expect(source).toContain('오늘의 운영 판단');
    expect(source).toContain('완료 선박');
    expect(source).toContain('완료 선박 펼치기');
    expect(source).toContain("useState<DetailTab>('summary')");
    expect(source).toContain("{ id: 'summary', label: '운영 요약' }");
    expect(source).toContain("{ id: 'holds', label: '화물창·품질' }");
    expect(source).toContain("{ id: 'timeline', label: '작업 기록' }");
    expect(source).toContain("{ id: 'analysis', label: '분석·보고' }");
    expect(source).toContain('aria-selected={activeDetailTab === tab.id}');
    expect(source).toContain('aria-controls={`unloading-panel-${tab.id}`}');
    expect(source).toContain("event.key === 'ArrowRight'");
    expect(source.match(/hold\.lastTemperature > -18(?:\.0)?/g)).toHaveLength(2);
    expect(source).toContain("style={{ display: 'flex', flexWrap: 'wrap'");
  });
});
