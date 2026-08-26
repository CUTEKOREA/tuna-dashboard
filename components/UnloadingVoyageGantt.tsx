/**
 * 하역 항차 기간 바 — 디자인 랩 7라운드 최종 채택본 (r7-B ★4 «표현방식 마음에 듦», 2026-08-17).
 * 선박별 가로 바를 월 눈금 시간축 위에 얹는다. 바 클릭 = 상단 누계·일평균·잔여 KPI 전환.
 * 실페이지(하역 현황)는 static+DB 병합 13척을 props로 주입 — «13척 전부» 판정 반영.
 * props 없으면 /api/unloading-db 단독(9척) — 갤러리 미리보기 경로.
 */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, ReferenceDot,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { avgPerReportDay, getVesselStatusKind, type VesselStatusKind } from '../lib/unloading-operations';
import { progressPct } from '../lib/metrics';
import { HUB_ID } from '@/lib/chart-palette';

/* 상태(하역중/대기/완료)는 증감이 아니므로 증감색 토큰을 쓰지 않는다 — 진행 중만 액센트, 나머지 muted */
const ACCENT = HUB_ID.bkk;
const ACCENT_SOFT = 'rgba(59, 130, 246, 0.18)';
const MUTED = 'var(--text-muted)';
/* 완료 바는 라이트·다크 어디서도 같은 무게로 읽히도록 테마 중립 회색을 쓴다 */
const DONE_BAR = 'rgba(141, 147, 165, 0.5)';

const STATUS_LABEL: Record<VesselStatusKind, string> = {
  progress: '하역중',
  waiting: '하역대기',
  completed: '하역완료',
};
const STATUS_RANK: Record<VesselStatusKind, number> = { progress: 0, waiting: 1, completed: 2 };

/* 응답의 location은 영문 표기가 섞여 있어 화면 노출용으로만 한글 대응 (L-01) */
const KO_LOCATION: Record<string, string> = { 'BANGKOK, THAILAND': '방콕, 태국' };

type TimelinePoint = { date: string; dailyAmount: number; cumAmount: number };
type VesselRaw = {
  name: string;
  dateRange: string;
  location: string;
  status: string;
  reportedTotal: number;
  actualTotal: number;
  timeline: TimelinePoint[];
};
type Vessel = VesselRaw & {
  id: string;
  kind: VesselStatusKind;
  startMs: number;
  endMs: number;
  /** dateRange에 종료일이 없어 최신 보고일까지만 그린 바 (하역중·대기) */
  openEnded: boolean;
};

const mt = (value: number) => value.toLocaleString('ko-KR', { maximumFractionDigits: 1 });

