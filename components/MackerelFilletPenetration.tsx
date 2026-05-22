'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import WidgetCard from './WidgetCard';
import TakeawayBox from './TakeawayBox';
import { ShoppingCart } from 'lucide-react';
import rawData from '../data/MackerelFilletPenetration.json';

export default function MackerelFilletPenetration() {
  const chartData = useMemo(() => rawData, []);

  const ChartArea = (
    <SafeResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorFillet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
        <YAxis tickFormatter={(val) => `${val}%`} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
        <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
        <Area type="monotone" dataKey="filletShare" name="간편식 밥상 점유율(%)" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorFillet)" />
      </AreaChart>
    </SafeResponsiveContainer>
  );

  return (
    <WidgetCard
      title="순살 필렛(Fillet) HMR 체제 전환 가속"
      subtitle="HS 코드가 병합되어 공공 통계에서는 잡히지 않는 B2C 마트 판매 데이터를 역산한, 대가리/뼈를 제거한 HMR 가공재형의 B2C 시장 침투율입니다."
      icon={ShoppingCart}
    >
      <div style={{ width: '100%', height: 350 }}>
        {ChartArea}
      </div>
      <TakeawayBox
        situation="1인 가구 폭증 및 에어프라이어(Air-fryer) 보급의 매크로 메가트렌드가 재래식 H&G(원물) 소비를 완전히 멸종시키며, 전처리(Pre-processed) 완료된 순살 필렛(Fillet)의 내수 침투율이 62%를 돌파하는 구조적 B2C 밸류업 변곡점에 도달했습니다."
        actionPlan="[Supply Chain Front-loading] 단순 트레이딩 시대는 종료되었습니다. 당사 자동화 필레팅 공정의 수율과 CAPA를 사수하기 위해, 차기 년도 노르웨이 공급망 체결 시 단순 원물이 아닌 최소 H&G(Head/Gut 제거) 이상 등급의 스펙(Spec) 선확보 조항을 독점적으로 강제(Mandate)하여 원물 손실 리스크(Yield Loss)를 해외 패커에게 사전 전가."
      />
    </WidgetCard>
  );
}
