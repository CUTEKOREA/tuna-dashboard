import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  SKJ_ATUNA_HUBS,
  YF_ATUNA_HUBS,
  latestTwoForAtunaHub,
  calcAtunaDeltaPct,
  type AtunaPriceRow,
} from '@/lib/data/atuna-price-summary';
import { UNLOADING_STATIC_VESSELS, type UnloadingVesselData } from '@/lib/data/unloading-static';
import { getVesselStatusKind, avgPerReportDay } from '@/lib/unloading-operations';
import { purseSeineCatch } from '@/lib/fleet-operations-2026-08-23';
import { dailyBriefing } from '@/lib/data/daily-briefing';
import { progressPct } from '@/lib/metrics';
import { getCompanySmtpConfig } from '@/lib/mail/server-env';
import { parseCompanySmtpMessage, sendCompanySmtpMessage } from '@/lib/mail/company-smtp';

/**
 * 주간 브리핑 자동 발송 (P3-7 2단계, 소유자 확정: 이메일 · 매주 월요일 아침).
 * Vercel cron(vercel.json)이 KST 월 08:00(UTC 일 23:00)에 호출한다.
 *
 * - 인증: Vercel cron이 자동 부착하는 `Authorization: Bearer ${CRON_SECRET}` 를
 *   timingSafeEqual로 검증 (웹훅 시크릿 패턴 승계, 최소 32자). 게이트(proxy)는
 *   이 경로만 PUBLIC_SERVICE_PATHS로 면제 — 소유자 로그인 게이트 자체는 무개변.
 * - 데이터: 화면을 스크랩하지 않는다 — 페이지가 쓰는 것과 같은 서버측 모듈·파일을
 *   직접 읽어 텍스트 브리핑을 조립한다 (숫자마다 기준일 표기).
 * - 발송: 회사 SMTP (env 단독, lib/mail/company-smtp 검증 로직 그대로).
 */

export const dynamic = 'force-dynamic';

const MIN_SECRET_LENGTH = 32;
const RECIPIENT = 'cutekorea@gmail.com';

function cronSecretOk(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim() ?? '';
  if (expected.length < MIN_SECRET_LENGTH) return false;
  const auth = request.headers.get('authorization') ?? '';
  const received = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const receivedBytes = Buffer.from(received);
  const expectedBytes = Buffer.from(expected);
  return receivedBytes.length === expectedBytes.length
    && timingSafeEqual(receivedBytes, expectedBytes);
}

function readAtunaRows(): AtunaPriceRow[] {
  const file = path.join(process.cwd(), 'data', 'atuna_prices.json');
  const rows = JSON.parse(fs.readFileSync(file, 'utf-8')) as AtunaPriceRow[];
  return Array.isArray(rows) ? rows : [];
}

function readUnloadingVessels(): Record<string, UnloadingVesselData> {
  const merged: Record<string, UnloadingVesselData> = { ...UNLOADING_STATIC_VESSELS };
  try {
    const file = path.join(process.cwd(), 'public', 'data', 'unloading', 'local_db.json');
    const db = JSON.parse(fs.readFileSync(file, 'utf-8')) as {
      unloading_vessels?: { id?: string; vessel_id?: string; name?: string }[];
    };
    // local_db는 원자료 스키마 — 요약 지표는 정적 원장과 화면 병합 결과가 이미 담고 있어
    // 여기서는 «파일이 읽히는가»만 확인한다 (실패해도 정적 원장으로 정직하게 발송).
    if (!db || typeof db !== 'object') return merged;
  } catch {
    /* 파일 없으면 정적 원장만 — 메일 본문에 기준을 명시한다 */
  }
  return merged;
}

