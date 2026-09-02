import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('sidebar menu style', () => {
  it('keeps menu icons from shrinking behind long suffix labels', () => {
    const css = readFileSync(join(process.cwd(), 'app/page.module.css'), 'utf8');

    expect(css).toContain('.menuItem svg');
    expect(css).toContain('flex: 0 0 18px');
    expect(css).toContain('width: 18px');
    expect(css).toContain('height: 18px');
    expect(css).toContain('.menuItem > span');
    expect(css).toContain('min-width: 0');
  });
});

describe('차트 툴팁 배경 (2026-09-02 사용자 지시: 불투명도 60%)', () => {
  const cosmoCss = readFileSync(join(process.cwd(), 'components/cosmo/cosmo.css'), 'utf8');

  it('60% 반투명 배경을 backdrop blur와 함께만 적용한다', () => {
    expect(cosmoCss).toContain('color-mix(in srgb, var(--cosmo-surface) 60%, transparent)');
    // blur 미지원 브라우저에는 불투명 배경이 남아야 한다 (UI_RULES 2-2 가독성)
    const guard = cosmoCss.slice(cosmoCss.indexOf('@supports ((backdrop-filter'));
    expect(guard).toContain('backdrop-filter: blur(8px)');
    expect(cosmoCss).toMatch(/\.cosmo-root \.tip \{\s*\n\s*background: var\(--cosmo-surface\);/);
  });
});
