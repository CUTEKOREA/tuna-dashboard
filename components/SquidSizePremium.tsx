'use client';
import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Scissors } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import styles from './MackerelStrategy.module.css';
import data from '../data/squid_size_premium.json';
import useContainerWidth from '../hooks/useContainerWidth';

export default function SquidSizePremium() {
  const { containerRef, width } = useContainerWidth();
  return (
    <div className={styles.glassCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Scissors size={20} /> 크기/중량별 시장 프리미엄 지수
          
        </h3>
        <p className={styles.cardSubtitle}>해수온 상승발 대형개체 품귀 및 고부가가치 타겟팅</p>
      </div>
      <div style={{ width: '100%', height: width < 600 ? 350 : 400 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val)=>`₩${val/1000}k`} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius:'8px' }} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            <Area type="monotone" dataKey="premium_gap" name="프리미엄 갭 (Gap)" fill="rgba(139, 92, 246, 0.2)" stroke="none" />
            <Line type="monotone" dataKey="small" name="소형어 (150-200g)" stroke="var(--text-secondary)" strokeWidth={2} />
            <Line type="monotone" dataKey="large" name="대형어 (600g+)" stroke="#8b5cf6" strokeWidth={3} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <TakeawayBox source="수협 위탁 단가 및 수산 시장 동향" situation="기상 이변에 따른 어체 왜소화(Shrinkage) 트렌드로 인해 대형 규격(Large/Jumbo) 오징어 품귀 현상이 심화되며, 소형 대비 도매 톤당 단가 스프레드가 기하급수적으로 폭발하는 초격차 \'중량 프리미엄(Size Premium)\' 시대가 열렸습니다." actionPlan="[Premium Arbitrage Optimization] 톤(Volume) 단위의 무차별 도매 출하를 즉각 중단하십시오. 그레이딩(Grading) 자동화 설비를 통해 대형 개체를 100% 분리 추출(Skimming)하여 호텔/고급 일식체인 전용 VVIP 라인업으로 직납하고, 조업 타겟팅 알고리즘을 대형 개체 서식 수온/수심으로 전면 재조정하여 프리미엄 차익을 극대화(Maximize)해야 합니다." />
    </div>
  );
}
