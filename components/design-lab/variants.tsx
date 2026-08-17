/**
 * 시안 레지스트리 — /design-lab 랭킹 갤러리의 유일한 입력.
 * 시안 추가는 DESIGN_VARIANTS 배열에 항목 하나 넣는 것으로 끝난다.
 * 시안은 실제 React 컴포넌트다 — 정지 이미지가 아니라 인터랙션까지 평가한다 (docs/SOUL.md).
 */
'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, YAxis } from 'recharts';
import { MarketHero } from '../MarketDashboard';
import TunaDailyBriefingWidget from '../TunaDailyBriefingWidget';
import FilterBar from '../v2/FilterBar';
import {
  ATUNA_GRAIN_LABELS,
  ATUNA_PERIOD_LABELS,
  SKJ_ATUNA_HUBS,
  YF_ATUNA_HUBS,
  latestTwoForAtunaHub,
  calcAtunaDeltaPct,
  type AtunaGrainKey,
  type AtunaPeriodKey,
  type AtunaPriceRow,
} from '../../lib/data/atuna-price-summary';

export interface DesignVariant {
  /** localStorage 평가 키 — 라운드가 바뀌어도 재사용하지 않는다 */
  id: string;
  title: string;
  /** 리뷰 라운드 번호 */
  round: number;
  /** 이 시안에서 무엇을 보라는 것인지 한 줄 */
  note: string;
  render: () => React.ReactNode;
}

const PERIOD_KEYS: AtunaPeriodKey[] = ['3m', '6m', '1y', 'all'];
const GRAIN_KEYS: AtunaGrainKey[] = ['week', 'month'];

/** FilterBar는 제어 컴포넌트다 — 미리보기용 더미 상태를 여기서 쥔다 */
function FilterBarPreview() {
  const [period, setPeriod] = useState<AtunaPeriodKey>('all');
  const [grain, setGrain] = useState<AtunaGrainKey>('week');

  return (
    <FilterBar
      periodOptions={PERIOD_KEYS.map((key) => ({ key, label: ATUNA_PERIOD_LABELS[key] }))}
      period={period}
      onPeriodChange={setPeriod}
      grainOptions={GRAIN_KEYS.map((key) => ({ key, label: ATUNA_GRAIN_LABELS[key] }))}
      grain={grain}
      onGrainChange={setGrain}
      scopeNote="시안 미리보기 — 어떤 차트에도 연결되지 않은 더미 상태"
    />
  );
}

/* r1 판정 반영(★1 «수치 확인이 안됨»): 시안은 실데이터를 렌더한다 (SOUL ④ 숫자 정직).
   같은 fetch를 시안 셋이 공유 — 게이트 뒤 페이지라 /api/atuna-prices 그대로 쓴다 */
function useAtunaRows() {
  const [rows, setRows] = useState<AtunaPriceRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    fetch('/api/atuna-prices')
      .then((res) => res.json())
      .then((data) => {
        const hist: AtunaPriceRow[] = Array.isArray(data?.history) ? data.history : [];
        if (hist.length === 0) setFailed(true); else setRows(hist);
      })
      .catch(() => setFailed(true));
  }, []);
  return { rows, failed };
}

function DataGuard({ rows, failed, children }: {
  rows: AtunaPriceRow[] | null;
  failed: boolean;
  children: (rows: AtunaPriceRow[]) => React.ReactNode;
}) {
  if (failed) return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>가격 데이터 수신 실패 — 시안 평가 불가 (새로고침으로 재시도)</p>;
  if (!rows) return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>가격 데이터 수신 중…</p>;
  return <>{children(rows)}</>;
}

function HeroRealData() {
  const state = useAtunaRows();
  return <DataGuard {...state}>{(rows) => <MarketHero rows={rows} />}</DataGuard>;
}

