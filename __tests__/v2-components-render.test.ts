import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import FleetCommandCenter from '../components/FleetCommandCenter';
import { TelemetryBadge } from '../components/TelemetryBadge';
import HeroZone from '../components/v2/HeroZone';
import PillTabs from '../components/v2/PillTabs';

describe('Deep Sea Command V2 — HeroZone', () => {
  it('kpi 유형: 타이틀·주인공 KPI·단위·보조 KPI를 렌더한다 (W-02 단위 병기)', () => {
    const markup = renderToStaticMarkup(
      React.createElement(HeroZone, {
        variant: 'kpi',
        title: '시장 동향',
        subtitle: '방콕 SKJ 어가 기준',
        primaryKpi: { label: '방콕 SKJ 현물가', value: 1900, unit: '($/MT)' },
        secondaryKpis: [{ label: '주간 변동', value: 110, unit: '($/MT)' }],
      }),
    );

    expect(markup).toContain('시장 동향');
    expect(markup).toContain('($/MT)');
    expect(markup).toContain('방콕 SKJ 현물가');
    expect(markup).toContain('주간 변동');
  });

  it('map 유형: 경고→권고 패널이 SIT 줄과 TAK 권고 줄을 함께 렌더한다 (스펙 §3)', () => {
    const markup = renderToStaticMarkup(
      React.createElement(HeroZone, {
        variant: 'map',
        title: '물류·가공',
        warning: {
          title: '콜드체인 경보',
          lines: ['방콕 하역 대기 3척 13,764MT'],
          recommend: '냉동 운반선 우선 배정 권고',
        },
      }),
    );

    expect(markup).toContain('콜드체인 경보');
    expect(markup).toContain('방콕 하역 대기 3척 13,764MT');
    expect(markup).toContain('냉동 운반선 우선 배정 권고');
    expect(markup).toContain('border-radius:12px');
  });

  it('vessel 유형: 배경 슬롯과 하단 스트립을 렌더한다 (이미지 교체 가능 구조, 스펙 §6)', () => {
    const markup = renderToStaticMarkup(
      React.createElement(HeroZone, {
        variant: 'vessel',
        title: '선단 운영',
        background: React.createElement('img', { src: '/heroes/seiner.webp', alt: '' }),
        strip: React.createElement('div', null, '제701태창호'),
      }),
    );

    expect(markup).toContain('/heroes/seiner.webp');
    expect(markup).toContain('제701태창호');
  });

  it('KPI 숫자 run만 모노를 쓰고 단위는 산세리프이며 LIVE만 갱신 영역으로 표시한다', () => {
    const markup = renderToStaticMarkup(
      React.createElement(HeroZone, {
        variant: 'kpi',
        title: '시장 동향',
        primaryKpi: {
          label: '실시간 환율',
          value: 1388.42,
          unit: '(원/USD)',
          decimals: 2,
          live: true,
        },
        secondaryKpis: [
          { label: '고정 목표', value: 1400, unit: '(원/USD)' },
        ],
      }),
    );

    expect(markup.match(/font-family:var\(--dsc-font-mono\)/g)?.length).toBe(2);
    expect(markup.match(/data-kpi-number="true"/g)?.length).toBe(2);
    expect(markup.match(/data-kpi-unit="true"/g)?.length).toBe(2);
    expect(markup.match(/data-kpi-unit="true"[^>]*font-family/g)).toBeNull();
    expect(markup.match(/data-live-kpi="true"/g)?.length).toBe(1);
    expect(markup.match(/aria-live="polite"/g)?.length).toBe(1);
    expect(markup).toContain('background:var(--dsc-bg-deep)');
    expect(markup).not.toContain('linear-gradient(160deg, var(--dsc-bg)');
  });
});

