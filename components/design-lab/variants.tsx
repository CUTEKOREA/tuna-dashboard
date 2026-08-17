/**
 * 시안 레지스트리 — /design-lab 랭킹 갤러리의 유일한 입력.
 * 시안 추가는 DESIGN_VARIANTS 배열에 항목 하나 넣는 것으로 끝난다.
 * 시안은 실제 React 컴포넌트다 — 정지 이미지가 아니라 인터랙션까지 평가한다 (docs/SOUL.md).
 */
'use client';

import React, { useEffect, useState } from 'react';
import TunaDailyBriefingWidget from '../TunaDailyBriefingWidget';
import FilterBar from '../v2/FilterBar';
import HeroMarketCommand from '../HeroMarketCommand';
import {
  ATUNA_GRAIN_LABELS,
  ATUNA_PERIOD_LABELS,
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

/** r3: rows 주입형 시안을 공용 fetch로 감싼다 */
function withRows(Comp: React.ComponentType<{ rows: AtunaPriceRow[] }>) {
  function BoundVariant() {
    const state = useAtunaRows();
    return <DataGuard {...state}>{(rows) => <Comp rows={rows} />}</DataGuard>;
  }
  return BoundVariant;
}
const AdoptedHero = withRows(HeroMarketCommand);

// r4 판정: B ★4 «이게 더 마음에 듦» — 최종 채택, 실페이지(시장 동향) 반영. 라운드 종료
export const DESIGN_VARIANTS: DesignVariant[] = [
  {
    id: 'market-hero-adopted',
    title: '히어로 최종 채택본 (r4-B · 시장 동향 반영됨)',
    round: 4,
    note: '4라운드 수렴 결과. 실페이지에 반영 — 추가 지적은 여기 코멘트로',
    render: () => <AdoptedHero />,
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
