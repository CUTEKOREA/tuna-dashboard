import { describe, expect, it } from 'vitest';
import {
  CHART_RANK, CHART_ROLE, CHART_SHARE, colorForAtunaHub, colorForHold, HOLD_ID, HUB_ID, NEWS_CATEGORY_ID,
  PANOFI_ID, RFMO_ID, SERIES, shareColor, THAI_PORT_ID, TRADER_ID, VDS_ID,
} from '@/lib/chart-palette';

// 2026-09-11 팔레트 일원화: 데이터 색은 SERIES 8색 한 벌이고, 정체성 집마다 제 표시 순서로 SERIES 를 쓴다.
// 순서는 validate_palette.js 인접 검사로 고른 것이라 값을 바꾸면 검증기를 다시 돌리고 이 테스트를 고친다.
describe('chart-palette (공통 8색)', () => {
  it('SERIES 는 서로 다른 8색이다', () => {
    expect(SERIES).toHaveLength(8);
    expect(new Set(SERIES).size).toBe(8);
    expect(SERIES[0]).toBe('#3987e5');
  });

  it('정체성 집은 SERIES 안의 색만 쓰고 집 안에서 겹치지 않는다', () => {
    const maps = { RFMO_ID, HUB_ID, PANOFI_ID, TRADER_ID, THAI_PORT_ID, VDS_ID };
    for (const [name, map] of Object.entries(maps)) {
      const values = Object.values(map);
      expect(new Set(values).size, name).toBe(values.length);
      for (const color of values) expect(SERIES, `${name} ${color}`).toContain(color);
    }
    const chips = Object.entries(NEWS_CATEGORY_ID).filter(([key]) => key !== '뉴스').map(([, c]) => c);
    expect(new Set(chips).size).toBe(chips.length);
    expect(NEWS_CATEGORY_ID.뉴스).toBe('#8d93a5');
  });

  it('같은 항구는 가다랑어·황다랑어에서 같은 색이다', () => {
    expect(colorForAtunaHub('skj_abj')).toBe(HUB_ID.abj);
    expect(colorForAtunaHub('yf_abj')).toBe(HUB_ID.abj);
    expect(colorForAtunaHub('skj_bkk')).toBe(HUB_ID.bkk);
  });

  it('구성(파이·트리맵)도 SERIES 순서를 쓴다 — 옛 파스텔은 모든 검사에서 탈락했다', () => {
    expect(CHART_SHARE).toEqual(SERIES);
    expect(shareColor(0)).toBe(SERIES[0]);
    expect(shareColor(8)).toBe(SERIES[0]);
    expect(CHART_SHARE).not.toContain('#f4b4c4');
  });

  it('홀 선은 SERIES 8칸 뒤에 네 칸을 더 둔다', () => {
    expect(HOLD_ID.slice(0, 8)).toEqual([...SERIES]);
    expect(colorForHold(HOLD_ID.length)).toBe(HOLD_ID[0]);
    expect(new Set(HOLD_ID).size).toBe(HOLD_ID.length);
  });

  it('역할 세 칸은 SERIES 앞 세 칸(모든 쌍 검사 통과)이고 순위색은 한 색이다', () => {
    expect([CHART_ROLE.volume, CHART_ROLE.highlight, CHART_ROLE.second]).toEqual(SERIES.slice(0, 3));
    expect(CHART_RANK).toBe(HUB_ID.vig);
    expect(SERIES).toContain(CHART_RANK);
    expect(THAI_PORT_ID.songkhla).not.toBe(THAI_PORT_ID.bangkok);
  });
});
