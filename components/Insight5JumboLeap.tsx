'use client';

import React from 'react';
import { Rocket } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';
import data from '../data/insight5_jumbo_leap.json';
import useContainerWidth from '../hooks/useContainerWidth';

const Insight5JumboLeap = () => {
  const { containerRef, width } = useContainerWidth();

  const formatYAxisCatch = (tick: number) => {
    return `${(tick / 1000).toLocaleString()}k t`;
  };

  const formatYAxisVal = (tick: number) => {
    return `$${tick.toLocaleString()}M`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length >= 2) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{`${label}년`}</p>
          <p className={styles.tooltipValue} style={{ color: '#60A5FA' }}>
            <span>어획량 (훔볼트 오징어):</span>
            <strong>{payload[0].value.toLocaleString()} 톤</strong>
          </p>
          <p className={styles.tooltipValue} style={{ color: '#FCD34D' }}>
            <span>가공 수출액 (Prepared):</span>
            <strong>${payload[1].value.toLocaleString()}M</strong>
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
          <Rocket size={20} />
          훔볼트의 화려한 데뷔
          
        </h3>
        <p className={styles.cardSubtitle}>
          저가 취급받던 남미 훔볼트가 글로벌 고부가가치 가공 편입
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
              yAxisId="left"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(96,165,250,0.7)', fontSize: 12 }}
              tickFormatter={formatYAxisCatch}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(252,211,77,0.7)', fontSize: 12 }}
              tickFormatter={formatYAxisVal}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            <Bar 
              yAxisId="left"
              dataKey="jumbo_catch_t" 
              name="훔볼트 어획량 (Tonnes)" 
              fill="#60A5FA" 
              opacity={0.6}
              maxBarSize={40}
              radius={[4, 4, 0, 0]}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="prepared_export_m_usd" 
              name="가공품 수출 밸류 (Prepared USD)" 
              stroke="#FCD34D" 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6 }} 
            />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>

      <TakeawayBox source="FAO FishStatJ - Species Caught & Export Commodities (2000-2023)" situation="과거 사료용·저급 단백질로 취급받던 훔볼트 오징어(Dosidicus gigas)가 2005년 이후 어획량 100만 톤 돌파와 함께 글로벌 가공 체인에 본격 편입되었습니다. 파란 막대(어획량)와 노란 곡선(가공 수출액)의 동반 상승은, 중국·태국 가공 공장들이 훔볼트를 '참오징어 대체재'로 조미·가공하여 글로벌 프리미엄 시장에 투입하는 전략이 성공했음을 입증합니다."
        actionPlan="**[Actionable Insight]** 훔볼트 오징어는 톤당 원물가가 일렉스 대비 40~60% 저렴하면서도 가공 후 최종 제품 단가는 거의 동일합니다. 이 '가격 차익'을 활용해, 페루/칠레 현지에서 원물을 직접 매입하고 중국 칭다오 공장에서 조미 가공 후 일본/한국 시장에 유통하는 '삼각 무역 모델'을 구축하십시오. 원물 마진율이 최소 35% 이상 확보됩니다."
      />
    </div>
  );
};

export default Insight5JumboLeap;
