import React, { useState } from 'react';
import styles from './FieldTools.module.css';
import { Ship, Anchor, MapPin, Package, Calendar } from 'lucide-react';

export default function FleetOperationStatus() {
  const [activeTab, setActiveTab] = useState('pacific');

  const tabs = [
    { id: 'pacific', name: '태평양 선망', summary: '일간 30t / 연간 30,924.5t' },
    { id: 'atlantic', name: '대서양 선망', summary: '일간 155t / 연간 13,085t' },
    { id: 'longline', name: '연승 (Longline)', summary: '3척 운영' },
    { id: 'carrier', name: '운반선 현황', summary: '6척 운항/대기' },
  ];

  const pacificFleet = [
    { name: 'S/EXP', pos: 'S0543 W17324 (KI)', catch: '-', load: '319(13)', note: '-' },
    { name: 'S/PIO', pos: 'S0500 W17303 (KI)', catch: '-', load: '1,035', note: '-' },
    { name: 'S/CHA', pos: 'S0510 W17251 (KI)', catch: '-', load: '440', note: '-' },
    { name: 'S/HAR', pos: 'N1131 E14555 (US)', catch: '-', load: '1,200', note: '5/11 현장발, 5/26 09:00 통영 입항 예정' },
    { name: 'S/JUP', pos: 'S0531 W17257 (KI)', catch: '-', load: '445', note: '-' },
    { name: 'S/SPR', pos: 'S0514 W17257 (KI)', catch: '-', load: '544(6)', note: '-' },
    { name: 'MOAMARI', pos: 'N0542 W17756 (H)', catch: '5', load: '950', note: '5/21 12:00 TARAWA 입항, SHIN FUJI 편 약 950톤 전재 및 CA 검사 후 5/24 출항 예정' },
    { name: 'MOAKONA', pos: 'S0228 W17242 (KI)', catch: '5', load: '402(37)', note: '-' },
    { name: 'NAOERO SUN', pos: 'N0420 W17820 (H)', catch: '23', load: '797 (전재 820)', note: '5/21 15:00 TARAWA 입항, SEIN TOPAZ 및 SHIN FUJI 편 약 820톤 전재 후 5/24 출항 예정' },
    { name: 'NAOERO STAR', pos: 'S0113 W17238 (KI)', catch: '20', load: '900', note: '-' },
  ];

  const atlanticFleet = [
    { name: 'P/MAS', pos: 'S0358 W01250 (H)', catch: '10', load: '540' },
    { name: 'P/DIS', pos: 'S0249 W01433 (H)', catch: '20', load: '720' },
    { name: 'P/FORE', pos: 'N0940 W02010 (H)', catch: '15', load: '550' },
    { name: 'P/PATH', pos: 'S0031 W00942 (H)', catch: '50', load: '410' },
    { name: 'P/COM', pos: 'S0014 W00354 (H)', catch: '35', load: '445' },
    { name: 'P/QUEEN', pos: 'N0307 W01831 (H)', catch: '15', load: '450' },
    { name: 'P/GRACE', pos: 'N0213 W01533 (H)', catch: '10', load: '315' },
  ];

  const longlineFleet = [
    { name: 'SY-56', load: '-', note: '5/11 부산 입항, 하역 및 상가수리(5/14~5/27) 후 6/1 출항 예정 (유가 주시 예정)' },
    { name: 'P-505', load: '-', note: '(발전기 수리 및 휴계입항) 5/27 타히티 입항, 5/31 출항 예정' },
    { name: 'GENTA MARU', load: '(355.126톤 (SY-52, P-502, P-501))', note: '5/22 P-502 155.725톤 하역 예정 / 5/26 P-501 102.011톤 하역 예정 / 5/29 SY-52 97.390톤 하역 예정' },
  ];

  const carrierFleet = [
    { name: 'DINOK (4,500)', load: '누: 4,534.38t', note: '증: +149.38t | BKK 하역 완료' },
    { name: 'SHIN IZU (2,400)', load: '2,301(161)t', note: 'S-50(20), C-130, P-200, MK-69(49), E-117(92), J-730, S-1,005 | 마산 하역 중' },
    { name: 'SEIN PHOENIX (7,100)', load: '6,955t', note: 'NT-1,080, MK-750, S-420, J-1,030, P-1,080, H-930, MI-485, S-1,180 | BKK 하역 대기 중' },
    { name: 'BAO LUCKY (5,800)', load: '4,803t', note: 'MI-885, NT-1,035, C-865, P-375, MK-870, E-773, 타사 물량-930 | 5/22 BKK 도착 예정' },
    { name: 'SHIN FUJI (3,200)', load: '(1,670)t', note: '예상잔량 (1,530)t | (MI-950), (NS-720) | TARAWA 대기 중' },
    { name: 'SEIN TOPAZ (7,300)', load: '(100)t', note: '예상잔량 (4,633)t | (NS-100), (타사 물량-2,566.80) | TARAWA 대기 중' },
  ];

  return (
    <div className={styles.toolPanel} style={{ gridColumn: '1 / -1' }}>
      <div className={styles.toolHeader}>
        <Anchor size={22} color="var(--color-info)" />
        <div className={styles.toolTitle}>실시간 선단 위치 및 어획/하역 현황 (Fleet Operations)</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', marginLeft: 'auto' }}>
          ✓ 실데이터 (2026.05.20)
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
