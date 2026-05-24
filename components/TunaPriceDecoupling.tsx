/**
 * 원가 vs 소매가 디커플링 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 115줄 → After 74줄 (-36%)
 */

'use client';
import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import rawData from '../data/tuna_price_decoupling.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', minWidth: '220px' }}>
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e2e8f0' }}>{label}월</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#3b82f6' }}>🐟 원어 국제시세(USD/t)</span>
          <span>${payload.find((p: any) => p.dataKey === 'raw_price_usd')?.value?.toLocaleString()}/t</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#ef4444' }}>🥫 소매 납품가(₩/캔 150g)</span>
          <span>₩{payload.find((p: any) => p.dataKey === 'retail_price_krw')?.value?.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '4px' }}>
          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>💰 초과 마진 독식 스프레드</span>
          <span style={{ fontWeight: 700, color: '#f59e0b' }}>+{payload.find((p: any) => p.dataKey === 'margin_spread')?.value?.toLocaleString()}</span>
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
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(59,130,246,0.5)" tick={{ fill: '#3b82f6', fontSize: 11 }} tickFormatter={(v) => `$${v}`} domain={[1300, 2100]} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(239,68,68,0.5)" tick={{ fill: '#ef4444', fontSize: 11 }} tickFormatter={(v) => `₩${v}`} domain={[2500, 3500]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
          <Area yAxisId="right" type="monotone" dataKey="margin_spread" name="초과 마진 독식 스프레드" fill="url(#marginSpread)" stroke="none" />
          <Line yAxisId="left" type="monotone" dataKey="raw_price_usd" name="🐟 원어 국제시세 (USD/t)" stroke="#3b82f6" strokeWidth={3} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="retail_price_krw" name="🥫 소매가 (₩/캔 150g)" stroke="#ef4444" strokeWidth={3} dot />
        </ComposedChart>
      }
      takeaway={{
        situation: '2023년 4월 톤당 $2,000을 돌파했던 가다랑어 국제 시세가 2024년 1월 $1,400 선까지 약 30% 폭락. 그러나 주요 참치 캔 제조사의 소매 납품가는 인상 또는 유지되는 강한 디커플링.',
        actionPlan: '원가와 판가 비동조화는 산업의 이윤 중심이 \'원물 어획\'에서 \'유통 장악력\'으로 이동했음을 시사. 원어 공급을 넘어 유통망(리테일)을 쥔 B2C 브랜드와 장기 납품 계약(Hedging) 체결, 또는 자사 원물을 활용한 OEM/ODM 고마진 가공식품 직접 침투 수직 계열화 전략 필요.',
        source: '글로벌 참치 무역 데이터 + 한국소비자원 가격정보 (2023.04~2024.03)',
      }}
    />
  );
}
