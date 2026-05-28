'use client';
import { useMemo } from 'react';
import { ShieldAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import WidgetCard from './WidgetCard';
import { monthlyByCountries, META, dataRange, krCountry } from '../lib/usCensusData';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '4px 0 0 0', fontSize: '0.8rem' }}>
          <span>{entry.name}: </span>
          <strong>{`$${(Number(entry.value) / 1_000_000).toFixed(1)}M`}</strong>
        </p>
      ))}
    </div>
  );
};

const TARGET = ['VIETNAM', 'INDONESIA', 'CHINA'];

const UsPolicyImpactWidget = () => {
  const chartData = useMemo(() => monthlyByCountries('160414', TARGET), []);
  const { end } = dataRange('160414');

  return (
    <WidgetCard
      title="UFLPA 발효 후 동남아·중국 가공국 수출 추이"
      icon={ShieldAlert}
      iconColor="#f59e0b"
      pillar="S5"
      cardDesc="미국 인구조사국(US Census Bureau) + USITC 데이터 — 위구르강제노동방지법(UFLPA, 2022-06 발효) 전후 중국·베트남·인도네시아의 미국 참치캔 수출액 월별 추적"
      unit="(단위: $M)"
      telemetry={{ status: META.status, syncDate: end }}
      chartHeight={320}
      chart={
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} angle={-45} textAnchor="end" height={50} />
            <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`} tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            <ReferenceLine x="2022-06" stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'UFLPA 발효', fill: '#ef4444', fontSize: 11 }} />
            <Line type="monotone" dataKey="CHINA" name={krCountry('CHINA')} stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="VIETNAM" name={krCountry('VIETNAM')} stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="INDONESIA" name={krCountry('INDONESIA')} stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      }
      takeaway={{
        situation: '2022년 6월 UFLPA 발효 이후 중국산 참치 가공품 미국 수입은 검역 강화로 정체·감소세를 보이고, 베트남·인도네시아가 그 빈자리를 흡수하며 수출액이 단계적으로 우상향. 정책 발효 시점이 가공국 점유 재편의 명확한 변곡점으로 데이터에 기록됐습니다.',
        actionPlan: '중국 가공 의존 물량을 베트남·인도네시아 위탁 라인으로 선제 이전하여 미국 비관세 장벽 리스크를 원천 차단. 신라교역은 2026년 안에 중국 가공 비중을 10% 이하로 낮추고, 베트남 OEM 파트너 1개사와 5년 장기 위탁 계약을 락업한다.',
        source: `U.S. 인구조사국 무역 통계 · prefetch ${META.coverage} · Reliability: ${META.reliabilityGrade}`,
      }}
    />
  );
};

export default UsPolicyImpactWidget;
