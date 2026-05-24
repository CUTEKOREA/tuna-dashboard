/**
 * PNG 가공 허브 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 74줄 → After 53줄 (-28%)
 */

'use client';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Anchor } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function TunaPngHubStrategy() {
  const [data, setData] = useState<any[] | null>(null);

  useEffect(() => {
    fetch('/api/tuna-extract')
      .then((r) => r.json())
      .then((j) => setData(j.d_n1_png_hub))
      .catch(() => setData([]));
  }, []);

  if (!data) return null;

  return (
    <WidgetCard
      title="N1. 태평양 가공 허브 (PNG) vs 국내 조달 원가율 비교"
      icon={Anchor}
      iconColor="#f59e0b"
      pillar="S2"
      cardDesc="동원 RD Tuna Canners PNG 거점의 산지 1차 가공 vs 국내 직조달 cost-type별 단가 비교"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
      chartHeight={280}
      chart={
        <BarChart data={data} layout="vertical" margin={{ left: 50 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis dataKey="cost_type" type="category" stroke="#94a3b8" fontSize={11} width={120} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend />
          <Bar dataKey="domestic" name="국내 직조달 ($/톤)" fill="#ef4444" />
          <Bar dataKey="png_hub" name="PNG 산지 추출 ($/톤)" fill="#10b981" />
        </BarChart>
      }
      takeaway={{
        situation: '동원산업은 파푸아뉴기니(PNG)에 RD Tuna Canners를 구축해 현지 가공 허브 선점. 냉동 원물을 한국으로 들여와 가공할 경우 냉동 보관·내륙 물류비가 누적되지만, 산지에서 즉시 해체·1차 자숙액 추출 시 물류비·보관비 70%+ 절감.',
        actionPlan: '1) \'산지 1차 가공 → 국내 고도화 숙성\' 글로벌 분업 모델을 활용해 국내 중소 경쟁사(한라식품 등) 대비 매입원가 진입장벽 구축. 2) PNG 허브를 동남아·호주 직수출 전초 기지로 격상.',
        source: '동원산업 글로벌 Value Chain 전략 분석 + 수산물류 비용 구조 데이터',
      }}
    />
  );
}
