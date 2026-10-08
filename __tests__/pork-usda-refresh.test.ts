import { describe, expect, it } from 'vitest';

// 화면이 읽는 정본은 data/ 다 (lib/data/usda-widgets.ts 가 이것을 import 한다).
// public/data/ 에 같은 이름의 사본이 있어 2026-09-04 에 그쪽만 고쳤다가 화면이 안 바뀌었다.
import pork from '../data/pork_usda_widgets.json';
import porkMirror from '../public/data/pork_usda_widgets.json';

/* 원자료: USDA FAS ESR commodityCode 1702 (Pork muscle cuts), MY2024~2026.
 * scripts/sync_pork_usda.py 로 받는다.
 *
 * 이 파일의 위젯은 출처가 두 갈래다 — ESR API(주간 갱신)와 GAIN 보고서 PDF(일회성).
 * 그래서 syncDate 가 섞여 있는 것이 정상이고, 여기서 지키려는 것은
 *   ① ESR 쪽이 실제로 최근 주차를 물고 있는지
 *   ② GAIN 쪽이 갱신된 척하지 않는지 (L-09 정직 표기)
 * 두 가지다. */

type Widget = {
  id: string; syncDate: string; telemetry: string; source: string;
  data: Record<string, unknown>[];
};
const widgets = pork.widgets as unknown as Widget[];
const byId = (id: string) => widgets.find((w) => w.id === id)!;

const ESR = ['w_us_korea_pork_timeline', 'w_us_pork_top_importers'];
const GAIN = ['w_china_pork_dominance', 'w_spain_pork_eu_leader', 'w_asf_global_spread'];

describe('돼지고기 USDA 위젯', () => {
  it('data/ 와 public/data/ 사본이 갈라지지 않는다', () => {
    // 갈라지면 어느 쪽이 화면인지 다시 헷갈리고, 안 읽히는 쪽만 갱신하는 사고가 반복된다
    expect(porkMirror).toEqual(pork);
  });

  it('ESR 위젯은 SYNCED 이고 GAIN 위젯은 STATIC 인 채로 남는다', () => {
    for (const id of ESR) {
      expect(byId(id).telemetry).toBe('SYNCED');
      expect(byId(id).source).toContain('ESR');
    }
    for (const id of GAIN) {
      expect(byId(id).telemetry).toBe('STATIC');
      // GAIN 은 API 가 없다 - ESR 갱신일을 따라가면 갱신된 척이 된다
      expect(byId(id).syncDate).not.toBe(byId(ESR[0]).syncDate);
    }
  });

  it('ESR 갱신 주차가 2026-08 이후이고 두 위젯이 같은 주차를 본다', () => {
    const week = byId(ESR[0]).syncDate;
    expect(week >= '2026-08-01').toBe(true);
    expect(byId(ESR[1]).syncDate).toBe(week);
    expect((pork as { _meta: { esrRefreshed?: string } })._meta.esrRefreshed).toBe(week);
  });

  it('월별 타임라인이 오름차순이고 값이 모두 양수다', () => {
    const rows = byId('w_us_korea_pork_timeline').data as { month: string; weeklyExports: number }[];
    expect(rows.length).toBeGreaterThanOrEqual(6);
    expect([...rows].sort((a, b) => a.month.localeCompare(b.month))).toEqual(rows);
    for (const r of rows) {
      expect(/^\d{4}-\d{2}$/.test(r.month)).toBe(true);
      expect(r.weeklyExports).toBeGreaterThan(0);
    }
  });

  it('설명문이 차트 수치와 같은 이야기를 한다', () => {
    // 데이터만 갈고 문장을 두면 화면이 서로 다른 말을 한다 — 2026-09-04 에 실제로
    // 「2025-06~2026-05 · 582K톤」 문장이 2026-01~08 차트 위에 남아 있었다.
    const tl = byId('w_us_korea_pork_timeline');
    const rows = tl.data as { month: string; weeklyExports: number }[];
    const span = `${rows[0].month}~${rows[rows.length - 1].month}`;
    expect((tl as unknown as { cardDesc: string }).cardDesc).toContain(span);
    const peak = rows.reduce((a, b) => (b.weeklyExports > a.weeklyExports ? b : a));
    expect((tl as unknown as { sit: string }).sit).toContain(peak.month);

    const ti = byId('w_us_pork_top_importers');
    const imp = ti.data as { country: string; exports_kt: number }[];
    // 1위 국가와 그 수치가 문장에 그대로 있어야 한다
    expect((ti as unknown as { cardDesc: string }).cardDesc).toContain(imp[0].country);
    const korea = imp.find((r) => r.country === '한국')!;
    expect((tl as unknown as { cardDesc: string }).cardDesc)
      .toContain(`세계 ${imp.indexOf(korea) + 1}위`);
  });

  it('수입국 표가 내림차순이고 국가명이 코드로 새지 않는다', () => {
    const rows = byId('w_us_pork_top_importers').data as { country: string; exports_kt: number }[];
    expect(rows).toHaveLength(8);
    expect([...rows].sort((a, b) => b.exports_kt - a.exports_kt)).toEqual(rows);
    // 매핑이 빠지면 «코드 2470» 같은 라벨이 화면에 나간다 (L-01)
    for (const r of rows) {
      expect(r.country).not.toMatch(/^코드 /);
      expect(r.country).not.toMatch(/^[A-Z ]+$/);
      expect(r.exports_kt).toBeGreaterThan(0);
    }
    expect(rows.map((r) => r.country)).toContain('한국');
    expect(rows[0].country).toBe('멕시코');
  });
});
