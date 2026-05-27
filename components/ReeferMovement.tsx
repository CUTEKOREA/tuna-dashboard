"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Ship, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, Anchor, Factory, Package, Table2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, LineChart, Line, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './ReeferMovement.module.css';
import TermTooltip from './TermTooltip';

import BANGKOK_PORT_DATA from '../data/reefer_week19.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

// ── helpers ──
function parseNum(s: any): number {
  if (typeof s !== 'string') return typeof s === 'number' ? s : 0;
  return parseFloat(s.replace(/,/g, '')) || 0;
}

// Cannery display-name mapping (short → readable)
const CANNERY_LABELS: Record<string, string> = {
  UC: 'Unicord', TUM: 'TUM', TUG: 'TUG', CMC: 'CMC', ISA: 'ISA',
  GPZ: 'GPZ', 'I-TAIL': 'I-TAIL', RS: 'RS', PTY: 'PTY', PCI: 'PCI',
  RMK: 'RMK', AEC: 'AEC', AYA: 'AYA', MMP: 'MMP', SK: 'SK',
  SIF: 'SIF', TCC: 'TCC', TOV: 'TOV', ASIAN: 'ASIAN', SPA: 'SPA',
  DIMCN: 'DIMCN', GB: 'GB', KF: 'KF', FOOD: 'FOOD', POP: 'POP',
  SCC: 'SCC', SE: 'SE', SHIP: 'SHIP',
};

// Color palette for bars
const BAR_COLORS = [
  'var(--color-success)', 'var(--color-info)', 'var(--color-warning)', 'var(--color-danger)', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#a855f7',
  '#64748b', '#e11d48', '#84cc16', '#6366f1', '#0ea5e9',
  '#d946ef', '#f43f5e', '#22d3ee', 'var(--color-warning)', '#fb923c',
];

const congestionTrend = [
  { day: 'D-13', wait: 0 }, { day: 'D-12', wait: 0 }, { day: 'D-11', wait: 0 },
  { day: 'D-10', wait: 0 }, { day: 'D-9', wait: 0 }, { day: 'D-8', wait: 0 },
  { day: 'D-7', wait: 0 }, { day: 'D-6', wait: 0 }, { day: 'D-5', wait: 0 },
  { day: 'D-4', wait: 0 }, { day: 'D-3', wait: 0 }, { day: 'D-2', wait: 0 },
  { day: 'D-1', wait: 0 }, { day: 'Today', wait: 0 }
];

// Legacy table columns
const COLUMNS = [
  "ASIAN", "AEC", "AYA", "CMC", "DIMCN", "GB", "GPZ", "ISA", "I-TAIL", "KF",
  "MMP", "PCI", "FOOD", "POP", "PTY", "RMK", "RS", "SK", "SIF", "SPA",
  "SCC", "SE", "TCC", "TOV", "TUG", "TUM", "UC", "SHIP", "OTHER"
];

// ── Custom tooltip for bar chart ──
function CanneryTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
      padding: '12px 16px', fontSize: '0.82rem', color: '#e2e8f0', minWidth: 180,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    }}>
      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6, color: 'var(--text-primary)' }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ color: '#94a3b8' }}>총 물량</span>
        <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{d?.total?.toLocaleString()} MT</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ color: '#94a3b8' }}>운반선 수</span>
        <span style={{ fontWeight: 600 }}>{d?.vesselCount}척</span>
      </div>
      {d?.vessels && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: '#64748b' }}>
          {d.vessels.join(' · ')}
        </div>
      )}
    </div>
  );
}

