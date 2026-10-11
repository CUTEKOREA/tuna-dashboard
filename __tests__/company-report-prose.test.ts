/**
 * 보고서 서술 자동 추출.
 *
 * 손으로 쓰던 `company-*-content.ts` 는 보고서 본문의 18%만 담았다. 이 경로는 원문을
 * 그대로 읽으므로 옮겨 적기 오류가 없는 대신, **추출이 조용히 비는 것**이 새 실패 모드다.
 * 절이 사라지거나 단계 매핑이 끊기면 화면에서 통째로 없어지므로 여기서 잡는다.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  POLLOCK_REPORT_BRIEFING,
  POLLOCK_REPORT_NARRATIVES,
} from '@/components/market-understanding/PollockIndustryDashboard';
import {
  OCTOPUS_HANDWRITTEN_STAGES,
  OCTOPUS_REPORT_BRIEFING,
  OCTOPUS_REPORT_NARRATIVES,
} from '@/components/market-understanding/OctopusIndustryDashboard';
import {
  SHRIMP_HANDWRITTEN_STAGES,
  SHRIMP_REPORT_BRIEFING,
  SHRIMP_REPORT_NARRATIVES,
} from '@/components/market-understanding/ShrimpIndustryDashboard';
import {
  SQUID_HANDWRITTEN_STAGES,
  SQUID_REPORT_BRIEFING,
  SQUID_REPORT_NARRATIVES,
} from '@/components/market-understanding/SquidIndustryDashboard';
import {
  TUNA_ANATOMY_HANDWRITTEN_STAGES,
  TUNA_ANATOMY_REPORT_BRIEFING,
  TUNA_ANATOMY_REPORT_NARRATIVES,
} from '@/components/market-understanding/TunaAnatomyDashboard';
import { FRABELLE_STAGES } from '@/lib/company-frabelle-content';
import { proseStages } from '@/lib/company-prose-stages';
import { tablesForStage } from '@/lib/data/company-report-tables';
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

function sourceText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    // 거듭제곱(10<sup>8</sup>)은 추출기가 위 첨자(10⁸)로 남긴다. 각주 표시와 달리 값이다.
    .replace(/(\d)<sup[^>]*>(\d+)<\/sup>/g, (_, base: string, exp: string) =>
      base + [...exp].map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join(''))
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal: string) => String.fromCodePoint(Number(decimal)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&minus;/g, '−')
    .replace(/&times;/g, '×')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

const normalize = (text: string) => text.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

describe('명태 최종 해부보고서 서술 추출', () => {
  const secs = reportProse('pollock');

  it('본문 17절이 아홉 단계에 전부 붙고 부록은 제외된다', () => {
    expect(secs).toHaveLength(17);
    expect(secs.map((section) => section.sid)).toEqual(
      Array.from({ length: 17 }, (_, index) => `s${String(index + 1).padStart(2, '0')}`),
    );
    expect(proseStagesUsed('pollock')).toEqual([
      's01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 'x01',
    ]);
    expect(secs.some((section) => ['sA', 'sB', 'sC'].includes(section.sid))).toBe(false);
  });

  it('화면 서술·머리글·브리핑·표 전부가 원문 HTML 텍스트에 그대로 있다', () => {
    const html = readFileSync(
      join(process.cwd(), 'docs/evidence/industry-pollock-2026-10/보고서.html'),
      'utf8',
    );
    const original = sourceText(html);
    const flow = POLLOCK_REPORT_NARRATIVES.flatMap((stage) => stage.flow ?? []);
    const visible: [string, string][] = [
      ...POLLOCK_REPORT_NARRATIVES.map((stage): [string, string] => ['리드', stage.lede]),
      ...flow.flatMap((item): [string, string][] => {
        if (item.kind === 'text') return [['본문', item.text]];
        // 절 머리는 「절 이름: 부제」로 합쳐 만든다. 원문에선 두 요소라 나눠 대조한다.
        // 「: 」 머리를 걷은 뒤의 문자열이다.
        if (item.kind === 'head') return item.text.split(': ').map((part): [string, string] => ['머리글', part]);
        return [];
      }),
      ...POLLOCK_REPORT_BRIEFING.flatMap((point): [string, string][] => [
        ['브리핑 제목', point.headline ?? ''],
        ['브리핑', point.text],
      ]),
    ];
    const tables = POLLOCK_REPORT_NARRATIVES.flatMap((stage) => tablesForStage('pollock', stage.key));
    for (const table of tables) {
      // 원문 표 앞에 소제목이 없으면 제목은 헤더 서명(앞 세 열)이다. 헤더는 아래서 따로 대조한다.
      if (table.title !== table.head.slice(0, 3).join(' · ')) visible.push(['표 제목', table.title]);
      visible.push(['표 설명', table.note ?? ''], ['표 캡션', table.caption ?? '']);
      // 숫자 열 우측정렬은 스타일일 뿐이라 셀 문자열은 원문 그대로다.
      for (const cell of [...table.head, ...table.rows.flat()]) visible.push(['표 셀', cell]);
    }

    expect(tables.length).toBeGreaterThan(30);
    expect(visible.filter(([kind]) => kind === '머리글').length).toBeGreaterThan(20);
    const missing = visible
      .filter(([, text]) => normalize(text) !== '' && !original.includes(normalize(text)))
      .map(([kind, text]) => `${kind}: ${normalize(text).slice(0, 80)}`);
    expect(missing, '원문에 없는 화면 문자열').toEqual([]);
  });

  it('절 번호 없는 절의 머리가 「: 」로 시작하지 않는다', () => {
    for (const stage of POLLOCK_REPORT_NARRATIVES) {
      for (const item of stage.flow ?? []) {
        if (item.kind === 'head') expect(item.text, stage.key).not.toMatch(/^:/);
      }
    }
  });

  it('손으로 쓴 사실표·용어표는 화면 서술에서 빠진다', () => {
    for (const stage of POLLOCK_REPORT_NARRATIVES) {
      expect(stage.facts).toEqual([]);
      expect(stage.terms).toEqual([]);
    }
  });
});

describe('문어 최종 해부보고서 서술 추출', () => {
  const secs = reportProse('octopus');
  const fromReport = OCTOPUS_REPORT_NARRATIVES.filter((stage) => !OCTOPUS_HANDWRITTEN_STAGES.has(stage.key));

  it('본문 11절이 아홉 단계에 전부 붙고 부록은 제외된다', () => {
    expect(secs).toHaveLength(11);
    expect(secs.map((section) => section.sid)).toEqual(
      Array.from({ length: 11 }, (_, index) => `s${String(index + 1).padStart(2, '0')}`),
    );
    expect(proseStagesUsed('octopus')).toEqual([
      's01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 'x01',
    ]);
    expect(secs.some((section) => section.sid === 'sA')).toBe(false);
    // 요약 절은 첫 단계 맨 앞이다
    expect(proseForStage('octopus', 's01')[0].sid).toBe('s01');
  });

  it('원문에 대응 절이 없는 단계는 s09(내부 검토) 하나다', () => {
    expect([...OCTOPUS_HANDWRITTEN_STAGES]).toEqual(['s09']);
    expect(fromReport).toHaveLength(9);
  });

  it('화면 서술·머리글·브리핑·표 전부가 원문 HTML 텍스트에 그대로 있다', () => {
    const html = readFileSync(
      join(process.cwd(), 'docs/evidence/industry-octopus-2026-10/보고서.html'),
      'utf8',
    );
    const original = sourceText(html);
    const flow = fromReport.flatMap((stage) => stage.flow ?? []);
    const visible: [string, string][] = [
      ...fromReport.map((stage): [string, string] => ['리드', stage.lede]),
      ...flow.flatMap((item): [string, string][] => {
        if (item.kind === 'text') return [['본문', item.text]];
        if (item.kind === 'head') return item.text.split(': ').map((part): [string, string] => ['머리글', part]);
        return [];
      }),
      ...OCTOPUS_REPORT_BRIEFING.flatMap((point): [string, string][] => [
        ['브리핑 제목', point.headline ?? ''],
        ['브리핑', point.text],
      ]),
    ];
    const tables = fromReport.flatMap((stage) => tablesForStage('octopus', stage.key));
    for (const table of tables) {
      if (table.title !== table.head.slice(0, 3).join(' · ')) visible.push(['표 제목', table.title]);
      visible.push(['표 설명', table.note ?? ''], ['표 캡션', table.caption ?? '']);
      for (const cell of [...table.head, ...table.rows.flat()]) visible.push(['표 셀', cell]);
    }

    expect(tables).toHaveLength(18);
    expect(visible.filter(([kind]) => kind === '머리글').length).toBeGreaterThan(20);
    const missing = visible
      .filter(([, text]) => normalize(text) !== '' && !original.includes(normalize(text)))
      .map(([kind, text]) => `${kind}: ${normalize(text).slice(0, 80)}`);
    expect(missing, '원문에 없는 화면 문자열').toEqual([]);
  });

  it('절 머리가 「: 」로 시작하지 않는다', () => {
    for (const stage of fromReport) {
      for (const item of stage.flow ?? []) {
        if (item.kind === 'head') expect(item.text, stage.key).not.toMatch(/^:/);
      }
    }
  });

  it('손으로 쓴 사실표·용어표는 원문 단계 서술에서 빠진다', () => {
    for (const stage of fromReport) {
      expect(stage.facts).toEqual([]);
      expect(stage.terms).toEqual([]);
    }
  });
});

describe('새우 최종 해부보고서 서술 추출', () => {
  const secs = reportProse('shrimp');
  const fromReport = SHRIMP_REPORT_NARRATIVES.filter((stage) => !SHRIMP_HANDWRITTEN_STAGES.has(stage.key));
  // 원문 본문 절 id. s16 은 없다 — 원문 「16 남은 물음」이 s15, 「15 제도」는 s14 안에 있다.
  const BODY = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10',
    's11', 's12', 's13', 's14', 's15', 's17', 's18'];

  it('본문 17절이 열한 단계에 전부 붙고 부록은 제외된다', () => {
    expect(secs.map((section) => section.sid)).toEqual(BODY);
    expect(proseStagesUsed('shrimp')).toEqual([
      's01', 's02', 's03', 's04', 's07', 's08', 's09', 's10', 's11', 's12', 's13',
    ]);
    expect(secs.some((section) => /^s[A-Z]$/.test(section.sid))).toBe(false);
    // 요약 절은 첫 단계 맨 앞이다
    expect(proseForStage('shrimp', 's01')[0].sid).toBe('s01');
  });

  it('원문에 대응 절이 없는 단계는 x01·s05·s06 셋이다', () => {
    expect([...SHRIMP_HANDWRITTEN_STAGES]).toEqual(['x01', 's05', 's06']);
    expect(fromReport).toHaveLength(11);
  });

  it('화면 서술·머리글·브리핑·표 전부가 원문 HTML 텍스트에 그대로 있다', () => {
    const html = readFileSync(
      join(process.cwd(), 'docs/evidence/industry-shrimp-2026-10/보고서.html'),
      'utf8',
    );
    const original = sourceText(html);
    const flow = fromReport.flatMap((stage) => stage.flow ?? []);
    const visible: [string, string][] = [
      ...fromReport.map((stage): [string, string] => ['리드', stage.lede]),
      ...flow.flatMap((item): [string, string][] => {
        if (item.kind === 'text') return [['본문', item.text]];
        if (item.kind === 'head') return item.text.split(': ').map((part): [string, string] => ['머리글', part]);
        return [];
      }),
      ...SHRIMP_REPORT_BRIEFING.flatMap((point): [string, string][] => [
        ['브리핑 제목', point.headline ?? ''],
        ['브리핑', point.text],
      ]),
    ];
    const tables = fromReport.flatMap((stage) => tablesForStage('shrimp', stage.key));
    for (const table of tables) {
      if (table.title !== table.head.slice(0, 3).join(' · ')) visible.push(['표 제목', table.title]);
      visible.push(['표 설명', table.note ?? ''], ['표 캡션', table.caption ?? '']);
      for (const cell of [...table.head, ...table.rows.flat()]) visible.push(['표 셀', cell]);
    }

    expect(tables).toHaveLength(41);
    expect(visible.filter(([kind]) => kind === '머리글').length).toBeGreaterThan(20);
    const missing = visible
      .filter(([, text]) => normalize(text) !== '' && !original.includes(normalize(text)))
      .map(([kind, text]) => `${kind}: ${normalize(text).slice(0, 80)}`);
    expect(missing, '원문에 없는 화면 문자열').toEqual([]);
  });

  it('절 머리가 「: 」로 시작하지 않는다', () => {
    for (const stage of fromReport) {
      for (const item of stage.flow ?? []) {
        if (item.kind === 'head') expect(item.text, stage.key).not.toMatch(/^:/);
      }
    }
  });

  it('손으로 쓴 사실표·용어표는 원문 단계 서술에서 빠진다', () => {
    for (const stage of fromReport) {
      expect(stage.facts).toEqual([]);
      expect(stage.terms).toEqual([]);
    }
  });
});

describe('오징어 최종 해부보고서 서술 추출', () => {
  const secs = reportProse('squid');
  const fromReport = SQUID_REPORT_NARRATIVES.filter((stage) => !SQUID_HANDWRITTEN_STAGES.has(stage.key));
  const BODY = Array.from({ length: 21 }, (_, i) => `s${String(i + 1).padStart(2, '0')}`);

  it('본문 21절이 열네 단계에 전부 붙고 부록은 제외된다', () => {
    expect(secs.map((section) => section.sid)).toEqual(BODY);
    expect(proseStagesUsed('squid')).toEqual([
      's01', 's02', 's06', 's07', 's08', 's09', 's10', 's11', 's12', 's13', 's14', 's15', 'x01', 'x03',
    ]);
    expect(secs.some((section) => /^s[A-Z]$/.test(section.sid))).toBe(false);
    // 요약 절은 첫 단계 맨 앞이다
    expect(proseForStage('squid', 's01')[0].sid).toBe('s01');
  });

  it('원문에 대응 절이 없는 단계는 s03·s04·s05·x02·x04 다섯이다', () => {
    expect([...SQUID_HANDWRITTEN_STAGES]).toEqual(['s03', 's04', 's05', 'x02', 'x04']);
    expect(fromReport).toHaveLength(14);
  });

  it('화면 서술·머리글·브리핑·표 전부가 원문 HTML 텍스트에 그대로 있다', () => {
    const html = readFileSync(
      join(process.cwd(), 'docs/evidence/industry-squid-2026-10/보고서.html'),
      'utf8',
    );
    const original = sourceText(html);
    const flow = fromReport.flatMap((stage) => stage.flow ?? []);
    const visible: [string, string][] = [
      ...fromReport.map((stage): [string, string] => ['리드', stage.lede]),
      ...flow.flatMap((item): [string, string][] => {
        if (item.kind === 'text') return [['본문', item.text]];
        if (item.kind === 'head') return item.text.split(': ').map((part): [string, string] => ['머리글', part]);
        return [];
      }),
      ...SQUID_REPORT_BRIEFING.flatMap((point): [string, string][] => [
        ['브리핑 제목', point.headline ?? ''],
        ['브리핑', point.text],
      ]),
    ];
    const tables = fromReport.flatMap((stage) => tablesForStage('squid', stage.key));
    // 표 파서는 칸 안의 <br> 줄바꿈을 「 · 」로 잇는다. 줄마다 원문에 있는지 본다.
    const lines = (kind: string, text: string): [string, string][] =>
      text.split(' · ').map((part): [string, string] => [kind, part]);
    for (const table of tables) {
      if (table.title !== table.head.slice(0, 3).join(' · ')) visible.push(['표 제목', table.title]);
      visible.push(...lines('표 설명', table.note ?? ''), ...lines('표 캡션', table.caption ?? ''));
      for (const cell of [...table.head, ...table.rows.flat()]) visible.push(...lines('표 셀', cell));
    }

    expect(tables).toHaveLength(68);
    expect(visible.filter(([kind]) => kind === '머리글').length).toBeGreaterThan(40);
    const missing = visible
      .filter(([, text]) => normalize(text) !== '' && !original.includes(normalize(text)))
      .map(([kind, text]) => `${kind}: ${normalize(text).slice(0, 80)}`);
    expect(missing, '원문에 없는 화면 문자열').toEqual([]);
  });

  it('절 머리가 「: 」로 시작하지 않는다', () => {
    for (const stage of fromReport) {
      for (const item of stage.flow ?? []) {
        if (item.kind === 'head') expect(item.text, stage.key).not.toMatch(/^:/);
      }
    }
  });

  it('손으로 쓴 사실표·용어표는 원문 단계 서술에서 빠진다', () => {
    for (const stage of fromReport) {
      expect(stage.facts).toEqual([]);
      expect(stage.terms).toEqual([]);
    }
  });
});

describe('참치 최종 해부보고서 서술 추출 (참치 해부 화면)', () => {
  const secs = reportProse('tuna');
  const BODY = Array.from({ length: 17 }, (_, i) => `s${String(i + 1).padStart(2, '0')}`);
  const STAGES = Array.from({ length: 15 }, (_, i) => `s${String(i + 1).padStart(2, '0')}`);

  it('본문 17절이 열다섯 단계에 전부 붙고 부록은 제외된다', () => {
    expect(secs.map((section) => section.sid)).toEqual(BODY);
    expect(proseStagesUsed('tuna')).toEqual(STAGES);
    expect(secs.some((section) => /^s[A-Z]$/.test(section.sid))).toBe(false);
    // 요약 절은 첫 단계 맨 앞, 16절은 07단계 뒤, 17절은 11단계 뒤다
    expect(proseForStage('tuna', 's01')[0].sid).toBe('s01');
    expect(proseForStage('tuna', 's07').map((section) => section.sid)).toEqual(['s07', 's16']);
    expect(proseForStage('tuna', 's11').map((section) => section.sid)).toEqual(['s11', 's17']);
  });

  it('원문에 대응 절이 없는 손 작성 단계가 없다', () => {
    expect([...TUNA_ANATOMY_HANDWRITTEN_STAGES]).toEqual([]);
    expect(TUNA_ANATOMY_REPORT_NARRATIVES.map((stage) => stage.key)).toEqual(STAGES);
    expect(TUNA_ANATOMY_REPORT_NARRATIVES.some((stage) => stage.badge)).toBe(false);
  });

  it('화면 서술·머리글·브리핑·표 전부가 원문 HTML 텍스트에 그대로 있다', () => {
    const html = readFileSync(
      join(process.cwd(), 'docs/evidence/industry-tuna-2026-10/보고서.html'),
      'utf8',
    );
    const original = sourceText(html);
    const fromReport = TUNA_ANATOMY_REPORT_NARRATIVES;
    const flow = fromReport.flatMap((stage) => stage.flow ?? []);
    const visible: [string, string][] = [
      ...fromReport.map((stage): [string, string] => ['리드', stage.lede]),
      ...flow.flatMap((item): [string, string][] => {
        if (item.kind === 'text') return [['본문', item.text]];
        if (item.kind === 'head') return item.text.split(': ').map((part): [string, string] => ['머리글', part]);
        return [];
      }),
      ...TUNA_ANATOMY_REPORT_BRIEFING.flatMap((point): [string, string][] => [
        ['브리핑 제목', point.headline ?? ''],
        ['브리핑', point.text],
      ]),
    ];
    const tables = fromReport.flatMap((stage) => tablesForStage('tuna', stage.key));
    // 표 파서는 칸 안의 <br> 줄바꿈을 「 · 」로 잇는다. 줄마다 원문에 있는지 본다.
    const lines = (kind: string, text: string): [string, string][] =>
      text.split(' · ').map((part): [string, string] => [kind, part]);
    for (const table of tables) {
      // 11절 표는 첫 머리칸이 비어 헤더 서명이 빈칸을 건너뛴다(「선망선 · 연승선」).
      const signature = table.head.slice(0, 3).filter(Boolean).join(' · ');
      if (table.title !== signature) visible.push(['표 제목', table.title]);
      visible.push(...lines('표 설명', table.note ?? ''), ...lines('표 캡션', table.caption ?? ''));
      for (const cell of [...table.head, ...table.rows.flat()]) visible.push(...lines('표 셀', cell));
    }

    expect(tables).toHaveLength(39);
    expect(visible.filter(([kind]) => kind === '머리글').length).toBeGreaterThan(40);
    const missing = visible
      .filter(([, text]) => normalize(text) !== '' && !original.includes(normalize(text)))
      .map(([kind, text]) => `${kind}: ${normalize(text).slice(0, 80)}`);
    expect(missing, '원문에 없는 화면 문자열').toEqual([]);
  });

  it('절 머리가 「: 」로 시작하지 않는다', () => {
    for (const stage of TUNA_ANATOMY_REPORT_NARRATIVES) {
      for (const item of stage.flow ?? []) {
        if (item.kind === 'head') expect(item.text, stage.key).not.toMatch(/^:/);
      }
    }
  });

  it('손으로 쓴 사실표·용어표는 원문 단계 서술에서 빠진다', () => {
    for (const stage of TUNA_ANATOMY_REPORT_NARRATIVES) {
      expect(stage.facts).toEqual([]);
      expect(stage.terms).toEqual([]);
    }
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

  it('실린 편은 모두 서술이 있다', () => {
    // ⚠ 편 수를 리터럴로 적지 마라. 9 로 박아 둔 자리가 Nauterra(Ⅹ) 누락을 못 잡았다.
    expect(REPORT_PROSE_COMPANIES.length).toBeGreaterThanOrEqual(9);
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
