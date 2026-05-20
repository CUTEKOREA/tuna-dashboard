'use client';
import React from 'react';
import { ThermometerSun } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';
import data from '../data/squid_climate_radar.json';
import useContainerWidth from '../hooks/useContainerWidth';

export default function SquidClimateRadar() {
  const { containerRef, width } = useContainerWidth();

  return (
    <div className={styles.glassCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <ThermometerSun size={20} />
          수온 기반 공급망 스위칭(Switching) 레이더
          
        </h3>
        <p className={styles.cardSubtitle}>
          SST(표층수온) 이상 기온과 해역별 어획량 엇갈림
        </p>
      </div>

      <div style={{ width: '100%', height: width < 600 ? 350 : 400 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorSST" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val)=>`${val}℃`} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val)=>`${val}k`} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius:'8px' }} />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
            
            <Area yAxisId="left" type="monotone" dataKey="sst_anomaly" name="수온 편차 (SST Anomaly)" stroke="url(#colorSST)" fillOpacity={1} fill="url(#colorSST)" />
            <Line yAxisId="right" type="monotone" dataKey="korea_catch" name="한국 어획량 (천톤)" stroke="#fcd34d" strokeWidth={3} dot={{ r: 3 }} />
            <Line yAxisId="right" type="monotone" dataKey="peru_catch" name="페루 어획량 (천톤)" stroke="#c4b5fd" strokeWidth={3} dot={{ r: 3 }} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>

      <TakeawayBox
        situation="동해 수온이 급등(SST Anomaly > 1.5℃)할 때 국내산 살오징어는 심해 및 북측 국경으로 빠져나가며 전멸하는 반면, 엘니뇨/수온 변동 사이클과 맞물려 남동태평양(페루) 대왕오징어 생산량은 오히려 폭증하는 디커플링 조짐이 뚜렷합니다."
        actionPlan="실시간 수온 모니터링 수치가 임계점을 넘을 경우 즉각 경보를 발동하고, '국내 연근해 매입 비중 축소 및 페루산 냉각품 선도 계약 확대'라는 공급망 스위칭(Supply Chain Switching) 결정을 내려야 기후 리스크를 상쇄할 수 있습니다."
      />
    </div>
  );
}
