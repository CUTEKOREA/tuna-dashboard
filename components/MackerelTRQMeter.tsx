'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Clock } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/mackerel/mackerel_trq_meter.json';

const COLORS = ['var(--color-danger)', 'rgba(255,255,255,0.1)'];

export default function MackerelTRQMeter() {
  const chart = (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PieChart>
        <Pie data={rawData} cx="50%" cy="80%" startAngle={180} endAngle={0} innerRadius={100} outerRadius={140} paddingAngle={2} dataKey="value" stroke="none">
          {rawData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
      </PieChart>
      <div style={{ position: 'absolute', top: '70%', textAlign: 'center', transform: 'translateY(-50%)' }}>
        <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-danger)' }}>89%</div>
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginTop: '-5px' }}>도매시장 관세 절벽 임박</div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="정부 정책 TRQ 방출 임박 게이지"
      icon={Clock}
      pillar="S3"
      cardDesc="물가 안정을 위해 수입 고등어에 배정되는 무관세 TRQ(연 1~2만 톤 내외) 추정 소진율(자체추정·illustrative). 소진 완료 시 관세가 재부과됩니다."
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chart={chart}
      takeaway={{
        situation: `<div>
<p>"TRQ(Tariff-Rate Quota, 무관세 쿼터)"란 일정 물량까지만 0% 관세 적용, 초과 시 기본 관세(10~22%) 원복하는 제도.</p>
<p>자체추정(illustrative) 기준 소진율 89% 수준으로, 잔여 TRQ가 소진될 경우 기본 관세 원복으로 조달 원가가 상승할 수 있어 주의가 필요하다. 실제 관세청 TRQ 고시를 통해 최신 소진 현황을 직접 확인할 것.</p>
</div>`,
        actionPlan: `<div>
<p><strong>전략 방향</strong>: TRQ 소진 임박 시점은 조달 타이밍 관리의 핵심 변수. 잔여 TRQ 범위 내 선제 통관(Front-loading)으로 0% 관세 구간을 최대한 확보한다.</p>
<p>관세청 TRQ 고시의 실시간 소진 현황을 모니터링하며 쿼터 소진 후 도매가 상승분을 선제적으로 단가에 반영, 마진 훼손을 최소화한다.</p>
</div>`,
        source: "관세청 TRQ 고시"
      }}
    />
  );
}
