'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';

/* ── 한국 원양 태평양 입어료(VDS)·도서국 협상력 (PNA 1차) ──
   검증(solid): VDS 최저기준 $8,000/day(현물 $12~14K), 한국 WCPO 활성 선망 22·연승 94(ISC25 2024),
   선망 highliner 1만+mt/척, 키리바시 입어료 정부수입 70%+ 의존, PNA 8국 연 입어수입 약 $5억. */
const VDS = [
  { stage: '출발가(2012)', usd: 5000, color: '#64748b' },
  { stage: '최저기준', usd: 8000, color: '#38bdf8' },
  { stage: '현물(수요초과)', usd: 13000, color: '#ef4444' },
];

export default function SasKrAccessQuota() {
  return (
    <WidgetCard
      id="W-SAS49"
      title="한국 원양 태평양 입어료(VDS) 압박"
      description="조업일 단가 $8천→현물 $13천 — 도서국 협상력에 묶인 변동비"
      pillar="S1"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      cardDesc="PNA 조업일제도(VDS) 단가·한국 WCPO 선단·도서국 입어 의존 — PNA 공식·ISC25"
      takeaway={{
        situation: "한국은 WCPO 가다랑어·황다랑어를 사실상 PNA 8개 도서국 EEZ에 의존합니다(활성 선망 22척·연승 94척, 선망 어획의 ~97%가 가다랑어). 그런데 입어권은 어획량이 아니라 VDS '조업일' 단가로 가격결정됩니다 — 최저기준가가 출발기 대비 $8,000/day로 올랐고 수요초과로 현물은 $12,000~14,000까지 거래됩니다. 키리바시처럼 정부수입의 70%+를 입어료에 의존하는 도서국이 협상력 우위로 매년 인상을 요구해, 한국 원양 선망의 변동비를 구조적으로 압박합니다(PNA 8국 연 입어수입 약 $5억).",
        actionPlan: "원물의 '입어료 사다리' 리스크를 손익에 명시적으로 반영하십시오. ① VDS 조업일 단가가 $8,000→$13,000대로 재가격될 경우 척당 변동비 민감도를 시나리오화하고, ② 단일 도서국 의존을 낮추기 위해 PNA 내 조업일 다변화·장기 입어계약 락인으로 단가 변동을 헤지하며, ③ 어획쿼터가 아닌 '일수' 제약 구조이므로 척당 어획효율(CPUE) 제고가 곧 단위원가 방어 레버임을 자본배분 우선순위로 두십시오.",
        source: "PNA 공식(VDS 최저기준 $8,000/day) / ISC25 Korea National Report(활성 선망 22·연승 94, 2024) / FFA·World Bank(키리바시 입어료 정부수입 70%+·PNA 8국 약 $5억)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>PNA VDS 조업일 단가 사다리 ($/day)</div>
          <div style={{ height: '180px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={VDS} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="stage" fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" interval={0} />
                <YAxis domain={[0, 15000]} tickFormatter={(v: number) => `$${(v / 1000)}k`} fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#e2e8f0' }} formatter={(v: number) => [`$${v.toLocaleString()}/day`, 'VDS']} />
                <Bar dataKey="usd" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {VDS.map((d) => <Cell key={d.stage} fill={d.color} />)}
                  <LabelList dataKey="usd" position="top" formatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} fontSize={10.5} fill="#e2e8f0" />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', fontSize: '0.62rem', color: '#94a3b8', flexWrap: 'wrap' }}>
            <span>한국 WCPO 선망 <span style={{ color: '#38bdf8', fontWeight: 700 }}>22척</span>(highliner 1만+mt/척)</span>
            <span>키리바시 입어료 의존 <span style={{ color: '#ef4444', fontWeight: 700 }}>70%+</span></span>
          </div>
        </div>
      }
    />
  );
}
