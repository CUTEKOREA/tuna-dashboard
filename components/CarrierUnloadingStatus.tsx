"use client";

import React from 'react';
import { Ship, Anchor } from 'lucide-react';

/* 데이터·수치 무수정 — 시각 폴리시 + 한글화(영문 라벨·날짜). 운반선명·MT·고유명 유지 */
const currentUnloading = [
  { sort: 'FCF', no: 5, carriers: 'HUA FU 107 (4,982 MT), ORANGE SEA (4,808 MT), DINOK (4,385 MT), HUA FU 207 (5,777 MT), SEIN PHOENIX (6,955 MT)' },
  { sort: 'TRI', no: 3, carriers: 'BOYANG CAPELLA (5,697 MT), RYOMA (3,490 MT), GREENSEA BERMEO (5,200 MT)' },
  { sort: 'ITO', no: 1, carriers: 'LAKE PEARL (4,955 MT)' },
  { sort: '직거래', no: 2, carriers: 'PACIFIC JOURNEY (3,485 MT), SEIN QUEEN (5,650 MT)' },
];

const incomingVessels = [
  { name: 'MING RUN', date: '5월 5일' },
  { name: 'JOCHOH', date: '5월 9일' },
  { name: 'CHERRY STAR', date: '5월 12일' },
  { name: 'BAO LUCKY', date: '5월 20일' },
];

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
          태국 방콕(BANGKOK) 양륙 운반선 현황 — 2026-05-25 주간 보고 기준 (정적 데이터)
        </p>
      </div>

      <div style={{ border: '1px solid var(--panel-border)', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))', borderBottom: '1px solid rgba(245,158,11,0.25)' }}>
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
            <tr style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-success)' }}>합계</td>
              <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-success)' }}>11</td>
              <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--color-success)' }}>55,384 MT</td>
            </tr>
          </tbody>
        </table>
        <div style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)' }}>
          * 5월 누계 운반선 5척·누적 하역량 19,210 MT. SEIN PHOENIX는 보고 시점 하역 진행 중이었음 (5/25 기준 누계 362.98t / 잔 6,592t).
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 12px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Ship size={16} color="var(--color-info)" />
          입항 예정이었던 운반선 (방콕 · 2026년 5월 보고 당시)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {incomingVessels.map((v, idx) => (
            <div key={idx}
              onMouseEnter={() => setCardHover(idx)} onMouseLeave={() => setCardHover(null)}
              style={{
                padding: '12px', background: 'rgba(56,189,248,0.05)', borderRadius: '8px',
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
          * 2026년 5월 주간 보고 시점의 입항 예정 정보로, 예정일이 모두 경과한 과거 기록입니다.
          CHERRY STAR(5/13)·JOCHOH(5/15)는 이후 운반선 이동 스케줄(WEEK 22)에 방콕 접안 기록이 확인됩니다.
        </p>
      </div>
    </div>
  );
}
