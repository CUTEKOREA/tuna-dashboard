'use client';

import React from 'react';
import { Anchor } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ComposedChart
} from 'recharts';
import styles from './TunaInsightsDashboard.module.css';
import data from '../data/tuna_crossroad.json';
import useContainerWidth from '../hooks/useContainerWidth';
import TakeawayBox from './TakeawayBox';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


const TunaCrossroads = () => {
  const { containerRef, width } = useContainerWidth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{`${label}년 참다랑어 공급`}</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload.map((entry: any, index: number) => (
            <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <strong>{Number(entry.value).toLocaleString()} 톤</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.insightCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Anchor size={20} />
          글로벌 참다랑어 생산량 크로스로드 (Catch vs Farmed)
          <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'rgba(16,185,129,0.1)', border:'1px solid #10b981', color:'var(--color-success)', fontSize:'0.65rem', fontWeight:600, padding:'1px 5px', borderRadius:'4px', letterSpacing:'0.2px', marginLeft:'6px' }}>🟢 LIVE API (FAO)</span>
        </h3>
        <p className={styles.cardSubtitle}>
          참다랑어 자연어획량 데이터와 양식 데이터를 결합하여 ComposedChart로 시각화했습니다. (1980년 이후 쿼터제로 묶여 성장이 멈춘 자연산 참다랑어(어획) 수급을, 인위적인 축양 및 양식이 어떻게 완벽하게 커버하며 우상향 돌파구를 열었는지 분석)
        </p>
      </div>

      <div style={{ width: '100%', height: 350, marginTop: '20px' }}>
        <ComposedChart width={width > 0 ? width - 60 : 800} height={350} data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="Year" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
          <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} tickFormatter={(value) => `${value.toLocaleString()}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <Area type="monotone" dataKey="Wild_Volume" name="자연 어획량 (Wild Catch)" fill="rgba(139, 92, 246, 0.2)" stroke="#8b5cf6" strokeWidth={2} />
          <Line type="monotone" dataKey="Aqua_Volume" name="축양/양식량 (Aquaculture)" stroke="var(--color-success)" strokeWidth={4} dot={false} activeDot={{ r: 8 }} />
        </ComposedChart>
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          source="FAO FishStatJ Bluefin Tuna Wild Catch vs Aquaculture"
          situation="엄격한 규제로 천연산 참다랑어 어획량이 정체된 반면, 양식(축양) 생산량은 폭발적으로 증가하며 산업 구조의 근본적 전환이 진행 중입니다."
          actionPlan="**[Actionable Insight]** 어획(자연산) 중심의 수산업은 엄격한 글로벌 쿼터 규제로 성장이 완벽하게 차단되었습니다. 이제 성장의 유일한 돌파구는 양식/축양 비즈니스입니다. 기존 하드웨어(원양어선) 투자를 중단하고, 완전양식(Closed-cycle) 원천 기술 R&D 및 해상 가두리 인프라에 전사적 자본을 재배치해야 합니다. 특히 천연 치어 쿼터가 삭감될 경우 종묘 가격이 폭등하므로, 핵심 종묘장(Hatchery)과의 합작법인 혹은 강한 지분 투자를 통해 원물 소스를 먼저 장악해야 살아남을 수 있습니다."
        />
      </div>
    </div>
  );
};

export default TunaCrossroads;
