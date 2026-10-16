import { readdirSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { INDUSTRY_STATUS_BOARDS, type BoardChart } from '@/lib/data/industry-status-boards';

const DIR = path.join(__dirname, '..', 'data', 'industry_status_boards');
const TYPES = ['bars', 'line', 'hbars', 'dumbbell', 'butterfly', 'waterfall', 'stairs', 'closed', 'table'];
const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v);

function chartProblems(c: BoardChart): string[] {
  const p: string[] = [];
  if (!TYPES.includes(c.type)) return [`알 수 없는 차트 ${String((c as { type: string }).type)}`];
  switch (c.type) {
    case 'bars':
    case 'line':
      if (!c.series.length) p.push('계열 없음');
      c.series.forEach((s) => {
        if (s.points.length < 2) p.push(`${s.name} 점 2개 미만`);
        s.points.forEach((pt) => { if (!num(pt.v)) p.push(`${s.name} ${pt.x} 값`); });
        if (new Set(s.points.map((pt) => pt.x)).size !== s.points.length) p.push(`${s.name} x 중복`);
      });
      break;
    case 'hbars': c.rows.forEach((r) => { if (!num(r.v)) p.push(`${r.label} 값`); }); break;
    case 'dumbbell': c.rows.forEach((r) => { if (!num(r.b)) p.push(`${r.label} b`); }); break;
    case 'butterfly': c.rows.forEach((r) => { if (!num(r.l) || !num(r.r)) p.push(`${r.label} 값`); }); break;
    case 'waterfall': {
      const total = c.steps[c.steps.length - 1];
      // 분해 합이 마지막 합계와 맞는지(반올림 1% 허용)
      const sum = c.steps.filter((s) => s.kind !== 'total').reduce((a, s) => (s.kind === 'base' ? s.v : a + s.v), 0);
      if (total?.kind === 'total' && Math.abs(sum - total.v) > Math.abs(total.v) * 0.01 + 0.5) p.push(`분해 합 ${sum} ≠ ${total.v}`);
      break;
    }
    case 'stairs':
      c.rows.forEach((r) => { if (!num(r.add) || !num(r.price) || r.add > r.price + 1e-6) p.push(`${r.label} 계단`); });
      break;
    case 'closed': if (!c.cells.length) p.push('닫힌 칸 없음'); break;
    case 'table': c.rows.forEach((r, i) => { if (r.length !== c.columns.length) p.push(`표 ${i}행 열 수`); }); break;
  }
  return p;
}

describe('industry status boards', () => {
  it('JSON 파일과 등록 목록이 같다', () => {
    const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')).sort();
    expect(Object.keys(INDUSTRY_STATUS_BOARDS).sort()).toEqual(files);
  });

  for (const [key, b] of Object.entries(INDUSTRY_STATUS_BOARDS)) {
    it(`${key} 스펙이 그릴 수 있는 모양이다`, () => {
      const problems: string[] = [];
      if (!b.title || !b.lede || !b.src) problems.push('머리말');
      if (!b._meta?.source?.includes(`/reports/industry/${key}-`)) problems.push('_meta.source');
      if (b.kpis.length < 4 || b.kpis.length > 12) problems.push(`KPI ${b.kpis.length}개`);
      b.kpis.forEach((k) => { if (!num(k.value) || !k.unit || !k.basis) problems.push(`KPI ${k.label}`); });
      if (b.sections.length < 3) problems.push('섹션 3개 미만');
      b.sections.forEach((s) => s.cards.forEach((c) => {
        if (!c.title || !c.note) problems.push(`${c.title} 제목·설명`);
        chartProblems(c.chart).forEach((m) => problems.push(`${c.title}: ${m}`));
      }));
      const text = JSON.stringify(b);
      if (text.includes('—')) problems.push('엠대시(—)');
      expect(problems).toEqual([]);
    });
  }
});
