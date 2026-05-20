'use client';
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { CloudLightning } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import styles from './MackerelStrategy.module.css';

const data = [
  { tempRise: 0.1, catchRate: +5, year: '2016' },
  { tempRise: 0.5, catchRate: +1, year: '2018' },
  { tempRise: 1.1, catchRate: -15, year: '2020' },
  { tempRise: 1.5, catchRate: -22, year: '2021' },
  { tempRise: 1.8, catchRate: -45, year: '2023' },
  { tempRise: 2.1, catchRate: -65, year: '2024' },
];

export default function MackerelClimatePredictor() {
  return (
    <div className={styles.glassCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <CloudLightning size={20} />
          지구온난화 대형어 흉작 예측 모델
          
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          전년도 한반도 남해안 표층수온 상승 이상편차(SST Anomaly) 값을 X축으로 두고 당해 연도 고수익 
        </p>
      </div>
      <div style={{ width: '100%', height: 350 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" dataKey="tempRise" name="수온 편차" unit="°C 상승" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <YAxis type="number" dataKey="catchRate" name="대형어 어획량 변동" unit="%" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
            <Scatter name="연도별 기후 파급" data={data} fill="var(--color-danger)">
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.tempRise > 1.4 ? 'var(--color-danger)' : 'var(--color-success)'} />
              ))}
            </Scatter>
          </ScatterChart>
        </SafeResponsiveContainer>
      </div>
      <TakeawayBox situation="글로벌 해수온(SST)이 1.5℃ 임계점(Tipping Point)을 돌파할 경우, 타겟 어군의 남하 회유 경로가 영구 붕괴되며 국내 EEZ 내 대형 체급 수확량이 65% 증발하는 구조적 꼬리 위험(Tail Risk)이 실시간으로 확인되고 있습니다." actionPlan="[Quant-Hedging Execution] 인적 직관에 의존하는 재래식 발주를 즉각 폐기하십시오. NASA/NOAA의 해수온 이상 지수(ENSO)가 +1.5℃ 상단을 뚫는 즉시 알고리즘을 가동하여 차기 년도 노르웨이산 선물(Forward) 매입 볼륨을 3배 상향 락인하는 \'Climate-Quant\' 헷징 포지션을 전격 승인해야 합니다." />
    </div>
  );
}