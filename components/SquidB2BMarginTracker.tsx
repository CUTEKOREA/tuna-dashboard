'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Store } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import styles from './MackerelStrategy.module.css';
import data from '../data/squid_b2b_margin.json';
import useContainerWidth from '../hooks/useContainerWidth';

export default function SquidB2BMarginTracker() {
  const { containerRef, width } = useContainerWidth();
  return (
    <div className={styles.glassCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Store size={20} /> B2B 직납 vs 유통 도매시장 채널수익 비교
          
        </h3>
        <p className={styles.cardSubtitle}>최적의 트럭 배차 및 물량 할당 포트폴리오 산출</p>
      </div>
      <div style={{ width: '100%', height: width < 600 ? 350 : 400 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis type="category" dataKey="channel" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 'bold' }} width={80} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius:'8px' }} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            <Bar dataKey="sales_price" stackId="a" name="판매가 기준" fill="rgba(255, 255, 255, 0.1)" />
            <Bar dataKey="net_margin" name="최종 순마진" fill="#8b5cf6" barSize={30} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <TakeawayBox source="내부 영업 관리 시스템" situation="[Channel Margin Leakage] 전통 재래 도매 채널(Wholesale) 납품 시 경매 수수료(4% 징수) 및 다단계 물류비(Logistics Friction)로 인한 심각한 OPM(영업Bottom-line(순이익)률) 누수(Leakage)가 확인됩니다. 반면, 대형 마트향 1차 벤더 직납 채널은 초기 패키징 CAPEX를 초과하는 압도적 마진 프리미엄을 보장합니다." actionPlan="**[Actionable Insight]** [B2B Direct-Channel Overweight] 저부가가치 전통 도매 채널에 대한 의존도(Exposure)를 즉시 축소(Underweight)하십시오. 전사 물량의 70% 이상을 이마트, 코스트코 등 기업형 리테일러향 직납(Direct B2B) 티어 1 벤더 채널로 집중(Overweight)시켜 마진을 락인하고, 도매 시장은 단순 덤핑 처리장(Dump Yard)으로 격하 병행 운용해야 합니다. (Conviction Buy)" />
    </div>
  );
}
