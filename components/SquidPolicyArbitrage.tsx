'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceDot } from 'recharts';
import { Activity } from 'lucide-react';
import WidgetCard from './WidgetCard';
import data from '../data/squid_policy_arbitrage.json';

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (payload.policy_event) {
    return (
      <svg x={cx - 10} y={cy - 10} width={20} height={20} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" fill="var(--color-danger)" stroke="var(--text-primary)" strokeWidth="2" />
      </svg>
    );
  }
  return <circle cx={cx} cy={cy} r={3} fill="#06b6d4" />;
};

export default function SquidPolicyArbitrage() {
  return (
    <WidgetCard
      title="관세 및 정책 이벤트 연동 차익거래"
      icon={Activity}
      iconColor="#fca5a5"
      pillar="S3"
      cardDesc="금어기·비축물량·조정관세 패턴 기반 illustrative 시나리오 (관세청 공고·해수부 캘린더 참조)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <LineChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `₩${(val / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }}
            labelStyle={{ color: 'var(--text-primary)' }}
            itemStyle={{ color: '#bae6fd' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
          <Line type="monotone" dataKey="domestic_price" name="국내 도매가 (원)" stroke="#fca5a5" strokeWidth={2} dot={<CustomDot />} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="import_price" name="도착 수입원가 (원)" stroke="#06b6d4" strokeWidth={2} dot={false} />
          {data.filter(d => Boolean(d.policy_event)).map((item, index) => (
            <ReferenceDot key={index} x={item.month} y={item.policy_event ?? 0} r={6} fill="var(--color-danger)" stroke="none" />
          ))}
        </LineChart>
      }
      takeaway={{
        situation: `<div>
<p>정책 차익거래란 정부 정책 이벤트(비축 방출·조정관세 인하)가 시장가에 미치는 인위적 영향을 활용하는 매매 전략이다. 차트는 illustrative 시나리오 기반.</p>
<p>패턴: <strong>명절 직전 정부 비축물량 방출 + 조정관세 22% → 할당관세 인하 이벤트마다 수입업자 매입 러시 → 시장가 인위적 압박</strong>. 예측 가능한 반복 패턴.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 단순 거시 스프레드 의존은 위험. <strong>정밀 창고 전략(Precision Warehousing)</strong>이 본질.</p>
<p><strong>3단계</strong>: ① 정책 이벤트 캘린더 시스템화 ② 조정관세 완화 예상 시점 직전 남반구 성수기 물량을 보세 창고 재고로 풀기 ③ 방출 이벤트 직후 시중 본격 유통 — 타이밍 차익거래로 마진 개선 여지.</p>
</div>`,
        source: "관세청 조정관세 공고·해수부 비축물량 방출 캘린더 참조 (illustrative 시나리오)",
      }}
    />
  );
}
