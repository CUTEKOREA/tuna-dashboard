/**
 * 조사보고서 표 인테이크 회귀 검사.
 *
 * 이 인테이크는 손으로 옮기지 않는다 — 값이 원문에서 그대로 온다. 그래서 여기서
 * 지키는 것은 값이 맞는지가 아니라 **표가 표로 남아 있는가**다. 직사각형이 깨지거나,
 * 어느 단계에도 안 붙거나, 빈 표가 화면에 나가면 그때부터 화면이 거짓말을 시작한다.
 */
import { describe, expect, it } from 'vitest';

import {
  REPORT_TABLE_COMPANIES,
  cellCount,
  reportTables,
  stagesUsed,
  tablesForStage,
} from '@/lib/data/company-report-tables';

/** 개별 검사가 이름을 대는 자리에만 쓴다. **편 목록의 정본은 로더다** — 아래를 보라. */
const 회사 = ['frinsa', 'thaiunion', 'albacora', 'fcf', 'itochu', 'bolton', 'jais', 'frabelle', 'jealsa'];

describe('인테이크 구성', () => {
  it('앞 편이 하나도 빠지지 않았다', () => {
    // ⚠ 편 목록을 리터럴로 적지 마라. 여기에 아홉 편을 박아 뒀더니 Nauterra(Ⅹ)가
    // 로더에서 통째로 빠졌는데도 초록으로 지나갔다. 하한과 포함관계만 본다.
    // 디스크의 JSON 과 로더의 대조는 `company-report-intake-complete` 가 맡는다.
    for (const c of 회사) expect(REPORT_TABLE_COMPANIES, c).toContain(c);
    expect(REPORT_TABLE_COMPANIES.length).toBeGreaterThanOrEqual(회사.length);
  });

  it('빈 회사가 없다', () => {
    for (const c of REPORT_TABLE_COMPANIES) expect(reportTables(c).length, c).toBeGreaterThan(0);
  });

  it('표 180개·칸 3,500개를 밑돌지 않는다', () => {
    // 커버리지가 조용히 줄어드는 것을 막는 하한선이다. 현재 아홉 편 합산 표 182개 · 칸 3,526개.
    const 표 = 회사.reduce((a, c) => a + reportTables(c).length, 0);
    const 칸 = 회사.reduce((a, c) => a + cellCount(c), 0);
    expect(표).toBeGreaterThanOrEqual(180);
    expect(칸).toBeGreaterThanOrEqual(3500);
  });
});

describe('표가 표로 남아 있는가', () => {
  it.each(회사)('%s - 모든 행의 열 수가 헤더와 같다', (c) => {
    for (const t of reportTables(c)) {
      for (const r of t.rows) {
        expect(r.length, `${t.sid} ${t.title}`).toBe(t.head.length);
      }
    }
  });

  it.each(회사)('%s - num 표시가 열 수와 맞는다', (c) => {
    for (const t of reportTables(c)) {
      expect(t.num.length, `${t.sid} ${t.title}`).toBe(t.head.length);
    }
  });

  it.each(회사)('%s - 빈 표가 없다', (c) => {
    // 보고서에는 1열짜리 체크리스트 표도 있다(한-EU FTA 「그 선박」 3요건).
    // 열이 하나여도 표는 표다 — 막을 것은 빈 표이지 좁은 표가 아니다.
    for (const t of reportTables(c)) {
      expect(t.rows.length, `${t.sid} ${t.title}`).toBeGreaterThan(0);
      expect(t.head.length, `${t.sid} ${t.title}`).toBeGreaterThan(0);
    }
  });

  it.each(회사)('%s - 제목이 비지 않는다', (c) => {
    for (const t of reportTables(c)) {
      expect(t.title.trim(), `${t.sid}`).not.toBe('');
    }
  });
});

describe('단계 배치', () => {
  it.each(회사)('%s - 모든 표가 c0N 단계에 붙는다', (c) => {
    for (const t of reportTables(c)) {
      expect(t.stage, `${t.sid} ${t.title}`).toMatch(/^c(0[1-9]|1[0-9])$/);
    }
  });

  it.each(회사)('%s - 한 단계에 몰리지 않는다', (c) => {
    // 절→단계 배치가 무너지면 표가 한 단계에 쌓이고 화면이 자료집이 된다.
    // 다만 JAIS 처럼 표 대부분이 손 슬롯으로 이미 나간 회사는 남는 표가 한둘뿐이라
    // 분산을 물을 수 없다. 표가 여섯 개를 넘을 때만 잰다.
    const n = reportTables(c).length;
    const stages = stagesUsed(c);
    if (n <= 6) {
      expect(stages.length, `${c}`).toBeGreaterThanOrEqual(1);
      return;
    }
    expect(stages.length, `${c} 표 ${n}개가 단계 ${stages.join(',')} 에만 있다`)
      .toBeGreaterThanOrEqual(3);
  });

  it('단계별 조회가 인테이크와 맞는다', () => {
    for (const c of 회사) {
      const 합 = stagesUsed(c).reduce((a, s) => a + tablesForStage(c, s).length, 0);
      expect(합, c).toBe(reportTables(c).length);
    }
  });

  it('모르는 회사·단계는 빈 배열이다', () => {
    expect(reportTables('없는회사')).toEqual([]);
    expect(tablesForStage('bolton', 'c99')).toEqual([]);
  });
});

describe('원문 표시 보존', () => {
  it('숫자 열을 표시한 표가 실제로 있다', () => {
    // 원문의 우측정렬 표시를 잃으면 숫자가 자릿수로 안 맞는다.
    const 있음 = 회사.some((c) => reportTables(c).some((t) => t.num.some(Boolean)));
    expect(있음).toBe(true);
  });

  it('절 표시가 붙어 있다 - 어느 절에서 왔는지가 출처다', () => {
    for (const c of 회사) {
      for (const t of reportTables(c)) {
        expect(t.sid, `${c} ${t.title}`).toMatch(/^s[0-9a-z]+$/);
        expect(t.section.trim(), `${c} ${t.title}`).not.toBe('');
      }
    }
  });

  it('등급 칩이 셀 안에 글자로 남지 않았다', () => {
    // 「…미검증이다 B .」처럼 배지가 종결어미와 마침표 사이에 끼면 문장이 깨진다.
    for (const c of 회사) {
      for (const t of reportTables(c)) {
        for (const r of t.rows) {
          for (const cell of r) {
            expect(cell, `${c} ${t.sid} ${t.title}`).not.toMatch(/\s[ABC]\s*\.$/);
          }
        }
      }
    }
  });
});
