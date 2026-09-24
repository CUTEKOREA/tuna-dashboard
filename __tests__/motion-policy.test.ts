import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const globals = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

describe('모션 정책', () => {
  it('움직이는 곳은 탭 패널과 상태 전이 두 군데뿐이다', () => {
    expect(globals).toContain("[role='tabpanel']:not([hidden])");
    expect(globals).toContain("[data-motion='reveal']");
    // 전역 진입 애니메이션(본문 전체·스크롤 리빌)은 두지 않는다
    expect(globals).not.toMatch(/\bbody\s*\{[^}]*animation:\s*motionEnter/);
  });

  it('정지 상태를 opacity 0 으로 대기시키지 않는다', () => {
    /* 첫 프레임이 비면 스크린샷·PDF 내보내기·썸네일이 빈 화면이 된다.
     * 시작값은 0.001 이고 끝값은 1 이다 - 애니메이션이 안 돌아도 값이 보인다. */
    const keyframe = globals.match(/@keyframes motionEnter \{[\s\S]*?\n\}/)![0];
    expect(keyframe).toContain('opacity: 0.001');
    expect(keyframe).toContain('opacity: 1');
    expect(keyframe).not.toMatch(/from \{[^}]*opacity:\s*0;/);
  });

  it('reduced-motion 가드가 전역으로 남아 있다', () => {
    expect(globals).toContain('@media (prefers-reduced-motion: reduce)');
    expect(globals).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
  });

  it('탭 패널 애니메이션은 보이는 패널에만 걸린다', () => {
    // hidden 패널까지 돌면 탭 8개짜리 화면이 전환마다 8번 애니메이션한다
    const rule = globals.match(/\[role='tabpanel'\][^{]*\{[^}]*\}/)![0];
    expect(rule).toContain(':not([hidden])');
    expect(rule).toContain('var(--motion-base)');
  });
});
