'use client';
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import WidgetCard from './WidgetCard';
import priceData from '../data/squid_unit_price.json';

const COUNTRY_COLORS: Record<string, string> = {
  '중국': 'var(--color-danger)',
  '페루': 'var(--color-warning)',
  '스페인': '#8b5cf6',
  '인도': 'var(--color-success)',
  '아르헨티나': '#06b6d4',
  '인도네시아': '#ec4899',
  '일본': 'var(--color-info)',
  '한국': '#fbbf24',
  '모로코': '#f97316',
  '베트남': '#14b8a6',
  '태국': '#6366f1',
  '칠레': '#a855f7',
};

const PriceTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].filter((p: any) => p.value != null).sort((a: any, b: any) => b.value - a.value);
  return (
    <div style={{
      background: 'rgba(0, 15, 30, 0.95)', border: '1px solid rgba(34, 197, 94, 0.4)',
      padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', minWidth: '200px',
    }}>
      <p style={{ margin: '0 0 10px', fontWeight: 'bold', fontSize: '1.05rem', color: '#4ade80', borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: '8px' }}>{label}년 수출 단가 ($/t)</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
        {sorted.map((entry: any, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: entry.color, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }} />
              {entry.name}
            </span>
            <span style={{ fontWeight: 600 }}>${entry.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SquidUnitPrice() {
  const [activeCountries, setActiveCountries] = useState<Set<string>>(new Set(['중국', '페루', '일본', '한국', '스페인', '모로코']));

  const toggleCountry = (c: string) => {
    setActiveCountries(prev => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const toggles = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
      {Object.entries(COUNTRY_COLORS).map(([c, color]) => (
        <button
          key={c}
          onClick={() => toggleCountry(c)}
          style={{
            padding: '4px 10px', borderRadius: '8px', border: `1px solid ${color}40`,
            background: activeCountries.has(c) ? `${color}30` : 'rgba(255,255,255,0.03)',
            color: activeCountries.has(c) ? color : 'rgba(255,255,255,0.3)',
            fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
          }}
        >
          {c}
        </button>
      ))}
    </div>
  );

  const chart = (
    <div style={{ width: '100%', height: 380 }}>
      <LineChart width={800} height={380} data={priceData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }} style={{ maxWidth: '100%' }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}K`} />
        <Tooltip content={<PriceTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '11px' }} iconType="circle" />
        {Object.entries(COUNTRY_COLORS).map(([country, color]) => {
          if (!activeCountries.has(country)) return null;
          return (
            <Line
              key={country}
              type="monotone"
              dataKey={country}
              name={country}
              stroke={color}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          );
        })}
      </LineChart>
    </div>
  );

  return (
    <WidgetCard
      title="주요국 오징어 수출 평균 단가 추이 (2000-2023)"
      icon={TrendingUp}
      iconColor="#4ade80"
      pillar="S4"
      cardDesc="고부가 가공국(모로코·일본·스페인) vs 원물 벌크 수출국(페루·아르헨) 간 단가 격차 비교 — 수출액÷수출량으로 산출"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      customBody={<>{toggles}{chart}</>}
      takeaway={{
        situation: "일본($11,894/t)과 모로코($10,072/t)는 프리미엄 식자재 수요를 바탕으로 최고 단가 시장을 형성하고 있습니다. 반면, 태국($7,995/t)과 베트남($6,292/t)은 가공 거점으로서 견고한 단가를 유지 중이며, 페루($2,060/t)나 칠레($1,677/t) 등 원물 생산국들의 수입 단가와는 최대 5~6배에 달하는 극단적 갭을 보여줍니다. 한국($4,583/t)은 수입 단가가 스페인 수준이긴 하나 역성장하며 가공 경쟁력을 잃고 있습니다.",
        actionPlan: "한국 내수 시장의 저가 원물 수입 후 단순 유통하는 방식에서 벗어나, 고부가가치 창출 구조로 전환해야 합니다. 이탈리아·스페인의 타파스(Tapas)용 HMR이나 일본의 세븐일레븐 편의점용 프리미엄 안주류 패키징을 벤치마킹하여 'K-안주(K-Snack)' 형태의 고단가 가공품으로 전환, 수익성이 검증된 수출 시장 및 일본 내수 시장 진입을 모색.",
        source: "FAO FishStatJ Squid Import Unit Price by Country",
      }}
    />
  );
}
