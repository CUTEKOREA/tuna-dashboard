'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine, LabelList } from 'recharts';

/* ── EU 원양 선망 선단의 인도양 황다랑어 자원 리스크 (IOTC 1차) ──
   검증(solid, 2024 IOTC SC27 / 데이터 최종연도 2023): 2023 어획 400,950t, MSY 점추정 421,000t(범위 416-430),
   2019-23 평균어획 423,142t. F2023/FMSY=0.75(0.58-1.01)·SB2023/SBMSY=1.32 → 과잉어획 아님·과잉어획 진행 아님(green).
   EU 보유 선망·보급선 50척+(7개 EU기업 ~90% 지배, 2차보도). Pew·Blue Marine은 평가 방법론 신중론.
   정정: 차트-텍스트 모순 화해 — 구(2021) MSY 349K선·30% 감축(상한 301K) 서사를 2024 SC27(MSY 421K green) 기준으로 갱신.
   정정(R2): F2023/FMSY 0.2→0.75(IOTC-2024-SC27-ES04 line30·142); 'MSY 상한'→'MSY 점추정'(상한은 430K, ES04 line182);
   5년평균 막대가 MSY 점추정을 넘어 green 서사와 충돌 → ReferenceLine을 MSY 상한 430K로 이동.
   정정: EU 선단 점유는 '약 1/3'(정밀톤수 미확정), reflagging은 합법 관행으로 중립 표기. */
const STOCK = [
  { label: '2023 어획', t: 401, color: '#10b981' },
  { label: 'MSY 점추정', t: 421, color: '#f59e0b' },
  { label: '5년 평균', t: 423, color: '#94a3b8' },
];

export default function SasEuDistantFleet() {
  return (
    <WidgetCard
      id="W-SAS45"
      title="EU 원양선단 인도양 황다랑어 자원 리스크"
      description="EU 선망이 인도양 다랑어 1/3 어획 — 자원·규제 분기점"
      pillar="S1"
      telemetry={{ status: 'STATIC', syncDate: '2024-12-31' }}
      cardDesc="인도양 황다랑어 자원상태·EU 원양선단 의존 — IOTC 과학위·SeafoodSource"
      takeaway={{
        situation: "EU 사시미/스테이크 원료(신선·냉동 황다랑어)의 상류 공급원은 스페인·프랑스가 운영하는 인도양 원양 선망선단으로, EU 보유 선망·보급선 50척+(7개 EU 기업이 약 90% 지배, 업계 2차보도 기준·정밀 톤수 미확정)이 인도양 열대다랑어 어획의 약 1/3을 책임집니다. 최신 평가 기준으로 — 2024년 IOTC 과학위(SC27, 데이터 최종연도 2023)는 인도양 황다랑어 MSY 점추정치를 약 421,000톤(범위 416-430)으로 상향하고 2023년 어획(약 400,950톤)·5년 평균어획(423,142톤)을 반영해 'green'(과잉어획 아님·과잉어획 진행 아님, F2023/FMSY=0.75[범위 0.58-1.01], SB2023/SBMSY=1.32)으로 판정했습니다. 이는 직전(2021) 평가의 'MSY 약 349,000톤 초과·30% 감축 권고' 서사를 뒤집은 것으로, 자원 서사가 분기점에 섰습니다(다만 F/FMSY 범위 상한이 1.01로 1을 살짝 넘어 안전여유는 크지 않으며, Pew·Blue Marine은 평가 방법론에 신중론).",
        actionPlan: "원료 리스크를 이분법이 아닌 시나리오로 관리하십시오. ① 2024 green 등급이 유지되면 IOTC 어획상한 압박이 완화돼 EU 선단의 인도양 원료 흐름·가격이 안정되지만, NGO 신중론을 감안해 '조건부 회복'으로 간주하십시오. ② 재평가가 뒤집히거나 어획제한이 강화되면 EU 원물 1/3을 책임지는 선단이 직접 타격을 받아 신선·냉동 황다랑어 단가가 급변합니다. 따라서 인도양 단일 의존을 낮추고 대서양(ICCAT)·태평양 대체 소싱 + MSC/CATCH 인증 가능 물량을 분산 확보하되, 차기 IOTC 본회의 쿼터 결정을 분기 모니터링 트리거로 설정하십시오.",
        source: "IOTC-2024-SC27-ES04(MSY 점추정 421,000t[범위 416-430]·2023 어획 400,950t·5년평균 423,142t·F2023/FMSY=0.75[0.58-1.01]·SB2023/SBMSY=1.32·green 판정, 데이터 최종연도 2023) / 직전 IOTC 2021 평가(구 MSY ~349,000t·30% 감축 권고, 갱신됨) / SeafoodSource·AP·Blue Marine·Pew(EU 선단 50척+·약 1/3 점유 — 2차보도, 1차 선박등록부 미검증)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>인도양 황다랑어 어획 vs MSY 점추정·상한 (천 톤)</div>
          <div style={{ height: '180px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={STOCK} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" interval={0} />
                <YAxis domain={[0, 450]} tickFormatter={(v: number) => `${v}K`} fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#1a2442', color: '#e2e8f0' }} formatter={(v: number) => [`${v}천t`, '물량']} />
                <ReferenceLine y={430} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'MSY 상한 430K', position: 'insideTopRight', fontSize: 9, fill: '#fca5a5' }} />
                <Bar dataKey="t" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {STOCK.map((d) => <Cell key={d.label} fill={d.color} />)}
                  <LabelList dataKey="t" position="top" formatter={(v: number) => `${v}K`} fontSize={10.5} fill="#e2e8f0" />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', fontSize: '0.62rem', color: '#94a3b8', flexWrap: 'wrap' }}>
            <span>EU 선단 인도양 어획 <span style={{ color: '#38bdf8', fontWeight: 700 }}>약 1/3</span> (50척+)</span>
            <span>2024 IOTC <span style={{ color: '#10b981', fontWeight: 700 }}>green</span> 재평가(신중론)</span>
          </div>
        </div>
      }
    />
  );
}
