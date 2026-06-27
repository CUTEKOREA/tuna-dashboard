'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Ship } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/mackerel/mackerel_alt_sourcing_index.json';

export default function MackerelAltSourcingIndex() {
  const chart = (
    <LineChart data={rawData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
      <XAxis dataKey="q" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
      <YAxis stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`$${v}`} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
      <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(255,255,255,0.2)' }} />
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
      cardDesc="노르웨이·영국·아일랜드·칠레산 고등어 C&F 수입단가(USD/kg) 상대 추이. 분기별 통관단가 기준. ※ 자체추정(illustrative) — 관세청·UN Comtrade 기반 추산치"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chart={chart}
      takeaway={{
        situation: `<div>
<p>"대체 소싱 지수"란 단일 원산지 의존도가 흔들릴 때 바이어가 전환할 수 있는 공급처 풀의 가격·품질 매력도를 뜻한다. 추산 데이터 기준, 노르웨이 단일 의존에서 영국·아일랜드·칠레로 공급선이 분산되는 흐름이 관측된다.</p>
<p>추정 추이: <strong>노르웨이산 고가 프리미엄 구간 · 영국·아일랜드산 중가 구간 침투 · 칠레산 저가 물량 구간 확대 — 3단계 가격 구간 분리 진행 가능성</strong>. 단일 원산지 의존 구조가 완화되는 국면으로, 조달 포트폴리오 재검토가 필요한 시점으로 판단된다.</p>
</div>`,
        actionPlan: `<div>
<p><strong>전략 재정의</strong>: 단일 원산지 집중은 리스크이자 동시에 <strong>"채널별 조달 구간을 분리해 투자 배분을 정밀화할 기회"</strong>로 재해석 가능.</p>
<p><strong>3단계 조달 포트폴리오</strong>: ① B2B 통조림·식자재 유통 라인 — 칠레산 저가 물량망으로 전환 검토 ② B2C 대형마트 매대 — 노르웨이 프리미엄 브랜드 집중 강화 ③ 영국·아일랜드산은 중가 구간 차익거래 보조 수단으로 한정 운용. 단, 추정치 기반 판단이므로 실통관 단가 확인 후 결정 권고.</p>
</div>`,
        source: "관세청 HS Customs · UN Comtrade"
      }}
    />
  );
}
