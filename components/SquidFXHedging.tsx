'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { CircleDollarSign } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import styles from './MackerelStrategy.module.css';
import data from '../data/squid_fx_hedging.json';
import useContainerWidth from '../hooks/useContainerWidth';

export default function SquidFXHedging() {
  const { containerRef, width } = useContainerWidth();
  return (
    <div className={styles.glassCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <CircleDollarSign size={20} /> 원-달러 환율 연동 수입/원가 헷징
          
        </h3>
        <p className={styles.cardSubtitle}>강달러 국면에서 원화 결제 대금 폭증 위험성 트래킹</p>
      </div>
      <div style={{ width: '100%', height: width < 600 ? 350 : 400 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val)=>`₩${val}`} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val)=>`₩${(val/10000).toFixed(0)}만`} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius:'8px' }} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            <Line yAxisId="left" type="monotone" dataKey="exchange_rate" name="원/달러 환율" stroke="var(--color-info)" strokeWidth={2} strokeDasharray="4 4" />
            <Line yAxisId="right" type="monotone" dataKey="total_krw" name="순 체감 수입 원가 (원/톤)" stroke="#fcd34d" strokeWidth={3} dot={{r: 4, fill: '#fcd34d'}} activeDot={{ r: 6 }} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      <TakeawayBox source="한국은행 환율 통계 & 내부 결제망" situation="단순 수입 가격(USD)이 고정되더라도 원/달러 환율(파란선 점선) 상승분이 반영되어, 당사가 실제 지불하는 원화 기반 매입 원가(노란선 곡선)가 통제 불가 수준으로 뛰고 있습니다." actionPlan="**[Actionable Insight]** 연간 쿼터의 50% 이상 물량 대금은 '환율 1,300원 이하' 국면일 때 선물환(Forward) 매입을 통해 사전 고정(Fixing)시켜야 갑작스런 거시 쇼크를 방어할 수 있습니다." />
    </div>
  );
}
