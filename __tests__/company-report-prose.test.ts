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
import {
  SURIMI_HERO_KPIS,
  SURIMI_REPORT_BRIEFING,
  SURIMI_REPORT_NARRATIVES,
  SURIMI_STAGES,
} from '@/components/market-understanding/SurimiIndustryDashboard';
import {
  MACKEREL_HERO_KPIS,
  MACKEREL_REPORT_BRIEFING,
  MACKEREL_REPORT_NARRATIVES,
  MACKEREL_STAGES,
} from '@/components/market-understanding/MackerelIndustryDashboard';
import {
  TUNAFARM_HERO_KPIS,
  TUNAFARM_REPORT_BRIEFING,
  TUNAFARM_REPORT_NARRATIVES,
} from '@/components/market-understanding/TunafarmIndustryDashboard';
import {
  WHELK_HERO_KPIS,
  WHELK_REPORT_BRIEFING,
  WHELK_REPORT_NARRATIVES,
  WHELK_STAGES,
} from '@/components/market-understanding/WhelkIndustryDashboard';
import type { HeroKpi } from '@/components/v2/HeroZone';
import type { BriefingPoint, StageNarrative } from '@/components/market-understanding/CommodityIndustryDashboard';
import { FRABELLE_STAGES } from '@/lib/company-frabelle-content';
import { COMPANY_CARDS } from '@/components/market-understanding/CompanyAnatomyDashboard';
import { proseStages } from '@/lib/company-prose-stages';
import { tablesForStage } from '@/lib/data/company-report-tables';
import { figuresForStage, reportFigures } from '@/lib/data/company-report-figures';
import { chapterHead } from '@/components/market-understanding/IndustryReportFlow';
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
    // 그림 캡션과 설명(지표 타일·막대 이름)도 원문 그대로다.
    for (const f of POLLOCK_REPORT_NARRATIVES.flatMap((stage) => figuresForStage('pollock', stage.key))) {
      for (const part of [...f.caption.split(' · '), ...f.alt.split(' · ')]) visible.push(['그림 캡션', part]);
    }
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
    // 그림 캡션과 설명(지표 타일·막대 이름)도 원문 그대로다.
    for (const f of fromReport.flatMap((stage) => figuresForStage('octopus', stage.key))) {
      for (const part of [...f.caption.split(' · '), ...f.alt.split(' · ')]) visible.push(['그림 캡션', part]);
    }
    for (const table of tables) {
      if (table.title !== table.head.slice(0, 3).join(' · ')) visible.push(['표 제목', table.title]);
      visible.push(['표 설명', table.note ?? ''], ['표 캡션', table.caption ?? '']);
      for (const cell of [...table.head, ...table.rows.flat()]) visible.push(['표 셀', cell]);
    }

    expect(tables).toHaveLength(21);
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
    // 그림 캡션과 설명(지표 타일·막대 이름)도 원문 그대로다.
    for (const f of fromReport.flatMap((stage) => figuresForStage('shrimp', stage.key))) {
      for (const part of [...f.caption.split(' · '), ...f.alt.split(' · ')]) visible.push(['그림 캡션', part]);
    }
    for (const table of tables) {
      if (table.title !== table.head.slice(0, 3).join(' · ')) visible.push(['표 제목', table.title]);
      visible.push(['표 설명', table.note ?? ''], ['표 캡션', table.caption ?? '']);
      for (const cell of [...table.head, ...table.rows.flat()]) visible.push(['표 셀', cell]);
    }

    expect(tables).toHaveLength(44);
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
    // 그림 캡션과 설명(지표 타일·막대 이름)도 원문 그대로다.
    for (const f of fromReport.flatMap((stage) => figuresForStage('squid', stage.key))) {
      for (const part of [...f.caption.split(' · '), ...f.alt.split(' · ')]) visible.push(['그림 캡션', part]);
    }
    // 표 파서는 칸 안의 <br> 줄바꿈을 「 · 」로 잇는다. 줄마다 원문에 있는지 본다.
    const lines = (kind: string, text: string): [string, string][] =>
      text.split(' · ').map((part): [string, string] => [kind, part]);
    for (const table of tables) {
      if (table.title !== table.head.slice(0, 3).join(' · ')) visible.push(['표 제목', table.title]);
      visible.push(...lines('표 설명', table.note ?? ''), ...lines('표 캡션', table.caption ?? ''));
      for (const cell of [...table.head, ...table.rows.flat()]) visible.push(...lines('표 셀', cell));
    }

    expect(tables).toHaveLength(71);
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
    // 그림 캡션과 설명(지표 타일·막대 이름)도 원문 그대로다.
    for (const f of fromReport.flatMap((stage) => figuresForStage('tuna', stage.key))) {
      for (const part of [...f.caption.split(' · '), ...f.alt.split(' · ')]) visible.push(['그림 캡션', part]);
    }
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

