/**
 * 하역 월별 그룹 보드 — 디자인 랩 7라운드 시안 A.
 * r6 판정 «하단 정렬이 월 기준으로»를 «정렬»이 아닌 «월별 그룹핑»으로 해석한 형태.
 * 선택 개념이 없다 — 상단 전 항차 합계 한 줄 + 월 섹션을 스크롤로 훑는 보드다.
 * 데이터 fetch·연도 보정은 r6 UnloadingHeroCommand 를 재사용하고, 수신 실패·빈 응답은 정직하게 표기한다.
 */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, YAxis } from 'recharts';
import { getVesselStatusKind, type VesselStatusKind } from '../../../lib/unloading-operations';

/* 상태(하역중/대기/완료)는 증감이 아니므로 증감색 토큰을 쓰지 않는다 — 진행 중만 액센트, 나머지 muted */
const ACCENT = 'var(--chart-s1, #509ee3)';
const MUTED = 'var(--text-muted)';
const LINE = 'var(--card-border, #e2e4e9)';

const STATUS_LABEL: Record<VesselStatusKind, string> = {
  progress: '하역중',
  waiting: '하역대기',
  completed: '하역완료',
};
const STATUS_RANK: Record<VesselStatusKind, number> = { progress: 0, waiting: 1, completed: 2 };
const STATUS_ORDER: VesselStatusKind[] = ['progress', 'waiting', 'completed'];

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
type MonthGroup = { key: number; label: string; vessels: Vessel[] };

const mt = (value: number) => value.toLocaleString('ko-KR', { maximumFractionDigits: 1 });

/**
 * timeline.date는 'M/D' 또는 '7/2~7/4' 텍스트라 연도가 없다 — 항차 기간(dateRange) 시작 연도로 보정.
 * 표시 라벨과 최신 보고 비교용 정렬 키를 한 번에 낸다(기준일이 두 파서로 갈라지지 않게).
 */
function parseReport(dateRange: string, date: string): { label: string; key: number } {
  const md = date.match(/(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*~\s*(\d{1,2})\s*\/\s*(\d{1,2}))?/);
  if (!md) return { label: date, key: 0 };
  const pad = (month: string, day: string) => `${month.padStart(2, '0')}.${day.padStart(2, '0')}`;
  const span = pad(md[1], md[2]) + (md[3] && md[4] ? `~${pad(md[3], md[4])}` : '');
  const start = dateRange.match(/(\d{4})\.(\d{1,2})/);
  if (!start) return { label: span, key: 0 };
  // 항차가 해를 넘기면(예: 2025.12.18 ~ 2026.01.13) 시작 월보다 작은 월은 다음 해 보고다
  const year = Number(md[1]) >= Number(start[2]) ? Number(start[1]) : Number(start[1]) + 1;
  // 이틀 이상을 묶은 보고는 뒷날짜가 기준일 — 12/30~1/2처럼 묶음이 해를 넘기는 경우도 살린다
  const endMonth = md[3] ? Number(md[3]) : Number(md[1]);
  const endDay = md[4] ? Number(md[4]) : Number(md[2]);
  const endYear = endMonth < Number(md[1]) ? year + 1 : year;
  return { label: `${year}.${span}`, key: endYear * 10000 + endMonth * 100 + endDay };
}

function toVessels(data: Record<string, VesselRaw>): Vessel[] {
  return Object.entries(data)
    .filter(([, v]) => v && typeof v.name === 'string' && Array.isArray(v.timeline))
    .map(([id, v]) => ({ ...v, id, kind: getVesselStatusKind(v.status) }));
}

/** 그룹 기준은 항차 시작 연월 — 대기 항차의 '2026.07.20 선적계획 확정 · …' 형태도 같은 정규식으로 잡힌다 */
function voyageMonth(dateRange: string): { key: number; label: string } {
  const m = dateRange.match(/(\d{4})\.(\d{1,2})/);
  if (!m) return { key: 0, label: '연월 미상' };
  return { key: Number(m[1]) * 100 + Number(m[2]), label: `${m[1]}.${m[2].padStart(2, '0')}` };
}

function groupByMonth(vessels: Vessel[]): MonthGroup[] {
  const map = new Map<number, MonthGroup>();
  for (const vessel of vessels) {
    const { key, label } = voyageMonth(vessel.dateRange);
    const group = map.get(key) ?? { key, label, vessels: [] };
    group.vessels.push(vessel);
    map.set(key, group);
  }
  return [...map.values()]
    // 최신 월이 위. 연월 미상(key 0)은 자연히 맨 아래. 같은 월이면 하역중 → 대기 → 완료, 그 다음 실적순
    .sort((a, b) => b.key - a.key)
    .map((group) => ({
      ...group,
      vessels: [...group.vessels].sort(
        (a, b) => STATUS_RANK[a.kind] - STATUS_RANK[b.kind] || b.actualTotal - a.actualTotal,
      ),
    }));
}