export default function ReeferMovement() {
  const [showLegacy, setShowLegacy] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [congestionData, setCongestionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCongestion() {
      try {
        const res = await fetch('/api/logistics/congestion');
        if (!res.ok) throw new Error('Failed to fetch congestion data');
        const json = await res.json();
        setCongestionData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCongestion();
  }, []);

  // ── Aggregate: cannery totals ──
  const canneryAgg = useMemo(() => {
    const agg: Record<string, { total: number; vesselCount: number; vessels: string[] }> = {};
    BANGKOK_PORT_DATA.forEach((row) => {
      Object.entries(row.deliveries).forEach(([key, val]) => {
        if (key === 'OTHER') return;
        const num = parseNum(val);
        if (num <= 0) return;
        if (!agg[key]) agg[key] = { total: 0, vesselCount: 0, vessels: [] };
        agg[key].total += num;
        agg[key].vesselCount += 1;
        agg[key].vessels.push(row.carrier);
      });
    });
    return Object.entries(agg)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.total - a.total);
  }, []);

  // ── Carrier cards data ──
  const carrierCards = useMemo(() => {
    return BANGKOK_PORT_DATA.map((row) => {
      const deliveryEntries = Object.entries(row.deliveries)
        .filter(([k]) => k !== 'OTHER')
        .map(([k, v]) => ({ cannery: k, amount: parseNum(v) }))
        .filter(d => d.amount > 0)
        .sort((a, b) => b.amount - a.amount);
      const totalMT = deliveryEntries.reduce((s, d) => s + d.amount, 0);
      const other = row.deliveries['OTHER' as keyof typeof row.deliveries] || '';
      return { carrier: row.carrier, date: row.date, deliveries: deliveryEntries, totalMT, other };
    });
  }, []);

  const grandTotal = useMemo(() => carrierCards.reduce((s, c) => s + c.totalMT, 0), [carrierCards]);

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className={styles.header} style={{ marginBottom: 0 }}>
          <Ship size={24} />
          BANGKOK PORT CONGESTION & REEFER MOVEMENT
        </h2>
        {congestionData && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '11px', 
            fontWeight: 600,
            background: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--color-success)',
            padding: '4px 12px',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px #10b981' }}></div>
            Live 🟢 Port Telemetry
          </div>
        )}
      </div>
      
      {/* ── KPI Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '16px', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'var(--color-info)', borderRadius: '50%' }} />
            <TermTooltip term="CONGESTION INDEX" description="체선율(항만 혼잡도): 항만의 하역 능력 대비 대기 중인 운반선의 비율입니다. 체선율이 높을수록 배에서 참치를 내리기까지 걸리는 시간이 길어져 원어 수급 일정에 차질이 빚어질 수 있습니다." />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '12px' }}>
            {loading ? '...' : `${congestionData?.metrics?.congestionIndex || 42}%`}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            {congestionData?.auditStatus?.grade || 'Analyzing...'}
          </div>
          <div style={{ 
            position: 'absolute', bottom: 0, left: 0, height: '4px', 
            width: `${congestionData?.metrics?.congestionIndex || 0}%`, 
            background: 'linear-gradient(90deg, #3b82f6, #10b981)',
            opacity: 0.5
          }} />
        </div>

        <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '16px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}><TermTooltip term="AVG WAITING TIME" description="평균 대기 일수: 운반선이 방콕항 묘박지에 도착한 시점부터 실제로 하역 부두에 접안하기까지 걸리는 평균 일수입니다." /></div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '8px' }}>
            {loading ? '...' : congestionData?.metrics?.avgWaitDays} <span style={{fontSize: '14px', color: 'var(--text-muted)'}}>Days</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-success)', marginTop: '8px', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
            <TrendingUp size={16} style={{ marginRight: '6px'}} /> 
            {loading ? 'Syncing' : 'Operational'}
          </div>
        </div>

        <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '16px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}><TermTooltip term="VESSELS AT ANCHORAGE" description="묘박지 대기 선박: 하역 차례를 기다리며 항구 앞바다(묘박지, Anchorage)에 닻을 내리고 대기 중인 냉동 운반선의 척수입니다." /></div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '8px' }}>
            {loading ? '...' : congestionData?.metrics?.vesselsAtAnchorage} <span style={{fontSize: '14px', color: 'var(--text-muted)'}}>Carriers</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Est. {loading ? '...' : congestionData?.metrics?.backlogMT?.toLocaleString()} MT Backlog
          </div>
        </div>

        <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>WAITING TREND (14D)</div>
          <div style={{ flex: 1, minHeight: '60px' }}>
            {!loading && congestionData?.metrics?.trend && (
              <SafeResponsiveContainer width="100%" height={80}>
                <LineChart data={congestionData.metrics.trend}>
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--color-success)' }}
                    formatter={(value: any) => [`${value} Days`, 'Wait']}
                    labelStyle={{ color: '#8b949e' }}
                  />
                  <Line type="monotone" dataKey="wait" stroke="var(--color-success)" strokeWidth={2} dot={{ r: 2, fill: 'var(--color-success)' }} activeDot={{ r: 4 }} />
                </LineChart>
              </SafeResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── REEFER MOVEMENT SCHEDULE Header ── */}
      <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle size={16} color="var(--color-warning)" />
        <TermTooltip term="REEFER MOVEMENT SCHEDULE" description="[표 설명] 방콕 항구로 입항 예정인 운반선(Reefer)들의 세부 일정과 각 공장(Cannery)별 분배 예정 물량을 보여줍니다. 이를 통해 특정 캔 공장의 원재료 수급 현황을 파악할 수 있습니다." /> (08/05/26 - 14/05/26) : WEEK 19
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', background: '#10b98118', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>
            {BANGKOK_PORT_DATA.length}척 · {Math.round(grandTotal).toLocaleString()} MT
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION A: Cannery Aggregation Horizontal Bar Chart     */}
      {/* ════════════════════════════════════════════════════════ */}
      <div style={{
        background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
        borderRadius: 8, padding: '20px 16px', marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Factory size={16} color="var(--color-info)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>캔 공장별 원료 입고 예정 총량</span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: 4 }}>(단위: MT)</span>
        </div>
        <div style={{ height: Math.max(canneryAgg.length * 36 + 30, 200), width: '100%' }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={canneryAgg} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
              <ChartPatternDefs />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}K` : `${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }}
                axisLine={false} tickLine={false} width={55} />
              <RechartsTooltip content={<CanneryTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={22} name="총 물량 (MT)">
                {canneryAgg.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </SafeResponsiveContainer>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION B: Carrier Card Grid                            */}
      {/* ════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Anchor size={16} color="var(--color-warning)" />
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>운반선별 배분 내역</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))',
        gap: 12, marginBottom: 24
      }}>
        {carrierCards.map((card, idx) => {
          const isExpanded = expandedCard === idx;
          const maxAmt = Math.max(...card.deliveries.map(d => d.amount));
          return (
            <div key={idx} style={{
              background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
              borderRadius: 10, overflow: 'hidden',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: isExpanded ? '0 4px 20px rgba(16,185,129,0.1)' : 'none',
              borderColor: isExpanded ? 'rgba(16,185,129,0.3)' : 'var(--panel-border)'
            }}>
              {/* Card Header */}
              <button
                onClick={() => setExpandedCard(isExpanded ? null : idx)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: isExpanded ? '1px solid var(--panel-border)' : 'none'
                }}
              >
                <Ship size={18} color="var(--color-info)" />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                    {card.carrier}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                    Berthing: {card.date}
                    {card.other && <span style={{ marginLeft: 8, color: '#475569' }}>Wharf: {card.other}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginRight: 8 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-success)' }}>
                    {Math.round(card.totalMT).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>MT · {card.deliveries.length} factories</div>
                </div>
                {isExpanded
                  ? <ChevronUp size={16} color="#64748b" />
                  : <ChevronDown size={16} color="#64748b" />
                }
              </button>

              {/* Compact inline chips (always visible) */}
              {!isExpanded && (
                <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {card.deliveries.map((d, i) => (
                    <span key={i} style={{
                      fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px',
                      borderRadius: 6, background: 'rgba(255,255,255,0.06)',
                      color: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: 4
                    }}>
                      <span style={{ color: BAR_COLORS[canneryAgg.findIndex(c => c.name === d.cannery) % BAR_COLORS.length] || '#64748b' }}>●</span>
                      {d.cannery}
                      <span style={{ color: '#94a3b8', fontWeight: 400 }}>{Math.round(d.amount).toLocaleString()}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Expanded: mini bar breakdown */}
              {isExpanded && (
                <div style={{ padding: '12px 16px 16px' }}>
                  {card.deliveries.map((d, i) => {
                    const pct = maxAmt > 0 ? (d.amount / maxAmt) * 100 : 0;
                    const colorIdx = canneryAgg.findIndex(c => c.name === d.cannery);
                    const color = BAR_COLORS[colorIdx >= 0 ? colorIdx % BAR_COLORS.length : i % BAR_COLORS.length];
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 50, fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0', textAlign: 'right' }}>
                          {d.cannery}
                        </div>
                        <div style={{ flex: 1, height: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                          <div style={{
                            width: `${pct}%`, height: '100%', background: color,
                            borderRadius: 4, transition: 'width 0.5s ease',
                            opacity: 0.75, minWidth: 2
                          }} />
                        </div>
                        <div style={{ width: 65, fontSize: '0.78rem', fontWeight: 600, color: '#e2e8f0', textAlign: 'right' }}>
                          {Math.round(d.amount).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                  {card.other && (
                    <div style={{
                      marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)',
                      fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <Package size={12} /> Remark: {card.other}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* SECTION C: Legacy Table Toggle                          */}
      {/* ════════════════════════════════════════════════════════ */}
      <button
        onClick={() => setShowLegacy(!showLegacy)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: '1px solid var(--panel-border)',
          borderRadius: 8, padding: '10px 16px', cursor: 'pointer',
          color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600,
          marginBottom: showLegacy ? 12 : 0,
          transition: 'color 0.2s'
        }}
      >
        <Table2 size={15} />
        {showLegacy ? '원본 스프레드시트 숨기기' : '원본 스프레드시트 보기'}
        {showLegacy ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showLegacy && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th rowSpan={2} className={styles.stickyHeader} style={{ minWidth: '180px' }}>CARRIER</th>
                <th rowSpan={2} style={{ minWidth: '100px' }}>BERTHING DATE</th>
                <th colSpan={COLUMNS.length} className={styles.portHeader}>BANGKOK PORT (Canneries & Destinations)</th>
              </tr>
              <tr>
                {COLUMNS.map(col => (
                  <th key={col} style={{ minWidth: col === 'OTHER' ? '180px' : '70px' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BANGKOK_PORT_DATA.map((row, idx) => (
                <tr key={idx}>
                  <td className={`${styles.valueCell} ${styles.stickyCell}`}>{row.carrier}</td>
                  <td className={styles.valueCell} style={{ textAlign: 'center' }}>{row.date}</td>
                  {COLUMNS.map(col => {
                    const val = row.deliveries[col as keyof typeof row.deliveries];
                    const displayVal = val ? val.replace(/\.\d+/g, '') : "-";
                    return (
                      <td key={col} className={val ? styles.valueCell : styles.emptyCell}>
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
