'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

/* ── EU/UK MSC 지속가능 라벨 = 사실상 진입요건 (SasTraceabilityRatings와 차별: 리테일러 게이트) ──
   검증(solid): MSC 인증 어획 305만t(자연산 참치 절반·182개 어업),
   英소매 참치 MSC 라벨 49%(2026.2 측정, 364개 중 180개) ← 18%(2021.10, 342개 중 62개).
   출처: MSC UK Tuna Shopper Report 2026(3rd ed., 2026-05 발행) — 2021·2026 양 끝점만 1차 확인.
   ※[Round2 정합] 인증 어획 참치 305만t로 통일 — 형제 위젯 MscEcolabelRegistryScale(참치 305만 MT)과 일치 (구 310만t는 미reconcile 격차).
   ※[Round2 검증] 2023=30%는 측정값 아닌 추정 — isEstimate 플래그로 차트에 흐림·점선·각주 노출(2021·2026만 1차 측정).
   ※[Round2 검증] '블루라벨 참치 40만t+·+39%'는 The Grocer·SeafoodSource 2차 무역지 귀속이며, 1차 형제 MscProductVolumeGrowth는 전어종 합산(2024-25 total 138.5만t·canned 33.5만t)만 추적·참치한정 40만t/+39% 미수록 → 1차 독립 입증 실패, 헷지 표기.
   ※49% 추세는 MSC UK Tuna Shopper Report 단일 출처계열 의존(EUMOFA·리테일 감사 외부 삼각검증 부재 — 양 끝점만 1차 확정).
   ※인지율 47% KPI는 영국 한정 오귀속이라 제외. */
const MSC_GROWTH = [
  { yr: '2021', vol: 18, isEstimate: false },
  { yr: '2023', vol: 30, isEstimate: true },
  { yr: '2026', vol: 49, isEstimate: false },
];

export default function SasEuMscGate() {
  return (
    <WidgetCard
      id="W-SAS44"
      title="EU·영국 MSC 지속가능 라벨 게이트"
      description="리테일러 100% MSC 전환 - 인증이 사실상 진입요건"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2026-05' }}
      cardDesc="MSC 인증 참치 점유·리테일러 100% MSC - MSC UK 참치 쇼퍼 리포트 2026 1차(49%는 2026.2 측정·2023은 추정)"
      takeaway={{
        situation: "유럽·영국 소매에서 MSC 인증은 마케팅이 아니라 진입요건이 됐습니다. MSC 인증 어업의 참치 어획은 305만 톤으로 자연산 참치 어획의 절반 이상(182개 어업)을 차지합니다. 영국 소매 참치 제품의 MSC 라벨 비중은 2021년 10월 18%에서 2026년 2월 49%(364개 중 180개)로 올랐고(2021·2026만 1차 측정·2023은 추정), 세인즈버리스(Sainsbury\'s)·웨이트로즈(Waitrose)·테스코(Tesco)·아이슬란드(Iceland) 등 대형 소매사가 자체브랜드 참치 100% MSC 전환을 선언했습니다. 블루라벨 참치 판매량을 연 40만 톤+(전년 대비 +39%)로 보는 추정도 있으나, 이는 무역지(더그로서·시푸드소스) 2차 보도로 1차 통계상 참치 한정 수치는 미확인입니다. 즉 MSC 미인증 물량은 주류 EU·영국 소매 진열대에서 사실상 배제됩니다.",
        actionPlan: "MSC는 '있으면 좋은' 것이 아니라 '없으면 못 들어가는' 게이트입니다. ① 한국 원양 어업의 MSC 인증(또는 어업개선프로젝트, FIP) 보유 물량을 EU·영국향 사시미/캔 라인의 우선 배분 대상으로 삼고, 미인증 물량은 일본·아시아 등 비(非)MSC 시장으로 라우팅하는 인증-시장 매칭 전략을 쓰십시오. ② 인수 듀딜리전스 시 타깃의 MSC 인증 어장 접근권을 핵심 자산으로 평가 - 리테일러 100% MSC 추세가 굳어질수록 인증 물량의 희소가치가 상승합니다.",
        source: "MSC 보도자료·MscEcolabelRegistryScale 정합(인증 참치 어획 305만t·자연산 참치 절반·182개 어업) / 더그로서(The Grocer)·시푸드소스(SeafoodSource) 2차 무역지(블루라벨 참치 40만t+·+39% - 1차 통계상 참치 한정 수치 미확인, 추정) / MSC UK 참치 쇼퍼 리포트 2026(3판, 2026-05 발행 - 영국 소매 MSC 라벨 49%, 2026년 2월 측정·2021년 10월 18% 대비, 단일 출처계열 의존·외부 삼각검증 부재로 2023 중간값은 추정)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ fontSize: '0.66rem', color: 'var(--w-slate-400)', fontWeight: 600, textAlign: 'center' }}>영국 소매 참치 MSC 라벨 비중 추이 (%)</div>
          <div style={{ height: '150px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={MSC_GROWTH} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="yr" fontSize={11} tickLine={false} axisLine={false} stroke="var(--w-slate-500)" />
                <YAxis domain={[0, 55]} tickFormatter={(v: number) => `${v}%`} fontSize={10} tickLine={false} axisLine={false} stroke="var(--w-slate-500)" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--w-navy-900)', color: 'var(--w-slate-200)' }} formatter={((v: number, _n: string, item: { payload?: { isEstimate?: boolean } }) => [`${v}%${item?.payload?.isEstimate ? ' (추정·1차 미확인)' : ''}`, 'MSC 라벨']) as never} />
                <Bar dataKey="vol" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {MSC_GROWTH.map((d) => (
                    <Cell
                      key={d.yr}
                      fill={d.isEstimate ? '#10b98155' : 'var(--w-emerald-500)'}
                      stroke={d.isEstimate ? 'var(--w-emerald-500)' : undefined}
                      strokeWidth={d.isEstimate ? 1 : 0}
                      strokeDasharray={d.isEstimate ? '3 2' : undefined}
                    />
                  ))}
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ fontSize: '0.5rem', color: 'var(--w-slate-500)', textAlign: 'center', marginTop: '-4px' }}>※ 2021·2026만 MSC UK 참치 쇼퍼 리포트 1차 측정값 · 2023(흐림·점선)은 추정으로 1차 미확인</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { k: 'MSC 인증 참치', v: '305만t', s: '자연산 참치 절반', c: '#38bdf8' },
              { k: '블루라벨 참치', v: '+39%*', s: '연 40만t+(2차·추정)', c: '#10b981' },
              { k: '100% MSC 전환', v: '대형 4사+', s: '테스코·세인즈버리 등', c: '#f59e0b' },
            ].map((x) => (
              <div key={x.k} style={{ background: `${x.c}0f`, border: `1px solid ${x.c}2e`, borderRadius: '8px', padding: '8px 9px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.56rem', color: 'var(--w-slate-400)' }}>{x.k}</span>
                <span style={{ fontSize: '1.0rem', fontWeight: 800, color: x.c }}>{x.v}</span>
                <span style={{ fontSize: '0.52rem', color: 'var(--w-slate-500)' }}>{x.s}</span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
