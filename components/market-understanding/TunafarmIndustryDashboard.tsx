/**
 * 「시장 이해 > 참치 양식」.
 *
 * 골격은 `CommodityIndustryDashboard` 가 갖고 있다. 여기는 히어로 수치와 표만 정한다.
 *
 * ⚠ 히어로 주수치는 **FAO 2024 세계 양식 생산량**이다. 다만 이것은 세계 전수가 아니라
 *   **보고한 나라들의 합**이다 — 2024년 결측이 10항목이고 2015년 5개에서 늘었다.
 *   부제와 01단계가 그 사실을 적는다. 「세계 생산량」이라고만 쓰지 않는다.
 * ⚠ 인가 입식 상한(75,199.84 t)과 동부 총허용어획량(48,403 t)은 **층이 다르다**.
 *   히어로 스트립에 나란히 두되 「다른 층」이라고 적는다.
 * ⚠ 차트를 두지 않았다. 이 편의 값은 시계열 곡선이 아니라 **어느 숫자가 무엇을 세는가**에
 *   있고, 표와 서술이 그 일을 한다. 차트를 붙이려면 층이 섞이지 않는 축부터 정해야 한다.
 */
'use client';

import React from 'react';

import {
  TUNAFARM_BRIEFING_POINTS,
  TUNAFARM_NARRATIVES,
  TUNAFARM_SOURCE_NOTES,
} from '@/lib/tunafarm-industry-content';
import CommodityIndustryDashboard, {
  type CommoditySpec,
} from './CommodityIndustryDashboard';

/** 축양 페이지 강조색. 지중해 가두리의 남색 계열. */
const TUNAFARM_ACCENT = '#2f6f8f';

const SPEC: CommoditySpec = {
  // 단계를 탭으로 넘기지 않고 한 페이지에 전부 출력한다(2026-09-10 사용자 지시).
  continuous: true,
  key: 'tunafarm',
  title: '참치 양식',
  subtitle:
    '세계 참치 축양 해부 · 넣은 무게와 판 무게를 다른 기관이 센다 - 경계·층·명부·통계·값·원가·기업·한국',
  accent: TUNAFARM_ACCENT,
  primaryKpi: {
    label: '2024 세계 양식 생산 (보고한 나라 합)',
    value: 68443,
    unit: '(톤)',
    accent: TUNAFARM_ACCENT,
  },
  secondaryKpis: [
    { label: '2024 산지 출하 단가', value: 13.52, unit: '(달러/kg)', decimals: 2 },
    { label: '일본 인공종묘 유래 출하 2024', value: 405, unit: '(톤)' },
    { label: '2025 한국 참다랑어 수입', value: 7168.3, unit: '(톤)', decimals: 1 },
  ],
  stripItems: [
    { eyebrow: '기준', title: '거의 전부가 축양이다', body: '야생 개체를 잡아 가두리에서 살찌운다' },
    { eyebrow: '명부', title: '인가 양식장', body: '대서양 74곳 · 남방 농장 8곳(허가 10건)' },
    { eyebrow: '상한', title: '연간 야생 입식 상한', body: '75,199.84 t — 총허용어획량과 다른 층' },
    { eyebrow: '원가', title: '종묘 대 사료', body: '1.85배 — 사료가 아니라 종묘다' },
    { eyebrow: '한국', title: '일본 경유 대서양참다랑어', body: '987 / 1,207건 (81.8%)' },
    { now: true, eyebrow: '지금', title: '명부 조회가 고장나 있다', body: '결과 페이지 HTTP 500 (2026-09-13)' },
  ],
  briefing: TUNAFARM_BRIEFING_POINTS,
  narratives: TUNAFARM_NARRATIVES,
  chartSlots: {},
  sourceNotes: TUNAFARM_SOURCE_NOTES,
  sourceMeta: [
    '세계 참치 양식 조사 제1보 2026-09-13',
    'FAO FishStat 2026.1.0',
    'ICCAT 명부 2023-09-22 보존본',
    'CCSBT 명부 2026-09-13',
    '일본 수산청 2026-02',
    '식약처 원장 2026-09-11',
    '관세청 2026-09',
  ].join(' · '),
};

export interface TunafarmIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function TunafarmIndustryDashboard({ heroOnly = false }: TunafarmIndustryDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
