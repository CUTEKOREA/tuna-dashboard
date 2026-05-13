'use client';
import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { PieChart } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import styles from './MackerelStrategy.module.css';
import data from '../data/squid_demand_destruction.json';
import useContainerWidth from '../hooks/useContainerWidth';

export default function SquidDemandDestruction() {
  const { containerRef, width } = useContainerWidth();
  return (
    <div className={styles.glassCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <PieChart size={20} /> 거시경제 연동 수산물 대체소비(Demand Destruction) 지표
          
        </h3>
        <p className={styles.cardSubtitle}>소비자 심리 저항선 돌파 시 강성 덤핑 및 전량 가공화 모델</p>
      </div>
      <div style={{ width: '100%', height: width < 600 ? 350 : 400 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val)=>`₩${val}`} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} domain={[0, 250]} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius:'8px' }} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            
            <Area yAxisId="left" type="monotone" dataKey="squid_price" name="일반 오징어 소매단가" fill="rgba(6, 182, 212, 0.2)" stroke="#06b6d4" />
            <Line yAxisId="right" type="monotone" dataKey="squid_demand" name="오징어 구매 수요 지수" stroke="var(--color-danger)" strokeWidth={3} dot={{r: 4}} />
            <Line yAxisId="right" type="monotone" dataKey="mackerel_demand" name="대체재(고등어 등) 수요 지수" stroke="var(--color-success)" strokeWidth={3} dot={{r: 4}} strokeDasharray="5 5" />
            <ReferenceLine yAxisId="left" y={10000} stroke="var(--color-warning)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '소비자 심리 저항선 (1만원)', fill: 'var(--color-warning)', fontSize: 10 }} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <TakeawayBox source="통계청 가계동향조사 및 Nielson 소매판매 데이터" situation="[Demand Destruction & Substitution] 초인플레이션 기조 속 소매 판가(B2C)가 심리적 저항선(KRW 10K/M)을 상향 돌파하자, 수요 곡선이 완전히 붕괴(Demand Destruction)되며 대체 단백질인 고등어/가금류로 소비가 수직 이탈(Cannibalization)하는 매크로 쇼크가 발생했습니다." actionPlan="[B2C Exit & B2B Hedging] 원가 상승분을 소매가로 무한 전가(Pass-through)할 수 있다는 환상을 버리십시오. 소비자 가격 저항선이 확인되는 즉시 변동성이 극심한 B2C 원물 유통 포지션을 전량 청산하고, 단체급식/외식 프랜차이즈향 B2B 1년 장기 선물계약(Forward Contract)으로 전량 스위칭하여 고정 마진을 락인(Lock-in)해야 합니다." />
    </div>
  );
}