function StatusCounts({ vessels }: { vessels: Vessel[] }) {
  return (
    <>
      {STATUS_ORDER.map((kind) => ({ kind, count: vessels.filter((v) => v.kind === kind).length }))
        .filter(({ count }) => count > 0)
        .map(({ kind, count }) => (
          <span key={kind} style={{ fontSize: '0.72rem', fontWeight: 700, color: kind === 'progress' ? ACCENT : MUTED }}>
            {STATUS_LABEL[kind]} {count}척
          </span>
        ))}
    </>
  );
}

function VesselCard({ vessel }: { vessel: Vessel }) {
  const statusColor = vessel.kind === 'progress' ? ACCENT : MUTED;
  const pct = vessel.reportedTotal > 0 ? (vessel.actualTotal / vessel.reportedTotal) * 100 : null;
  const mini = vessel.timeline.slice(-8).map((point) => ({ daily: point.dailyAmount }));
  const lastPoint = vessel.timeline[vessel.timeline.length - 1];
  const lastLabel = lastPoint ? parseReport(vessel.dateRange, lastPoint.date).label : null;

  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)' }}>{vessel.name}</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: statusColor, whiteSpace: 'nowrap' }}>
          {STATUS_LABEL[vessel.kind]}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8, marginTop: 2 }}>
        <span style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
          {mt(vessel.actualTotal)}
          <span style={{ fontSize: '0.7rem', fontWeight: 400, color: MUTED, marginLeft: 4 }}>(MT)</span>
        </span>
        {mini.length >= 2 && (
          <LineChart width={84} height={30} data={mini} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <YAxis hide domain={['auto', 'auto']} />
            <Line type="monotone" dataKey="daily" stroke={statusColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        )}
      </div>
      <div style={{ height: 4, borderRadius: 2, background: LINE, overflow: 'hidden', marginTop: 8 }}>
        <div style={{ width: `${Math.max(0, Math.min(100, pct ?? 0))}%`, height: '100%', background: statusColor }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 5, fontSize: '0.68rem', color: MUTED }}>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          신고 {mt(vessel.reportedTotal)} (MT) 대비 {pct === null ? '—' : `${pct.toFixed(1)}%`}
        </span>
        <span style={{ whiteSpace: 'nowrap' }}>{lastLabel ? `보고 ${lastLabel}` : '보고 없음'}</span>
      </div>
    </div>
  );
}

export default function UnloadingMonthBoard() {
  const [vessels, setVessels] = useState<Vessel[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/unloading-db', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json: { success?: boolean; data?: Record<string, VesselRaw> }) => {
        const list = json?.success && json.data ? toVessels(json.data) : [];
        if (list.length === 0) setFailed(true); else setVessels(list);
      })
      .catch(() => setFailed(true));
  }, []);

  const groups = useMemo(() => (vessels ? groupByMonth(vessels) : []), [vessels]);

  // 기준일 = 전 항차 통틀어 가장 최근 일일 보고 (보고가 하나도 없으면 표기하지 않는다)
  const asOf = useMemo(() => {
    let best: { label: string; key: number } | null = null;
    for (const vessel of vessels ?? []) {
      for (const point of vessel.timeline) {
        const parsed = parseReport(vessel.dateRange, point.date);
        if (!best || parsed.key > best.key) best = parsed;
      }
    }
    return best;
  }, [vessels]);

  if (failed) return <p style={{ color: MUTED, fontSize: 13 }}>하역 데이터 수신 실패 — 시안 평가 불가 (새로고침으로 재시도)</p>;
  if (!vessels) return <p style={{ color: MUTED, fontSize: 13 }}>하역 데이터 수신 중…</p>;

  const cumulative = vessels.reduce((sum, vessel) => sum + vessel.actualTotal, 0);

  return (
    <div className="dsc-card" style={{ padding: '20px 22px' }}>
      <div style={{ borderBottom: `1px solid ${LINE}`, paddingBottom: 14 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: MUTED }}>전 항차 누계 실적</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
            {mt(cumulative)}
            <span style={{ fontSize: '0.9rem', fontWeight: 400, color: MUTED, marginLeft: 6 }}>(MT)</span>
          </span>
          <span style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <StatusCounts vessels={vessels} />
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: MUTED, marginTop: 4 }}>
          {asOf ? `기준일 ${asOf.label} · ` : ''}항차 {vessels.length}건 · 월 구분은 항차 시작 연월
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.key}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', margin: '16px 0 8px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
              {group.label}
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: MUTED }}>{group.vessels.length}척</span>
            <StatusCounts vessels={group.vessels} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 8 }}>
            {group.vessels.map((vessel) => <VesselCard key={vessel.id} vessel={vessel} />)}
          </div>
        </section>
      ))}

      <p style={{ margin: '14px 0 0', fontSize: '0.72rem', color: MUTED }}>
        월 섹션은 항차 시작 연월 최신순 · 카드 추세선은 최근 일일 하역량 8회 · 진행률 바는 신고량 대비 실적
        · 하역중 항차는 기간이 아직 끝나지 않아 완료 항차와 실적을 같은 뜻으로 읽으면 안 된다
      </p>
    </div>
  );
}
