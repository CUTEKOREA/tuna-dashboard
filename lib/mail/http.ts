import { NextResponse } from 'next/server';

export const MAIL_NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
} as const;

export function mailJson(body: unknown, init: ResponseInit = {}): NextResponse {
  const headers = new Headers(init.headers);
  headers.set('Cache-Control', 'no-store, max-age=0');
  return NextResponse.json(body, { ...init, headers });
}

export function mailError(
  status: number,
  code: string,
): NextResponse {
  return mailJson({ ok: false, code }, { status });
}
