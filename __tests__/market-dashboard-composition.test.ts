import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('market dashboard composition', () => {
  it('does not embed the cross commodity portfolio board on /market', () => {
    const source = readFileSync(join(process.cwd(), 'components/MarketDashboard.tsx'), 'utf8');

    expect(source).not.toContain('CrossCommodityIntelligence');
    expect(source).not.toContain('가격·수요·리스크를 한 번에 묶은 포트폴리오 판단판');
  });

  it('presents tuna prices through the adopted command hero (2026-08-17 디자인 랩 채택)', () => {
    const source = readFileSync(join(process.cwd(), 'components/MarketDashboard.tsx'), 'utf8');
    const hero = readFileSync(join(process.cwd(), 'components/HeroMarketCommand.tsx'), 'utf8');

    // 스프레드 KPI 카드 2장은 지휘형 카드로 대체 — 되돌아오면 실패
    expect(source).toContain('<HeroMarketCommand rows={priceData} />');
    expect(source).not.toContain('SKJ 가다랑어 지역 스프레드');
    expect(source).not.toContain('YF 황다랑어 지역 스프레드');
    // 지휘형 카드 계약: 허브 클릭 전환 + 주식 컨벤션 컬러 + 기준일
    expect(hero).toContain("setSelectedKey(hub.key)");
    // 2026-08-17 확산: 리터럴 hex → 전역 증감 토큰 (SSOT)
    expect(hero).toContain("var(--delta-up");
    expect(hero).toContain("var(--delta-down");
    expect(hero).toContain('기준일');
    expect(source).not.toContain('SKJ 가다랑어 (방콕)');
    expect(source).not.toContain('YF 황다랑어 (세이셸)');
    expect(source).toContain("from '@/lib/chart-palette'");
    expect(source).not.toContain('#509ee3');
    expect(hero).toContain('colorForAtunaHub');
    expect(hero).not.toContain('var(--chart-s1');
  });

  it('serves news only through the daily briefing widget', () => {
    const source = readFileSync(join(process.cwd(), 'components/MarketDashboard.tsx'), 'utf8');

    // 2026-08-15: 정적 Atuna 월간 카드 4장 제거 — 데일리 브리핑 위젯과 중복 (사용자 지시)
    expect(source).not.toContain('Atuna 2026.08 폴더 (05_ATUNA_뉴스·가격)');
    expect(source).not.toContain('태국산 염수 캔 25%, 에콰도르산은 예외');
    // 2026-08-17 r5-A 채택: 신문 1면형이 데일리 브리핑 위젯을 대체
    expect(source).toContain('<NewsFrontPage />');
    expect(source).not.toContain('<TunaDailyBriefingWidget />');
    expect(source).not.toContain('7/23~27 (확인 기사 7/23~24)');
  });
});
