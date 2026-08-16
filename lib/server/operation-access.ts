/**
 * 과거 공용 비밀번호 인증의 호환용 심볼만 남긴 폐기 모듈.
 * 신규 인증은 lib/auth의 구글 소유자 정책만 사용한다.
 */
export const OPERATION_ACCESS_COOKIE_NAME = 'silla-operation-access-v1';
export const OPERATION_ACCESS_TTL_SECONDS = 0;

export function isOperationAccessConfigured(): boolean {
  return false;
}

export function verifyOperationPassword(_value: unknown): boolean {
  void _value;
  return false;
}

export function createOperationAccessToken(): never {
  throw new Error('공용 비밀번호 인증은 폐기되었습니다');
}

export function verifyOperationAccessToken(_token: string | undefined): boolean {
  void _token;
  return false;
}
