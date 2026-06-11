'use client';

import React, { useMemo } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import WidgetCard from './WidgetCard';
import { TrendingUp } from 'lucide-react';
import rawData from '../data/MackerelNorwaySpread.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function MackerelNorwaySpread() {
  const chartData = useMemo(() => {
    return rawData.map(d => ({ ...d, margin: d.domesticPrice - d.importCost }));
  }, []);

  const ChartArea = (
    <SafeResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
        <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`₩${v/1000}k`} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
        <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`₩${v}`} tick={{ fill: '#34d399', fontSize: 10 }} />
        <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius:'8px' }} />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
        <Bar yAxisId="right" dataKey="margin" name="총 마진 폭(Spread)" fill="var(--color-success)" opacity={0.6} />
        <Line yAxisId="left" type="monotone" dataKey="importCost" name="노르웨이 수입원가" stroke="var(--color-danger)" strokeWidth={2} dot={false} />
        <Line yAxisId="left" type="monotone" dataKey="domesticPrice" name="국내 도매가" stroke="#38bdf8" strokeWidth={2} dot={false} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );

  return (
    <WidgetCard
      title="노르웨이 직수입 원가 스프레드"
      description="수입단가 상승폭 대비 도매가 전가 추이"
      cardDesc="수협중앙회·KMI 도매가·수입원가 분기 데이터 기반 자체 추정(illustrative)"
      pillar="S3"
      telemetry={{ status: 'STATIC', syncDate: '2025-10-01' }}
      icon={TrendingUp}
      takeaway={{
        source: '수협중앙회 · KMI 한국해양수산개발원 (자체 추정)',
        situation: `<div>
<p>"마진 스퀴즈(가격 압착)"란 매입원가 상승이 손익에 즉시 반영되나, 판가 인상이 소비자 가격 탄력성에 막혀 지연되는 구간을 말한다. 노르웨이 직수입 구조에서 반복 관찰되는 수익성 악화 패턴이다.</p>
<p>차트 추이(자체 추정): <strong>노르웨이산 수입 원가가 2023년 초 대비 약 +114% 상승하는 동안 국내 도매가도 동반 상승하여, 스프레드는 300원/kg(23.01) → 1,100원/kg(25.04) 수준으로 확대 추세</strong>. 단, 추정치이므로 실제 계약 원가·유통 마진과 차이가 있을 수 있다.</p>
</div>`,
        actionPlan: `<div>
<p><strong>원가 모니터링</strong>: 수입 원가 급등 구간에서 도매가 전가 속도가 뒤처지는 일시적 스퀴즈 리스크가 발생할 수 있다. 유동성 헤지와 재고 운용 계획을 사전에 수립하여 스프레드 압착 구간을 방어한다.</p>
<p><strong>대응 방향</strong>: ① 원가 상승 조기 감지 시 국내 방출 일정 조정으로 마진 보호 ② 동남아 등 관세가 낮은 환적 채널을 차익거래 보완 옵션으로 검토.</p>
</div>`,
      }}
    >
      <div style={{ width: '100%', height: 350 }}>
        {ChartArea}
      </div>
    </WidgetCard>
  );
}
