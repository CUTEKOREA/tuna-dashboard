'use client';
import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Snowflake } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/mackerel/mackerel_storage_turnover.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function MackerelStorageTurnover() {
  const chart = (
    <ComposedChart data={rawData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
      <ChartPatternDefs />
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
      <XAxis dataKey="p" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
      <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
      <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`${v}일`} tick={{ fill: '#fbbf24', fontSize: 10, fontWeight:'bold' }} />
      <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
      <Legend wrapperStyle={{ fontSize: '11px' }} />
      <Area yAxisId="left" type="monotone" dataKey="storageVolume" name="창고 내 적재 물량(톤)" fill="rgba(6,182,212,0.15)" stroke="none" />
      <Line yAxisId="right" type="monotone" dataKey="turnoverDays" name="평균 재고 체류시간(일)" stroke="#fbbf24" strokeWidth={3} />
    </ComposedChart>
  );

  return (
    <WidgetCard
      title="보세 냉동창고 매점매석/체화 추적기"
      icon={Snowflake}
      pillar="S3"
      cardDesc="전국 냉동 보세창고의 수입 임치 물량 적재 면적과 해당 분기 도매상의 출하 속도(회전일수)를 상호 모니터링하여 병목과 담합을 탐지합니다."
      telemetry={{ status: 'LIVE' }}
      chart={chart}
      takeaway={{
        situation: `<div>
<p>"재고 회전일수(Inventory Turnover Days)"란 창고에 적재된 물량이 출하되기까지 평균 소요 일수. 정상 콜드체인은 25~30일, 40일 초과 시 매점매석(Hoarding) 의심 구간.</p>
<p>실측: <strong>적재 물량 폭증 + 출고 정체로 회전일수 52일 돌파 — 정상 대비 2배 체화. 관세 부과·성수기 단가 폭등 직전 메이저 도매 벤더들의 카르텔성 hoarding 정황</strong>. 보세 임치 물량의 비정상 누적은 short-squeeze 사전 시그널.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 매점매석 카르텔은 위협이 아닌 <strong>"직수입 레버리지를 휘두를 황금 타이밍"</strong>.</p>
<p><strong>3단계</strong>: ① 직수입 물량 출하를 의도적 차단(counter-squeeze) — 도매 카르텔 재고 가치 폭락 유도 ② 최상위 도매 채널에 판가 협상권 100% 백지위임 강요 ③ 다음 분기 회전일수 25일 이내로 정상화 + 독점 프라이싱 파워 확보.</p>
</div>`,
        source: "관세청 보세창고 재고 텔레메트리 (자체 모니터링)"
      }}
    />
  );
}
