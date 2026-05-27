'use client';

import React from 'react';
import styles from './FleetPerformance.module.css';

const ATLANTIC_SEINERS = [
  { name: 'P/MAS', location: 'TEMA', status: '입항 | 5/25 13:30 TEMA 입항, 환자 하선 완료, 하역 후 5/27 출항 예정' },
  { name: 'P/DIS', location: 'N0240 W00943 (H)', status: '일간: 35톤 / 누적 선적: 900톤 | 5/29 TEMA 입항 후 6/1 출항' },
  { name: 'P/FORE', location: 'N0738 W01753 (H)', status: '일간: 30톤 / 누적 선적: 900톤 | 5/31 TEMA 입항 후 6/2 출항' },
  { name: 'P/PATH', location: 'N0153 W01936 (H)', status: '일간: 10톤 / 누적 선적: 510톤' },
  { name: 'P/COM', location: 'S0433 W01532 (H)', status: '일간: 25톤 / 누적 선적: 575톤' },
  { name: 'P/QUEEN', location: 'N0211 W02408 (H)', status: '일간: 40톤 / 누적 선적: 740톤' },
  { name: 'P/GRACE', location: 'N0139 W00505 (H)', status: '누적 선적: 420톤' },
];

const LONGLINERS = [
  { name: 'SY-56', load: '-', status: '5/11 부산 입항, 하역 및 상가수리(5/14~5/27) 후 6/1 출항 예정 (유가 주시 예정)' },
  { name: 'P-505', load: '-', status: '(발전기 수리 및 휴계입항) 5/27 타히티 입항, 5/31 출항 예정' },
  { name: 'GENTA MARU', load: '(355.126톤 (SY-52, P-502, P-501))', status: '5/22 P-502 155.725톤 하역 완료(누: 177.401톤, 증: +21.676톤) / 5/26 P-501 102.011톤 하역 중 / 5/29 SY-52 97.390톤 하역 예정' },
];

const CARRIERS = [
  { name: 'SEIN PHOENIX (7,100)', load: '6,955', remaining: '-', status: 'NT-1,080, MK-750, S-420, J-1,030, P-1,080, H-930, MI-485, S-1,180', notice: 'BKK 하역 중 (누계 587.67t / 잔 6,367.33t)' },
  { name: 'SHIN IZU (2,400)', load: '2,301(161)', remaining: '-', status: 'S-50(20), C-130, P-200, MK-69(49), E-117(92), J-730, S-1,005', notice: '6/1 통영 하역 예정' },
  { name: 'BAO LUCKY (5,800)', load: '4,803', remaining: '-', status: 'MI-885, NT-1,035, C-865, P-375, MK-870, E-773, 타사 물량-930', notice: 'BKK 하역 대기 중' },
  { name: 'SHIN FUJI (3,200)', load: '(3,096)', remaining: '-', status: 'MI-950, NS-670, E-306, (NT-900), (P-270)', notice: 'TARAWA 전재 중' },
  { name: 'SEIN TOPAZ (7,300)', load: '(1,130)', remaining: '(3,603)', status: 'NS-150, (P-980), 타사 물량-2,566.80', notice: 'TARAWA 대기 중' },
];

export function AtlanticSeinersTable() {
  return (
    <div className={styles.tableContainer} style={{ marginBottom: '2rem' }}>
      <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--text-main)' }}>CC. 대서양 선망 : 5/25</strong> (일간: 140톤 / 월간 누계: 4,645톤 / 연간 누계: 14,300톤)
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
        <span>선적량: <strong>18,285(161)톤</strong></span>
        <span>예상잔량: <strong>3,603톤</strong></span>
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