describe('연육 최종 해부보고서 서술 추출 (위젯 없는 화면)', () => {
  const secs = reportProse('surimi');
  const BODY = Array.from({ length: 15 }, (_, i) => `s${String(i + 1).padStart(2, '0')}`);
  const STAGES = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 'x01'];

  it('본문 15절이 여덟 단계에 전부 붙고 부록 sA 는 제외된다', () => {
    expect(secs.map((section) => section.sid).sort()).toEqual(BODY);
    expect(proseStagesUsed('surimi')).toEqual(STAGES);
    expect(secs.some((section) => /^s[A-Z]$/.test(section.sid))).toBe(false);
    expect(proseForStage('surimi', 's01').map((section) => section.sid)).toEqual(['s01', 's02', 's05']);
    expect(proseForStage('surimi', 'x01').map((section) => section.sid)).toEqual(['s14', 's15']);
  });

  it('화면 단계는 원문 단계 전부이고 손 작성 서술·사실표가 없다', () => {
    expect(SURIMI_REPORT_NARRATIVES.map((stage) => stage.key)).toEqual(SURIMI_STAGES.map((stage) => stage.key));
    expect([...SURIMI_REPORT_NARRATIVES.map((stage) => stage.key)].sort()).toEqual(STAGES);
    for (const stage of SURIMI_REPORT_NARRATIVES) {
      expect(stage.badge).toBeUndefined();
      expect(stage.facts).toEqual([]);
      expect(stage.terms).toEqual([]);
      for (const item of stage.flow ?? []) {
        if (item.kind === 'head') expect(item.text, stage.key).not.toMatch(/^:/);
      }
    }
  });

  it('화면 서술·머리글·브리핑·표·그림 캡션·히어로 수치 전부가 원문 HTML 텍스트에 그대로 있다', () => {
    const html = readFileSync(
      join(process.cwd(), 'docs/evidence/industry-surimi-2026-10/보고서.html'),
      'utf8',
    );
    const original = sourceText(html);
    const fromReport = SURIMI_REPORT_NARRATIVES;
    const flow = fromReport.flatMap((stage) => stage.flow ?? []);
    const visible: [string, string][] = [
      ...fromReport.map((stage): [string, string] => ['리드', stage.lede]),
      ...flow.flatMap((item): [string, string][] => {
        if (item.kind === 'text') return [['본문', item.text]];
        if (item.kind === 'head') return item.text.split(': ').map((part): [string, string] => ['머리글', part]);
        return [];
      }),
      ...SURIMI_REPORT_BRIEFING.flatMap((point): [string, string][] => [
        ['브리핑 제목', point.headline ?? ''],
        ['브리핑', point.text],
      ]),
      ...SURIMI_HERO_KPIS.map((kpi): [string, string] => ['히어로', kpi.value.toLocaleString('en-US', {
        minimumFractionDigits: kpi.decimals ?? 0, maximumFractionDigits: kpi.decimals ?? 0,
      })]),
    ];
    const tables = fromReport.flatMap((stage) => tablesForStage('surimi', stage.key));
    const figures = fromReport.flatMap((stage) => figuresForStage('surimi', stage.key));
    for (const f of figures) {
      for (const part of [...f.caption.split(' · '), ...f.alt.split(' · ')]) visible.push(['그림 캡션', part]);
    }
    const lines = (kind: string, text: string): [string, string][] =>
      text.split(' · ').map((part): [string, string] => [kind, part]);
    for (const table of tables) {
      const signature = table.head.slice(0, 3).filter(Boolean).join(' · ');
      if (table.title !== signature) visible.push(['표 제목', table.title]);
      visible.push(...lines('표 설명', table.note ?? ''), ...lines('표 캡션', table.caption ?? ''));
      for (const cell of [...table.head, ...table.rows.flat()]) visible.push(...lines('표 셀', cell));
    }

    expect(tables).toHaveLength(22);
    expect(figures).toHaveLength(1);
    expect(visible.filter(([kind]) => kind === '머리글').length).toBeGreaterThan(20);
    const missing = visible
      .filter(([, text]) => normalize(text) !== '' && !original.includes(normalize(text)))
      .map(([kind, text]) => `${kind}: ${normalize(text).slice(0, 80)}`);
    expect(missing, '원문에 없는 화면 문자열').toEqual([]);
  });
});

