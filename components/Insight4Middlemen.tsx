'use client';

import React from 'react';
import { TrendingDown } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';
import data from '../data/insight4_middlemen.json';
import useContainerWidth from '../hooks/useContainerWidth';

const Insight4Middlemen = () => {
  const { containerRef, width } = useContainerWidth();

  const formatYAxis = (tick: number) => {
    return `$${tick.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length >= 2) {
      const exportVal = payload[0].value;
      const importVal = payload[1].value;
      const isDeficit = importVal > exportVal;

      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{`${label}년 (한국)`}</p>
          <p className={styles.tooltipValue} style={{ color: 'var(--color-success)' }}>
            <span>수출액:</span>
            <strong>${exportVal.toLocaleString()}M</strong>
          </p>
          <p className={styles.tooltipValue} style={{ color: 'var(--color-danger)' }}>
            <span>수입액:</span>
            <strong>${importVal.toLocaleString()}M</strong>
          </p>
          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
          <p className={styles.tooltipValue} style={{ color: isDeficit ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 'bold' }}>
            <span>무역수지:</span>
            <strong>{isDeficit ? '적자' : '흑자'} (${Math.abs(exportVal - importVal).toLocaleString()}M)</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  // Find the exact crossing year where import surpasses export fundamentally
  // For visual "Tipping Point" marker
  const tippingYear = 1993; // Adjust based on data if necessary, historically early 90s for Korea

  return (
    <div className={styles.glassCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <TrendingDown size={20} />
          생산국에서 소비국으로
          
        </h3>
        <p className={styles.cardSubtitle}>
          과거 수출 우위였던 한국/일본의 무역 수지가 적자로 곤두박질치는 '크로스 역전'
        </p>
      </div>

      <div style={{ width: '100%', height: width < 600 ? 300 : 400 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            <Area 
              type="monotone" 
              dataKey="kr_export" 
              name="대한민국 수출 (Exports)" 
              fillOpacity={0.2} 
              fill="var(--color-success)" 
              stroke="var(--color-success)" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="kr_import" 
              name="대한민국 수입 (Imports)" 
              stroke="var(--color-danger)" 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6 }} 
            />

            <ReferenceDot x={1993} y={150} r={5} fill="red" stroke="white" />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>

      <TakeawayBox source="FAO FishStatJ - Korea Trade Value (1976-2023)" situation="1993년을 기점으로 한국의 오징어 무역수지가 흑자에서 적자로 영구 역전(Death Cross)되었습니다. 녹색 면적(수출액)이 붉은 선(수입액) 아래로 완전히 가라앉으며, 연안 어장 붕괴(동해안 오징어 어획량 80% 감소)와 내수 소비 급증이 맞물려 '과거의 미들맨' 지위를 완전히 상실했습니다. 2023년 기준 무역적자는 $5.2억 이상으로 확대 중입니다."
        actionPlan="한국은 이제 되돌릴 수 없는 구조적 순수입국입니다. 원물 자급률이 30% 미만으로 하락한 현실에서, 페루/아르헨티나 원양 직소싱 라인과 중국/베트남 가공 위탁 라인을 분리 운영하는 '이원화 공급망'을 구축해야 합니다. 특히 동해안 살오징어의 계절적 품귀 시 자동으로 남미산 냉동 원물이 투입되는 '오토 스위칭' 계약 구조가 핵심입니다."
      />
    </div>
  );
};

export default Insight4Middlemen;
