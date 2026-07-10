import React, { useState } from 'react';
import styles from './FieldTools.module.css';
import { Anchor } from 'lucide-react';

export default function FleetOperationStatus() {
  const [activeTab, setActiveTab] = useState('pacific');

  const tabs = [
    { id: 'pacific', name: '태평양 선망', summary: '일간 94t / 월간 1,739t / 연간 41,267.5t' },
    { id: 'atlantic', name: '대서양 선망', summary: '일간 0t / 월간 870t / 연간 21,430t' },
    { id: 'longline', name: '연승 (Longline)', summary: 'SY-55 · 7/19 부산 입항 예정' },
    { id: 'carrier', name: '운반선 현황', summary: '7척 운항/대기' },
  ];

  const pacificFleet = [
    { name: 'S/EXP', pos: 'S0242 W16428 (KI)', catch: '-', load: '423(13)', note: '-' },
    { name: 'S/PIO', pos: 'S0012 W16154 (US)', catch: '-', load: '1,000(75)', note: '7/11 07:00 X-MAS 입항, HIKARI 1 및 SEIN VENUS 편 약 1,000톤 전재 후 7/14 출항 예정' },
    { name: 'S/CHA', pos: 'S0149 W16816 (KI)', catch: '-', load: '450', note: '-' },
    { name: 'S/HAR', pos: 'S0324 E16755 (KI)', catch: '-', load: '-', note: '-' },
    { name: 'S/JUP', pos: 'MAJURO', catch: '-', load: '-', note: '6/22 08:15 MAJURO 입항, M/E 점검 중 (출항 일정 M/E 기술자 확인)' },
    { name: 'S/SPR', pos: 'S0231 W15614 (KI)', catch: '5', load: '85(5)', note: '-' },
    { name: 'MOAMARI', pos: 'S0201 W15710 (KI)', catch: '80', load: '545', note: '-' },
    { name: 'MOAKONA', pos: 'S0237 W15702 (KI)', catch: '9(4)', load: '296(79)', note: '-' },
    { name: 'NAOERO SUN', pos: 'S0259 W16256 (H)', catch: '-', load: '40', note: '-' },
    { name: 'NAOERO STAR', pos: 'S0200 W15637 (KI)', catch: '-', load: '850', note: '-' },
  ];

  const atlanticFleet = [
    { name: 'P/MAS', pos: 'N0020 W00529 (H)', catch: '-', load: '20', note: '-' },
    { name: 'P/DIS', pos: 'TEMA', catch: '-', load: '-', note: '7/5 07:00 TEMA 입항, 하역 완료(누: 1,069.907톤, 증: +169.907톤), 7/10 출항 예정' },
    { name: 'P/FORE', pos: 'N0515 W00016 (G)', catch: '-', load: '-', note: '7/4 16:30 TEMA 입항, 하역(누: 1,006.420톤, 증: +106.420톤) 후 7/9 14:00 출항 완료' },
    { name: 'P/PATH', pos: 'TEMA', catch: '-', load: '-', note: '7/5 08:00 TEMA 입항, 하역 완료(누: 1,079.228톤, 증: +179.228톤), 7/10 출항 예정' },
    { name: 'P/COM', pos: 'TEMA', catch: '-', load: '900', note: '7/9 16:00 TEMA 입항, 하역 후 7/12 출항 예정' },
    { name: 'P/QUEEN', pos: 'TEMA', catch: '-', load: '900', note: '7/7 19:00 TEMA 입항, 하역 후 7/11 출항 예정' },
    { name: 'P/GRACE', pos: 'N0216 W00352 (C)', catch: '-', load: '900', note: '7/11 06:00 TEMA 입항 및 하역 후 7/13 출항 예정' },
  ];

  const longlineFleet = [
    { name: 'SY-55', load: '332.276톤', note: '6/21 조업 종료 및 현장발, 7/19경 부산 입항 예정' },
  ];

  const carrierFleet = [
    { name: 'SEIN TOPAZ (7,300)', load: '150t', note: 'NS-150, 타사 물량~2,566.80 | 7/12경 NINGBO 출항 후 GENSAN 하역 예정' },
    { name: 'LAKE WIN (2,300)', load: '150(150)t', note: 'MK-150(150) | 7/11 통영 도착 예정 (7/14 당사 물량 하역 예정)' },
    { name: 'HIKARI 1 (3,700)', load: '881(171)t', note: '예상잔량 (2,819)t | S-766(96), (P-115(75)) | X-MAS 대기 중' },
    { name: 'SEIN VENUS (5,200)', load: '(3,235)t', note: '예상잔량 (1,965)t | NT-1,060, NS-1,030, S-260, (P-885) | X-MAS 대기 중' },
    { name: 'SEIN KASAMA (7,100)', load: '-', note: '예상잔량 7,100t | NO2 W158 대기 중' },
    { name: 'SHIN IZU (2,400)', load: '-', note: '예상잔량 2,400t | NO4 E179 대기 중' },
    { name: 'SEIN GALAXY (3,500)', load: '1,846t', note: 'MK-956, MI-890 | RABAUL 대기 중 (타사 물량 전재 예정)' },
  ];

  return (
    <div className={styles.toolPanel} style={{ gridColumn: '1 / -1' }}>
      <div className={styles.toolHeader}>
        <Anchor size={22} color="var(--color-info)" />
        <div className={styles.toolTitle}>선단 위치 및 어획/하역 현황</div>
        {/* L-09: 일일 업무보고 정적 데이터 — '실시간' 표기 금지, 기준일 정직 표기 */}
        <span className={styles.toolBadge} style={{ background: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', marginLeft: 'auto' }}>
          STATIC · 일일 업무보고 26.07.10 동기화
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
