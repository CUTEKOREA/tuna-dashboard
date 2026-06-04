'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';

/* ── 영국 참치 채널 이원화: 캔 리테일 코어 vs 스시·투고 외식 ──
   검증(The Grocer·Restaurant Online·QSR Media·MSC): Itsu £175.9M(+9%)·그로서리 +20%,
   Wasabi £121.6M(세후이익 £7.43M→£1.86M, QSR Media/The Grocer), YO! £138.3M,
   캔=상온수산물 가치66%/물량71%(MSC 2023, 2022.6~2023.6).
   참치=연어 다음 2위 소비 수산물(MSC 2023 원문: "second only to salmon").
   자체브랜드 캔참치 100% MSC = Waitrose(2012~)·Sainsbury's(2023.5~) 2사
   (MSC 2023 원문상 Iceland·Tesco는 미달성: Tesco <10%, Iceland 0%).
   거시 MSC/FTA 집계는 SasUkMarket에 위임. */
const CHAINS = [
  { chain: 'Itsu 그룹', rev: 175.9, color: '#10b981' },
  { chain: 'YO! Sushi', rev: 138.3, color: '#38bdf8' },
  { chain: 'Wasabi', rev: 121.6, color: '#a78bfa' },
];

export default function SasUkChannelSplit() {
  return (
    <WidgetCard
      id="W-SAS36"
      title="영국 참치 채널 이원화 (캔 vs 스시·투고)"
      description="성숙 캔 리테일 코어 vs 고성장 스시·투고 외식축"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2024-12' }}
      cardDesc="영국 스시·투고 체인 매출 + 캔 채널 점유 — The Grocer·Restaurant Online·QSR Media·MSC(2023~2024)"
      takeaway={{
        situation: "영국에서 참치는 연어 다음으로 많이 소비되는 2위 수산물(MSC 2023 원문: \"second only to salmon\")로, 두 채널로 갈립니다. ① 캔 리테일 코어 — 상온 수산물 가치의 66%·물량의 71%(MSC 2022.6~2023.6 기준)를 점유하는 성숙 시장입니다. 자체브랜드 캔참치 100% MSC를 달성한 곳은 Waitrose(2012~)·Sainsbury's(2023.5~) 2사뿐이며(MSC 2023 기준), 나머지 대형 리테일러는 미달성 상태로 PB MSC화가 차별화 변수입니다. ② 스시·투고 외식 성장축 — Itsu(그룹 £175.9M, +9%)·YO! Sushi(£138.3M)·Wasabi(£121.6M)가 주도하며, 특히 Itsu 그로서리가 +20%(£57M)로 외식-소매 경계를 허뭅니다. 단 Wasabi 세후이익이 £7.43M→£1.86M로 급감(FY2024, QSR Media·The Grocer)하는 등 외식 수익성 변동성은 큽니다.",
        actionPlan: "공급 전략을 채널별로 이원화하십시오. ① 리테일 캔은 PB·MSC가 포화된 가격 경쟁 시장이므로, FTA 무관세 우위를 리테일러 PB 원료·완제품 OEM 입찰로 좁혀 진입 — 브랜드 신설보다 PB 공급이 현실적입니다. ② 고성장·고마진은 스시·투고 채널이므로, Itsu·Wasabi·YO! 및 이들의 그로서리 라인에 스시그레이드 냉동 로인·사시미를 B2B 식자재로 직공급하는 것을 1순위로 검토하십시오. 자원은 외식·투고 쪽에 배분하고 리테일은 선별적 PB로 한정하십시오.",
        source: "The Grocer·Insider Media(Itsu £175.9M·그로서리 +20%) / Restaurant Online·QSR Media·The Grocer(Wasabi £121.6M·세후이익 £7.43M→£1.86M) / MSC UK Tuna Shopper Report 2023(캔 66%/71%·참치 연어 다음 2위·자체브랜드 100% MSC는 Waitrose·Sainsbury's 2사)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ height: '180px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={CHAINS} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="chain" fontSize={11} tickLine={false} axisLine={false} stroke="#64748b" interval={0} />
                <YAxis domain={[0, 200]} tickFormatter={(v: number) => `£${v}M`} fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#e2e8f0' }}
                  formatter={(v: number) => [`£${v}M`, '연매출']}
                />
                <Bar dataKey="rev" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {CHAINS.map((d) => <Cell key={d.chain} fill={d.color} />)}
                  <LabelList dataKey="rev" position="top" formatter={(v: number) => `£${v}M`} fontSize={10.5} fill="#e2e8f0" />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { k: '캔 = 상온수산물', v: '66% / 71%', s: '가치/물량 점유', c: '#f59e0b' },
              { k: 'Itsu 그로서리', v: '+20%', s: '£57M·크로스오버', c: '#10b981' },
              { k: '자체브랜드 100% MSC', v: '2사', s: "Waitrose·Sainsbury's", c: '#38bdf8' },
            ].map((x) => (
              <div key={x.k} style={{ background: `${x.c}0f`, border: `1px solid ${x.c}2e`, borderRadius: '8px', padding: '8px 9px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.58rem', color: '#94a3b8' }}>{x.k}</span>
                <span style={{ fontSize: '1.0rem', fontWeight: 800, color: x.c }}>{x.v}</span>
                <span style={{ fontSize: '0.54rem', color: '#64748b' }}>{x.s}</span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
