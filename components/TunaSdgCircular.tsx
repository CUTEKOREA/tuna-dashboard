/**
 * SDG 순환경제 기여도 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 116줄 → After 80줄 (-31%)
 */

'use client';
import React from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts';
import { Leaf } from 'lucide-react';
import WidgetCard from './WidgetCard';

interface SdgCircularProps {
  sdgData?: {
    sdg_contributions: Array<{ sdg: string; current: number; target: number }>;
    global_waste_pct: number;
    tuna_byproduct_pct: number;
    korea_upcycle_pct: number;
    fishmeal_from_byproduct_pct: number;
    fishoil_from_byproduct_pct: number;
  };
}

const defaultData = {
  sdg_contributions: [
    { sdg: 'SDG 12.3\n식량 손실 반감', current: 25, target: 85 },
    { sdg: 'SDG 14.4\n지속가능 어업', current: 60, target: 90 },
    { sdg: 'SDG 2.4\n지속가능 식량', current: 40, target: 75 },
    { sdg: 'SDG 8.4\n자원 효율성', current: 30, target: 80 },
  ],
  global_waste_pct: 33,
  tuna_byproduct_pct: 50,
  korea_upcycle_pct: 19.5,
  fishmeal_from_byproduct_pct: 27,
  fishoil_from_byproduct_pct: 48,
};

const CustomRadarTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px', borderRadius: '8px', color: '#f8fafc' }}>
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e2e8f0' }}>{payload[0]?.payload?.sdg}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '0.25rem 0', fontSize: '0.8rem' }}>
          {entry.name}: {entry.value}점
        </p>
      ))}
    </div>
  );
};

export default function TunaSdgCircular({ sdgData }: SdgCircularProps) {
  const d = sdgData || defaultData;

  return (
    <WidgetCard
      title="W-NEW. 순환경제 SDG 기여도 대시보드"
      icon={Leaf}
      iconColor="#10b981"
      pillar="S5"
      cardDesc="참치액젓 부산물 자원화 → UN SDG 12.3·14.4·2.4·8.4 기여도 정량화. ESG 보고서·바이어 브랜딩 소재"
      telemetry={{ status: 'SYNCED', syncDate: 'FAO SOFIA 2022' }}
      termTooltip={{ term: 'SDG 12.3', description: 'UN 지속가능발전목표 12.3 — 2030년까지 소매·소비자 식량 폐기물을 절반으로 줄이고 생산·공급망 식량 손실을 감소. 참치 부산물 100% 자원화는 이 목표의 핵심 실행 수단.' }}
      kpiPanel={[
        { label: '글로벌 수산물 손실·폐기', value: `${d.global_waste_pct}%`, trendColor: '#ef4444' },
        { label: '참치 부산물 비율', value: `${d.tuna_byproduct_pct}%`, trendColor: '#f59e0b' },
        { label: '한국 업사이클링율', value: `${d.korea_upcycle_pct}%`, trendColor: '#10b981' },
      ]}
      chartHeight={230}
      chart={
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={d.sdg_contributions}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="sdg" tick={{ fill: '#94a3b8', fontSize: 9 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
          <Radar name="현재 기여도" dataKey="current" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
          <Radar name="목표 기여도" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
          <Tooltip content={<CustomRadarTooltip />} />
          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
        </RadarChart>
      }
      takeaway={{
        situation: 'FAO에 따르면 전 세계 수산물의 30~35%가 보존 인프라 부족·폐기로 손실. 참치 원물의 약 50%가 부산물(내장 12~18%·뼈 9~15%·머리 9~12%·자숙액)로 버려짐. 반면 글로벌 어분 27%·어유 48%는 이미 부산물 기반 — 고부가가치 전환(액젓·펩타이드·콜라겐) 잠재력 막대. EU CFP 하역 의무화로 부산물 자원화가 규제적 의무로 전환 중.',
        actionPlan: '1) 참치액 1톤 생산 시 부산물 자원화량을 SDG 12.3 기여도로 환산해 ESG 보고서·바이어 \'순환경제 인증\' 마케팅 소재로 활용. 2) FAO Blue Transformation 프레임워크 연계로 \'추가 어획 없이 가치사슬 업그레이드\' 친환경 혁신 사례 포지셔닝 — 프리미엄 단가 확보. 3) EU 하역 의무화 정책 활용해 EU 진출 시 \'규제 준수 + 순환경제\' 이중 가치 소구.',
        source: 'FAO SOFIA 2022 · EU CFP Landing Obligation · A third assessment of global marine fisheries discards · Blue Nature-Based Solutions in marine and coastal EU policies',
      }}
    />
  );
}
