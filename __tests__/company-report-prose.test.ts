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

    expect(tables).toHaveLength(45);
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

    expect(tables).toHaveLength(72);
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
 * 골뱅이는 해부보고서 5판(표준 틀 15절)으로 바뀌어 여덟 단계에 접는다(2026-10-13).
 * 참치 양식은 해부보고서 「한국 시장의 양식 참다랑어」(표준 틀 15절)로 바뀌어 1절=1단계이고 손 작성 단계가 없다.
 */
const BODY = (n: number) => Array.from({ length: n }, (_, i) => `s${String(i + 1).padStart(2, '0')}`);
const THREE: Array<{
  key: string; 이름: string; sections: number; tables: number; briefing: number;
  stages: string[]; groups: Record<string, string[]>;
  narratives: StageNarrative[]; hand: Array<{ key: string }>; brief: BriefingPoint[]; hero: HeroKpi[];
}> = [
  {
    key: 'mackerel', 이름: '고등어', sections: 15, tables: 50, briefing: 15,
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
    key: 'whelk', 이름: '골뱅이', sections: 15, tables: 25, briefing: 15,
    stages: ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 'x01'],
    groups: { s01: ['s01', 's02'], s03: ['s05', 's07'], s05: ['s08', 's09', 's10', 's11'], x01: ['s14', 's15'] },
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
    // 골뱅이 5판은 요약 절에 지표 묶음 1개(타일 4)가 있다.
    expect(figures).toHaveLength(c.key === 'whelk' ? 1 : 0);
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

  it('오징어 그림 14개가 화면 흐름에 오른다(다른 넷과 고등어·참치 양식은 원문에 그림이 없다, 골뱅이는 지표 묶음 1)', () => {
    expect(reportFigures('squid')).toHaveLength(14);
    for (const key of ['pollock', 'octopus', 'shrimp', 'tuna', 'mackerel', 'tunafarm']) expect(reportFigures(key)).toEqual([]);
    expect(reportFigures('whelk')).toHaveLength(1);
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

describe('New England Seafood International(NESI) 보고서 서술 추출 (ⅬⅩⅢ)', () => {
  const secs = reportProse('nesi');

  it('보고서 절이 하나도 빠지지 않고 번호가 이어진다', () => {
    expect(secs.length).toBeGreaterThanOrEqual(16);
    expect(secs.map((s) => s.numeral)).toEqual(
      secs.map((_, i) => String(i + 1).padStart(2, '0')),
    );
    for (const s of secs) {
      expect(proseForStage('nesi', s.stage).length, `${s.stage} 매핑`).toBeGreaterThan(0);
    }
  });

  // 정본 ~/tunawork/nesi/build/killed.py (반증에서 폐기한 표현) 를 그대로 옮겼다.
  // 발행본 검사와 같이 「」 인용은 지우고 본다 — 반박 인용은 통과.
  const KILLED: [string, string][] = [
    ["NESI(는|가|은)[^<。.]{0,15}참치 (회사|기업|전문 회사|전문 기업)(다|이다|로 (볼|읽)(?! 근거))(?![^<。.]{0,12}(아니|않|없))", "축: 물량은 백색어, 특허·브랜드는 참치 해동(메인 §1)"],
    ["NESI(는|가|은)[^<。.]{0,15}백색어 (회사|기업|전문 회사|가공사)(다|이다)(?![^<。.]{0,12}(아니|않|없))", "「백색어 회사」 단정도 반증됨(메인 §1)"],
    ["(영국|英)[^<。.]{0,6}(최대|최고|1위|선도)[^<。.]{0,12}(횟감|슈퍼프로즌|초저온|사시미)[^<。.]{0,10}(참치 )?수입(사|업체|회사)(다|이다|로 꼽힌다|를 차지)(?![^<。.]{0,20}(자칭|회사 (서술|문구|표현)|보도 문구|근거(는|가) 없|기준))", "「영국 최대 횟감 참치 수입사」는 자칭 C(메인 §3)"],
    ["백색어(에서|에)만[^<。.]{0,15}(market leading|시장 선도|선도 공급)", "원문은 「also market leading」(N+ 2)"],
    ["참치[^<。.]{0,10}(매출|비중|몫)[^<。.]{0,8}(대부분|절반|과반)(을|이)? ?(차지한다|이다|다)(?![^<。.]{0,12}(아니|없|않))", "참치 매출 비중 비공시, 상한 17,6 %는 계산(N+ 1)"],
    ["(双日|Sojitz)[^<。.]{0,25}NESI[^<。.]{0,10}100\\s*%(를|을)? ?(인수|취득|보유|소유|가졌|가진)(?![^<。.]{0,15}(아니|않|없))", "双日 = SFIH 100 %, NESI = 94,6 %(메인 §2)"],
    ["NESI[^<。.]{0,10}(지분 )?100\\s*%(를|을)? ?(인수|취득|보유|소유)(했|한다|하게)(?![^<。.]{0,15}(아니|않|없))", "NESI 94,6 %(메인 §2)"],
    ["(62[.,]4|62[.,]368)[^<。.]{0,25}(인수가|인수 대가|매수가|에 (인수|샀|사들))(?![^<。.]{0,8}(가 아니|는 아니|이 아니|로 볼|라는 문서))", "SH01은 신주 납입이지 인수가 아님(메인 §3)"],
    ["(£\\s?270\\s?m|270\\s?m\\s?파운드|\\$\\s?360\\s?m|3억 6천만 달러)[^<。.]{0,10}(에|으로) ?(인수|사들|샀)", "매출 표기이지 인수가 아님(B절)"],
    ["(77\\s?k|£77)[^<。.]{0,25}조건부 대가[^<。.]{0,10}(정산|조정)(이다|이었다|때문)", "£81.568k·£81.491k 차이 원인 문서 없음(N+ 28)"],
    ["2013[^<。.]{0,30}(경영진|최고경영자|CEO|회사)[^<。.]{0,20}한국 (원양 )?(선박|어선|연승선)", "2013 문장은 기자 서술, 한국 가공장(N+ 6)"],
    ["(2013|두 문서|두 출처)[^<。.]{0,40}(모두|함께|둘 다)[^<。.]{0,15}한국 (원양 )?연승선(을|으로) 가리킨다", "2013 = 가공장(B), 2025 = 연승선 1척(A)(N+ 6)"],
    ["NESI(는|가)[^<。.]{0,25}한국 (원양 )?(선박|어선|연승선|선사)(에서|으로부터|에게서)[^<。.]{0,15}(산다|사들인다|조달한다|매입한다|공급받는다)(?![는고며][^<。.]{0,8}(근거|문서))(?![^<。.]{0,12}(않|없|아니))", "회사 성명·HRIA 이상 일반화 금지(메인 §3)"],
    ["한국 (공장|가공장)에서[^<。.]{0,15}로인[^<。.]{0,15}(가공한다|가공하고 있다|만든다)(?![고는])", "2013 기자 서술, 현재형 금지(메인 §3)"],
    ["(121[.,]2\\s?t|121[.,]237\\s?kg|관세청 (기록|통계))[^<。.]{0,30}NESI(의|가)? ?(물량|수입분|몫|구매)(이다|다|로 (보인다|확인된다))(?![^<。.]{0,10}(아니|없|않))", "수입자 미상(F절)"],
    ["(관세청|Comtrade)[^<。.]{0,15}(와|과)[^<。.]{0,10}(Comtrade|관세청)[^<。.]{0,15}(두|2) (출처|자료)[^<。.]{0,10}(확인|뒷받침)", "같은 원자료(N+ 7)"],
    ["신라교역[^<。.]{0,25}NESI[^<。.]{0,10}(에|로)[^<。.]{0,10}(공급한다|공급했다|판다|팔았다|수출한다)(?![^<。.]{0,12}(근거|문서|않|없))", "거래 근거 0(N+ 36)"],
    ["(DART|사업보고서)[^<。.]{0,30}(없으니|없으므로|없어서)[^<。.]{0,20}거래(가|는)? ?없", "익명 처리 ≠ 거래 없음(F절)"],
    ["(2021|2022)[^<。.]{0,40}한국[^<。.]{0,20}원산(지|)[^<。.]{0,10}(이다|물량이다|으로 잡혔다|으로 집계됐다)(?![^<。.]{0,20}(가설|기준일 때|라면|아니))", "발송국 기준(N+ 5)"],
    ["프랑스[^<。.]{0,30}(해동|해동분|해동된)[^<。.]{0,25}(영국으로|되돌아|재수출)[^<。.]{0,10}(온다|들어온다|돌아온다)(?![^<。.]{0,15}(근거|문서|않|없))", "근거 없음(N+ 8)"],
    ["(프랑스|France)[^<。.]{0,15}(몫|물량|발송분)[^<。.]{0,10}한국산 (로인|참치)(이다|다)", "발송국 기준, 원산 미판정(N+ 8)"],
    ["Leap[^<。.]{0,25}(전부|모두|전량)[^<。.]{0,6}태평양(산|에서)", "Leap 황다랑어 현재 페이지 「Pacific and Indian Oceans」(N+ 4)"],
    ["Leap[^<。.]{0,10}(전|모든) (SKU|상품|제품)[^<。.]{0,10}MSC", "「Ocado에서 본 Leap 4 SKU」로 한정(N+ 16)"],
    ["MSC-C-50287[^<。.]{0,25}(NESI|회사) (명의|보유)[^<。.]{0,6}(확인|이다)(?![^<。.]{0,10}(않|없))", "라벨 코드만, 원장 대조 없음(N+ 16)"],
    ["Fish Said Fred[^<。.]{0,25}참치[^<。.]{0,15}(간편식|상품|제품)(을|이|도)? ?(판다|있다|포함한다|들어 있다)(?![^<。.]{0,15}(고 (적|썼)|라는|는 (보도|서술)))", "브랜드 피드 참치 0(N+ 31)"],
    ["(M&S|막스 ?앤 ?스펜서)[^<。.]{0,25}참치[^<。.]{0,15}(납품|공급)(한다|했다|하고 있다)(?![^<。.]{0,15}(근거|문서|않|없))", "M&S 참치 근거 0(메인 §3)"],
    ["(Tesco Finest|Waitrose No\\.?\\s?1|M&S)[^<。.]{0,40}NESI(가|이)? ?(만든다|제조한다|포장한다|공급한다)(?![^<。.]{0,20}(는 (표기|근거|문서)|않|없|추정))", "PB 포장자 미표기(K절)"],
    ["참치(로|에) (이어지는|들어간|간) 돈[^<。.]{0,25}(하나뿐|하나다|뿐이다)", "PPA 특허 £10.105k 누락(N+ 3)"],
    ["(PPA|무형자산|Developed technology|특허 기술)[^<。.]{0,30}(참치 해동 특허|해동 특허)(다|이다|와 같다)(?![^<。.]{0,20}(추정|로 보인다|아니|문서))", "기술명 미기재, 추정 C(D절)"],
    ["(초저온|냉동) ?(창고|냉동창고)[^<。.]{0,20}참치 (전용|보관용)(이다|다|으로 지었다)(?![^<。.]{0,15}(추정|아니|근거))", "참치 용도는 추정(D절)"],
    ["(초저온|냉동) ?(창고|냉동창고)[^<。.]{0,20}금액(은|이)? ?(공시되지 않|공개되지 않|밝히지 않)", "SFIH 2025 c£2,1m(N+ 26)"],
    ["Grimsby[^<。.]{0,25}참치 (라인|가공 라인|공장)(을|이)? ?(갖|둔다|있다|운영)(?![^<。.]{0,12}(근거|문서|않|없))", "Grimsby는 백색어(G절)"],
    ["NESI USA[^<。.]{0,15}NESI(의)? (자회사|아래)(다|이다|에 있다)", "SFIH 직속(H절)"],
    ["(双日|Sojitz|지배사)[^<。.]{0,20}명의[^<。.]{0,15}(선박|어선)[^<。.]{0,6}(0척|없다)", "SOJITZ 미검색(N+ 10)"],
    ["(?:^|[<。.])(?:(?!등록부|Modern Slavery|현대노예|성명|We do not)[^<。.])*?(자사|자기) (선단|어선)[^<。.]{0,6}(0척|없다|없고)(?:(?!등록부|성명)[^<。.])*(?=[<。.]|$)", "0척은 MSA 성명 또는 등록부 범위와 함께(N+ 10)"],
    ["HSE[^<。.]{0,20}(기록|통지|기소|처분)(은|이)? ?(없다|0건|없었다)", "HSE 조회되지 않음(N+ 35)"],
    ["(리콜|식품 경보)(은|이)? ?(이력이 )?(없다|한 건도 없|0건이다)(?![^<。.]{0,5}(는|고))", "「NESI·자사 브랜드 이름으로 된 경보 0건」으로 한정(N+ 11)"],
    ["Find Case Law[^<。.]{0,40}Princes", "대조군 Princes 폐기(N+ 12)"],
    ["강제노동(은|이)? ?(없다|없었다|확인되지 않았다)|IUU(와|에)? ?(무관|관련이 없)", "체계 조회 아님(J절)"],
    ["HRIA[^<。.]{0,30}(강제노동|위반)[^<。.]{0,10}(확인됐|드러났|발견됐|없었|없다)", "HRIA 결과 비공개(F절)"],
    ["옵서버[^<。.]{0,20}100\\s*%[^<。.]{0,12}(달성했|달성됐|이뤘|채웠)", "달성 여부 공개 없음(J절)"],
    ["ISSF[^<。.]{0,30}(뒤처|미흡|부족하다)", "모집단이 다름(J절)"],
    ["(?:^|<|다\\. )(?:(?!477|<|다\\. ).)*?보조금(?:(?!477|<|다\\. ).)*?(?<![\\d.,])447(?![\\d])(?:(?!477|<|다\\. ).)*", "2024 보조금 477/447 병기 — 한 문장에 둘 다(N+ 13)"],
    ["(원상복구|복구) 충당금[^<。.]{0,20}(잔액|규모)[^<。.]{0,10}(414|1[.,]765)", "그해 추가 계상액, 잔액은 2.298·1.801(N+ 18)"],
    ["(5[.,]619|6[.,]619)[^<。.]{0,5}(~|와|·|/)[^<。.]{0,3}(6[.,]619|5[.,]619)|(?<![\\d.,])6[.,]619", "SFIH 2023 지배 손실 (5.619) 확정(N+ 14)"],
    ["181[.,]532", "2021 매출 OCR 오독, 151.532(N+ 39)"],
    ["(재고|inventory)[^<。.]{0,15}(전체|총)[^<。.]{0,10}40[.,]5", "40.527은 원재료·판매상품, 전체 41.227(N+ 21)"],
    ["29[.,]217[.,]55(?![^<。.]{0,60}28[.,]017)", "판결문 총액 £28.017,55 병기(N+ 17)"],
    ["(Joii)[^<。.]{0,40}(같은 법인|동일 법인|그 법인이 (이어|남아))", "구·신 Joii 다른 법인(N+ 19)"],
    ["(옛|구) Joii[^<。.]{0,30}(휴면|Dormant)", "휴면은 신 Joii(12328440)(N+ 19)"],
    ["일본 (종합)?상사[^<。.]{0,30}(캔|통조림)에서[^<。.]{0,15}냉장[^<。.]{0,10}(으로 )?(옮겼|갈아탔|이동했)", "다른 두 회사의 사실(M절)"],
    ["Princes[^<。.]{0,30}(£\\s?700|7억 ?파운드|700\\s?m)", "Princes 매각 금액 원문 미저장(O)"],
    ["Stroyan|Crawford|Ropner|Aherne?\\b|Cassiano|Hiraiwa|HIRAIWA|Saito|SAITO|Aviles|AVILES|Eaton\\b|Rasmussen|Rorem|Downes|Faulkner|Imray|Holmyard|Adkin|Chaplin|Elkins|Hilleary|McCormick|McVittie|Swatman|平岩|齋藤|斎藤", "개인 실명 금지(규약 §1)"],
  ];

  it('반증에서 기각한 주장이 서술과 카드에 없다', () => {
    const card = COMPANY_CARDS.find((c) => c.key === 'nesi');
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

describe('Parlevliet & Van der Plas(PP Group) 보고서 서술 추출 (ⅬⅩⅣ)', () => {
  const secs = reportProse('ppgroup');

  it('보고서 절이 하나도 빠지지 않고 번호가 이어진다', () => {
    expect(secs.length).toBeGreaterThanOrEqual(16);
    expect(secs.map((s) => s.numeral)).toEqual(
      secs.map((_, i) => String(i + 1).padStart(2, '0')),
    );
    for (const s of secs) {
      expect(proseForStage('ppgroup', s.stage).length, `${s.stage} 매핑`).toBeGreaterThan(0);
    }
  });

  // 정본 ~/tunawork/ppgroup/build/killed.py (기준선 §3 「쓰지 않는 문장」) 를 그대로 옮겼다.
  // 발행본 검사와 같이 「」 인용은 지우고 본다 — 반박 인용은 통과.
  const KILLED: [string, string][] = [
    ["(PP|Parlevliet[^<。.]{0,20}|그룹)(은|는|이|가)[^<。.]{0,15}참치 (회사|기업|그룹)(다|이다|로 (볼|읽))(?![^<。.]{0,15}(아니|않|없|서지))", "「참치 회사」 반증(기준선 §1)"],
    ["참치(가|는)[^<。.]{0,10}(그룹의 )?(핵심|주력)(이다|사업이다)(?![^<。.]{0,12}(아니|않|없))", "참치 몫 7~17 %(기준선 §1)"],
    ["(?<![\\d,.])19\\s?\\s?%[^<。.]{0,20}참치|참치[^<。.]{0,25}(15\\s?~\\s?19|최대 19)", "19 %는 CCO 개별 매출 기반, 폐기(렌즈A #1)"],
    ["CFTO[^<。.]{0,20}(13척|열세 척)[^<。.]{0,10}(을|를)? ?(소유|보유)(한다|했다|하고)", "운영 13 · 등록 소유 확인 8(Codex·렌즈A #9)"],
    ["(자가|자사) 소유 13척", "운영 13척(Codex)"],
    ["빚을 (지고|진 뒤|진 직후)[^<。.]{0,30}(택했|골랐|선택했|계열화했)(?![^<。.]{0,20}(않|없|아니|읽지))", "주주간 약정 이행 가능성(렌즈A #5)"],
    ["(PP|Parlevliet|그룹)(은|는|이|가)[^<。.]{0,30}원료 (안정|확보)(을|를)? (위해|목적으로)[^<。.]{0,15}(샀|인수|매수)(?![^<。.]{0,20}(아니|않|없|해설|Atuna))", "「원료 안정」은 Atuna 해설(렌즈A #3·#4)"],
    ["(그룹|PP|회사)(이|가|은|는)[^<。.]{0,20}(312[.,]5|€\\s?312)[^<。.]{0,15}(빌렸|차입했|졌다|떠안)", "차주 법인 미상(렌즈A #7)"],
    ["(결산|연차보고서|jaarrekening)[^<。.]{0,30}25\\s?\\s?%[^<。.]{0,20}(공시|실렸|적었)(?![^<。.]{0,15}(않|없|아니))", "25 % 전망 출처 미기재(렌즈A #6)"],
    ["2023[^<。.]{0,25}(€\\s?48\\s?m|48m|4800만)", "€48m은 2022 회계연도(기준선 §2)"],
    ["TOG[^<。.]{0,10}개별[^<。.]{0,20}123[.,]4", "TOG €123,4m은 연결(Codex)"],
    ["(TOG|공장)[^<。.]{0,20}(3곳|세 곳)[^<。.]{0,10}(가동|운영)(?![^<。.]{0,20}(않|없|아니|가리))", "법인 2곳, 옛 PFCI 가동 미해소(Codex)"],
    ["C188[^<。.]{0,40}(발효|효력)[^<。.]{0,15}(2015|2019)", "2015·2019는 비준일(Codex)"],
    ["35[.,]000\\s?(t|톤)", "로인 ATQ 35.000 t 원문 미보존(Codex)"],
    ["73[.,]011|110[.,]000\\s?(t|톤)", "ICCAT 24-01 수치 원문 미보존(Codex)"],
    ["(수입식품|해외제조업소)[^<。.]{0,30}(TOG|SCODI|PFOI|PP)[^<。.]{0,20}(없다|0건)(?![^<。.]{0,10}(는|고))", "식약처 부재 근거 미성립(기준선 §2)"],
    ["(프랑스 캔참치|프랑스 시장)[^<。.]{0,20}(약 )?25\\s?\\s?%(?![^<。.]{0,40}(2011|자칭|C))", "2011 FFA 주장(C)"],
    ["Annie Hillina[^<。.]{0,40}2025[^<。.]{0,15}(투자|결산)", "투자 시점 미기재(렌즈A #15)"],
    ["Ton Frissen|Frissen|Pierre-Alain|Carré|Nico Parlevliet|Mohamad Khachab|Adrien de Chomereau", "등기 임원 외 실명 금지(렌즈A #8)"],
    ["Diek Parlevliet[^<。.]{0,20}등기", "Diek = Diederik 등기 동일성 미확인(렌즈A #13)"],
  ];

  it('반증에서 기각한 주장이 서술과 카드에 없다', () => {
    const card = COMPANY_CARDS.find((c) => c.key === 'ppgroup');
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

  it('카드의 참치 몫은 가정과 함께, 선단은 「운영」으로 적는다', () => {
    const card = COMPANY_CARDS.find((c) => c.key === 'ppgroup')!;
    const share = card.stats.find((s) => s.label === '참치 몫')!.value;
    for (const k of ['지분법 가정', '비례연결', 'pro-forma', '계산']) expect(share).toContain(k);
    expect(card.stats.find((s) => s.label === '선단')!.value).toMatch(/^운영 13척/);
  });

  it('카드 tagline·stats 문구는 발행본 표지 문구 그대로다', () => {
    const card = COMPANY_CARDS.find((c) => c.key === 'ppgroup')!;
    const html = readFileSync(join(process.cwd(), 'docs/evidence/company-ppgroup-2026-10/보고서.html'), 'utf8');
    const txt = html.replace(/<[^>]+>/g, '').replace(/&#8239;|\u202f/g, ' ').replace(/&amp;/g, '&');
    for (const p of [card.tagline, ...card.stats.flatMap((s) => s.value.split(' — '))]) {
      expect(txt.includes(p), p.slice(0, 60)).toBe(true);
    }
  });
});

describe('Atunsa 보고서 서술 추출 (ⅬⅩⅤ)', () => {
  const secs = reportProse('atunsa');

  it('보고서 16절이 번호대로 이어지고 두 절씩 8단계에 붙는다', () => {
    expect(secs).toHaveLength(16);
    expect(secs.map((s) => s.numeral)).toEqual(
      secs.map((_, i) => String(i + 1).padStart(2, '0')),
    );
    expect(secs.map((s) => s.stage)).toEqual(
      secs.map((_, i) => `c${String(Math.floor(i / 2) + 1).padStart(2, '0')}`),
    );
    for (const s of secs) {
      expect(proseForStage('atunsa', s.stage).length, `${s.stage} 매핑`).toBeGreaterThan(0);
    }
  });

  // 정본 ~/tunawork/atunsa/build/killed.py 전량. PP Group과 같이 반박 인용 「」는 지우고 본다.
  const KILLED: [string, string][] = [
    ["(채무|부채) 감면[^<。.]{0,20}(이|가)? ?(인수 )?(대가|값)(이다|였다|로 (치렀|지불))(?![^<。.]{0,15}(아니|않|없))", "「감면=대가」 기각(기준선 §1)"],
    ["(Atunsa|매수인)[^<。.]{0,20}Pevasa[^<。.]{0,10}(의 )?(자산|선박)(을|를) (샀|매입했|인수했)", "주식 인수(BORME)"],
    ["Draco[^<。.]{0,20}Atunsa[^<。.]{0,10}(소유|선박|선단)(?![^<。.]{0,15}(아니|않|없))", "Draco는 Albacora 계열(렌즈A)"],
    ["인도양[^<。.]{0,15}선망[^<。.]{0,5}9척", "선망 8척, Altarri는 보급선(Codex)"],
    ["Bakio[^<。.]{0,30}(1991|2011)\\s?년? ?건조", "ICCAT 건조 1990(Codex)"],
    ["Artza[^<。.]{0,20}112\\s?m(?![^<。.]{0,40}(보도|Faro|기사))", "IOTC 94,79 m(Codex)"],
    ["inactive[^<。.]{0,20}(허가 없|무허가|허가가 없)", "정의 없음(기준선 §2)"],
    ["Beach Fishing(은|는|이|가| Ltd(는|가))[^<。.,]{0,10}벨리즈|Sea Breeze[^<。.,]{0,25}(은|는|이|가) ?세이셸", "관할 뒤바뀜(GLEIF)"],
    ["Sea Breeze[^<。.]{0,20}Beach Fishing[^<。.]{0,10}(의 )?자회사", "직접 모회사 Pevasa(GLEIF)"],
    ["133\\s?m|€\\s?133", "두 회사 재무 합산 금지"],
    ["(합산|합친)[^<。.]{0,15}(손익|이익|손실)[^<。.]{0,10}−?€?\\s?10", "합산 손익 금지(Codex)"],
    ["주주 승인(을|이)? ?(못|얻지 못|받지 못)", "1차 근거 없음(기준선 §2)"],
    ["ZVB[^<。.]{0,20}Pevasa[^<。.]{0,10}3척|Pevasa[^<。.]{0,20}ZVB[^<。.]{0,10}3척", "10월 목록 4척(Codex)"],
    ["507\\s?t|73[.,]000\\s?t|110[.,]000\\s?t", "원문 미보존(Codex)"],
    ["범주 A|Res(olution)? 26/01", "결의 원문 미확보(렌즈A)"],
    ["Atunsa[^<。.]{0,20}한국(에|으로|시장에)[^<。.]{0,10}(판다|수출한다|판매한다)(?![^<。.]{0,15}(않|없|아니))", "판매처 미상(렌즈A)"],
    ["Lekeitio|50세", "Egaluze 선원 식별 정보 금지(렌즈A)"],
  ];

  it('반증에서 기각한 주장이 서술과 카드에 없다', () => {
    const card = COMPANY_CARDS.find((c) => c.key === 'atunsa');
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

  it('카드 tagline·stats 문구는 본문이 아닌 발행본 표지에서 그대로 가져온다', () => {
    const card = COMPANY_CARDS.find((c) => c.key === 'atunsa')!;
    const html = readFileSync(join(process.cwd(), 'docs/evidence/company-atunsa-2026-10/보고서.html'), 'utf8');
    const cover = html.match(/<header class="cover">[\s\S]*?<\/header>/)?.[0];
    expect(cover).toBeTruthy();
    const txt = cover!.replace(/<[^>]+>/g, '').replace(/&#8239;|\u202f/g, ' ').replace(/&amp;/g, '&');
    expect(card.numeral).toBe('ⅬⅩⅤ');
    expect(card.tagline).toBe('스페인 승인 목록에 육상 가공·저장 시설이 등재되지 않은 가족 선사의 주식 인수');
    for (const p of [card.tagline, ...card.stats.flatMap((s) => s.value.split(' — '))]) {
      expect(txt.includes(p), p.slice(0, 60)).toBe(true);
    }
    expect(card.stats.find((s) => s.label === '매매일')!.value).toContain('Faro de Vigo 보도, B');
    expect(card.stats.find((s) => s.label === '선단')!.value).toBe('30.701 GT — 선망선 12척의 총톤수. 보급선은 제외한다.');
  });
});

describe('APS Alimentos Prosalud 보고서 서술 추출 (ⅬⅩⅥ)', () => {
  const secs = reportProse('aps');

  it('보고서 16절이 번호대로 이어지고 두 절씩 8단계에 붙는다', () => {
    expect(secs).toHaveLength(16);
    expect(secs.map((s) => s.numeral)).toEqual(
      secs.map((_, i) => String(i + 1).padStart(2, '0')),
    );
    expect(secs.map((s) => s.stage)).toEqual(
      secs.map((_, i) => `c${String(Math.floor(i / 2) + 1).padStart(2, '0')}`),
    );
    for (const s of secs) {
      expect(proseForStage('aps', s.stage).length, `${s.stage} 매핑`).toBeGreaterThan(0);
    }
  });

  // 정본 ~/tunawork/aps/build/killed.py 전량. PP Group과 같이 반박 인용 「」는 지우고 본다.
  const KILLED: [string, string][] = [
    ["DRAGON III[^<。.]{0,40}(APS|Prosalud|Sardimar)[^<。.]{0,15}(소유|선박|선단)(?![^<。.]{0,20}(아니|않|없|근거))", "DRAGON III 는 선주 주소 언급뿐(기준선)"],
    ["(신공장|새 공장)[^<。.]{0,30}(가동|준공|완공)(했|한다|됐|되었)(?![^<。.]{0,15}(않|없|아니|계획))", "신공장은 설계 발표 단계(기준선)"],
    ["(매출|이익)[^<。.]{0,20}50\\s?(&#8239;)?\\s?%[^<。.]{0,20}(달성했|늘었|증가했)", "+50 % 는 목표(C)"],
    ["(동태평양|자체 선단)[^<。.]{0,20}(에서 )?(전량|모두)[^<。.]{0,10}(조달|잡)", "조달 구조 미확인(기준선)"],
  ];

  it('반증에서 기각한 주장이 서술과 카드에 없다', () => {
    const card = COMPANY_CARDS.find((c) => c.key === 'aps');
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

  it('카드 tagline·stats 문구는 발행본 표지에서 그대로 가져온다', () => {
    const card = COMPANY_CARDS.find((c) => c.key === 'aps')!;
    const html = readFileSync(join(process.cwd(), 'docs/evidence/company-aps-2026-10/보고서.html'), 'utf8');
    const cover = html.match(/<header class="cover">[\s\S]*?<\/header>/)?.[0];
    expect(cover).toBeTruthy();
    const txt = cover!.replace(/<[^>]+>/g, '').replace(/&#8239;|\u202f/g, ' ').replace(/&amp;/g, '&');
    expect(card.numeral).toBe('ⅬⅩⅥ');
    expect(card.country).toBe('코스타리카 · 푼타레나스');
    expect(card.tagline).toBe('푼타레나스의 참치 가공 기반, 펫푸드 진출과 회사의 성장 목표');
    for (const p of [card.tagline, ...card.stats.flatMap((s) => s.value.split(' — '))]) {
      expect(txt.includes(p), p.slice(0, 60)).toBe(true);
    }
    expect(card.stats.find((s) => s.label === '가공 개시')!.value).toContain('설립등기 확인값과 구분한다');
    expect(card.stats.find((s) => s.label === '성장 목표')!.value).toContain('회사 매출 성장 목표');
    expect(card.stats.find((s) => s.label === 'PET 투자')!.value).toContain('새 공장 설계 예산과 구분한다');
  });
});

describe('Chancerelle · La Belle-Îloise · Gonidec 보고서 서술 추출 (ⅬⅩⅦ)', () => {
  const secs = reportProse('chancerelle');

  it('보고서 16절이 번호대로 이어지고 두 절씩 8단계에 붙는다', () => {
    expect(secs).toHaveLength(16);
    expect(secs.map((s) => s.numeral)).toEqual(
      secs.map((_, i) => String(i + 1).padStart(2, '0')),
    );
    expect(secs.map((s) => s.stage)).toEqual(
      secs.map((_, i) => `c${String(Math.floor(i / 2) + 1).padStart(2, '0')}`),
    );
    for (const s of secs) {
      expect(proseForStage('chancerelle', s.stage).length, `${s.stage} 매핑`).toBeGreaterThan(0);
    }
  });

  // 정본 ~/tunawork/chancerelle/build/killed.py 전량: 2026-10-13 확인값은 빈 목록이다.
  // PP Group과 같이 반박 인용 「」는 지우고 본다. 금칙을 임의로 만들어 넣지 않는다.
  const KILLED: [string, string][] = [];

  it('반증에서 기각한 주장이 서술과 카드에 없다', () => {
    const card = COMPANY_CARDS.find((c) => c.key === 'chancerelle');
    expect(card).toBeTruthy();
    expect(KILLED).toHaveLength(0);
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

  it('카드 tagline·stats 문구는 발행본 표지에서 그대로 가져온다', () => {
    const card = COMPANY_CARDS.find((c) => c.key === 'chancerelle')!;
    const html = readFileSync(join(process.cwd(), 'docs/evidence/company-chancerelle-2026-10/보고서.html'), 'utf8');
    const cover = html.match(/<header class="cover">[\s\S]*?<\/header>/)?.[0];
    expect(cover).toBeTruthy();
    const txt = cover!.replace(/<[^>]+>/g, '').replace(/&#8239;|\u202f/g, ' ').replace(/&amp;/g, '&');
    expect(card.numeral).toBe('ⅬⅩⅦ');
    expect(card.country).toBe('프랑스 · 브르타뉴 두아르느네');
    expect(card.flagSrc).toBe('/flags/fr.svg');
    expect(card.tagline).toBe('프랑스 제조 기반을 가진 세 통조림사의 사업 구조와 참치 매출의 분모');
    for (const p of [card.tagline, ...card.stats.flatMap((s) => s.value.split(' — '))]) {
      expect(txt.includes(p), p.slice(0, 60)).toBe(true);
    }
    expect(card.stats.find((s) => s.label === '출발 연도')!.value).toContain('현재 운영법인의 생성일과 구분한다');
    expect(card.stats.find((s) => s.label === '매출')!.value).toContain('법정 연결 범위는 현재 자료에서 확인되지 않는다');
    expect(card.stats.find((s) => s.label === '어류 구매')!.value).toContain('참치 구매량과 구분한다');
  });
});

describe('Jadran Tuna 보고서 서술 추출 (ⅬⅩⅧ)', () => {
  const secs = reportProse('jadran');

  it('보고서 16절이 번호대로 이어지고 두 절씩 8단계에 붙는다', () => {
    expect(secs).toHaveLength(16);
    expect(secs.map((s) => s.numeral)).toEqual(
      secs.map((_, i) => String(i + 1).padStart(2, '0')),
    );
    expect(secs.map((s) => s.stage)).toEqual(
      secs.map((_, i) => `c${String(Math.floor(i / 2) + 1).padStart(2, '0')}`),
    );
    for (const s of secs) {
      expect(proseForStage('jadran', s.stage).length, `${s.stage} 매핑`).toBeGreaterThan(0);
    }
  });

  // 정본 /Users/idong-geon/tunawork/jadran/build/killed.py 전량: 2026-10-13 확인값 [].
  // Chancerelle·PP Group과 같이 반박 인용 「」는 지우고 본다.
  const KILLED: [string, string][] = [];

  it('반증에서 기각한 주장이 서술과 카드에 없다', () => {
    const card = COMPANY_CARDS.find((c) => c.key === 'jadran');
    expect(card).toBeTruthy();
    expect(KILLED).toHaveLength(0);
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

  it('카드 tagline·stats 문구는 발행본 표지에서 그대로 가져온다', () => {
    const card = COMPANY_CARDS.find((c) => c.key === 'jadran')!;
    const html = readFileSync(join(process.cwd(), 'docs/evidence/company-jadran-2026-10/보고서.html'), 'utf8');
    const cover = html.match(/<header class="cover">[\s\S]*?<\/header>/)?.[0];
    expect(cover).toBeTruthy();
    const txt = cover!.replace(/<[^>]+>/g, '').replace(/&#8239;|\u202f/g, ' ').replace(/&amp;/g, '&');
    expect(card.numeral).toBe('ⅬⅩⅧ');
    expect(card.country).toBe('크로아티아 · 달마티아 칼리');
    expect(card.flagSrc).toBe('/flags/hr.svg');
    expect(card.tagline).toBe('Gira의 야생 참다랑어 축양과 일본 횟감 시장, 면허 허용량·시장출하 배정·야생 입식 상한');
    for (const p of [card.tagline, ...card.stats.flatMap((s) => s.value.split(' — '))]) {
      expect(txt.includes(p), p.slice(0, 60)).toBe(true);
    }
    expect(card.stats.map((s) => s.value.split(' — ')[0])).toEqual(['1.500 톤', '1.893,042 톤', '707,969 톤']);
    expect(card.stats[0].value).toContain('실제 생산량과 구분한다');
    expect(card.stats[1].value).toContain('현재 재고·실제 출하량이 아니다');
    expect(card.stats[2].value).toContain('실제 어획량·입식량이 아니다');
  });

  it('핵심 JSON 수치와 근거 문구가 표지 타일과 일치한다', () => {
    const data = JSON.parse(readFileSync(join(process.cwd(), 'public/data/companies/jadran_v1.json'), 'utf8'));
    expect(data.stats).toEqual({
      면허허용연간양식량_t: 1500,
      시장출하배정_2026_t: 1893.042,
      야생입식상한_2026_t: 707.969,
      후속확대신청목표량_t년: 2000,
      직접법인사원_개: 4,
      Gira등록면적합_m2: 200000,
      순이익_2025_EUR: 65317,
      근로시간기준인원_2025_명: 112,
    });
    const html = readFileSync(join(process.cwd(), 'docs/evidence/company-jadran-2026-10/보고서.html'), 'utf8');
    const cover = html.match(/<header class="cover">[\s\S]*?<\/header>/)?.[0];
    expect(cover).toBeTruthy();
    const txt = cover!.replace(/<[^>]+>/g, '').replace(/&#8239;|\u202f/g, ' ').replace(/&amp;/g, '&');
    for (const value of ['1.500 톤', '1.893,042 톤', '707,969 톤', '2.000 톤/년', '4개', '200.000 m²', '€65.317', '112명', ...data.sourcenotes]) {
      expect(txt.includes(value), value).toBe(true);
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
