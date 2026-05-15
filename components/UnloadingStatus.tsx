'use client';
import React, { useState, useEffect } from 'react';
import styles from './UnloadingStatus.module.css';
import { Ship, Anchor, AlertCircle, BarChart3, Clock, PackageCheck, TrendingDown, Thermometer, MapPin } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import TermTooltip from './TermTooltip';
import GensanVesselStatus from './GensanVesselStatus';

export default function UnloadingStatus() {
  const [selectedVessel, setSelectedVessel] = useState('dinok');
  const [liveData, setLiveData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/tuna-live')
      .then(res => res.json())
      .then(d => setLiveData(d.unloading))
      .catch(err => console.error("Failed to fetch live data", err));
  }, []);

  const data = {
    'hikari': {
      name: 'M/V HIKARI',
      dateRange: '2026.04.26 ~ 2026.05.02',
      location: 'GENSAN, PHILIPPINES',
      buyer: 'FCF CO., LTD.',
      motherVessel: 'MOAKONA MR-01',
      status: '하역완료 (Completed)',
      reportedTotal: 826.000,
      actualTotal: 800.110,
      surplus: -25.890,
      species: [
        { id: 'SJ', name: 'Skipjack', reported: 734.000, actual: 800.110, surplus: 66.110 },
        { id: 'YF', name: 'Yellowfin', reported: 92.000, actual: 0, surplus: -92.000 }
      ],
      timeline: [
        { date: '4/26~27', time: '22:00 ~ 07:00', targetHol: 'MOAKONA(#3-B)', dailyAmount: 8.210, cumAmount: 8.210, quality: '외관상태 및 색택 전반적으로 양호.' },
        { date: '4/27~28', time: '06:00 ~ 06:00', targetHol: 'MOAKONA(#3-B)', dailyAmount: 39.770, cumAmount: 47.980, quality: 'MK:#3-B 어창 개방 측정온도 -22.9°C ~ -23.4°C. 외관상태 양호.' },
        { date: '4/28~29', time: '06:00 ~ 06:00', targetHol: 'MOAKONA(#3-B)', dailyAmount: 149.050, cumAmount: 197.030, quality: 'MK:#3-B 어창 온도 -22.0℃ ~ -22.2℃. 외관 양호.' },
        { date: '4/29~30', time: '06:00 ~ 06:00', targetHol: 'MOAKONA(#3-B)', dailyAmount: 152.330, cumAmount: 349.360, quality: 'MK:#3-B 어창 온도 -21.9℃ ~ -22.3℃.' },
        { date: '4/30~5/01', time: '06:00 ~ 06:00', targetHol: 'MOAKONA(#3-B, #3-C)', dailyAmount: 185.880, cumAmount: 535.240, quality: 'MK:#3-B 종료. MK:#3-C 어창 측정 -22.0℃. 전반적 양호.' },
        { date: '5/01~02', time: '06:00 ~ 06:00', targetHol: 'MOAKONA(#3-C, #4-C)', dailyAmount: 139.620, cumAmount: 674.860, quality: 'Night shift 계량기 고장으로 하역중단. 어창 온도 -20.9℃ ~ -21.8℃.' },
        { date: '5/02', time: '06:00 ~ 22:00', targetHol: 'MOAKONA(#3-C)', dailyAmount: 125.250, cumAmount: 800.110, quality: '5/02 22:00 하역 최종 종료. SHORT 25.890 MT' }
      ]
    },
    'dinok': {
      name: 'M/V DINOK',
      dateRange: '2026.04.23 ~ (진행중)',
      location: 'BANGKOK, THAILAND',
      buyer: 'FCF CO.,LTD',
      status: '하역중 (In Progress)',
      reportedTotal: 4385.000,
      actualTotal: 3153.220,
      surplus: -1231.780,
      species: [
        { id: 'SJ', name: 'Skipjack', reported: 4099.000, actual: 3019.620, surplus: -1079.380 },
        { id: 'YF', name: 'Yellowfin', reported: 286.000, actual: 133.600, surplus: -152.400 }
      ],
      timeline: [
        { date: '4/23', time: '08:10 ~ 20:40', targetHol: 'S/EXP(#1-A), S/SPR(#3-A)', dailyAmount: 253.470, cumAmount: 253.470, quality: '어창 온도 -21.0℃ ~ -22.0℃. 양호.' },
        { date: '4/24', time: '08:10 ~ 20:50', targetHol: 'S/EXP(#1-A), S/SPR(#3-A)', dailyAmount: 308.530, cumAmount: 562.000, quality: '어창 온도 -20.0℃ ~ -21.0℃. 양호.' },
        { date: '4/25', time: '08:10 ~ 17:30', targetHol: 'S/EXP(#1-A)', dailyAmount: 201.540, cumAmount: 763.540, quality: '4/26 Cannery 휴무. 명일 200톤 하역 예정.' },
        { date: '4/27', time: '08:20 ~ 19:30', targetHol: 'S/EXP(#3-A,#3-B), S/SPR(#3-A)', dailyAmount: 194.690, cumAmount: 958.230, quality: 'S/SPR #3-A 하역완료. 온도 -17.0℃ ~ -20.0℃.' },
        { date: '4/28', time: '10:00 ~ 20:30', targetHol: 'S/EXP(#1-A, #2-A)', dailyAmount: 165.880, cumAmount: 1124.110, quality: '온도 -18.0℃ ~ -19.0℃. 양호.' },
        { date: '4/29', time: '08:10 ~ 18:10', targetHol: 'S/EXP(#2-A, #3-B), S/HAR(#1-B)', dailyAmount: 434.960, cumAmount: 1559.070, quality: '명일 100톤 예정.' },
        { date: '4/30', time: '08:10 ~ 14:20', targetHol: 'S/EXP(#2-A)', dailyAmount: 112.890, cumAmount: 1671.960, quality: '5/1~3 연휴 휴무.' },
        { date: '5/4', time: '08:10 ~ 20:00', targetHol: 'S/EXP(#2-A), S/HAR(#1-B...)', dailyAmount: 500.710, cumAmount: 2172.670, quality: '온도 -19.0℃ ~ -22.0℃. 명일 300톤 예정.' },
        { date: '5/5', time: '08:10 ~ 20:20', targetHol: 'S/HAR(#1-C, #2-B)', dailyAmount: 257.100, cumAmount: 2429.770, quality: '온도 -20.0℃ ~ -23.0℃. 명일 휴무.' },
        { date: '5/7', time: '13:20 ~ 15:10', targetHol: 'S/CHA(#3-B)', dailyAmount: 63.400, cumAmount: 2493.170, quality: '명일 5/8 하역 없음. 5/9 재개.' },
        { date: '5/9', time: '08:10 ~ 16:30', targetHol: 'S/CHA(#3-B)', dailyAmount: 211.880, cumAmount: 2705.050, quality: '온도 -19.0℃ ~ -20.0℃. 5/10 일요일 하역 없음.' },
        { date: '5/11', time: '08:10 ~ 18:10', targetHol: 'S/CHA(#3-B, #3-C)', dailyAmount: 200.310, cumAmount: 2905.360, quality: '온도 -19.0℃ ~ -21.0℃. 5/12 사정상 휴무, 5/13 재개 예정.' },
        { date: '5/13', time: '08:10 ~ 18:50', targetHol: 'S/CHA(#3-C)', dailyAmount: 247.860, cumAmount: 3153.220, quality: '어창 온도 -19.0℃ ~ -20.0℃. 외관상태 양호. 명일 250톤 예정.' }
      ]
    },
    'heng-hong-11': {
      name: 'M/V HENG HONG 11',
      dateRange: '2026.04.06 ~ 04.07',
      location: 'BANGKOK, THAILAND',
      buyer: 'JA GLOBAL CO.,LTD',
      status: '하역완료 (Completed)',
      reportedTotal: 200.000,
      actualTotal: 231.850,
      surplus: 31.850,
      species: [
        { id: 'SJ', name: 'Skipjack', reported: 190.000, actual: 208.050, surplus: 18.050 },
        { id: 'YF', name: 'Yellowfin', reported: 10.000, actual: 23.800, surplus: 13.800 }
      ],
      timeline: [
        { date: '4/6', time: '08:10 ~ 13:10', targetHol: 'S/HAR(#1-B)', dailyAmount: 102.050, cumAmount: 102.050, quality: '어창 온도 -20.0℃ ~ -21.0℃.' },
        { date: '4/7', time: '08:10 ~ 16:00', targetHol: 'S/HAR(#1-B)', dailyAmount: 129.800, cumAmount: 231.850, quality: '어창 온도 -20.0℃ ~ -21.0℃.' }
      ]
    },
    'liaoyu-reefer-1': {
      name: 'M/V LIAOYU REEFER 1',
      dateRange: '2026.02.25 ~ 03.11',
      location: 'BANGKOK, THAILAND',
      buyer: 'FCF CO.,LTD',
      status: '하역완료 (Completed)',
      reportedTotal: 5135.000,
      actualTotal: 5119.770,
      surplus: -15.230,
      species: [
        { id: 'SJ', name: 'Skipjack', reported: 4399.000, actual: 4355.790, surplus: -43.210 },
        { id: 'YF', name: 'Yellowfin', reported: 736.000, actual: 763.980, surplus: 27.980 }
      ],
      timeline: [
        { date: '2/26', time: '08:00 ~ 15:40', targetHol: 'S/EXP(#3-A), MOAMARI(#2-A)', dailyAmount: 309.060, cumAmount: 687.690, quality: '온도 -18.0℃ ~ -21.0℃.' },
        { date: '2/27', time: '08:00 ~ 17:00', targetHol: 'MOAMARI(#1-A,#2-A), S/SPR', dailyAmount: 416.480, cumAmount: 1104.170, quality: '온도 -18.0℃ ~ -23.0℃.' },
        { date: '2/28', time: '08:00 ~ 11:40', targetHol: 'MOAMARI, S/EXP, S/SPR', dailyAmount: 238.260, cumAmount: 1342.430, quality: '양호' },
        { date: '3/2', time: '08:10 ~ 19:10', targetHol: 'MOAMARI, S/EXP, S/SPR', dailyAmount: 467.230, cumAmount: 1809.660, quality: '온도 -18.0℃ ~ -22.0℃.' },
        { date: '3/3', time: '08:10 ~ 19:30', targetHol: 'S/EXP, S/CHA, S/SPR', dailyAmount: 362.380, cumAmount: 2172.040, quality: '온도 -18.0℃ ~ -21.0℃.' },
        { date: '3/4', time: '08:10 ~ 22:10', targetHol: 'MOAMARI, S/CHA, S/SPR', dailyAmount: 625.300, cumAmount: 2797.340, quality: '양호' },
        { date: '3/5', time: '08:10 ~ 19:30', targetHol: 'MOAMARI, S/SPR', dailyAmount: 440.360, cumAmount: 3237.700, quality: '온도 -18.0℃ ~ -21.0℃.' },
        { date: '3/6', time: '08:10 ~ 16:50', targetHol: 'S/CHA, S/SPR', dailyAmount: 369.630, cumAmount: 3607.330, quality: '양호' },
        { date: '3/7', time: '08:10 ~ 16:10', targetHol: 'S/SPR, MARI, S/CHA', dailyAmount: 371.800, cumAmount: 3979.130, quality: '온도 -18.0℃ ~ -21.0℃.' },
        { date: '3/8', time: '08:40 ~ 13:50', targetHol: 'S/SPR(#2-C)', dailyAmount: 83.930, cumAmount: 4063.060, quality: '온도 -19.0℃ ~ -20.0℃.' },
        { date: '3/9', time: '08:10 ~ 11:50', targetHol: 'S/SPR(#2-C)', dailyAmount: 97.430, cumAmount: 4160.490, quality: '양호' },
        { date: '3/10', time: '08:10 ~ 21:50', targetHol: 'MOAMARI, S/SPR', dailyAmount: 651.980, cumAmount: 4812.470, quality: '양호' },
        { date: '3/11', time: '08:10 ~ 15:40', targetHol: 'S/EXP(#3-A), MOAMARI(#2-A)', dailyAmount: 307.300, cumAmount: 5119.770, quality: '온도 -18.0℃ ~ -21.0℃.' }
      ],
      finalReport: {
        takeaway: {
          situation: "전체 물량 오차는 매우 적으나 내부 규격 변동이 큼.",
          insight: "FREESCHOOL MSC 규격 대량 강등 발생(-704톤). 하역/선별 과정에서의 MSC 인증 유지 및 품질 관리 프로세스 점검 요망."
        }
      }
    }
  };

  const vesselsList = Object.entries(data).map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => (b.status.includes('하역중') ? 1 : 0) - (a.status.includes('하역중') ? 1 : 0));
  const activeVessels = vesselsList.filter(v => v.status.includes('하역중'));
  const completedVessels = vesselsList.filter(v => v.status.includes('하역완료'));
  
  const totalReportedActive = activeVessels.reduce((sum, v) => sum + v.reportedTotal, 0);
  const totalActualActive = activeVessels.reduce((sum, v) => sum + v.actualTotal, 0);

  const formatNum = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const selectedData = data[selectedVessel as keyof typeof data];
  const chartData = selectedData.timeline.map(t => ({
    name: t.date,
    일일하역량: t.dailyAmount,
    누적하역량: t.cumAmount
  }));

  return (
    <div className={styles.container}>
      {/* 1. Macro View Header */}
      <div className={styles.pageTitle}>
        <Anchor size={28} color="var(--accent-primary)" />
        하역 현황 관제 (Fleet Unloading Center)
      </div>

      <div className={styles.execGrid}>
        <div className={styles.execCard}>
          <div className={styles.execCardTitle}>
            <Ship size={16} /> 진행 중인 하역 선박 (Active)
          </div>
          <div className={styles.execCardValue}>{activeVessels.length} 척</div>
          <div className={styles.execCardTakeaway}>
            잔여 목표량: <strong>{formatNum(totalReportedActive - totalActualActive)} MT</strong>
          </div>
        </div>
        
        <div className={styles.execCard}>
          <div className={styles.execCardTitle}>
            <AlertCircle size={16} /> 글로벌 항구 병목 (Congestion)
          </div>
          <div className={styles.execCardValue} style={{ color: 'var(--color-danger)' }}>
            High <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>(방콕)</span>
          </div>
          <div className={styles.execCardTakeaway}>
            <TermTooltip term="체선료(Demurrage)" description="선박이 정해진 정박 기간을 초과하여 항구에 머물 때 발생하는 지연 배상금입니다." /> 리스크 증가: <strong>예상 지연 3~4일</strong>
          </div>
        </div>

        <div className={styles.execCard}>
          <div className={styles.execCardTitle}>
            <BarChart3 size={16} /> 주간 통합 하역량 (Weekly Volume)
          </div>
          <div className={styles.execCardValue}>
            {formatNum(vesselsList.reduce((s, v) => s + v.actualTotal, 0))} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>MT</span>
          </div>
          <div className={styles.execCardTakeaway}>
            완료 선박: <strong>{completedVessels.length} 척</strong> (방콕 2, 젠산 1)
          </div>
        </div>
      </div>

      {/* 2. Fleet Grid */}
      <div style={{ marginTop: '16px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px' }}>전체 선박 하역 상태</h3>
        <div className={styles.fleetGrid}>
          {vesselsList.map(v => {
            const isProgress = v.status.includes('하역중');
            const percent = Math.min((v.actualTotal / v.reportedTotal) * 100, 100);
            return (
              <div 
                key={v.id} 
                className={`${styles.vesselCard} ${selectedVessel === v.id ? styles.active : ''}`}
                onClick={() => setSelectedVessel(v.id)}
              >
                <div className={styles.vesselHeader}>
                  <div>
                    <div className={styles.vesselName}>{v.name}</div>
                    <div className={styles.vesselLocation}><MapPin size={12} style={{display:'inline'}}/> {v.location}</div>
                  </div>
                  <div className={`${styles.statusBadge} ${isProgress ? styles.progress : styles.completed}`}>
                    {v.status.split(' ')[0]}
                  </div>
                </div>
                
                <div className={styles.progressContainer}>
                  <div className={styles.progressText}>
                    <span style={{ color: 'var(--text-muted)' }}>진행률</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{percent.toFixed(1)}%</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className={styles.progressText} style={{ marginTop: '6px' }}>
                    <span style={{ fontSize: '0.75rem' }}>{formatNum(v.actualTotal)} MT</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {formatNum(v.reportedTotal)} MT</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Deep Dive Analytics */}
      <div className={styles.deepDiveCard}>
        <div className={styles.deepDiveHeader}>
          <div className={styles.deepDiveTitle}>
            <TrendingDown color="var(--accent-primary)" />
            {selectedData.name} - 상세 하역 분석
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <Clock size={14} style={{display:'inline', marginRight: '4px'}}/> 
            {selectedData.dateRange} | 판매처: {selectedData.buyer}
          </div>
        </div>

        {/* Chart - Full Width */}
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px', overflow: 'hidden' }}>
          <h4 style={{ marginBottom: '16px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>일일 및 누적 하역 추이 (MT)</h4>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <ComposedChart width={Math.max(chartData.length * 60, 600)} height={300} data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} angle={-35} textAnchor="end" height={50} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : `${v}`} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(value: any, name: any) => [`${Number(value).toLocaleString()} MT`, name]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar name="일일 하역량" dataKey="일일하역량" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Line name="누적 하역량" type="monotone" dataKey="누적하역량" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} />
            </ComposedChart>
          </div>
        </div>

        {/* Timeline Log - Full Width */}
        <div style={{ background: 'var(--panel-bg)', borderRadius: '8px', padding: '20px', border: '1px solid var(--panel-border)' }}>
          <h4 style={{ marginBottom: '16px', fontSize: '0.95rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>작업 기록 (Timeline)</span>
            <span style={{ fontSize: '0.8rem' }}><TermTooltip term="어창(Hold)" description="하역 중인 선박의 냉동창고 번호입니다." /></span>
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
            {[...selectedData.timeline].reverse().map((t, idx) => (
              <div key={idx} className={styles.timelineLog}>
                <div className={styles.logDate}>{t.date} <span style={{fontSize:'0.75rem', fontWeight:'normal', color:'var(--text-muted)', marginLeft:'8px'}}>{t.time}</span></div>
                <div className={styles.logText}>
                  <div style={{ marginBottom: '4px', color: '#e2e8f0' }}><PackageCheck size={12} style={{display:'inline'}}/> 어창: {t.targetHol}</div>
                  <div><Thermometer size={12} style={{display:'inline'}}/> {t.quality}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Takeaway Box if available */}
        {(selectedData as any).finalReport && (
          <div className={styles.takeawayBox}>
            <h4 style={{ fontSize: '14px', color: '#38BDF8', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> 경영진 요약 (Executive Takeaway)
            </h4>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#e2e8f0' }}>
              <strong style={{ color: '#FBBF24' }}>이슈:</strong> {(selectedData as any).finalReport.takeaway.insight}
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px' }}>
        <GensanVesselStatus />
      </div>
    </div>
  );
}
