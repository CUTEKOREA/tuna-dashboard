import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  OPERATION_ACCESS_COOKIE_NAME,
  verifyOperationAccessToken,
} from '@/lib/server/operation-access';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const RESPONSE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  Vary: 'Cookie',
};

/** 무인증 요청에 공개하는 프리뷰 기간 (일) — Atuna 유료 구독 소스 보호 */
const PREVIEW_DAYS = 90;

/**
 * 서버가 검증한 운영 접근 쿠키 또는 Supabase 세션만 전체 이력을 허용한다.
 * Supabase getUser()는 Auth 서버에 토큰 유효성을 확인하고,
 * 운영 접근 쿠키는 별도의 서버 비밀값으로 HMAC 서명을 검증한다.
 */
async function isAuthenticated(): Promise<boolean> {
  // 로컬 개발 우회 — NODE_ENV=development 한정
  if (process.env.NODE_ENV === 'development') return true;
  try {
    const cookieStore = await cookies();
    if (verifyOperationAccessToken(cookieStore.get(OPERATION_ACCESS_COOKIE_NAME)?.value)) {
      return true;
    }
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

type PriceEntry = {
  date: string;
  skj_bkk?: number;
  skj_mnt?: number;
  skj_abj?: number;
  skj_sey?: number;
  skj_vig?: number;
  yf_abj?: number;
  yf_sey?: number;
  yf_vig?: number;
};

const HUB_LABELS = {
  bkk: '방콕',
  mnt: '만타',
  abj: '아비장',
  sey: '세이셸',
  vig: '비고',
} as const;

/** 오늘(UTC) − dataAsOf 일수. 파싱 실패 시 -1. */
function staleDaysFrom(dataAsOf: string): number {
  const asOf = new Date(`${dataAsOf}T00:00:00Z`).getTime();
  if (Number.isNaN(asOf)) return -1;
  return Math.max(0, Math.floor((Date.now() - asOf) / 86_400_000));
}

/**
 * Atuna 참치 도매가 — 현재는 data/atuna_prices.json 정적 데이터 기반 (페이월 보호: public/ 정적 서빙 금지, 본 라우트 경유만).
 * 향후 Atuna 공개 Price Index 페이지·RSS·계약 데이터 등 외부 fetch로 확장 가능.
 *
 * 출처 노트: Atuna 본 사이트는 paywall이며 공개 API가 없음. 라이브 자동화를
 * 위해서는 다음 옵션 검토 필요:
 *   - Atuna 공개 Skipjack Price Index 페이지 HTML 스크래핑 (주 1회)
 *   - 신라교역 내부 매입가 시스템 연동 (preferred)
 *   - FAO GLOBEFISH 월간 보고서 PDF 파싱
 */
export async function GET() {
  try {
    const authed = await isAuthenticated();

    const filePath = path.join(process.cwd(), 'data', 'atuna_prices.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const history: PriceEntry[] = JSON.parse(raw);

    // 허브별 최신 가격 추출 (날짜 내림차순으로 가장 가까운 값)
    const sorted = [...history].sort((a, b) => (a.date < b.date ? 1 : -1));
    const latestByHub: Record<string, { price: number; date: string }> = {};
    const fields: (keyof PriceEntry)[] = ['skj_bkk', 'skj_mnt', 'skj_abj', 'skj_sey', 'skj_vig', 'yf_abj', 'yf_sey', 'yf_vig'];

    for (const field of fields) {
      const entry = sorted.find((e) => typeof e[field] === 'number');
      if (entry) {
        latestByHub[field] = { price: entry[field] as number, date: entry.date };
      }
    }

    const latestDate = sorted[0]?.date ?? null;

    // 허브별 신선도 — KPI 허브(skj_bkk, yf_sey 등)마다 최신 데이터 기준일이 다름
    const hubFreshness: Record<string, string> = {};
    for (const [hub, entry] of Object.entries(latestByHub)) {
      hubFreshness[hub] = entry.date;
    }

    // 무인증 요청: Atuna 유료 구독 소스 보호 — history를 최근 90일로 트림.
    // 200 응답 유지 (미로그인 랜딩 프리뷰 호환), restricted: true로 표시.
    let servedHistory = history;
    if (!authed) {
      const baseTime = latestDate
        ? new Date(`${latestDate}T00:00:00Z`).getTime()
        : Date.now();
      const cutoffTime = baseTime - PREVIEW_DAYS * 86_400_000;
      servedHistory = history.filter((e) => {
        const t = new Date(`${e.date}T00:00:00Z`).getTime();
        return !Number.isNaN(t) && t >= cutoffTime;
      });
    }

    return NextResponse.json({
      source: 'data/atuna_prices.json (manual sync — Atuna paywall, 라우트 경유 전용)',
      latestDate,
      hubLabels: HUB_LABELS,
      latestByHub,
      history: servedHistory,
      fetchedAt: new Date().toISOString(),
      // L-12 표준 필드 — 정적 JSON 서빙이므로 정직하게 isLive: false
      isLive: false,
      dataAsOf: latestDate, // 데이터의 실제 기준일 (최신 행 날짜, 응답 생성일 아님)
      staleDays: latestDate ? staleDaysFrom(latestDate) : null,
      hubFreshness,
      // A-5 인증 게이팅 — 무인증 시 최근 90일 프리뷰만 제공
      restricted: !authed,
      ...(authed ? {} : { restrictedNote: `미인증 프리뷰 — 최근 ${PREVIEW_DAYS}일 데이터만 제공됩니다. 전체 이력은 접근 확인 후 열람 가능합니다.` }),
    }, { headers: RESPONSE_HEADERS });
  } catch (err) {
    return NextResponse.json(
      {
        source: 'error-fallback',
        latestDate: null,
        latestByHub: {},
        history: [],
        error: String(err),
        // L-12 표준 필드 — 에러 분기도 정직 표기
        isLive: false,
        dataAsOf: null,
        staleDays: null,
        hubFreshness: {},
        restricted: true,
      },
      { status: 500, headers: RESPONSE_HEADERS }
    );
  }
}
