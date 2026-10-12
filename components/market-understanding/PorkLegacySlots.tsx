/**
 * 「시장 이해 > 돼지고기」(/industry/pork) — 옛 /pork 의 손 작성 위젯 11개를 해부보고서
 * 「한국 돼지고기 산업 해부」 원문 11단계 중 주제가 맞는 단계 끝 「근거」로 옮긴다.
 * 참치 통합(TUNA_LEGACY_STAGE_MAP)과 같은 방식이다. 위젯 데이터 값은 그대로다.
 */
'use client';

import React from 'react';

import { PORK_WIDGETS } from '../PorkWidgets';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import type { ChartSlot } from './CommodityIndustryDashboard';

/** 위젯 → 원문 단계(h2 부제는 주석). */
export const PORK_LEGACY_STAGE_MAP: Record<string, string> = {
  W5: 's02', // 글로벌 Top 10 생산국 → 중국이 절반을 먹고, 미국·EU·브라질·캐나다가 판다
  W6: 's02', // 주요 8개국 생산량 10년 추이 → 같은 단계
  W7: 's03', // 한국 돈육 수급 구조 → 1,079만 두를 길러 1,872만 두를 잡고, 소비의 3할을 들여온다
  W11: 's03', // 한국 단백질 자급률 갭 → 같은 단계(자급률 표 4-14·USDA 자급률)
  W10: 's03', // 단백질 포트폴리오 비교 → 같은 단계(소비)
  W8: 's04', // 한국 수입 파트너 의존도 → 냉동 정육이 9할, 미국·스페인·캐나다가 7할
  W3: 's05', // 대륙간 무역 단가 스프레드 → 국제 돈가는 내리는데 국내 소비자가는 오른다
  W1: 's06', // 중국 생산량 및 ASF 사이클 → 질병과 지역화가 국가별 몫을 바꾼다
  W9: 's06', // ASF → 수산물 반사수혜 → 같은 단계
  W2: 's07', // 사료 연동 마진 압박 → 사료 계열이 양돈과 정육을 묶고, 수입은 380곳이 나눈다
  W4: 's08', // 육류별 탄소 배출(규제 과세 대상) → FTA 0%와 할당관세, ASF 지역화(제도)
};

/**
 * 옛 위젯의 자급률 66%와 보고서 표지 73.0%는 기준이 다르다. 위젯 값은 고치지 않고 기준을 적는다.
 * 근거: porkData.selfSufficiencyData 주석 「FBS/PSD 종합」·위젯 표기 「FAOSTAT FBS + USDA PSD 2022」,
 * 보고서 03절 표(자급률 KREI 73.0% · USDA 공식치 66.4%, 2025).
 */
export const PORK_SELF_SUFFICIENCY_BASIS =
  '돼지고기 66%는 2022년 FAOSTAT 식량수급표·미국 농무부 PSD 종합값이다(원 위젯 표기). 보고서 표지 73.0%는 KREI 『농업전망 2026』 국내 수급표의 2025년 추정치(생산÷소비, 중량 기준 표기 없음)이고, 같은 보고서가 PSD 공식치(도체중량)로 계산한 2025년 값은 66.4%다. 정의가 달라 두 값이 함께 성립한다.';

const CAPTION_NOTES: Record<string, string> = { W11: PORK_SELF_SUFFICIENCY_BASIS };

export const PORK_CHART_SLOTS: Record<string, ChartSlot[]> = (() => {
  const out: Record<string, ChartSlot[]> = {};
  for (const [id, spec] of Object.entries(PORK_WIDGETS)) {
    const dest = PORK_LEGACY_STAGE_MAP[id];
    if (!dest) throw new Error(`돼지고기 옛 위젯 ${id} 의 행선지가 없다`);
    (out[dest] ??= []).push({
      title: spec.title,
      caption: [spec.sub, spec.sit, CAPTION_NOTES[id]].filter(Boolean).join(' '),
      telemetry: { status: 'STATIC', syncDate: spec.telemetry },
      render: () => (
        <SafeResponsiveContainer width="100%" height={340}>
          {spec.chart()}
        </SafeResponsiveContainer>
      ),
      sourceLine: `출처: ${spec.source}`,
    });
  }
  return out;
})();
