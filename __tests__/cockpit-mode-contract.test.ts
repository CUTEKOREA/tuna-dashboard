/**
 * 조종석 모드 1단계 계약의 가드 (스펙 cockpit-mode-design §5).
 *
 * 2단계(보조 지표)에는 테스트가 있는데 정작 1단계(밀도 압축)는 무방비였다.
 * 토큰 하나를 지우거나 값을 되돌려도 화면이 조용히 옛 밀도로 돌아가고,
 * 조종석을 켠 사람만 «어라 안 촘촘해졌네» 하고 만다.
 *
 * 여기서 잡는 것 셋:
 *   1. 토글 계약 — 저장 키·속성 이름·값 문자열
 *   2. 토큰 계약 — 조종석이 실제로 무엇을 얼마나 줄이는지
 *   3. 모션 무관 — 밀도 전환에 애니메이션을 끼워 넣지 않았는지
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  applyDensity,
  DENSITY_ATTRIBUTE,
  DENSITY_COCKPIT,
  DENSITY_DEFAULT,
  DENSITY_OFF,
  DENSITY_ON,
  DENSITY_STORAGE_KEY,
  readStoredDensity,
} from '@/lib/cockpit-density';

const CSS = readFileSync(join(__dirname, '..', 'app/globals.css'), 'utf8');

/** `[data-density='cockpit'] { … }` 블록만 떼어 낸다. */
function cockpitBlock(): string {
  const start = CSS.indexOf("[data-density='cockpit'] {");
  expect(start, '조종석 토큰 블록이 사라졌다').toBeGreaterThan(-1);
  return CSS.slice(start, CSS.indexOf('}', start) + 1);
}

function tokenValue(block: string, name: string): string | null {
  const m = block.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return m ? m[1].trim() : null;
}

/**
 * 이 저장소의 vitest 는 `environment: 'node'` 라 DOM 이 없다. 단언 네 개 때문에
 * jsdom 을 끌어오는 대신 필요한 만큼만 세운다 — 속성 저장소와 localStorage 뿐이다.
 */
function fakeRoot() {
  const attrs = new Map<string, string>();
  return {
    setAttribute: (k: string, v: string) => void attrs.set(k, v),
    getAttribute: (k: string) => attrs.get(k) ?? null,
  } as unknown as HTMLElement;
}

function fakeStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
}

describe('조종석 모드 — 토글 계약', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = fakeRoot();
    (globalThis as { window?: unknown }).window = { localStorage: fakeStorage() };
  });

  /**
   * 상수를 import 해서 비교하면 이름을 바꿔도 테스트가 따라가 통과한다 — 실제로
   * 돌연변이 시험에서 저장 키를 `density` 로 바꿨는데 9건이 전부 통과했다.
   * 그래서 **리터럴로 못 박는다.** 이 값이 바뀌면 이미 조종석을 켜 둔 사람의 설정이
   * 조용히 초기화되고, CSS 선택자(`[data-density='cockpit']`)와도 어긋난다.
   * 바꿔야 한다면 마이그레이션과 CSS 를 함께 고치고 이 단언도 같이 고쳐라.
   */
  it('저장 키·속성 이름·값 문자열이 고정돼 있다', () => {
    expect(DENSITY_STORAGE_KEY).toBe('cockpit-mode');
    expect(DENSITY_ATTRIBUTE).toBe('data-density');
    expect(DENSITY_ON).toBe('on');
    expect(DENSITY_OFF).toBe('off');
    expect(DENSITY_COCKPIT).toBe('cockpit');
    expect(DENSITY_DEFAULT).toBe('default');
  });

  /** CSS 선택자와 코드의 속성 값이 같은 문자열이어야 한다. 갈리면 토글이 먹통이 된다. */
  it('CSS 선택자가 코드의 속성·값과 같은 문자열을 쓴다', () => {
    expect(CSS).toContain(`[${DENSITY_ATTRIBUTE}='${DENSITY_COCKPIT}']`);
  });

  it('켜면 루트 속성과 저장값이 함께 바뀐다', () => {
    applyDensity(true, root);
    expect(root.getAttribute(DENSITY_ATTRIBUTE)).toBe(DENSITY_COCKPIT);
    expect(window.localStorage.getItem(DENSITY_STORAGE_KEY)).toBe(DENSITY_ON);
  });

  it('끄면 둘 다 되돌아온다', () => {
    applyDensity(true, root);
    applyDensity(false, root);
    expect(root.getAttribute(DENSITY_ATTRIBUTE)).toBe(DENSITY_DEFAULT);
    expect(window.localStorage.getItem(DENSITY_STORAGE_KEY)).toBe(DENSITY_OFF);
  });

  /** 새로고침 뒤에도 유지되는 것이 이 기능의 절반이다. */
  it('저장값을 다시 읽어 상태를 복원한다', () => {
    expect(readStoredDensity()).toBe(false);
    applyDensity(true, root);
    expect(readStoredDensity()).toBe(true);
    applyDensity(false, root);
    expect(readStoredDensity()).toBe(false);
  });

  /** 사파리 프라이빗 모드 등에서 localStorage 가 던진다. 화면은 그래도 바뀌어야 한다. */
  it('저장이 막혀도 화면은 바뀌고 페이지는 죽지 않는다', () => {
    (globalThis as { window?: unknown }).window = {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error('QuotaExceededError');
        },
      },
    };
    expect(() => applyDensity(true, root)).not.toThrow();
    expect(root.getAttribute(DENSITY_ATTRIBUTE)).toBe(DENSITY_COCKPIT);
    // 읽기가 막혀도 «꺼짐»으로 떨어질 뿐 예외가 새지 않는다.
    expect(readStoredDensity()).toBe(false);
  });
});

