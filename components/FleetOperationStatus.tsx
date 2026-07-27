import React, { useState } from 'react';
import styles from './FieldTools.module.css';
import { Anchor } from 'lucide-react';

export default function FleetOperationStatus() {
  const [activeTab, setActiveTab] = useState('pacific');

  const tabs = [
    { id: 'pacific', name: '태평양 선망', summary: '일간 72t / 월간 4,362.3t / 연간 43,890.8t' },
    { id: 'atlantic', name: '대서양 선망', summary: '일간 375t / 월간 5,295t / 연간 25,855t' },
    { id: 'longline', name: '연승 (Longline)', summary: 'SY-55 · 상가수리(7/22~8/4) 진행 중' },
    { id: 'carrier', name: '운반선 현황', summary: '7척 운항/대기' },
  ];

  const pacificFleet = [
    { name: 'S/EXP', pos: 'S0518 W15505 (KI)', catch: '21(15)', load: '612.3(55.3)', note: '-' },
    { name: 'S/PIO', pos: 'S0450 W15900 (KI)', catch: '-', load: '139(9)', note: '-' },
    { name: 'S/CHA', pos: 'S0340 W15344 (KI)', catch: '-', load: '900', note: '7/28 08:00 X-MAS 입항, MING RUN 17편 약 900톤 전재 후 7/30 출항 예정' },
    { name: 'S/HAR', pos: 'S0003 W15021 (H)', catch: '1(1)', load: '361(19)', note: '-' },
    { name: 'S/JUP', pos: 'MAJURO', catch: '-', load: '-', note: '6/22 08:15 MAJURO 입항, M/E 수리 중 (출항 일정 M/E 기술자 확인)' },
    { name: 'S/SPR', pos: 'S0513 W15503 (KI)', catch: '-', load: '357(51)', note: '-' },
    { name: 'MOAMARI', pos: 'S0139 W15320 (KI)', catch: '-', load: '210', note: '-' },
    { name: 'MOAKONA', pos: 'S0129 W15217 (H)', catch: '-', load: '80(72)', note: '-' },
    { name: 'NAOERO SUN', pos: 'S0459 W15856 (KI)', catch: '-', load: '190', note: '-' },
    { name: 'NAOERO STAR', pos: 'S0005 W15024 (KI)', catch: '50', load: '90', note: '-' },
  ];

  const atlanticFleet = [
    { name: 'P/MAS', pos: 'S0141 W01852 (H)', catch: '145', load: '750', note: '7/31 14:00 TEMA 입항, 하역 후 8/3 출항 예정' },
    { name: 'P/DIS', pos: 'N0004 W01025 (H)', catch: '-', load: '900', note: '7/29 14:00 TEMA 입항, 하역 후 8/1 출항 예정' },
    { name: 'P/FORE', pos: 'S0424 W02108 (H)', catch: '5', load: '520', note: '-' },
    { name: 'P/PATH', pos: 'S0136 W01911 (H)', catch: '80', load: '820', note: '-' },
    { name: 'P/COM', pos: 'S0036 W01821 (H)', catch: '70', load: '655', note: '-' },
    { name: 'P/QUEEN', pos: 'S0611 W02255 (H)', catch: '20', load: '580', note: '-' },
    { name: 'P/GRACE', pos: 'S0039 W01106 (H)', catch: '55', load: '220', note: '-' },
  ];

  const longlineFleet = [
    { name: 'SY-55', load: '-', note: '7/19 부산 입항, 하역 및 상가수리(7/22~8/4) 후 8/8 출항 예정' },
    { name: 'TAIHO MARU', load: '338.699톤 (P-501, P-505)', note: '8/11경 부산 입항 예정' },
  ];

  const carrierFleet = [
    { name: 'SEIN TOPAZ (7,300)', load: '-', note: 'NINGBO 하역 완료(누: 4,021.269톤, 잔: 256.731톤), GENSAN 하역 완료(누: 164.150톤), 총 하역량 4,185.419톤 | GENSAN 잔량 하역 완료' },
    { name: 'SEIN VENUS (5,200)', load: '3,275t', note: 'NT-1,060, NS-1,030, S-260, P-925 | 8/5 BKK 도착 예정' },
    { name: 'HIKARI 1 (3,700)', load: '3,214(285)t', note: 'S-766(96), P-75(75), MK-428(114), MI-940, NT-1,005 | 8/5 GENSAN 도착 예정' },
    { name: 'MING RUN 17', load: '(900)t', note: '(C-900) | X-MAS 대기 중' },
    { name: 'SEIN KASAMA (7,100)', load: '-', note: '예상잔량 7,100t | X-MAS 대기 중' },
    { name: 'SHIN IZU (2,400)', load: '-', note: '예상잔량 2,400t | N04 W167 대기 중' },
    { name: 'SEIN GALAXY (3,500)', load: '1,846t', note: 'MK-956, MI-890 | RABAUL 대기 중 (타사 물량 전재 예정)' },
  ];

  return (
    <div className={styles.toolPanel} style={{ gridColumn: '1 / -1' }}>
      <div className={styles.toolHeader}>
        <Anchor size={22} color="var(--color-info)" />
        <div className={styles.toolTitle}>선단 위치 및 어획/하역 현황</div>
        {/* L-09: 일일 업무보고 정적 데이터 — '실시간' 표기 금지, 기준일 정직 표기 */}
        <span className={styles.toolBadge} style={{ background: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', marginLeft: 'auto' }}>
          STATIC · 일일 업무보고 26.07.27 동기화
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
              color: activeTab === tab.id ? '#60a5fa' : '#94a3b8',
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
              <tr style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
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
                  <td style={{ padding: '8px', fontWeight: 'bold', color: '#e2e8f0' }}>{v.name}</td>
                  <td style={{ padding: '8px', color: '#38bdf8' }}>{v.pos}</td>
                  <td style={{ padding: '8px', color: v.catch !== '-' ? 'var(--color-success)' : '#64748b' }}>{v.catch !== '-' ? `${v.catch} 톤` : '-'}</td>
                  <td style={{ padding: '8px', color: 'var(--color-warning)' }}>{v.load !== '-' ? `${v.load} 톤` : '-'}</td>
                  <td style={{ padding: '8px', color: '#cbd5e1' }}>{v.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'atlantic' && (
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
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
                  <td style={{ padding: '8px', fontWeight: 'bold', color: '#e2e8f0' }}>{v.name}</td>
                  <td style={{ padding: '8px', color: '#38bdf8' }}>{v.pos}</td>
                  <td style={{ padding: '8px', color: v.catch !== '-' ? 'var(--color-success)' : '#64748b' }}>{v.catch !== '-' ? `${v.catch} 톤` : '-'}</td>
                  <td style={{ padding: '8px', color: 'var(--color-warning)' }}>{v.load !== '-' ? `${v.load} 톤` : '-'}</td>
                  <td style={{ padding: '8px', color: '#cbd5e1' }}>{v.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'longline' && (
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '8px' }}>선박</th>
                <th style={{ padding: '8px' }}>선적량</th>
                <th style={{ padding: '8px' }}>비고 및 입출항 현황</th>
              </tr>
            </thead>
            <tbody>
              {longlineFleet.map((v, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(140,170,255,0.10)' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold', color: '#e2e8f0' }}>{v.name}</td>
                  <td style={{ padding: '8px', color: 'var(--color-warning)' }}>{v.load}</td>
                  <td style={{ padding: '8px', color: '#cbd5e1' }}>{v.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'carrier' && (
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '8px' }}>선박 (Capa)</th>
                <th style={{ padding: '8px' }}>선적 현황 / 잔량</th>
                <th style={{ padding: '8px' }}>목적지 및 상태</th>
              </tr>
            </thead>
            <tbody>
              {carrierFleet.map((v, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(140,170,255,0.10)' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold', color: '#e2e8f0' }}>{v.name}</td>
                  <td style={{ padding: '8px', color: 'var(--color-success)' }}>{v.load}</td>
                  <td style={{ padding: '8px', color: '#cbd5e1' }}>{v.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
