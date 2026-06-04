'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';

/* ── 2025 미국 상호관세(IEEPA reciprocal) 비통조림 참치 공급국별 ──
   검증(Federal Register·USTR·White House·CBP): 한국 15%(2025-11-14 발효),
   인니·태국 19%, 베트남 20%, EU 15%(MFN 포함), 멕시코 USMCA 원산지 0% 면제.
   에콰도르는 미검증으로 제외. MFN 기저율은 정성서술만(HS별 실값 미확정). */
const TARIFF_DATA = [
  { country: '🇲🇽 멕시코', rate: 0, note: 'USMCA 면제', color: '#10b981' },
  { country: '🇰🇷 한국', rate: 15, note: '한국', color: '#f59e0b' },
  { country: '🇪🇺 EU/스페인', rate: 15, note: 'MFN 포함', color: '#a78bfa' },
  { country: '🇮🇩 인도네시아', rate: 19, note: '경쟁국', color: '#38bdf8' },
  { country: '🇹🇭 태국', rate: 19, note: '경쟁국', color: '#38bdf8' },
  { country: '🇻🇳 베트남', rate: 20, note: '경쟁국', color: '#ef4444' },
];

export default function SasUsTariffLadder() {
  return (
    <WidgetCard
      id="W-SAS31"
      title="2025 미국 상호관세 공급국 사다리"
      description="비통조림 참치(HS 0302·0303·0304) — 한국 +4~5%p 관세 우위"
      pillar="S3"
      telemetry={{ status: 'STATIC', syncDate: '2025-11-14' }}
      cardDesc="2025 미국 상호관세(국제긴급경제권한법(IEEPA) 근거) 공급국별 적용률(국가별 일반율, 참치 품목 고유율 아님) — Federal Register·CBP 기준. 2025-11-25 농산물 예외(EO 14360, FR 2025-21203) 글로벌 면제 부속서(Annex I)에는 03·16류 어류 부재 — 비통조림 참치는 글로벌 면제 대상 아님."
      takeaway={{
        situation: "2025년 미국 상호관세로 비통조림 참치 공급국 간 관세 격차가 새로 생겼습니다(한국 적용분 2025-11-14 발효). 관세 사다리: 멕시코(미국·멕시코·캐나다 협정(USMCA) 원산지) 0% 면제 < 한국·EU 15% < 인니·태국 19% < 베트남 20%. 한국은 한·미 자유무역협정(KORUS FTA) 무관세 우위가 15%로 침식됐으나, 핵심 경쟁국 인니·태국·베트남 대비 4~5%p 낮은 위치를 확보했습니다. 여기 표시한 적용률은 각국 상호관세 일반율로, 비통조림 참치(HS 0302·0303·0304) 품목 고유율은 별도 확인이 필요합니다. 한국·경쟁국 모두 동일 일반율 체계 하에서 격차가 벌어졌다는 점이 핵심입니다. 다만 2025-11-25 발효된 농산물 예외(EO 14360, FR 2025-21203)의 글로벌 면제 부속서(Annex I)에는 03·16류 어류가 전혀 없어 비통조림 참치는 글로벌 면제 대상이 아니며, 일부 냉동 참치 HS코드(0302.31·0302.32·0304.87·1604.14.40)는 상호무역협정 체결국(Aligned Partners)에 한해 상무부·미국 무역대표부(USTR) 재량으로 조건부 면제될 수 있는 별도 목록에만 포함됩니다. 즉 농산물 예외가 자동·일률 적용되지는 않습니다.",
        actionPlan: "① 한국 가공·수출은 인니·태국·베트남 대비 4~5%p 관세우위 — 베트남(20%)·인니(19%) 비중이 큰 미국 바이어의 소싱 다변화 수요를 흡수할 사쿠/사시미 주문자상표부착(OEM)·자체브랜드(PB) 전환 윈도우입니다. ② 멕시코 USMCA(미국·멕시코·캐나다 협정) 면제(0%)는 구조적 최강 우위로, 멕시코 가공 거점 자산은 관세 회피 프리미엄을 보유 — 한국 사쿠 라인과 묶는 관세차익(관세 차이를 활용한 차익거래) 듀얼소싱에 우선 배분하십시오. ③ 한국 15%는 협정 재협상에 민감하므로 시나리오 헤지 필요.",
        source: "Federal Register 2025-21940(한국 15%) / White House 행정명령(EO) 14326, FR Doc. 2025-15010(인니·태국 19%·베트남 20%) / 미국-EU 프레임워크 합의(EU 15%, MFN 기저율 합산 기준) / CBP IEEPA FAQ(멕시코 USMCA 면제) / 농산물 예외: 행정명령(EO) 14360 'Modifying the Scope of the Reciprocal Tariffs With Respect to Certain Agricultural Products', 90 FR 54091, FR Doc. 2025-21203(2025-11-25 게재, 2025-11-13 발효) — 글로벌 면제 Annex I에 03·16류 어류 부재, 냉동 참치는 Aligned Partners 조건부 부속서에만 포함. 적용률은 국가별 상호관세 일반율이며 비통조림 참치 품목 고유율이 아님(EU는 MFN 기저율 합산 메커니즘 반영).",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ height: '230px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={TARIFF_DATA} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="country" fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" interval={0} />
                <YAxis domain={[0, 24]} tickFormatter={(v: number) => `${v}%`} fontSize={11} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#e2e8f0' }}
                  formatter={(v: number, _n: string, p: any) => [`${v}% (${p.payload.note})`, '상호관세']}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {TARIFF_DATA.map((d) => <Cell key={d.country} fill={d.color} />)}
                  <LabelList dataKey="rate" position="top" formatter={(v: number) => `${v}%`} fontSize={11} fill="#e2e8f0" />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.62rem', color: '#94a3b8' }}>
            <span><span style={{ color: '#10b981' }}>●</span> 면제(0%)</span>
            <span><span style={{ color: '#f59e0b' }}>●</span> 한국 15%</span>
            <span><span style={{ color: '#ef4444' }}>●</span> 최고 베트남 20%</span>
            <span style={{ color: '#64748b' }}>한국 대비 SE아시아 +4~5%p</span>
          </div>
        </div>
      }
    />
  );
}
