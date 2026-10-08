/**
 * 자격증명 조회 헬퍼.
 *
 * 2026-08-13 이전에는 라우트마다 `process.env.X || '<실제 키>'` 형태로
 * 실제 발급키를 소스에 적어 폴백으로 썼다. 이 저장소는 공개 저장소라
 * 키가 그대로 노출됐고, 동시에 두 가지 거짓말을 만들었다.
 *
 *   1. env 미설정이어도 호출이 성공해 "설정됐다"고 착각하게 만든다.
 *   2. `!!(process.env.X || '<키>')` 같은 검사는 항상 true라
 *      "API Key configured" 류 표시가 실제 설정 여부와 무관해진다.
 *
 * 그래서 폴백을 두지 않는다. 없으면 없다고 말한다.
 */

/** env가 없으면 던진다. 라우트는 이 예외를 잡아 5xx나 정직한 폴백 응답으로 바꾼다. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** 이름을 순서대로 훑어 처음 채워진 값을 쓴다. 전부 비면 던진다. */
export function requireAnyEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  throw new Error(`Missing required environment variable: one of ${names.join(', ')}`);
}

/** 설정 여부만 본다. 던지지 않는다 — 상태 표시·분기용. */
export function hasEnv(...names: string[]): boolean {
  return names.some((name) => !!process.env[name]);
}

/** 없으면 null. 키가 없어도 라우트가 계속 돌아야 할 때만 쓴다. */
export function optionalEnv(name: string): string | null {
  return process.env[name] || null;
}

/**
 * 공공데이터포털 인증키를 쓸 순서대로 돌려준다(중복 제거).
 *
 * 한 계정이 인증키를 여러 벌 갖고, **재발급하면 그 이전 값이 죽는다.** 서비스마다 활용신청이 붙은
 * 계정·키가 다르기도 하다. 2026-09-12 실측: `DATA_GO_KR_NEW_KEY` 는 2026-08-13 재발급으로 죽은 값이라
 * 이걸 1순위로 읽던 라우트는 전부 결과코드 30(등록되지 않은 서비스키)을 받고 있었다.
 * 한 벌만 골라 쓰면 어느 쪽을 골라도 절반이 막히므로, 목록으로 받아 키 계통 오류면 다음 키로 넘어간다.
 */
export function dataGoKrKeys(): string[] {
  const names = ['DATA_GO_KR_KEY_2', 'DATA_GO_KR_COMMON_KEY', 'DATA_GO_KR_NEW_KEY'];
  const found: string[] = [];
  for (const name of names) {
    const value = process.env[name];
    if (value && !found.includes(value)) found.push(value);
  }
  return found;
}

/** 키 계통 결과코드. 이 코드가 오면 다음 키로 넘어간다(22 요청초과는 키를 바꿔도 소용없어 뺀다). */
export const DATA_GO_KR_KEY_ERRORS = new Set(['20', '30', '31', '32']);
