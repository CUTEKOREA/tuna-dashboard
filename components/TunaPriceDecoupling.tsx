/**
 * 원가 vs 소매가 디커플링 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 115줄 → After 74줄 (-36%)
 */

'use client';
import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { getTunaData } from '@/lib/data/tuna';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

const rawData = getTunaData('priceDecoupling');

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px', borderRadius: '8px', color: 'var(--w-slate-50)', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', minWidth: '220px' }}>
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'var(--w-slate-200)' }}>{label}월</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--w-blue-500)' }}>🐟 원어 국제시세(USD/t)</span>
          <span>${payload.find((p: any) => p.dataKey === 'raw_price_usd')?.value?.toLocaleString()}/t</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--w-red-500)' }}>🥫 소매 납품가(₩/캔 150g)</span>
          <span>₩{payload.find((p: any) => p.dataKey === 'retail_price_krw')?.value?.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '4px' }}>
          <span style={{ color: 'var(--w-amber-500)', fontWeight: 'bold' }}>💰 초과 마진 독식 스프레드</span>
          <span style={{ fontWeight: 700, color: 'var(--w-amber-500)' }}>+{payload.find((p: any) => p.dataKey === 'margin_spread')?.value?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default function TunaPriceDecoupling() {
  return (
    <WidgetCard
      title="원가 vs 소매가: 강한 디커플링"
      icon={TrendingUp}
      iconColor="#38bdf8"
      pillar="S4"
      cardDesc="원어 가다랑어 국제 시세(USD/톤, 좌Y) vs 국내 참치 통조림 150g 소매 납품가(₩/캔, 우Y) — 원어 30% 폭락에도 견고한 소매가 디커플링"
      unit="(단위: USD/t · ₩/캔)"
      telemetry={{ status: 'STATIC', syncDate: '2023.04~2024.03' }}
      chartHeight={250}
      chart={
        <ComposedChart data={rawData} margin={{ top: 10, right: 50, left: 30, bottom: 20 }}>
          <ChartPatternDefs />
          <defs>
            <linearGradient id="marginSpread" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--w-amber-500)" stopOpacity={0.6} />
              <stop offset="95%" stopColor="var(--w-amber-500)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(var(--w-blue-500-rgb), 0.5)" tick={{ fill: 'var(--w-blue-500)', fontSize: 11 }} tickFormatter={(v) => `$${v}`} domain={[1300, 2100]} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(var(--w-red-500-rgb), 0.5)" tick={{ fill: 'var(--w-red-500)', fontSize: 11 }} tickFormatter={(v) => `₩${v}`} domain={[2500, 3500]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
          <Area yAxisId="right" type="monotone" dataKey="margin_spread" name="초과 마진 독식 스프레드" fill="url(#marginSpread)" stroke="none" />
          <Line yAxisId="left" type="monotone" dataKey="raw_price_usd" name="🐟 원어 국제시세 (USD/t)" stroke="var(--w-blue-500)" strokeWidth={3} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="retail_price_krw" name="🥫 소매가 (₩/캔 150g)" stroke="var(--w-red-500)" strokeWidth={3} dot />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"디커플링"이란 두 변수가 평소에는 같이 움직이다가 어느 순간 분리되는 현상. 참치 산업에서 가장 중요한 디커플링: <strong>원물 가격 ↔ 소매가</strong>.</p>
<p>2023~2024 충격적 패턴: <strong>가다랑어 국제 시세 2023-04 $2,000 → 2024-01 $1,400 (-30% 폭락)</strong>. 정상 시장이라면 소매 통조림 가격도 비슷하게 하락해야 함. 그런데 <strong>주요 캔 제조사 소매 납품가는 인상 또는 유지</strong>.</p>
<p>의미: 산업의 이윤 중심이 <strong>"원물 어획"에서 "유통 장악력"으로 이동</strong>했다는 강력한 신호. 원물 가격이 떨어지면 마진을 어획자가 가져가는 게 아니라 유통·브랜드가 추가 마진으로 흡수. 한국 어획자·가공사는 점점 마진 압박을 받는 구조.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 원가-판가 디커플링은 단순 시장 이상이 아닌 <strong>"공급망 주도권 이동"</strong> 신호. 한국 공급사가 어획·가공 단계에 묶여 있으면 향후 5년 마진을 점점 잃는다. 유통·브랜드 직접 진출 또는 수직 계열화가 유일한 출구.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>대형 유통 PB 브랜드와 장기 납품 고정가 계약</strong>: 코스트코·이마트·롯데마트 자체브랜드 라인과 3~5년 고정가 계약 락업. 변동성 헷지 + 매출 가시성 확보.</li>
<li style="margin-bottom: 8px;"><strong>위탁생산(OEM/ODM) 고마진 가공식품 직접 침투</strong>: 단순 통조림이 아닌 간편가정식(HMR)·즉석식품·반려동물 식품으로 제품군 확장. 마진 구조 개선 여지 업계추정 2배 이상(illustrative).</li>
<li><strong>소비자 직접 채널로 전방 통합</strong>: 자체 브랜드 출시 + 직접판매(DTC) 온라인 채널(아마존·11번가) 가동. 5년 내 매출의 일정 비중을 직접 채널로 이동해 유통 마진 직접 회수 — 구체 목표치는 내부 사업계획에서 확정 필요.</li>
</ol>
</div>`,
        source: 'ISSF·WCPFC 어획통계(업계추정 기반) + 한국소비자원 가격정보 (2023.04~2024.03)',
      }}
    />
  );
}
