'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './FleetPerformance.module.css';
import { Anchor, Ship, BarChart2, PieChart, Activity, Map, Navigation } from 'lucide-react';
import CountUp from 'react-countup';
import { WeeklyCatchChart, MonthlyCatchChart, CumulativeChart, CumulativeTableData } from './FleetCharts';
import { AtlanticSeinersTable, LonglinersTable, CarriersTable } from './VesselStatusTables';
import RadarOverlay from './RadarOverlay';
import { playSonarPing } from '../lib/audio';
import TermTooltip from './TermTooltip';

// SSR must be disabled for Leaflet to work in Next.js
const PacificMapWithNoSSR = dynamic(() => import('./PacificVesselMap'), {
  ssr: false,
  loading: () => <div style={{ height: '550px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(140,170,255,0.10)' }}>Loading Map...</div>
});

const PacificGlobeWithNoSSR = dynamic(() => import('./PacificGlobe'), {
  ssr: false,
  loading: () => <div style={{ height: '550px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(140,170,255,0.10)' }}>Loading 3D Globe...</div>
});
const CAPTAIN_DATA = [
  { rank: 1, name: '김정훈', vessel: 'MARI', weekly: '195.00', daily: '27.86' },
  { rank: 2, name: '최용석', vessel: 'S/CHA', weekly: '190.00', daily: '27.14' },
  { rank: 3, name: '김효원', vessel: 'S/SPR', weekly: '182.00', daily: '26.00' },
  { rank: 4, name: '조태연', vessel: 'N/STAR', weekly: '105.00', daily: '15.00' },
  { rank: 5, name: '김형주', vessel: 'N/SUN', weekly: '100.00', daily: '14.29' },
  { rank: 6, name: '오복근', vessel: 'S/HAR', weekly: '95.00', daily: '13.57' },
  { rank: 7, name: '공준식', vessel: 'S/EXP', weekly: '81.30', daily: '11.61' },
  { rank: 8, name: '김승현', vessel: 'S/PIO', weekly: '39.00', daily: '5.57' },
  { rank: 9, name: '이평규', vessel: 'KONA', weekly: '22.00', daily: '3.14' },
  { rank: 10, name: '강창훈', vessel: 'S/JUP', weekly: '-', daily: '-' },
];

const VESSEL_SPECS: Record<string, { type: string, gt: string, year: string, age: string, country: string, kw: string, capacity: string }> = {
  'S/SPR': { type: '참치선망 (국적)', gt: '1,971', year: '2011', age: '14 yr', country: '대만', kw: '3,309', capacity: '1,200' },
  'S/EXP': { type: '참치선망 (국적)', gt: '2,060', year: '2014', age: '11 yr', country: '한국', kw: '3,311', capacity: '1,300' },
  'S/JUP': { type: '참치선망 (국적)', gt: '780', year: '2001', age: '25 yr', country: '칠레', kw: '2,941', capacity: '1,000' },
  'S/CHA': { type: '참치선망 (국적)', gt: '1,349', year: '1990', age: '36 yr', country: '미국', kw: '2,942', capacity: '1,000' },
  'S/PIO': { type: '참치선망 (국적)', gt: '2,060', year: '2014', age: '11 yr', country: '한국', kw: '2,942', capacity: '1,300' },
  'S/HAR': { type: '참치선망 (국적)', gt: '1,971', year: '2011', age: '15 yr', country: '대만', kw: '3,310', capacity: '1,200' },
  'KONA': { type: '참치선망 (합작)', gt: '2,338', year: '2014', age: '13 yr', country: '한국', kw: '3,309', capacity: '1,972' },
  'MARI': { type: '참치선망 (합작)', gt: '1,633', year: '1982', age: '44 yr', country: '미국', kw: '2,685', capacity: '1,572' },
  'N/SUN': { type: '참치선망 (합작)', gt: '1,742', year: '1990', age: '36 yr', country: '미국', kw: '2,942', capacity: '1,614' },
  'N/STAR': { type: '참치선망 (합작)', gt: '1,742', year: '1990', age: '36 yr', country: '미국', kw: '2,942', capacity: '1,614' }
};

