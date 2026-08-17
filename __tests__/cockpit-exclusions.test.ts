/**
 * 조종석 모드 적용 제외의 가드 (스펙 cockpit-mode-design §4).
 *
 * 「파노피·코스모(이미 조종석 밀도), 메일」은 제외다. 그런데 제외가 지켜지는지 재는
 * 것이 아무것도 없었다 — 누가 조종석 블록에 토큰을 하나 더 넣으면 코스모 카드가
 * 조용히 각지거나 파노피가 한 번 더 눌린다. 그쪽은 이미 터미널 밀도라 더 줄이면 뭉갠다.
 *
 * 제외가 성립하는 방식이 두 가지라는 점이 중요하다.
 *   · 파노피 — 조종석 토큰을 **하나도 안 쓴다.** 자체 `pf-*` 값으로 다 박아 뒀다.
 *   · 코스모 — `--dsc-card-radius` **하나만** 쓴다. 그래서 그 하나만 되돌리는 규칙이 있다.
 * 즉 제외 규칙이 짧은 것은 빠뜨려서가 아니라 필요한 만큼만 짚었기 때문이다.
 * 이 테스트는 그 전제가 계속 참인지를 본다.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');
const CSS = readFileSync(join(ROOT, 'app/globals.css'), 'utf8');

/** 조종석이 값을 바꾸는 토큰 이름들. 여기 늘어나면 제외 대상도 다시 봐야 한다. */
function cockpitTokens(): string[] {
  const start = CSS.indexOf("[data-density='cockpit'] {");
  const block = CSS.slice(start, CSS.indexOf('}', start) + 1);
  return [...block.matchAll(/--([a-z0-9-]+):/g)].map((m) => m[1]);
}

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('조종석 적용 제외 (스펙 §4)', () => {
  it('조종석이 건드리는 토큰은 일곱 개다', () => {
    // 늘어나면 아래 제외 검사들이 새 토큰을 못 본다. 그때 함께 갱신하라는 신호다.
    expect(cockpitTokens().sort()).toEqual(
      [
        'card-padding',
        'card-radius',
        'chart-height',
        'dsc-card-radius',
        'space-5',
        'space-6',
        'space-8',
      ].sort(),
    );
  });

  /**
   * 파노피는 조종석 토큰을 하나도 안 써야 한다. 하나라도 쓰기 시작하면 조종석에서
   * 한 번 더 눌리고, 그 페이지는 이미 12칸 격자·헤어라인 패널로 꽉 차 있다.
   */
  it('파노피는 조종석 토큰을 쓰지 않는다', () => {
    const css = read('components/panofi/panofi.css');
    const used = cockpitTokens().filter((t) => css.includes(`var(--${t}`));
    expect(used, `파노피가 조종석 토큰을 쓰기 시작했다: ${used.join(', ')}`).toEqual([]);
  });

  /**
   * 코스모가 쓰는 조종석 토큰은 전부 제외 규칙이 되돌려야 한다.
   * 새 토큰을 쓰기 시작했는데 규칙이 그대로면 그 항목만 조용히 압축된다.
   */
  it('코스모가 쓰는 조종석 토큰은 모두 제외 규칙이 되돌린다', () => {
    const css = read('components/cosmo/cosmo.css');
    const used = cockpitTokens().filter((t) => css.includes(`var(--${t}`));

    const start = CSS.indexOf("[data-density='cockpit'] .cosmo-root");
    expect(start, '코스모 제외 규칙이 사라졌다').toBeGreaterThan(-1);
    const restore = CSS.slice(start, CSS.indexOf('}', start) + 1);

    for (const token of used) {
      expect(restore, `코스모가 --${token} 을 쓰는데 제외 규칙이 되돌리지 않는다`).toContain(
        `--${token}:`,
      );
    }
  });

  /** 파노피는 자체 루트 클래스와 함께 `cosmo-root` 를 달아 제외 규칙에 걸린다. */
  it('파노피 루트가 코스모 제외 선택자에 걸린다', () => {
    const tsx = read('components/panofi/PanofiDashboard.tsx');
    expect(tsx).toMatch(/className="cosmo-root panofi-root"/);
  });

  /**
   * 메일은 대시보드가 아니라 받은편지함이다. 지표를 촘촘히 놓을 대상이 없어
   * 밀도를 줄여 얻을 것이 없다. `dsc-card` 를 쓰기 시작하면 조종석이 끼어든다.
   */
  it('메일은 조종석이 압축하는 카드 클래스를 쓰지 않는다', () => {
    expect(read('components/MailInboxDashboard.tsx')).not.toContain('dsc-card');
  });

  /** 제외 대상이 셋이라는 사실 자체를 스펙에서 잃지 않도록 붙들어 둔다. */
  it('스펙이 제외 대상 셋을 그대로 적고 있다', () => {
    const spec = read('docs/superpowers/specs/2026-08-17-cockpit-mode-design.md');
    expect(spec).toContain('적용 제외');
    for (const name of ['파노피', '코스모', '메일']) {
      expect(spec, `제외 대상에서 ${name} 이 빠졌다`).toContain(name);
    }
  });
});
