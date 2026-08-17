/**
 * 기존 골뱅이 대시보드가 쓰는 계열이 **원본과 어긋나지 않는지** 지키는 가드.
 *
 * 이 파일이 있는 이유가 있다. 「시장 이해 > 골뱅이」를 만들며 같은 원본을 다시 집계했더니
 * 이 대시보드의 계열에서 조작이 다섯 건 나왔다.
 *
 *   1. 한국에 근거 없는 종명(B. opisoplectum)이 붙어 있었다 — 한국은 종을 보고하지 않는다
 *   2. 과(科)가 다른 종을 합산한 값으로 「한국 세계 5위」를 만들었다 — 원본이 금지한 합산이다
 *   3. 2024년 한국 어획이 8,750톤으로 적혀 있었다 — 원본은 9,670톤
 *   4. 캐나다 시계열이 **두 개 과를 한 선으로 이어** 「-74% 붕괴」를 그렸다 —
 *      2008·2013은 미국고둥류, 2016년부터가 참골뱅이다. 코드가 바뀐 것이지 자원이 무너진 게 아니다
 *   5. 흑해 세 나라가 실제의 절반~8분의 1로 적혀 있었고, 우크라이나가 아예 빠져 있었다
 *
 * 정정은 `scripts/fix_whelk_legacy_series.py` 가 재현한다. 이 테스트는 그 결과를 고정한다.
 */
import { describe, expect, it } from 'vitest';

import legacy from '../public/data/whelk_real_data_v1.json';
import { getWhelkIndustryData } from '../lib/data/commodity-industry';

const data = legacy as unknown as {
  globalCaptureData: { name: string; value: number; label?: string }[];
  koreaGlobalShareData: { name: string; value: number }[];
  koreaCaptureData: { year: string; capture: number }[];
  canadaCaptureData: { year: string; canada: number; uk: number }[];
  blackSeaSupplyData: Record<string, string | number>[];
  climateRiskData: Record<string, string | number | null>[];
  mcrsScenarioData: Record<string, string | number>[];
  seasonalityData: { month: string; importUSD: number; volume: number }[];
  importSurgeData: { month: string; volume: number; value: number }[];
  _정정?: { 내용: string[]; 범위밖: string };
};

