'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';

/* ── EU 참치 수입 관세 "체제" — 24% 장벽과 무관세 우회로 (EU 1차) ──
   검증(solid): 캔 MFN(최혜국대우) 24%, 로인 ATQ(자율관세쿼터) 35,000t/년 0%(Reg 2023/2720),
   EVFTA(EU-베트남 FTA) 캔 TRQ(관세율쿼터) 11,500t 0%, Pacific EPA(태평양 경제동반자협정) 글로벌소싱 0%(원산지 불문),
   한-EU FTA 수산물 0%(EU측 5년 내 전 품목 철폐, 한국 수출 수산 품목수 72.6%·수출액 95% 즉시~3년 철폐).
   ※98.7%는 한-EU FTA '전 품목(공산품·임산물 포함)' 집계치로 수산 단독 비율 아님 — 수산은 EU측 5년 내 전량 철폐.
   ※태국 24% vs 에콰도르 0% 단일비교는 SasThaiSourcing에 위임 — 본 위젯은 무관세 우회로 레이어 중심. */
const CHANNELS = [
  { ch: '캔 MFN(협정 밖)', rate: 24, note: '수산물 최고세율', color: '#ef4444' },
  { ch: '로인 ATQ', rate: 0, note: '35,000t/년 무관세', color: '#06b6d4' },
  { ch: 'EVFTA(베트남)', rate: 0, note: '캔 TRQ 11,500t', color: '#38bdf8' },
  { ch: 'Pacific EPA', rate: 0, note: '원산지 불문(PNG·피지)', color: '#10b981' },
  { ch: '한-EU FTA', rate: 0, note: '수산물 전 품목 철폐', color: '#f59e0b' },
];

export default function SasEuTariffRegime() {
  return (
    <WidgetCard
      id="W-SAS41"
      title="EU 참치 관세 체제 — 24% 장벽과 무관세 우회로"
      description="명목 24%이나 ATQ·EPA·FTA 무관세 우회로가 시장을 가른다"
      pillar="S3"
      telemetry={{ status: 'STATIC', syncDate: '2026-06-05' }}
      cardDesc="EU 참치 수입 채널별 실효 관세 — EU 이사회 Reg.2023/2720·TARIC·Access2Markets"
      takeaway={{
        situation: "EU의 참치 수입 관세는 단일 숫자가 아니라 '체제'입니다. 명목상 캔참치 MFN(최혜국대우 일반세율)은 24%로 수산물 최고이지만, 실제 시장은 무관세 우회로로 갈립니다. 가공원료용 냉동 로인은 자율관세쿼터(ATQ, Reg 2023/2720)로 연 35,000톤까지 0%(중국·동남아가 연초 조기 소진), 베트남은 EVFTA(EU-베트남 FTA)로 캔 TRQ(관세율쿼터) 11,500톤 0%, 태평양 PNG·피지는 EPA(경제동반자협정) 글로벌소싱 데로게이션으로 어획지 불문 0%, 한국은 한-EU FTA로 0%입니다(EU측은 수산물 전 품목을 5년 내 철폐 완료, 한국 수출 수산물은 품목수 72.6%·수출액 95%가 즉시~3년 내 철폐). 즉 24%를 온전히 무는 공급자는 협정·쿼터 어디에도 못 든 일부(2015년 GSP(일반특혜관세) 잃은 태국 등, SasThaiSourcing 참조)뿐입니다.",
        actionPlan: "한국 공급자의 핵심 무기는 둘입니다. ① 완제품 캔/파우치는 한-EU FTA로 이미 0%이므로 24%를 무는 비특혜국 대비 가격 우위 — EU 직판 라인을 우선 키우십시오. ② 그러나 로인 ATQ(35,000t)와 EVFTA·EPA 무관세가 EU 가공 원료시장을 잠식하므로, 한국이 '원료 로인 공급자'로 들어가면 중국·PNG와 무관세 레드오션 단가 경쟁에 노출됩니다. 따라서 무관세 원료가 아니라 FTA 0%를 살린 고부가 완제품·신선 사시미 직판에 자본을 집중하십시오.",
        source: "EU 이사회 Reg.2023/2720(로인 ATQ 35,000t) / TARIC·Europarl E-002775/2023(MFN 24%) / Access2Markets(EVFTA TRQ 11,500t)·한-EU FTA 상세설명자료(수산물 EU측 5년 내 전 품목 철폐; 98.7%는 전 품목 집계치) / CFFA(Pacific EPA 글로벌소싱)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ height: '220px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={CHANNELS} margin={{ top: 18, right: 14, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="ch" fontSize={9} tickLine={false} axisLine={false} stroke="#64748b" interval={0} angle={-12} textAnchor="end" height={42} />
                <YAxis domain={[0, 26]} tickFormatter={(v: number) => `${v}%`} fontSize={11} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#e2e8f0' }}
                  formatter={(v: number, _n: string, p: any) => [`${v}% · ${p.payload.note}`, '관세']}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {CHANNELS.map((d) => <Cell key={d.ch} fill={d.color} />)}
                  <LabelList dataKey="rate" position="top" formatter={(v: number) => `${v}%`} fontSize={11} fill="#e2e8f0" />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#94a3b8' }}>
            무관세 4대 우회로(로인 ATQ·EVFTA·Pacific EPA·한-EU FTA)가 24% 명목세율을 무력화
          </div>
        </div>
      }
    />
  );
}
