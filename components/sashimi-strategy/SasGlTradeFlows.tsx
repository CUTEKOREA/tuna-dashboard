'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';

/* ── 글로벌 참치 무역 흐름: 통조림 vs 비통조림 + 주요 수출국 (FAO-Globefish·UN Comtrade) ──
   검증(FAO Globefish 2024년 1~9월 누계): 세계 총교역 $118.6억/3.07백만t(물량 +20%·금액 +1.28%=물량주도, 對 2023년 동기),
   통조림 $65.0억/1.17M t(금액점유 54.8%·물량점유 38%), 비통조림 $53.6억(=총교역−통조림 파생값; 생물 6.57억+원어냉동 47.2억 구성은 업계 추정).
   ※기준기간 주의: 위 수치는 2024년 1~9월 누계임. 2024년 연간 확정치는 물량 +28%·금액 +3.32%(對 2023, FAO Globefish).
   HS160414 1위 태국 $2.5B·에콰도르 $1.41B·중국 $1.05B·스페인 $797M(UN Comtrade). */
const EXPORTERS = [
  { c: '🇹🇭 태국', v: 2.5, color: '#ef4444' },
  { c: '🇪🇨 에콰도르', v: 1.41, color: '#10b981' },
  { c: '🇨🇳 중국', v: 1.05, color: '#f59e0b' },
  { c: '🇪🇸 스페인', v: 0.80, color: '#a78bfa' },
];

export default function SasGlTradeFlows() {
  return (
    <WidgetCard
      id="W-SAS53"
      title="글로벌 참치 무역 흐름 — 통조림 vs 비통조림"
      description="세계 교역 $118.6억(2024년 1~9월 누계·물량 주도 회복) · 캔 수출 1위 태국"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2024-Q3-YTD' }}
      cardDesc="글로벌 참치 교역 규모·통조림/비통조림 분할·캔 수출국 순위 — FAO Globefish(2024년 1~9월 누계)·UN Comtrade(HS160414)"
      takeaway={{
        situation: "글로벌 참치 교역(2024년 1~9월 누계)은 금액 $118.6억·물량 3.07백만 톤으로, 對 2023년 동기 회복은 금액(+1.28%)이 아니라 물량(+20%) 주도입니다. 구성은 통조림·가공이 금액 $65.0억(금액점유 54.8%, 물량점유 38%)으로 가치 비중이 높고, 비통조림 약 $53.6억(생물 $6.57억 + 원어냉동 $47.2억, 원어냉동 물량 +32%)은 사시미/스테이크 원료 흐름입니다. 참고로 2024년 연간 확정치는 물량 +28%·금액 +3.32%로, 1~9월 누계보다 회복폭이 더 큽니다. 통조림 수출(HS160414)은 태국 $2.5B이 압도적 1위이며 에콰도르 $1.41B·중국 $1.05B·스페인 $797M이 뒤를 잇습니다.",
        actionPlan: "한국의 포지셔닝은 '통조림 레드오션 회피 + 비통조림 고부가 선점'입니다. ① 통조림은 태국($2.5B)이 압도하는 저마진 시장이므로 한국이 정면 경쟁할 곳이 아니며, ② 사시미/스테이크가 속한 비통조림(특히 원어냉동 +32% 성장)이 한국 원양의 차별화 영역입니다. 물량 주도 회복은 단가 압박을 의미하므로, 한국은 물량 경쟁이 아니라 어종·등급·추적성 프리미엄으로 비통조림 단가($47.2억 원어냉동 시장)를 방어해야 합니다.",
        source: "FAO Globefish 참치 시장 분석(Seafood Media 재게재, 2024년 1~9월 누계: 세계 교역 $118.6억·3.07M t·물량 +20%·금액 +1.28%·통조림 $65.0억; 비통조림 약 $53.6억은 총교역−통조림 파생값) / UN Comtrade(HS160414 캔 수출국: 태국 $2.5B·에콰도르 $1.41B·중국 $1.05B·스페인 $797M) — 통조림/비통조림 분할 외 분류별 1차 분해표 미공개, 비통조림 내 생물/원어냉동 구성은 업계 추정",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>통조림·가공</div>
              <div style={{ fontSize: '1.0rem', fontWeight: 800, color: '#f87171' }}>$65.0억</div>
              <div style={{ fontSize: '0.52rem', color: '#64748b' }}>금액 54.8% / 물량 38%</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>비통조림(사시미 원료)</div>
              <div style={{ fontSize: '1.0rem', fontWeight: 800, color: '#38bdf8' }}>$53.6억</div>
              <div style={{ fontSize: '0.52rem', color: '#64748b' }}>원어냉동 +32% 물량</div>
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>통조림(HS160414) 수출 1위국 ($B)</div>
          <div style={{ height: '150px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={EXPORTERS} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="c" fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" interval={0} />
                <YAxis domain={[0, 2.8]} tickFormatter={(v: number) => `$${v}B`} fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#e2e8f0' }} formatter={(v: number) => [`$${v}B`, '캔 수출']} />
                <Bar dataKey="v" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {EXPORTERS.map((d) => <Cell key={d.c} fill={d.color} />)}
                  <LabelList dataKey="v" position="top" formatter={(v: number) => `$${v}B`} fontSize={10} fill="#e2e8f0" />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
        </div>
      }
    />
  );
}
