/**
 * 하역 현황 지휘형 히어로 — 디자인 랩 6라운드 시안 2.
 * 선박 카드 클릭 = 상단 실적 KPI·누적 하역 추이 전환. 문법 원본은 HeroMarketCommand(r4-B 채택본).
 * 데이터는 /api/unloading-db 실응답만 사용하고, 수신 실패·빈 응답은 정직하게 표기한다.
 */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, ReferenceDot,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { getVesselStatusKind, type VesselStatusKind } from '../../../lib/unloading-operations';

/* 상태(하역중/대기/완료)는 증감이 아니므로 증감색 토큰을 쓰지 않는다 — 진행 중만 액센트, 나머지 muted */
const ACCENT = 'var(--chart-s1, #509ee3)';
const MUTED = 'var(--text-muted)';

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
type Vessel = VesselRaw & { id: string; kind: VesselStatusKind };

const mt = (value: number) => value.toLocaleString('ko-KR', { maximumFractionDigits: 1 });

/**
 * timeline.date는 'M/D' 또는 '7/2~7/4' 텍스트라 연도가 없다 — 항차 기간(dateRange) 시작 연도로 보정.
 * 이틀 이상을 묶은 보고는 뒷날짜까지 살려야 기준일이 실제보다 이르게 보이지 않는다.
 */
function reportDateLabel(dateRange: string, date: string): string {
  const md = date.match(/(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*~\s*(\d{1,2})\s*\/\s*(\d{1,2}))?/);
  if (!md) return date;
  const pad = (month: string, day: string) => `${month.padStart(2, '0')}.${day.padStart(2, '0')}`;
  const span = pad(md[1], md[2]) + (md[3] && md[4] ? `~${pad(md[3], md[4])}` : '');
  const start = dateRange.match(/(\d{4})\.(\d{1,2})/);
  if (!start) return span;
  // 항차가 해를 넘기면(예: 2025.12.18 ~ 2026.01.13) 시작 월보다 작은 월은 다음 해 보고다
  const year = Number(md[1]) >= Number(start[2]) ? Number(start[1]) : Number(start[1]) + 1;
  return `${year}.${span}`;
}

function toVessels(data: Record<string, VesselRaw>): Vessel[] {
  return Object.entries(data)
    .filter(([, v]) => v && typeof v.name === 'string' && Array.isArray(v.timeline))
    .map(([id, v]) => ({ ...v, id, kind: getVesselStatusKind(v.status) }))
    .sort((a, b) => STATUS_RANK[a.kind] - STATUS_RANK[b.kind]);
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

export default function UnloadingHeroCommand() {
  const [vessels, setVessels] = useState<Vessel[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/unloading-db', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json: { success?: boolean; data?: Record<string, VesselRaw> }) => {
        const list = json?.success && json.data ? toVessels(json.data) : [];
        if (list.length === 0) setFailed(true); else setVessels(list);
      })
      .catch(() => setFailed(true));
  }, []);

  const selected = useMemo(() => {
    if (!vessels) return null;
    // 초기 선택은 하역중 선박 우선 — 정렬에서 이미 앞으로 나와 있다
    return vessels.find((v) => v.id === selectedId) ?? vessels[0];
  }, [vessels, selectedId]);

  const series = useMemo(() => (selected ? selected.timeline.map((point) => ({
    label: reportDateLabel(selected.dateRange, point.date),
    cum: point.cumAmount,
    daily: point.dailyAmount,
  })) : []), [selected]);

  if (failed) return <p style={{ color: MUTED, fontSize: 13 }}>하역 데이터 수신 실패 — 시안 평가 불가 (새로고침으로 재시도)</p>;
  if (!vessels || !selected) return <p style={{ color: MUTED, fontSize: 13 }}>하역 데이터 수신 중…</p>;

  const progressPct = selected.reportedTotal > 0 ? (selected.actualTotal / selected.reportedTotal) * 100 : null;
  const remaining = selected.reportedTotal - selected.actualTotal;
  const reportCount = selected.timeline.length;
  // 누계가 아닌 일일 보고값의 평균 — 조정분이 끼면 누계÷횟수와 갈라진다
  const dailyAvg = reportCount > 0
    ? selected.timeline.reduce((sum, point) => sum + point.dailyAmount, 0) / reportCount
    : null;
  const last = series[series.length - 1];

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
            신고량 {mt(selected.reportedTotal)} (MT) 대비 진행률 {progressPct === null ? '—' : `${progressPct.toFixed(1)}%`}
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
            <Stat label="일평균 (MT/일)" value={dailyAvg === null ? '—' : mt(dailyAvg)} />
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
          <p style={{ fontSize: '0.75rem', color: MUTED, margin: 0 }}>일일 보고 2건 미만 — 누적 추이 표시 불가</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8, marginTop: 16 }}>
        {vessels.map((vessel) => {
          const mini = vessel.timeline.slice(-8).map((point) => ({ daily: point.dailyAmount }));
          const pct = vessel.reportedTotal > 0 ? (vessel.actualTotal / vessel.reportedTotal) * 100 : null;
          const statusColor = vessel.kind === 'progress' ? ACCENT : MUTED;
          const isActive = vessel.id === selected.id;
          const isHover = vessel.id === hoverId;
          // 같은 선박명이 항차별로 중복돼 시작 월을 함께 적는다 (예: M/V SEIN PHOENIX 2척)
          const voyage = vessel.dateRange.match(/(\d{4})\.(\d{1,2})/);
          return (
            <button
              key={vessel.id}
              type="button"
              onClick={() => setSelectedId(vessel.id)}
              onMouseEnter={() => setHoverId(vessel.id)}
              onMouseLeave={() => setHoverId(null)}
              aria-pressed={isActive}
              style={{
                textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                border: '1px solid ' + (isActive ? ACCENT : 'var(--card-border, #e2e4e9)'),
                background: isActive ? 'rgba(80, 158, 227, 0.08)' : 'transparent',
                borderRadius: 8, padding: '8px 10px',
                transform: isHover ? 'translateY(-2px)' : 'none',
                boxShadow: isHover ? '0 6px 16px rgba(16, 24, 40, 0.12)' : 'none',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
              }}
            >
              <span>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: MUTED }}>
                  {vessel.name}{voyage ? ` · ${voyage[1]}.${voyage[2].padStart(2, '0')}` : ''}
                </span>
                <span style={{ display: 'block', fontSize: '1.05rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
                  {mt(vessel.actualTotal)} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: MUTED }}>(MT)</span>
                </span>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: statusColor }}>
                  {STATUS_LABEL[vessel.kind]} {pct === null ? '—' : `${pct.toFixed(1)}%`}
                </span>
              </span>
              {mini.length >= 2 && (
                <LineChart width={72} height={30} data={mini} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <YAxis hide domain={['auto', 'auto']} />
                  <Line type="monotone" dataKey="daily" stroke={statusColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              )}
            </button>
          );
        })}
      </div>
      <p style={{ margin: '10px 0 0', fontSize: '0.72rem', color: MUTED }}>
        선박 클릭 = 상단 실적·누적 추이 전환 · 카드 추세선은 최근 일일 하역량 8회 · 그래프에 마우스를 올리면 날짜별 누계·당일
      </p>
    </div>
  );
}
