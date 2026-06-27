'use client';
import { useMemo } from 'react';
import { DollarSign } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';
import { monthlyTotals, HS_LABEL_KR, META, dataRange } from '../lib/usCensusData';

const fmtMillion = (v: number) => `$${(v / 1_000_000).toFixed(0)}M`;
const fmtUnit = (v: number) => `$${v.toFixed(2)}`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a0f1f', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '4px 0 0 0', fontSize: '0.8rem' }}>
          <span>{entry.name}: </span>
          <strong>
            {entry.dataKey === 'unitPrice'
              ? `$${Number(entry.value).toFixed(2)}/kg`
              : `$${(Number(entry.value) / 1_000_000).toFixed(1)}M`}
          </strong>
        </p>
      ))}
    </div>
  );
};

const UsTunaImportWidget = () => {
  const chartData = useMemo(() => monthlyTotals('160414').map((m) => ({
    time: m.time, value: m.valueUSD, unitPrice: m.unitPriceUSDperKg,
  })), []);
  const { end } = dataRange('160414');

  return (
    <WidgetCard
      title="미국 참치캔 수입 추이 및 단가"
      icon={DollarSign}
      iconColor="#0ea5e9"
      pillar="S4"
      cardDesc={`미국 인구조사국(US Census Bureau) + USITC DataWeb 월별 수입 통계 (HS 160414, ${HS_LABEL_KR['160414']}) — 총 수입액과 평균 단가 동시 추적`}
      unit="(단위: $M / $/kg)"
      telemetry={{ status: META.status, syncDate: end }}
      chartHeight={320}
      chart={
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} angle={-45} textAnchor="end" height={50} />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" tickFormatter={fmtMillion} tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" tickFormatter={fmtUnit} tick={{ fill: '#0ea5e9', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            <Bar yAxisId="left" dataKey="value" name="수입액 ($M)" fill="url(#pattern-cyan)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
            <Line yAxisId="right" type="monotone" dataKey="unitPrice" name="평균 단가 ($/kg)" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      }
      takeaway={{
        situation: '미국은 세계 최대 참치캔 소비 시장으로 월 평균 1억 달러 이상을 수입합니다. 2021~2024년 단가는 글로벌 가다랑어(Skipjack) FOB 가격과 강한 동행성을 보이며 $4~7/kg 박스에서 움직입니다. 단가 상승 국면에서는 미국 소매가 전가가 평균 2~3개월 지연되어 수입사 마진이 일시적으로 압축됩니다.',
        actionPlan: '미국 단가 변곡점을 선행 지표로 활용해 한국→미국 캔/파우치 수출 판가 인상 타이밍을 1개월 앞당기고, 신라교역은 단가 $5.5/kg 돌파 시 자동으로 미국向 OEM 가격을 재협상하는 트리거 운영을 도입한다.',
        source: `U.S. 인구조사국 무역 통계 · prefetch ${META.coverage} · Reliability: ${META.reliabilityGrade}`,
      }}
    />
  );
};

export default UsTunaImportWidget;
