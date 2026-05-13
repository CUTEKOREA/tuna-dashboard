'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Snowflake } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import styles from './MackerelStrategy.module.css';
import data from '../data/squid_logistics_cost.json';
import useContainerWidth from '../hooks/useContainerWidth';

export default function SquidLogisticsOptimizer() {
  const { containerRef, width } = useContainerWidth();
  return (
    <div className={styles.glassCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Snowflake size={20} /> 콜드체인 물류·보관료 최적화 데드크로스
          
        </h3>
        <p className={styles.cardSubtitle}>누적 보관료 vs 시세 상승분 교차 지점 (강제 출하 트리거)</p>
      </div>
      <div style={{ width: '100%', height: width < 600 ? 350 : 400 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius:'8px' }} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            <Bar dataKey="freight" stackId="a" name="해상 운임" fill="#475569" />
            <Bar dataKey="loading" stackId="a" name="상하차/동결" fill="#64748b" />
            <Bar dataKey="storage" stackId="a" name="누적 보관료" fill="var(--color-danger)" />
            <ReferenceLine y={1200} stroke="var(--color-success)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '단기 기대 시장수익(Gap)', fill: 'var(--color-success)', fontSize: 10 }} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <TakeawayBox source="국내 냉장창고 단가표 & 물류팀" situation="[Carry Cost vs Alpha Decay] 콜드체인 보관 주차(Weeks)가 경과할수록 창고료 및 기회비용(Carry Cost)이 복리로 누적되어, 12주 차(W12)를 기점으로 단기 시세차익(Alpha) 기대치를 완전히 초과(Dead-cross)하는 네거티브 롤일드(Negative Roll-Yield) 현상이 확인됩니다." actionPlan="[Inventory Duration Cap] 투기적 재고 홀딩을 전면 금지하십시오. 국내 입항 후 \'콜드체인 체류 10주(W10)\'를 강제 청산(Stop-loss) 상한선으로 시스템에 하드코딩하고, 11주 차 돌입 전 도매 시장에 시장가(Market Order) 선도 덤핑 출회를 단행하여 악성 재고에 묶인 유동성(Liquidity)을 즉각 해방해야 합니다." />
    </div>
  );
}
