'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import WidgetCard from './WidgetCard';
import { BarChart2 } from 'lucide-react';
import { getMackerelData } from '@/lib/data/mackerel';

const rawData = getMackerelData('sizePremium');

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
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
        <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
        <YAxis stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`${v}x`} tick={{ fill: 'var(--color-warning)', fontSize: 10, fontWeight: 'bold' }} />
        <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(255,255,255,0.2)' }} />
        <Area type="monotone" dataKey="multiplier" name="대형 가격 배수" stroke="var(--color-warning)" strokeWidth={3} fillOpacity={1} fill="url(#colorMult)" />
      </AreaChart>
    </SafeResponsiveContainer>
  );

  return (
    <WidgetCard
      title="사이즈간 체급 프리미엄 배수"
      description="소형어(200g 미만) 대비 대형어(300g+) 가격 배수 추이"
      cardDesc="업계 경매·산지 단가 자체추정(illustrative) — 공인 통계 미존재"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2026-06-05' }}
      icon={BarChart2}
      takeaway={{
        situation: `<div>
<p>"체급 프리미엄 배수(Size Premium Multiplier)"란 대형(300g+) 가격을 소형(200g-) 가격으로 나눈 비율. 정상 시장은 2~3배, 5배 초과는 구조적 양극화, 7배 이상은 두 시장이 사실상 분리된 상태로 업계에서 판단한다.</p>
<p>업계 추정 기준: 해양 생태계 변화로 국내산 대형 개체 어획량이 감소하면서 대·소형 간 가격 스프레드가 확대 추세. 차트상 배수는 자체추정(illustrative)이며 공인 통계로 확인된 값이 아니다. 대형은 고급 외식·선물 수요, 소형은 가공 원료 채널로 수요 구조가 분화되고 있는 것으로 관측된다.</p>
</div>`,
        actionPlan: `<div>
<p><strong>포지셔닝 전환 검토</strong>: 대형 체급은 희소성 기반 프리미엄 채널(백화점·호텔 직납)에, 소형 체급은 자체 HMR 원료로 이원화하는 구조가 현실적 대안이다. 단, 대형 물량 확보 가능성과 선단 조달 조건을 사전 검증한 뒤 투자 규모를 결정해야 한다.</p>
<p><strong>데이터 확보 우선</strong>: 현 배수 추정치는 공인 출처가 없으므로, 수협·산지 경매 데이터를 기반으로 실측치를 확보하기 전까지는 내부 방향성 참고 수준으로만 활용한다.</p>
</div>`,
        source: '업계 경매·산지 단가 자체추정 (illustrative — 공인 통계 미존재)',
      }}
    >
      <div style={{ width: '100%', height: 350 }}>
        {ChartArea}
      </div>
    </WidgetCard>
  );
}
