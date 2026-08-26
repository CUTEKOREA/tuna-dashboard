'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';

const RISK_DATA = [
  { subject: '어구(Gear) 친환경성', currentRisk: 4, safeTarget: 1 },
  { subject: '참다랑어 자원량', currentRisk: 5, safeTarget: 2 },
  { subject: 'US SIMP 준수 요구', currentRisk: 5, safeTarget: 1 },
  { subject: 'EU CATCH 의무 (2026)', currentRisk: 4, safeTarget: 1 },
  { subject: '강제노동/인권 리스크', currentRisk: 3, safeTarget: 1 },
];

export default function SasTraceabilityRatings() {
  return (
    <WidgetCard
      id="W-SAS12"
      title="추적성(Traceability) 및 지속가능성 리스크"
      description="규제 준수(SIMP/CATCH) 및 Seafood Watch 'Red' 등급 압박"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="Seafood Watch·NOAA SIMP - 자연산 참다랑어 'Red'(회피) 등급, US SIMP·EU CATCH(2026) 5대 리스크"
      takeaway={{ 
        situation: "모든 자연산 참다랑어는 멸종 위기 및 혼획 문제로 Seafood Watch 'Red(기피)' 등급에 지정되어 있으며, 미국의 SIMP와 2026년 발효되는 EU의 CATCH IT 시스템으로 인해 완전한 어획 추적성이 강제되고 있습니다.", 
        actionPlan: "블록체인 기반 추적성(Traceability) 시스템을 도입하여 'Catch to Plate' 데이터를 구매자에게 투명하게 제공하는 것이 리테일러의 공급망 퇴출을 방어하는 유일한 해법입니다.", 
        source: "Monterey Bay Aquarium Seafood Watch / NOAA SIMP" 
      }}
      customBody={
        <div style={{ height: 256, width: '100%', marginTop: 8 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={RISK_DATA}>
              <PolarGrid stroke="rgba(255,255,255,0.15)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--w-slate-300)', fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={false} axisLine={false} />
              <Radar
                name="현재 규제/환경 리스크 (Red Zone)"
                dataKey="currentRisk"
                stroke="var(--w-red-500)"
                strokeWidth={2}
                fill="var(--w-red-500)"
                fillOpacity={0.3}
                isAnimationActive={false}
              />
              <Radar
                name="안전 목표 (Safe Zone)"
                dataKey="safeTarget"
                stroke="var(--w-emerald-500)"
                strokeWidth={2}
                fill="var(--w-emerald-500)"
                fillOpacity={0.5}
                isAnimationActive={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backgroundColor: 'rgba(30,41,59,0.95)', color: 'var(--w-slate-200)' }}
                labelStyle={{ color: 'var(--w-slate-200)' }}
                itemStyle={{ color: 'var(--w-slate-300)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', color: 'var(--w-slate-300)' }} iconType="circle" />
            </RadarChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}
