import React, { useState } from 'react';
import styles from './FieldTools.module.css';
import { Ship, Anchor, MapPin, Package, Calendar } from 'lucide-react';

export default function FleetOperationStatus() {
  const [activeTab, setActiveTab] = useState('pacific');

  const tabs = [
    { id: 'pacific', name: '태평양 선망', summary: '일간 44t / 연간 35,979.5t' },
    { id: 'atlantic', name: '대서양 선망', summary: '일간 145t / 연간 15,895t' },
    { id: 'longline', name: '연승 (Longline)', summary: '3척 운영 · 6/2 보고 기준' },
    { id: 'carrier', name: '운반선 현황', summary: '7척 운항/대기' },
  ];

  const pacificFleet = [
    { name: 'S/EXP', pos: 'TARAWA', catch: '-', load: '13(13)', note: '5/24 13:45 TARAWA 입항, SHIN FUJI 편 BRINE 약 306톤 전재 및 구망 인계 완료, 어기교대(정윤채 → 공준식), M/E 수리 후 6/16 출항 예정' },
    { name: 'S/PIO', pos: 'S0143 W17018 (KI)', catch: '14', load: '205', note: '-' },
    { name: 'S/CHA', pos: 'TARAWA', catch: '-', load: '990', note: '6/8 13:00 TARAWA 입항, SEIN TOPAZ 편 약 990톤 전재 후 6/11 출항 예정' },
    { name: 'S/HAR', pos: '부산', catch: '-', load: '-', note: '6/1 13:45 부산 오리엔트 조선 안벽 접안, 상가수리(6/9~6/23) 후 6/27 출항 예정' },
    { name: 'S/JUP', pos: 'N0020 W17851 (US)', catch: '-', load: '980', note: '6/10 MOAMARI 편 M/E 부품 인수, 6/13 TARAWA 입항 후 SEIN TOPAZ 편 약 980톤 전재 예정' },
    { name: 'S/SPR', pos: 'S0248 W17538 (KI)', catch: '30', load: '164', note: '-' },
    { name: 'MOAMARI', pos: 'S0136 W17101 (KI)', catch: '-', load: '890', note: '6/10 S/JUP M/E 부품 인계, 6/13 FUNAFUTI 입항 후 SEIN GALAXY 편 약 890톤 전재 예정' },
    { name: 'MOAKONA', pos: 'FUNAFUTI', catch: '-', load: '1,106(150)', note: '6/10 08:00 FUNAFUTI 입항, SEIN GALAXY 편 약 1,106톤 전재 후 6/13 출항 예정' },
    { name: 'NAOERO SUN', pos: 'S0138 W16353 (H)', catch: '-', load: '575', note: '-' },
    { name: 'NAOERO STAR', pos: 'S0145 W17014 (KI)', catch: '-', load: '560', note: '-' },
  ];

  const atlanticFleet = [
    { name: 'P/MAS', pos: 'S0418 W01746 (H)', catch: '30', load: '210', note: '-' },
    { name: 'P/DIS', pos: 'N0020 W01340 (H)', catch: '70', load: '320', note: '6/10 그물 파망 사고, 6/12 ABIDJAN 입항 예정' },
    { name: 'P/FORE', pos: 'S0100 W01124 (H)', catch: '40', load: '105', note: '-' },
    { name: 'P/PATH', pos: 'TEMA', catch: '-', load: '630', note: '6/7 07:15 TEMA 입항, 하역 후 6/10 출항 예정' },
    { name: 'P/COM', pos: 'N0341 W00557 (C)', catch: '-', load: '900', note: '6/11 07:00 TEMA 입항, 하역 후 6/13 출항 예정' },
    { name: 'P/QUEEN', pos: 'N0336 W00146 (G)', catch: '-', load: '900', note: '6/10 07:00 TEMA 입항, 하역 후 6/12 출항 예정' },
    { name: 'P/GRACE', pos: 'N0145 W01722 (H)', catch: '5', load: '775', note: '6/13 ABIDJAN 입항, 그물 교체 후 6/16 출항 예정' },
  ];

  const longlineFleet = [
    { name: 'SY-56', load: '-', note: '5/11 부산 입항, 하역 및 상가수리(5/14~5/27) 후 6/2 11:00 출항 예정' },
    { name: 'P-505', load: '-', note: '(발전기 수리 및 휴게입항) 5/27 07:15 타히티 입항, 5/31 출항 완료' },
    { name: 'GENTA MARU', load: '(355.126톤 (SY-52, P-502, P-501))', note: '5/22 P-502 하역 완료(누: 177.401톤, 증: +21.676톤) / 5/26 P-501 하역 완료(누: 109.698톤, 증: +7.687톤) / 5/29 SY-52 97.390톤 하역 예정' },
  ];

  const carrierFleet = [
    { name: 'SEIN PHOENIX (7,100)', load: '6,955t', note: 'NT-1,080, MK-750, S-420, J-1,030, P-1,080, H-930, MI-485, S-1,180 | BKK 하역 중' },
    { name: 'SHIN IZU (2,400)', load: '2,301(161)t', note: 'S-50(20), C-130, P-200, MK-69(49), E-117(92), J-730, S-1,005 | 통영 하역 중' },
    { name: 'BAO LUCKY (5,800)', load: '4,803t', note: 'MI-885, NT-1,035, C-865, P-375, MK-870, E-773, 타사 물량 -930 | BKK 하역 중' },
    { name: 'SHIN FUJI (3,200)', load: '3,096t', note: 'MI-950, NS-670, E-306, NT-900, P-270 | 6/14 BKK 도착 예정' },
    { name: 'SEIN TOPAZ (7,300)', load: '(4,278)t', note: '예상잔량 -t | NS-150, P-980, S-1,178, (C-990), (J-980), 타사 물량 -2,566.80 | TARAWA 전재 중' },
    { name: 'SEIN GALAXY (3,500)', load: '(1,106(150))t', note: '예상잔량 (2,394)t | (MK-1,106(150)) | 6/11 FUNAFUTI 도착 예정' },
    { name: 'LAKE WIN (500)', load: '150t', note: 'FUNAFUTI 전재 중' },
  ];

  return (
    <div className={styles.toolPanel} style={{ gridColumn: '1 / -1' }}>
      <div className={styles.toolHeader}>
        <Anchor size={22} color="var(--color-info)" />
        <div className={styles.toolTitle}>선단 위치 및 어획/하역 현황</div>
        {/* L-09: 일일 업무보고 정적 데이터 — '실시간' 표기 금지, 기준일 정직 표기 */}
        <span className={styles.toolBadge} style={{ background: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', marginLeft: 'auto' }}>
          STATIC · 일일 업무보고 26.06.10 동기화
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
                <th style={{ padding: '8px', width: '15%' }}>선박</th>
                <th style={{ padding: '8px', width: '20%' }}>현재 위치</th>
                <th style={{ padding: '8px', width: '15%' }}>당일 어획량</th>
                <th style={{ padding: '8px', width: '15%' }}>누적 선적량</th>
                <th style={{ padding: '8px', width: '35%' }}>비고</th>
              </tr>
            </thead>
            <tbody>
              {atlanticFleet.map((v, idx) => (
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
