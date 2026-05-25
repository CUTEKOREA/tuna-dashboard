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
        situation: `<div>
<p>"순환경제(Circular Economy)"란 자원을 한 번 쓰고 버리지 않고 재활용·재가공해 다시 가치 창출하는 경제 모델. SDG 12.3(식품 폐기 절반 감축)의 핵심 instrument.</p>
<p>FAO 데이터: 전 세계 수산물의 <strong>30~35%가 보존 인프라 부족·폐기로 손실</strong>. 참치 원물 <strong>약 50%가 부산물</strong>(내장 12~18%·뼈 9~15%·머리 9~12%·자숙액)로 버려짐. 그러나 글로벌 어분 27%·어유 48%는 이미 부산물 기반 — 즉 어분·어유 시장은 사실상 부산물 시장.</p>
<p>고부가가치 전환 잠재력: 액젓($4~6K/톤) · 펩타이드($80~120/kg) · 콜라겐($15~25/kg). 폐기물 ($-50/톤)에서 고부가 원료 (+$4~12K/톤) 전환 시 50~150배 밸류업.</p>
<p>EU CFP(Common Fisheries Policy) 하역 의무화 발효 중 — 부산물 자원화가 단순 비즈니스 기회가 아닌 <strong>규제적 의무</strong>로 전환되는 시점.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 순환경제는 단순 ESG 보고서가 아닌 <strong>"규제 강화 시점에 first-mover 우위를 self-create하는 instrument"</strong>. SDG 12.3 기여도가 ASP 프리미엄으로 직접 회수.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>참치액 1톤당 부산물 자원화량을 SDG 12.3 기여도로 환산</strong>: 본사 ESG 보고서 + 바이어용 "순환경제 인증" 마케팅 자산화. 글로벌 retail 채널 vendor 평가 가산점.</li>
<li style="margin-bottom: 8px;"><strong>FAO Blue Transformation 프레임워크 연계</strong>: "추가 어획 없이 가치사슬 업그레이드" 포지셔닝으로 World Bank Blue Economy Fund 자본 유치 + ESG fund LP 모집.</li>
<li><strong>EU 하역 의무화 정책 활용</strong>: EU 진출 시 "규제 준수 + 순환경제" 이중 가치 소구. 동시에 우리 순환경제 시스템을 SaaS로 라이센싱해 동남아·라틴 mid-tier 가공사에 platform 매출 추가.</li>
</ol>
</div>`,
        source: 'FAO SOFIA 2022 · EU CFP Landing Obligation · A third assessment of global marine fisheries discards · Blue Nature-Based Solutions in marine and coastal EU policies',
      }}
    />
  );
}