/**
 * 고등어·참치 양식·골뱅이 — 손 작성 서술을 걷고 원문 추출로 바꾼 세 화면(2026-10-12).
 * 골뱅이 조달은 절 id 가 없어 h2 단위로 자른다(report_tables.sections).
 * 참치 양식은 해부보고서 「한국 시장의 양식 참다랑어」(표준 틀 15절)로 바뀌어 1절=1단계이고 손 작성 단계가 없다.
 */
const BODY = (n: number) => Array.from({ length: n }, (_, i) => `s${String(i + 1).padStart(2, '0')}`);
const THREE: Array<{
  key: string; 이름: string; sections: number; tables: number; briefing: number;
  stages: string[]; groups: Record<string, string[]>;
  narratives: StageNarrative[]; hand: Array<{ key: string }>; brief: BriefingPoint[]; hero: HeroKpi[];
}> = [
  {
    key: 'mackerel', 이름: '고등어', sections: 15, tables: 49, briefing: 15,
    stages: ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 'x01'],
    groups: { s01: ['s01', 's02'], s07: ['s08', 's09'], s09: ['s11', 's14', 's15'], x01: ['s12', 's13'] },
    narratives: MACKEREL_REPORT_NARRATIVES, hand: MACKEREL_STAGES, brief: MACKEREL_REPORT_BRIEFING, hero: MACKEREL_HERO_KPIS,
  },
  {
    key: 'tunafarm', 이름: '참치 양식', sections: 15, tables: 15, briefing: 15,
    stages: BODY(15),
    groups: Object.fromEntries(BODY(15).map((sid) => [sid, [sid]])),
    // 손 작성 단계가 없다 — 화면 단계 = 원문 절 순서 그대로
    narratives: TUNAFARM_REPORT_NARRATIVES, hand: BODY(15).map((key) => ({ key })), brief: TUNAFARM_REPORT_BRIEFING, hero: TUNAFARM_HERO_KPIS,
  },
  {
    key: 'whelk', 이름: '골뱅이', sections: 5, tables: 17, briefing: 4,
    stages: ['s01', 's02', 's03', 's04'],
    groups: { s03: ['s03', 's04'], s04: ['s05'] },
    narratives: WHELK_REPORT_NARRATIVES, hand: WHELK_STAGES, brief: WHELK_REPORT_BRIEFING, hero: WHELK_HERO_KPIS,
  },
];

