'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import WidgetCard from './WidgetCard';
import TakeawayBox from './TakeawayBox';
import { BarChart2 } from 'lucide-react';
import rawData from '../data/MackerelSizePremium.json';

export default function MackerelSizePremium() {
  const chartData = useMemo(() => rawData, []);

  const ChartArea = (
    <SafeResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorMult" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
        <YAxis stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`${v}x`} tick={{ fill: 'var(--color-warning)', fontSize: 10, fontWeight: 'bold' }} />
        <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)' }} />
        <Area type="monotone" dataKey="multiplier" name="대형 가격 배수" stroke="var(--color-warning)" strokeWidth={3} fillOpacity={1} fill="url(#colorMult)" />
      </AreaChart>
    </SafeResponsiveContainer>
  );

  return (
    <WidgetCard
      title="사이즈간 체급 프리미엄 배수"
      subtitle="소형어(200g 미만) 가격을 "
      icon={BarChart2}
    >
      <div style={{ width: '100%', height: 350 }}>
        {ChartArea}
      </div>
      <TakeawayBox
        situation={`<div>
<p>"체급 프리미엄 배수(Size Premium Multiplier)"란 대형(300g+) 가격을 소형(200g-) 가격으로 나눈 비율. 정상 시장은 2~3x, 5x 초과는 양극화, 7x+는 super-polarization으로 시장 구조 자체가 분리된 상태.</p>
<p>실측: <strong>해양 생태계 변화로 국내산 대형 biomass 절멸 → 대-소 체급 스프레드 7배 multiple 팽창. 대형은 prestige goods, 소형은 사료/HMR 원료로 시장 자체가 둘로 분기된 super-polarization 완성</strong>. 단일 product 전략은 dead model.</p>
</div>`}
        actionPlan={`<div>
<p><strong>재정의</strong>: 대형 체급은 단순 소비재가 아닌 <strong>"Veblen Good(과시재) 등급으로 격상된 limited-supply luxury asset"</strong>.</p>
<p><strong>3단계</strong>: ① 최상위 선단 pre-financing 선도자금 투입 → 대형물 100% 싹쓸이 ② 소형물은 자체 HMR 브랜드의 순살 가공 블렌딩 원료로 강제 치환 ③ 대형 = 백화점·호텔 직판 luxury 채널, 소형 = 마트·편의점 HMR 양극 tiering 설계 완성.</p>
</div>`}
      />
    </WidgetCard>
  );
}
