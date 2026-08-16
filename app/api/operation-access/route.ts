import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  OPERATION_ACCESS_COOKIE_NAME,
  OPERATION_ACCESS_TTL_SECONDS,
  createOperationAccessToken,
  isOperationAccessConfigured,
  verifyOperationAccessToken,
  verifyOperationPassword,
} from '@/lib/server/operation-access';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const RESPONSE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' };

function json(body: Record<string, unknown>, status: number = 200) {
  return NextResponse.json(body, { status, headers: RESPONSE_HEADERS });
}

function isSecureRequest(request: Request): boolean {
  const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  return new URL(request.url).protocol === 'https:' || forwardedProtocol === 'https';
}

export async function GET() {
  const cookieStore = await cookies();
  const granted = verifyOperationAccessToken(
    cookieStore.get(OPERATION_ACCESS_COOKIE_NAME)?.value,
  );
  return json({ granted });
}

export async function POST(request: Request) {
  if (!isOperationAccessConfigured()) {
    return json({ granted: false, error: '서버 접속 권한 설정을 확인해주세요.' }, 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ granted: false, error: '비밀번호 입력을 확인해주세요.' }, 400);
  }

  const password = body && typeof body === 'object'
    ? (body as { password?: unknown }).password
    : undefined;
  if (!verifyOperationPassword(password)) {
    return json({ granted: false, error: '비밀번호를 다시 확인해주세요.' }, 401);
  }

  const response = json({ granted: true });
  response.cookies.set(OPERATION_ACCESS_COOKIE_NAME, createOperationAccessToken(), {
    httpOnly: true,
    secure: isSecureRequest(request),
    sameSite: 'lax',
    maxAge: OPERATION_ACCESS_TTL_SECONDS,
    path: '/',
  });
  return response;
}

export async function DELETE(request?: Request) {
  const response = json({ granted: false });
  response.cookies.set(OPERATION_ACCESS_COOKIE_NAME, '', {
    httpOnly: true,
    secure: request ? isSecureRequest(request) : process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
