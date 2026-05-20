'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Activity } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import styles from './MackerelStrategy.module.css';
import data from '../data/squid_policy_arbitrage.json';
import useContainerWidth from '../hooks/useContainerWidth';

export default function SquidPolicyArbitrage() {
  const { containerRef, width } = useContainerWidth();

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.policy_event) {
      return (
        <svg x={cx - 10} y={cy - 10} width={20} height={20} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" fill="var(--color-danger)" stroke="var(--text-primary)" strokeWidth="2" />
        </svg>
      );
    }
    return <circle cx={cx} cy={cy} r={3} fill="#06b6d4" />;
  };

  return (
    <div className={styles.glassCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Activity size={20} />
          관세 및 정책 이벤트 연동 차익거래 (Policy Arbitrage)
          
        </h3>
        <p className={styles.cardSubtitle}>
          금어기·비축물량·조정관세 통제 모델 
        </p>
      </div>

      <div style={{ width: '100%', height: width < 600 ? 350 : 400 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val)=>`₩${(val/1000).toFixed(0)}k`} />
            <Tooltip 
              contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius:'8px' }} 
              labelStyle={{ color: 'var(--text-primary)' }}
              itemStyle={{ color: '#bae6fd' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
            
            <Line type="monotone" dataKey="domestic_price" name="국내 도매가 (원)" stroke="#fca5a5" strokeWidth={2} dot={<CustomDot />} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="import_price" name="도착 수입원가 (원)" stroke="#06b6d4" strokeWidth={2} dot={false} />
            
            {data.filter(d => Boolean(d.policy_event)).map((item, index) => (
              <ReferenceDot key={index} x={item.month} y={item.policy_event ?? 0} r={6} fill="var(--color-danger)" stroke="none" />
            ))}
          </LineChart>
        </SafeResponsiveContainer>
      </div>

      <TakeawayBox
        situation="명절 직전 '정부 비축물량 고강도 방출' 이벤트와 '금어기로 인한 수급경색 단기 해소를 위한 조정관세 인하(최대 22% -> 할당관세)' 이벤트가 발생할 때마다, 수입업자들은 매입(Punching) 러시를 하며 시장가가 인위적으로 눌리는 현상이 포착되었습니다."
        actionPlan="**[Actionable Insight]** 단순 거시 스프레드만 보는 것은 리스크(Risk)합니다. 정책 이벤트 캘린더를 시스템화하여, 조정관세 완화가 예상되는 시점 직전에 남반구 성수기 조업 물량을 '보세 창고 재고' 형태로 풀고, 방출 이벤트 직후에 시중에 본격 유통시키는 '정밀 창고 운용(Precision Warehousing)' 전략이 필수입니다."
      />
    </div>
  );
}
