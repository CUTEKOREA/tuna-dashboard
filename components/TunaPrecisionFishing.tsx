/**
 * AI 기반 스마트 정밀 조업 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 94줄 → After 60줄 (-36%)
 */

'use client';
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts';
import { Crosshair } from 'lucide-react';
import rawData from '../data/tuna_precision_fishing.json';
import WidgetCard from './WidgetCard';

const CustomRadarTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px', borderRadius: '8px', color: '#f8fafc' }}>
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e2e8f0' }}>{payload[0].payload.metric}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          <span style={{ color: '#cbd5e1' }}>🧭 과거 직관 조업</span>
          <span>{payload[0].payload.traditional_hunting}{payload[0].payload.unit}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>📡 스마트 정밀 조업</span>
          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{payload[0].payload.precision_harvesting}{payload[0].payload.unit}</span>
        </div>
      </div>
    </div>
  );
};

export default function TunaPrecisionFishing() {
  return (
    <WidgetCard
      title="AI 기반 스마트 정밀 조업"
      icon={Crosshair}
      iconColor="#38bdf8"
      pillar="S1"
      cardDesc="전통 직관 조업(Traditional) vs 스마트 정밀 조업(Precision Harvesting) 도입 시 KPI 변화량 레이더 비교"
      telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }}
      kpiPanel={[
        { label: '타겟 어군 식별률', value: '85%', sub: 'AI 3D 소나 도입 시', trendColor: '#38bdf8' },
        { label: '조업 효율 향상', value: '+15%', sub: '탐색 유류비 제로화', trendColor: '#10b981' },
      ]}
      chartHeight={280}
      chart={
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={rawData}>
          <PolarGrid stroke="rgba(255,255,255,0.15)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip content={<CustomRadarTooltip />} />
          <Legend />
          <Radar name="🧭 과거 직관 의존 조업 (사냥)" dataKey="traditional_hunting" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
          <Radar name="📡 딥테크 정밀 조업 (수확)" dataKey="precision_harvesting" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.3} />
        </RadarChart>
      }
      takeaway={{
        situation: '기후 변화(엘니뇨·라니냐)로 수온 변화에 따라 어군 서식지가 수천 km 단위로 이동. 선박을 동원한 맹목적 탐색 비용(항공유·유류비)과 가치 낮은 어종이 잡히는 공치기(Dry sets) 확률이 치명적 리스크.',
        actionPlan: '단순 선박 건조(CapEx)에서 \'소프트웨어·센서 중심\'으로 투자 전환. 무인 어군 탐지 드론 + AI 3D 소나 도입 시 타겟 어군 85% 사전 식별. 불필요한 항해 차단으로 유류비 절감 + 조업 효율 +15% 향상 — 핀포인트 수확(Proactive Intercept) 전략 핵심.',
        source: 'ISSF Technical Report 2024 · SPC 어군 탐지 기술 평가 · FFA 스마트 FAD 파일럿 결과',
      }}
    />
  );
}
