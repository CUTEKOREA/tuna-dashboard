import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SquidDashboard from '../components/SquidDashboard';
import { SECTION_META } from '../components/squid/SquidSection';
import { getSquidV5 } from '../lib/data/squid-v5';
import {
  squidFieldLabel,
  squidFrequencyLabel,
  squidPublisherLabel,
  squidValueLabel,
} from '../components/squid/localization';

/**
 * 화면 표기가 한글인지 지킨다.
 *
 * 본문 전체에서 라틴 문자를 금지하지는 않는다. 번역 규칙이 학명·기관 약칭·법령명을
 * 괄호로 병기하도록 요구하고("남태평양지역수산관리기구(SPRFMO)"), 원문의 항목 기호
 * "a) b) c)" 도 그대로 옮기게 하기 때문이다. 그래서 검사 대상은 **우리가 쓰는 UI 문구**
 * — 섹션명·필드명·출처 표기 — 로 한정한다. 원문에서 온 문장은 번역 여부만 따로 본다.
 */

function latinTokens(text: string): string[] {
  return Array.from(new Set(text.match(/[A-Za-z]+/g) ?? [])).sort();
}

/** 괄호 안 원문 병기는 허용된 표기다. 벗겨내고 남은 라틴 문자만 문제 삼는다. */
function latinOutsideParens(text: string): string[] {
  return latinTokens(text.replace(/[([][^)\]]*[)\]]/g, ' '));
}

describe('오징어 화면 한글 표기', () => {
  it('섹션 이름과 설명은 한글로만 쓴다', () => {
    const chrome = Object.values(SECTION_META)
      .flatMap((m) => [m.orderLabel, m.label, m.desc])
      .join(' ');
    expect(latinOutsideParens(chrome)).toEqual([]);
  });

  it('화면에 실제로 그려지는 표 머리글은 한글이다', () => {
    // JSON 의 모든 키를 검사하지 않는다. 대부분은 섹션별 전용 차트가 소비하고
    // 화면에 이름이 드러나지 않는다. 실제로 <th> 로 나오는 것만 문제 삼는다.
    const markup = renderToStaticMarkup(React.createElement(SquidDashboard));
    const headers = Array.from(markup.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g))
      .map((m) => m[1].replace(/<[^>]+>/g, ' ').trim())
      .filter(Boolean);
    const offenders = headers.filter((h) => latinOutsideParens(h).length > 0);
    expect(offenders).toEqual([]);
  });

  it('접혀 있는 근거·거버넌스 섹션의 필드명도 한글 사전에 있다', () => {
    // E 섹션은 기본 접힘이라 서버 렌더 결과에 안 나온다. 사전만 따로 확인한다.
    const doc = getSquidV5();
    const fields = new Set<string>();
    for (const [id, widget] of Object.entries(doc.widgets)) {
      if (!id.startsWith('E_') || !Array.isArray(widget.data)) continue;
      for (const row of widget.data.slice(0, 3) as any[]) {
        if (row && typeof row === 'object') Object.keys(row).forEach((k) => fields.add(k));
      }
    }
    expect(fields.size).toBeGreaterThan(0);
    const untranslated = [...fields].filter(
      (f) => latinOutsideParens(squidFieldLabel(f)).length > 0,
    );
    expect(untranslated).toEqual([]);
  });

  it('근거 영역의 출처명·자료 계열·갱신 주기를 한글로 표시한다', () => {
    const displayed = getSquidV5()
      .sources.flatMap((source) => [
        squidPublisherLabel(source.publisher),
        squidValueLabel(source.series ?? ''),
        squidFrequencyLabel(source.frequency),
      ])
      .join(' ');
    expect(latinTokens(displayed)).toEqual([]);
  });

  it('원문 발췌는 번역을 달거나, 없으면 원문을 그대로 보여준다', () => {
    // 번역이 없다고 안내 문구로 갈음하면 화면에서 근거가 사라진 것처럼 보인다.
    const doc = getSquidV5();
    let excerpts = 0;
    let translated = 0;
    for (const widget of Object.values(doc.widgets)) {
      if (!Array.isArray(widget.data)) continue;
      for (const row of widget.data as any[]) {
        if (row?.kind !== 'source_excerpt') continue;
        excerpts += 1;
        const hangul = (row.text.match(/[가-힣]/g) ?? []).length;
        if (typeof row.text_ko === 'string' || hangul >= 10) translated += 1;
      }
    }
    expect(excerpts).toBeGreaterThan(100);
    expect(translated).toBe(excerpts);
  });

  it('대시보드가 서버 렌더에서 예외 없이 그려진다', () => {
    const markup = renderToStaticMarkup(React.createElement(SquidDashboard));
    expect(markup).toContain('오징어 조달 인텔리전스');
    expect(markup).not.toContain('LIVE');
  });
});
