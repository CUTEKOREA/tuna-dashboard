'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── 미국 참치 수입 3중 규제 관문 (FDA·NOAA 1차 문서 기반, 2024-2026) ──
   검증: SIMP 24개월 보존(NOAA), 수은 1.0ppm(FDA Action Levels),
   히스타민 35/200ppm(FDA CPG 540.525, 2024-11-04 Federal Register 최종) */
const GATES = [
  { key: '수은(메틸수은)', value: '1.0', unit: 'ppm', color: '#ef4444',
    desc: '조치기준(action level) 초과 시 부적합(어덜터레이티드) 간주 대상. 대형 빅아이는 축적 위험 어종.' },
  { key: '히스타민', value: '35 / 200', unit: 'ppm', color: '#f59e0b',
    desc: '분해 조치기준 35ppm(2024년 50→35 강화) / 위해 조치기준 200ppm. 콜드체인 단절 시 거부 위험.' },
  { key: 'SIMP 추적성', value: '24', unit: '개월 보존', color: '#38bdf8',
    desc: '어획선박·어구·해역·일자 이력추적(체인오브커스터디) 24개월 보존. 수산물수입추적프로그램(IFTP) 수입자 의무.' },
];

export default function SasUsImportBarriers() {
  return (
    <WidgetCard
      id="W-SAS30"
      title="미국 참치 수입 규제 3중 관문"
      description="관세 아닌 비관세 장벽 - SIMP·수은·히스타민 컴플라이언스"
      pillar="S3"
      telemetry={{ status: 'STATIC', syncDate: '2024-11-04' }}
      cardDesc="FDA 잔류기준·히스타민 CPG 540.525(2024)·NOAA SIMP 추적성 가이드 기준 미국 진입 규제"
      takeaway={{
        situation: "미국향 사시미·스테이크 참치는 단일 관세가 아니라 3중 규제 관문을 통과해야 진입합니다. ① 수산물수입모니터링제도(SIMP) - 사시미급 참치 5종(빅아이·황다랑어·날개·가다랑어·참다랑어, 가다랑어는 통조림·로인 중심)이 이력추적 의무 대상으로 어획~수입 이력을 24개월 보존해야 합니다. ② FDA 메틸수은 1.0ppm은 조치기준(action level)으로, 초과 시 부적합(어덜터레이티드) 간주 대상입니다(대형 빅아이 노출 위험). ③ 히스타민은 2024년 분해 조치기준이 50→35ppm으로 강화돼 콜드체인이 깨지면 거부 위험이 큽니다. 수산물은 FDA 수입거부 1위 식품군으로, 미국 농무부 경제연구소(USDA ERS) 2005~2013년 분석 기준 전체 거부의 약 20%였습니다. 2013년 이후 연도별 절대치는 FDA 수입거부 데이터 대시보드(OASIS 기반)가 분기별로 공개하나 API 인증 차단으로 프로그램적 정량 추출이 막혀 미확정입니다.",
        actionPlan: "이 관문은 진입장벽이자 동시에 해자(垓字, moat)입니다. ① 인수 실사(듀딜리전스) 시 타깃 가공·수출사의 FDA 수입거부 이력(OASIS 시스템)을 의무 점검 - 히스타민·분해 거부 이력은 콜드체인 자본지출 부족의 적신호입니다. ② 수산물수입모니터링제도(SIMP) 이력추적 인프라를 갖춰 미국 수입자의 수산물수입추적프로그램(IFTP) 의무를 대신 충족시키는 공급사는 묶임(록인)되므로 프리미엄 배수(멀티플)로 평가하십시오.",
        source: "FDA Action Levels(메틸수은 1.0ppm 조치기준) / FDA CPG Sec 540.525 Final(히스타민 분해 35ppm·위해 200ppm 조치기준, 2024-11-04 Federal Register 2024-25315) / NOAA SIMP Compliance Guide(2024, 24개월=50 CFR §300.324(e)) / FDA 수입거부 약 20%·1위는 미국 농무부 경제연구소(USDA ERS) 'FDA Refusals of Imported Food Products by Country and Category, 2005-2013'(EIB-151, 2016-03) 기준. 2013년 이후 공식 1차는 FDA Import Refusals Data Dashboard(OASIS, datadashboard.fda.gov/oii/cd/imprefusals.htm)이나 API 인증 차단으로 연도별 정량 미확정",
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
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--w-slate-200)' }}>{g.key}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 800, color: g.color }}>{g.value}</span>
                  <span style={{ fontSize: '0.66rem', color: 'var(--w-slate-400)' }}>{g.unit}</span>
                </div>
                <span style={{ fontSize: '0.64rem', color: 'var(--w-slate-400)', lineHeight: 1.45 }}>{g.desc}</span>
              </div>
            ))}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
            background: 'rgba(var(--w-red-500-rgb), 0.06)', border: '1px solid rgba(var(--w-red-500-rgb), 0.2)',
            borderRadius: '8px', padding: '10px 12px',
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--w-slate-200)', fontWeight: 600 }}>수산물 = FDA 수입거부 1위 식품군</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f87171' }}>약 20% (USDA ERS 2005~2013·post-2013 미확정)</span>
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--w-slate-500)', lineHeight: 1.5 }}>
            ※ 수산물수입모니터링제도(SIMP) 대상 5종: 빅아이·황다랑어·날개·가다랑어·참다랑어 (NOAA가 진정 참치류 확대 검토 중)
          </div>
        </div>
      }
    />
  );
}
