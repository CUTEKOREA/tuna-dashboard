'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine, LabelList } from 'recharts';

/* ── EU 원양 선망 선단의 인도양 황다랑어 자원 리스크 (IOTC 1차) ──
   검증(solid): 2022 어획 410,332t > MSY ~349,000t, 회복 위해 2020 대비 30% 감축(상한 ~301,000t),
   EU 보유 선망·보급선 50척+(7개 EU기업 ~90% 지배), 2024 IOTC SC27 green 재평가(Pew·Blue Marine 신중론).
   정정: EU 선단 점유는 '약 1/3'(정밀톤수 미확정), reflagging은 합법 관행으로 중립 표기. */
const STOCK = [
  { label: '2022 어획', t: 410, color: '#ef4444' },
  { label: 'MSY 상한', t: 349, color: '#f59e0b' },
  { label: '회복목표 상한', t: 301, color: '#10b981' },
];

export default function SasEuDistantFleet() {
  return (
    <WidgetCard
      id="W-SAS45"
      title="EU 원양선단 인도양 황다랑어 자원 리스크"
      description="EU 선망이 인도양 다랑어 1/3 어획 — 자원·규제 분기점"
      pillar="S1"
      telemetry={{ status: 'STATIC', syncDate: '2024-25' }}
      cardDesc="인도양 황다랑어 자원상태·EU 원양선단 의존 — IOTC 과학위·SeafoodSource"
      takeaway={{
        situation: "EU 사시미/스테이크 원료(신선·냉동 황다랑어)의 상류 공급원은 스페인·프랑스가 운영하는 인도양 원양 선망선단으로, EU 보유 선망·보급선 50척+(7개 EU 기업이 약 90% 지배)이 인도양 열대다랑어 어획의 약 1/3을 책임집니다. 연대기로 보면 — 2022년 황다랑어 어획(410,332톤)이 MSY(약 349,000톤)를 초과해 과잉어획 상태였고 IOTC 과학위는 2020년 대비 30% 감축(상한 약 301,000톤)을 요구했으나, 2024년 IOTC 과학위(SC27)가 황다랑어를 'green'(과잉어획 아님)으로 재평가하면서 자원 서사가 분기점에 섰습니다(Pew·Blue Marine은 평가 방법론에 신중론).",
        actionPlan: "원료 리스크를 이분법이 아닌 시나리오로 관리하십시오. ① 2024 green 등급이 유지되면 IOTC 어획상한 압박이 완화돼 EU 선단의 인도양 원료 흐름·가격이 안정되지만, NGO 신중론을 감안해 '조건부 회복'으로 간주하십시오. ② 재평가가 뒤집히거나 어획제한이 강화되면 EU 원물 1/3을 책임지는 선단이 직접 타격을 받아 신선·냉동 황다랑어 단가가 급변합니다. 따라서 인도양 단일 의존을 낮추고 대서양(ICCAT)·태평양 대체 소싱 + MSC/CATCH 인증 가능 물량을 분산 확보하되, 차기 IOTC 본회의 쿼터 결정을 분기 모니터링 트리거로 설정하십시오.",
        source: "IOTC 과학위(2022 어획 410,332t·MSY ~349,000t·2021 평가 30% 감축) / IOTC SC27 2024(green 재평가) / SeafoodSource·AP(EU 선단 50척+·약 1/3 점유)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>인도양 황다랑어 어획 vs 지속가능 상한 (천 톤)</div>
          <div style={{ height: '180px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={STOCK} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" interval={0} />
                <YAxis domain={[0, 450]} tickFormatter={(v: number) => `${v}K`} fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#e2e8f0' }} formatter={(v: number) => [`${v}천t`, '물량']} />
                <ReferenceLine y={349} stroke="#f59e0b" strokeDasharray="4 4" />
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
