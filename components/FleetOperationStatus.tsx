import React, { useState } from 'react';
import styles from './FieldTools.module.css';
import { Ship, Anchor, MapPin, Package, Calendar } from 'lucide-react';

export default function FleetOperationStatus() {
  const [activeTab, setActiveTab] = useState('pacific');

  const tabs = [
    { id: 'pacific', name: '태평양 선망', summary: '일간 135t / 연간 26,744.5t' },
    { id: 'atlantic', name: '대서양 선망', summary: '일간 235t / 연간 10,965t' },
    { id: 'longline', name: '연승 (Longline)', summary: '4척 운영' },
    { id: 'carrier', name: '운반선 현황', summary: '7척 운항/대기' },
  ];

  const pacificFleet = [
    { name: 'S/EXP', pos: 'N0006 E17655 (KI)', catch: '-', load: '-', note: '-' },
    { name: 'S/PIO', pos: 'S0327 W17603 (KI)', catch: '45', load: '110', note: '-' },
    { name: 'S/CHA', pos: 'S0321 W17623 (KI)', catch: '-', load: '195', note: '-' },
    { name: 'S/HAR', pos: 'S0307 W17623 (KI)', catch: '-', load: '780', note: '-' },
    { name: 'S/JUP', pos: 'S0325 W17727 (KI)', catch: '60', load: '60', note: '-' },
    { name: 'S/SPR', pos: 'TARAWA', catch: '-', load: '-', note: '5/1 TARAWA 입항, 5/4 출항 예정' },
    { name: 'MOAMARI', pos: 'N0333 W17921 (H)', catch: '-', load: '395', note: '-' },
    { name: 'MOAKONA', pos: 'S0334 W17601 (KI)', catch: '10', load: '10', note: '-' },
    { name: 'NAOERO SUN', pos: 'S0413 W17758 (H)', catch: '20', load: '662', note: '-' },
    { name: 'NAOERO STAR', pos: 'S0308 W17651 (KI)', catch: '-', load: '640', note: '-' },
  ];

  const atlanticFleet = [
    { name: 'P/MAS', pos: 'S0211 W00439 (H)', catch: '5', load: '140' },
    { name: 'P/DIS', pos: 'N0114 W00851 (L)', catch: '110', load: '360' },
    { name: 'P/FORE', pos: 'S0141 W00518 (H)', catch: '25', load: '275' },
    { name: 'P/PATH', pos: 'S0030 W00835 (H)', catch: '-', load: '110' },
    { name: 'P/COM', pos: 'N0037 W00904 (H)', catch: '45', load: '155' },
    { name: 'P/QUEEN', pos: 'S0151 W00618 (H)', catch: '40', load: '185' },
    { name: 'P/GRACE', pos: 'N0218 W01334 (H)', catch: '10', load: '85' },
  ];

  const longlineFleet = [
    { name: 'SY-51', load: '-', note: '3/14 부산 입항, 하역 및 상가수리(3/17~3/31) 후 5/16 출항 예정' },
    { name: 'SY-56', load: '(269.594톤)', note: '4/12 현장발, 5/11 부산 입항, 하역 및 상가수리(5/14~5/27) 후 6/1 출항 예정 (유가 주시 예정)' },
    { name: 'SEI SHIN', load: '(233.557톤 (P-506, P-505))', note: '5/6 P-505 하역 완료(누: 137.856톤, 증: +5.010톤) / 5/11 P-506 100.711톤 하역 예정' },
    { name: 'GENTA MARU', load: '(355.126톤 (SY-52, P-502, P-501))', note: '5/26 SY-52 97.390톤 하역 예정 / 5/28 P-502 155.725톤 하역 예정 / 5/29 P-501 102.011톤 하역 예정' },
  ];

  const carrierFleet = [
    { name: 'HIKARI 1 (3,800)', load: '826', note: 'GENSAN 하역 완료' },
    { name: 'DINOK (4,500)', load: '4,385', note: 'BKK 하역 중' },
    { name: 'SEIN PHOENIX (7,100)', load: '6,955', note: '5/4 BKK 도착 예정' },
    { name: 'BAO LUCKY (5,800)', load: '4,803', note: '5/19 BKK 도착 예정' },
    { name: 'SHIN IZU (2,400)', load: '2,301(161)', note: '5/16 국내 도착 예정' },
    { name: 'SHIN FUJI (3,200)', load: '잔량 3,200', note: 'TARAWA 대기 중' },
    { name: 'SEIN TOPAZ (7,300)', load: '잔량 5,918', note: 'TARAWA 대기 중 (타사 1,381.8)' },
  ];

  return (
    <div className={styles.toolPanel} style={{ gridColumn: '1 / -1' }}>
      <div className={styles.toolHeader}>
        <Anchor size={22} color="var(--color-info)" />
        <div className={styles.toolTitle}>실시간 선단 위치 및 어획/하역 현황 (Fleet Operations)</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', marginLeft: 'auto' }}>
          ✓ 실데이터 (2026.05.07)
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

      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                <th style={{ padding: '8px' }}>선박</th>
                <th style={{ padding: '8px' }}>현재 위치</th>
                <th style={{ padding: '8px' }}>당일 어획량</th>
                <th style={{ padding: '8px' }}>누적 선적량</th>
              </tr>
            </thead>
            <tbody>
              {atlanticFleet.map((v, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold', color: '#e2e8f0' }}>{v.name}</td>
                  <td style={{ padding: '8px', color: '#38bdf8' }}>{v.pos}</td>
                  <td style={{ padding: '8px', color: v.catch !== '-' ? 'var(--color-success)' : '#64748b' }}>{v.catch !== '-' ? `${v.catch} 톤` : '-'}</td>
                  <td style={{ padding: '8px', color: 'var(--color-warning)' }}>{v.load !== '-' ? `${v.load} 톤` : '-'}</td>
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
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
