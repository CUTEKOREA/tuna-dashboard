'use client';

/**
 * 부산 입출항선 동향 (/port-intel) - 해양수산3팀 주간 통합본 기반 운영 인텔리전스.
 *
 * 데이터: lib/data/busan-port.ts (ADR-0005 인테이크) <- scripts/sync_busan_port.py
 * 원자료가 주간 메일 수기 취합이므로 텔레메트리는 SYNCED 고정 (L-09 정직 표기).
 * 선장 실명은 파이프라인에서 제거되어 이 화면에 노출되지 않는다.
 */

import React from 'react';
import { Anchor, CalendarRange, Clock3, Ship } from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  BUSAN_VESSEL_TYPES,
  getBusanLatestYear,
  getBusanMonthlySeries,
  getBusanPortData,
  getBusanStayComparison,
} from '@/lib/data/busan-port';
import WidgetCard from './WidgetCard';
import { TelemetryBadge } from './TelemetryBadge';

const TYPE_COLORS: Record<string, string> = {
  연승: '#38bdf8',
  선망: '#f59e0b',
  북양: '#8b5cf6',
};
const GHOST = '#94a3b8';
const INK_MUTED = 'var(--text-tertiary, #94a3b8)';

const data = getBusanPortData();
const LATEST = getBusanLatestYear();
const Y = String(LATEST);
const PREV = String(LATEST - 1);
const monthlySeries = getBusanMonthlySeries();
const stayRows = getBusanStayComparison();

const stay연승 = data.stay[Y]?.['연승'];
const stay연승전년 = data.stay[PREV]?.['연승'];
const waitingNow = data.kpi.waiting[Y] ?? null;
const waitingPrev = data.kpi.waiting[PREV] ?? null;

function pctDelta(cur: number | null, prev: number | null): string {
  if (cur == null || prev == null || prev === 0) return '';
  const pct = Math.round(((cur - prev) / prev) * 100);
  return `${pct >= 0 ? '+' : ''}${pct}%`;
}

/* ── 히어로: 경영 요약 + KPI 스트립 ────────────────────────────── */

function SummaryRow({ dot, title, body }: { dot: string; title: string; body: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        padding: '9px 2px',
        borderTop: '1px solid rgba(148, 163, 184, 0.12)',
        fontSize: '0.82rem',
        lineHeight: 1.65,
      }}
    >
      <span
        style={{
          flex: 'none',
          width: 8,
          height: 8,
          borderRadius: 99,
          background: dot,
          position: 'relative',
          top: -1,
        }}
      />
      <span style={{ color: 'var(--text-secondary, #cbd5e1)' }}>
        <strong style={{ color: 'var(--text-primary, #fff)' }}>{title}</strong> {body}
      </span>
    </div>
  );
}

function KpiCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ padding: '12px 16px' }}>
      <div style={{ fontSize: '0.68rem', color: INK_MUTED, fontWeight: 600 }}>{label}</div>
      <div
        style={{
          fontSize: '1.45rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          marginTop: 2,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--text-primary, #fff)',
        }}
      >
        {value}
        {sub && (
          <span style={{ fontSize: '0.68rem', color: INK_MUTED, fontWeight: 500, marginLeft: 6 }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

function Hero() {
  const stayPct = pctDelta(stay연승?.avg90 ?? null, stay연승전년?.avg90 ?? null);
  const waitingPct = pctDelta(waitingNow, waitingPrev);
  const fc = data.kpi.forecast;
  return (
    <section
      style={{
        background: 'var(--card-bg, rgba(20, 28, 52, 0.55))',
        border: '1px solid var(--card-border, rgba(140, 170, 255, 0.12))',
        borderRadius: 16,
        padding: '20px 22px 14px',
        marginBottom: 20,
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '1.15rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #67e8f9 45%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          부산 입출항선 동향
        </h2>
        <TelemetryBadge status="SYNCED" syncDate={data.asof} label="주간 메일 취합" />
        <span style={{ fontSize: '0.7rem', color: INK_MUTED }}>
          {data.sourceNote}
          {data.mailCount ? ` · 메일 ${data.mailCount}건` : ''}
        </span>
      </div>

      <div style={{ marginTop: 12 }}>
        <SummaryRow
          dot="#f87171"
          title="체류 장기화 심화."
          body={`연승 평균 체항 ${stay연승?.avg90 ?? '-'}일(90일 초과 제외), 전년 ${
            stay연승전년?.avg90 ?? '-'
          }일 대비 ${stayPct || '비교 불가'}. 중동 정세발 유가 급등으로 조업 대신 계류를 택한 선박이 늘었다.`}
        />
        <SummaryRow
          dot="#fbbf24"
          title={`교대 대기 선장 ${waitingNow ?? '-'}명.`}
          body={`전년 ${waitingPrev ?? '-'}명 대비 ${waitingPct || '비교 불가'}. 대기 풀 확대는 영입 검토 대상 증가를 뜻한다.`}
        />
        {fc && (
          <SummaryRow
            dot="#38bdf8"
            title={`하반기 입항 예상 ${fc.n}척.`}
            body={`12월 ${fc.dec}척 집중. 상가 슬롯 경합과 교대 인력 사전 배치 검토가 필요하다.`}
          />
        )}
        <SummaryRow
          dot="#94a3b8"
          title="이번 주 변화."
          body={`신규 입항 ${data.weekly.in.length}건, 출항 ${data.weekly.out.length}건, 선장 교대 ${
            data.weekly.out.filter((o) => o.change).length
          }건 (보고주 ${data.weekly.w0.slice(5)}~${data.weekly.w1.slice(5)}).`}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          marginTop: 12,
          background: 'rgba(15, 23, 42, 0.35)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <KpiCell label={`${Y} 어기`} value={String(data.kpi.runs[Y] ?? '-')} sub={`이월 ${data.kpi.carry[Y] ?? 0}`} />
        <KpiCell
          label="연승 / 선망 / 북양"
          value={BUSAN_VESSEL_TYPES.map((t) => data.kpi.byType[Y]?.[t] ?? 0).join(' / ')}
          sub="척"
        />
        <KpiCell label="현재 체류 중" value={String(data.kpi.openNow)} sub="척" />
        <KpiCell label="당사 어기" value={String(data.kpi.own[Y] ?? 0)} sub="건" />
        <KpiCell label="선장 교대" value={String(data.kpi.changes[Y] ?? 0)} sub="건" />
      </div>
    </section>
  );
}

/* ── 위젯 1: 이번 주 변화 ──────────────────────────────────────── */

function WeeklyRow({
  tag,
  color,
  children,
}: {
  tag: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 2px',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
        fontSize: '0.8rem',
      }}
    >
      <span
        style={{
          flex: 'none',
          width: 44,
          textAlign: 'center',
          fontSize: '0.66rem',
          fontWeight: 700,
          color: '#0b1120',
          background: color,
          borderRadius: 6,
          padding: '3px 0',
        }}
      >
        {tag}
      </span>
      <span style={{ flex: 1, minWidth: 0, color: 'var(--text-secondary, #cbd5e1)' }}>{children}</span>
    </div>
  );
}

function WeeklyDiffWidget() {
  const chg = data.weekly.out.filter((o) => o.change).length;
  return (
    <WidgetCard
      title="이번 주 변화"
      icon={CalendarRange}
      iconColor="#38bdf8"
      pillar="S3"
      cardDesc={`보고주 ${data.weekly.w0} ~ ${data.weekly.w1} 신규 취합(first_report)·출항일 기준, 직전 보고주 병기`}
      telemetry={{ status: 'SYNCED', syncDate: data.asof, source: '주간 메일 취합' }}
      kpiPanel={[
        { label: '신규 입항', value: data.weekly.in.length, sub: `전주 ${data.weekly.prev.in}` },
        { label: '출항', value: data.weekly.out.length, sub: `전주 ${data.weekly.prev.out}` },
        { label: '선장 교대', value: chg, sub: `전주 ${data.weekly.prev.chg}` },
      ]}
      customBody={
        <div>
          {data.weekly.in.map((r) => (
            <WeeklyRow key={`in-${r.ship}`} tag="입항" color="#7dd3fc">
              <strong style={{ color: 'var(--text-primary, #fff)' }}>{r.ship}</strong> · {r.co} ·{' '}
              {r.type} · {r.arrive} 입항{r.own ? ' · 당사' : ''}
            </WeeklyRow>
          ))}
          {data.weekly.out.map((r) => (
            <WeeklyRow key={`out-${r.ship}`} tag="출항" color="#cbd5e1">
              <strong style={{ color: 'var(--text-primary, #fff)' }}>{r.ship}</strong> · {r.co} ·{' '}
              {r.depart} 출항 (체류 {r.days ?? '-'}일){r.change ? ' · 선장 교대' : ''}
              {r.own ? ' · 당사' : ''}
            </WeeklyRow>
          ))}
          {data.weekly.in.length + data.weekly.out.length === 0 && (
            <p style={{ fontSize: '0.78rem', color: INK_MUTED, margin: '8px 0 0' }}>
              이번 주 신규 입항·출항 없음
            </p>
          )}
        </div>
      }
      takeaway={{
        situation: `보고주(${data.weekly.w0.slice(5)}~${data.weekly.w1.slice(5)}) 신규 입항 ${
          data.weekly.in.length
        }건, 출항 ${data.weekly.out.length}건, 선장 교대 ${chg}건으로 전주(${data.weekly.prev.in}·${
          data.weekly.prev.out
        }·${data.weekly.prev.chg}건)와 유사한 저활동 구간이다. 현재 항내 체류는 ${data.kpi.openNow}척이다.`,
        actionPlan:
          '주간 변화가 적은 구간은 상가 슬롯 예약과 교대 인력 배치를 조정할 적기다. 12월 입항 집중 전에 하반기 계획을 확정한다.',
        source: `해양수산3팀 주간 메일 ${data.mailCount ?? '-'}건 취합 (${data.asof} 기준)`,
      }}
    />
  );
}

/* ── 위젯 2: 월별 입출항 (전년 병기) ────────────────────────────── */

function MonthlyWidget() {
  const totalIn = monthlySeries.reduce((s, r) => s + r.입항, 0);
  const totalOut = monthlySeries.reduce((s, r) => s + r.출항, 0);
  const may = data.monthly[Y]?.find((r) => r.m === 5);
  return (
    <WidgetCard
      title="월별 입출항 추이"
      icon={Ship}
      iconColor="#38bdf8"
      pillar="S3"
      unit="(척)"
      cardDesc={`${Y}년 월별 입항·출항 척수, 점선 = ${PREV}년 동월 (전년 대비 페이스 비교)`}
      telemetry={{ status: 'SYNCED', syncDate: data.asof, source: '주간 메일 취합' }}
      chartHeight={280}
      chart={
        <ComposedChart data={monthlySeries} margin={{ top: 8, right: 12, bottom: 4, left: -14 }}>
          <CartesianGrid stroke="var(--chart-grid, #252525)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: GHOST }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: GHOST }} tickLine={false} axisLine={false} allowDecimals={false} />
          <RechartsTooltip
            contentStyle={{
              background: 'var(--chart-tooltip-bg, #11182f)',
              border: '1px solid var(--chart-tooltip-border, #272727)',
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="입항" fill="#38bdf8" radius={[2, 2, 0, 0]} maxBarSize={18} />
          <Bar dataKey="출항" fill="rgba(148, 163, 184, 0.45)" radius={[2, 2, 0, 0]} maxBarSize={18} />
          <Line dataKey="전년입항" name={`${PREV} 입항`} stroke="#67e8f9" strokeDasharray="5 4" strokeWidth={1.6} dot={false} />
          <Line dataKey="전년출항" name={`${PREV} 출항`} stroke={GHOST} strokeDasharray="5 4" strokeWidth={1.4} dot={false} />
        </ComposedChart>
      }
      takeaway={{
        situation: `${Y}년 누적 입항 ${totalIn}척, 출항 ${totalOut}척. 1~4월 입항 대비 출항이 적어 항내 체류가 누적됐고, 5월 출항 ${
          may?.o ?? '-'
        }척(단월 최대)으로 해소 국면에 들어섰다.`,
        actionPlan:
          '유가·어가 조건이 유지되면 출항 재개 흐름이 이어진다. 전년 점선과의 간격으로 월별 페이스를 점검하고, 입항 몰림 달의 하역·상가 일정을 선제 조정한다.',
        source: `주간 메일 어기 병합 (${data.asof} 기준)`,
      }}
    />
  );
}

/* ── 위젯 3: 업종별 체류일 ─────────────────────────────────────── */

function StayWidget() {
  const chartData = stayRows.map((row) => ({
    type: row.type,
    전체포함: row.avg,
    '90일제외': row.avg90,
    전년90일제외: row.prevAvg90,
  }));
  return (
    <WidgetCard
      title="업종별 평균 체류일"
      icon={Clock3}
      iconColor="#f59e0b"
      pillar="S2"
      unit="(일)"
      cardDesc="출항 완료 어기 기준, 365일 초과 극단 계류 상시 제외 · 전체 포함 vs 90일 초과 제외 vs 전년"
      telemetry={{ status: 'SYNCED', syncDate: data.asof, source: '주간 메일 취합' }}
      chartHeight={260}
      chart={
        <ComposedChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: -14 }}>
          <CartesianGrid stroke="var(--chart-grid, #252525)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="type" tick={{ fontSize: 12, fill: GHOST }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: GHOST }} tickLine={false} axisLine={false} />
          <RechartsTooltip
            contentStyle={{
              background: 'var(--chart-tooltip-bg, #11182f)',
              border: '1px solid var(--chart-tooltip-border, #272727)',
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="전체포함" name="전체 포함" fill="rgba(148, 163, 184, 0.4)" radius={[2, 2, 0, 0]} maxBarSize={26} />
          <Bar dataKey="90일제외" name="90일 초과 제외" fill="#38bdf8" radius={[2, 2, 0, 0]} maxBarSize={26} />
          <Bar dataKey="전년90일제외" name={`전년 (90일 제외)`} fill="rgba(103, 232, 249, 0.35)" radius={[2, 2, 0, 0]} maxBarSize={26} />
        </ComposedChart>
      }
      kpiPanel={stayRows.map((row) => ({
        label: `${row.type} (완료 ${row.n}건)`,
        value: `${row.avg90 ?? '-'}일`,
        sub: `전년 ${row.prevAvg90 ?? '-'}일 · 장기 ${row.long}건 제외`,
      }))}
      takeaway={{
        situation: `연승 체항 ${stay연승?.avg90 ?? '-'}일로 전년 ${
          stay연승전년?.avg90 ?? '-'
        }일 대비 ${pctDelta(stay연승?.avg90 ?? null, stay연승전년?.avg90 ?? null) || '-'} 길어졌다. 중동 정세발 유가 급등으로 조업 대신 계류를 택한 선박이 늘어난 결과이며, 유가 안정 이후 5월부터 출항이 재개됐다.`,
        actionPlan:
          '체류 장기화는 상가·수리 슬롯 경합과 계선 비용으로 직결된다. 90일 초과 장기 계류선은 별도 관리 목록으로 분리해 재출항 조건(유가·어가)을 추적한다.',
        source: `주간 메일 어기 병합, 문서 표기 규칙 재계산 (${data.asof} 기준)`,
      }}
    />
  );
}

/* ── 위젯 4: 입출항 타임라인 (간트) ─────────────────────────────── */

function pctOfYear(iso: string | null, fallback: number): number {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (d.getFullYear() < LATEST) return 0;
  if (d.getFullYear() > LATEST) return 100;
  const start = Date.UTC(LATEST, 0, 1);
  const end = Date.UTC(LATEST + 1, 0, 1);
  return Math.min(100, Math.max(0, ((d.getTime() - start) / (end - start)) * 100));
}

function TimelineWidget() {
  const rows = data.timeline;
  const asofPct = pctOfYear(data.asof, 100);
  return (
    <WidgetCard
      title="입출항 타임라인"
      icon={Anchor}
      iconColor="#8b5cf6"
      pillar="S3"
      cardDesc={`${Y}년 어기 ${rows.length}건 · 좌측 절단 = 전년 이월 · 우측 열림 = 출항 미정(체류 중) · 청록 = 당사`}
      telemetry={{ status: 'SYNCED', syncDate: data.asof, source: '주간 메일 취합' }}
      customBody={
        <div>
          {/* 월 축 */}
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 70px', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: '0.66rem', fontWeight: 700, color: INK_MUTED }}>선박 · 선사</span>
            <div style={{ position: 'relative', height: 16 }}>
              {Array.from({ length: 12 }, (_, i) => (
                <span
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${(i / 12) * 100}%`,
                    fontSize: '0.6rem',
                    color: INK_MUTED,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {i + 1}월
                </span>
              ))}
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 700, color: INK_MUTED, textAlign: 'right' }}>
              체류
            </span>
          </div>
          <div style={{ maxHeight: 420, overflowY: 'auto', marginTop: 6 }}>
            {rows.map((r) => {
              const left = r.carry ? 0 : pctOfYear(r.arrive, 0);
              const right = r.depart ? pctOfYear(r.depart, 100) : asofPct;
              const width = Math.max(0.8, right - left);
              const color = r.own ? '#2dd4bf' : TYPE_COLORS[r.type] ?? GHOST;
              return (
                <div
                  key={`${r.ship}-${r.arrive}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '150px 1fr 70px',
                    gap: 10,
                    alignItems: 'center',
                    padding: '3px 0',
                    borderTop: '1px solid rgba(148, 163, 184, 0.07)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.72rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: r.own ? '#5eead4' : 'var(--text-secondary, #cbd5e1)',
                      fontWeight: r.own ? 700 : 500,
                    }}
                    title={`${r.ship} · ${r.co}`}
                  >
                    {r.ship}
                    <span style={{ color: INK_MUTED, fontWeight: 400, marginLeft: 6, fontSize: '0.64rem' }}>
                      {r.co}
                    </span>
                  </span>
                  <div style={{ position: 'relative', height: 12, background: 'rgba(148, 163, 184, 0.06)', borderRadius: 3 }}>
                    <span
                      title={`${r.arrive ?? '?'} ~ ${r.depart ?? (r.open ? '체류 중' : '미정')}`}
                      style={{
                        position: 'absolute',
                        left: `${left}%`,
                        width: `${width}%`,
                        top: 2,
                        bottom: 2,
                        background: color,
                        opacity: r.open ? 0.95 : 0.55,
                        borderRadius: 3,
                        borderLeft: r.carry ? '2px solid #f87171' : undefined,
                        borderTopRightRadius: r.open ? 0 : 3,
                        borderBottomRightRadius: r.open ? 0 : 3,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      color: r.open ? '#f87171' : INK_MUTED,
                      fontWeight: r.open ? 700 : 500,
                    }}
                  >
                    {r.days != null ? `${r.days}일` : '-'}
                    {r.open ? '+' : ''}
                  </span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '0.66rem', color: INK_MUTED, margin: '8px 0 0' }}>
            색상: 연승 하늘 · 선망 호박 · 북양 보라 · 당사 청록 | 적색 좌측선 = 전년 이월, 짙은 바 = 체류 중
          </p>
        </div>
      }
      takeaway={{
        situation: `${Y}년 어기 ${rows.length}건 중 현재 체류 중 ${data.kpi.openNow}척. 상반기 입항 몰림과 출항 지연이 겹쳐 4월 항내 체류가 정점을 찍었고, 5월 이후 해소 국면이다.`,
        actionPlan:
          '체류 중(짙은 바) 선박의 출항 일정과 이월(적색선) 장기 계류선을 주간 단위로 추적한다. 당사 선박(청록)의 입출항 창과 타사 밀집 구간이 겹치면 상가 일정을 앞당긴다.',
        source: `주간 메일 어기 병합, 이월 중복 제거 (${data.asof} 기준)`,
      }}
    />
  );
}

/* ── 페이지 ────────────────────────────────────────────────────── */

export default function BusanPortDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Hero />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(480px, 100%), 1fr))',
          gap: 20,
        }}
      >
        <WeeklyDiffWidget />
        <MonthlyWidget />
      </div>
      <StayWidget />
      <TimelineWidget />
    </div>
  );
}
