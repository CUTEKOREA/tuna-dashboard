'use client';
import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Scissors } from 'lucide-react';
import WidgetCard from './WidgetCard';
import data from '../data/squid_size_premium.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function SquidSizePremium() {
  return (
    <WidgetCard
      title="크기/중량별 시장 프리미엄 지수"
      icon={Scissors}
      iconColor="#8b5cf6"
      pillar="S2"
      cardDesc="해수온 상승발 대형개체 품귀 및 고부가가치 타겟팅"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `₩${val / 1000}k`} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Area type="monotone" dataKey="premium_gap" name="프리미엄 갭 (Gap)" fill="rgba(139, 92, 246, 0.2)" stroke="none" />
          <Line type="monotone" dataKey="small" name="소형어 (150-200g)" stroke="var(--text-secondary)" strokeWidth={2} />
          <Line type="monotone" dataKey="large" name="대형어 (600g+)" stroke="#8b5cf6" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"중량 프리미엄(Size Premium)"이란 어체 사이즈에 따른 도매 단가 격차. 기상 이변으로 어체 왜소화 가속.</p>
<p>실측: <strong>대형 규격(Large/Jumbo) 품귀 → 소형 대비 도매 톤당 단가 스프레드 기하급수 폭발</strong>. 초격차 size premium 시대.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 무차별 도매 출하 중단. <strong>"Premium Arbitrage Optimization"</strong>.</p>
<p><strong>3단계</strong>: ① 그레이딩 자동화 설비로 대형 개체 100% Skimming ② 호텔·고급 일식체인 VVIP 직납 ③ 조업 타겟팅 알고리즘을 대형 개체 서식 수온·수심으로 재조정 — ASP +200~300% 프리미엄.</p>
</div>`,
        source: "수협 위탁 단가 및 수산 시장 동향",
      }}
    />
  );
}