describe.each(THREE)('$key 원문 서술 추출 (손 작성 서술 대체)', (c) => {
  const secs = reportProse(c.key);

  it('본문 절이 단계에 전부 붙고 부록·별첨은 제외된다', () => {
    expect(secs.map((section) => section.sid)).toEqual(BODY(c.sections));
    expect(proseStagesUsed(c.key)).toEqual([...c.stages].sort());
    for (const [stage, sids] of Object.entries(c.groups)) {
      expect(proseForStage(c.key, stage).map((section) => section.sid), stage).toEqual(sids);
    }
    expect(secs.some((section) => /^(부록|별첨)/.test(section.subtitle) || /^(부록|별첨)/.test(section.numeral))).toBe(false);
  });

  it('화면 단계는 원문 단계 전부이고 손 작성 서술·사실표가 없다', () => {
    expect(c.narratives.map((stage) => stage.key)).toEqual(c.hand.map((stage) => stage.key));
    expect([...c.narratives.map((stage) => stage.key)].sort()).toEqual([...c.stages].sort());
    for (const stage of c.narratives) {
      expect(stage.badge).toBeUndefined();
      expect(stage.facts).toEqual([]);
      expect(stage.terms).toEqual([]);
      for (const item of stage.flow ?? []) {
        if (item.kind === 'head') expect(item.text, stage.key).not.toMatch(/^:/);
      }
    }
  });

  it('화면 서술·머리글·브리핑·표·그림 캡션·히어로 수치 전부가 원문 HTML 텍스트에 그대로 있다', () => {
    const html = readFileSync(join(process.cwd(), `docs/evidence/industry-${c.key}-2026-10/보고서.html`), 'utf8');
    const original = sourceText(html);
    const flow = c.narratives.flatMap((stage) => stage.flow ?? []);
    const visible: [string, string][] = [
      ...c.narratives.map((stage): [string, string] => ['리드', stage.lede]),
      ...flow.flatMap((item): [string, string][] => {
        // 콜아웃은 「**제목** 본문」으로 붙는다. 참치 양식 원문은 제목(span.h)과 본문(p) 사이에 공백이 없어 따로 대조한다.
        const call = item.kind === 'text' ? /^\*\*(.+?)\*\* ([\s\S]*)$/.exec(item.text) : null;
        if (call) return [['콜아웃 제목', call[1]], ['본문', call[2]]];
        if (item.kind === 'text') return [['본문', item.text]];
        if (item.kind === 'head') return item.text.split(': ').map((part): [string, string] => ['머리글', part]);
        return [];
      }),
      ...c.brief.flatMap((point): [string, string][] => [
        ['브리핑 제목', point.headline ?? ''],
        ['브리핑', point.text],
      ]),
      // 표지 타일을 글자 그대로 싣는 히어로(text)는 라벨·값·단위 줄을 모두 대조한다
      ...c.hero.flatMap((kpi): [string, string][] => kpi.text !== undefined
        ? [['히어로 라벨', kpi.label], ['히어로', kpi.text], ...(kpi.unit ?? '').split(' · ').map((part): [string, string] => ['히어로 단위', part])]
        : [['히어로', kpi.value.toLocaleString('en-US', {
          minimumFractionDigits: kpi.decimals ?? 0, maximumFractionDigits: kpi.decimals ?? 0,
        })]]),
    ];
    const tables = c.narratives.flatMap((stage) => tablesForStage(c.key, stage.key));
    const figures = c.narratives.flatMap((stage) => figuresForStage(c.key, stage.key));
    for (const f of figures) {
      for (const part of [...f.caption.split(' · '), ...f.alt.split(' · ')]) visible.push(['그림 캡션', part]);
    }
    const lines = (kind: string, text: string): [string, string][] =>
      text.split(' · ').map((part): [string, string] => [kind, part]);
    for (const table of tables) {
      const signature = table.head.slice(0, 3).filter(Boolean).join(' · ');
      if (table.title !== signature) visible.push(['표 제목', table.title]);
      visible.push(...lines('표 설명', table.note ?? ''), ...lines('표 캡션', table.caption ?? ''));
      for (const cell of [...table.head, ...table.rows.flat()]) visible.push(...lines('표 셀', cell));
    }

    expect(tables).toHaveLength(c.tables);
    expect(figures).toEqual([]);
    expect(c.brief).toHaveLength(c.briefing);
    expect(visible.filter(([kind]) => kind === '머리글').length).toBeGreaterThanOrEqual(c.sections);
    const missing = visible
      .filter(([, text]) => normalize(text) !== '' && !original.includes(normalize(text)))
      .map(([kind, text]) => `${kind}: ${normalize(text).slice(0, 80)}`);
    expect(missing, '원문에 없는 화면 문자열').toEqual([]);
  });
});

it('참치 양식 - h2n 이 번호·라벨로, 단계 제목은 원문 h2 부제이고 질문은 없다', () => {
  const secs = reportProse('tunafarm');
  expect(secs.map((section) => `${section.numeral}/${section.label}`)).toEqual([
    '01/요약', '02/원인', '03/시장', '04/조달선', '05/산지', '06/수입 주체', '07/해외', '08/가공 규모',
    '09/가공 지역', '10/업체', '11/연결', '12/재무', '13/값', '14/제도', '15/남은 물음',
  ]);
  expect(TUNAFARM_REPORT_NARRATIVES.map((stage) => stage.title)).toEqual(secs.map((section) => section.subtitle));
  expect(TUNAFARM_REPORT_NARRATIVES[0].title).toBe('한눈에 보는 양식 참다랑어');
  for (const stage of TUNAFARM_REPORT_NARRATIVES) expect(stage.question).toBe('');
});

