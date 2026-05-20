/**
 * 인도네시아 참치 ESG 리스크 모니터링 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 84줄 → After 56줄 (-33%)
 */

'use client';
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts';
import { ShieldCheck } from 'lucide-react';
import WidgetCard from './WidgetCard';

const data = [
  { metric: '강제노동 위험', indonesia: 85, pna: 35 },
  { metric: '불법 환적 가능성', indonesia: 90, pna: 25 },
  { metric: '해양 생태계 파괴', indonesia: 80, pna: 40 },
  { metric: '어족자원 남획', indonesia: 75, pna: 30 },
];

const CustomRadarTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px', borderRadius: '8px', color: '#f8fafc' }}>
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e2e8f0' }}>{payload[0].payload.metric}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          <span style={{ color: '#ef4444' }}>인도네시아 조업</span>
          <span>{payload[0].payload.indonesia}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          <span style={{ color: '#22c55e' }}>WCPFC/PNA (기준)</span>
          <span>{payload[0].payload.pna}</span>
        </div>
      </div>
    </div>
  );
};

export default function TunaEsgRiskRadar() {
  return (
    <WidgetCard
      title="인도네시아 참치 ESG 리스크 모니터링"
      icon={ShieldCheck}
      iconColor="#f59e0b"
      pillar="S5"
      cardDesc="강제노동·IUU·생태계 파괴·남획 4지표를 인도네시아 vs WCPFC/PNA 기준선 비교 — ILO 보고서 기반 100점 스케일"
      telemetry={{ status: 'STATIC', syncDate: '2025-11' }}
      chartHeight={280}
      chart={
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 'bold' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip content={<CustomRadarTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
          <Radar name="인도네시아 리스크" dataKey="indonesia" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
          <Radar name="PNA (기준선)" dataKey="pna" stroke="#22c55e" fill="#22c55e" fillOpacity={0.4} />
        </RadarChart>
      }
      takeaway={{
        situation: '서구권 IUU·강제 노동 제재 강화로 인도네시아산 참치의 수출입 차질 가시화. ILO 보고서 기준 인도네시아 원양 어업 강제노동 위험도 85점(100점 만점)으로 WCPFC/PNA 관리 구역(35점) 대비 2.4배 높음.',
        actionPlan: '신라교역의 태평양 원양 어획물에 대한 \'Clean Supply Chain\' 프리미엄 마케팅 전개. 인도네시아 벤더 ESG 실사 강화 + 인증되지 않은 공급선 분기별 재평가.',
        source: '국제 노동 기구(ILO) · 인도네시아 해양수산부 · 내부 ESG 실사 보고서',
      }}
    />
  );
}
