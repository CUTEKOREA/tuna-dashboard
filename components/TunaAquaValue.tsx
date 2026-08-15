'use client';

import React from 'react';
import { Anchor } from 'lucide-react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import styles from './TunaInsightsDashboard.module.css';
import { getTunaData } from '@/lib/data/tuna';
import useContainerWidth from '../hooks/useContainerWidth';
import { ChartPatternDefs } from './ChartPatterns';
import { truncateXAxis } from '../lib/chart-standards';

const data = getTunaData('aquaValue');

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{`${label}년 수익 구조`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <strong>
              {Number(entry.value).toLocaleString()} {entry.dataKey === 'Aqua_Value' ? '천 USD $' : '톤'}
            </strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

const TunaAquaValue = () => {
  const { containerRef, width } = useContainerWidth();

  const formatY1 = (val: number) => `${(val / 1000).toFixed(0)}k 톤`;
  const formatY2 = (val: number) => `$${(val / 1000000).toFixed(0)}M`;

  return (
    <div className={styles.insightCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Anchor size={20} />
          가치 창출의 마법 (Value Explosion)
          <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'rgba(var(--w-emerald-500-rgb), 0.1)', border:'1px solid var(--w-emerald-500)', color:'var(--color-success)', fontSize:'0.65rem', fontWeight:600, padding:'1px 5px', borderRadius:'4px', letterSpacing:'0.2px', marginLeft:'6px' }}>🔵 SYNCED (FAO)</span>
        </h3>
        <p className={styles.cardSubtitle}>
          이중 Y축을 사용하여 생산 물량(Bar)과 생산 총액(Line)의 상승 기울기를 교차 분석했습니다. (참다랑어 양식 산업이 1차원적인 곡률의 생산량 증가를 넘어, 시장의 희소성과 맞물려 생산액(매출가치)이 기하급수적으로 팽창하는 전형적인 '프리미엄 레버리지' 증명)
        </p>
      </div>

      <div style={{ width: '100%', height: 350, marginTop: '20px' }}>
        <ComposedChart width={width > 0 ? width - 60 : 800} height={350} data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="Year" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
          <YAxis yAxisId="left" stroke="var(--w-sky-400)" tickFormatter={formatY1} tick={{ fill: 'var(--w-sky-400)', fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tickFormatter={formatY2} tick={{ fill: '#f43f5e', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <Bar yAxisId="left" dataKey="Aqua_Volume" name="생산량 (Volume)" fill="var(--w-sky-400)" fillOpacity={0.8} radius={[4, 4, 0, 0]} barSize={20} />
          <Line yAxisId="right" type="monotone" dataKey="Aqua_Value" name="총생산액 (Value in '000 USD)" stroke="#f43f5e" strokeWidth={4} dot={false} activeDot={{ r: 8 }} />
        </ComposedChart>
      </div>
    </div>
  );
};

export default TunaAquaValue;
