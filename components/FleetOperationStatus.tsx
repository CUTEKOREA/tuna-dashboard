import React, { useState } from 'react';
import styles from './FieldTools.module.css';
import { Anchor } from 'lucide-react';

export default function FleetOperationStatus() {
  const [activeTab, setActiveTab] = useState('pacific');

  const tabs = [
    { id: 'pacific', name: '태평양 선망', summary: '일간 268t / 월간 5,129.3t / 연간 44,657.8t' },
    { id: 'atlantic', name: '대서양 선망', summary: '일간 165t / 월간 6,025t / 연간 26,585t' },
    { id: 'longline', name: '연승 (Longline)', summary: 'SY-55 · 상가수리(7/22~8/4) 진행 중' },
    { id: 'carrier', name: '운반선 현황', summary: '6척 운항/대기' },
  ];

  const pacificFleet = [
    { name: 'S/EXP', pos: 'S0331 W16728 (KI)', catch: '30', load: '672.3(55.3)', note: '-' },
    { name: 'S/PIO', pos: 'S0258 W16825 (KI)', catch: '-', load: '169(9)', note: '-' },
    { name: 'S/CHA', pos: 'N0151 W15735 (KI)', catch: '-', load: '-', note: '7/28 07:40 X-MAS 입항, MING RUN 17편 약 900톤 전재 후 7/31 12:15 출항 완료' },
    { name: 'S/HAR', pos: 'S0700 W15206 (KI)', catch: '65(7)', load: '526(51)', note: '-' },
    { name: 'S/JUP', pos: 'MAJURO', catch: '-', load: '-', note: '6/22 08:15 MAJURO 입항, M/E 수리 중 (출항 일정 M/E 기술자 확인)' },
    { name: 'S/SPR', pos: 'S0325 W16842 (KI)', catch: '40', load: '397(51)', note: '-' },
    { name: 'MOAMARI', pos: 'S0608 W15254 (KI)', catch: '-', load: '300', note: '-' },
    { name: 'MOAKONA', pos: 'S0617 W15232 (KI)', catch: '23(11)', load: '162(134)', note: '-' },
    { name: 'NAOERO SUN', pos: 'S0618 W16434 (H)', catch: '-', load: '220', note: '-' },
    { name: 'NAOERO STAR', pos: 'S0642 W15142 (H)', catch: '110', load: '360', note: '-' },
  ];

  const atlanticFleet = [
    { name: 'P/MAS', pos: 'N0357 W00250 (G)', catch: '-', load: '750', note: '7/31 09:00 TEMA 입항, 하역 후 8/3 출항 예정' },
    { name: 'P/DIS', pos: 'TEMA', catch: '-', load: '900', note: '7/29 12:30 TEMA 입항, 하역 후 8/1 출항 예정' },
    { name: 'P/FORE', pos: 'S0147 W01951 (H)', catch: '35', load: '690', note: '-' },
    { name: 'P/PATH', pos: 'N0150 W00541 (C)', catch: '-', load: '900', note: '8/1 07:00 TEMA 입항, 하역 후 8/3 출항 예정' },
    { name: 'P/COM', pos: 'N0055 W01953 (H)', catch: '50', load: '900', note: '8/5 06:00 TEMA 입항, 하역 후 8/7 출항 예정' },
    { name: 'P/QUEEN', pos: 'N0024 W01335 (H)', catch: '40', load: '665', note: '-' },
    { name: 'P/GRACE', pos: 'S0245 W02138 (H)', catch: '40', load: '370', note: '-' },
  ];

  const longlineFleet = [
    { name: 'SY-55', load: '-', note: '7/19 부산 입항, 하역 및 상가수리(7/22~8/4) 후 8/8 출항 예정' },
    { name: 'TAIHO MARU', load: '338.699톤 (P-501, P-505)', note: '8/11경 부산 입항 예정' },
  ];

  const carrierFleet = [
    { name: 'SEIN VENUS (5,200)', load: '3,275t', note: 'NT-1,060, NS-1,030, S-260, P-925 | 8/5 BKK 도착 예정' },
    { name: 'HIKARI 1 (3,700)', load: '3,214(285)t', note: 'S-766(96), P-75(75), MK-428(114), MI-940, NT-1,005 | 8/5 GENSAN 도착 예정' },
    { name: 'SEIN KASAMA (7,100)', load: '-', note: '예상잔량 7,100t | X-MAS 대기 중' },
    { name: 'MING RUN 17 (6,500)', load: '900t', note: 'C-900 | X-MAS 대기 중' },
    { name: 'SHIN IZU (2,400)', load: '-', note: '예상잔량 2,400t | NO2 W165 대기 중' },
    { name: 'SEIN GALAXY (3,500)', load: '1,846t', note: 'MK-956, MI-890 | RABAUL 대기 중 (타사 출항 전재 예정)' },
  ];

  return (
    <div className={styles.toolPanel} style={{ gridColumn: '1 / -1' }}>
      <div className={styles.toolHeader}>
        <Anchor size={22} color="var(--color-info)" />
        <div className={styles.toolTitle}>선단 위치 및 어획/하역 현황</div>
        {/* L-09: 일일 업무보고 정적 데이터 — '실시간' 표기 금지, 기준일 정직 표기 */}
        <span className={styles.toolBadge} style={{ background: 'rgba(148, 163, 184, 0.12)', color: 'var(--w-slate-400)', marginLeft: 'auto' }}>
          STATIC · 일일 업무보고 26.07.31 동기화
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: `1px solid ${activeTab === tab.id ? 'var(--color-info)' : 'rgba(255,255,255,0.1)'}`,
              background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0,0,0,0.2)',
              color: activeTab === tab.id ? '#60a5fa' : 'var(--w-slate-400)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              transition: 'all 0.2s',
            }}
          >
            <strong style={{ fontSize: '14px', marginBottom: '4px' }}>{tab.name}</strong>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>{tab.summary}</span>
          </button>
        ))}
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '15px', border: '1px solid rgba(140,170,255,0.10)' }}>
        {activeTab === 'pacific' && (
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--w-slate-400)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '8px' }}>선박</th>
                <th style={{ padding: '8px' }}>현재 위치</th>
                <th style={{ padding: '8px' }}>당일 어획량</th>
                <th style={{ padding: '8px' }}>누적 선적량</th>
                <th style={{ padding: '8px' }}>비고</th>
              </tr>
            </thead>
            <tbody>
              {pacificFleet.map((v, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(140,170,255,0.10)' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold', color: 'var(--w-slate-200)' }}>{v.name}</td>
                  <td style={{ padding: '8px', color: 'var(--w-sky-400)' }}>{v.pos}</td>
                  <td style={{ padding: '8px', color: v.catch !== '-' ? 'var(--color-success)' : 'var(--w-slate-500)' }}>{v.catch !== '-' ? `${v.catch} 톤` : '-'}</td>
                  <td style={{ padding: '8px', color: 'var(--color-warning)' }}>{v.load !== '-' ? `${v.load} 톤` : '-'}</td>
                  <td style={{ padding: '8px', color: 'var(--w-slate-300)' }}>{v.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'atlantic' && (
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--w-slate-400)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '8px', width: '15%' }}>선박</th>
                <th style={{ padding: '8px', width: '20%' }}>현재 위치</th>
                <th style={{ padding: '8px', width: '15%' }}>당일 어획량</th>
                <th style={{ padding: '8px', width: '15%' }}>누적 선적량</th>
                <th style={{ padding: '8px', width: '35%' }}>비고</th>
              </tr>
            </thead>
            <tbody>
              {atlanticFleet.map((v, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(140,170,255,0.10)' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold', color: 'var(--w-slate-200)' }}>{v.name}</td>
                  <td style={{ padding: '8px', color: 'var(--w-sky-400)' }}>{v.pos}</td>
                  <td style={{ padding: '8px', color: v.catch !== '-' ? 'var(--color-success)' : 'var(--w-slate-500)' }}>{v.catch !== '-' ? `${v.catch} 톤` : '-'}</td>
                  <td style={{ padding: '8px', color: 'var(--color-warning)' }}>{v.load !== '-' ? `${v.load} 톤` : '-'}</td>
                  <td style={{ padding: '8px', color: 'var(--w-slate-300)' }}>{v.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'longline' && (
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--w-slate-400)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '8px' }}>선박</th>
                <th style={{ padding: '8px' }}>선적량</th>
                <th style={{ padding: '8px' }}>비고 및 입출항 현황</th>
              </tr>
            </thead>
            <tbody>
              {longlineFleet.map((v, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(140,170,255,0.10)' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold', color: 'var(--w-slate-200)' }}>{v.name}</td>
                  <td style={{ padding: '8px', color: 'var(--color-warning)' }}>{v.load}</td>
                  <td style={{ padding: '8px', color: 'var(--w-slate-300)' }}>{v.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'carrier' && (
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--w-slate-400)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '8px' }}>선박 (Capa)</th>
                <th style={{ padding: '8px' }}>선적 현황 / 잔량</th>
                <th style={{ padding: '8px' }}>목적지 및 상태</th>
              </tr>
            </thead>
            <tbody>
              {carrierFleet.map((v, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(140,170,255,0.10)' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold', color: 'var(--w-slate-200)' }}>{v.name}</td>
                  <td style={{ padding: '8px', color: 'var(--color-success)' }}>{v.load}</td>
                  <td style={{ padding: '8px', color: 'var(--w-slate-300)' }}>{v.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
