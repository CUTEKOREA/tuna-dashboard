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

  it('keeps the August Atuna summary and mounts the daily briefing widget', () => {
    const source = readFileSync(join(process.cwd(), 'components/MarketDashboard.tsx'), 'utf8');

    expect(source).toContain('Atuna 2026.08 폴더 (05_ATUNA_뉴스·가격)');
    expect(source).toContain('가격은 8/6 SKJ $1,900 반영');
    expect(source).toContain('태국산 염수 캔 25%, 에콰도르산은 예외');
    expect(source).toContain('한국 공급은 26% 급감');
    expect(source).toContain('<TunaDailyBriefingWidget />');
    expect(source).not.toContain('7/23~27 (확인 기사 7/23~24)');
  });
});
