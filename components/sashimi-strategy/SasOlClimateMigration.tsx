'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine, LabelList } from 'recharts';

/* ── 기후 어장 이동 정량: 가다랑어·황다랑어 동·극지 이동 (Bell 2021·FAO) ──
   검증(solid): 도서국 10개 SIDS 3종 자원 -13%(2050 RCP8.5, 범위 -5~-20%), 입어료 손실 -$90M(40~140M),
   EPO(동태평양) 공해 자원 +23.3%(673,129t, Frontiers 2022 Table 1), 도서국 EEZ 선망 -20%.
   정정: 동태평양 가다랑어 어획 +125%는 2050·+85%는 2100(2001-10 기준 RCP8.5), 출처 FAO Senina/Bell. */
const SHIFT = [
  { region: '도서국 EEZ 자원', pct: -13, color: '#ef4444' },
  { region: '도서국 선망 어획', pct: -20, color: '#f59e0b' },
  { region: '동태평양 공해 자원', pct: 23.3, color: '#10b981' },
];

export default function SasOlClimateMigration() {
  return (
    <WidgetCard
      id="W-SAS61"
      title="기후 어장 이동 — 가다랑어 동·극지 대이동"
      description="도서국 EEZ(배타적경제수역) 자원 -13%, 동태평양 공해 +23.3% (2050 RCP8.5 고배출)"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-06-05' }}
      cardDesc="해수온 상승에 따른 다랑어 어장 동향·도서국 입어료 충격 — Bell 2021·FAO·Frontiers"
      takeaway={{
        situation: "기후변화가 참치 어장 지도를 다시 그립니다. 해수온 상승으로 가다랑어·황다랑어가 따뜻한 서태평양에서 동·극지 공해로 이동하면서, 2050년(RCP8.5 고배출 시나리오) 도서국(10개 군소도서개발국, SIDS) 배타적경제수역(EEZ) 내 3종 다랑어 자원량은 -13%(범위 -5~-20%), 선망 어획량은 -20% 감소가 전망됩니다. 반대로 동태평양 공해(EPO) 자원량은 +23.3%(673,129톤, Frontiers 2022 Table 1) 증가하며 어획은 2050년 +125%(2001-10 대비)까지 늘 수 있습니다. 이 이동은 도서국에 연 -US$90M(범위 40~140M)의 입어료 수입 손실을 안기며, 공해 어업국의 비중을 키웁니다.",
        actionPlan: "어장 이동은 한국 원양의 조달 지정학을 바꿉니다. ① 가다랑어가 도서국 EEZ(입어료)에서 동태평양 공해(입어료 無)로 이동하면 장기적으로 입어료 부담이 줄지만, 공해 조업은 지역수산관리기구(RFMO) 규제·관할 불확실성이 커지므로 EEZ↔공해 조업 포트폴리오를 시나리오별로 재배분하십시오. ② 도서국 입어료 수입 급감(-$90M)은 도서국이 단기 입어료 인상으로 방어할 유인이 되므로, 어장이 빠지기 전 장기 입어계약을 락인하거나 동태평양 조업 역량을 선제 확보하십시오.",
        source: "Bell et al. 2021 Nature Sustainability(도서국 자원 -13%·입어료 손실 -$90M·선망 -20%, 2050 RCP8.5) / Frontiers Marine Science 2022(EPO 공해 자원 +23.3%) / FAO Senina·Bell(동태평양 어획 +125% 2050)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>2050 어장·자원 변화 (RCP8.5, %)</div>
          <div style={{ height: '175px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={SHIFT} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="region" fontSize={9} tickLine={false} axisLine={false} stroke="#64748b" interval={0} angle={-10} textAnchor="end" height={42} />
                <YAxis domain={[-30, 30]} tickFormatter={(v: number) => `${v}%`} fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#1a2442', color: '#e2e8f0' }} formatter={(v: number) => [`${v > 0 ? '+' : ''}${v}%`, '변화']} />
                <ReferenceLine y={0} stroke="#64748b" />
                <Bar dataKey="pct" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {SHIFT.map((d) => <Cell key={d.region} fill={d.color} />)}
                  <LabelList dataKey="pct" position="top" formatter={(v: number) => `${v > 0 ? '+' : ''}${v}%`} fontSize={10.5} fill="#e2e8f0" />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#94a3b8' }}>
            도서국 입어료 손실 <span style={{ color: '#ef4444', fontWeight: 700 }}>-$90M</span>/년 · 동태평양 공해 어획 +125%(2050) → 조달 지정학 이동
          </div>
        </div>
      }
    />
  );
}
