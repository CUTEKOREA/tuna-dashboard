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
});