describe('조종석 모드 — 토큰 계약', () => {
  /**
   * 조종석이 «무엇을 얼마나» 줄이는지 고정한다. 값 자체를 박아 두는 것이 스냅샷보다
   * 낫다 — 스냅샷은 깨지면 그냥 갱신하게 되고, 그러면 되돌아가도 통과한다.
   */
  it('일곱 개 토큰을 정해진 값으로 줄인다', () => {
    const block = cockpitBlock();
    const expected: Record<string, string> = {
      'space-5': '14px',
      'space-6': '14px',
      'space-8': '20px',
      'card-padding': '0.9rem',
      'dsc-card-radius': '10px',
      'card-radius': '10px',
      'chart-height': '280px',
    };
    for (const [name, value] of Object.entries(expected)) {
      expect(tokenValue(block, name), `--${name} 이 조종석 블록에서 사라지거나 바뀌었다`).toBe(
        value,
      );
    }
  });

  it('카드 안쪽 여백을 실제로 좁힌다', () => {
    expect(CSS).toMatch(/\[data-density='cockpit'\]\s*\.dsc-card\s*\{\s*padding:\s*14px 16px/);
  });

  /**
   * 히어로는 양 모드 동일이다(스펙 §4). KPI 크기 토큰이 조종석 블록에 들어오면
   * 페이지 정체성이 모드마다 달라진다.
   */
  it('히어로 KPI 크기는 건드리지 않는다', () => {
    expect(cockpitBlock()).not.toMatch(/--dsc-kpi-size|--hero-/);
  });
});

describe('조종석 모드 — 모션 무관', () => {
  /**
   * 밀도 전환에 트랜지션을 걸면 토글 한 번에 화면 전체가 출렁인다. 그리고
   * reduced-motion 을 켠 사람에게는 그 자체가 접근성 문제가 된다. 아예 안 넣는다.
   */
  it('조종석 블록에 전환 애니메이션이 없다', () => {
    const block = cockpitBlock();
    expect(block).not.toMatch(/transition|animation/);
  });

  it('조종석 규칙이 prefers-reduced-motion 안에 갇혀 있지 않다', () => {
    // 미디어 쿼리 안에 들어가면 그 설정을 켠 사람에게만 밀도가 달라진다.
    const reduced = CSS.match(/@media[^{]*prefers-reduced-motion[^{]*\{[\s\S]*?\n\}/g) ?? [];
    for (const block of reduced) {
      expect(block).not.toContain("data-density='cockpit'");
    }
  });
});
