'use client';

import React from 'react';
import styles from './FleetPerformance.module.css';

const ATLANTIC_SEINERS = [
  { name: 'P/MAS', location: 'N0003 W00228 (H)', status: '누적 선적: 30톤' },
  { name: 'P/DIS', location: 'S0036 W00202 (H)', status: '일간: 40톤 / 누적 선적: 120톤' },
  { name: 'P/FORE', location: 'N0110 W00305 (H)', status: '누적 선적: 120톤' },
  { name: 'P/PATH', location: 'S0011 W00322 (H)', status: '누적 선적: 50톤' },
  { name: 'P/COM', location: 'S0122 W00157 (H)', status: '일간: 35톤 / 누적 선적: 50톤' },
  { name: 'P/QUEEN', location: 'N0152 W00337 (G)', status: '일간: 15톤 / 누적 선적: 45톤' },
  { name: 'P/GRACE', location: 'N0055 W00952 (H)', status: '누적 선적: 5톤' },
];

const LONGLINERS = [
  { name: 'SY-51', load: '-', status: '3/14 부산 입항, 하역 및 상가수리(3/17~3/31) 후 출항 대기중 (유가 주시 중)' },
  { name: 'SY-56', load: '(269.594톤)', status: '4/12 현장발, 5/11 부산 입항 예정' },
  { name: 'SEI SHIN', load: '(233.557톤 (P-506, P-505))', status: '4/25 부산 입항, 5/6 P-505, 5/11 P-506 어획물 하역 예정 (P-506: 100.711톤, P-505: 132.846톤)' },
  { name: 'GENTA MARU', load: '(355.126톤 (SY-52, P-502, P-501))', status: '4/28 부산 입항, 하역 일정 확인 중 (SY-52: 97.390톤, P-502: 155.725톤, P-501: 102.011톤)' },
];

const CARRIERS = [
  { name: 'HIKARI 1 (3,800)', load: '826', remaining: '-', status: '누: 800.110톤, 감: -25.890톤', notice: 'GENSAN 하역 완료' },
  { name: 'DINOK (4,500)', load: '4,385', remaining: '-', status: 'E-66, J-630, C-900, H-1,210, S-450, E-1,129', notice: 'BKK 하역 중' },
  { name: 'SEIN PHOENIX (7,100)', load: '6,955', remaining: '-', status: 'NT-1,080, MK-750, S-420, J-1,030, P-1,080, H-930, MI-485, S-1,180', notice: '5/4 BKK 도착 예정' },
  { name: 'BAO LUCKY (5,800)', load: '4,803', remaining: '-', status: 'MI-885, NT-1,035, C-865, P-375, MK-870, E-773, 타사 물량-930', notice: '5/19 BKK 도착 예정' },
  { name: 'SHIN IZU (2,400)', load: '2,301(161)', remaining: '-', status: 'S-50(20), C-130, P-200, MK-69(49), E-117(92), J-730, S-1,005', notice: '5/16 국내 도착 예정' },
  { name: 'SHIN FUJI (3,200)', load: '-', remaining: '3,200', status: '-', notice: 'TARAWA 대기 중' },
  { name: 'SEIN TOPAZ (7,300)', load: '-', remaining: '5,918', status: '타사 물량-1,381.80', notice: 'TARAWA 대기 중' },
];

export function AtlanticSeinersTable() {
  return (
    <div className={styles.tableContainer} style={{ marginBottom: '2rem' }}>
      <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--text-main)' }}>CC. 대서양 선망 : 5/3</strong> (일간: 90톤 / 월간 누계: 420톤 / 연간 누계: 10,075톤)
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: '14%' }}>선박명</th>
            <th style={{ width: '28%' }}>위치 (Location)</th>
            <th style={{ width: '58%' }}>비고 (Status)</th>
          </tr>
        </thead>
        <tbody>
          {ATLANTIC_SEINERS.map((row) => (
            <tr key={row.name}>
              <td style={{ fontWeight: 600 }}>{row.name}</td>
              <td style={{ color: 'var(--accent-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{row.location}</td>
              <td style={{ textAlign: 'left', paddingLeft: '1rem', color: 'inherit' }}>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LonglinersTable() {
  return (
    <div className={styles.tableContainer} style={{ marginBottom: '2rem' }}>
      <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--text-main)' }}>AA. 연승</strong>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: '20%' }}>선박</th>
            <th style={{ width: '25%' }}>선적량</th>
            <th style={{ width: '55%' }}>비고</th>
          </tr>
        </thead>
        <tbody>
          {LONGLINERS.map((row) => (
            <tr key={row.name}>
              <td style={{ fontWeight: 600 }}>{row.name}</td>
              <td style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{row.load}</td>
              <td style={{ textAlign: 'left', paddingLeft: '1rem', color: 'inherit' }}>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CarriersTable() {
  return (
    <div className={styles.tableContainer}>
      <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'flex-start', gap: '20px' }}>
        <span>선적량: <strong>19,270(161)톤</strong></span>
        <span>예상잔량: <strong>9,118톤</strong></span>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: '20%' }}>선박</th>
            <th style={{ width: '13%', textAlign: 'right', paddingRight: '1rem' }}>선적량</th>
            <th style={{ width: '13%', textAlign: 'right', paddingRight: '1rem' }}>예상잔량</th>
            <th style={{ width: '25%' }}>선적 현황</th>
            <th style={{ width: '29%' }}>비고</th>
          </tr>
        </thead>
        <tbody>
          {CARRIERS.map((row) => (
            <tr key={row.name}>
              <td style={{ fontWeight: 600 }}>{row.name}</td>
              <td style={{ color: 'var(--accent-secondary)', fontWeight: 600, textAlign: 'right', paddingRight: '1rem' }}>{row.load}</td>
              <td style={{ color: 'var(--accent-warning)', fontWeight: 600, textAlign: 'right', paddingRight: '1rem' }}>{row.remaining}</td>
              <td style={{ textAlign: 'left', paddingLeft: '1rem' }}>{row.status}</td>
              <td style={{ textAlign: 'left', paddingLeft: '1rem', color: 'inherit' }}>{row.notice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
