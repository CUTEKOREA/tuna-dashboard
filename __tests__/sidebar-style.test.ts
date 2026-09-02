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

  it('60% 반투명 배경만 두고 뒤에 불투명 배경을 깔지 않는다', () => {
    const tip = cosmoCss.slice(cosmoCss.indexOf('.cosmo-root .tip {'));
    const block = tip.slice(0, tip.indexOf('}') + 1);
    expect(block).toContain('color-mix(in srgb, var(--cosmo-surface) 60%, transparent)');
    expect(block).toContain('backdrop-filter: blur(8px)');
    // 2026-09-02 사용자 지시: 불투명 배경을 뒤에 두지 않는다
    expect(block).not.toContain('background: var(--cosmo-surface);');
    expect(cosmoCss).not.toContain('@supports ((backdrop-filter');
  });
});
