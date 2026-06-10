import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import fs from 'fs';
import path from 'path';

/**
 * Atuna 일일 시장 인텔리전스 endpoint
 *
 * 데이터 소스:
 * - 사용자가 매일 GDrive `내 드라이브/61. Atuna/YYYY.MM.DD` Google Docs에 뉴스 업로드
 * - `scripts/atuna_daily_sync.sh` (launchd 매일 22:00 자동 실행)
 *   → Drive API로 fetch → Gemini Pro로 구조화 JSON 추출
 *   → `data/atuna_daily/<date>.json` 저장
 *
 * 응답:
 * - ?date=YYYY-MM-DD: 해당 일자 데이터
 * - 기본: 가장 최근 N일 (기본 7일) 누적
 *
 * 참고: ADR 0007 Librarian 활용 + 사용자 새 자동 워크플로우 (2026-05-22)
 */

export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'data', 'atuna_daily');

/**
 * 쿠키 기반 Supabase 세션 검증 (A-5 인증 게이팅).
 * Atuna 유료 구독 소스 — 무인증 접근은 401로 차단.
 */
async function isAuthenticated(): Promise<boolean> {
  // 로컬 개발 우회 — NODE_ENV=development 한정 (주의: page.tsx는 hostname localhost도 우회하므로 npm start 로컬 프로덕션에선 페이지 입장+API 차단 조합이 됨)
  if (process.env.NODE_ENV === 'development') return true;
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Route Handler에서는 응답 쿠키 갱신 생략 (읽기 전용 검증)
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return Boolean(user);
  } catch {
    return false;
  }
}

function listAvailableDates(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs.readdirSync(DATA_DIR)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map(f => f.replace('.json', ''))
    .sort()
    .reverse();
}

function readDate(date: string): any | null {
  const file = path.join(DATA_DIR, `${date}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
}


// L-12: isLive 필드 표준 — 정적 동기화 JSON 서빙이므로 항상 false (정직 표기)
function l12(available: string[]) {
  const dataAsOf = available[0] || null;
  let staleDays: number | null = null;
  if (dataAsOf) {
    const t = Date.parse(dataAsOf);
    if (!Number.isNaN(t)) staleDays = Math.floor((Date.now() - t) / 86400000);
  }
  return { isLive: false as const, dataAsOf, staleDays };
}

export async function GET(request: Request) {
  // A-5 인증 게이팅 — 무인증 요청은 데이터 미제공
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json(
      { error: '로그인이 필요합니다. 인증 후 다시 시도해주세요.', restricted: true, isLive: false },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const daysParam = searchParams.get('days');
  const days = daysParam ? Math.max(1, Math.min(30, parseInt(daysParam, 10))) : 7;

  const available = listAvailableDates();

  if (date) {
    const data = readDate(date);
    if (!data) {
      return NextResponse.json(
        { error: '해당 일자 데이터 없음', requested: date, available: available.slice(0, 10), ...l12(available) },
        { status: 404 }
      );
    }
    return NextResponse.json({
      status: 'SYNCED',
      requested_date: date,
      data,
      ...l12(available),
    });
  }

  // 기본: 최근 N일 누적
  const recent = available.slice(0, days)
    .map(d => readDate(d))
    .filter(Boolean);

  return NextResponse.json({
    status: 'SYNCED',
    syncDate: available[0] || null,
    ...l12(available),
    note: '사용자 매일 GDrive `61. Atuna/` 업로드 + 자동 Gemini Pro 추출. 자동화: scripts/atuna_daily_sync.sh',
    available_dates: available.slice(0, 30),
    requested_days: days,
    items: recent,
    summary: recent.length > 0 ? {
      total_days: recent.length,
      total_signals: recent.reduce((s, d) => s + (d.market_signals?.length || 0), 0),
      latest_summary_kr: recent[0]?.summary_kr,
    } : null,
  });
}
