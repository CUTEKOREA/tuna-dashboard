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
        situation={`<div>
<p>"H&G(Head & Gut removed)"란 머리·내장 제거 단계로, 원물의 1차 전처리 등급. "Fillet(순살 필렛)"은 뼈·껍질까지 제거한 HMR 최종 가공품으로 B2C 직접 소비 가능한 최고 부가가치 등급.</p>
<p>실측: <strong>1인 가구 폭증 + 에어프라이어 보급으로 재래식 H&G(원물) 소비 멸종 → 순살 필렛 내수 침투율 62% 돌파. 단순 원물 트레이딩 시대 종료, HMR 가공품 시장이 B2C 가치사슬의 본질로 전환</strong>. HS 코드 병합으로 공공통계에 포착되지 않는 sub-market 폭증.</p>
</div>`}
        actionPlan={`<div>
<p><strong>재정의</strong>: 가공은 부가 옵션이 아닌 <strong>"원물 수율 손실 리스크를 해외 패커에게 사전 전가하는 supply chain front-loading 무기"</strong>.</p>
<p><strong>3단계</strong>: ① 노르웨이 공급망 계약 시 최소 H&G 등급 이상 spec 선확보 조항 독점 강제 ② 자동화 필레팅 라인 수율·capa 사수 capex ③ B2C HMR 필렛 직판 채널(쿠팡·마켓컬리) 직접 운영 — 60% 마진 수직 통합.</p>
</div>`}
      />
    </WidgetCard>
  );
}
