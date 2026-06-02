'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

/* ── EU/UK MSC 지속가능 라벨 = 사실상 진입요건 (SasTraceabilityRatings와 차별: 리테일러 게이트) ──
   검증(solid): MSC 인증 어획 310만t(자연산 참치 절반·182개 어업), 블루라벨 참치 40만t+(+39% YoY),
   英소매 참치 MSC 라벨 49%(2021 18%↑), 100% MSC 전환 리테일러 다수.
   ※인지율 47% KPI는 영국 한정 오귀속이라 제외. */
const MSC_GROWTH = [
  { yr: '2021', vol: 18 }, { yr: '2023', vol: 30 }, { yr: '2024', vol: 40 },
];

export default function SasEuMscGate() {
  return (
    <WidgetCard
      id="W-SAS44"
      title="EU·영국 MSC 지속가능 라벨 게이트"
      description="리테일러 100% MSC 전환 — 인증이 사실상 진입요건"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="MSC 인증 참치 점유·블루라벨 성장·리테일러 100% MSC — MSC·The Grocer 1차"
      takeaway={{
        situation: "유럽·영국 소매에서 MSC 인증은 마케팅이 아니라 진입요건이 됐습니다. MSC 인증 어업의 어획은 310만 톤으로 자연산 참치 어획의 절반 이상(182개 어업)을 차지하고, 블루라벨 참치 판매량은 연 40만 톤+(+39% YoY)으로 급증했습니다. 영국 소매 참치 제품의 MSC 라벨 비중은 2021년 18%에서 49%로 올랐고, Sainsbury's·Waitrose·Tesco·Iceland 등 대형 리테일러가 자체브랜드 참치 100% MSC 전환을 선언했습니다. 즉 MSC 미인증 물량은 주류 EU·영국 소매 진열대에서 사실상 배제됩니다.",
        actionPlan: "MSC는 '있으면 좋은' 것이 아니라 '없으면 못 들어가는' 게이트입니다. ① 한국 원양 어업의 MSC 인증(또는 개선프로젝트 FIP) 보유 물량을 EU·영국향 사시미/캔 라인의 우선 배분 대상으로 삼고, 미인증 물량은 일본·아시아 등 비(非)MSC 시장으로 라우팅하는 인증-시장 매칭 전략을 쓰십시오. ② 인수 듀딜리전스 시 타깃의 MSC 인증 어장 접근권을 핵심 자산으로 평가 — 리테일러 100% MSC 추세가 굳어질수록 인증 물량의 희소가치가 상승합니다.",
        source: "MSC 보도자료(인증 어획 310만t·자연산 참치 절반·182개 어업) / MSC·The Grocer·SeafoodSource(블루라벨 참치 40만t+·+39%) / MSC UK Tuna Shopper Report(영국 소매 MSC 49%)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>영국 소매 참치 MSC 라벨 비중 추이 (%)</div>
          <div style={{ height: '150px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={MSC_GROWTH} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="yr" fontSize={11} tickLine={false} axisLine={false} stroke="#64748b" />
                <YAxis domain={[0, 55]} tickFormatter={(v: number) => `${v}%`} fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#e2e8f0' }} formatter={(v: number) => [`${v}%`, 'MSC 라벨']} />
                <Bar dataKey="vol" radius={[4, 4, 0, 0]} fill="#10b981" isAnimationActive={false} />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { k: 'MSC 인증 어획', v: '310만t', s: '자연산 참치 절반', c: '#38bdf8' },
              { k: '블루라벨 참치', v: '+39%', s: '연 40만t+ YoY', c: '#10b981' },
              { k: '100% MSC 전환', v: '대형 4사+', s: 'Tesco·Sainsbury 등', c: '#f59e0b' },
            ].map((x) => (
              <div key={x.k} style={{ background: `${x.c}0f`, border: `1px solid ${x.c}2e`, borderRadius: '8px', padding: '8px 9px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.56rem', color: '#94a3b8' }}>{x.k}</span>
                <span style={{ fontSize: '1.0rem', fontWeight: 800, color: x.c }}>{x.v}</span>
                <span style={{ fontSize: '0.52rem', color: '#64748b' }}>{x.s}</span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
