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
