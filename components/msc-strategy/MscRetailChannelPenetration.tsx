'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { ShoppingCart } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const channelData = [
  { channel: '대형마트', uk: 78, de: 95, fr: 72, it: 55, es: 38 },
  { channel: '디스카운트', uk: 62, de: 91, fr: 45, it: 35, es: 22 },
  { channel: '온라인', uk: 85, de: 88, fr: 65, it: 42, es: 28 },
  { channel: '편의점', uk: 45, de: 70, fr: 30, it: 20, es: 12 },
];

const countryBars = [
  { key: 'uk', name: '🇬🇧 영국', color: '#10b981' },
  { key: 'de', name: '🇩🇪 독일', color: '#38bdf8' },
  { key: 'fr', name: '🇫🇷 프랑스', color: '#a78bfa' },
  { key: 'it', name: '🇮🇹 이탈리아', color: '#f59e0b' },
  { key: 'es', name: '🇪🇸 스페인', color: '#ef4444' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(20, 28, 52, 0.95)',
        border: '1px solid rgba(148,163,184,0.15)',
        borderRadius: '8px',
        padding: '12px',
        color: '#e2e8f0',
        fontSize: '0.82rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
      }}>
        <div style={{ fontWeight: 700, marginBottom: '8px', color: '#ffffff' }}>{label} 채널</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontWeight: 600 }}>
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span>{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function MscRetailChannelPenetration() {
  return (
    <WidgetCard
      id="W-MSC09"
      title="유통채널별 MSC 침투율"
      description="국가별 대형마트·디스카운트·온라인 채널 MSC 비중"
      icon={ShoppingCart}
      iconColor="#38bdf8"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="B2B 유통 채널 동향"
      takeaway={{
        situation: "독일은 온라인, 오프라인 모든 유통 채널에서 MSC 침투율 70%+ 이상으로 시장 포화 상태입니다. 반면 스페인은 주력 채널인 대형마트에서조차 38%로 침투율이 낮아 오히려 성장 잠재력이 큽니다.",
        actionPlan: "유럽 이커머스(온라인) 진출 시 MSC 인증이 강력한 차별화 요소로 작용합니다. Aldi, Lidl 등 하드 디스카운트 채널의 MSC 의무화 규정이 남유럽으로 확산되고 있으므로 납품을 위해 사전 대비가 필수적입니다.",
        source: "NielsenIQ Channel Data / MSC 2025",
      }}
      customBody={
        <div style={{ height: 320, width: '100%', marginTop: '8px' }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={channelData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="channel" width={75} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(140,170,255,0.10)' }} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.75rem' }} iconType="circle" />
              {countryBars.map((bar) => (
                <Bar key={bar.key} dataKey={bar.key} name={bar.name} fill={bar.color} radius={[0, 4, 4, 0]} barSize={10} isAnimationActive={false} />
              ))}
            </BarChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}
