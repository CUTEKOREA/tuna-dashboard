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
        <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
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
      cardDesc="물가 안정을 위해 수입 고등어에 배정되는 무관세 TRQ(연 1~2만 톤 내외) 실시간 소진율. 소진 완료 시 관세가 재부과됩니다."
      telemetry={{ status: 'LIVE' }}
      chart={chart}
      takeaway={{
        situation: "무관세 쿼터(TRQ) 소진율이 89% 리스크 수위를 상향 돌파하며, 단기 내 기본 관세(10~22%) 원복에 따른 밸류체인 전반의 조달 원가 폭등 및 치명적인 마진 훼손(Margin Erosion) 리스크가 카운트다운에 돌입했습니다.",
        actionPlan: "[Regulatory Arbitrage Strategy] 경쟁 벤더들의 통관 지연 및 매입원가 패닉을 철저히 이용하십시오. 잔여 TRQ를 선제적으로 싹쓸이 통관(Front-loading)하여 제로(0) 관세율을 확정 지은 후, 1개월 뒤 관세가 전가된 도매 시장 평균 단가 상단에 맞춰 당사 재고를 스팟 방출(Spot Release)하는 '마켓 메이커(Market Maker)' 수준의 초과 수익을 추출해야 합니다.",
        source: "관세청 TRQ 고시"
      }}
    />
  );
}
