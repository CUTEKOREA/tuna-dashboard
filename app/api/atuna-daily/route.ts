import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Atuna 일일 시장 인텔리전스 endpoint
 *
 * 데이터 소스:
 * - 사용자가 매일 GDrive `내 드라이브/61. Atuna/YYYY.MM.DD` Google Docs에 뉴스 업로드
 * - `scripts/atuna_daily_sync.sh` (launchd 매일 22:00 자동 실행)
 *   → Drive API로 fetch → Gemini Pro로 구조화 JSON 추출
 *   → `public/data/atuna_daily/<date>.json` 저장
 *
 * 응답:
 * - ?date=YYYY-MM-DD: 해당 일자 데이터
 * - 기본: 가장 최근 N일 (기본 7일) 누적
 *
 * 참고: ADR 0007 Librarian 활용 + 사용자 새 자동 워크플로우 (2026-05-22)
 */

export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'public', 'data', 'atuna_daily');

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const daysParam = searchParams.get('days');
  const days = daysParam ? Math.max(1, Math.min(30, parseInt(daysParam, 10))) : 7;

  const available = listAvailableDates();

  if (date) {
    const data = readDate(date);
    if (!data) {
      return NextResponse.json(
        { error: '해당 일자 데이터 없음', requested: date, available: available.slice(0, 10) },
        { status: 404 }
      );
    }
    return NextResponse.json({
      status: 'SYNCED',
      requested_date: date,
      data,
    });
  }

  // 기본: 최근 N일 누적
  const recent = available.slice(0, days)
    .map(d => readDate(d))
    .filter(Boolean);

  return NextResponse.json({
    status: 'SYNCED',
    syncDate: available[0] || null,
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
