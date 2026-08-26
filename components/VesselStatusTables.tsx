'use client';

import React from 'react';
import styles from './FleetPerformance.module.css';

const ATLANTIC_SEINERS = [
  { name: 'P/MAS', location: 'S0418 W01746 (H)', status: '일간 어획: 30톤 / 누적 선적: 210톤' },
  { name: 'P/DIS', location: 'N0020 W01340 (H)', status: '일간 어획: 70톤 / 누적 선적: 320톤 | 6/10 그물 파망 사고, 6/12 ABIDJAN 입항 예정' },
  { name: 'P/FORE', location: 'S0100 W01124 (H)', status: '일간 어획: 40톤 / 누적 선적: 105톤' },
  { name: 'P/PATH', location: 'TEMA', status: '누적 선적: 630톤 | 6/7 07:15 TEMA 입항, 하역 후 6/10 출항 예정' },
  { name: 'P/COM', location: 'N0341 W00557 (C)', status: '누적 선적: 900톤 | 6/11 07:00 TEMA 입항, 하역 후 6/13 출항 예정' },
  { name: 'P/QUEEN', location: 'N0336 W00146 (G)', status: '누적 선적: 900톤 | 6/10 07:00 TEMA 입항, 하역 후 6/12 출항 예정' },
  { name: 'P/GRACE', location: 'N0145 W01722 (H)', status: '일간 어획: 5톤 / 누적 선적: 775톤 | 6/13 ABIDJAN 입항, 그물 교체 후 6/16 출항 예정' },
];

const LONGLINERS = [
  { name: 'SY-56', load: '-', status: '5/11 부산 입항, 하역 및 상가수리(5/14~5/27) 후 6/2 11:00 출항 예정' },
  { name: 'P-505', load: '-', status: '(발전기 수리 및 휴게입항) 5/27 타히티 입항, 5/31 출항 완료' },
  { name: 'GENTA MARU', load: '(355.126톤 (SY-52, P-502, P-501))', status: '5/22 P-502 하역 완료(누: 177.401톤, 증: +21.676톤) / 5/26 P-501 하역 완료(누: 109.698톤, 증: +7.687톤) / 5/29 SY-52 97.390톤 하역 예정' },
];

const CARRIERS = [
  { name: 'SEIN PHOENIX (7,100)', load: '6,955', remaining: '-', status: 'NT-1,080, MK-750, S-420, J-1,030, P-1,080, H-930, MI-485, S-1,180', notice: 'BKK 하역 완료' },
  { name: 'SHIN IZU (2,400)', load: '2,301(161)', remaining: '-', status: 'S-50(20), C-130, P-200, MK-69(49), E-117(92), J-730, S-1,005', notice: '통영 하역 중' },
  { name: 'BAO LUCKY (5,800)', load: '4,803', remaining: '-', status: 'MI-885, NT-1,035, C-865, P-375, MK-870, E-773, 타사 물량 -930', notice: 'BKK 하역 중' },
  { name: 'SHIN FUJI (3,200)', load: '3,096', remaining: '-', status: 'MI-950, NS-670, E-306, NT-900, P-270', notice: 'BKK 하역 중' },
  { name: 'SEIN TOPAZ (7,300)', load: '(4,278)', remaining: '-', status: 'NS-150, P-980, S-1,178, (C-990), (J-980), 타사 물량 -2,566.80', notice: 'TARAWA 전재 중' },
  { name: 'SEIN GALAXY (3,500)', load: '(1,106(150))', remaining: '(2,394)', status: '(MK-1,106(150))', notice: '6/11 FUNAFUTI 도착 예정' },
];

export function AtlanticSeinersTable() {
  return (
    <div className={styles.tableContainer} style={{ marginBottom: '2rem' }}>
      <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(140,170,255,0.10)', fontSize: '13px', color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--text-main)' }}>BB. 대서양 선망 : 6/10</strong> (일간: 145톤 / 월간 누계: 1,110톤 / 연간 누계: 15,895톤) - 일일 업무보고 26.06.10 기준
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
      <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(140,170,255,0.10)', fontSize: '13px', color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--text-main)' }}>AA. 연승</strong> - 6/2 보고 기준 (이후 갱신분 미수신)
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
      <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(140,170,255,0.10)', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'flex-start', gap: '20px' }}>
        <span>운반선 : 6/10 - 일일 업무보고 26.06.10 기준</span>
        <span>선적량: <strong>22,539(311)톤</strong></span>
        <span>예상잔량: <strong>2,394톤</strong></span>
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
