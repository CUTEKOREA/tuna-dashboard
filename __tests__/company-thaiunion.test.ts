/**
 * 「시장 이해 > 기업 해부」 Thai Union 가드.
 *
 * 이 파일이 지키는 것은 세 가지다.
 *   ① 서술이 「」로 지목한 차트가 그 단계에 실제로 있는가
 *   ② 인용된 수치가 인테이크 값과 어긋나지 않는가 — 특히 연결/개별 역전
 *   ③ 원본에 없는 값을 추정으로 채우지 않았는가 (2023년 매출 null)
 */
import { describe, expect, it } from 'vitest';

import {
  THAIUNION_SOURCE_NOTES,
} from '@/lib/company-thaiunion-content';
import {
  latestKoreaExport,
  latestTuFinancial,
  sepOverConRatio,
  thaiUnionConVsSep,
  thaiUnionFinancials,
  thaiUnionKoreaImport,
  thaiUnionMscTrend,
  thaiUnionSegments,
  thaiUnionTc25,
  thaiUnionUsTariff,
  totalBrandSku,
  thaiUnionBalance,
  thaiUnionGhgScopes,
  thaiUnionRegions,
  thaiUnionSeachange,
  thaiUnionShareholders,
  tunaCapacityMt,
} from '@/lib/data/company-thaiunion';
import { proseBriefing, proseStages } from '@/lib/company-prose-stages';
import { tablesForStage } from '@/lib/data/company-report-tables';

// 서술은 조사보고서에서 그대로 읽어 온다. 손으로 쓴 상수는 더 없다.
const THAIUNION_NARRATIVES = proseStages('thaiunion');
const THAIUNION_BRIEFING = proseBriefing('thaiunion');

/** 대시보드 파일에 실린 슬롯 제목. 컴포넌트를 import 하면 recharts 가 딸려와 느려진다. */
const SLOT_TITLES: Record<string, string[]> = {
  c01: ['회사 개요', '주주 구성 (%)', '연혁 - 두 번의 도약'],
  c02: ['카테고리별 매출과 마진 (십억 밧·%)', '자사 브랜드 매출 비중 (%)', '카테고리별 지역 구성 (%)'],
  c03: ['브랜드 포트폴리오 - 실측 SKU', 'John West 형태 사다리 (£/kg)', '소매 실판매가 표본'],
  c04: ['그룹 생산능력 (톤/년)', '가공 거점', '참치 조달 어장 구성 추이 (%)', 'TC25 6대 약속 이행률 (%)'],
  c05: ['GHG Scope 별 배출 (천 tCO2e)', 'SeaChange 2030 대시보드 (%)'],
  c06: ['매출과 마진 (십억 밧·%)', '연결 vs 개별 - 순이익 역전 (십억 밧)', '재무상태 (백만 밧)', 'Red Lobster - 4겹'],
  c07: ['한국 → 태국 냉동참치 수출 (톤·백만$)', '참치조제품 대한 수입 (2024)', '식약처 수입신고 구성 (건)', '미국 실효 관세 (%)'],
};

describe('Thai Union 서술과 차트의 연결', () => {

  it('모든 단계에 차트나 보고서 표가 하나 이상 있다', () => {
    // 보고서 표는 이제 서술 흐름(flow) 안에 원문 자리로 들어간다.
    for (const n of THAIUNION_NARRATIVES) {
      const curated = SLOT_TITLES[n.key]?.length ?? 0;
      const tables = tablesForStage('thaiunion', n.key).length;
      expect(curated + tables, `${n.key}`).toBeGreaterThan(0);
    }
  });

  it('브리핑은 실재하는 단계를 가리킨다', () => {
    const keys = new Set(THAIUNION_NARRATIVES.map((n) => n.key));
    for (const b of THAIUNION_BRIEFING) expect(keys).toContain(b.stage);
  });

  it('출처 노트가 비어 있지 않다', () => {
    expect(THAIUNION_SOURCE_NOTES.length).toBeGreaterThan(0);
  });
});

