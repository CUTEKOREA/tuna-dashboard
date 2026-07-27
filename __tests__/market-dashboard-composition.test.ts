import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('market dashboard composition', () => {
  it('does not embed the cross commodity portfolio board on /market', () => {
    const source = readFileSync(join(process.cwd(), 'components/MarketDashboard.tsx'), 'utf8');

    expect(source).not.toContain('CrossCommodityIntelligence');
    expect(source).not.toContain('가격·수요·리스크를 한 번에 묶은 포트폴리오 판단판');
  });

  it('presents the top tuna price cards as regional spread summaries', () => {
    const source = readFileSync(join(process.cwd(), 'components/MarketDashboard.tsx'), 'utf8');

    expect(source).toContain('SKJ 가다랑어 지역 스프레드');
    expect(source).toContain('YF 황다랑어 지역 스프레드');
    expect(source).toContain('Atuna 지역 스프레드');
    expect(source).not.toContain('SKJ 가다랑어 (방콕)');
    expect(source).not.toContain('YF 황다랑어 (세이셸)');
  });

  it('keeps the market digest aligned with the latest verified NotebookLM sources', () => {
    const source = readFileSync(join(process.cwd(), 'components/MarketDashboard.tsx'), 'utf8');

    expect(source).toContain('7/23~27 (확인 기사 7/23~24)');
    expect(source).toContain('Atuna 2026.07.23~24 (NotebookLM 원문 10건 분석)');
    expect(source).toContain('태국산 염수 캔 25%, 에콰도르산은 예외');
    expect(source).toContain('한국 공급은 26% 급감');
    expect(source).not.toContain('Atuna 2026.07.13~17 (NotebookLM 종합 분석)');
  });
});
