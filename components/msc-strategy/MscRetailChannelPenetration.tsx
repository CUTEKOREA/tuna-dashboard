'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ShoppingCart } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const channelData = [
  { channel: '대형마트', uk: 78, de: 95, fr: 72, it: 55, es: 38 },
  { channel: '디스카운트', uk: 62, de: 91, fr: 45, it: 35, es: 22 },
  { channel: '온라인', uk: 85, de: 88, fr: 65, it: 42, es: 28 },
  { channel: '편의점', uk: 45, de: 70, fr: 30, it: 20, es: 12 },
];

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: '0.78rem',
  padding: '8px 12px',
};

const countryBars = [
  { key: 'uk', name: '🇬🇧 영국', color: '#10b981' },
  { key: 'de', name: '🇩🇪 독일', color: '#38bdf8' },
  { key: 'fr', name: '🇫🇷 프랑스', color: '#a78bfa' },
  { key: 'it', name: '🇮🇹 이탈리아', color: '#f59e0b' },
  { key: 'es', name: '🇪🇸 스페인', color: '#ef4444' },
];

export default function MscRetailChannelPenetration() {
  return (
    <WidgetCard
      title="W-MSC07. 유통채널별 MSC 침투율"
      icon={ShoppingCart}
      iconColor="#38bdf8"
      pillar="S5"
      cardDesc="유럽 5개국의 대형마트·디스카운트·온라인·편의점 채널별 MSC 에코라벨 참치 침투율(%) 비교"
      unit="%"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      chartHeight={320}
      chart={
        <BarChart
          data={channelData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            stroke="rgba(255,255,255,0.4)"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="channel"
            width={80}
            tick={{ fill: '#e2e8f0', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value: number) => [`${value}%`, '']}
          />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.75rem' }} />
          {countryBars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name}
              fill={bar.color}
              radius={[0, 4, 4, 0]}
              barSize={8}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      }
      takeaway={{
        situation: "독일은 모든 유통 채널에서 MSC 침투율 70%+로 시장 포화 수준. 온라인 채널이 평균적으로 가장 높은 MSC 침투율(61.6%)을 보이며, 편의점이 가장 낮음(35.4%). 스페인은 대형마트(38%)조차 MSC 침투율이 낮아 성장 잠재력 최대.",
        actionPlan: "온라인 채널의 MSC 친화도가 가장 높으므로, 유럽 D2C/이커머스 진출 시 MSC 인증이 핵심 차별화 요소. 디스카운트 채널(Aldi/Lidl)의 MSC 의무화 추세가 남유럽으로 확산 중 — 선제적 대응 필요.",
        source: "MSC UK/Ireland Market Report 2024, MSC Country Market Analysis 2025-2026",
      }}
    />
  );
}