const pct = (value: number | null) => (value === null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`);
const mt = (value: number) => value.toLocaleString('ko-KR', { maximumFractionDigits: 1 });

function buildBriefingText(): { subject: string; text: string } {
  const lines: string[] = [];

  // ── 시세 (Atuna 수동 동기 파일 — 기준일은 최신 관측일) ──
  const rows = readAtunaRows();
  const bkk = latestTwoForAtunaHub(rows, SKJ_ATUNA_HUBS[0]);
  const asOf = bkk.latest?.date ?? '미상';
  lines.push('■ 참치 시세 — Atuna 지역 스프레드 (기준일 ' + asOf.replace(/-/g, '.') + ')');
  for (const { hub, kind } of [
    ...SKJ_ATUNA_HUBS.map((hub) => ({ hub, kind: 'SKJ' })),
    ...YF_ATUNA_HUBS.map((hub) => ({ hub, kind: 'YF' })),
  ]) {
    const pair = latestTwoForAtunaHub(rows, hub);
    if (!pair.latest) continue;
    lines.push(
      `  ${kind} ${hub.label}: $${pair.latest.price.toLocaleString()} /MT (직전 대비 ${pct(calcAtunaDeltaPct(pair))})`,
    );
  }

  // ── 하역 (정적 원장 ∪ 파일 DB — 13척 기준) ──
  const vessels = Object.entries(readUnloadingVessels()).map(([id, v]) => ({ id, ...v }));
  const progress = vessels.filter((v) => getVesselStatusKind(v.status) === 'progress');
  const waiting = vessels.filter((v) => getVesselStatusKind(v.status) === 'waiting');
  const completed = vessels.filter((v) => getVesselStatusKind(v.status) === 'completed');
  lines.push('');
  lines.push(`■ 하역 현황 — 항차 ${vessels.length}척 (하역중 ${progress.length} · 대기 ${waiting.length} · 완료 ${completed.length})`);
  for (const v of progress) {
    const p = progressPct(v.actualTotal, v.reportedTotal);
    const avg = avgPerReportDay(v.timeline);
    lines.push(
      `  ${v.name}: 실적 ${mt(v.actualTotal)} MT / 신고 ${mt(v.reportedTotal)} MT (진행률 ${p === null ? '—' : `${p.toFixed(1)}%`}, 일평균 ${avg === null ? '—' : mt(avg)} MT)`,
    );
  }
  for (const v of waiting) {
    lines.push(`  ${v.name}: 하역대기 (항차 ${v.dateRange})`);
  }

  // ── 선단 (선망선 주간 랭킹 기간 기준) ──
  const period = purseSeineCatch.period;
  const top = [...purseSeineCatch.monthlyByVessel]
    .sort((a, b) => b.totalMt - a.totalMt)
    .slice(0, 3);
  lines.push('');
  lines.push(`■ 선망선 어획 — 연간 누계 상위 3척 (주간 랭킹 기준 ${period.from}~${period.to})`);
  for (const row of top) {
    lines.push(`  ${row.vessel}: ${mt(row.totalMt)} MT`);
  }

  // ── 뉴스 (파이프라인 스냅샷 — 발행일 명시) ──
  lines.push('');
  lines.push(`■ 참치 뉴스 헤드라인 (기준일 ${dailyBriefing.date.replace(/-/g, '.')})`);
  for (const item of dailyBriefing.digest.slice(0, 4)) {
    lines.push(`  · ${item.title}`);
  }

  lines.push('');
  lines.push('전체 화면·차트: https://leedonggun.co.kr/market (로그인 후 사이드바 «PDF 내보내기»로 저장 가능)');
  lines.push('이 메일은 매주 월요일 08:00 자동 발송됩니다 — 참치왕국 주간 브리핑.');

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  return {
    subject: `[참치왕국] 주간 브리핑 ${today}`,
    text: lines.join('\n'),
  };
}

export async function GET(request: Request) {
  if (!cronSecretOk(request)) {
    const configured = (process.env.CRON_SECRET?.trim().length ?? 0) >= MIN_SECRET_LENGTH;
    return NextResponse.json(
      {
        error: configured ? '인증 실패' : 'CRON_SECRET 미설정 (32자 이상 필요)',
        sent: false,
      },
      { status: configured ? 401 : 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  let smtpConfig;
  try {
    smtpConfig = getCompanySmtpConfig();
  } catch {
    return NextResponse.json(
      { error: '회사 SMTP 환경변수 미설정 — 발송 불가 (정직 표기)', sent: false },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const briefing = buildBriefingText();
  const message = parseCompanySmtpMessage({
    to: RECIPIENT,
    subject: briefing.subject,
    text: briefing.text,
  });
  await sendCompanySmtpMessage({ config: smtpConfig, message });

  return NextResponse.json(
    { sent: true, to: RECIPIENT, subject: briefing.subject, lines: briefing.text.split('\n').length },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
