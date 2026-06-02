'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── 중국 참치 수요 부상 (IndexBox·SeafoodSource) ──
   검증(solid): 중국 냉동/신선 가다랑어 소비 15.1만t(+298%)·수입 +522%(13만t·$185M·한국 3.5만t),
   몰타 양식 BFT 2023 18,624t·€1.67억(일본 95%→중국 다변화 MOU 2023.11), 중국 일식당 ~8만개(10년전 1만).
   정정: 폭증의 대부분은 저가 냉동 가다랑어(가공·통조림급), 프리미엄 사시미는 일부. */
const STAT = [
  { label: '가다랑어 수입 증가율', value: '+522%', sub: '13만t·$185M(한국 3.5만t 공급)', color: '#ef4444' },
  { label: '가다랑어 소비 증가', value: '+298%', sub: '15.1만t — 단 저가 냉동 주도', color: '#f59e0b' },
  { label: '중국 일식당 수', value: '약 8만개', sub: '10년 전 약 1만 → 8배', color: '#10b981' },
  { label: '몰타 양식 BFT(2023)', value: '€1.67억', sub: '18,624t · 일본 95%→중국 다변화 MOU', color: '#38bdf8' },
];

export default function SasGlChinaDemand() {
  return (
    <WidgetCard
      id="W-SAS52"
      title="중국 참치 수요 부상 — 일본 의존 탈피 다변화 대상"
      description="가다랑어 수입 +522%·일식당 8배 — 단 폭증은 저가 냉동 주도"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      cardDesc="중국 참치 수입·소비 급증·일식당 확산 — IndexBox·SeafoodSource·업계 자료"
      takeaway={{
        situation: "중국이 글로벌 참치 수요의 신흥 축으로 부상했습니다. 냉동/신선 가다랑어 수입이 +522%(13만 톤·$185M, 한국이 3.5만 톤 공급), 소비가 +298%(15.1만 톤) 급증했고, 일식당이 10년 전 약 1만 개에서 약 8만 개로 8배 늘었습니다. 다만 폭증분의 대부분은 저가 냉동 가다랑어(가공·통조림급)로 수량 증가율(+300~520%)이 금액 증가율을 크게 상회 — 프리미엄 사시미는 아직 일부입니다. 동시에 중국은 지중해 블루핀(몰타 양식 2023년 18,624톤·€1.67억)이 일본 의존(95%)을 탈피하려는 다변화 대상(2023.11 MOU)으로 부상했습니다.",
        actionPlan: "중국을 '단일 시장'이 아니라 '두 시장'으로 보십시오. ① 대량 저가 냉동 가다랑어는 한국 원양이 이미 공급 중인 레드오션이므로 단가가 아닌 추적성·안정공급으로 방어하고, ② 빠르게 형성되는 일식당 8만 개 채널의 프리미엄 사시미(블루핀·고급 황다랑어) 수요는 일본·지중해가 선점하기 전 한국이 진입할 고마진 창구입니다. 중국의 일본 탈피 다변화 흐름(몰타 MOU)에 한국산 사시미급을 끼워넣는 B2B 외식 직공급을 우선 검토하십시오.",
        source: "IndexBox(중국 가다랑어 수입 +522%·13만t·$185M·한국 3.5만t) / SeafoodSource·MaltaToday(몰타 BFT 2023 18,624t·€1.67억·중국 MOU) / 업계 자료(중국 일식당 ~8만개)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '9px' }}>
            {STAT.map((s) => (
              <div key={s.label} style={{ background: `${s.color}0f`, border: `1px solid ${s.color}2e`, borderRadius: '10px', padding: '11px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{s.label}</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: '0.55rem', color: '#64748b' }}>{s.sub}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.62rem', color: '#64748b', lineHeight: 1.5, textAlign: 'center' }}>
            ⚠ 수량 급증 ≫ 금액 급증 = 저가 냉동 주도 · 프리미엄 사시미(일식당 8만개)는 고마진 진입 창구
          </div>
        </div>
      }
    />
  );
}
