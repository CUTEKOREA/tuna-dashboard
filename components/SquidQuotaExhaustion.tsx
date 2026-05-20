'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Target } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import styles from './MackerelStrategy.module.css';
import data from '../data/squid_quota_exhaustion.json';
import useContainerWidth from '../hooks/useContainerWidth';

export default function SquidQuotaExhaustion() {
  const { containerRef, width } = useContainerWidth();
  return (
    <div className={styles.glassCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Target size={20} /> 어획 쿼터(ITQ) 실시간 소진율 마일스톤
          
        </h3>
        <p className={styles.cardSubtitle}>쿼터 소진 임박에 따른 시세 급등 대비 사전매입 전략선</p>
      </div>
      <div style={{ width: '100%', height: width < 600 ? 350 : 400 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val)=>`${val}%`} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius:'8px' }} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            <Area type="monotone" dataKey="exhausted" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.5} name="누적 쿼터 소진율(%)" />
            <ReferenceLine y={80} stroke="var(--color-warning)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '수급 임계 경보선 (80%)', fill: 'var(--color-warning)', fontSize: 10 }} />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>
      <TakeawayBox source="포클랜드 어업국 / 원양 선단" situation="[ITQ Depletion Shock] 글로벌 ESG 규제 압박으로 남반구 핵심 조업국들의 개별할당제(ITQ) 쿼터가 5~6월경 조기 고갈(Depletion)되며 어업이 강제 셧다운(Shutdown) 조치되는 빈도가 급증했습니다. 직후 글로벌 시세가 수직 폭등(Spike)하는 공급 공백 국면이 상시화되었습니다." actionPlan="**[Actionable Insight]** [Preemptive Global Buyout] 타국 선단의 쿼터 소진율 텔레메트리를 실시간 트래킹 하십시오. 특정 메이저 어장의 ITQ 소진율이 80% 임계치를 돌파하는 즉시, 1개월 내 발생할 시세 폭등(Spike)을 겨냥해 남미/대만 등 제3국 선단들이 보유한 잔여 해상 선적 물량을 선도가(Premium)에 전량 싹쓸이(Buyout)하는 글로벌 알박기 전략을 지시합니다. (Conviction Buy)" />
    </div>
  );
}
