import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { AlertTriangle } from 'lucide-react';
import TermTooltip from './TermTooltip';

const data = [
  { category: '통조림 원료', Mackerel: 50, JackMackerel: 85, Sardine: 70 },
  { category: '펫푸드 사료', Mackerel: 30, JackMackerel: 95, Sardine: 80 },
  { category: '저가형 뷔페', Mackerel: 40, JackMackerel: 60, Sardine: 45 },
  { category: '일반 가정식', Mackerel: 90, JackMackerel: 30, Sardine: 20 },
  { category: '고급 외식업', Mackerel: 85, JackMackerel: 10, Sardine: 15 },
  { category: '간편식(HMR)', Mackerel: 75, JackMackerel: 40, Sardine: 25 },
];

export default function FishStatReplacementRadar() {
  return (
    <div style={{ background: 'rgba(0, 20, 40, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '24px', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>대체재 영토 침식 레이더 (Replacement Radar)</h3>
        <TermTooltip term="어종 교체 현상" description="원가 상승을 버티지 못한 B2B 시장(통조림, 애견 등)이 전갱이, 정어리로 원료를 대거 교체하는 수요 이동 현상" />
      </div>
      
      <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <AlertTriangle size={20} color="var(--color-danger)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
          <strong style={{ color: 'var(--color-danger)' }}>Situation:</strong> 펫푸드 및 염가 통조림 영역에서 전갱이/정어리가 고등어의 파이를 완전히 잠식.<br/>
          <strong style={{ color: 'var(--color-danger)' }}>Takeaway:</strong> 고등어 납품 포기 대신 자사(Silla)의 칠레산 전갱이 라인업을 세컨드 티어로 즉시 스위칭 제안하여 수주율 선방.
        </div>
      </div>

      <div style={{ height: '280px', width: '100%' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="category" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: 'none', borderRadius: '8px' }} />
            <Radar name="고등어 (Mackerel)" dataKey="Mackerel" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.4} />
            <Radar name="전갱이 (Jack Mackerel)" dataKey="JackMackerel" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.6} />
            <Radar name="정어리 (Sardine)" dataKey="Sardine" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.4} />
          </RadarChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );
}
