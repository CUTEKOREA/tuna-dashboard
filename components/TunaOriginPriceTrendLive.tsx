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
import { ChartPatternDefs } from './ChartPatterns';

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
    <div style={{ background: '#0a0f1f', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: 'var(--w-slate-50)', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>
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
      title="참치 산지 단가 추이"
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
              <stop offset="100%" stopColor="var(--w-blue-500)" />
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(140,170,255,0.10)' }} />
          <Bar dataKey="price" fill="url(#tunaOriginPriceLiveGradient)" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>2026년 5월 기준 글로벌 5개 항구 Skipjack(가다랑어) 평균 가격 <strong>1,659 USD/MT</strong>.</p>
<p>항구별 격차:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>동태평양(Manta, 에콰도르)</strong>: 2,000 USD/MT</li>
<li><strong>서태평양(Bangkok)</strong>: 1,975 USD/MT</li>
<li><strong>지중해(Vigo, 스페인)</strong>: 1,600 USD/MT</li>
<li><strong>서인도양(Seychelles)</strong>: 1,500 USD/MT</li>
<li><strong>서아프리카(Abidjan)</strong>: <strong>1,220 USD/MT</strong> (최저)</li>
</ul>
<p>동·서태평양 vs 서아프리카 가격 격차 약 <strong>60% 프리미엄</strong>. 이유: ① 어획 비용 차이 ② 물류 거리 ③ 가공 인프라 성숙도. 서아프리카는 원물 자체는 싸지만 EU·아시아 항구까지 물류비를 더하면 실제 도착가는 다를 수 있음 — 따로 시뮬레이션 필요.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 5개 항구 가격 격차는 단순 비교가 아닌 <strong>"global arbitrage map"</strong>. 어디서 사고 어디서 가공·판매하느냐의 routing 결정이 마진을 좌우.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>"Abidjan 원물 + Vigo 가공" 코스트 시뮬레이션</strong>: Q2 어획 시즌(5-8월) 진입 전 매입 routing 결정. 물류·가공 원가 절감 여부는 시뮬레이션 후 확인 필요.</li>
<li style="margin-bottom: 8px;"><strong>"Origin-Destination matrix optimization"</strong>: 5개 항구 × 3개 가공 거점(태국·에콰도르·베트남) × 4개 최종 시장(미국·EU·일본·중동) = 60가지 조합. ML 모델로 quarterly 최적 routing 산출.</li>
<li><strong>"Skipjack 가격 모니터링 체계화"</strong>: 5개 항구 가격 spread를 정기 추적하여 매입 타이밍·산지 선택의 근거 자료로 활용. Skipjack 선물/파생상품 시장은 미성숙 상태로 현물 매입 최적화가 현실적 대안.</li>
</ol>
</div>`,
        source: 'Atuna 시장가 인덱스 (Bangkok·Manta·Seychelles·Abidjan·Vigo, 2026-03-31~2026-05-12 latest)',
      }}
    />
  );
};

export default TunaOriginPriceTrendLive;
