/**
 * 시안 레지스트리 — /design-lab 랭킹 갤러리의 유일한 입력.
 * 시안 추가는 DESIGN_VARIANTS 배열에 항목 하나 넣는 것으로 끝난다.
 * 시안은 실제 React 컴포넌트다 — 정지 이미지가 아니라 인터랙션까지 평가한다 (docs/SOUL.md).
 */
'use client';

import React, { useEffect, useState } from 'react';
import HeroMarketCommand from '../HeroMarketCommand';
import NewsFrontPage from './r5/NewsFrontPage';
import NewsWire from './r5/NewsWire';
import FilterUnderline from './r5/FilterUnderline';
import FilterSegment from './r5/FilterSegment';
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
  // r5 (2026-08-17): 뉴스·필터 다변화 라운드 — 현행(★3)은 실페이지가 기준선, 갤러리는 대안 4종
  {
    id: 'news-r5a',
    title: '뉴스 r5-A: 신문 1면형',
    round: 5,
    note: '리드 초대형 헤드라인+첫 문단, 임팩트 넘버 세로 스택, 나머지 2단 컬럼 전부 펼침',
    render: () => <NewsFrontPage />,
  },
  {
    id: 'news-r5b',
    title: '뉴스 r5-B: 와이어형',
    round: 5,
    note: '임팩트 넘버 스트립 + 기사 전체 시간순 테이블. 밀도 지향, 행 hover 리프트',
    render: () => <NewsWire />,
  },
  {
    id: 'filter-r5a',
    title: '필터 r5-A: 언더라인 탭형',
    round: 5,
    note: '활성 = 액센트 굵은 언더라인 + 900 웨이트 (pill 대비 잉크 절약형)',
    render: () => <FilterUnderline />,
  },
  {
    id: 'filter-r5b',
    title: '필터 r5-B: 세그먼트형',
    round: 5,
    note: '트랙 안에서 활성 배경이 슬라이딩. 흰 배경+잉크 = 눈에 띄게(취향 ②)',
    render: () => <FilterSegment />,
  },
];
