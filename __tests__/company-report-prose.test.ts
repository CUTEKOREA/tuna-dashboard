/**
 * 보고서 서술 자동 추출.
 *
 * 손으로 쓰던 `company-*-content.ts` 는 보고서 본문의 18%만 담았다. 이 경로는 원문을
 * 그대로 읽으므로 옮겨 적기 오류가 없는 대신, **추출이 조용히 비는 것**이 새 실패 모드다.
 * 절이 사라지거나 단계 매핑이 끊기면 화면에서 통째로 없어지므로 여기서 잡는다.
 */
import { describe, expect, it } from 'vitest';

import { FRABELLE_STAGES } from '@/lib/company-frabelle-content';
import {
  proseForStage,
  proseStagesUsed,
  reportProse,
} from '@/lib/data/company-report-prose';

describe('Frabelle 보고서 서술 추출', () => {
  const secs = reportProse('frabelle');

  it('보고서 9절이 모두 들어온다', () => {
    expect(secs).toHaveLength(9);
    expect(secs.map((s) => s.numeral)).toEqual(
      ['01', '02', '03', '04', '05', '06', '07', '08', '09'],
    );
  });

  it('모든 절이 단계에 붙는다 — 하나라도 빠지면 화면에서 사라진다', () => {
    expect(proseStagesUsed('frabelle')).toHaveLength(9);
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
    expect(FRABELLE_STAGES).toHaveLength(9);
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
