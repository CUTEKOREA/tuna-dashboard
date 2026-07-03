'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';

/* ── 태국 원료조달 + EU 관세후 경쟁력 (미국 축은 SasUsTariffLadder/CompetitorMap에 위임) ──
   검증: 원료 수입의존 50.5%(2021 기준, Krungsri/Yamada-Spire/USDA FAS 산업분석), 가다랑어 수입 $1,013.5M·670.4천t(+38.7%, IndexBox 2024),
   EU 캔참치 24% MFN(2015 GSP 상실) vs 에콰도르 0%(EU 무역협정 경유). */
const EU_TARIFF = [
  { origin: '태국', rate: 24, note: 'GSP(일반특혜관세) 상실(2015)', color: '#ef4444' },
  { origin: '베트남', rate: 0, note: 'EVFTA(EU·베트남 FTA) 쿼터 무관세', color: '#38bdf8' },
  { origin: '에콰도르', rate: 0, note: 'EU 무역협정', color: '#10b981' },
];

export default function SasThaiSourcing() {
  return (
    <WidgetCard
      id="W-SAS37"
      title="태국 원료조달 & EU 관세 핸디캡"
      description="원료 절반을 수입 의존 + EU 24% 관세로 에콰도르에 추격"
      pillar="S1"
      telemetry={{ status: 'STATIC', syncDate: '2024-06-04' }}
      cardDesc="태국 가공 허브의 원료 수입 의존·EU 관세 경쟁력 — 의존도 50.5%는 2021 산업분석(Krungsri·USDA FAS)·가다랑어는 IndexBox 2024·EU 관세"
      takeaway={{
        situation: "태국은 세계 최대 가공 허브이나 원료의 절반(2021년 수산 투입 50.5%)을 수입에 의존하며, 2024년 냉동 가다랑어 수입만 $1,013.5M·670.4천톤(물량 +38.7% YoY)에 달합니다. 핵심 약점은 EU 시장 관세입니다 — 2015년 GSP 특혜 철회로 EU 캔참치에 24% MFN 관세를 부담하는 반면, 경쟁국 에콰도르는 EU 무역협정으로 0%, 베트남은 EVFTA 쿼터로 무관세입니다. 저원가 가공 우위가 EU 관세 24%p 핸디캡에 상쇄되며 에콰도르·베트남에 추격당하는 구조입니다.",
        actionPlan: "태국의 EU 관세 열위는 한국 원료 공급자에게 양면적입니다. ① 태국이 EU향 경쟁력 회복을 위해 원료 단가를 압박할수록, 한국 원양(가다랑어) 공급의 가격 협상력은 약화 — 태국 단일 고객 의존도를 낮추고 EU·일본 직판 비중을 높이는 다변화가 필요합니다. ② 동시에 태국의 EU 관세 핸디캡은 한국 완제품(한-EU FTA 활용)의 EU 직수출 기회 — 태국 가공 우회 경로의 매력도가 상승합니다. 태국 원료공급과 한국 완제품 직수출의 균형을 재설계하십시오.",
        source: "IndexBox Thailand Frozen Skipjack 2024($1,013.5M·670.4천t) / Krungsri·Yamada-Spire·USDA FAS 태국 가공수산 산업분석 2021(수입의존 50.5%) / EU 관세(태국 24% MFN·에콰도르·베트남 0%)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>EU 캔참치 수입 관세 — 태국의 24%p 핸디캡</div>
          <div style={{ height: '160px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={EU_TARIFF} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="origin" fontSize={11} tickLine={false} axisLine={false} stroke="#64748b" interval={0} />
                <YAxis domain={[0, 28]} tickFormatter={(v: unknown) => `${v}%`} fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', background: '#1a2442', color: '#e2e8f0' }}
                  formatter={(v: unknown, _n: unknown, p: any) => [`${v}% · ${p.payload.note}`, 'EU 관세']}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {EU_TARIFF.map((d) => <Cell key={d.origin} fill={d.color} />)}
                  <LabelList dataKey="rate" position="top" formatter={(v: unknown) => `${v}%`} fontSize={11} fill="#e2e8f0" />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { k: '원료 수입 의존도', v: '50.5%', s: '2021 기준 · 국내 어획만으로 가공 불충족', c: '#f59e0b' },
              { k: '가다랑어 수입(2024)', v: '$1.01B', s: '670천톤 · 물량 +38.7% YoY', c: '#38bdf8' },
            ].map((x) => (
              <div key={x.k} style={{ background: `${x.c}0f`, border: `1px solid ${x.c}2e`, borderRadius: '8px', padding: '9px 11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{x.k}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: x.c }}>{x.v}</span>
                <span style={{ fontSize: '0.56rem', color: '#64748b' }}>{x.s}</span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
