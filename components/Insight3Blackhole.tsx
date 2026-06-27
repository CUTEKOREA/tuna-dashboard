'use client';

import React from 'react';
import { Box } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css'; // Reuse existing glassmorphism styling
import data from '../data/insight3_blackhole.json';
import useContainerWidth from '../hooks/useContainerWidth';
import { ChartPatternDefs } from './ChartPatterns';

const Insight3Blackhole = () => {
  const { containerRef, width } = useContainerWidth();

  // Create a derived dataset where imports are negative for the diverging bar chart effect
  const chartData = data.map(d => ({
    year: d.year,
    Exports: d.exports_m_usd,
    Imports: -d.imports_m_usd, // Negative for diverging chart
    RawImports: d.imports_m_usd // Keep original for tooltip
  }));

  const formatYAxis = (tick: number) => {
    return `$${Math.abs(tick).toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{`${label}년`}</p>
          <p className={styles.tooltipValue} style={{ color: '#FCD34D' }}>
            <span>수출액 (고부가가치):</span>
            <strong>${payload[0].value.toLocaleString()}M</strong>
          </p>
          <p className={styles.tooltipValue} style={{ color: '#F3F4F6' }}>
            <span>수입액 (원물 블랙홀):</span>
            <strong>${payload[1].payload.RawImports.toLocaleString()}M</strong>
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
          <Box size={20} />
          '블랙홀' 중국의 양면성
          
        </h3>
        <p className={styles.cardSubtitle}>
          전 세계 원물을 싹쓸이 수입한 뒤, 고부가가치 제품으로 재수출하는 거대 가공 허브
        </p>
      </div>

      <div style={{ width: '100%', height: width < 600 ? 300 : 400 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            stackOffset="sign"
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              tickFormatter={formatYAxis}
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
            {/* Exports on top (positive) */}
            <Bar dataKey="Exports" name="수출 (Exports)" fill="url(#exportGrad)" maxBarSize={40} />
            {/* Imports on bottom (negative) */}
            <Bar dataKey="Imports" name="수입 (Imports)" fill="url(#importGrad)" maxBarSize={40} />
            
            <defs>
              <linearGradient id="exportGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FCD34D" stopOpacity={0.9} />
                <stop offset="100%" stopColor="var(--color-warning)" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="importGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="var(--text-secondary)" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#4B5563" stopOpacity={0.9} />
              </linearGradient>
            </defs>
          </BarChart>
        </SafeResponsiveContainer>
      </div>

      <TakeawayBox source="FAO FishStatJ - China Squid Trade (2000-2023)" situation="중국은 자국 원양선단(연간 70만 톤 이상 어획)에 더해 글로벌 오징어 원물을 대량 수입(회색 바)하면서, 동시에 가공 재수출(금색 바)을 기하급수적으로 늘려 상하(대칭) 폭이 극대화되고 있습니다. 2023년 기준 중국의 오징어류 수출액은 수입액의 1.8배에 달하며, 이 갭(Gap)이 중국의 순부가가치 캡처 규모입니다."
        actionPlan="중국의 '원물 수입 → 가공 재수출' 밸류체인 사이에 끼어들 수 있는 가장 현실적인 전략은 중국 칭다오/다롄 현지 가공 공장과의 OEM 위탁 가공 계약입니다. 신라교역이 직접 원물을 확보하여 중국 공장에 임가공 후 제3국으로 재수출하면, 중간 브로커 마진(톤당 $300~500)을 직접 흡수할 수 있습니다."
      />
    </div>
  );
};

export default Insight3Blackhole;