describe('골뱅이 기존 대시보드 — 정정된 계열', () => {
  it('정정 기록이 남아 있다', () => {
    expect(data._정정).toBeDefined();
    expect(data._정정!.내용.length).toBeGreaterThanOrEqual(5);
    // 손대지 않은 계열이 무엇인지도 밝혀야 한다
    expect(data._정정!.범위밖).toContain('대조하지 않았다');
  });

  it('한국에 종명을 붙이지 않는다', () => {
    // 한국은 국제 통계에 종을 보고한 적이 없다. 어떤 종명도 붙일 근거가 없다
    const blob = JSON.stringify(data.globalCaptureData);
    expect(blob).not.toMatch(/opisoplectum/i);
    const korea = data.globalCaptureData.find((r) => r.name === '대한민국' || r.name === '한국');
    expect(korea, '한국은 참골뱅이 어획이 0이라 이 순위에 없어야 한다').toBeUndefined();
  });

  it('세계 순위가 검증본의 참골뱅이 집계와 일치한다', () => {
    const verified = getWhelkIndustryData().참골뱅이상위국;
    expect(data.globalCaptureData.length).toBeGreaterThanOrEqual(5);
    for (const row of data.globalCaptureData) {
      const hit = verified.find((v) => v.국가 === row.name);
      expect(hit, `${row.name} 이 검증본에 없다`).toBeDefined();
      expect(row.value).toBe(hit!.어획량);
    }
    // 두 계열이 서로 어긋나면 같은 화면에 다른 숫자가 뜬다
    expect(data.koreaGlobalShareData.map((r) => r.value)).toEqual(
      data.globalCaptureData.map((r) => r.value),
    );
  });

  it('한국 생산 시계열이 국가통계포털 값과 일치하고 추정치가 섞이지 않았다', () => {
    const verified = Object.fromEntries(
      getWhelkIndustryData().한국생산.계열['고둥류'].map((r) => [r.연도, r.생산량]),
    );
    for (const row of data.koreaCaptureData) {
      expect(row.year, '추정치가 실측 계열에 섞였다').not.toMatch(/E|추정|\(/);
      expect(verified[row.year], `${row.year} 이 검증본에 없다`).toBeDefined();
      expect(row.capture).toBe(verified[row.year]);
    }
  });

  it('캐나다 계열이 한 과(科) 안에서만 이어진다', () => {
    // 2016년 이전 캐나다는 미국고둥류로 보고했다. 이으면 「붕괴」가 조작된다
    const years = data.canadaCaptureData.map((r) => Number(r.year));
    expect(Math.min(...years), '2016년 이전은 다른 과라 이을 수 없다').toBeGreaterThanOrEqual(2016);
    // 되올라온 최신값이 살아 있어야 한다 — 붕괴 서사로 되돌아가는 것을 막는다
    const latest = data.canadaCaptureData[data.canadaCaptureData.length - 1];
    expect(latest.year).toBe('2024');
    expect(latest.canada).toBe(5410);
    expect(latest.uk).toBe(16511);
  });

  it('흑해 계열에 우크라이나가 있고 2022년부터 0이다', () => {
    const rows = data.blackSeaSupplyData;
    expect(rows.length).toBeGreaterThanOrEqual(7);
    for (const row of rows) {
      expect(row).toHaveProperty('ukraine');
      expect(row).toHaveProperty('russia');
    }
    const y2019 = rows.find((r) => r.year === '2019');
    const y2022 = rows.find((r) => r.year === '2022');
    expect(Number(y2019!.ukraine)).toBeGreaterThan(10000);
    expect(Number(y2022!.ukraine), '2022년부터 보고가 0이다').toBe(0);
    // 튀르키예를 절반으로 적던 값으로 되돌아가지 않는지
    expect(Number(y2019!.turkey)).toBe(11646);
  });

  it('기후 계열에 합성 수온과 전망치가 없다', () => {
    const rows = data.climateRiskData;
    for (const row of rows) {
      // 0.6도씩 균등하게 오르던 수온 계열은 실측이 아니었다
      expect(row).not.toHaveProperty('sst');
      // 「2025E」 같은 전망 연도를 실측 계열에 섞지 않는다
      expect(String(row.year)).toMatch(/^\d{4}$/);
    }
    // 캐나다는 과(科)를 나눠 담아야 한다 — 한 키로 합치면 다시 이어 그리게 된다
    expect(rows[0]).toHaveProperty('canadaBusycon');
    expect(rows[0]).toHaveProperty('canadaBuccinum');
    expect(rows[0]).not.toHaveProperty('canadaCatch');
  });

  it('기후 계열의 영국 값이 실측이고 평평하지 않다', () => {
    const uk = data.climateRiskData.map((r) => Number(r.ukCatch));
    // 이전 판은 12,800~14,100 으로 평평했다. 실측은 2배 가까이 벌어진다
    expect(Math.max(...uk) / Math.min(...uk)).toBeGreaterThan(1.5);
    expect(uk[uk.length - 1]).toBe(16511);
  });

  it('월별 계절성이 관세청 실측이고 종형 곡선이 아니다', () => {
    // 조작본은 8월 한 점만 실측이고 나머지가 매끄러운 종형이었다. 실측의 지문은
    // 11월 골짜기($0.53M·40톤)다 — 종형으로 되돌리면 이 값이 사라져 여기서 잡힌다.
    const nov = data.seasonalityData.find((r) => r.month === '11월')!;
    expect(nov.importUSD).toBeCloseTo(0.53, 2);
    expect(nov.volume).toBe(40);
    const aug = data.seasonalityData.find((r) => r.month === '8월')!;
    expect(aug.importUSD).toBeCloseTo(5.7, 2);
    expect(aug.volume).toBe(435);
    // 5~8월 물량이 연간의 절반을 넘는다는 위젯 진단은 실측으로도 참이어야 한다
    const total = data.seasonalityData.reduce((acc, r) => acc + r.volume, 0);
    const summer = data.seasonalityData
      .filter((r) => ['5월', '6월', '7월', '8월'].includes(r.month))
      .reduce((acc, r) => acc + r.volume, 0);
    expect(summer / total).toBeGreaterThan(0.5);
  });

  it('수입 급증 계열의 2025년 2월이 과장 전 실측값이다', () => {
    // 조작본은 $2.85M·170톤으로 적어 「역대 최고치 경신」의 근거를 만들었다.
    // 실측은 $1.86M·146톤 — 급증은 사실이지만 크기가 부풀려져 있었다.
    const feb = data.importSurgeData.find((r) => r.month === '25.02')!;
    expect(feb.value).toBeCloseTo(1.86, 2);
    expect(feb.volume).toBe(146);
    const feb24 = data.importSurgeData.find((r) => r.month === '24.02')!;
    expect(feb.volume / feb24.volume).toBeGreaterThan(1.5);
  });

  it('최소보존규격 시나리오의 기준선이 실측이다', () => {
    const base2024 = data.mcrsScenarioData.find((r) => r.year === '2024');
    expect(Number(base2024!.baseline), '2024년 기준선은 실측 영국 어획이어야 한다').toBe(16511);
  });
});