describe('Deep Sea Command V2.5 — StatRow', () => {
  it('HeroKpi 4개를 저대비 4-up 보조 KPI 목록으로 렌더한다', async () => {
    const statRowModule = await import('../components/v2/StatRow').catch(() => null);

    expect(statRowModule).not.toBeNull();
    const StatRow = statRowModule?.default;
    expect(StatRow).toBeTypeOf('function');
    if (typeof StatRow !== 'function') return;

    const markup = renderToStaticMarkup(
      React.createElement(StatRow, {
        ariaLabel: '선단 보조 지표',
        kpis: [
          { label: '8월 누적', value: 1234, unit: '(M/T)' },
          { label: '연간 누적', value: 56789, unit: '(M/T)' },
          { label: '선적량', value: 1234.5, unit: '(M/T)', decimals: 1 },
          { label: '가동 선박', value: 18, unit: '(척)' },
        ],
      }),
    );

    expect(markup).toContain('aria-label="선단 보조 지표"');
    expect(markup.match(/role="listitem"/g)?.length).toBe(4);
    expect(markup).toContain('grid-template-columns:repeat(4,minmax(0,1fr))');
    expect(markup.match(/data-kpi-number="true"/g)?.length).toBe(4);
    expect(markup.match(/data-kpi-unit="true"/g)?.length).toBe(4);
    expect(markup.match(/font-family:var\(--dsc-font-mono\)/g)?.length).toBe(4);
    expect(markup.match(/data-kpi-unit="true"[^>]*font-family/g)).toBeNull();
    expect(markup).toContain('border-radius:12px');
    expect(markup).toContain('1,234.5');
  });
});

describe('Deep Sea Command V2.5 — LiveTicker', () => {
  it('시세 라벨·변동값은 산세리프를 유지하고 value 숫자 run에만 모노를 적용한다', async () => {
    const tickerModule = await import('../components/LiveTicker');
    const TickerQuote = (tickerModule as Record<string, unknown>).TickerQuote;

    expect(TickerQuote).toBeTypeOf('function');
    if (typeof TickerQuote !== 'function') return;

    const markup = renderToStaticMarkup(
      React.createElement(TickerQuote as React.ComponentType<any>, {
        item: { label: 'SKJ 방콕', value: '$1,900', diff: '+2.1%', trend: 'up' },
      }),
    );

    expect(markup).toContain('SKJ 방콕');
    expect(markup).toContain('$1,900');
    expect(markup).toContain('+2.1%');
    expect(markup).toContain('data-ticker-value="true"');
    expect(markup).toContain('data-ticker-diff="true"');
    expect(markup.match(/font-family:var\(--dsc-font-mono\)/g)?.length).toBe(1);
    expect(markup).toContain('font-variant-numeric:tabular-nums');
  });

  it('티커 접두는 경보색이 아닌 무채색 데이터 크롬으로 렌더한다', async () => {
    const tickerModule = await import('../components/LiveTicker');
    const markup = renderToStaticMarkup(React.createElement(tickerModule.default));

    expect(markup).toContain('data-ticker-tone="neutral"');
  });
});

describe('Deep Sea Command V2.5 — TelemetryBadge', () => {
  it('LIVE만 액센트를 쓰고 SYNCED·STATIC은 slate 중립 톤을 쓴다', () => {
    const liveMarkup = renderToStaticMarkup(
      React.createElement(TelemetryBadge, { status: 'LIVE' }),
    );
    const syncedMarkup = renderToStaticMarkup(
      React.createElement(TelemetryBadge, { status: 'SYNCED', syncDate: '2026-Q2' }),
    );
    const staticMarkup = renderToStaticMarkup(
      React.createElement(TelemetryBadge, { status: 'STATIC', syncDate: '2026-Q2' }),
    );

    expect(liveMarkup).toContain('data-telemetry-tone="accent"');
    expect(syncedMarkup).toContain('data-telemetry-tone="neutral"');
    expect(staticMarkup).toContain('data-telemetry-tone="neutral"');

    // 2026-08-15: 색은 인라인이 아니라 CSS 모듈로 이동 (라이트 스코프 재정의 가능해야 함) —
    // 톤 계약은 data 속성으로, 중립=slate·경보색 금지 계약은 모듈 CSS 원문으로 검증한다.
    const badgeCss = readFileSync(
      join(process.cwd(), 'components/TelemetryBadge.module.css'),
      'utf8',
    );
    expect(badgeCss).toContain('#94a3b8');
    expect(badgeCss).not.toContain('#f59e0b');
  });
});

