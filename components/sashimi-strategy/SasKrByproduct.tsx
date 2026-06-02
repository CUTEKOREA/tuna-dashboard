'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';

/* ── 한국 참치 가공수율·부산물 밸류업 격차 (FAO·NIFS·Springer) ──
   검증: 통조림 가공수율 50~55%(살코기 ~40%), 부산물 40~45%(머리33·뼈16·내장8·혈액자숙액9),
   동원 창원 ~200톤/일, 세계 수산부산물 시장 $33.7B(2023)→$64.8B(2033E, FMI). */
const BAL = [
  { part: '살코기(제품)', pct: 55, color: '#10b981' },
  { part: '머리', pct: 15, color: '#f59e0b' },
  { part: '뼈', pct: 7, color: '#a78bfa' },
  { part: '내장·적육', pct: 12, color: '#ef4444' },
  { part: '혈액·자숙액', pct: 11, color: '#38bdf8' },
];

export default function SasKrByproduct() {
  return (
    <WidgetCard
      id="W-SAS50"
      title="한국 참치 가공수율 & 부산물 밸류업 격차"
      description="원물의 45%가 부산물 — 폐기 처리비 vs 소재 매출"
      pillar="S2"
      telemetry={{ status: 'STATIC', syncDate: '2023-24' }}
      cardDesc="통조림 가공수율·부산물 구성·밸류업 잠재 — FAO·NIFS·Springer ESPR 2023"
      takeaway={{
        situation: "한국 통조림 참치는 원물의 50~55%만 살코기로 제품화되고, 나머지 40~45%(머리 33%·뼈 16%·내장 8%·혈액·자숙액)는 대부분 사료·어분 등 저가 처분으로 빠집니다(일 300kg 초과 시 산업폐기물로 분류돼 처리비 발생). 동원은 자숙액→참치액(훈연추출물), 적육→펫푸드로 일부를 밸류업하고 머리·뼈의 펩타이드·콜라겐·어골칼슘 사업을 예고했으나, 세계 수산부산물 시장이 2033년 $64.8B로 추정되는 데 비해 한국 가공사는 부산물 회계·통계조차 부재해 회수율 격차의 잠재 마진이 가시화되지 않습니다.",
        actionPlan: "부산물 매스밸런스를 회계 단위로 전환하십시오. ① 톤당 부산물 스트림별(자숙액·머리·뼈·적육) 회수율·재처리 단가를 KPI화해 '폐기 처리비 → 소재 매출'로 P&L을 재분류하고, 가동률과 연동한 부산물 가치 회수율(value-recovery %)을 분기 지표로 신설하십시오. ② 자숙액(참치액)에 편중된 밸류업을 콜라겐·어골칼슘·펩타이드로 다변화해 카니발리제이션 리스크를 분산하고, 수산부산물 재활용촉진법(2022) 하의 산업폐기물 분류 회피를 ESG·원가 두 축으로 정량화하십시오.",
        source: "FAO Fish Canning Processing(가공수율 50~55%) / NIFS·KMI(부산물 40~45%) / Springer ESPR 2023(부산물 구성비) / FMI(세계 수산부산물 $33.7B→$64.8B)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>참치 원물 매스밸런스 (%) — 제품 55% vs 부산물 45%</div>
          <div style={{ height: '185px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={BAL} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="part" fontSize={9} tickLine={false} axisLine={false} stroke="#64748b" interval={0} angle={-10} textAnchor="end" height={40} />
                <YAxis domain={[0, 60]} tickFormatter={(v: number) => `${v}%`} fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#e2e8f0' }} formatter={(v: number) => [`${v}%`, '비중']} />
                <Bar dataKey="pct" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {BAL.map((d) => <Cell key={d.part} fill={d.color} />)}
                  <LabelList dataKey="pct" position="top" formatter={(v: number) => `${v}%`} fontSize={10.5} fill="#e2e8f0" />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#94a3b8' }}>
            세계 수산부산물 시장 <span style={{ color: '#10b981', fontWeight: 700 }}>$33.7B→$64.8B</span>(2033E) — 자숙액→참치액·콜라겐·어골칼슘 밸류업 여지
          </div>
        </div>
      }
    />
  );
}