describe('품목 해부보고서 장 제목·그림 자리', () => {
  const cases = [
    ['pollock', POLLOCK_REPORT_NARRATIVES, new Set<string>()],
    ['octopus', OCTOPUS_REPORT_NARRATIVES, OCTOPUS_HANDWRITTEN_STAGES],
    ['shrimp', SHRIMP_REPORT_NARRATIVES, SHRIMP_HANDWRITTEN_STAGES],
    ['squid', SQUID_REPORT_NARRATIVES, SQUID_HANDWRITTEN_STAGES],
    ['tuna', TUNA_ANATOMY_REPORT_NARRATIVES, TUNA_ANATOMY_HANDWRITTEN_STAGES],
    ['surimi', SURIMI_REPORT_NARRATIVES, new Set<string>()],
    ['mackerel', MACKEREL_REPORT_NARRATIVES, new Set<string>()],
    ['tunafarm', TUNAFARM_REPORT_NARRATIVES, new Set<string>()],
    ['whelk', WHELK_REPORT_NARRATIVES, new Set<string>()],
  ] as const;
  // 골뱅이 조달(5장)은 해부보고서보다 장이 적다.
  const MIN_SECTIONS: Record<string, number> = { whelk: 5 };

  it.each(cases)('%s - 원문 본문 절의 장 제목(라벨 + 부제)이 하나도 빠지지 않고 화면 머리글에 있다', (key, narratives, hand) => {
    const fromReport = narratives.filter((stage) => !hand.has(stage.key));
    const heads = new Set(fromReport.flatMap((stage) => [
      stage.title,
      ...(stage.flow ?? []).flatMap((item) => (item.kind === 'head' ? [item.text] : [])),
    ]));
    const secs = reportProse(key);
    expect(secs.length).toBeGreaterThanOrEqual(MIN_SECTIONS[key] ?? 11);
    const missing = secs.map(chapterHead).filter((head) => !heads.has(head));
    expect(missing, `${key} 화면에 없는 장 제목`).toEqual([]);
    // 장 제목은 그 절의 서술보다 앞에 선다
    for (const stage of fromReport) {
      const flow = stage.flow ?? [];
      const firstHead = flow.findIndex((item) => item.kind === 'head');
      if (proseForStage(key, stage.key)[0] && chapterHead(proseForStage(key, stage.key)[0]) !== stage.title) {
        expect(firstHead, `${key} ${stage.key}`).toBe(0);
      }
    }
  });

  it.each(cases)('%s - 원문 표와 그림이 전부 서술 흐름 안에 자리 잡는다', (key, narratives, hand) => {
    const fromReport = narratives.filter((stage) => !hand.has(stage.key));
    const slots = fromReport.flatMap((stage) => (stage.flow ?? []).filter((item) => item.kind === 'slot'));
    const tables = fromReport.flatMap((stage) => tablesForStage(key, stage.key));
    expect(slots).toHaveLength(tables.length + reportFigures(key).length);
  });

  it('오징어 그림 14개가 화면 흐름에 오른다(다른 넷과 고등어·참치 양식·골뱅이는 원문에 그림이 없다)', () => {
    expect(reportFigures('squid')).toHaveLength(14);
    for (const key of ['pollock', 'octopus', 'shrimp', 'tuna', 'mackerel', 'tunafarm', 'whelk']) expect(reportFigures(key)).toEqual([]);
  });
});

