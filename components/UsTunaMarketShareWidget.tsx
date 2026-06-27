'use client';
import { useMemo } from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import WidgetCard from './WidgetCard';
import { monthlyCountryShare, HS_LABEL_KR, META, dataRange } from '../lib/usCensusData';

const COLORS = ['#0ea5e9', '#ef4444', '#f59e0b', '#10b981', '#6366f1'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a0f1f', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '4px 0 0 0', fontSize: '0.8rem' }}>
          <span>{entry.name}: </span>
          <strong>{Number(entry.value).toFixed(1)}%</strong>
        </p>
      ))}
    </div>
  );
};

const UsTunaMarketShareWidget = () => {
  const { series, countries, dataKeys } = useMemo(() => monthlyCountryShare('160414', 5), []);
  const { end } = dataRange('160414');

  return (
    <WidgetCard
      title="미국 참치캔 공급국 점유율"
      icon={PieChartIcon}
      iconColor="#ef4444"
      pillar="S3"
      cardDesc={`미국 인구조사국(US Census Bureau) + USITC DataWeb 수입액 기준 상위 5개국 월별 점유율 (HS 160414, ${HS_LABEL_KR['160414']})`}
      unit="(단위: %, 100% 누적)"
      telemetry={{ status: META.status, syncDate: end }}
      chartHeight={320}
      chart={
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} angle={-45} textAnchor="end" height={50} />
            <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={(v) => `${v}%`} tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            {dataKeys.map((k, i) => (
              <Area
                key={k}
                type="monotone"
                dataKey={k}
                name={countries[i]}
                stackId="1"
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      }
      takeaway={{
        situation: `미국 참치캔 수입 시장은 태국이 지속적으로 45~55% 점유율로 1위를 차지하며 글로벌 가공 허브 지위를 유지하고 있습니다. 베트남·에콰도르가 합산 25~30%로 추격 중이고, 인도네시아·필리핀은 5~10% 박스권에서 정체. 한국은 ${countries.includes('한국') ? '소수 진입' : '의미 있는 점유율 미진입'} 상태로 글로벌 미국 시장에서의 존재감이 미미합니다.`,
        actionPlan: '신라교역은 태국 단일 거점 의존을 깨고 에콰도르(EU·미국 무관세 우대) + 베트남(VKFTA 활용) 가공 위탁 라인을 동시 가동하여 단가 협상력을 확보. 미국 Costco·Sam\'s Club PB 라인업에 한국 브랜드 SKU 1개 이상을 락업하여 5년 안에 한국 점유율 3%p 진입을 목표한다.',
        source: `U.S. 인구조사국 무역 통계 · prefetch ${META.coverage} · Reliability: ${META.reliabilityGrade}`,
      }}
    />
  );
};

export default UsTunaMarketShareWidget;
