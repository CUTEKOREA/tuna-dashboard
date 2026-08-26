'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';

/* ── 한국 원양 참치 선단 경제성·구조 리스크 (해수부 1차) ──
   검증(solid): 노후선 30년+ 64.4%(214중138, 2019), 평균선령 ~30년→2025 25년 목표, 해기사 50세+ 82.3%(2023년말, 한국선원복지고용센터 1차).
   정정: Sala '+26%' 합성수치 삭제(보조금·저임금 없으면 공해어장 ~54% 적자), 외국인선원 원양 전체 45.7%(2022)·연승은 더 높음으로 정성표기, 2019 기준 명기.
   Round2: 50세+ 81%(업계추정 헷지)→82.3%(한국선원복지고용센터 2023년말, 한국경제 2024-09-11 인용)로 1차출처 승격·확정. */
const AGE = [
  { seg: '10년 미만', n: 19, color: '#10b981' },
  { seg: '10~30년', n: 57, color: '#38bdf8' },
  { seg: '30~40년', n: 112, color: '#f59e0b' },
  { seg: '40년 이상', n: 26, color: '#ef4444' },
];

export default function SasKrFleetEconomics() {
  return (
    <WidgetCard
      id="W-SAS48"
      title="한국 원양 참치 선단 - 노후화·인력 리스크"
      description="원양어선 64%가 선령 30년+, 해기사 82.3%가 50세 이상"
      pillar="S1"
      telemetry={{ status: 'STATIC', syncDate: '2026-06-04' }}
      cardDesc="한국 원양어선 선령 분포·인력 고령화 구조 리스크 - 해양수산부(2019 기준)·원양산업협회"
      takeaway={{
        situation: "한국 원양 참치 선단은 자본·노동 양면의 구조적 노후화에 직면했습니다. 2019년 기준 원양어선 214척 중 64.4%(138척)가 선령 30년을 초과(26척은 40년 이상)하고 신조선(10년 미만)은 8.9%에 불과해 평균 선령이 약 30년에 달합니다(해수부 목표는 2025년 25년). 인력 측면에서는 원양 해기사의 82.3%가 50세 이상(30세 미만은 11.1%)으로 고령화가 임계점에 도달했고, 외국인 선원 의존(원양 전체 45.7%, 참치 연승선은 이보다 높음)이 심화됐습니다. Science Advances(2018) 분석상 보조금·저임금 노동이 없으면 공해 어장의 최대 54%가 적자로, 한국 다수 선대가 정부 보조에 의존하는 구조입니다.",
        actionPlan: "PEF 관점에서 원양선사 투자 시 EBITDA보다 '재선대(re-fleeting) capex 폭탄'과 '인건비·연료 단일 민감도'를 먼저 스트레스 테스트하십시오. ① 노후선 64% 보유 선사는 IUU·안전규제 강화로 5~10년 내 강제 대체 압력 - 척당 신조 capex를 EV에 선반영하고 폐선·감척 보조금을 다운사이드 헤지로 산정. ② 인건비가 마진 최대 레버이므로 외국인 송출 의존도·ILO C188 인권 규제 리스크를 듀딜 핵심 항목으로 점검. ③ 진입은 감척·신조 보조 정책 가시성이 높은 선사로 좁히고, 보조금 의존이 과도해 정책 변경에 취약한 선대는 회피하십시오.",
        source: "해양수산부 원양어선 안전·복지 대책(노후선 64.4%·평균선령 30년·2025 25년 목표, 2019/2020) / 해기사 50세+ 82.3%·30세 미만 11.1%(한국선원복지고용센터 2023년말, 한국경제 2024-09-11 인용) / 외국인선원 의존 원양어업 전체 45.7%(2022, 참치 연승은 그 이상 추정) / Science Advances 2018(공해어장 54% 적자)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ fontSize: '0.66rem', color: 'var(--w-slate-400)', fontWeight: 600, textAlign: 'center' }}>원양어선 선령 분포 (척, 2019) - 30년+ 64.4%</div>
          <div style={{ height: '180px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={AGE} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="seg" fontSize={10} tickLine={false} axisLine={false} stroke="var(--w-slate-500)" interval={0} />
                <YAxis domain={[0, 130]} tickFormatter={(v: unknown) => `${v}척`} fontSize={10} tickLine={false} axisLine={false} stroke="var(--w-slate-500)" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--w-navy-900)', color: 'var(--w-slate-200)' }} formatter={(v: unknown) => [`${v}척`, '원양어선']} />
                <Bar dataKey="n" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {AGE.map((d) => <Cell key={d.seg} fill={d.color} />)}
                  <LabelList dataKey="n" position="top" formatter={(v: unknown) => `${v}`} fontSize={10.5} fill="var(--w-slate-200)" />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', fontSize: '0.62rem', color: 'var(--w-slate-400)', flexWrap: 'wrap' }}>
            <span>해기사 50세+ <span style={{ color: 'var(--w-red-500)', fontWeight: 700 }}>82.3%</span></span>
            <span>외국인 선원 의존(원양어업 전체) <span style={{ color: 'var(--w-amber-500)', fontWeight: 700 }}>45.7%</span></span>
            <span style={{ color: 'var(--w-slate-500)' }}>보조금 없으면 공해어장 54% 적자</span>
          </div>
        </div>
      }
    />
  );
}
