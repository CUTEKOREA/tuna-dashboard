"use client";

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TermTooltip from './TermTooltip';
import { ChartPatternDefs } from './ChartPatterns';
import {
  BANGKOK_TRADERS,
  TRADER_LABELS,
  aggregateTraderVolumes,
  bangkokTraderMonthly,
  bangkokPeriodLabel,
  type BangkokTrader,
} from '@/lib/data/bangkok-weekly';
import { logisticsWeeklyReport } from '@/lib/logistics-weekly-report';
import { HUB_ID } from '@/lib/chart-palette';

/* 트레이더 이름은 정체성. Metabase --chart-s* 를 쓰지 않는다. */
const TRADER_STYLE: Record<BangkokTrader, { gid: string; color: string }> = {
  FCF: { gid: 'tFcf', color: HUB_ID.bkk },
  ITOCHU: { gid: 'tIto', color: HUB_ID.abj },
  'TRI MARINE': { gid: 'tTri', color: HUB_ID.vig },
  DIRECT: { gid: 'tDir', color: HUB_ID.mnt },
  MALDIVES: { gid: 'tMal', color: HUB_ID.sey },
};

/** 차트 데이터키 = 화면 라벨 (L-01: 한글 라벨을 그대로 쓴다) */
const KEY = (t: BangkokTrader) => TRADER_LABELS[t];

type Row = { period: string } & Record<string, number | string>;

const MONTHLY_WINDOW = 24;
const FIRST_MONTH = bangkokTraderMonthly[0].month;
const LAST_MONTH = bangkokTraderMonthly[bangkokTraderMonthly.length - 1].month;
const FULL_RANGE = `${FIRST_MONTH}~${LAST_MONTH}`;

const monthlyRows: Row[] = bangkokTraderMonthly.slice(-MONTHLY_WINDOW).map((m) => ({
  period: m.month.slice(2),
  ...Object.fromEntries(BANGKOK_TRADERS.map((t) => [KEY(t), m.volumes[t]])),
}));

const aggRows = (g: 'quarterly' | 'yearly'): Row[] =>
  aggregateTraderVolumes(g).map((a) => ({
    period: bangkokPeriodLabel(a.period),
    ...Object.fromEntries(BANGKOK_TRADERS.map((t) => [KEY(t), a.volumes[t]])),
  }));

/** 표시 중인 기간의 트레이더별 합 — 하단 카드가 차트와 항상 같은 기간을 가리키게 한다 */
const sumRows = (rows: Row[]) =>
  BANGKOK_TRADERS.map((t) => ({
    key: t as string,
    name: TRADER_LABELS[t],
    color: TRADER_STYLE[t].color,
    total: rows.reduce((s, r) => s + Number(r[KEY(t)] ?? 0), 0),
  }));

/* 2026 누계 대조 — 기존 위젯은 2026-08-05 보고(317,175MT) 기준이었고,
   전 기간 소스는 2026-08-12 보고까지 반영해 8월 물량이 갱신됐다. 차이를 덮지 않고 밝힌다. */
const total2026 = aggregateTraderVolumes('yearly').find((a) => a.period === '2026')?.totalMt ?? 0;
const prev2026 = logisticsWeeklyReport.traderReceipts.total;
const diff2026 = total2026 - prev2026;
const RECONCILE_NOTE =
  `기록 있는 달만 합산하고 0으로 채우지 않습니다. 2026년 누계는 ${total2026.toLocaleString()}MT로, ` +
  `기존 2026-08-05 보고 기준 검산값 ${prev2026.toLocaleString()}MT와 ${Math.abs(diff2026).toLocaleString()}MT 차이가 있습니다 ` +
  `(2026-08 물량이 후속 보고에서 갱신). 원문 트라이마린 누계도 56,463MT로 정정돼 월별 합산과 일치합니다.`;

const VIEWS = {
  monthly: {
    rows: monthlyRows,
    xInterval: 2,
    totalLabel: `최근 ${MONTHLY_WINDOW}개월 누계`,
    note: `전체 ${bangkokTraderMonthly.length}개월(${FULL_RANGE}) 중 최근 ${MONTHLY_WINDOW}개월만 표시합니다 — 전 기간은 분기별·연도별 뷰에서 봅니다. ${RECONCILE_NOTE}`,
  },
  quarterly: {
    rows: aggRows('quarterly'),
    xInterval: 1,
    totalLabel: '전 기간 누계',
    note: `전 기간(${FULL_RANGE}) 월별 물량을 분기로 합산했습니다. ${RECONCILE_NOTE}`,
  },
  yearly: {
    rows: aggRows('yearly'),
    xInterval: 0,
    totalLabel: '전 기간 누계',
    note: `전 기간(${FULL_RANGE}) 월별 물량을 연도로 합산했습니다. 2026년은 8개월치입니다. ${RECONCILE_NOTE}`,
  },
} as const;

type Gran = keyof typeof VIEWS;

const GRAN_OPTIONS: readonly { key: Gran; label: string }[] = [
  { key: 'monthly', label: '월별' },
  { key: 'quarterly', label: '분기별' },
  { key: 'yearly', label: '연도별' },
];

