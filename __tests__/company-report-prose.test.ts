/**
 * 보고서 서술 자동 추출.
 *
 * 손으로 쓰던 `company-*-content.ts` 는 보고서 본문의 18%만 담았다. 이 경로는 원문을
 * 그대로 읽으므로 옮겨 적기 오류가 없는 대신, **추출이 조용히 비는 것**이 새 실패 모드다.
 * 절이 사라지거나 단계 매핑이 끊기면 화면에서 통째로 없어지므로 여기서 잡는다.
 */
import { describe, expect, it } from 'vitest';

import { FRABELLE_STAGES } from '@/lib/company-frabelle-content';
import { proseStages } from '@/lib/company-prose-stages';
import {
  proseForStage,
  proseStagesUsed,
  REPORT_PROSE_COMPANIES,
  reportProse,
} from '@/lib/data/company-report-prose';

describe('Frabelle 보고서 서술 추출', () => {
  const secs = reportProse('frabelle');

  it('보고서 절이 하나도 빠지지 않고 번호가 이어진다', () => {
    // ⚠ 절 수를 리터럴로 적지 마라. 9 로 박아 뒀더니 법원기록 절이 늘었을 때
    // 「추출이 깨졌다」가 아니라 「테스트가 낡았다」로 이틀을 썼다.
    // 하한만 두고, 번호는 1부터 연속인지로 본다.
    expect(secs.length).toBeGreaterThanOrEqual(9);
    expect(secs.map((s) => s.numeral)).toEqual(
      secs.map((_, i) => String(i + 1).padStart(2, '0')),
    );
  });

  it('모든 절이 단계에 붙는다 — 하나라도 빠지면 화면에서 사라진다', () => {
    expect(proseStagesUsed('frabelle').length).toBeGreaterThanOrEqual(9);
    for (const s of secs) {
      expect(proseForStage('frabelle', s.stage).length, `${s.stage} 매핑`).toBeGreaterThan(0);
    }
  });

  it('절마다 리드와 본문 블록이 있다', () => {
    for (const s of secs) {
      expect(s.blocks.length, `${s.numeral} 블록`).toBeGreaterThanOrEqual(5);
      expect(s.blocks.some((b) => b.kind === 'lead'), `${s.numeral} 리드`).toBe(true);
      expect(s.subtitle.length, `${s.numeral} 부제`).toBeGreaterThan(0);
    }
  });

  it('단계 변환이 보고서 문장을 그대로 옮긴다', () => {
    expect(FRABELLE_STAGES).toHaveLength(secs.length);
    for (const st of FRABELLE_STAGES) {
      expect(st.lede.length).toBeGreaterThan(0);
      expect(st.paragraphs.length).toBeGreaterThan(0);
    }
  });

  it('반증에서 기각한 주장이 화면에 없다', () => {
    const all = secs
      .flatMap((s) => s.blocks.map((b) => `${b.title ?? ''} ${b.text}`))
      .join(' ');
    for (const banned of ['세계 top 3', '인도양·대서양 조업', 'General Santos 캐너리를 보유']) {
      expect(all, banned).not.toContain(banned);
    }
    // Majestic 폐쇄 인력은 1,300명이다. 5,000명은 2013년 계획치가 전이된 값이라 쓰지 않는다.
    expect(all).not.toContain('5,000명 실직');
  });
});

describe('아홉 편 공통', () => {
  it('단계 번호가 화면 순서와 어긋나지 않는다', () => {
    // 한 단계에 절이 여럿 합쳐지면 절 번호와 화면 순서가 갈린다.
    // Thai Union 은 05 자리에 08절이 온다 — 번호는 순번이어야 한다.
    for (const c of REPORT_PROSE_COMPANIES) {
      const nums = proseStages(c).map((s) => s.numeral);
      expect(nums, `${c} 단계 번호`).toEqual(
        nums.map((_, i) => String(i + 1).padStart(2, '0')),
      );
    }
  });

  it('아홉 편 모두 서술이 있다', () => {
    expect(REPORT_PROSE_COMPANIES).toHaveLength(9);
    for (const c of REPORT_PROSE_COMPANIES) {
      const stages = proseStages(c);
      expect(stages.length, `${c} 단계 수`).toBeGreaterThanOrEqual(6);
      for (const st of stages) {
        expect(st.lede.length, `${c} ${st.key} 리드`).toBeGreaterThan(0);
        expect(st.paragraphs.length, `${c} ${st.key} 본문`).toBeGreaterThan(0);
      }
    }
  });
});