describe('双日(Sojitz) 수산 보고서 서술 추출 (ⅬⅩⅡ)', () => {
  const secs = reportProse('sojitz');

  it('보고서 절이 하나도 빠지지 않고 번호가 이어진다', () => {
    expect(secs.length).toBeGreaterThanOrEqual(17);
    expect(secs.map((s) => s.numeral)).toEqual(
      secs.map((_, i) => String(i + 1).padStart(2, '0')),
    );
    for (const s of secs) {
      expect(proseForStage('sojitz', s.stage).length, `${s.stage} 매핑`).toBeGreaterThan(0);
    }
  });

  // 정본 ~/tunawork/sojitz/build/killed.py (반증에서 폐기한 표현) 를 그대로 옮겼다.
  // 발행본 검사와 같이 「」 인용은 지우고 본다 — 반박 인용은 통과.
  const KILLED: [string, string][] = [
    ["사시미 참치 (가치)?사슬(이다|을 (짓|지었|구축|완성)|로 (묶였|물렸|이어졌|묶인다|물린다))", "축은 「스시 재료 포트폴리오 안의 참치 한 축」(메인 §1)"],
    ["사서 짓는", "착수 가설 문구(메인 §1)"],
    ["(鷹島|ツナファーム)[^<。.]{0,20}大連[^<。.]{0,25}(확인된다|확인됐|확인되었|기록이 있|기록으로 남)(?![^<。.]{0,15}(없|않|아니))", "현행 사이트 비표시 문단(N+ 3)"],
    ["(鷹島|ツナファーム)[^<。.]{0,15}大連(翔祥)?(에|으로)[^<。.]{0,12}(수출한다|보낸다|판다|팔고 있다)(?![는고라])", "2011~2018 회사 서술일 뿐(N+ 3)"],
    ["세 칸[^<。.]{0,30}(双日뿐|双日밖에|双日만|유일)", "경쟁사 칸 미조사(N+ 11)"],
    ["(일본 )?상사 (가운데|중|중에서) 유일", "최상급 판정 근거 없음(N+ 11)"],
    ["(수산|실력치|순이익|이익)[^<。.]{0,20}(?<![\\d,.])(3|3,3|세)\\s?배(?!\\s*(가 아니|로 읽을 수 없))", "저베이스 배수(N+ 8)"],
    ["(TRY|トライ産業)[^<。.]{0,25}(?<![\\d,.])(14|열네)\\s?배", "저베이스 배수(N+ 8)"],
    ["한국[^<。.양]{0,20}(연승|횟감)[^<。.양]{0,20}(?<!재)수출[^<。.양]{0,10}70\\s*(%|퍼센트)", "FFA 70 %의 분모는 부산 양륙분 중 재수출 물량(N+ 26)"],
    ["MSC[^<。.]{0,15}(증서|인증서|인증)[^<。.]{0,5}(6|여섯)\\s?(건|개|장)", "본증서 5 + 하위 2(N+ 25)"],
    ["(네|다섯) (조각|건|법인|회사)[^<。.]{0,20}(하나의|한) (사슬|가치사슬|밸류체인)(로|을|이)[^<。.]{0,10}(물린다|물려 있|이어진다|이룬다|완성)", "조각 간 거래 문서 0건(N+ 2)"],
    ["조각 (사이|간)[^<。.]{0,20}(거래|흐름)[^<。.]{0,15}(확인된다|확인됐|확인되었)(?![^<。.]{0,15}(없|않))", "조각 간 거래 문서 0건(N+ 2)"],
    ["(鷹島|ツナファーム)[^<。.]{0,15}(를|을) (인수|매수|사들)", "2008 자체 설립(C절)"],
    ["マリンフーズ[^<。.]{0,15}(사시미 참치|참치) (가공 )?(라인|공장)(을|이) (갖|운영|둔다|있다)", "공장 서술에 사시미 참치 라인 없음(F절)"],
    ["(46|24)\\s?억[^<。.]{0,10}참치 이익|참치 이익[^<。.]{0,10}(46|24)\\s?억|マリンフーズ(의|가)?[^<。.]{0,8}(이익|실력치)[^<。.]{0,6}참치 이익", "마린푸즈 이익에 참치 아닌 사업이 섞임(B절)"],
    ["大連翔祥[^<。.]{0,30}(90|51)\\s*%(다|이다|를 (가진|보유)|인 자회사)", "지분 90 %·51 % 병기(N+ 4)"],
    ["(TRY|トライ産業|鷹島)[^<。.]{0,30}(NESI|SFIH)[^<。.]{0,15}공동조달(한다|에 나선|을 한다)|(NESI|SFIH)[^<。.]{0,20}(TRY|トライ産業|鷹島)[^<。.]{0,15}공동조달(한다|에 나선)", "공동조달은 백신어, TRY·鷹島 언급 없음(N+ 7)"],
    ["(현행|현재)[^<。.]{0,10}목표[^<。.]{0,10}40\\s?억", "현행 목표 50억(N+ 9)"],
    ["같은 달[^<。.]{0,15}두 (문서|자료)", "50억은 2026-05에 이미 나온다(N+ 9)"],
    ["マリンフーズ[^<。.]{0,20}(愛媛|에히메)[^<。.]{0,15}(양식장을 (가진|갖|운영)|면허를 (가진|갖|보유))|マリンフーズ(의|가) (참치 )?양식장", "MF 면허 0건(N+ 12)"],
    ["가두리[^<。.]{0,20}(증설|늘렸|늘었|확장했)(?![^<。.]{0,12}(로 (볼|읽을) (근거|수)|는 문서|지 않|했다는 (공시|문서)))", "30·33·48 시점별 병기(N+ 14)"],
    ["76\\s?대[^<。.]{0,6}(를|을)? ?(운용|운영|가동|띄운)", "76은 면허 상한 안분(N+ 14)"],
    ["(4만|40[.]000)\\s?尾[^<。.]{0,20}(네|4) (출처|문서)(가|로|에서) 확인", "회사 단일 숫자(N+ 15)"],
    ["(4만|40[.]000)\\s?尾[^<。.]{0,20}(곱|×)|(4만|40[.]000)\\s?尾[^<。.]{0,10}(를|을)? ?(매년|연간|해마다) 출하", "재고 미수를 출하·톤으로 바꾸지 않는다(N+ 39)"],
    ["600\\s?t[^<。.]{0,10}(을|를)? ?(출하한다|출하했다|생산한다|생산했다)", "600 t은 추정(N+ 39)"],
    ["(鷹島|ツナファーム)[^<。.]{0,20}(완전양식|完全養殖|蓄養|축양)(을 한다|이다|하는 회사|업체)", "회사 표현은 「本まぐろ養殖」(E절)"],
    ["SCSA[^<。.]{0,20}(전량|전체|모든)[^<。.]{0,10}(인증|에 붙)", "인공종묘분(10 % 이하)에만(E절)"],
    ["(キャス|クリエイト)[^<。.]{0,20}300\\s?(인|명) ?(초과|넘)", "101~300인 구간(N+ 16)"],
    ["マリンフーズ[^<。.]{0,20}(2022-04|2022년 4월)[^<。.]{0,6}(에 )?(취득|인수|사들|샀)(했다|다)", "有報 취득일 2022-03-31(N+ 18)"],
    ["2023-04-10|2023년 4월 10일", "TRY 효력일 원문 미확보(N+ 19)"],
    ["(3~4|3∼4|서너)\\s?할[^<。.]{0,6}(싸다|싸게|저렴)", "비교군 조건 상이, C(N+ 32)"],
    ["(BLACK BOX|ブラックボックス)[^<。.]{0,15}FFA[^<。.]{0,15}(두 출처|각각|따로)[^<。.]{0,4}(확인|지목)", "BLACK BOX는 FFA 재인용(N+ 34)"],
    ["(TRY|トライ産業|双日)(가|이|은|는)[^<。.]{0,15}한국산[^<。.]{0,15}(산다|사들인다|매입한다|사들였다|매입했다)(?![는고라])", "FFA 「reported」 한 갈래(M절)"],
    ["한국산[^<。.]{0,15}(최대|주) 매입자(다|이다)", "FFA 업계 전언(M절)"],
    ["신라교역[^<。.]{0,25}(거래|매출)(가|이)? (없다|없었다)", "신라교역은 거래처명 비공시(N+ 33)"],
    ["2[,.]6\\s?만\\s?t[^<。.]{0,25}(점유율|몫|비중)[^<。.]{0,5}\\d", "분모 없음(L절)"],
    ["(TRY|トライ産業)[^<。.]{0,15}점유율[^<。.]{0,5}15\\s*%(다|이다|를 (가진|차지한))", "2006년 값(D절)"],
    ["(鷹島|ツナファーム)[^<。.]{0,15}MSC[^<。.]{0,10}(없다|없고|받지 않)", "무의미한 부재(J절)"],
    ["MEL[^<。.]{0,25}鷹島(만|뿐)", "양식 MEL 참다랑어 0건 — 대조군 부재(J절)"],
    ["(TRY|トライ産業)[^<。.]{0,20}MSC[^<。.]{0,20}참다랑어(가|를|도)? ?(포함|들어 있|있다)", "TRY 범위에 참다랑어 없음(J절)"],
    ["세계(에서|를)? ?(선도|리드)한다", "회사 자칭(J절)"],
    ["マリンフーズ[^<。.]{0,25}(표시 위반|食品表示法|원산지 (허위|표시 위반)|지시를 받)", "マリンフレッシュ와 다른 회사(J절)"],
    ["강제노동(은|이)? ?(없다|없었다|없음)|IUU(와|에)? ?(무관|관련이 없)", "체계 조회 안 함(J절)"],
    ["ISSF[^<。.]{0,30}(뒤처|미흡|부족하다)", "모집단이 다름(N+ 33)"],
    ["(?:^|[<。.])(?:(?!등록부)[^<。.])*?(자사|자기) (선단|어선)[^<。.]{0,6}(0척|없다|없고)(?:(?!등록부)[^<。.])*(?=[<。.]|$)", "0척은 RFMO 등록부 5종·한계와 함께(N+ 10)"],
    ["(62[.,]4|62[.,]368)[^<。.]{0,25}(인수가|인수 대가|매수가|에 (인수|샀|사들))(?![^<。.]{0,6}(가 아니|는 아니|이 아니))", "신주 납입이지 인수가 아님(C절)"],
    ["NESI[^<。.]{0,15}100\\s*%(를|을)? ?(인수|취득|보유|소유)", "SFIH의 NESI 지분 94,6 %(G절)"],
    ["Sushi Avenue[^<。.]{0,10}(법인|지분|주식)[^<。.]{0,12}(인수했|취득했|사들였)", "사업 양수(C절)"],
    ["Sushi Avenue[^<。.]{0,20}400\\s?(곳|개|점|매장)(이다|을 운영|에 달)", "300+(A)·400+(B) 병기(N+ 35)"],
    ["16[.,]760[^<。.]{0,30}Sushi Avenue[^<。.]{0,10}(포함|들어)(된다|있다|됐)", "배분 문서 없음(N+ 23)"],
    ["265\\s?억[^<。.]{0,10}(에 )?(인수|사들|샀)|18[.,]236[^<。.]{0,15}기업가치(다|이다)", "지분 대가와 기업가치는 다른 개념(C절)"],
    ["세계 (No\\.?\\s?1|1위)[^<。.]{0,10}(수산|스시|寿司)[^<。.]{0,10}(기업|그룹|회사)(이다|다)", "회사 목표 문구(B절)"],
    ["(三菱|東洋冷蔵|TOREI)[^<。.]{0,20}(세계|일본) (1위|최대)(다|이다|를 지킨다|를 차지한다)", "2016 기준 FFA 서술(N절)"],
    ["双日(은|는)[^<。.]{0,10}참치 (회사|상사)(다|이다)", "수산 축은 스시 재료 포트폴리오(메인 §1)"],
    ["植村|渋谷 ?誠|齋藤|後藤 ?崇文|大西 ?啓之|森 ?創一郎|岡田 ?広行|長尾 ?泰宏|Campling|Hiraiwa|Aviles|Saito", "개인 실명 금지(규약 §1)"],
  ];

  it('반증에서 기각한 주장이 서술과 카드에 없다', () => {
    const card = COMPANY_CARDS.find((c) => c.key === 'sojitz');
    expect(card).toBeTruthy();
    const texts = [
      ...secs.flatMap((s) => s.blocks.map((b) => `${b.title ?? ''} ${b.text}`)),
      card!.tagline,
      ...card!.stats.map((s) => s.value),
    ].map((t) => t.replace(/「[^」]*」/g, ''));
    for (const [src, why] of KILLED) {
      const re = new RegExp(src);
      for (const t of texts) {
        const m = t.match(re);
        expect(m?.[0], `${why} — ${t.slice(0, 80)}`).toBeUndefined();
      }
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
    // 골뱅이 조달 보고서는 해부보고서가 아니라 본문 장이 다섯(요지·Ⅰ~Ⅳ)인 짧은 조사 보고서다.
    // 네 단계뿐이고 Ⅳ장은 문단이 하나(리드)뿐이라 본문 하한을 따로 둔다. 리드는 모든 단계에 있어야 한다.
    const SHORT: Record<string, number> = { whelk: 4 };
    for (const c of REPORT_PROSE_COMPANIES) {
      const stages = proseStages(c);
      expect(stages.length, `${c} 단계 수`).toBeGreaterThanOrEqual(SHORT[c] ?? 6);
      for (const st of stages) {
        expect(st.lede.length, `${c} ${st.key} 리드`).toBeGreaterThan(0);
        if (c === 'whelk' && st.key === 's04') continue;
        expect(st.paragraphs.length, `${c} ${st.key} 본문`).toBeGreaterThan(0);
      }
    }
  });
});
