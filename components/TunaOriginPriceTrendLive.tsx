/**
 * 참치 산지 단가 추이 (Live) — Stage 2.1 Pilot 위젯
 *
 * spec: artifacts/spec_tuna_origin_live.md
 * pillar: S1 (🐟 원료 수급)
 * gradient: cyan → blue
 * ADR-0005 WidgetCard 사용. fetch로 JSON 로드.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

interface TunaPriceData {
  region: string;
  price: number;
  change: number;
  asOf: string;
  port: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { region, price, change, asOf } = payload[0].payload as TunaPriceData;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>
        {region} · {price.toLocaleString()} USD/MT · 전월 대비 {change > 0 ? '+' : ''}{change}% · {asOf}
      </p>
    </div>
  );
};

const TunaOriginPriceTrendLive = () => {
  const [data, setData] = useState<TunaPriceData[]>([]);

  useEffect(() => {
    fetch('/data/tuna/origin_price_trend.json')
      .then((r) => r.json())
      .then((json) => setData(json.data))
      .catch((err) => console.error('Failed to fetch tuna origin price data:', err));
  }, []);

  return (
    <WidgetCard
      title="참치 산지 단가 추이 (Live)"
      icon={MapPin}
      iconColor="#22d3ee"
      pillar="S1"
      cardDesc="Atuna 글로벌 시장가 인덱스 5개 항구(서아프리카·서태평양·동태평양·서인도양·지중해) Skipjack 최신 단가"
      unit="(USD/MT)"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      termTooltip={{
        term: 'Atuna · Skipjack',
        description: 'Atuna는 글로벌 참치 시장 가격 인덱스이며, Skipjack은 통조림용으로 주로 쓰이는 가다랑어입니다.',
      }}
      chartHeight={300}
      chart={
        <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <ChartPatternDefs />
          <defs>
            <linearGradient id="tunaOriginPriceLiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis
            dataKey="region"
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
            tickFormatter={(v) => v.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="price" fill="url(#tunaOriginPriceLiveGradient)" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: '2026년 5월 기준 5개 항구 Skipjack 평균 1,659 USD/MT. **동태평양(Manta 2,000) > 서태평양(Bangkok 1,975) > 지중해(Vigo 1,600) > 서인도양(Seychelles 1,500) > 서아프리카(Abidjan 1,220)** 순. 동태평양·서태평양 단가 격차가 서아프리카 대비 ~60% 프리미엄, 어획 비용·물류 거리·가공 인프라 차이 반영.',
        actionPlan: '서아프리카(Abidjan) 1,220 USD/MT는 5개 항구 중 최저 — 원물 매입 비용 측면 우위. 단 EU 항구(Vigo)·아시아 시장으로의 물류비를 더해야 실 도착가가 산출됨. Q2 어획 시즌(5-8월) 진입 전 *Abidjan 원물 + Vigo 가공* 코스트 시뮬레이션 1주 내 실행 권고.',
        source: 'Atuna 시장가 인덱스 (Bangkok·Manta·Seychelles·Abidjan·Vigo, 2026-03-31~2026-05-12 latest)',
      }}
    />
  );
};

export default TunaOriginPriceTrendLive;
