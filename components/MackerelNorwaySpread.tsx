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
        source="수협중앙회 · KMI 한국해양수산개발원"
        situation={`<div>
<p>"마진 스퀴즈(Margin Squeeze)"란 매입원가 상승은 즉시 P&L에 반영되나, 판가 인상은 소비자 price elasticity에 막혀 지연되는 구간. 노르웨이 수입 vendor의 가장 빈번한 P&L 파괴 패턴.</p>
<p>실측: <strong>북해 연안국 쿼터 분쟁 격화로 노르웨이산 수입 원가 +66% cost-push, 국내 도매 판가 전가 지연 → 톤당 마진 스프레드가 500원/kg 하단 임계치 붕괴 위험</strong>. 마진 스퀴즈가 vendor 도산 1순위 시그널.</p>
</div>`}
        actionPlan={`<div>
<p><strong>재정의</strong>: 마진 스퀴즈는 외생 변수가 아닌 <strong>"liquidity 헤지 + inventory 재고 매니지먼트로 정밀 헷지 가능한 운영 instrument"</strong>.</p>
<p><strong>3단계</strong>: ① 마진 스프레드 500원/kg 하한선 붕괴 시 국내 방출 스케줄 즉시 셧다운(Hold) ② 창고 rollover 비용 감수하고 의도적 shortage 유발 → 판가 견인 ③ 동남아 등 관세 장벽 낮은 제3국 환적 차익거래 채널 즉시 가동.</p>
</div>`}
      />
    </WidgetCard>
  );
}
