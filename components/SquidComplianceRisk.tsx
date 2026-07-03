'use client';
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import { ShieldAlert } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { getSquidData } from '@/lib/data/squid';

const data = getSquidData('complianceRisk');

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{ background: 'rgba(10, 16, 40, 0.95)', border: `1px solid ${d.color}`, padding: '12px', borderRadius: '8px', color: 'var(--text-primary)' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>해역: {d.country}</p>
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>ITQ 쿼터 접근성: <strong style={{ color: 'var(--text-primary)' }}>{d.itq_index}</strong></p>
        <p style={{ margin: '4px 0', fontSize: '11px', color: 'var(--text-secondary)' }}>IUU & ESG 리스크: <strong style={{ color: 'var(--color-danger)' }}>{d.iuu_risk}</strong></p>
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>잠재 생산량: <strong style={{ color: 'var(--text-primary)' }}>{d.volume}k 톤</strong></p>
      </div>
    );
  }
  return null;
};

export default function SquidComplianceRisk() {
  return (
    <WidgetCard
      title="글로벌 ITQ 쿼터 및 IUU 컴플라이언스 리스크 매트릭스"
      icon={ShieldAlert}
      iconColor="#ef4444"
      pillar="S3"
      cardDesc="업계추정 (MRAG·FAO IUU 지수 기준, 포클랜드 ITQ-B 제도 정보 통합) — illustrative"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
          <XAxis type="number" dataKey="itq_index" name="ITQ 쿼터 접근성" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} label={{ value: '쿼터 지분 접근성 (낮음 ← → 높음)', position: 'insideBottom', offset: -25, fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} domain={[0, 100]} />
          <YAxis type="number" dataKey="iuu_risk" name="IUU 사회적 리스크" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} label={{ value: '리스크 지표 (높을수록 위험)', angle: -90, position: 'insideLeft', offset: 10, fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} domain={[0, 100]} />
          <ZAxis type="number" dataKey="volume" range={[200, 2000]} name="잠재 생산량" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
          <ReferenceLine y={50} stroke="rgba(239, 68, 68, 0.4)" strokeDasharray="3 3" />
          <ReferenceLine x={50} stroke="rgba(59, 130, 246, 0.4)" strokeDasharray="3 3" />
          <Scatter name="해역별 리스크 프로파일" data={data}>
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Scatter>
        </ScatterChart>
      }
      takeaway={{
        situation: `<div>
<p>"규제 리스크 매트릭스(Compliance Risk Matrix)"는 어장별 IUU·환적·EU/미국 차단 리스크를 업계 자체추정으로 정량화한 illustrative 매트릭스.</p>
<p>대조: <strong>중국 원양 선단 공해상 어획량 ↑ but 불법 환적 리스크 추정치 95 — EU/미국 시장 제재 리스크 상승세</strong> vs <strong>포클랜드 해역 장기 어업권(ITQ-B) + 리스크 추정치 낮음</strong>.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 저가 출혈 경쟁 시대 종료. <strong>"안전한 프리미엄 쿼터 선점"</strong>이 본질.</p>
<p><strong>3단계</strong>: ① 중국 원양 매입 비중 단계적 축소 ② 포클랜드·아르헨티나 현지 합작 법인 minority equity 5~10% 인수 검토 ③ 글로벌 B2B 1차 벤더 지위 확보 — EU 제재 강화 시나리오 대비 공급선 다변화 선제 구축.</p>
</div>`,
        source: "자체추정 (MRAG IUU 어업 리스크 지수·FAO 어업 규정 준수 데이터·포클랜드 ITQ-B 제도 정보 기반) — illustrative",
      }}
    />
  );
}
