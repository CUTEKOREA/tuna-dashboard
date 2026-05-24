'use client';

import React, { useMemo } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import WidgetCard from './WidgetCard';
import TakeawayBox from './TakeawayBox';
import { TrendingUp } from 'lucide-react';
import rawData from '../data/MackerelNorwaySpread.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function MackerelNorwaySpread() {
  const chartData = useMemo(() => {
    return rawData.map(d => ({ ...d, margin: d.domesticPrice - d.importCost }));
  }, []);

  const ChartArea = (
    <SafeResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
        <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`₩${v/1000}k`} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
        <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`₩${v}`} tick={{ fill: '#34d399', fontSize: 10 }} />
        <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius:'8px' }} />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
        <Bar yAxisId="right" dataKey="margin" name="총 마진 폭(Spread)" fill="var(--color-success)" opacity={0.6} />
        <Line yAxisId="left" type="monotone" dataKey="importCost" name="노르웨이 수입원가" stroke="var(--color-danger)" strokeWidth={2} dot={false} />
        <Line yAxisId="left" type="monotone" dataKey="domesticPrice" name="국내 도매가" stroke="#38bdf8" strokeWidth={2} dot={false} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );

  return (
    <WidgetCard
      title="노르웨이 직수입 원가 스프레드"
      subtitle="수입단가 상승폭 대비 도매가 전가 지연"
      icon={TrendingUp}
    >
      <div style={{ width: '100%', height: 350 }}>
        {ChartArea}
      </div>
      <TakeawayBox
        source="수협중앙회 & KMI"
        situation="북해 연안국 간 쿼터 분쟁 격화로 노르웨이산 수입 매입원가가 +66% 수직 상승(Cost-Push)했으나, 국내 내수 시장의 강력한 소비 탄력성 저항선(Price Ceiling)에 부딪혀 도매 판가 인상이 지연되는 전형적인 마진 스퀴즈(Margin Squeeze) 위협 구간입니다."
        actionPlan="[Liquidity & Inventory Hedging] 톤당 마진 스프레드가 500원(KRW) 하단 임계치를 붕괴할 경우, 국내 방출 스케줄을 전면 셧다운(Hold) 하십시오. 창고 롤오버(Rollover) 비용을 감수하더라도 시장 내 숏티지를 인위적으로 유발하여 판가를 견인하거나, 관세 장벽이 낮은 동남아 등 제3국으로 전량 환적하는 차익 거래 채널을 즉각 가동해야 합니다."
      />
    </WidgetCard>
  );
}
