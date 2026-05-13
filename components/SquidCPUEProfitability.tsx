'use client';
import React from 'react';
import { Anchor } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';
import data from '../data/squid_cpue_profit.json';
import useContainerWidth from '../hooks/useContainerWidth';

export default function SquidCPUEProfitability() {
  const { containerRef, width } = useContainerWidth();
  return (
    <div className={styles.glassCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Anchor size={20} /> 실시간 조업 채산성 (CPUE) 트래커
          
        </h3>
        <p className={styles.cardSubtitle}>조업 운영비 대비 실시간 초과/적자 수익성</p>
      </div>
      <div style={{ width: '100%', height: width < 600 ? 350 : 400 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius:'8px' }} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            <Bar dataKey="profit" name="마진(kg)" fill="rgba(16, 185, 129, 0.6)" />
            <Line type="monotone" dataKey="cpue" name="현장 CPUE" stroke="var(--color-info)" strokeWidth={3} dot={{r:4}} />
            <ReferenceLine y={1000} stroke="var(--color-danger)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '조업 BEP', fill: 'var(--color-danger)', fontSize: 10 }} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <TakeawayBox source="선단 조업일지" situation="[Unit Economics Dead-cross] 단위노력당어획량(CPUE) 하락 곡선이 선단 체재비 및 선박 연료유(MGO) 고정비 지출선(BEP)을 뚫고 내려가는 데드크로스(Dead-cross) 빈도가 위험 수위(Critical Level)를 초과했습니다." actionPlan="[Automated Stop-Loss Protocol] 선장(Captain)의 직관에 의존한 무의미한 탐색 조업을 전면 금지하십시오. 일일 CPUE가 3영업일 연속 고정비 BEP(붉은 점선)를 하회하는 즉시, 해당 수역 내 선단 전체에 대한 강제 조업 셧다운(Shutdown) 및 신규 어장으로의 전술적 철수 명령(Stop-loss)을 자동 하달하는 알고리즘을 도입하십시오." />
    </div>
  );
}
