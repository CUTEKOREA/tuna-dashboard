'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';

/* ── 미국 냉동 사시미급 참치 유통 단계별 단가($/kg) ──
   검증: 원물 라운드 ~$2.5/kg(Tridge farmgate), CIF 로인 $7~12(Selina Wamucii),
   도매 사쿠 $11.28(기존 SasSupplyChainSplit과 정합), 외식 수율보정 1.7~2.2배(KitchenCost).
   디스트리뷰터 단가는 소매 게시가 기준 근사 — STATIC. */
const LADDER = [
  { stage: '원물 라운드', price: 2.5, color: '#64748b' },
  { stage: '수입 CIF 로인', price: 8, color: '#38bdf8' },
  { stage: '도매 사쿠블록', price: 12, color: '#10b981' },
  { stage: '디스트리뷰터', price: 17, color: '#a78bfa' },
  { stage: '외식 식자재(수율보정)', price: 28, color: '#f59e0b' },
];

export default function SasUsMarginWaterfall() {
  return (
    <WidgetCard
      id="W-SAS32"
      title="미국 참치 마진 워터폴 ($/kg)"
      description="원물→수입→도매→외식 단계별 누적 마크업 (냉동 사시미 체인)"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="냉동 사시미급 참치 단계별 단가($/kg) — Tridge·Selina Wamucii 도매 + 외식 수율보정 추정"
      takeaway={{
        situation: "미국 냉동 사시미급 참치는 원물 라운드 ~$2.5/kg에서 수입 CIF 로인 ~$8, 도매 사쿠블록 ~$12, 디스트리뷰터 ~$17을 거쳐 외식 식자재 환산가(수율 45~60%·식자재율 28~32% 보정) ~$28/kg까지 약 11배로 누적됩니다. 마진의 대부분은 가공(로인→사쿠)과 외식 단계의 수율 손실 보정에서 발생하며, 외식 메뉴가는 트림 수율 때문에 도매가의 1.7~2.2배로 재계산됩니다. 디스트리뷰터 단가는 소매 게시가 기준 근사치입니다.",
        actionPlan: "① 최대 마진 구간은 '수입 로인 → 도매 사쿠' 가공 단계 — 한국 공장이 -60℃ 사쿠 가공·재포장을 내재화해 디스트리뷰터를 건너뛰는 직공급(D2C·외식 직거래)으로 중간 마크업 $5~9/kg을 흡수하십시오. ② 외식 환산가의 1.7~2.2배 수율 배율은 트림 손실에서 오므로, 균일 사쿠 규격·블록화로 수율을 높이면 외식 고객의 실질 원가를 낮춰 점유를 늘릴 수 있습니다.",
        source: "Tridge 글로벌 farmgate/도매 옐로핀 · Selina Wamucii 벌크 수입가 · KitchenCost 스시 수율(46~55%) · 외식 식자재율 28~32% (단계별 추정 결합)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ height: '235px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={LADDER} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="stage" fontSize={9.5} tickLine={false} axisLine={false} stroke="#64748b" interval={0} angle={-12} textAnchor="end" height={48} />
                <YAxis domain={[0, 32]} tickFormatter={(v: number) => `$${v}`} fontSize={11} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#e2e8f0' }}
                  formatter={(v: number) => [`$${v}/kg`, '단가']}
                />
                <Bar dataKey="price" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {LADDER.map((d) => <Cell key={d.stage} fill={d.color} />)}
                  <LabelList dataKey="price" position="top" formatter={(v: number) => `$${v}`} fontSize={10.5} fill="#e2e8f0" />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.66rem', color: '#94a3b8' }}>
            원물 → 외식 약 <span style={{ color: '#f59e0b', fontWeight: 700 }}>11배</span> 누적 · 최대 마진 = 가공(로인→사쿠) + 외식 수율보정
          </div>
        </div>
      }
    />
  );
}
