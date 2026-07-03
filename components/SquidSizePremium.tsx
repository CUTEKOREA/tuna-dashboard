'use client';
import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Scissors } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { getSquidData } from '@/lib/data/squid';
import { ChartPatternDefs } from './ChartPatterns';

const data = getSquidData('sizePremium');

export default function SquidSizePremium() {
  return (
    <WidgetCard
      title="크기/중량별 시장 프리미엄 지수"
      icon={Scissors}
      iconColor="#8b5cf6"
      pillar="S2"
      cardDesc="해수온 상승발 대형개체 품귀 및 고부가가치 타겟팅 (업계추정·illustrative)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `₩${val / 1000}k`} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Area type="monotone" dataKey="premium_gap" name="프리미엄 갭 (Gap)" fill="rgba(139, 92, 246, 0.2)" stroke="none" />
          <Line type="monotone" dataKey="small" name="소형어 (150-200g)" stroke="var(--text-secondary)" strokeWidth={2} />
          <Line type="monotone" dataKey="large" name="대형어 (600g+)" stroke="#8b5cf6" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"중량 프리미엄(크기 프리미엄)"이란 어체 사이즈에 따른 도매 단가 격차. 기상 이변으로 어체 왜소화 경향이 관측되고 있음.</p>
<p>업계추정 기준: 대형 규격 품귀 심화 → 소형 대비 도매 톤당 단가 스프레드가 2020년 대비 2024년 약 3.6배 수준으로 확대되는 추세(illustrative 합성치, 수협 시장 동향 기반 업계추정).</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 무차별 도매 출하 중단. 크기별 차별 출하 전략("프리미엄 차익 최적화")으로 전환.</p>
<p><strong>3단계</strong>: ① 그레이딩 자동화 설비로 대형 개체 선별 집중 ② 호텔·고급 일식체인 직납 채널 확보 ③ 조업 타겟팅을 대형 개체 서식 수온·수심으로 재조정 — 단가 스프레드 확대 추세를 마진으로 전환 가능.</p>
</div>`,
        source: "업계추정 (수협 시장 동향 기반 illustrative 합성치, 실측 API 미연동)",
      }}
    />
  );
}
