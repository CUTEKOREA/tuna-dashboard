"use client";

import React from 'react';
import { Ship, Anchor } from 'lucide-react';
import { logisticsWeeklyReport } from '@/lib/logistics-weekly-report';

/* 데이터·수치 무수정 — 시각 폴리시 + 한글화(영문 라벨·날짜). 운반선명·MT·고유명 유지 */
const currentUnloading = logisticsWeeklyReport.unloading.vessels.map((vessel) => ({
  sort: vessel.trader,
  no: 1,
  carriers: `${vessel.name} (${vessel.amount.toLocaleString()} MT)`,
}));

const incomingVessels = logisticsWeeklyReport.unloading.incoming.map((vessel) => ({
  name: vessel.name,
  date: vessel.estimatedArrival.replace('2026-08-', '8월 ').replace(/^8월 0/, '8월 ') + '일',
}));

export default function CarrierUnloadingStatus() {
  const [rowHover, setRowHover] = React.useState<number | null>(null);
  const [cardHover, setCardHover] = React.useState<number | null>(null);

  return (
    <div style={{
      background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
      borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px',
    }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Anchor size={20} color="var(--color-warning)" />
          운반선 하역 현황
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          태국 방콕(BANGKOK) 양륙 운반선 현황 — 2026-08-05 주간 보고 기준 (정적 데이터)
        </p>
      </div>

      <div style={{ border: '1px solid var(--panel-border)', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, rgba(var(--w-amber-500-rgb), 0.12), rgba(var(--w-amber-500-rgb), 0.04))', borderBottom: '1px solid rgba(var(--w-amber-500-rgb), 0.25)' }}>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700 }}>구분</th>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', width: '60px', fontWeight: 700 }}>척수</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700 }}>운반선 (MT)</th>
            </tr>
          </thead>
          <tbody>
            {currentUnloading.map((row, idx) => (
              <tr key={idx}
                onMouseEnter={() => setRowHover(idx)} onMouseLeave={() => setRowHover(null)}
                style={{ borderBottom: '1px solid var(--panel-border)', background: rowHover === idx ? 'rgba(255,255,255,0.04)' : 'transparent', transition: 'background 0.15s ease' }}>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--text-main)' }}>{row.sort}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>{row.no}</td>
                <td style={{ padding: '12px', color: 'var(--text-main)', lineHeight: '1.5' }}>{row.carriers}</td>
              </tr>
            ))}
            <tr style={{ background: 'rgba(var(--w-emerald-500-rgb), 0.1)' }}>
              <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-success)' }}>합계</td>
              <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-success)' }}>{logisticsWeeklyReport.unloading.currentTotal.vessels}</td>
              <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--color-success)' }}>{logisticsWeeklyReport.unloading.currentTotal.amount.toLocaleString()} MT</td>
            </tr>
          </tbody>
        </table>
        <div style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)' }}>
          * 8월 누계는 운반선 {logisticsWeeklyReport.unloading.monthToDate.vessels}척·{logisticsWeeklyReport.unloading.monthToDate.amount.toLocaleString()} MT입니다. LAKE PEARL 4,873 MT는 7월 반입분입니다.
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 12px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Ship size={16} color="var(--color-info)" />
          보고 당시 입항 예정 운반선 (방콕 · 2026년 8월 5일 기준)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {incomingVessels.map((v, idx) => (
            <div key={idx}
              onMouseEnter={() => setCardHover(idx)} onMouseLeave={() => setCardHover(null)}
              style={{
                padding: '12px', background: 'rgba(var(--w-sky-400-rgb), 0.05)', borderRadius: '8px',
                borderLeft: '3px solid var(--color-info)', display: 'flex', flexDirection: 'column', gap: '4px',
                transform: cardHover === idx ? 'translateY(-2px)' : 'none',
                boxShadow: cardHover === idx ? '0 6px 18px rgba(0,0,0,0.35)' : 'none',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)' }}>{v.name}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>보고 당시 도착 예정: {v.date}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '10px 0 0', lineHeight: 1.5 }}>
          * 2026년 8월 5일 주간 보고 시점의 예정 정보이며, 현재 입항 여부는 별도 확인이 필요합니다.
        </p>
      </div>
    </div>
  );
}