/** 전 기간 누계 — 카드 위 대시보드 SIT/TAK 가 같은 숫자를 쓰도록 내보낸다 */
export const traderFullPeriod = {
  range: FULL_RANGE,
  months: bangkokTraderMonthly.length,
  totals: sumRows(VIEWS.yearly.rows),
  grandMt: sumRows(VIEWS.yearly.rows).reduce((s, c) => s + c.total, 0),
  total2026,
  diff2026,
};

export default function TraderStatus() {
  const [gran, setGran] = React.useState<Gran>('yearly');
  const [hover, setHover] = React.useState<number | null>(null);
  const view = VIEWS[gran];

  const cards = [
    ...sumRows(view.rows),
    {
      key: 'TOTAL',
      name: '합계',
      color: 'var(--text-main)',
      total: sumRows(view.rows).reduce((s, c) => s + c.total, 0),
    },
  ];

  return (
    <div style={{
      background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
      borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            <TermTooltip term={`트레이더별 반입 현황 (${FIRST_MONTH.slice(0, 4)}~${LAST_MONTH.slice(0, 4)})`} description="월별·분기별·연도별 트레이더별 반입 물량(MT) 추이" />
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            {FULL_RANGE} 트레이더별 반입 실적 (MT) — 방콕사무소 주간보고 종합분석
          </p>
        </div>

        <div role="group" aria-label="트레이더 반입 집계 입도" style={{ display: 'inline-flex', gap: '4px', padding: '4px', borderRadius: '10px', background: 'rgba(34,36,43,0.05)', border: '1px solid var(--panel-border)' }}>
          {GRAN_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              aria-pressed={o.key === gran}
              onClick={() => setGran(o.key)}
              style={{
                padding: '6px 14px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer',
                fontWeight: o.key === gran ? 700 : 500,
                border: `1px solid ${o.key === gran ? 'rgba(var(--w-emerald-500-rgb), 0.35)' : 'transparent'}`,
                background: o.key === gran ? 'rgba(var(--w-emerald-500-rgb), 0.14)' : 'transparent',
                color: o.key === gran ? 'var(--text-main)' : 'var(--text-muted)',
                transition: 'background 0.18s ease, color 0.18s ease',
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <p style={{ margin: '0 0 12px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(var(--w-amber-500-rgb), 0.08)', border: '1px solid rgba(var(--w-amber-500-rgb), 0.2)', color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5 }}>
        {view.note}
      </p>

      <div style={{ flex: 1, minHeight: 300 }}>
        <SafeResponsiveContainer width="100%" height={300}>
          <BarChart data={view.rows} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="28%">
            <ChartPatternDefs />
            <defs>
              {BANGKOK_TRADERS.map((t) => (
                <linearGradient key={TRADER_STYLE[t].gid} id={TRADER_STYLE[t].gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TRADER_STYLE[t].color} stopOpacity={0.98} />
                  <stop offset="100%" stopColor={TRADER_STYLE[t].color} stopOpacity={0.55} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--panel-border)" />
            <XAxis dataKey="period" stroke="var(--text-muted)" axisLine={false} tickLine={false} fontSize={12} interval={view.xInterval} />
            <YAxis stroke="var(--text-muted)" axisLine={false} tickLine={false} fontSize={11} tickFormatter={(val) => `${(val / 1000)}k`} />
            <Tooltip
              cursor={{ fill: 'rgba(var(--w-emerald-500-rgb), 0.06)' }}
              contentStyle={{ background: '#303c46', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#ffffff', boxShadow: '0 8px 24px rgba(16,24,40,0.35)' }}
              itemStyle={{ fontSize: '13px', color: '#e2e8f0' }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', color: '#c6c9d2' }}
              formatter={(value: any, name: any) => [`${Number(value).toLocaleString()} MT`, name]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            {BANGKOK_TRADERS.map((t, i) => (
              <Bar
                key={t}
                dataKey={KEY(t)}
                name={TRADER_LABELS[t]}
                stackId="a"
                fill={`url(#${TRADER_STYLE[t].gid})`}
                radius={i === 0 ? [0, 0, 5, 5] : i === BANGKOK_TRADERS.length - 1 ? [5, 5, 0, 0] : undefined}
              />
            ))}
          </BarChart>
        </SafeResponsiveContainer>
      </div>

      <p style={{ margin: '16px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{view.totalLabel}</p>
      <div data-mobile-stack style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
        {cards.map((c, i) => (
          <div key={c.key}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            style={{
              padding: '11px 10px', borderRadius: '8px', textAlign: 'center',
              background: c.key === 'TOTAL' ? 'rgba(var(--w-emerald-500-rgb), 0.08)' : 'rgba(34,36,43,0.03)',
              border: `1px solid ${c.key === 'TOTAL' ? 'rgba(var(--w-emerald-500-rgb), 0.25)' : 'var(--panel-border)'}`,
              borderTop: `2px solid ${c.color}`,
              transform: hover === i ? 'translateY(-2px)' : 'none',
              boxShadow: hover === i ? `0 6px 18px rgba(0,0,0,0.35)` : 'none',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              {c.key !== 'TOTAL' && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: c.color }} />}
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.name}</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: c.color, marginTop: '3px' }}>
              {c.total.toLocaleString()} <span style={{ fontSize: '10px' }}>MT</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
