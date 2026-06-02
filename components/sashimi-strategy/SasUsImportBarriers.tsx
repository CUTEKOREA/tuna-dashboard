'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── 미국 참치 수입 3중 규제 관문 (FDA·NOAA 1차 문서 기반, 2024-2026) ──
   검증: SIMP 24개월 보존(NOAA), 수은 1.0ppm(FDA Action Levels),
   히스타민 35/200ppm(FDA CPG 540.525, 2024-11-04 Federal Register 최종) */
const GATES = [
  { key: '수은(메틸수은)', value: '1.0', unit: 'ppm', color: '#ef4444',
    desc: '초과 시 즉시 부적합(adulterated)·시장 퇴출. 대형 빅아이는 축적 위험 어종.' },
  { key: '히스타민', value: '35 / 200', unit: 'ppm', color: '#f59e0b',
    desc: '분해 지표 35ppm(2024년 50→35 강화) / 위해 상한 200ppm. 콜드체인 단절 시 즉시 거부.' },
  { key: 'SIMP 추적성', value: '24', unit: '개월 보존', color: '#38bdf8',
    desc: '어획선박·어구·해역·일자 체인오브커스터디 24개월 보존. IFTP 수입자 의무.' },
];

export default function SasUsImportBarriers() {
  return (
    <WidgetCard
      id="W-SAS30"
      title="미국 참치 수입 규제 3중 관문"
      description="관세 아닌 비관세 장벽 — SIMP·수은·히스타민 컴플라이언스"
      pillar="S3"
      telemetry={{ status: 'STATIC', syncDate: '2026' }}
      cardDesc="FDA 잔류기준·히스타민 CPG 540.525(2024)·NOAA SIMP 추적성 가이드 기준 미국 진입 규제"
      takeaway={{
        situation: "미국향 사시미·스테이크 참치는 단일 관세가 아니라 3중 규제 관문을 통과해야 진입합니다. ① SIMP — 사시미급 참치 5종(빅아이·황다랑어·날개·가다랑어·참다랑어, 가다랑어는 통조림·로인 중심)이 추적성 의무 대상으로 어획~수입 체인오브커스터디를 24개월 보존해야 합니다. ② FDA 메틸수은 1.0ppm 초과 시 즉시 부적합 처리(대형 빅아이 노출 위험). ③ 히스타민은 2024년 분해지표가 50→35ppm으로 강화돼 콜드체인이 깨지면 즉시 거부됩니다. 수산물은 FDA 수입거부 1위 식품군(전체의 20%+)입니다.",
        actionPlan: "이 관문은 진입장벽이자 동시에 해자(moat)입니다. ① 인수 듀딜리전스 시 타깃 가공·수출사의 FDA 수입거부 이력(OASIS)을 의무 점검 — 히스타민/분해 거부 이력은 콜드체인 자본지출 부족의 적신호입니다. ② SIMP 추적성 인프라를 갖춰 미국 수입자의 IFTP 의무를 대신 충족시키는 공급사는 록인되므로 프리미엄 멀티플로 평가하십시오.",
        source: "FDA Action Levels(메틸수은 1.0ppm) / FDA CPG Sec 540.525 Final(히스타민 35·200ppm, 2024-11-04 Federal Register) / NOAA SIMP Compliance Guide(2024)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {GATES.map((g, i) => (
              <div key={g.key} style={{
                background: `${g.color}0f`, border: `1px solid ${g.color}33`,
                borderLeft: `3px solid ${g.color}`, borderRadius: '10px', padding: '12px 12px 14px',
                display: 'flex', flexDirection: 'column', gap: '6px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: g.color, background: `${g.color}22`, padding: '1px 6px', borderRadius: '4px' }}>관문 {i + 1}</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#e2e8f0' }}>{g.key}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 800, color: g.color }}>{g.value}</span>
                  <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>{g.unit}</span>
                </div>
                <span style={{ fontSize: '0.64rem', color: '#94a3b8', lineHeight: 1.45 }}>{g.desc}</span>
              </div>
            ))}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px', padding: '10px 12px',
          }}>
            <span style={{ fontSize: '0.72rem', color: '#e2e8f0', fontWeight: 600 }}>🐟 수산물 = FDA 수입거부 식품군 1위</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f87171' }}>전체의 20%+ (히스타민·분해·이물 상위)</span>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#64748b', lineHeight: 1.5 }}>
            ※ SIMP 대상 5종: 빅아이·황다랑어·날개·가다랑어·참다랑어 (NOAA가 진정 참치류 확대 검토 中)
          </div>
        </div>
      }
    />
  );
}
