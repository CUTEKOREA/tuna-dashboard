/**
 * 시안 레지스트리 — /design-lab 랭킹 갤러리의 유일한 입력.
 * 시안 추가는 DESIGN_VARIANTS 배열에 항목 하나 넣는 것으로 끝난다.
 * 시안은 실제 React 컴포넌트다 — 정지 이미지가 아니라 인터랙션까지 평가한다 (docs/SOUL.md).
 */
'use client';

import React, { useEffect, useState } from 'react';
import HeroMarketCommand from '../HeroMarketCommand';
import NewsFrontPage from '../NewsFrontPage';
import FleetHeroCommand from '../FleetHeroCommand';
import UnloadingHeroCommand from './r6/UnloadingHeroCommand';
import UnloadingMonthBoard from './r7/UnloadingMonthBoard';
import UnloadingVoyageGantt from './r7/UnloadingVoyageGantt';
import FilterBar from '../v2/FilterBar';
import { type AtunaPriceRow } from '../../lib/data/atuna-price-summary';

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
  // r6 (2026-08-17): 채택된 지휘형 문법의 운영 페이지 번안 — 선단·하역
  {
    id: 'fleet-hero-adopted',
    title: '선단 지휘형 최종 채택본 (r6 ★4 · 선단 운영 반영됨)',
    round: 6,
    note: '실페이지에 히어로 아래 섹션으로 반영 — 추가 지적은 여기 코멘트로',
    render: () => <FleetHeroCommand />,
  },
  // r7 (2026-08-17): 하역 다변화 — «월 기준» 재해석 2형 + 기존 지휘형(비교 기준선)
  {
    id: 'unloading-r7a',
    title: '하역 r7-A: 월별 그룹 보드',
    round: 7,
    note: '«월 기준»을 그룹핑으로 해석 — 월 섹션 헤더 아래 그 달 항차 카드. 선택 없음, 훑는 보드',
    render: () => <UnloadingMonthBoard />,
  },
  {
    id: 'unloading-r7b',
    title: '하역 r7-B: 항차 기간 바',
    round: 7,
    note: '항차를 시간축 가로 바로 — 어느 달에 어떤 배가 걸쳐 있는지. 바 클릭 = 상단 KPI 전환',
    render: () => <UnloadingVoyageGantt />,
  },
  {
    id: 'unloading-r7c',
    title: '하역 r7-C: 항차 지휘형 (r6 기준선)',
    round: 7,
    note: '기존 지휘형(월 정렬) — 위 두 신형과 비교용 기준선',
    render: () => <UnloadingHeroCommand />,
  },
  // r5 판정: 뉴스 A ★4·필터 B ★4 — 채택, 실페이지 반영. 갤러리는 채택본만 (추가 지적 수집용)
  {
    id: 'news-adopted',
    title: '뉴스 최종 채택본 (r5-A 신문 1면형 · 시장 동향 반영됨)',
    round: 5,
    note: '승격 시 기사 클릭 = 전문 펼침 추가. 추가 지적은 여기 코멘트로',
    render: () => <NewsFrontPage />,
  },
  {
    id: 'filter-adopted',
    title: '필터 최종 채택본 (r5-B 세그먼트형 · FilterBar 반영됨)',
    round: 5,
    note: '실페이지 FilterBar 내부가 세그먼트로 교체됨. 미리보기는 더미 상태',
    render: () => <FilterAdoptedPreview />,
  },
];

function FilterAdoptedPreview() {
  const [period, setPeriod] = useState('all');
  const [grain, setGrain] = useState('week');
  return (
    <FilterBar
      periodOptions={[
        { key: '3m', label: '3개월' }, { key: '6m', label: '6개월' },
        { key: '1y', label: '1년' }, { key: 'all', label: '전체' },
      ]}
      period={period}
      onPeriodChange={setPeriod}
      grainOptions={[{ key: 'week', label: '주간' }, { key: 'month', label: '월간' }]}
      grain={grain}
      onGrainChange={setGrain}
      scopeNote="시안 미리보기 — 더미 상태"
    />
  );
}
