"use client";

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TermTooltip from './TermTooltip';
import { ChartPatternDefs } from './ChartPatterns';

/* 데이터·수치 무수정 — 시각 레이어만 향상 + 영문 한글화(월명·직거래·몰디브) */
const data2026 = [
  { month: '1월', FCF: 26344, ITOCHU: 6907, 'TRI MARINE': 3770, 'Direct deal': 18929, Maldives: 0 },
  { month: '2월', FCF: 14155, ITOCHU: 0, 'TRI MARINE': 9486, 'Direct deal': 19840, Maldives: 0 },
  { month: '3월', FCF: 11700, ITOCHU: 4915, 'TRI MARINE': 2113, 'Direct deal': 11925, Maldives: 0 },
  { month: '4월', FCF: 14206, ITOCHU: 9963, 'TRI MARINE': 13933, 'Direct deal': 22181, Maldives: 0 },
  { month: '5월', FCF: 32638, ITOCHU: 3371, 'TRI MARINE': 9413, 'Direct deal': 3485, Maldives: 0 },
  { month: '6월', FCF: 13749, ITOCHU: 2924, 'TRI MARINE': 9465, 'Direct deal': 19619, Maldives: 0 },
];

// key=데이터키(유지) · name=표시명(한글화) · gid=그라디언트 id · 회사명 고유명은 유지
const TRADERS = [
  { key: 'FCF', name: 'FCF', gid: 'tFcf', color: '#38bdf8', total: 112792 },
  { key: 'ITOCHU', name: 'ITOCHU', gid: 'tIto', color: '#8b5cf6', total: 28080 },
  { key: 'TRI MARINE', name: 'TRI MARINE', gid: 'tTri', color: '#ec4899', total: 48180 },
  { key: 'Direct deal', name: '직거래', gid: 'tDir', color: '#10b981', total: 95979 },
  { key: 'Maldives', name: '몰디브', gid: 'tMal', color: '#f59e0b', total: 0 },
];

export default function TraderStatus() {
  const [hover, setHover] = React.useState<number | null>(null);
  const cards = [...TRADERS.filter((t) => t.total > 0), { key: 'TOTAL', name: '합계', gid: '', color: 'var(--text-main)', total: 285031 }];

  return (
    <div style={{
      background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
      borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            <TermTooltip term="트레이더별 반입 현황 (2026)" description="월별 트레이더별 반입 물량(MT) 추이" />
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>2026년 1~6월 트레이더별 반입 실적 (MT) — 사내 집계, 2026-06 기준</p>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 300 }}>
        <SafeResponsiveContainer width="100%" height={300}>
          <BarChart data={data2026} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="28%">
            <ChartPatternDefs />
            <defs>
              {TRADERS.map((t) => (
                <linearGradient key={t.gid} id={t.gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.color} stopOpacity={0.98} />
                  <stop offset="100%" stopColor={t.color} stopOpacity={0.55} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="var(--text-muted)" axisLine={false} tickLine={false} fontSize={12} />
            <YAxis stroke="var(--text-muted)" axisLine={false} tickLine={false} fontSize={11} tickFormatter={(val) => `${(val / 1000)}k`} />
            <Tooltip
              cursor={{ fill: 'rgba(16,185,129,0.06)' }}
              contentStyle={{ background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', color: 'var(--text-main)', boxShadow: '0 8px 30px rgba(0,0,0,0.45)' }}
              itemStyle={{ fontSize: '13px' }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}
              formatter={(value: any, name: any) => [`${Number(value).toLocaleString()} MT`, name]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="FCF" name="FCF" stackId="a" fill="url(#tFcf)" radius={[0, 0, 5, 5]} />
            <Bar dataKey="ITOCHU" name="ITOCHU" stackId="a" fill="url(#tIto)" />
            <Bar dataKey="TRI MARINE" name="TRI MARINE" stackId="a" fill="url(#tTri)" />
            <Bar dataKey="Direct deal" name="직거래" stackId="a" fill="url(#tDir)" radius={[5, 5, 0, 0]} />
            <Bar dataKey="Maldives" name="몰디브" stackId="a" fill="url(#tMal)" />
          </BarChart>
        </SafeResponsiveContainer>
      </div>

      <div data-mobile-stack style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {cards.map((c, i) => (
          <div key={c.key}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            style={{
              padding: '11px 10px', borderRadius: '8px', textAlign: 'center',
              background: c.key === 'TOTAL' ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${c.key === 'TOTAL' ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)'}`,
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
