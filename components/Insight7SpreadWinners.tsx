'use client';

import React from 'react';
import { Coins } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';
import data from '../data/insight7_spread_winners.json';
import useContainerWidth from '../hooks/useContainerWidth';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const Insight7SpreadWinners = () => {
  const { containerRef, width } = useContainerWidth();

  const formatYAxis = (tick: number) => {
    return `$${tick.toLocaleString()}/t`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length >= 2) {
      const frozen = payload[0].value;
      const prepared = payload[1].value;
      const spread = prepared - frozen;
      const margin = ((spread / frozen) * 100).toFixed(0);

      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          <p className={styles.tooltipValue} style={{ color: 'var(--text-secondary)' }}>
            <span>냉동/원물 (Frozen):</span>
            <strong>${frozen.toLocaleString()}/t</strong>
          </p>
          <p className={styles.tooltipValue} style={{ color: '#FCD34D' }}>
            <span>가공품 (Prepared):</span>
            <strong>${prepared.toLocaleString()}/t</strong>
          </p>
          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
          <p className={styles.tooltipValue} style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
            <span>가공 차익 (Spread):</span>
            <strong>+${spread.toLocaleString()} (+{margin}%)</strong>
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
          <Coins size={20} />
          가공 차익의 승자들
          
        </h3>
        <p className={styles.cardSubtitle}>
          실제로 조업하는 연안국보다 2차 가공 제조국이 챙기는 막대한 톤당 마진(Spread)
        </p>
      </div>

      <div style={{ width: '100%', height: width < 600 ? 300 : 400 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="country" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            <Bar dataKey="frozen_price_usd_per_t" name="원물 수출단가 (Frozen USD/t)" fill="url(#a11y-stripe-h)" color="#6B7280" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="prepared_price_usd_per_t" name="가공 수출단가 (Prepared USD/t)" fill="url(#a11y-diag)" color="var(--color-warning)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>

      <TakeawayBox source="FAO FishStatJ - Export Unit Value Comparison (2020-2023 Avg)" situation="페루·아르헨티나 등 조업국은 원물(Frozen) 수출에 그쳐 톤당 $1,200~1,800 수준의 박리다매에 머물고 있습니다. 반면 태국·중국·스페인 등 가공 허브 국가는 저렴하게 수입한 원물을 조미/건조/통조림 가공 후 재수출하여 톤당 $3,000~4,500을 받으며, 최대 150~190%의 부가가치 차익(Spread)을 창출합니다. 어선보다 공장이 돈을 버는 구조가 고착화되었습니다."
        actionPlan="원물 직접 조업에서 마진이 나지 않는 시대입니다. 베트남/인도네시아에 자체 가공 라인(조미·건조·절단)을 확보하고, 페루/아르헨티나산 원물을 CIF 조건으로 매입 → 현지 가공 → 일본/EU 시장 FOB 수출하는 '가공 스프레드 캡처' 모델을 구축하십시오. 톤당 순마진 $800~1,200이 현실적으로 달성 가능합니다. (Re-rating Expected)"
      />
    </div>
  );
};

export default Insight7SpreadWinners;
