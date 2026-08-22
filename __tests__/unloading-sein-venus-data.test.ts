import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GET as getUnloadingData } from '../app/api/unloading-db/route';
import UnloadingReportGenerator from '../components/UnloadingReportGenerator';
import { buildStackedAreaData } from '../components/UnloadingTimelineReplay';

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
  port_code?: string;
  status: string;
  reported_total: number;
  date_range: string;
  hold_species_breakdown_available?: boolean;
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
  adjusted_remaining_amount?: number;
  daily_adjustment_amount?: number;
  cumulative_adjustment_amount?: number;
  source_sha256?: string;
  source_workbook_sha256?: string;
  status_workbook_sha256?: string;
  species_amounts?: { SJ: number; YF: number };
  next_day?: {
    kind: 'work' | 'no_work';
    date: string;
    reason?: string;
    resume_date?: string;
    planned_mt?: number | string | null;
  };
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
      status: '하역완료 (Completed)',
      reported_total: 3275,
      date_range: '2026.08.07 ~ 2026.08.22',
      port_code: 'BKK',
    });
  });

  it('matches the thirteen daily reports through the August 22 completion without duplicating the date', () => {
    const db = loadDb();
    const reports = db.unloading_reports.filter((item) => item.vessel_id === 'sein-venus');

    expect(reports.map((item) => item.report_date)).toEqual(['8/7', '8/8', '8/10', '8/11', '8/13', '8/14', '8/15', '8/17', '8/18', '8/19', '8/20', '8/21', '8/22']);
    expect(reports.map((item) => item.work_time)).toEqual([
      '10:10 ~ 19:00',
      '08:10 ~ 13:00',
      '08:10 ~ 16:10',
      '08:10 ~ 14:40',
      '08:20 ~ 15:10',
      '08:00 ~ 18:00',
      '08:10 ~ 17:00',
      '08:10 ~ 16:30',
      '08:10 ~ 15:40',
      '08:10 ~ 13:40',
      '08:10 ~ 13:40',
      '08:10 ~ 12:00',
      '08:20 ~ 10:40',
    ]);
    expect(reports.map((item) => item.daily_amount)).toEqual([174.64, 109.07, 331.47, 462.81, 159.59, 424.78, 350.74, 312.57, 339.73, 277.87, 147.49, 148.8, 89.52]);
    expect(reports.map((item) => item.cumulative_amount)).toEqual([174.64, 283.71, 615.18, 1077.99, 1237.58, 1662.36, 2013.1, 2325.67, 2665.4, 2943.27, 3090.76, 3239.56, 3329.08]);
    expect(reports.map((item) => item.species_amounts)).toEqual([
      { SJ: 150.34, YF: 24.3 },
      { SJ: 104.17, YF: 4.9 },
      { SJ: 272.27, YF: 59.2 },
      { SJ: 377.61, YF: 85.2 },
      { SJ: 124.89, YF: 34.7 },
      { SJ: 368.08, YF: 56.7 },
      { SJ: 318.14, YF: 32.6 },
      { SJ: 279.77, YF: 32.8 },
      { SJ: 170.85, YF: 168.88 },
      { SJ: 263.17, YF: 14.7 },
      { SJ: 133.19, YF: 14.3 },
      { SJ: 143.6, YF: 5.2 },
      { SJ: 87.82, YF: 1.7 },
    ]);
    for (const report of reports) {
      expect(report.species_amounts!.SJ + report.species_amounts!.YF).toBeCloseTo(report.daily_amount, 6);
    }
    expect(reports.reduce((sum, item) => sum + item.daily_amount, 0)).toBeCloseTo(3329.08, 6);
    expect(reports.at(-1)!.cumulative_amount - reports.at(-2)!.cumulative_amount).toBeCloseTo(89.52, 6);
    expect(reports.at(-1)!.cumulative_amount - 3275).toBeCloseTo(54.08, 6);

    const latest = reports.at(-1)!;
    expect(latest.target_holds).toBe('S/PIO(#1-C:89.520)');
    expect(latest.consignee).toBe('GPZ');
    expect(latest.remaining_amount).toBeCloseTo(-54.08, 6);
    expect(latest.adjusted_remaining_amount).toBe(0);
    expect(latest.daily_adjustment_amount).toBeCloseTo(-7.45, 6);
    expect(latest.cumulative_adjustment_amount).toBeCloseTo(54.08, 6);
    expect(latest.allocations).toEqual([
      {
        consignee: 'GPZ',
        amount: 89.52,
        loads: [
          { source_vessel: 'S/PIO', hatch: '#1-C', amount: 89.52 },
        ],
      },
    ]);
    const allocationLoads = latest.allocations!.flatMap((allocation) => allocation.loads);
    expect(latest.allocations!.reduce((sum, allocation) => sum + allocation.amount, 0)).toBeCloseTo(89.52, 6);
    expect(allocationLoads.reduce((sum, load) => sum + load.amount, 0)).toBeCloseTo(89.52, 6);
    expect(allocationLoads.filter((load) => load.hatch.startsWith('#1-')).reduce((sum, load) => sum + load.amount, 0)).toBeCloseTo(89.52, 6);
    expect(latest.observations).toEqual([
      { source_vessel: 'S/PIO', hatch: '#1-C', temperatures_c: [-21, -22] },
    ]);
    expect(latest.quality_notes).not.toContain('어종');
    expect(latest.next_day).toBeUndefined();
    expect(latest.source_sha256).toBe('957c3826b8639aec801567e1ca413a04dbc6164429039749722fe7beea313b50');
    expect(latest.source_workbook_sha256).toBe('1cabdba041e2781bdc44dac75f1583c96ffc5aa572453200742d7c10bf0a38e9');
    expect(latest.status_workbook_sha256).toBe('ce23e5d9ed8536cf669a00c8eddd03a64fea60b68b097be898fda1a69cf9e714');
    expect(latest.species_amounts).toEqual({ SJ: 87.82, YF: 1.7 });
    expect(reports.filter((item) => item.report_date === '8/22')).toHaveLength(1);
    expect(reports.filter((item) => item.report_date === '8/21')).toHaveLength(1);
    expect(reports.filter((item) => item.report_date === '8/20')).toHaveLength(1);
    expect(reports.filter((item) => item.report_date === '8/18')).toHaveLength(1);
    expect(reports.filter((item) => item.report_date === '8/17')).toHaveLength(1);
    expect(reports.filter((item) => item.report_date === '8/15')).toHaveLength(1);
    expect(reports.filter((item) => item.report_date === '8/14')).toHaveLength(1);
    expect(new Set(reports.map((item) => item.report_date)).size).toBe(reports.length);

    const august15 = reports.find((item) => item.report_date === '8/15')!;
    expect(august15.adjusted_remaining_amount).toBeCloseTo(1261.17, 6);
    expect(august15.daily_adjustment_amount).toBeCloseTo(-21.16, 6);
    expect(august15.cumulative_adjustment_amount).toBeCloseTo(-0.73, 6);
    expect(august15.next_day).toEqual({
      kind: 'no_work',
      date: '8/16',
      reason: '공휴일',
      resume_date: '8/17',
      planned_mt: 300,
    });
    expect(august15.source_sha256).toBe('2b295ca629ace7e9aa0b3d50c00992e8f0bdec13b7f1c80d8fb2e6d89fa39b6b');
    expect(august15.source_workbook_sha256).toBe('a52a830b86c022936bf0c727d617073a548c5df466b1111223adab16e6c175b0');
    expect(august15.status_workbook_sha256).toBe('0f0fe538043a59b9bf75f2cab299e161f1dd6299f41b96661bb642c497993dbd');

    const august14 = reports.find((item) => item.report_date === '8/14')!;
    expect(august14.source_sha256).toBe('2c1a9f4b28f5a6a555b8329d3926fcb9eec0c1cf465deeed778919c7be3af76a');
    expect(august14.source_workbook_sha256).toBe('0ad30e784ec9c643dfe1bb42ffa597005c5dffa2ea74523acff7c639637a6d70');
    expect(august14.status_workbook_sha256).toBe('9814a954e5c7984a3be51cb1071cc60bbb9fc6734c20a51e14759a234775f7cf');

    const august13 = reports.find((item) => item.report_date === '8/13')!;
    expect(august13.target_holds).toBe('N/STAR(#2-B:159.590)');
    expect(august13.consignee).toBe('MMP');
    expect(august13.quality_notes).not.toContain('제품 MMP');
    expect(august13.quality_notes).toContain('-22.0℃ ~ -23.0℃');
    expect(august13.quality_notes).toContain('8/14 약 400톤');

    const august11 = reports.find((item) => item.report_date === '8/11')!;
    expect(august11.target_holds).toContain('#1-A:80.670');
    expect(august11.target_holds).toContain('#1-B:41.170');
    expect(august11.quality_notes).toContain('8/12 공휴일');
    expect(reports[0].quality_notes).toContain('-21.0℃ ~ -23.0℃');
    expect(reports[0].quality_notes).toContain('8/8 약 160톤');
    expect(reports[1].quality_notes).toContain('8/9 공휴일');
    expect(reports[1].quality_notes).toContain('8/10 약 310톤');
    expect(reports[2].quality_notes).toContain('S/PIO(#1-A)');
    expect(reports[2].quality_notes).toContain('N/STAR(#2-A)');
    expect(reports[2].quality_notes).toContain('8/11 약 420톤');
  });

  it('uses the workbook-confirmed August 22 species split without inventing hold-level species', () => {
    const db = loadDb();
    const vessel = db.unloading_vessels.find((item) => item.vessel_id === 'sein-venus')!;
    const species = db.unloading_species.filter((item) => item.vessel_id === 'sein-venus');
    const latestReport = db.unloading_reports.filter((item) => item.vessel_id === 'sein-venus').at(-1)!;

    expect(species).toEqual([
      expect.objectContaining({
        species_id: 'SJ',
        species_name: '가다랑어·눈다랑어 합산',
        reported_amount: 2844,
        actual_amount: 2793.9,
      }),
      expect.objectContaining({
        species_id: 'YF',
        species_name: '황다랑어',
        reported_amount: 431,
        actual_amount: 535.18,
      }),
    ]);
    expect(species.reduce((sum, item) => sum + item.reported_amount, 0)).toBe(3275);
    expect(species.reduce((sum, item) => sum + item.actual_amount, 0)).toBeCloseTo(3329.08, 6);
    expect(vessel.unclassified_actual_amount).toBe(0);
    expect(vessel.species_breakdown_as_of).toBe('2026-08-22');
    expect(vessel.species_breakdown_note).toContain('일일 결과보고 XLS');
    expect(vessel.species_breakdown_note).toContain('8/22');
    expect(vessel.hold_species_breakdown_available).toBe(false);
    expect(latestReport.species_amounts).toEqual({ SJ: 87.82, YF: 1.7 });
    // 최종 합계만으로는 어종별 과부족이 보이지 않으므로 XLS 누계를 유지한다.
    const sj = species.find((item) => item.species_id === 'SJ')!;
    const yf = species.find((item) => item.species_id === 'YF')!;
    expect(yf.actual_amount - yf.reported_amount).toBeCloseTo(104.18, 6);
    expect(sj.actual_amount - sj.reported_amount).toBeCloseTo(-50.1, 6);
    expect(species.reduce((sum, item) => sum + item.actual_amount, 0)).toBeCloseTo(latestReport.cumulative_amount, 6);
  });

  it('returns the structured August 22 completion through the current API', async () => {
    const response = await getUnloadingData();
    const payload = await response.json();
    const vessel = payload.data['sein-venus'];
    const latest = vessel.timeline.at(-1);

    expect(vessel.actualTotal).toBeCloseTo(3329.08, 6);
    expect(vessel.status).toBe('하역완료 (Completed)');
    expect(vessel.surplus).toBeCloseTo(54.08, 6);
    expect(vessel.unclassifiedActual).toBe(0);
    expect(vessel.speciesBreakdownAsOf).toBe('2026-08-22');
    expect(vessel.holdSpeciesBreakdownAvailable).toBe(false);
    expect(vessel.species).toEqual([
      expect.objectContaining({ id: 'SJ', actual: 2793.9 }),
      expect.objectContaining({ id: 'YF', actual: 535.18 }),
    ]);
    expect(latest.date).toBe('8/22');
    expect(latest.remainingAmount).toBeCloseTo(-54.08, 6);
    expect(latest.adjustedRemainingAmount).toBe(0);
    expect(latest.dailyAdjustmentAmount).toBeCloseTo(-7.45, 6);
    expect(latest.cumulativeAdjustmentAmount).toBeCloseTo(54.08, 6);
    expect(latest.nextDay).toBeNull();
    expect(latest.allocations).toHaveLength(1);
    expect(latest.observations).toHaveLength(1);
    expect(latest.speciesAmounts).toEqual({ SJ: 87.82, YF: 1.7 });
  });

  it('builds the replay series from exact daily workbook species amounts through August 22', async () => {
    const response = await getUnloadingData();
    const payload = await response.json();
    const vessel = payload.data['sein-venus'];

    expect(buildStackedAreaData(vessel.timeline, vessel.species, vessel.actualTotal)).toEqual([
      { date: '8/7', SJ: 150.34, YF: 24.3 },
      { date: '8/8', SJ: 254.51, YF: 29.2 },
      { date: '8/10', SJ: 526.78, YF: 88.4 },
      { date: '8/11', SJ: 904.39, YF: 173.6 },
      { date: '8/13', SJ: 1029.28, YF: 208.3 },
      { date: '8/14', SJ: 1397.36, YF: 265 },
      { date: '8/15', SJ: 1715.5, YF: 297.6 },
      { date: '8/17', SJ: 1995.27, YF: 330.4 },
      { date: '8/18', SJ: 2166.12, YF: 499.28 },
      { date: '8/19', SJ: 2429.29, YF: 513.98 },
      { date: '8/20', SJ: 2562.48, YF: 528.28 },
      { date: '8/21', SJ: 2706.08, YF: 533.48 },
      { date: '8/22', SJ: 2793.9, YF: 535.18 },
    ]);
  });

  it('renders the August 22 completion report from structured consignee and observation facts', async () => {
    const response = await getUnloadingData();
    const payload = await response.json();
    const vessel = payload.data['sein-venus'];
    const markup = renderToStaticMarkup(createElement(UnloadingReportGenerator, {
      vesselData: vessel,
      vesselId: 'sein-venus',
      onClose: () => undefined,
    }));

    expect(markup).toContain('GPZ:');
    expect(markup).toContain('89.520 MT');
    expect(markup).toContain('S/PIO:#1-C');
    expect(markup).toContain('S/PIO(#1-C)');
    expect(markup).toContain('-21.0℃ ~ -22.0℃');
    expect(markup).toContain('운반선 SEIN VENUS(BKK)에서 보고량(3,275톤) 대비 54.080톤 증가한 3,329.080톤 하역 종료하였습니다.');
    expect(markup).not.toContain('명일');
    expect(markup).not.toContain('* SJ:                89.520 MT');
  });

  it('wires the stowage plan and defaults the detail view to the active vessel', () => {
    // 2026-08-17: 정적 원장이 lib/data/unloading-static.ts로 추출됨 — 원장 검사는 모듈+컴포넌트 결합 소스로
    const source = readFileSync(join(process.cwd(), 'components/UnloadingStatus.tsx'), 'utf8')
      + readFileSync(join(process.cwd(), 'lib/data/unloading-static.ts'), 'utf8');
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
    expect(source).toContain('어창별 어종 분해 없음');
    expect(source).toContain('holdSpeciesBreakdownAvailable');
    expect(source).toContain('hasUnclassifiedSpecies');
    expect(source).toContain('unclassifiedActual?: number');
    expect(replaySource).toContain('speciesAmounts');
    expect(replaySource).toContain('unclassifiedActual?: number');
    expect(apiSource).toContain('consignee: r.consignee || null');
    expect(analyticsSource).toContain("getVesselStatusKind(status) === 'progress'");
    expect(analyticsSource).toContain('timedAmount += t.dailyAmount');
    expect(analyticsSource).toContain('getAnalyticsStatus(selectedVessel.status).completed && surplusPct > 3');
  });

  it('prioritizes active operations and groups the long detail view by task', () => {
    // 2026-08-17: 정적 원장이 lib/data/unloading-static.ts로 추출됨 — 원장 검사는 모듈+컴포넌트 결합 소스로
    const source = readFileSync(join(process.cwd(), 'components/UnloadingStatus.tsx'), 'utf8')
      + readFileSync(join(process.cwd(), 'lib/data/unloading-static.ts'), 'utf8');
    const pillTabsSource = readFileSync(join(process.cwd(), 'components/v2/PillTabs.tsx'), 'utf8');

    expect(source).toContain('오늘의 운영 판단');
    expect(source).toContain('완료 선박');
    expect(source).toContain('완료 선박 펼치기');
    // 2026-08-17 소유자 재지시: 완료 선박은 접힘 기본 (SOUL ⑥ 명시 예외)
    expect(source).toContain('const [showCompletedVessels, setShowCompletedVessels] = useState(false);');
    expect(source).toContain("useState<DetailTab>('summary')");
    expect(source).toContain("{ id: 'summary', label: '운영 요약' }");
    expect(source).toContain("{ id: 'holds', label: '화물창·품질' }");
    expect(source).toContain("{ id: 'timeline', label: '작업 기록' }");
    expect(source).toContain("{ id: 'analysis', label: '분석·보고' }");
    expect(source).toContain('<PillTabs');
    expect(source).toContain('tabIdPrefix="unloading-tab"');
    expect(source).toContain('panelIdPrefix="unloading-panel"');
    expect(pillTabsSource).toContain('aria-selected={active}');
    expect(pillTabsSource).toContain('aria-controls={panelId}');
    expect(pillTabsSource).toContain("event.key === 'ArrowRight'");
    expect(source.match(/hold\.lastTemperature > -18(?:\.0)?/g)).toHaveLength(2);
    expect(source).toContain("style={{ display: 'flex', flexWrap: 'wrap'");
  });
});
