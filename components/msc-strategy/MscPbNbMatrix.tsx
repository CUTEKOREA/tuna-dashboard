'use client';

import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  Label,
} from 'recharts';
import { Grid3X3 } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const bubbleData = [
  { country: '🇩🇪 독일', pb: 71, msc: 93, volume: 87862, color: '#38bdf8' },
  { country: '🇫🇷 프랑스', pb: 32, msc: 67, volume: 32683, color: '#a78bfa' },
  { country: '🇬🇧 영국', pb: 43, msc: 65, volume: 45840, color: '#10b981' },
  { country: '🇮🇹 이탈리아', pb: 28, msc: 50, volume: 28500, color: '#f59e0b' },
  { country: '🇪🇸 스페인', pb: 80, msc: 32, volume: 52000, color: '#ef4444' },
  { country: '🇵🇱 폴란드', pb: 55, msc: 25, volume: 15000, color: '#64748b' },
];

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: '0.78rem',
  padding: '8px 12px',
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.country}</div>
      <div>PB 비중: <span style={{ color: '#38bdf8' }}>{d.pb}%</span></div>
      <div>MSC 침투율: <span style={{ color: '#10b981' }}>{d.msc}%</span></div>
      <div>시장 규모: <span style={{ color: '#f59e0b' }}>{d.volume.toLocaleString()}톤</span></div>
    </div>
  );
};

export default function MscPbNbMatrix() {
  return (
    <WidgetCard
      title="W-MSC05. PB 비중 × MSC 침투율 매트릭스"
      icon={Grid3X3}
      iconColor="#a78bfa"
      pillar="S5"
      cardDesc="유럽 6개국의 PB(자체브랜드) 점유율과 MSC 에코라벨 침투율의 상관관계. 버블 크기 = 시장 물량(톤)"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      chartHeight={360}
      chart={
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            type="number"
            dataKey="pb"
            name="PB 비중"
            domain={[15, 95]}
            stroke="rgba(255,255,255,0.4)"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            label={{ value: 'PB 비중 (%)', position: 'insideBottom', offset: -5, style: { fill: '#94a3b8', fontSize: 11 } }}
          />
          <YAxis
            type="number"
            dataKey="msc"
            name="MSC 침투율"
            domain={[15, 100]}
            stroke="rgba(255,255,255,0.4)"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            label={{ value: 'MSC 침투율 (%)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 11 } }}
          />
          <ZAxis type="number" dataKey="volume" range={[200, 1200]} name="시장 규모" />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={50}
            yAxisId={0}
            stroke="rgba(255,255,255,0.15)"
            strokeDasharray="4 4"
          >
            <Label value="MSC 50%" position="insideTopLeft" style={{ fill: '#64748b', fontSize: 10 }} />
          </ReferenceLine>
          <ReferenceLine
            x={50}
            stroke="rgba(255,255,255,0.15)"
            strokeDasharray="4 4"
          >
            <Label value="PB 50%" position="insideTopRight" style={{ fill: '#64748b', fontSize: 10 }} />
          </ReferenceLine>
          <Scatter data={bubbleData} isAnimationActive={false}>
            {bubbleData.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} fillOpacity={0.7} stroke={entry.color} strokeWidth={1.5} />
            ))}
          </Scatter>
        </ScatterChart>
      }
      customBody={
        <div style={{ padding: '0 20px 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {bubbleData.map((d) => (
            <div key={d.country} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#94a3b8' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
              {d.country}
            </div>
          ))}
        </div>
      }
      takeaway={{
        situation: "PB 비중과 MSC 침투율 간 상관관계가 국가별로 상이. 독일은 PB 71%임에도 MSC 93% — PB 자체가 MSC 인증을 요구. 반면 스페인은 PB 80%이지만 MSC 32% — PB가 가격 경쟁에 집중하여 MSC 도입이 느림.",
        actionPlan: "독일 모델(PB=MSC 의무화)이 스페인·폴란드로 확산될 경우, MSC 인증 없이는 PB 납품 자체가 불가능. OEM 수출 기업은 선제적 인증 확보로 시장 접근권 방어 필요.",
        source: "MSC Tuna Market Analysis 2025-2026, MSC Tuna Yearbook 2026",
      }}
    />
  );
}
