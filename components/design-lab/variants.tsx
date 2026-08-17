/**
 * 시안 레지스트리 — /design-lab 랭킹 갤러리의 유일한 입력.
 * 시안 추가는 DESIGN_VARIANTS 배열에 항목 하나 넣는 것으로 끝난다.
 * 시안은 실제 React 컴포넌트다 — 정지 이미지가 아니라 인터랙션까지 평가한다 (docs/SOUL.md).
 */
'use client';

import React, { useState } from 'react';
import { MarketHero } from '../MarketDashboard';
import TunaDailyBriefingWidget from '../TunaDailyBriefingWidget';
import FilterBar from '../v2/FilterBar';
import {
  ATUNA_GRAIN_LABELS,
  ATUNA_PERIOD_LABELS,
  type AtunaGrainKey,
  type AtunaPeriodKey,
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

export const DESIGN_VARIANTS: DesignVariant[] = [
  {
    id: 'market-hero-r1',
    title: '시장 동향 히어로 (KPI 유형)',
    round: 1,
    note: '데이터가 비었을 때(rows=[]) 히어로가 무엇을 말하는지 — 5초 안에 읽히는가',
    render: () => <MarketHero rows={[]} />,
  },
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
