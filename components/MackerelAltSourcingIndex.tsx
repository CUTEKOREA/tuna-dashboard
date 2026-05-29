'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Ship } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/mackerel/mackerel_alt_sourcing_index.json';

export default function MackerelAltSourcingIndex() {
  const chart = (
    <LineChart data={rawData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
      <XAxis dataKey="q" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
      <YAxis stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`$${v}`} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
      <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)' }} />
      <Legend wrapperStyle={{ fontSize: '11px' }} />
      <Line type="monotone" dataKey="norway" name="노르웨이산" stroke="#38bdf8" strokeWidth={3} />
      <Line type="monotone" dataKey="uk" name="영국산" stroke="#cbd5e1" strokeDasharray="5 5" />
      <Line type="monotone" dataKey="ireland" name="아일랜드산" stroke="var(--color-success)" />
      <Line type="monotone" dataKey="chile" name="칠레산" stroke="var(--color-warning)" strokeWidth={2} />
    </LineChart>
  );

  return (
    <WidgetCard
      title="대체 공급망 단가 매력도 지수"
      icon={Ship}
      pillar="S1"
      cardDesc="노르웨이를 제치고 부상 중인 칠레, 아일랜드, 영국산 고등어의 C&F 수입단가(USD/kg) 상대 추이 트래킹입니다. 분기별 통관단가 기준"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chart={chart}
      takeaway={{
        situation: `<div>
<p>"대체 소싱 지수(Alt-Sourcing Index)"란 단일 원산지 의존도가 무너졌을 때 vendor가 대체할 수 있는 sourcing pool의 가격·품질 매력도. 노르웨이 단일 의존에서 영국/아일랜드/칠레로 분기되는 fragmentation 진행.</p>
<p>실측: <strong>노르웨이산 hyper-premium tier · 영국·아일랜드산 1.5 tier 차익거래 침투 · 칠레/페루산 vol leader low-cost 잠식 — 시장이 명확한 3-tier segmentation 진입</strong>. 단일 origin 시대는 종료, capital allocation 재설계 필요 국면.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: vendor lock-in은 함정이 아닌 <strong>"채널별 sourcing tier를 분리해 capital allocation을 정밀 분기시킬 황금 기회"</strong>.</p>
<p><strong>3단계</strong>: ① B2B 통조림/식자재 유통 라인 — 칠레산 low-cost network로 전면 개편 ② B2C 대형마트 매대 — 노르웨이 프리미엄 브랜드 독점력 강화에 capital 100% 집중 ③ 영국·아일랜드산은 1.5 tier 차익거래 instrument로 한정 운용 — bifurcated capital allocation lock.</p>
</div>`,
        source: "관세청 HS Customs · UN Comtrade"
      }}
    />
  );
}
