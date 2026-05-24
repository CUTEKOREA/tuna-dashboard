'use client';
import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Target } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/mackerel_african_export_roi.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function MackerelAfricanExportROI() {
  const data = rawData as any[];

  const ChartObj = (
    <div style={{ height: '250px', width: '100%' }}>
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="m" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
        <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`$${v}`} tick={{ fill: 'var(--color-danger)', fontSize: 10 }} />
        <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`${v}%`} tick={{ fill: 'var(--color-success)', fontSize: 10 }} />
        <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)' }} />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
        <Area yAxisId="left" type="monotone" dataKey="freightRate" name="해운 운임 (SCFI)" fill="var(--color-danger)" opacity={0.15} stroke="none" />
        <Line yAxisId="right" type="step" dataKey="margin" name="가나 수출 ROI" stroke="var(--color-success)" strokeWidth={3} />
      </ComposedChart>
    </div>
  );

  return (
    <WidgetCard
      title="가나 수출 수익률 기반 AI 운송 판별기"
      icon={Target}
      iconColor="#ef4444"
      pillar="S3"
      cardDesc="상해컨테이너운임지수(SCFI) 변동을 변수로 한 서아프리카(가나) 냉동고등어 20ft 컨테이너당 수출 실 마진율 시뮬레이션입니다."
      telemetry={{ status: 'STATIC', syncDate: '2024-03' }}
      customBody={ChartObj}
      takeaway={{
        situation: "아프리카향 하위 티어(소형어) 수출 포트폴리오는 원물 펀더멘털보다 글로벌 해상 운임 지수(SCFI) 변동성에 마진이 완벽히 종속되는 극단적 운임 민감도(Freight-Elastic) 구조입니다. 특정 임계점 돌파 시 즉각적 OPM(영업Bottom-line(순이익)률) 적자 전환이 발생합니다.",
        actionPlan: "[Agile Channel Switching] 컨테이너 운임 임계치가 내부 모델링 하한선을 이탈하는 순간, 선적 스케줄을 즉시 Force Majeure(불가항력) 급으로 보류(Hold) 하십시오. 악성 재고화 방지를 위해 차라리 국내 양식장 생사료(Feed) 체인으로 전량 저가 매각(Dump)하여 워킹캐피탈(Working Capital)을 긴급 회수하는 '손절 룰베이스 스위칭' 매뉴얼을 전사 적용.",
        source: "상하이해운거래소 및 자체 모델링",
      }}
    />
  );
}
