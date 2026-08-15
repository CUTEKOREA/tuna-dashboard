'use client';
import { useMemo } from 'react';
import { Route } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import WidgetCard from './WidgetCard';
import { monthlyByCountries, HS_LABEL_KR, META, dataRange, krCountry } from '../lib/usCensusData';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a0f1f', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: 'var(--w-slate-50)', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '4px 0 0 0', fontSize: '0.8rem' }}>
          <span>{entry.name}: </span>
          <strong>{`$${(Number(entry.value) / 1_000_000).toFixed(2)}M`}</strong>
        </p>
      ))}
    </div>
  );
};

const TARGET = ['RUSSIA', 'CHINA', 'INDONESIA'];

const UsPollockDetourWidget = () => {
  const chartData = useMemo(() => monthlyByCountries('030475', TARGET), []);
  const { end } = dataRange('030475');

  return (
    <WidgetCard
      title="러시아산 명태 우회 무역 추이"
      icon={Route}
      iconColor="#ef4444"
      pillar="S3"
      cardDesc={`미국 인구조사국(US Census Bureau) + USITC + USTR 제재 데이터 — 미국 대러 수산물 수입 금지(2022-03) 전후 ${HS_LABEL_KR['030475']} 의 중국 가공 우회 경로 추적 (HS 030475)`}
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
            <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--w-slate-300)' }} />
            <ReferenceLine x="2022-03" stroke="var(--w-red-500)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '대러 수산물 수입 금지', fill: 'var(--w-red-500)', fontSize: 11 }} />
            <Line type="monotone" dataKey="RUSSIA" name={`${krCountry('RUSSIA')} (직접)`} stroke="var(--w-amber-500)" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="CHINA" name={`${krCountry('CHINA')} (이중냉동 가공)`} stroke="var(--w-red-500)" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="INDONESIA" name={`${krCountry('INDONESIA')} (신규)`} stroke="var(--w-emerald-500)" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      }
      takeaway={{
        situation: '2022년 3월 미국의 대러 수산물 수입 금지 이후 러시아산 명태 직수입은 사실상 소멸했으나, 러시아 원어를 중국에서 이중 냉동 가공한 필렛(HS 030475)이 여전히 미국 수입의 다수를 차지합니다. 이는 사실상 제재 우회로, 미국 NOAA·NMFS가 SIMP 강화로 다음 단계 차단을 예고한 상태.',
        actionPlan: '중국 우회 물량이 추가 제재 대상에 편입될 가능성에 대비해, 신라교역은 (1) 알래스카 명태(MSC 인증) 직수입 비중을 단기 50% 이상으로 확대, (2) 미국 내 수산물 가공 벤더 등록(SIMP 인증)을 선제 추진해 완제품 직수출 채널을 확보한다.',
        source: `U.S. 인구조사국 무역 통계 · prefetch ${META.coverage} · Reliability: ${META.reliabilityGrade}`,
      }}
    />
  );
};

export default UsPollockDetourWidget;
