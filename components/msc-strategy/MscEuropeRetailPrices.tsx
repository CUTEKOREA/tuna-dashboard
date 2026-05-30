'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
} from 'recharts';
import { Euro } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const priceData = [
  { country: '🇬🇧 영국', msc: 14.2, nonMsc: 10.8, premium: 31.5 },
  { country: '🇩🇪 독일', msc: 12.8, nonMsc: 9.5, premium: 34.7 },
  { country: '🇫🇷 프랑스', msc: 16.5, nonMsc: 13.2, premium: 25.0 },
  { country: '🇮🇹 이탈리아', msc: 22.4, nonMsc: 18.6, premium: 20.4 },
  { country: '🇪🇸 스페인', msc: 18.9, nonMsc: 16.2, premium: 16.7 },
  { country: '🇵🇹 포르투갈', msc: 15.6, nonMsc: 13.1, premium: 19.1 },
];

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: '0.78rem',
  padding: '8px 12px',
};

export default function MscEuropeRetailPrices() {
  return (
    <WidgetCard
      title="W-MSC04. 유럽 MSC vs 비MSC 소매가 비교"
      icon={Euro}
      iconColor="#10b981"
      pillar="S5"
      cardDesc="유럽 6개국 MSC 인증 참치캔과 비인증 참치캔의 소매가(€/kg) 비교 및 프리미엄율(%) 분석"
      unit="€/kg"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      chartHeight={340}
      chart={
        <ComposedChart data={priceData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="country"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <YAxis
            yAxisId="left"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            label={{ value: '€/kg', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 11 } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#f59e0b"
            tick={{ fill: '#f59e0b', fontSize: 11 }}
            label={{ value: '프리미엄 %', angle: 90, position: 'insideRight', style: { fill: '#f59e0b', fontSize: 11 } }}
            domain={[0, 50]}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.78rem' }} />
          <Bar
            yAxisId="left"
            dataKey="msc"
            name="MSC 인증"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            barSize={20}
            isAnimationActive={false}
          />
          <Bar
            yAxisId="left"
            dataKey="nonMsc"
            name="비MSC"
            fill="#64748b"
            radius={[4, 4, 0, 0]}
            barSize={20}
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="premium"
            name="프리미엄(%)"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#f59e0b', stroke: '#f59e0b' }}
            isAnimationActive={false}
          />
        </ComposedChart>
      }
      takeaway={{
        situation: "유럽 6개국 평균 MSC 프리미엄은 24.6%. 독일(34.7%)이 가장 높고, 스페인(16.7%)이 가장 낮음. 이탈리아는 절대 소매가가 €22.4/kg으로 최고가 — 올리브유+황다랑어 프리미엄 반영.",
        actionPlan: "스페인·포르투갈은 MSC 프리미엄이 낮아 PB(자체브랜드) 가격 경쟁에 유리. 독일·영국은 프리미엄이 높아 NB(브랜드) 전략이 효과적. 수출 대상국별 가격 포지셔닝 차별화 필수.",
        source: "MSC Tuna Market Analysis 2025-2026 (UK/DE/FR/IT/ES/PT)",
      }}
    />
  );
}
