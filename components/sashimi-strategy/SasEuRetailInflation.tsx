'use client';

import React from 'react';
import * as chartFmt from '../../lib/chartFormatters';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

/* ── EU 캔참치 원료가 변동성 + 소비자 다운트레이딩 (출처 정정 반영) ──
   검증: 가다랑어 CFR 방콕 2023 고점 ~$2,050/t → 2024 저점 ~$1,400 → 2025 재상승 ~$1,650(변동성),
   스페인 PB(유통업체 브랜드) 비중 ~80% — 단 이는 캔'수산물 전체' 기준(1차: Solunion Flash sectorial 2024-11, Gaictech 재인용 2차).
   유럽 캔'참치 단독' PB는 ~28-29%로 별개 — 위젯의 '캔참치 80%' 스코프 오귀속을 캔수산물 전체로 정정.
   EU 가계 수산물 지출 €62.8bn은 2024년 데이터(EUMOFA EU Fish Market 2025 edition, 2025-12 발행). */
const SKIPJACK = [
  { p: '2022', usd: 1750 }, { p: '2023', usd: 2050 }, { p: '2024', usd: 1400 }, { p: '2025', usd: 1650 },
];

export default function SasEuRetailInflation() {
  return (
    <WidgetCard
      id="W-SAS47"
      title="EU 캔참치 원료가 변동성 & 소비자 다운트레이딩"
      description="가다랑어 원료가 출렁임 + 스페인 캔수산물 PB 80%"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      cardDesc="가다랑어 CFR 원료가 추이·스페인 캔수산물 PB·EU 수산 지출(2024) - FAO GLOBEFISH·Solunion 2024(Gaictech 재인용)·EUMOFA 2025"
      takeaway={{
        situation: "EU 캔참치 원가의 핵심 변수인 가다랑어 CFR 방콕가는 단순 하락이 아니라 큰 변동성을 보입니다 - 2023년 중반 5년 최고 ~$2,050/톤을 찍은 뒤 2024년 ~$1,400로 급락했다가 2025년 ~$1,650로 다시 반등했습니다. 한편 2022-23 인플레로 소매가가 두 자릿수 뛴 뒤 소비자는 가격 신중화로 대거 다운트레이딩 중이며, 스페인 캔수산물 시장 전체의 PB(유통업체 자체브랜드) 비중이 약 80%까지 확대됐습니다(Solunion 2024 - 캔참치 단독이 아닌 캔수산물 전체 기준이며, 유럽 캔참치 단독 PB는 약 28-29%로 별개). EU 가계 수산물 지출은 2024년 €62.8bn(EUMOFA)으로 '소비 증가가 아닌 높은 가격 수준 지속'을 반영합니다.",
        actionPlan: "원료가가 단순 하락이 아니라 출렁이므로 고정가 장기계약은 위험합니다. ① 가다랑어 변동성을 헤지하는 인덱스 연동·분기 리프라이싱 계약으로 원가 리스크를 분산하고, 저점 구간(2024)에 -60℃ 비축으로 원가를 락인하십시오. ② 스페인 캔수산물 PB 80% 다운트레이딩 구조에서 브랜드 신설은 비효율이므로, 한-EU FTA 무관세를 살린 리테일러 PB 원료·완제품 OEM 공급으로 좁혀 진입하는 것이 현실적입니다(프리미엄은 사시미·비캔 라인에 한정).",
        source: "Undercurrent·FAO GLOBEFISH(가다랑어 CFR 방콕 2023 고점~2025 재상승) / Solunion Flash sectorial 2024-11(스페인 캔수산물 전체 PB ~80%, Gaictech 재인용 2차) / EUMOFA The EU Fish Market 2025(2024년 가계 수산 지출 €62.8bn)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ fontSize: '0.66rem', color: 'var(--w-slate-400)', fontWeight: 600, textAlign: 'center' }}>가다랑어 원료가 (CFR 방콕, $/톤) - 변동성</div>
          <div style={{ height: '160px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <AreaChart data={SKIPJACK} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSkip" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--w-amber-500)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--w-amber-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="p" fontSize={11} tickLine={false} axisLine={false} stroke="var(--w-slate-500)" />
                <YAxis domain={[1200, 2200]} tickFormatter={(v: unknown) => `${(chartFmt.toChartNumber(v) / 1000).toFixed(1)}k`} fontSize={10} tickLine={false} axisLine={false} stroke="var(--w-slate-500)" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--w-navy-900)', color: 'var(--w-slate-200)' }} formatter={(v: unknown) => [`${chartFmt.formatChartNumber(v)}/t`, '가다랑어']} />
                <Area type="monotone" dataKey="usd" name="가다랑어 CFR" stroke="var(--w-amber-500)" strokeWidth={2.5} fill="url(#colorSkip)" isAnimationActive={false} />
              </AreaChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { k: '스페인 캔수산물 PB', v: '약 80%', s: '캔수산물 전체·다운트레이딩', c: '#ef4444' },
              { k: 'EU 가계 수산 지출', v: '€62.8B', s: '2024년·높은 가격수준 지속(EUMOFA)', c: '#38bdf8' },
            ].map((x) => (
              <div key={x.k} style={{ background: `${x.c}0f`, border: `1px solid ${x.c}2e`, borderRadius: '8px', padding: '9px 11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--w-slate-400)' }}>{x.k}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: x.c }}>{x.v}</span>
                <span style={{ fontSize: '0.54rem', color: 'var(--w-slate-500)' }}>{x.s}</span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
