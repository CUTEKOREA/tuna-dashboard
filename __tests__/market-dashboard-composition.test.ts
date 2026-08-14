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

  it('serves news only through the daily briefing widget', () => {
    const source = readFileSync(join(process.cwd(), 'components/MarketDashboard.tsx'), 'utf8');

    // 2026-08-15: 정적 Atuna 월간 카드 4장 제거 — 데일리 브리핑 위젯과 중복 (사용자 지시)
    expect(source).not.toContain('Atuna 2026.08 폴더 (05_ATUNA_뉴스·가격)');
    expect(source).not.toContain('태국산 염수 캔 25%, 에콰도르산은 예외');
    expect(source).toContain('<TunaDailyBriefingWidget />');
    expect(source).not.toContain('7/23~27 (확인 기사 7/23~24)');
  });
});
