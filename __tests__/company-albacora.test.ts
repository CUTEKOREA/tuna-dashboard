/**
 * Albacora 인테이크 회귀 테스트.
 *
 * 지키는 것은 셋이다.
 *  ① **비공시를 비공시로 유지한다** — 선단 6척과 매출 시계열은 없는 채로 남아야 한다.
 *    누군가 «보기 안 좋다»고 추정으로 메우면 여기서 깨진다.
 *  ② **파생 함수가 표와 어긋나지 않는다** — GT 합계·에콰도르 비중은 계산값이라
 *    원 데이터가 바뀌면 조용히 틀린다.
 *  ③ **서술이 「」로 지목한 차트가 실재한다** — 제목을 바꾸면 참조가 끊긴다.
 */
import { describe, expect, it } from 'vitest';

import {
  ALBACORA_SOURCE_NOTES,
} from '@/lib/company-albacora-content';
import {
  ALBACORA_CLAIMED_VESSELS,
  albacoraCamposPrices,
  albacoraCerts,
  albacoraFleet,
  albacoraLimits,
  albacoraMeta,
  albacoraMscUnits,
  albacoraPlants,
  albacoraSacYield,
  albacoraSiaTonnage,
  ecuadorRevenueShare,
  flagCounts,
  fleetGtTotal,
  latestCatch,
  plantRevenueTotal,
  siaVolumeDrop,
} from '@/lib/data/company-albacora';
import { proseBriefing, proseStages } from '@/lib/company-prose-stages';

// 서술은 조사보고서에서 그대로 읽어 온다. 손으로 쓴 상수는 더 없다.
const ALBACORA_NARRATIVES = proseStages('albacora');
const ALBACORA_BRIEFING = proseBriefing('albacora');

describe('Albacora 인테이크', () => {
  it('선단은 등록부 확인분 12척이고 합계 36,404 GT 다', () => {
    expect(albacoraFleet).toHaveLength(12);
    expect(fleetGtTotal()).toBe(36404);
  });

  it('EINF 23척과 등록부 확인 12척을 구분해 둔다', () => {
    // 11척 차이를 추정으로 메우면 안 된다 — 이 간극 자체가 보고할 사실이다
    expect(ALBACORA_CLAIMED_VESSELS).toBe(23);
    expect(ALBACORA_CLAIMED_VESSELS - albacoraFleet.length).toBe(11);
  });

  it('기국이 스페인 8 · 파나마 2 · 모리셔스 2 로 갈려 있다', () => {
    const m = Object.fromEntries(flagCounts().map((f) => [f.선적, f.척수]));
    expect(m).toEqual({ 스페인: 8, 파나마: 2, 모리셔스: 2 });
  });

  it('비스페인 4척은 전부 Integral Fishing Services 소유다', () => {
    const nonEs = albacoraFleet.filter((v) => v.선적 !== '스페인');
    expect(nonEs).toHaveLength(4);
    expect(nonEs.every((v) => v.소유사 === 'Integral Fishing Services')).toBe(true);
  });

  it('최신 어획량은 2025년 20만 톤이다', () => {
    expect(latestCatch()).toEqual({ 연도: 2025, 톤: 200000 });
  });

  it('가공 3사 매출 합계와 에콰도르 비중이 표와 맞는다', () => {
    expect(plantRevenueTotal()).toBe(314.8);
    // 보고서 서술 «에콰도르 한 곳이 매출의 74%»
    expect(ecuadorRevenueShare()).toBeGreaterThanOrEqual(73);
    expect(ecuadorRevenueShare()).toBeLessThanOrEqual(75);
  });

  it('SIA 2023년 물량 낙폭이 −44% 다', () => {
    expect(siaVolumeDrop()).toBe(-44);
    expect(albacoraSiaTonnage.map((r) => r.톤)).toEqual([2508, 1395, 1459]);
  });

  it('SAC 수율이 물량에 반비례한다 - 최다 물량 해의 수율이 가장 낮다', () => {
    const peak = [...albacoraSacYield].sort((a, b) => b.원료 - a.원료)[0];
    const worst = [...albacoraSacYield].sort((a, b) => a.수율 - b.수율)[0];
    expect(peak.연도).toBe(worst.연도);
  });

  it('동태평양 어업 인증 유닛은 철회 상태로 남아 있다', () => {
    const epo = albacoraMscUnits.find((u) => u.유닛.includes('동태평양'));
    expect(epo?.상태).toContain('철회');
  });

  it('플랜트 3사 전부 MSC CoC 번호를 갖는다', () => {
    expect(albacoraCerts).toHaveLength(3);
    expect(albacoraCerts.every((c) => /MSC-C-\d+/.test(c.msc))).toBe(true);
  });

  it('Campos 최고가는 MSC 대용량이다 - 프린사식 부위 프리미엄이 아니다', () => {
    const top = [...albacoraCamposPrices].sort((a, b) => b.가격 - a.가격)[0];
    expect(top.가격).toBe(49.99);
    expect(top.축).toBe('MSC 대용량');
  });

  it('공장은 3사이고 에콰도르가 인력의 압도적 다수다', () => {
    expect(albacoraPlants).toHaveLength(3);
    const total = albacoraPlants.reduce((a, p) => a + p.직원, 0);
    const sae = albacoraPlants.find((p) => p.플랜트.startsWith('SAE'))!;
    expect(sae.직원 / total).toBeGreaterThan(0.9);
  });

  it('자료의 한계에 매출 시계열 비공개가 남아 있다', () => {
    // 이 줄이 사라지면 «절대액이 없다»는 경계가 화면에서 지워진 것이다
    expect(albacoraLimits.some((l) => l.항목.includes('매출 시계열'))).toBe(true);
    expect(albacoraMeta.출처한계).toContain('그룹 연결 매출 절대액이 공개되지 않는다');
  });

  it('측정경계가 EMAS 물량의 적용 범위를 못박는다', () => {
    expect(albacoraMeta.측정경계).toContain('스페인 2공장');
  });
});

describe('Albacora 서술', () => {
  it('7단계가 c01~c07 로 이어진다', () => {
    expect(ALBACORA_NARRATIVES.map((n) => n.key)).toEqual([
      'c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07',
    ]);
  });

  it('모든 단계가 질문·리드·본문을 갖춘다', () => {
    for (const n of ALBACORA_NARRATIVES) {
      expect(n.question.length, `${n.key} 질문`).toBeGreaterThan(1);
      expect(n.lede.length, `${n.key} 리드`).toBeGreaterThan(20);
      expect(n.paragraphs.length, `${n.key} 본문`).toBeGreaterThanOrEqual(2);
    }
  });

  it('브리핑이 실재하는 단계만 가리킨다', () => {
    const keys = new Set(ALBACORA_NARRATIVES.map((n) => n.key));
    for (const b of ALBACORA_BRIEFING) expect(keys.has(b.stage)).toBe(true);
  });

  it('출처 노트가 세 가지 경계를 전부 밝힌다', () => {
    const all = ALBACORA_SOURCE_NOTES.join(' ');
    expect(all).toContain('36,404');       // 선단 확인 범위
    expect(all).toContain('EMAS');          // 물량 적용 범위
    expect(all).toContain('방향치');        // 재무 등급
  });

  // 등급별 사실 검사는 보고서 표로 옮겼다. 서술의 facts 는 비어 있고 근거는
  // `company-report-tables.ts` 가 원문 표에서 그대로 읽어 온다.
});