const pad2 = (n: number) => String(n).padStart(2, '0');
const ymd = (ms: number) => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}.${pad2(d.getUTCMonth() + 1)}.${pad2(d.getUTCDate())}`;
};

/**
 * dateRange는 세 형태가 섞여 있다.
 *  '2026.05.23 ~ 2026.06.18' (완결) / '2026.08.07 ~ 진행중' / '2026.07.20 선적계획 확정 · 하역실적 대기'
 * 앞의 날짜가 시작, 두 번째 날짜가 있으면 종료. 없으면 종료일 미상이다.
 */
function voyageDates(dateRange: string): { start: number | null; end: number | null } {
  const found = [...dateRange.matchAll(/(\d{4})\.(\d{1,2})\.(\d{1,2})/g)]
    .map((m) => Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return { start: found[0] ?? null, end: found[1] ?? null };
}

/**
 * timeline.date는 'M/D' 또는 '7/2~7/4' 텍스트라 연도가 없다 — 항차 기간(dateRange) 시작 연도로 보정.
 * 이틀 이상을 묶은 보고는 뒷날짜가 실제 보고 종료일이다.
 */
function reportDateMs(dateRange: string, date: string): number | null {
  const md = date.match(/(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*~\s*(\d{1,2})\s*\/\s*(\d{1,2}))?/);
  const start = dateRange.match(/(\d{4})\.(\d{1,2})/);
  if (!md || !start) return null;
  let month = Number(md[1]);
  let day = Number(md[2]);
  // 항차가 해를 넘기면(예: 2025.12.18 ~ 2026.01.13) 시작 월보다 작은 월은 다음 해 보고다
  let year = month >= Number(start[2]) ? Number(start[1]) : Number(start[1]) + 1;
  if (md[3] && md[4]) {
    if (Number(md[3]) < month) year += 1;
    month = Number(md[3]);
    day = Number(md[4]);
  }
  return Date.UTC(year, month - 1, day);
}

function lastReportMs(v: VesselRaw): number | null {
  for (let i = v.timeline.length - 1; i >= 0; i -= 1) {
    const ms = reportDateMs(v.dateRange, v.timeline[i].date);
    if (ms !== null) return ms;
  }
  return null;
}

function toVessels(data: Record<string, VesselRaw>): Vessel[] {
  return Object.entries(data)
    .filter(([, v]) => v && typeof v.name === 'string' && Array.isArray(v.timeline))
    .map(([id, v]) => {
      const { start, end } = voyageDates(v.dateRange);
      // 종료일이 없으면 오늘이 아니라 «최신 보고일»까지 — 데이터가 말하는 데까지만 그리는 게 정직하다
      const fallbackEnd = lastReportMs(v);
      const startMs = start ?? fallbackEnd ?? 0;
      return {
        ...v,
        id,
        kind: getVesselStatusKind(v.status),
        startMs,
        endMs: Math.max(end ?? fallbackEnd ?? startMs, startMs),
        openEnded: end === null,
      };
    })
    .filter((v) => v.startMs > 0)
    // 소유자 r6 판정 «정렬은 월 기준»: 항차 시작 최신순. 같은 날이면 하역중 우선
    .sort((a, b) => b.startMs - a.startMs || STATUS_RANK[a.kind] - STATUS_RANK[b.kind]);
}

/** 도메인을 월 경계로 스냅해 월 눈금 간격이 실제 달 길이와 일치하게 만든다 */
function buildAxis(vessels: Vessel[]) {
  const from = new Date(Math.min(...vessels.map((v) => v.startMs)));
  const to = new Date(Math.max(...vessels.map((v) => v.endMs)));
  const min = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1);
  const max = Date.UTC(to.getUTCFullYear(), to.getUTCMonth() + 1, 1);
  const span = Math.max(max - min, 1);
  const ticks: { label: string; pct: number }[] = [];
  for (let cursor = min; cursor < max;) {
    const d = new Date(cursor);
    ticks.push({
      label: `${d.getUTCFullYear()}.${pad2(d.getUTCMonth() + 1)}`,
      pct: ((cursor - min) / span) * 100,
    });
    cursor = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
  }
  return { pct: (ms: number) => ((ms - min) / span) * 100, ticks };
}

function UnloadingTip({ active, payload }: {
  active?: boolean;
  payload?: { payload?: { label?: string; cum?: number; daily?: number } }[];
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point || typeof point.cum !== 'number') return null;
  return (
    <div style={{
      background: '#303c46', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 8,
      padding: '6px 10px', fontSize: 12, color: '#ffffff', fontVariantNumeric: 'tabular-nums',
    }}>
      <div style={{ color: '#c6c9d2' }}>{point.label}</div>
      <div style={{ fontWeight: 700 }}>누계 {mt(point.cum)} <span style={{ fontWeight: 400, color: '#c6c9d2' }}>(MT)</span></div>
      {typeof point.daily === 'number' && (
        <div style={{ color: '#c6c9d2' }}>당일 {mt(point.daily)} (MT)</div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: '0.68rem', color: MUTED }}>{label}</span>
      <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>{value}</span>
    </span>
  );
}

export default function UnloadingVoyageGantt({ vesselsById }: {
  /** 호출부가 병합 데이터를 주면 fetch 없이 그대로 그린다 (실페이지 13척 경로) */
  vesselsById?: Record<string, VesselRaw>;
} = {}) {
  const [fetched, setFetched] = useState<Vessel[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const injected = useMemo(
    () => (vesselsById ? toVessels(vesselsById) : null),
    [vesselsById],
  );
  const vessels = injected ?? fetched;

  useEffect(() => {
    if (vesselsById) return;
    fetch('/api/unloading-db', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json: { success?: boolean; data?: Record<string, VesselRaw> }) => {
        const list = json?.success && json.data ? toVessels(json.data) : [];
        if (list.length === 0) setFailed(true); else setFetched(list);
      })
      .catch(() => setFailed(true));
  }, [vesselsById]);

  const axis = useMemo(() => (vessels ? buildAxis(vessels) : null), [vessels]);

  const selected = useMemo(() => {
    if (!vessels) return null;
    // 초기 선택은 하역중 선박 — 정렬에서 이미 앞으로 나와 있다
    return vessels.find((v) => v.id === selectedId) ?? vessels[0];
  }, [vessels, selectedId]);

  const series = useMemo(() => (selected ? selected.timeline.map((point) => {
    const ms = reportDateMs(selected.dateRange, point.date);
    return { label: ms === null ? point.date : ymd(ms), cum: point.cumAmount, daily: point.dailyAmount };
  }) : []), [selected]);

  if (failed) return <p style={{ color: MUTED, fontSize: 13 }}>하역 데이터 수신 실패 - 시안 평가 불가 (새로고침으로 재시도)</p>;
  if (!vessels || !selected || !axis) return <p style={{ color: MUTED, fontSize: 13 }}>하역 데이터 수신 중…</p>;

  const selectedProgressPct = progressPct(selected.actualTotal, selected.reportedTotal);
  const remaining = selected.reportedTotal - selected.actualTotal;
  const reportCount = selected.timeline.length;
  // 보고일 전체 기준 (완료 예상 관점 — lib/unloading-operations SSOT 정의)
  const dailyAvg = avgPerReportDay(selected.timeline);
  const last = series[series.length - 1];
  const asOf = Math.max(...vessels.map((v) => v.endMs));

  return (
    <div className="dsc-card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 240 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: MUTED }}>
            {selected.name} · {KO_LOCATION[selected.location] ?? selected.location}
            <span style={{ marginLeft: 6, color: selected.kind === 'progress' ? ACCENT : MUTED }}>
              {STATUS_LABEL[selected.kind]}
            </span>
          </div>
          <div style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
            {mt(selected.actualTotal)}
            <span style={{ fontSize: '0.9rem', fontWeight: 400, color: MUTED, marginLeft: 6 }}>(MT)</span>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: selected.kind === 'progress' ? ACCENT : MUTED }}>
            신고량 {mt(selected.reportedTotal)} (MT) 대비 진행률 {selectedProgressPct === null ? '-' : `${selectedProgressPct.toFixed(1)}%`}
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
            <Stat label="일평균 (MT/일)" value={dailyAvg === null ? '-' : mt(dailyAvg)} />
            <Stat label={remaining >= 0 ? '잔여 (MT)' : '신고 초과 (MT)'} value={mt(Math.abs(remaining))} />
            <Stat label="보고 횟수 (회)" value={reportCount.toLocaleString('ko-KR')} />
          </div>
          <div style={{ fontSize: '0.72rem', color: MUTED, marginTop: 8 }}>
            {last ? `최신 보고 ${last.label} · 항차 ${selected.dateRange}` : `보고 기록 없음 · 항차 ${selected.dateRange}`}
          </div>
        </div>
        {series.length >= 2 ? (
          <LineChart width={430} height={120} data={series} margin={{ top: 12, right: 20, left: 8, bottom: 8 }}>
            <XAxis dataKey="label" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <RechartsTooltip content={<UnloadingTip />} cursor={{ stroke: MUTED, strokeDasharray: '3 3' }} />
            <Line type="monotone" dataKey="cum" stroke={ACCENT} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            {last && <ReferenceDot x={last.label} y={last.cum} r={4} fill={ACCENT} stroke="#ffffff" strokeWidth={1.5} />}
          </LineChart>
        ) : (
          <p style={{ fontSize: '0.75rem', color: MUTED, margin: 0 }}>일일 보고 2건 미만 - 누적 추이 표시 불가</p>
        )}
      </div>

      {/* 월 눈금 헤더 — 좌측 선박명·우측 실적 열과 같은 그리드를 써야 눈금과 바가 어긋나지 않는다 */}
      <div style={{ display: 'grid', gridTemplateColumns: '158px 1fr 116px', gap: 10, marginTop: 18, alignItems: 'center' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: MUTED }}>선박 · 항차 시작</span>
        <div style={{ position: 'relative', height: 16 }}>
          {axis.ticks.map((tick) => (
            <span
              key={tick.label}
              style={{
                position: 'absolute', left: `${tick.pct}%`, top: 0, paddingLeft: 3,
                fontSize: '0.62rem', color: MUTED, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
              }}
            >
              {tick.label}
            </span>
          ))}
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: MUTED, textAlign: 'right' }}>실적 (MT) · 진행률</span>
      </div>

      <div style={{ display: 'grid', gap: 3, marginTop: 4 }}>
        {vessels.map((vessel) => {
          const left = axis.pct(vessel.startMs);
          const width = Math.max(axis.pct(vessel.endMs) - left, 0.7);
          const pct = progressPct(vessel.actualTotal, vessel.reportedTotal);
          const isProgress = vessel.kind === 'progress';
          const isWaiting = vessel.kind === 'waiting';
          const isActive = vessel.id === selected.id;
          const isHover = vessel.id === hoverId;
          return (
            <button
              key={vessel.id}
              type="button"
              onClick={() => setSelectedId(vessel.id)}
              onMouseEnter={() => setHoverId(vessel.id)}
              onMouseLeave={() => setHoverId(null)}
              aria-pressed={isActive}
              aria-label={`${vessel.name} ${STATUS_LABEL[vessel.kind]} 항차 ${ymd(vessel.startMs)}부터 ${ymd(vessel.endMs)}까지`}
              style={{
                display: 'grid', gridTemplateColumns: '158px 1fr 116px', gap: 10, alignItems: 'center',
                textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                border: '1px solid ' + (isActive ? ACCENT : 'transparent'),
                background: isActive ? ACCENT_SOFT : isHover ? 'rgba(141, 147, 165, 0.08)' : 'transparent',
                borderRadius: 8, padding: '5px 6px',
                transition: 'background 0.15s ease, border-color 0.15s ease',
              }}
            >
              <span style={{ overflow: 'hidden' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {vessel.name}
                </span>
                <span style={{ display: 'block', fontSize: '0.64rem', color: isProgress ? ACCENT : MUTED, fontVariantNumeric: 'tabular-nums' }}>
                  {ymd(vessel.startMs)} · {STATUS_LABEL[vessel.kind]}
                </span>
              </span>

              <span style={{ position: 'relative', display: 'block', height: 22 }}>
                {axis.ticks.map((tick) => (
                  <span
                    key={tick.label}
                    style={{
                      position: 'absolute', left: `${tick.pct}%`, top: 0, bottom: 0, width: 1,
                      background: 'var(--chart-grid, #e2e4e9)',
                    }}
                  />
                ))}
                <span
                  style={{
                    position: 'absolute', left: `${left}%`, width: `${width}%`, top: 4, bottom: 4,
                    borderRadius: 4,
                    background: isWaiting ? 'transparent' : isProgress ? ACCENT_SOFT : DONE_BAR,
                    border: isWaiting ? `1px dashed ${MUTED}` : isProgress ? `1px solid ${ACCENT}` : 'none',
                    // 종료일 미상 항차는 오른쪽 끝을 열어 «여기까지 보고됨»으로 읽히게 한다
                    borderTopRightRadius: vessel.openEnded ? 0 : 4,
                    borderBottomRightRadius: vessel.openEnded ? 0 : 4,
                    overflow: 'hidden',
                  }}
                >
                  {isProgress && pct !== null && (
                    <span style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${Math.min(Math.max(pct, 0), 100)}%`, background: ACCENT,
                    }} />
                  )}
                </span>
                {vessel.openEnded && (
                  <span style={{
                    position: 'absolute', left: `calc(${left + width}% + 3px)`, top: '50%',
                    transform: 'translateY(-50%)', fontSize: '0.62rem', color: isProgress ? ACCENT : MUTED,
                    whiteSpace: 'nowrap',
                  }}>
                    ▸ {isWaiting ? '실적 대기' : '보고 계속'}
                  </span>
                )}
              </span>

              <span style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
                  {mt(vessel.actualTotal)}
                </span>
                <span style={{ display: 'block', fontSize: '0.64rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: isProgress ? ACCENT : MUTED }}>
                  {pct === null ? '-' : `${pct.toFixed(1)}%`}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p style={{ margin: '10px 0 0', fontSize: '0.72rem', color: MUTED }}>
        기준일 {ymd(asOf)} (최신 보고일) · 바 클릭 = 상단 실적·누적 추이 전환 · 바 길이 = 항차 기간, 하역중 바의 진한 구간 = 신고량 대비 진행률 ·
        종료일이 없는 항차는 최신 보고일까지만 그린다
      </p>
    </div>
  );
}
