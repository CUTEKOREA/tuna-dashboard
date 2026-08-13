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
