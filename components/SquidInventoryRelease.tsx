'use client';
import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { CalendarRange } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import styles from './MackerelStrategy.module.css';
import data from '../data/squid_inventory_release.json';
import useContainerWidth from '../hooks/useContainerWidth';

export default function SquidInventoryRelease() {
  const { containerRef, width } = useContainerWidth();
  return (
    <div className={styles.glassCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <CalendarRange size={20} /> 명절 및 성수기 재고 출회 윈도우(Window)
          
        </h3>
        <p className={styles.cardSubtitle}>최적의 고점 방출 시기 매핑</p>
      </div>
      <div style={{ width: '100%', height: width < 600 ? 350 : 400 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val)=>`₩${val/1000}k`} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val)=>`${val}%`} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius:'8px' }} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            <Bar yAxisId="right" dataKey="release_target" name="당사 재고 출하 목표비율(%)" fill="rgba(16, 185, 129, 0.4)" barSize={40} />
            <Line yAxisId="left" type="monotone" dataKey="wholesale" name="시장 평균 도매가 (원)" stroke="var(--color-warning)" strokeWidth={3} dot={{r: 4}} activeDot={{r:6}} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <TakeawayBox source="최근 5년 KMI 통합 시계열" situation="[Seasonality Alpha Capture] 설 명절 직전 1차 피크 아웃(Peak-out) 이후, 금어기(Close Season)에 따른 구조적 공급 숏티지가 발생하는 W36(추석 2주 전) 윈도우에 연중 최고 마진 스프레드(Alpha)가 형성되는 완벽한 계절성 아비트라지(Seasonality Arbitrage) 패턴입니다." actionPlan="[Aggressive Swing Trading] 추석 2주 전 W36 윈도우를 타겟으로 선제적 재고 비축(Hoarding)에 돌입하십시오. 도매 시세가 목표 수익률 구간(Target Yield)을 돌파하는 1~2주의 짧은 스윙 윈도우(Swing Window) 내에 당사 보유 물량의 40% 이상을 고가에 일괄 타격(Punching)하여 현금흐름을 극대화(Cash-out)하는 전술적 매도(Tactical Sell)를 승인합니다." />
    </div>
  );
}