describe('Deep Sea Command V2 — VesselTopSVG', () => {
  it('데이터 intensity가 있는 해치만 발광 필터를 받는다 (장식 발광 금지, V2 §5)', async () => {
    const { default: VesselTopSVG } = await import('../components/v2/VesselTopSVG');
    const markup = renderToStaticMarkup(
      React.createElement(VesselTopSVG, {
        kind: 'carrier',
        hatches: [
          { id: 'h1', intensity: 0.9 },
          { id: 'h2', intensity: 0 },
        ],
      }),
    );

    // 발광 필터는 intensity>0 해치에만 — 정확히 1회 등장
    expect(markup.match(/url\(#vsl-glow\)/g)?.length).toBe(1);
    // carrier는 크레인 마스트 2기 렌더
    expect(markup).toContain('선박 상면 도면');
  });
});

describe('Deep Sea Command V2 — Fleet pilot', () => {
  it('실제 선단 대시보드가 최신 일일보고 히어로와 데이터 기반 KPI를 렌더한다', () => {
    const markup = renderToStaticMarkup(React.createElement(FleetCommandCenter));

    expect(markup).toContain('선단 일일 작전');
    expect(markup).toContain('일간 합계');
    expect(markup).toContain('data-kpi-value="335"');
    // 2026-08-15 사용자 지시: 선박 사진 배경 제거 — 라이트 히어로는 배경 없이
    expect(markup).not.toContain('/heroes/seiner.webp');
  });
});

describe('Deep Sea Command V2 — Phase 2 운영 페이지', () => {
  it('하역 히어로가 현재 하역률을 8개 운반선 해치에 배분하고 진행·대기 선박을 표시한다', async () => {
    const unloadingModule = await import('../components/UnloadingStatus');
    const UnloadingHero = (unloadingModule as Record<string, unknown>).UnloadingHero;

    expect(UnloadingHero).toBeTypeOf('function');
    if (typeof UnloadingHero !== 'function') return;

    const markup = renderToStaticMarkup(
      React.createElement(UnloadingHero as React.ComponentType<any>, {
        vessels: [
          {
            id: 'completed',
            name: 'M/V 완료선',
            status: '하역완료',
            reportedTotal: 1000,
            actualTotal: 1000,
            annualActualTotal: 1000,
            location: '방콕, 태국',
            dateRange: '2026.01.01 ~ 2026.01.03',
          },
          {
            id: 'active',
            name: 'M/V SEIN VENUS',
            status: '하역중',
            reportedTotal: 3200,
            actualTotal: 1600,
            annualActualTotal: 1600,
            location: '방콕, 태국',
            dateRange: '2026.08.07 ~ 진행중',
          },
          {
            id: 'waiting',
            name: 'M/V HIKARI 1',
            status: '하역대기',
            reportedTotal: 2929,
            actualTotal: 0,
            annualActualTotal: 0,
            location: '방콕, 태국',
            dateRange: '하역 실적 대기',
          },
        ],
        baseDate: '2026.08.14',
        onSelectVessel: () => {},
        onOpenFieldMode: () => {},
      }),
    );

    expect(markup).toContain('Unloading Status');
    expect(markup).toContain('2026 누적 하역량');
    expect(markup).toContain('완료 선박');
    expect(markup).toContain('현재 하역 누계');
    expect(markup).toContain('잔여 목표량');
    expect(markup).toContain('M/V SEIN VENUS');
    expect(markup).toContain('M/V HIKARI 1');
    // 2026-08-15 사용자 지시: 선박 사진 배경 제거 (해치 발광 계약은 VesselTopSVG 단위 테스트가 보존)
    expect(markup).not.toContain('/heroes/carrier.webp');
  });

  it('물류 히어로가 31주차 4척 항로 마커와 기존 하역 SIT·TAK를 렌더한다', async () => {
    const logisticsModule = await import('../components/LogisticsDashboard');
    const LogisticsHero = (logisticsModule as Record<string, unknown>).LogisticsHero;

    expect(LogisticsHero).toBeTypeOf('function');
    if (typeof LogisticsHero !== 'function') return;

    const markup = renderToStaticMarkup(
      React.createElement(LogisticsHero as React.ComponentType<any>),
    );

    expect(markup).toContain('Logistics &amp; Processing');
    expect(markup).toContain('주간 하역 합계');
    expect(markup).toContain('(MT)');
    expect(markup.match(/data-week31-carrier-marker="true"/g)?.length).toBe(4);
    expect(markup.match(/data-marker-tone="data"/g)?.length).toBe(4);
    expect(markup).not.toContain('#f59e0b');
    expect(markup).toContain('2026-08-05 주간 보고에는 방콕 하역선 3척 13,764MT가 기록됐으며, 이 중 8월 누계는 2척 8,891MT입니다.');
    expect(markup).toContain('SEIN VENUS와 HENG HONG 9의 예정일이 도래했으므로 실제 입항·접안 여부를 확인합니다.');
  });

  it('시장 히어로가 Atuna 행에서 방콕·만타·주간 변동·황다랑어 KPI를 구성한다', async () => {
    const marketModule = await import('../components/MarketDashboard');
    const MarketHero = (marketModule as Record<string, unknown>).MarketHero;

    expect(MarketHero).toBeTypeOf('function');
    if (typeof MarketHero !== 'function') return;

    const markup = renderToStaticMarkup(
      React.createElement(MarketHero as React.ComponentType<any>, {
        rows: [
          { date: '2026-07-30', skj_bkk: 1790, yf_sey: 2100 },
          { date: '2026-07-31', skj_mnt: 2150 },
          { date: '2026-08-06', skj_bkk: 1900 },
        ],
      }),
    );

    expect(markup).toContain('Market Trends');
    expect(markup).toContain('방콕 SKJ 현물가');
    expect(markup).toContain('만타 SKJ 현물가');
    expect(markup).toContain('방콕 주간 변동');
    expect(markup).toContain('황다랑어 현물가');
    expect(markup).toContain('($/MT)');
  });
});

describe('Deep Sea Command V2 — Phase 3 잔여 페이지', () => {
  it('돼지고기 히어로가 기존 생산 데이터의 기준일·핵심 KPI·단위를 렌더한다', async () => {
    const porkModule = await import('../components/PorkDashboard');
    const PorkHero = (porkModule as Record<string, unknown>).PorkHero;

    expect(PorkHero).toBeTypeOf('function');
    if (typeof PorkHero !== 'function') return;

    const markup = renderToStaticMarkup(
      React.createElement(PorkHero as React.ComponentType),
    );

    expect(markup).toContain('Pork Market');
    expect(markup).toContain('데이터 기준일 2024년');
    expect(markup).toContain('중국 돈육 생산량');
    expect(markup).toContain('(천 MT)');
    expect(markup).toContain('한국 돈육 생산량');
    expect(markup).toContain('한국 돈육 자급률');
  });

  it('돼지고기 기존 5-Pillar 탐색을 공용 PillTabs의 탭·패널 관계로 렌더한다', async () => {
    const { default: PorkDashboard } = await import('../components/PorkDashboard');
    const markup = renderToStaticMarkup(React.createElement(PorkDashboard));

    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-label="돼지고기 밸류체인 보기"');
    expect(markup).toContain('id="pork-tab-P1"');
    expect(markup).toContain('aria-controls="pork-panel-P1"');
    expect(markup).toContain('id="pork-panel-P1"');
    expect(markup).toContain('aria-labelledby="pork-tab-P1"');
  });

  it('통합 인텔리전스 히어로가 합성 데이터의 기준일·압력·리스크 KPI를 렌더한다', async () => {
    const dashboardModule = await import('../components/CrossCommodityIntelligenceDashboard');
    const dataModule = await import('../lib/data/cross-commodity-intelligence');
    const CrossCommodityHero = (dashboardModule as Record<string, unknown>).CrossCommodityHero;

    expect(CrossCommodityHero).toBeTypeOf('function');
    if (typeof CrossCommodityHero !== 'function') return;

    const data = dataModule.getCrossCommodityIntelligence();
    const markup = renderToStaticMarkup(
      React.createElement(CrossCommodityHero as React.ComponentType<any>, {
        data,
        syncDate: '2026.07.03',
      }),
    );

    expect(markup).toContain('Cross Intelligence');
    expect(markup).toContain('데이터 기준일 2026.07.03');
    expect(markup).toContain('최대 대체 압력');
    expect(markup).toContain('평균 리스크 충격');
    expect(markup).toContain('(점)');
    expect(markup).toContain('(건)');
  });

  it('선망선 DB 히어로가 검증일·총 선박·등록 분포 KPI를 렌더한다', async () => {
    const purseSeinerModule = await import('../components/PurseSeinerDashboard');
    const PurseSeinerHero = (purseSeinerModule as Record<string, unknown>).PurseSeinerHero;

    expect(PurseSeinerHero).toBeTypeOf('function');
    if (typeof PurseSeinerHero !== 'function') return;

    const markup = renderToStaticMarkup(
      React.createElement(PurseSeinerHero as React.ComponentType),
    );

    expect(markup).toContain('Purse Seiner DB');
    expect(markup).toContain('데이터 기준일 2026.05.27');
    expect(markup).toContain('검증 선박');
    expect(markup).toContain('(척)');
    expect(markup).toContain('선적국');
    expect(markup).toContain('(개국)');
    expect(markup).toContain('운영사');
    expect(markup).toContain('(개사)');
  });
});

describe('Deep Sea Command V2 — PillTabs', () => {
  it('탭 라벨과 활성 상태, 선택적 패널 ARIA 연결을 렌더한다', () => {
    const markup = renderToStaticMarkup(
      React.createElement(PillTabs, {
        tabs: [
          { key: 's1', label: '원료 수급' },
          { key: 's2', label: '가공·생산', badge: 3 },
        ],
        activeKey: 's1',
        onChange: () => {},
        ariaLabel: '선단 업무 보기',
        tabIdPrefix: 'fleet-tab',
        panelIdPrefix: 'fleet-panel',
      }),
    );

    expect(markup).toContain('원료 수급');
    expect(markup).toContain('가공·생산');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain('aria-label="선단 업무 보기"');
    expect(markup).toContain('id="fleet-tab-s1"');
    expect(markup).toContain('aria-controls="fleet-panel-s1"');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain('tabindex="-1"');
    expect(markup).toContain('>3<');
  });

  it('활성 탭은 그라디언트 없이 눈에 띄는 단색 액센트 필을 쓴다 (2026-08-15 사용자 지시)', () => {
    const markup = renderToStaticMarkup(
      React.createElement(PillTabs, {
        tabs: [
          { key: 's1', label: '원료 수급' },
          { key: 's2', label: '가공·생산' },
        ],
        activeKey: 's1',
        onChange: () => {},
        accentFrom: '#123456',
        accentTo: '#abcdef',
      }),
    );

    expect(markup).toContain('border-radius:12px');
    // 활성 필은 accent-primary 단색 + 흰 글자 — 저대비 틴트(«${accentFrom}22») 금지
    expect(markup).toContain('background:var(--accent-primary)');
    expect(markup).toContain('color:#ffffff');
    expect(markup).not.toContain('#12345622');
    expect(markup).not.toContain('#abcdef');
    expect(markup).not.toContain('linear-gradient');
  });
});
