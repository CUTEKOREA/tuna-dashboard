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
        situation: `<div>
<p>전통 참치 조업은 선장의 경험과 운에 의존하는 <strong>"맹목적 탐색"</strong>이었습니다. 그런데 기후 변화로 어군 서식지가 수천 km 단위로 이동하면서 이 방식의 cost가 폭증.</p>
<p>치명적 리스크:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>유류비 폭등</strong>: ENSO 시즌 동안 어군 위치 변화로 항공유·MGO 소비 +40~60%</li>
<li><strong>공치기(Dry sets)</strong>: 그물을 내려도 가치 낮은 어종만 잡히거나 빈 그물. 공치기 비율 평시 15% → ENSO 시즌 35%+</li>
<li><strong>인건비</strong>: 비효율 조업 시간 늘면서 선원 OPEX 함께 증가</li>
</ul>
<p>"정밀 조업(Precision Fishing)" 해결책: 무인 드론·AI 3D 소나로 어군 사전 식별 후 핀포인트 수확. 결과: <strong>타겟 어군 85% 사전 식별, 유류비 -28%, CPUE +15%</strong>.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 정밀 조업은 단순 OPEX 절감이 아닌 <strong>"climate beta resilience capex"</strong>. ENSO 사이클이 강해질수록 정밀 vendor와 일반 vendor의 cost gap이 벌어진다.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>"하드웨어 → 소프트웨어·센서" 투자 전환</strong>: 선박 건조 capex 동결, 그 자본을 무인 어군 드론 + AI 3D 소나로 전환.</li>
<li style="margin-bottom: 8px;"><strong>"Pinpoint Harvest 프로토콜"</strong>: 어군 사전 식별 → 조업 결정의 모든 단계를 ML 모델에 의탁. 선장 직관 의존도 단계적 제로화.</li>
<li><strong>"Climate-resilient fleet conversion"</strong>: 5년 내 한국 선단 100% 정밀 조업 전환. 동시에 우리 정밀 조업 IP를 PNA·IOTC 회원국 어선에 라이센싱 — 본업 외 IP 수익원.</li>
</ol>
</div>`,
        source: 'ISSF Technical Report 2024 · SPC 어군 탐지 기술 평가 · FFA 스마트 FAD 파일럿 결과',
      }}
    />
  );
}
