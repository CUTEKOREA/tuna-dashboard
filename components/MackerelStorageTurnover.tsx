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
      cardDesc="전국 냉동 보세창고의 수입 임치 물량 적재 면적과 해당 분기 도매상의 출하 속도(회전일수)를 상호 모니터링하여 병목과 체화 징후를 탐지합니다. 수치는 업계 유통 패턴 기반 자체 추정(illustrative)입니다."
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chart={chart}
      takeaway={{
        situation: `<div>
<p>"재고 회전일수"란 창고에 적재된 물량이 출하되기까지 평균 소요 일수. 업계 통상 콜드체인 기준 25~30일이 정상 범위이며, 40일 초과 시 체화(Hoarding) 의심 구간으로 분류됩니다(자체 추정 기준, illustrative).</p>
<p>시나리오 추정: <strong>적재 물량 증가 + 출고 정체가 동시에 발생할 경우 회전일수가 정상 대비 2배 수준까지 상승할 수 있음</strong>. 보세 임치 물량의 비정상 누적은 계절적 수요 급등 전후 단가 변동 위험 시그널로 작용할 수 있습니다. 실제 카르텔 여부는 공정위 자료 등 별도 확인이 필요합니다.</p>
</div>`,
        actionPlan: `<div>
<p><strong>체화 시나리오 대응</strong>: 회전일수 이상 급등 시점은 직수입 물량의 출하 타이밍 조율로 도매 단계 협상력을 높일 수 있는 구간.</p>
<p><strong>3단계 검토</strong>: ① 직수입 재고 방출 시점을 도매 시장 체화 해소 구간과 맞춰 단가 방어 ② 주요 도매 채널과 분기 물량·판가 협상을 사전 구조화 ③ 다음 분기 회전일수 25~30일 이내 정상화 여부를 KPI로 모니터링.</p>
</div>`,
        source: "자체 추정(업계 유통 패턴 기반, illustrative) — 실제 보세창고 체화 데이터는 관세청·KCS 별도 확인 필요"
      }}
    />
  );
}
