/**
 * 조종석 모드 밀도 계약 (스펙 cockpit-mode-design §1).
 *
 * 값 이름 네 개가 이 기능의 전부다 — 저장 키, 켜짐/꺼짐 문자열, 루트 속성, 속성 값.
 * 이게 900줄짜리 페이지 컴포넌트 안에 인라인으로 있으면 테스트가 못 붙고,
 * 나중에 누가 `'on'` 을 `'true'` 로 바꿔도 아무도 모른다. 그래서 여기로 뺐다.
 *
 * ⚠ 이 파일의 상수를 바꾸면 **이미 켜 둔 사람의 설정이 조용히 초기화된다.**
 *   localStorage 에 남은 옛 값과 안 맞기 때문이다. 바꿔야 하면 마이그레이션을 함께 넣는다.
 */

export const DENSITY_STORAGE_KEY = 'cockpit-mode';
export const DENSITY_ATTRIBUTE = 'data-density';

export const DENSITY_ON = 'on';
export const DENSITY_OFF = 'off';

export const DENSITY_COCKPIT = 'cockpit';
export const DENSITY_DEFAULT = 'default';

/** 저장된 설정을 읽는다. 서버에서는 항상 꺼짐 — 창이 없으니 읽을 것도 없다. */
export function readStoredDensity(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(DENSITY_STORAGE_KEY) === DENSITY_ON;
  } catch {
    // 사파리 프라이빗 모드처럼 localStorage 접근이 막힌 환경이 있다.
    // 밀도 설정 하나 때문에 페이지가 죽으면 안 된다.
    return false;
  }
}

/**
 * 루트 속성과 저장값을 함께 맞춘다.
 *
 * 둘을 따로 두면 새로고침 뒤 화면과 설정이 어긋난다 — 화면은 조종석인데 저장은 꺼짐인
 * 상태가 생긴다. 항상 같이 쓴다.
 */
export function applyDensity(cockpit: boolean, root?: HTMLElement): void {
  const el = root ?? (typeof document === 'undefined' ? undefined : document.documentElement);
  if (!el) return;
  el.setAttribute(DENSITY_ATTRIBUTE, cockpit ? DENSITY_COCKPIT : DENSITY_DEFAULT);
  try {
    window.localStorage.setItem(DENSITY_STORAGE_KEY, cockpit ? DENSITY_ON : DENSITY_OFF);
  } catch {
    // 저장이 막혀도 이번 세션의 화면은 바뀌어야 한다.
  }
}