export default function FleetPerformance() {
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [mapViewMode, setMapViewMode] = useState<'2D' | '3D'>('2D');

  const handleVesselSelect = (vesselName: string) => {
    playSonarPing();
    setSelectedVessel(vesselName);
  };

  const [liveData, setLiveData] = useState<any>(null);

  React.useEffect(() => {
    fetch('/api/tuna-live')
      .then(res => res.json())
      .then(data => setLiveData(data.fleet))
      .catch(err => console.error("Failed to fetch live data", err));
  }, []);

  return (
    <section className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className={styles.headerTitle} style={{ margin: 0 }}>
          <Anchor size={20} /> 주간 실적 현황 (26.07.13 ~ 07.19) - 7월 셋째주
        </h2>
        {liveData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px var(--w-emerald-500)' }}></span>
            <span style={{ color: 'var(--color-success)', fontSize: '13px', fontWeight: 'bold' }}>{liveData.status} ({liveData.source})</span>
          </div>
        )}
      </div>

      {liveData && liveData.climateRisk && (
        <div style={{ marginBottom: '24px', background: 'var(--panel-bg)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '20px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: 'var(--color-warning)' }}>
            <Navigation size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>기후 리스크 시뮬레이터 (Climate Risk Simulator)</h3>
              <span style={{ fontSize: '12px', padding: '2px 8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Risk: {liveData.climateRisk.riskLevel}</span>
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--color-warning)' }}>SST 변동: {liveData.climateRisk.sstAnomaly}</strong> | {liveData.climateRisk.impact}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', opacity: 0.8, fontStyle: 'italic' }}>
              * {liveData.climateRisk.analysis}
            </p>
          </div>
        </div>
      )}

      <div className={styles.metricsGrid}>
        <div className={`${styles.metricBox} ${styles.metricBoxHighlight}`}>
          <div className={styles.metricTitle}><TermTooltip term="국적선" description="대한민국 국적을 취득하고 정부의 허가 아래 조업하는 자사 소유의 선박입니다." /> 주간 <TermTooltip term="어획량" description="참치(가다랑어, 황다랑어 등)를 잡아올린 순수 물량(톤)입니다." /></div>
          <div className={`${styles.metricValue} ${styles.valueHighlight}`}>587<span className={styles.unit}>톤</span></div>
        </div>
        <div className={`${styles.metricBox} ${styles.metricBoxHighlight}`}>
          <div className={styles.metricTitle}><TermTooltip term="합작선" description="해외 연안국(예: 키리바시 등)과 합작 투자를 통해 현지 국적을 달고 조업하여, 해당국의 입어 쿼터(VDS) 확보에 유리한 선박입니다." /> 주간 어획량</div>
          <div className={`${styles.metricValue} ${styles.valueHighlight}`}>422<span className={styles.unit}>톤</span></div>
        </div>
        <div className={`${styles.metricBox} ${styles.metricBoxHighlight}`}>
          <div className={styles.metricTitle}>주간 총 어획량</div>
          <div className={`${styles.metricValue} ${styles.valueHighlight}`}>1,009<span className={styles.unit}>톤</span></div>
        </div>

        <div className={styles.metricBox}>
          <div className={styles.metricTitle}>국적선 월간 어획량</div>
          <div className={`${styles.metricValue} ${styles.valueNormal}`}>1,531<span className={styles.unit}>톤</span></div>
        </div>
        <div className={styles.metricBox}>
          <div className={styles.metricTitle}>합작선 월간 어획량</div>
          <div className={`${styles.metricValue} ${styles.valueNormal}`}>1,914<span className={styles.unit}>톤</span></div>
        </div>
        <div className={styles.metricBox}>
          <div className={styles.metricTitle}>월간 총 어획량</div>
          <div className={`${styles.metricValue} ${styles.valueNormal}`}>3,445<span className={styles.unit}>톤</span></div>
        </div>

        <div className={styles.metricBox}>
          <div className={styles.metricTitle}>국적선 연간 어획량</div>
          <div className={`${styles.metricValue} ${styles.valueNormal}`}>25,592<span className={styles.unit}>톤</span></div>
        </div>
        <div className={styles.metricBox}>
          <div className={styles.metricTitle}>합작선 연간 어획량</div>
          <div className={`${styles.metricValue} ${styles.valueNormal}`}>17,382<span className={styles.unit}>톤</span></div>
        </div>
        <div className={styles.metricBox}>
          <div className={styles.metricTitle}>연간 총 어획량</div>
          <div className={`${styles.metricValue} ${styles.valueNormal}`}>42,974<span className={styles.unit}>톤</span></div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard} style={{ gridColumn: 'span 1' }}>
          <h3 className={styles.chartCardTitle}><BarChart2 size={18} /> 선박(선장별) 주간 어획량</h3>
          <WeeklyCatchChart />
        </div>
        <div className={styles.chartCard} style={{ gridColumn: 'span 1' }}>
          <h3 className={styles.chartCardTitle}><PieChart size={18} /> 선박별 월간 어획량</h3>
          <MonthlyCatchChart />
        </div>
        <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
          <h3 className={styles.chartCardTitle}><Activity size={18} /> 선장 실적 누계 (<TermTooltip term="현어기" description="현재 조업이 진행 중인 기간(보통 출항 후 입항 전까지의 1회 조업 사이클)을 뜻합니다." />) 현황</h3>
          <CumulativeChart />
        </div>
      </div>

      <div className={styles.twoColumnsTables}>
        <div>
          <h3 className={styles.tableSectionTitle}>
            <Ship size={18} /> 주간 선장실적 (Weekly Captain Performance)
          </h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>순위</th>
                  <th>선장</th>
                  <th>선박명</th>
                  <th>주간 어획량 (톤)</th>
                  <th>일평균 어획량 (톤)</th>
                </tr>
              </thead>
              <tbody>
                {CAPTAIN_DATA.map((row) => {
                  let rowClass = '';
                  if (row.rank === 1) rowClass = styles.rowTop1;
                  else if (row.rank === 2) rowClass = styles.rowTop2;
                  else if (row.rank === 3) rowClass = styles.rowTop3;

                  return (
                  <tr key={row.rank} className={rowClass}>
                    <td>
                      {row.rank <= 3 ? <span className={styles.rankTop}>{row.rank}</span> : row.rank}
                    </td>
                    <td style={{ fontWeight: row.rank <= 3 ? 600 : 400 }}>
                      {row.name}
                      {row.rank === 1 && <span className={`${styles.badge} ${styles.badgeGold}`}>👑 참치왕</span>}
                      {row.rank === 2 && <span className={`${styles.badge} ${styles.badgeSilver}`}>⚔️ 엘리트</span>}
                      {row.rank === 3 && <span className={`${styles.badge} ${styles.badgeBronze}`}>🎯 스나이퍼</span>}
                    </td>
                    <td 
                      onClick={() => handleVesselSelect(row.vessel)}
                      style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '4px', color: '#60a5fa', fontWeight: 600 }}
                    >
                      {row.vessel}
                    </td>
                    <td style={{ color: row.rank <= 3 ? 'var(--accent-danger)' : 'inherit', fontWeight: row.rank <= 3 ? 600 : 400 }}>
                      {row.weekly !== '-' ? <CountUp end={parseFloat(row.weekly)} decimals={2} duration={2} separator="," /> : '-'}
                    </td>
                    <td style={{ color: row.rank <= 3 ? 'var(--accent-danger)' : 'inherit', fontWeight: row.rank <= 3 ? 600 : 400 }}>
                      {row.daily !== '-' ? <CountUp end={parseFloat(row.daily)} decimals={2} duration={2}  /> : '-'}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className={styles.tableSectionTitle}>
            <Ship size={18} /> 선장 실적 누계 (상세)
          </h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>순위</th>
                  <th style={{ whiteSpace: 'nowrap', minWidth: '70px' }}>선장명</th>
                  <th>선박명</th>
                  <th>승선일</th>
                  <th><TermTooltip term="어기일수" description="어기(출항 이후부터) 동안 바다에 머무르며 조업 및 항해한 총 일수입니다." /></th>
                  <th>누적 어획량 (톤)</th>
                  <th>일어획량 (톤)</th>
                  <th>대비</th>
                  <th>평균실적 대비</th>
                </tr>
              </thead>
              <tbody>
                {[...CumulativeTableData].sort((a,b) => a.rank - b.rank).map((row) => {
                  let rowClass = '';
                  if (row.rank === 1) rowClass = styles.rowTop1;
                  else if (row.rank === 2) rowClass = styles.rowTop2;
                  else if (row.rank === 3) rowClass = styles.rowTop3;

                  return (
                  <tr key={row.rank} className={rowClass}>
                    <td>{row.rank <= 3 ? <span className={styles.rankTop}>{row.rank}</span> : row.rank}</td>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: row.rank <= 3 ? 600 : 400 }}>
                      {row.cap}
                      {row.catchTotal > 10000 && <span className={`${styles.badge} ${styles.badgeGold}`}>💎 1만톤 클럽</span>}
                    </td>
                    <td 
                      onClick={() => handleVesselSelect(row.name)}
                      style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '4px', color: '#60a5fa', fontWeight: 600 }}
                    >
                      {row.name}
                    </td>
                    <td>{row.date}</td>
                    <td>{row.days}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      <CountUp end={row.catchTotal} duration={2.5} separator="," />
                    </td>
                    <td style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>
                      <CountUp end={Number(row.daily)} decimals={1} duration={2.5} />
                    </td>
                    <td className={Number(row.diff) >= 0 ? styles.diffPositive : styles.diffNegative}>{row.diff}</td>
                    <td className={Number(row.avgDiff) >= 0 ? styles.diffPositive : styles.diffNegative}>{row.avgDiff}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 className={styles.tableSectionTitle} style={{ margin: 0 }}>
          <Map size={18} /> 실시간 태평양 조업 선망선 및 운반선 위치 (Pacific Fleet GPS)
        </h3>
        <div style={{ display: 'flex', background: 'rgba(140,170,255,0.10)', borderRadius: '6px', padding: '2px' }}>
          <button onClick={() => setMapViewMode('2D')} style={{ padding: '5px 10px', fontSize: '12px', fontWeight: mapViewMode === '2D' ? 600 : 400, background: mapViewMode === '2D' ? 'var(--accent-primary)' : 'transparent', color: mapViewMode === '2D' ? 'var(--text-primary)' : 'var(--text-muted)', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>2D Map</button>
          <button onClick={() => setMapViewMode('3D')} style={{ padding: '5px 10px', fontSize: '12px', fontWeight: mapViewMode === '3D' ? 600 : 400, background: mapViewMode === '3D' ? 'var(--accent-primary)' : 'transparent', color: mapViewMode === '3D' ? 'var(--text-primary)' : 'var(--text-muted)', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>3D Globe</button>
        </div>
      </div>
      <div style={{ marginBottom: '2.5rem', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
        <RadarOverlay />
        {mapViewMode === '2D' ? <PacificMapWithNoSSR /> : <PacificGlobeWithNoSSR />}
      </div>

      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
        <div>
          <h3 className={styles.tableSectionTitle}>
            <Navigation size={18} /> 대서양 선망 및 기지 현황 (Atlantic Seiners)
          </h3>
          <AtlanticSeinersTable />
        </div>
        <div>
          <h3 className={styles.tableSectionTitle}>
            <Anchor size={18} /> 연승 선박 (Longliners)
          </h3>
          <LonglinersTable />
        </div>
      </div>

      <h3 className={styles.tableSectionTitle} style={{ marginTop: '1rem' }}>
        <Ship size={18} /> 수송선 및 컨테이너 선적 현황 (Carrier / Shipping)
      </h3>
      <CarriersTable />

      {/* Vessel Specs Modal */}
      {selectedVessel && VESSEL_SPECS[selectedVessel] && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setSelectedVessel(null)}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '24px',
            minWidth: '320px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            color: 'var(--text-main)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                <Ship size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                {selectedVessel} 제원
              </h3>
              <button 
                onClick={() => setSelectedVessel(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(140,170,255,0.10)' }}>
                  <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>업종</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 500 }}>{VESSEL_SPECS[selectedVessel].type}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(140,170,255,0.10)' }}>
                  <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>제조 국가</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 500 }}>{VESSEL_SPECS[selectedVessel].country}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(140,170,255,0.10)' }}>
                  <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>선령</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 500 }}>{VESSEL_SPECS[selectedVessel].age} ({VESSEL_SPECS[selectedVessel].year}년 진수)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(140,170,255,0.10)' }}>
                  <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>톤수</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 500 }}>{VESSEL_SPECS[selectedVessel].gt} GT</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(140,170,255,0.10)' }}>
                  <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>기관출력</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 500 }}>{VESSEL_SPECS[selectedVessel].kw} KW</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>보관 톤수</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 500, color: 'var(--accent-info)' }}>{VESSEL_SPECS[selectedVessel].capacity} 톤</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