/** r2-B 밀도형 — 주 KPI + 전 허브 스탯 스트립 (조종석 밀도 철학) */
function HeroStatStrip() {
  const state = useAtunaRows();
  return (
    <DataGuard {...state}>
      {(rows) => {
        const bkk = latestTwoForAtunaHub(rows, SKJ_ATUNA_HUBS[0]);
        const hubs = [
          ...SKJ_ATUNA_HUBS.map((hub) => ({ hub, kind: 'SKJ' })),
          ...YF_ATUNA_HUBS.map((hub) => ({ hub, kind: 'YF' })),
        ];
        return (
          <div className="dsc-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>방콕 SKJ 현물가</span>
              <span style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
                {bkk.latest ? `$${bkk.latest.price.toLocaleString()}` : '—'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>($/MT)</span>
              {bkk.latest && (
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  기준일 {bkk.latest.date.replace(/-/g, '.')}
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(118px, 1fr))', gap: 8, marginTop: 14 }}>
              {hubs.map(({ hub, kind }) => {
                const pair = latestTwoForAtunaHub(rows, hub);
                const delta = calcAtunaDeltaPct(pair);
                return (
                  <div key={hub.key} style={{ border: '1px solid var(--card-border, #e2e4e9)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>{kind} {hub.label}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
                      {pair.latest ? `$${pair.latest.price.toLocaleString()}` : '—'}
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: delta === null ? 'var(--text-muted)' : delta >= 0 ? 'var(--accent-warning, #b45309)' : 'var(--accent-success, #3f6212)' }}>
                      {delta === null ? '직전 없음' : `${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta).toFixed(1)}%`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }}
    </DataGuard>
  );
}

/** r2-C 추세형 — 주 KPI + 방콕 SKJ 최근 12주 스파크라인 */
function HeroSparkline() {
  const state = useAtunaRows();
  return (
    <DataGuard {...state}>
      {(rows) => {
        const bkk = latestTwoForAtunaHub(rows, SKJ_ATUNA_HUBS[0]);
        const deltaPct = calcAtunaDeltaPct(bkk);
        const recent = rows
          .filter((row) => typeof row.skj_bkk === 'number')
          .slice(-12)
          .map((row) => ({ date: row.date, price: row.skj_bkk as number }));
        return (
          <div className="dsc-card" style={{ padding: '20px 22px', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>방콕 SKJ 현물가</div>
              <div style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
                {bkk.latest ? `$${bkk.latest.price.toLocaleString()}` : '—'}
                <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>($/MT)</span>
              </div>
              {deltaPct !== null && (
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: deltaPct >= 0 ? 'var(--accent-warning, #b45309)' : 'var(--accent-success, #3f6212)' }}>
                  직전 고시 대비 {deltaPct >= 0 ? '▲' : '▼'} {Math.abs(deltaPct).toFixed(1)}%
                </div>
              )}
              {bkk.latest && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>기준일 {bkk.latest.date.replace(/-/g, '.')} · 최근 12주 고시</div>
              )}
            </div>
            {recent.length >= 2 && (
              <LineChart width={340} height={92} data={recent} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <YAxis hide domain={['auto', 'auto']} />
                <Line type="monotone" dataKey="price" stroke="var(--chart-s1, #509ee3)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            )}
          </div>
        );
      }}
    </DataGuard>
  );
}

export const DESIGN_VARIANTS: DesignVariant[] = [
  {
    id: 'market-hero-r2a',
    title: '히어로 r2-A: 현행 KPI형 + 실데이터',
    round: 2,
    note: 'r1 지적(수치 확인 안됨) 반영 — 현행 히어로에 실데이터. 이것이 기준선',
    render: () => <HeroRealData />,
  },
  {
    id: 'market-hero-r2b',
    title: '히어로 r2-B: 밀도형 — 전 허브 스탯 스트립',
    round: 2,
    note: '8개 허브 최신가·증감을 한 화면에. 조종석 밀도 철학의 히어로 번안',
    render: () => <HeroStatStrip />,
  },
  {
    id: 'market-hero-r2c',
    title: '히어로 r2-C: 추세형 — KPI + 12주 스파크라인',
    round: 2,
    note: '숫자 하나 크게 + 방향은 선으로. 5초 판단(테슬라 철학) 극단형',
    render: () => <HeroSparkline />,
  },
  // r1 히어로(빈 데이터 시안)는 ★1 «수치 확인이 안됨»으로 라운드 종료 — r2a~c가 대체
  {
    id: 'daily-briefing-r1',
    title: '오늘의 참치 뉴스 위젯',
    round: 1,
    note: '리드 기사 + 임팩트 넘버 위계. 다이제스트 클릭 펼침 동작까지 평가 대상',
    render: () => <TunaDailyBriefingWidget />,
  },
  {
    id: 'filter-bar-r1',
    title: '기간·입도 필터 바',
    round: 1,
    note: '탐색 손잡이(취향 7조 ⑦). 활성 pill 대비가 흐릿하지 않은가',
    render: () => <FilterBarPreview />,
  },
];