describe('Thai Union 인테이크 정합', () => {
  it('연결/개별 역전이 실재한다 - 개별 순이익이 연결보다 크다', () => {
    const row = thaiUnionConVsSep.find((r) => r.항목 === '당기순이익');
    expect(row).toBeDefined();
    expect(row!.개별).toBeGreaterThan(row!.연결);
    expect(sepOverConRatio()).toBeGreaterThan(1);
  });

  it('지배주주 귀속은 당기순이익보다 작다 (비지배지분 존재)', () => {
    const net = thaiUnionConVsSep.find((r) => r.항목 === '당기순이익')!;
    const parent = thaiUnionConVsSep.find((r) => r.항목 === '지배주주 귀속')!;
    expect(parent.연결).toBeLessThan(net.연결);
  });

  it('EPS 착시 - 지배주주 이익은 줄었는데 EPS 는 올랐다', () => {
    const y24 = thaiUnionFinancials.find((r) => r.연도 === 2024)!;
    const y25 = thaiUnionFinancials.find((r) => r.연도 === 2025)!;
    expect(y25.지배주주순이익!).toBeLessThan(y24.지배주주순이익!);
    expect(y25.eps!).toBeGreaterThan(y24.eps!);
  });

  it('2023년 연결 매출은 null - 추정으로 메우지 않았다', () => {
    const y23 = thaiUnionFinancials.find((r) => r.연도 === 2023)!;
    expect(y23.매출).toBeNull();
    expect(y23.ebitda).toBeNull();
  });

  it('카테고리 비중 합이 100% 근처다', () => {
    const total = thaiUnionSegments.reduce((a, r) => a + r.비중, 0);
    expect(Math.abs(total - 100)).toBeLessThan(0.5);
  });

  it('MSC 추이 각 연도의 축 합이 100% 근처다', () => {
    for (const r of thaiUnionMscTrend) {
      const total = r.msc + r.심사중 + r.fip + r.무관계;
      expect(Math.abs(total - 100), `${r.연도}년`).toBeLessThan(1.0);
    }
  });

  it('TC25 는 6개 약속이고 이행률은 0~100 이다', () => {
    expect(thaiUnionTc25).toHaveLength(6);
    for (const r of thaiUnionTc25) {
      expect(r.실적).toBeGreaterThan(0);
      expect(r.실적).toBeLessThanOrEqual(100);
    }
  });

  it('헤드라인 수치가 인테이크와 일치한다', () => {
    expect(latestTuFinancial().매출).toBe(132719);
    expect(latestTuFinancial().gpm).toBe(18.9);
    expect(tunaCapacityMt()).toBe(570000);
    expect(Math.round(latestKoreaExport().톤)).toBe(86514);
  });

  it('대한 수입 표 - 베트남이 태국보다 크고 관세 문자열에 세율이 있다', () => {
    const vn = thaiUnionKoreaImport.find((r) => r.원산지 === '베트남')!;
    const th = thaiUnionKoreaImport.find((r) => r.원산지 === '태국')!;
    expect(vn.usd).toBeGreaterThan(th.usd);
    expect(vn.관세).toContain('0%');
    expect(th.관세).toContain('20%');
  });

  it('미국 관세 표 - 수침 캔참치가 가장 무겁다', () => {
    const ambient = thaiUnionUsTariff.find((r) => r.품목.includes('캔참치'))!;
    expect(ambient.부담).toContain('31.5');
  });

  it('주주 표 - 자기주식이 2위이고 창업가문 합계가 26.85%다', () => {
    const self = thaiUnionShareholders.find((r) => r.주주.includes('자기주식'))!;
    expect(self.순위).toBe(2);
    expect(self.지분).toBe(13.47);
  });

  it('GHG - 2023년 Scope 3 는 null (미보고, 추정 금지)', () => {
    const y23 = thaiUnionGhgScopes.find((r) => r.연도 === 2023)!;
    expect(y23.s3).toBeNull();
    const y24 = thaiUnionGhgScopes.find((r) => r.연도 === 2024)!;
    const y25 = thaiUnionGhgScopes.find((r) => r.연도 === 2025)!;
    // Scope 3 절대량 증가 — «감축» 헤드라인의 반대 방향 사실
    expect(y25.s3!).toBeGreaterThan(y24.s3!);
  });

  it('지역 구성 - 각 카테고리 합이 100% 근처다', () => {
    for (const r of thaiUnionRegions) {
      const total = r.미국 + r.유럽 + r.아시아기타;
      expect(Math.abs(total - 100), r.카테고리).toBeLessThan(0.5);
    }
  });

  it('재무상태 - 자본 감소·부채 증가 방향이 맞다', () => {
    const eq = thaiUnionBalance.find((r) => r.항목 === '총자본')!;
    const debt = thaiUnionBalance.find((r) => r.항목 === '총부채')!;
    expect(eq.y2025).toBeLessThan(eq.y2024);
    expect(debt.y2025).toBeGreaterThan(debt.y2024);
  });

  it('SeaChange - GDST 0% 가 실재하고 실적은 0~100 범위다', () => {
    expect(thaiUnionSeachange.some((r) => r.실적 === 0)).toBe(true);
    for (const r of thaiUnionSeachange) {
      expect(r.실적).toBeGreaterThanOrEqual(0);
      expect(r.실적).toBeLessThanOrEqual(100);
    }
  });

  it('브랜드 실측 SKU 합계가 454다', () => {
    expect(totalBrandSku()).toBe(454);
  });
});
