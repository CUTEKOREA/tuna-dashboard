"use client";

import React from 'react';
import { Anchor } from 'lucide-react';
import { logisticsWeeklyReport } from '@/lib/logistics-weekly-report';

/* 데이터·수치 무수정 — 시각 폴리시 + 한글화(영문 라벨·날짜). 운반선명·MT·고유명 유지 */
const { unloading, source } = logisticsWeeklyReport;
const TRADER_LABEL: Record<string, string> = { FCF: 'FCF', DIRECT: '직거래' };

/* 원문 표가 트레이더 단위 한 줄이다 - 선박을 풀어 적으면 척수 칸이 뜻을 잃는다 */
const currentUnloading = [...new Set(unloading.vessels.map((vessel) => vessel.trader))].map((trader) => {
  const rows = unloading.vessels.filter((vessel) => vessel.trader === trader);
  return {
    sort: TRADER_LABEL[trader] ?? trader,
    no: rows.length,
    carriers: rows.map((vessel) => `${vessel.name} (${vessel.amount.toLocaleString()} MT)`).join(', '),
    amount: rows.reduce((total, vessel) => total + vessel.amount, 0),
  };
});

const reportMonth = `${Number(source.reportDate.slice(5, 7))}월`;

export default function CarrierUnloadingStatus() {
  const [rowHover, setRowHover] = React.useState<number | null>(null);

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
          태국 방콕(BANGKOK) 양륙 운반선 현황 - {source.reportDate} 주간 보고 기준 (정적 데이터)
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
                style={{ borderBottom: '1px solid var(--panel-border)', background: rowHover === idx ? 'var(--hover-bg)' : 'transparent', transition: 'background 0.15s ease' }}>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--text-main)' }}>{row.sort}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>{row.no}</td>
                <td style={{ padding: '12px', color: 'var(--text-main)', lineHeight: '1.5' }}>{row.carriers}</td>
              </tr>
            ))}
            <tr style={{ background: 'rgba(var(--w-emerald-500-rgb), 0.1)' }}>
              <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-success)' }}>합계</td>
              <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-success)' }}>{unloading.currentTotal.vessels}</td>
              <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--color-success)' }}>{unloading.currentTotal.amount.toLocaleString()} MT</td>
            </tr>
          </tbody>
        </table>
        <div style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)', background: 'var(--table-th-bg)' }}>
          * {reportMonth} 누계는 운반선 {unloading.monthToDate.vessels}척·{unloading.monthToDate.amount.toLocaleString()} MT이며, 보고 시점에 {unloading.unloadingNow.port}에서 하역 중인 배는 {unloading.unloadingNow.vessels}척입니다.
        </div>
      </div>

    </div>
  );
}
