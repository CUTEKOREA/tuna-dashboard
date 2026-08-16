import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const RESPONSE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  Vary: 'Cookie',
};

function json(body: Record<string, unknown>, status: number = 200) {
  return NextResponse.json(body, { status, headers: RESPONSE_HEADERS });
}

function retired() {
  return json({
    granted: false,
    error: '공용 비밀번호 접속은 종료되었습니다. 허용된 구글 계정으로 로그인해주세요.',
    code: 'google_login_required',
  }, 410);
}

export async function GET() {
  return retired();
}

export async function POST() {
  return retired();
}

export async function DELETE() {
  return retired();
}
