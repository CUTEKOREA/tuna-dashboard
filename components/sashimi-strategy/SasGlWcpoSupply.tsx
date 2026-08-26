'use client';

import React from 'react';
import * as chartFmt from '../../lib/chartFormatters';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';

/* ── 글로벌 참치 공급: WCPO 어획·어종구성 (SPC/WCPFC 1차) ──
   단일 권위 1차로 일원화: WCPFC SC21-2025 ST-GN-01(2025-08) — WCPO 총어획 3,059,005t(사상 최대),
   가다랑어 2,108천t(69%)·황다랑어 678천t(22%)·눈다랑어 119천t(4%)·날개다랑어 약120천t(4%).
   막대 4개 톤수 합 = 3,059천t(명시 총계와 일치), pct 합 = 100%.
   '날개·기타'(154천t·5%)는 날개다랑어(약120천t)+기타 어종(잔차 약34천t) 합산 잔차 막대.
   WCPO 글로벌 비중 ~52%(2023), 선망 70%·연승 8%. */
const SPECIES = [
  { sp: '가다랑어', t: 2108, pct: 69, color: '#38bdf8' },
  { sp: '황다랑어', t: 678, pct: 22, color: '#10b981' },
  { sp: '눈다랑어', t: 119, pct: 4, color: '#a78bfa' },
  { sp: '날개·기타', t: 154, pct: 5, color: '#64748b' },
];

export default function SasGlWcpoSupply() {
  return (
    <WidgetCard
      id="W-SAS51"
      title="글로벌 참치 공급 - WCPO 사상 최대 어획"
      description="2024 WCPO 3,059천t(세계 52%) · 가다랑어 69% 집중"
      pillar="S1"
      telemetry={{ status: 'STATIC', syncDate: '2025-08' }}
      cardDesc="중서부태평양(WCPO) 참치 어획량·어종구성 - WCPFC SC21-2025 ST-GN-01"
      takeaway={{
        situation: "세계 참치 공급의 절반(2023년 약 52%)을 책임지는 중서부태평양(WCPO)은 2024년 어획량이 3,059천 톤으로 사상 최대(전년比 +15%)를 기록했습니다. 이 중 가다랑어가 2,108천 톤으로 역대 최고(총량의 69%)를 차지하며, 어법별로는 선망이 70%, 연승 8%입니다. 즉 글로벌 참치 원료가는 사실상 WCPO 가다랑어 선망 어획 동향에 의해 결정되며, 2024년 풍어가 원료가 하방 압력으로 작용했습니다.",
        actionPlan: "원료 조달은 WCPO 가다랑어 사이클을 핵심 신호로 추적하십시오. ① 2024년 사상 최대 어획은 단기 원료가 하방이나, 엘니뇨/라니냐에 따라 어장이 동·서로 이동하면 어획효율과 가격이 급변하므로 풍어기 저가 원물을 -60℃ 비축으로 락인하는 카운터-사이클 조달이 유효합니다. ② 가다랑어 69% 집중은 사시미급(황다랑어·눈다랑어 26%) 원료의 상대적 희소성을 의미 - 사시미 라인은 풍어와 무관하게 어종 프리미엄이 유지되므로 어종별 조달 전략을 분리하십시오.",
        source: "WCPFC SC21-2025, ST-GN-01(2025-08)(WCPO 2024 어획 3,059천t·가다랑어 2,108천t 69%·황다랑어 678천t 22%·선망 70%) / SPC·FFA(WCPO 글로벌 비중 52%, 2023)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ fontSize: '0.66rem', color: 'var(--w-slate-400)', fontWeight: 600, textAlign: 'center' }}>WCPO 2024 어종별 어획 (천 톤) - 총 3,059천t</div>
          <div style={{ height: '185px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={SPECIES} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="sp" fontSize={10} tickLine={false} axisLine={false} stroke="var(--w-slate-500)" interval={0} />
                <YAxis domain={[0, 2200]} tickFormatter={(v: unknown) => `${(chartFmt.toChartNumber(v) / 1000).toFixed(1)}M`} fontSize={10} tickLine={false} axisLine={false} stroke="var(--w-slate-500)" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--w-navy-900)', color: 'var(--w-slate-200)' }} formatter={(v: unknown, _n: unknown, p: any) => [`${chartFmt.formatChartNumber(v)}천t (${p.payload.pct}%)`, '어획']} />
                <Bar dataKey="t" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {SPECIES.map((d) => <Cell key={d.sp} fill={d.color} />)}
                  <LabelList dataKey="pct" position="top" formatter={(v: unknown) => `${v}%`} fontSize={10.5} fill="var(--w-slate-200)" />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: 'var(--w-slate-400)' }}>
            선망 <span style={{ color: 'var(--w-sky-400)', fontWeight: 700 }}>70%</span> · 2024 사상 최대(+15%) → 원료가 하방 · 엘니뇨/라니냐 어장 이동 주의
          </div>
        </div>
      }
    />
  );
}
