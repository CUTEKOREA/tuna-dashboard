import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GET as getUnloadingData } from '../app/api/unloading-db/route';
import UnloadingReportGenerator from '../components/UnloadingReportGenerator';

type UnloadingLoad = {
  source_vessel: string;
  hatch: string;
  amount: number;
};

type UnloadingAllocation = {
  consignee: string;
  amount: number;
  loads: UnloadingLoad[];
};

type UnloadingObservation = {
  source_vessel: string;
  hatch: string;
  temperatures_c: number[];
};

type UnloadingVessel = {
  vessel_id: string;
  name: string;
  status: string;
  reported_total: number;
  date_range: string;
  unclassified_actual_amount?: number;
  species_breakdown_as_of?: string;
  species_breakdown_note?: string;
};

type UnloadingReport = {
  vessel_id: string;
  report_date: string;
  work_time: string;
  consignee?: string;
  allocations?: UnloadingAllocation[];
  observations?: UnloadingObservation[];
  remaining_amount?: number;
  source_sha256?: string;
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

  it('matches the six daily reports through August 14 without duplicating the date', () => {
    const db = loadDb();
    const reports = db.unloading_reports.filter((item) => item.vessel_id === 'sein-venus');

    expect(reports.map((item) => item.report_date)).toEqual(['8/7', '8/8', '8/10', '8/11', '8/13', '8/14']);
    expect(reports.map((item) => item.work_time)).toEqual([
      '10:10 ~ 19:00',
      '08:10 ~ 13:00',
      '08:10 ~ 16:10',
      '08:10 ~ 14:40',
      '08:20 ~ 15:10',
      '08:00 ~ 18:00',
    ]);
    expect(reports.map((item) => item.daily_amount)).toEqual([174.64, 109.07, 331.47, 462.81, 159.59, 424.78]);
    expect(reports.map((item) => item.cumulative_amount)).toEqual([174.64, 283.71, 615.18, 1077.99, 1237.58, 1662.36]);
    expect(reports.reduce((sum, item) => sum + item.daily_amount, 0)).toBeCloseTo(1662.36, 6);
    expect(reports.at(-1)!.cumulative_amount - reports.at(-2)!.cumulative_amount).toBeCloseTo(424.78, 6);
    expect(3275 - reports.at(-1)!.cumulative_amount).toBeCloseTo(1612.64, 6);

    const latest = reports.at(-1)!;
    expect(latest.target_holds).toBe('N/STAR(#2-B:78.650), N/SUN(#3-B:84.630,#3-C:203.200), S/SPR(#4-B:43.050,#4-C:15.250)');
    expect(latest.consignee).toBe('MMP · ISA · TUM');
    expect(latest.remaining_amount).toBeCloseTo(1612.64, 6);
    expect(latest.allocations).toEqual([
      {
        consignee: 'MMP',
        amount: 78.65,
        loads: [{ source_vessel: 'N/STAR', hatch: '#2-B', amount: 78.65 }],
      },
      {
        consignee: 'ISA',
        amount: 142.93,
        loads: [
          { source_vessel: 'N/SUN', hatch: '#3-B', amount: 84.63 },
          { source_vessel: 'S/SPR', hatch: '#4-B', amount: 43.05 },
          { source_vessel: 'S/SPR', hatch: '#4-C', amount: 15.25 },
        ],
      },
      {
        consignee: 'TUM',
        amount: 203.2,
        loads: [{ source_vessel: 'N/SUN', hatch: '#3-C', amount: 203.2 }],
      },
    ]);
    const allocationLoads = latest.allocations!.flatMap((allocation) => allocation.loads);
    expect(latest.allocations!.reduce((sum, allocation) => sum + allocation.amount, 0)).toBeCloseTo(424.78, 6);
    expect(allocationLoads.reduce((sum, load) => sum + load.amount, 0)).toBeCloseTo(424.78, 6);
    expect(allocationLoads.filter((load) => load.hatch.startsWith('#3-')).reduce((sum, load) => sum + load.amount, 0)).toBeCloseTo(287.83, 6);
    expect(allocationLoads.filter((load) => load.hatch.startsWith('#4-')).reduce((sum, load) => sum + load.amount, 0)).toBeCloseTo(58.3, 6);
    expect(latest.observations).toEqual([
      { source_vessel: 'N/STAR', hatch: '#2-B', temperatures_c: [-22, -23] },
      { source_vessel: 'N/SUN', hatch: '#3-B', temperatures_c: [-21, -22] },
      { source_vessel: 'N/SUN', hatch: '#3-C', temperatures_c: [-22, -23] },
      { source_vessel: 'S/SPR', hatch: '#4-B', temperatures_c: [-21, -22] },
      { source_vessel: 'S/SPR', hatch: '#4-C', temperatures_c: [-22, -23] },
    ]);
    expect(latest.quality_notes).not.toContain('350톤');
    expect(latest.source_sha256).toBe('2c1a9f4b28f5a6a555b8329d3926fcb9eec0c1cf465deeed778919c7be3af76a');
    expect(reports.filter((item) => item.report_date === '8/14')).toHaveLength(1);

    expect(reports.at(-2)!.target_holds).toBe('N/STAR(#2-B:159.590)');
    expect(reports.at(-2)!.consignee).toBe('MMP');
    expect(reports.at(-2)!.quality_notes).not.toContain('제품 MMP');
    expect(reports.at(-2)!.quality_notes).toContain('-22.0℃ ~ -23.0℃');
    expect(reports.at(-2)!.quality_notes).toContain('8/14 약 400톤');
    expect(reports.at(-3)!.target_holds).toContain('#1-A:80.670');
    expect(reports.at(-3)!.target_holds).toContain('#1-B:41.170');
    expect(reports.at(-3)!.quality_notes).toContain('8/12 공휴일');
    expect(reports[0].quality_notes).toContain('-21.0℃ ~ -23.0℃');
    expect(reports[0].quality_notes).toContain('8/8 약 160톤');
    expect(reports[1].quality_notes).toContain('8/9 공휴일');
    expect(reports[1].quality_notes).toContain('8/10 약 310톤');
    expect(reports[2].quality_notes).toContain('S/PIO(#1-A)');
    expect(reports[2].quality_notes).toContain('N/STAR(#2-A)');
    expect(reports[2].quality_notes).toContain('8/11 약 420톤');
  });

  it('keeps the August 13 species split and exposes the August 14 unclassified gap', () => {
    const db = loadDb();
    const vessel = db.unloading_vessels.find((item) => item.vessel_id === 'sein-venus')!;
    const species = db.unloading_species.filter((item) => item.vessel_id === 'sein-venus');
    const latestReport = db.unloading_reports.filter((item) => item.vessel_id === 'sein-venus').at(-1)!;

    expect(species).toEqual([
      expect.objectContaining({
        species_id: 'SJ',
        species_name: '가다랑어·눈다랑어 합산',
        reported_amount: 2844,
        actual_amount: 1029.28,
      }),
      expect.objectContaining({
        species_id: 'YF',
        species_name: '황다랑어',
        reported_amount: 431,
        actual_amount: 208.3,
      }),
    ]);
    expect(species.reduce((sum, item) => sum + item.reported_amount, 0)).toBe(3275);
    expect(species.reduce((sum, item) => sum + item.actual_amount, 0)).toBeCloseTo(1237.58, 6);
    expect(vessel.unclassified_actual_amount).toBeCloseTo(424.78, 6);
    expect(vessel.species_breakdown_as_of).toBe('2026-08-13');
    expect(vessel.species_breakdown_note).toContain('8/14 원본');
    expect(
      species.reduce((sum, item) => sum + item.actual_amount, 0) + vessel.unclassified_actual_amount!,
    ).toBeCloseTo(latestReport.cumulative_amount, 6);
  });

  it('returns the structured August 14 facts through the current API', async () => {
    const response = await getUnloadingData();
    const payload = await response.json();
    const vessel = payload.data['sein-venus'];
    const latest = vessel.timeline.at(-1);

    expect(vessel.actualTotal).toBeCloseTo(1662.36, 6);
    expect(vessel.unclassifiedActual).toBeCloseTo(424.78, 6);
    expect(vessel.speciesBreakdownAsOf).toBe('2026-08-13');
    expect(latest.date).toBe('8/14');
    expect(latest.remainingAmount).toBeCloseTo(1612.64, 6);
    expect(latest.nextDayPlan).toBeUndefined();
    expect(latest.allocations).toHaveLength(3);
    expect(latest.observations).toHaveLength(5);
  });

  it('renders the August 14 office report from structured consignee and observation facts', async () => {
    const response = await getUnloadingData();
    const payload = await response.json();
    const vessel = payload.data['sein-venus'];
    const markup = renderToStaticMarkup(createElement(UnloadingReportGenerator, {
      vesselData: vessel,
      vesselId: 'sein-venus',
      onClose: () => undefined,
    }));

    expect(markup).toContain('MMP:');
    expect(markup).toContain('78.650 MT');
    expect(markup).toContain('ISA:');
    expect(markup).toContain('142.930 MT');
    expect(markup).toContain('TUM:');
    expect(markup).toContain('203.200 MT');
    expect(markup).toContain('N/STAR:#2-B');
    expect(markup).toContain('N/SUN:#3-B');
    expect(markup).toContain('S/SPR:#4-C');
    expect(markup).toContain('N/SUN(#3-C)');
    expect(markup).toContain('-22.0℃ ~ -23.0℃');
    expect(markup).toContain('명일 하역 작업 예정입니다.');
    expect(markup).not.toContain('350톤');
    expect(markup).not.toContain('* SJ:                424.780 MT');
  });

  it('wires the stowage plan and defaults the detail view to the active vessel', () => {
    const source = readFileSync(join(process.cwd(), 'components/UnloadingStatus.tsx'), 'utf8');
    const analyticsSource = readFileSync(join(process.cwd(), 'components/UnloadingAnalytics.tsx'), 'utf8');
    const replaySource = readFileSync(join(process.cwd(), 'components/UnloadingTimelineReplay.tsx'), 'utf8');
    const apiSource = readFileSync(join(process.cwd(), 'app/api/unloading-db/route.ts'), 'utf8');

    expect(source).toContain("'sein-venus': {");
    expect(source).toContain("'#4-B': 90");
    expect(source).toContain("'#3-B': 420");
    expect(source).toContain("'#2-A': 410");
    expect(source).toContain("'#1-A': 250");
    expect(source).toContain("useState('sein-venus')");
    expect(source).toContain('원적재선별 하역 비중');
    expect(source).toContain('수하처:');
    expect(source).toContain('수하처별 하역량');
    expect(source).toContain('어종 분해 미확인');
    expect(source).toContain('어종별 실적 분해 없음');
    expect(source).toContain('hasUnclassifiedSpecies');
    expect(source).toContain('unclassifiedActual?: number');
    expect(replaySource).toContain('어종별 실적 추이 미제공');
    expect(replaySource).toContain('unclassifiedActual?: number');
    expect(apiSource).toContain('consignee: r.consignee || null');
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
