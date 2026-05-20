'use client';

import React from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip as RechartsTooltip, Legend
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './TunaExtractDashboard.module.css';
import { Leaf } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';

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

export default function TunaSdgCircular({ sdgData }: SdgCircularProps) {
  const defaultData = {
    sdg_contributions: [
      { sdg: "SDG 12.3\n식량 손실 반감", current: 25, target: 85 },
      { sdg: "SDG 14.4\n지속가능 어업", current: 60, target: 90 },
      { sdg: "SDG 2.4\n지속가능 식량", current: 40, target: 75 },
      { sdg: "SDG 8.4\n자원 효율성", current: 30, target: 80 }
    ],
    global_waste_pct: 33,
    tuna_byproduct_pct: 50,
    korea_upcycle_pct: 19.5,
    fishmeal_from_byproduct_pct: 27,
    fishoil_from_byproduct_pct: 48
  };

  const d = sdgData || defaultData;

  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '14px', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e2e8f0' }}>{payload[0]?.payload?.sdg}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color, margin: '0.25rem 0', fontSize: '0.8rem' }}>
            {entry.name}: {entry.value}점
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Leaf size={18} className={styles.cardIcon} color="#10b981" />
          W-NEW.{' '}
          <TermTooltip
            term="SDG 12.3"
            description="UN 지속가능발전목표 12.3 — '2030년까지 소매·소비자 수준에서 1인당 글로벌 식량 폐기물을 절반으로 줄이고, 생산·공급망에서의 식량 손실을 감소시킨다.' 참치 부산물 100% 자원화는 이 목표의 핵심 실행 수단."
          />
          {' '}순환경제 기여도 대시보드
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          참치액젓 부산물 자원화 → UN SDG 기여도 정량화 — ESG 보고서 및 바이어 브랜딩 소재
        </p>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '0 1rem', marginBottom: '0.75rem' }}>
        <div style={{ background: 'var(--surface-3)', borderRadius: '8px', padding: '0.6rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>글로벌 수산물 손실·폐기</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-danger)' }}>{d.global_waste_pct}%</div>
        </div>
        <div style={{ background: 'var(--surface-3)', borderRadius: '8px', padding: '0.6rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>참치 부산물 비율</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-warning)' }}>{d.tuna_byproduct_pct}%</div>
        </div>
        <div style={{ background: 'var(--surface-3)', borderRadius: '8px', padding: '0.6rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>한국 업사이클링율</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>{d.korea_upcycle_pct}%</div>
        </div>
      </div>

      {/* SDG Radar */}
      <div style={{ height: '230px', width: '100%', marginBottom: '0.5rem', position: 'relative', zIndex: 0 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={d.sdg_contributions}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="sdg" tick={{ fill: '#94a3b8', fontSize: 9 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
            <Radar name="현재 기여도" dataKey="current" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.4} />
            <Radar name="목표 기여도" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
            <RechartsTooltip content={<CustomRadarTooltip />} />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
          </RadarChart>
        </SafeResponsiveContainer>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <TakeawayBox
          situation="FAO에 따르면 전 세계 수산물 생산량의 30~35%가 보존 인프라 부족 및 폐기로 인해 손실되고 있으며, 참치 원물의 약 50%가 부산물(내장 12~18%, 뼈 9~15%, 머리 9~12%, 자숙액 등)로 버려지고 있습니다. 반면 글로벌 어분의 27%, 어유의 48%가 이미 부산물로부터 생산되고 있어, 참치 부산물의 고부가가치 전환(액젓, 펩타이드, 콜라겐) 잠재력은 막대합니다. EU CFP의 '하역 의무화(Landing Obligation)'로 해상 투기가 전면 금지되어, 부산물 자원화가 규제적 의무로 전환되고 있습니다."
          actionPlan="**[Actionable Insight]** 1) 참치액젓 1톤 생산 시 부산물 자원화량을 SDG 12.3 기여도로 환산하여, ESG 보고서 및 바이어 대상 '순환경제 인증' 마케팅 소재로 활용해야 합니다. 2) FAO Blue Transformation 프레임워크와 연계하여, '추가 어획 없이 가치사슬을 업그레이드'하는 친환경 혁신 사례로 글로벌 바이어에게 포지셔닝하면 프리미엄 단가 확보가 가능합니다. 3) EU 하역 의무화 정책을 활용하여, 유럽 시장 진출 시 '규제 준수 + 순환경제' 이중 가치를 소구해야 합니다."
          source="FAO SOFIA 2022 (The State of World Fisheries and Aquaculture) / EU CFP Landing Obligation / A third assessment of global marine fisheries discards.pdf / Blue Nature-Based Solutions in marine and coastal EU policies"
        />
      </div>
    </div>
  );
}
