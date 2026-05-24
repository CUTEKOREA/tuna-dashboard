'use client';

import React from 'react';
import { ThermometerSun } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import {
  ComposedChart,
  Line,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';
import data from '../data/insight6_combo.json';
import useContainerWidth from '../hooks/useContainerWidth';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const Insight6ClimateCombo = () => {
  const { containerRef, width } = useContainerWidth();

  const formatRightAxis = (tick: number) => {
    return tick.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length >= 2) {
      const enso = payload.find((p: any) => p.dataKey === 'enso_index')?.value || 0;
      const catchVal = payload.find((p: any) => p.dataKey === 'catch_k_tons')?.value || 0;
      const importVal = payload.find((p: any) => p.dataKey === 'import_value_m_usd')?.value || 0;
      const isElNino = enso > 0;
      return (
        <div className={styles.customTooltip} style={{ zIndex: 1000, position: 'relative' }}>
          <p className={styles.tooltipLabel}>{`${label}년`}</p>
          <p className={styles.tooltipValue} style={{ color: isElNino ? 'var(--color-danger)' : 'var(--color-info)' }}>
            <span>ENSO 지수:</span>
            <strong>{enso.toFixed(1)}</strong>
          </p>
          <p className={styles.tooltipValue} style={{ color: '#60A5FA' }}>
            <span>일렉스 어획량:</span>
            <strong>{Math.round(catchVal * 1000).toLocaleString()} 톤</strong>
          </p>
          <p className={styles.tooltipValue} style={{ color: '#FCD34D' }}>
            <span>주요국 수입액:</span>
            <strong>${importVal.toLocaleString()}M</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.glassCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <ThermometerSun size={20} />
          식탁의 지정학 (기후 쇼크)
          
        </h3>
        <p className={styles.cardSubtitle}>
          엘니뇨/라니냐 사이클에 따른 스파이크
        </p>
      </div>

      <div style={{ width: '100%', height: width < 600 ? 350 : 450 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
          >
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} minTickGap={20} />
            
            <YAxis
              yAxisId="left"
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
              domain={[-3, 4]}
              width={40}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
              tickFormatter={formatRightAxis}
              width={50}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
            <ReferenceLine yAxisId="left" y={0} stroke="rgba(255,255,255,0.2)" />
            
            <Bar 
              yAxisId="left"
              dataKey="enso_index" 
              name="ENSO 기후 지수" 
              maxBarSize={30}
            >
              {data.map((entry: any, index: number) => (
                 <Cell key={`cell-${index}`} fill={entry.enso_index > 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)'} />
              ))}
            </Bar>
            
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="catch_k_tons" 
              name="어획량 (천 톤)" 
              stroke="#60A5FA" 
              strokeWidth={3} 
              dot={{ r: 3, fill: '#60A5FA', strokeWidth: 0 }}
              activeDot={{ r: 6 }} 
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="import_value_m_usd" 
              name="주요국 수입 총액 (M USD)" 
              stroke="#FCD34D" 
              strokeWidth={3} 
              dot={{ r: 3, fill: '#FCD34D', strokeWidth: 0 }}
              activeDot={{ r: 6 }} 
            />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>

      <TakeawayBox source="NOAA ENSO Index & FAO FishStatJ (1980-2023)" situation="엘니뇨(붉은 막대) 시기에는 남미 한류성 오징어(일렉스)의 어획량(파란 선)이 30~50% 급감합니다. 원물 부족은 약 6~12개월의 시차를 두고 유럽/아시아 소비국의 재고 바닥으로 이어지며, 수입 단가와 지출액(노란 선)이 폭발적으로 상승하는 '원자재 래깅 스파이크(Lagging Spike)'가 반복적으로 발생합니다. 2015~2016년 슈퍼엘니뇨 당시 글로벌 오징어 수입단가는 전년 대비 +47% 폭등했습니다."
        actionPlan="NOAA의 ENSO 예보(3개월 선행)를 실시간 모니터링하여, 엘니뇨 전환 시그널 발생 즉시 6~9개월 치 선도 계약을 체결하십시오. 래깅 스파이크의 평균 지속 기간은 8~14개월이므로, 스파이크 정점에서 매도 포지션으로 전환(역발상 트레이딩)하면 톤당 $200~400의 시세 차익을 확보할 수 있습니다."
      />
    </div>
  );
};

export default Insight6ClimateCombo;
