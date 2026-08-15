"use client";

import React, { useMemo, useState } from 'react';
import { Ship, AlertTriangle, ChevronDown, ChevronUp, Anchor, Factory, Package, Table2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './ReeferMovement.module.css';
import TermTooltip from './TermTooltip';

import { getMiscData } from '@/lib/data/misc';
import { ChartPatternDefs } from './ChartPatterns';

const BANGKOK_PORT_DATA = getMiscData('reeferWeek32');

// ── helpers ──
function parseNum(s: any): number {
  if (typeof s !== 'string') return typeof s === 'number' ? s : 0;
  return parseFloat(s.replace(/,/g, '')) || 0;
}

function formatMt(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 3 });
}

// Color palette for bars
const BAR_COLORS = [
  'var(--color-success)', 'var(--color-info)', 'var(--color-warning)', 'var(--color-danger)', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#a855f7',
  '#64748b', '#e11d48', '#84cc16', '#6366f1', '#0ea5e9',
  '#d946ef', '#f43f5e', '#22d3ee', 'var(--color-warning)', '#fb923c',
];

// Legacy table columns
const COLUMNS = [
  "ASIAN", "AEC", "AYA", "CMC", "DIA", "GB", "GPZ", "ISA", "I-TAIL", "KF",
  "MMP", "PCI", "FOOD", "POP", "PTY", "RMK", "RS", "SK", "SIF", "SPA",
  "SCC", "SE", "SEAP", "TCC", "TOV", "TUG", "TUM", "UC", "SHIP", "OTHER"
];

// ── Custom tooltip for bar chart ──
function CanneryTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      background: '#303c46', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
      padding: '12px 16px', fontSize: '0.82rem', color: '#e2e8f0', minWidth: 180,
      boxShadow: '0 8px 24px rgba(16,24,40,0.35)'
    }}>
      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6, color: '#ffffff' }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ color: '#c6c9d2' }}>총 물량</span>
        <span style={{ fontWeight: 700, color: '#88bf4d' }}>{d?.total?.toLocaleString()} MT</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ color: '#c6c9d2' }}>운반선 수</span>
        <span style={{ fontWeight: 600 }}>{d?.vesselCount}척</span>
      </div>
      {d?.vessels && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: '#a6acba' }}>
          {d.vessels.join(' · ')}
        </div>
      )}
    </div>
  );
}

export default function ReeferMovement() {
  const [showLegacy, setShowLegacy] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  // ── Aggregate: cannery totals ──
  const canneryAgg = useMemo(() => {
    const agg: Record<string, { total: number; vesselCount: number; vessels: string[] }> = {};
    BANGKOK_PORT_DATA.forEach((row) => {
      Object.entries(row.deliveries).forEach(([key, val]) => {
        if (key === 'OTHER' || key === 'SHIP') return;
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
        .filter(([k]) => k !== 'OTHER' && k !== 'SHIP')
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
          방콕항(BANGKOK) 운반선 이동 스케줄
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          fontWeight: 600,
          background: 'rgba(var(--w-slate-400-rgb), 0.1)',
          color: 'var(--text-muted)',
          padding: '4px 12px',
          borderRadius: '12px',
          border: '1px solid rgba(var(--w-slate-400-rgb), 0.2)'
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }}></div>
          32주차 주간 보고 (2026-08-07 ~ 08-13 기준)
        </div>
      </div>

      {/* ── REEFER MOVEMENT SCHEDULE Header ── */}
      <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle size={16} color="var(--color-warning)" />
        <TermTooltip term="운반선 이동 스케줄" description="[표 설명] 32주차 주간 보고에 기록된 방콕 항구 냉동 운반선별 접안 일정과 각 캔 공장별 배분 물량입니다. 이를 통해 보고 시점의 캔 공장별 원재료 수급 상황을 파악할 수 있습니다." /> (2026-08-07 ~ 08-13) : 32주차 주간 보고
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', background: '#10b98118', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>
            {BANGKOK_PORT_DATA.length}척 · 공장 배분 {formatMt(grandTotal)} MT
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
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>캔 공장별 원료 배분 총량 (32주차 보고 기준)</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--w-slate-500)', marginLeft: 4 }}>(단위: MT)</span>
        </div>
        <div style={{ height: Math.max(canneryAgg.length * 36 + 30, 200), width: '100%' }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={canneryAgg} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
              <ChartPatternDefs />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}K` : `${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}
                axisLine={false} tickLine={false} width={55} />
              <RechartsTooltip content={<CanneryTooltip />} cursor={{ fill: 'rgba(34,36,43,0.04)' }} />
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
              boxShadow: isExpanded ? '0 4px 20px rgba(var(--w-emerald-500-rgb), 0.1)' : 'none',
              borderColor: isExpanded ? 'rgba(var(--w-emerald-500-rgb), 0.3)' : 'var(--panel-border)'
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
                  <div style={{ fontSize: '0.72rem', color: 'var(--w-slate-500)', marginTop: 2 }}>
                    보고서 기재 접안일: {card.date}
                    {card.other && <span style={{ marginLeft: 8, color: '#475569' }}>부두: {card.other}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginRight: 8 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-success)' }}>
                    {formatMt(card.totalMT)}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--w-slate-500)' }}>MT · 공장 {card.deliveries.length}곳</div>
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
                      borderRadius: 6, background: 'rgba(140,170,255,0.12)',
                      color: 'var(--w-slate-200)', display: 'inline-flex', alignItems: 'center', gap: 4
                    }}>
                      <span style={{ color: BAR_COLORS[canneryAgg.findIndex(c => c.name === d.cannery) % BAR_COLORS.length] || 'var(--w-slate-500)' }}>●</span>
                      {d.cannery}
                      <span style={{ color: 'var(--w-slate-400)', fontWeight: 400 }}>{formatMt(d.amount)}</span>
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
                        <div style={{ width: 50, fontSize: '0.78rem', fontWeight: 700, color: 'var(--w-slate-200)', textAlign: 'right' }}>
                          {d.cannery}
                        </div>
                        <div style={{ flex: 1, height: 20, background: 'rgba(34,36,43,0.06)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                          <div style={{
                            width: `${pct}%`, height: '100%', background: color,
                            borderRadius: 4, transition: 'width 0.5s ease',
                            opacity: 0.75, minWidth: 2
                          }} />
                        </div>
                        <div style={{ width: 65, fontSize: '0.78rem', fontWeight: 600, color: 'var(--w-slate-200)', textAlign: 'right' }}>
                          {formatMt(d.amount)}
                        </div>
                      </div>
                    );
                  })}
                  {card.other && (
                    <div style={{
                      marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(140,170,255,0.12)',
                      fontSize: '0.72rem', color: 'var(--w-slate-500)', display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <Package size={12} /> 비고(부두): {card.other}
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
          color: 'var(--w-slate-400)', fontSize: '0.8rem', fontWeight: 600,
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
                <th rowSpan={2} className={styles.stickyHeader} style={{ minWidth: '180px' }}>운반선</th>
                <th rowSpan={2} style={{ minWidth: '100px' }}>보고서 기재 접안일</th>
                <th colSpan={COLUMNS.length} className={styles.portHeader}>방콕항 (캔 공장·배분처)</th>
              </tr>
              <tr>
                {COLUMNS.map(col => (
                  <th key={col} style={{ minWidth: col === 'OTHER' ? '100px' : '70px' }}>
                    {col === 'OTHER' ? '부두' : col}
                  </th>
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
                    const displayVal = val || "-";
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
