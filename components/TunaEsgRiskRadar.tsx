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
        situation: `<div>
<p>"ESG 리스크"란 환경(E)·사회(S)·거버넌스(G) 차원의 비즈니스 리스크. 수산업에서 가장 큰 ESG 리스크는 <strong>IUU(불법·비보고·비규제) 어업과 강제 노동</strong>.</p>
<p>국가별 ESG 리스크 격차 (ILO 보고서 기준):</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>인도네시아 원양 어업 강제노동 위험도 85점/100</strong> — 매우 높음</li>
<li>WCPFC/PNA 관리 구역(태평양) <strong>35점</strong> — 낮음</li>
<li>한국·일본 원양 <strong>15~25점</strong> — 매우 낮음</li>
</ul>
<p>실질 영향: 서구권 EU CSDDD + 미국 UFLPA 시행으로 인도네시아산 참치는 향후 5년 EU·미국 시장 진입 차질 가시화. 인도네시아 의존 vendor는 사실상 채널 잃음. 반면 태평양 원양(한국·WCPFC) 어획물은 자동 sustainable supplier 지위.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: ESG 리스크 격차는 단순 ESG 보고가 아닌 <strong>"한국 태평양 원양 vendor의 자동 regulatory moat"</strong>. 인도네시아·동남아 경쟁자가 사라지는 무대에서 우리만 남는다.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>"Clean Supply Chain Premium" 마케팅</strong>: 신라교역 태평양 원양 어획물에 ILO 35점·ESG 인증 라벨. EU·미국 retail에 +12~20% 프리미엄.</li>
<li style="margin-bottom: 8px;"><strong>인도네시아 vendor ESG 실사 강화</strong>: 분기별 재평가, ESG 미달 vendor 자동 blacklist. supply chain 정화로 우리 reputation 차별화.</li>
<li><strong>"ESG arbitrage trading"</strong>: 인도네시아 distress vendor의 정상화 cost를 우리가 capital 공급 + 우리 ESG 표준 통합 — equity 인수 후 5년 후 ESG-rated valuation으로 매각. JP Morgan ESG Fund와 partnership.</li>
</ol>
</div>`,
        source: '국제 노동 기구(ILO) · 인도네시아 해양수산부 · 내부 ESG 실사 보고서',
      }}
    />
  );
}
