/**
 * 한국 양식 참다랑어 수입 경쟁력 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 101줄 → After 70줄 (-31%)
 */

'use client';
import React from 'react';
import { Anchor } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import data from '../data/tuna_korea_position.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{`${label}년 한국 참다랑어 수입`}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '4px 0 0 0', fontSize: '0.8rem' }}>
          <span>{entry.name}: </span>
          <strong>{entry.dataKey === 'Value' ? `$${Number(entry.value).toLocaleString()}천` : `${Number(entry.value).toLocaleString()} 톤`}</strong>
        </p>
      ))}
      {payload.length >= 2 && payload[0].value > 0 && (
        <p style={{ color: '#fbbf24', margin: '4px 0 0 0', fontSize: '0.8rem' }}>
          <span>추정 단가: </span><strong>${(payload[1].value / payload[0].value * 1000).toFixed(0)}/톤</strong>
        </p>
      )}
    </div>
  );
};

const TunaKoreaPosition = () => (
  <WidgetCard
    title="한국의 양식 참다랑어 수입 경쟁력"
    icon={Anchor}
    iconColor="#38bdf8"
    pillar="S3"
    cardDesc="FAO FishStatJ에서 참다랑어 양식 Top 10국 → 한국 수입 물량·금액 이중 Y축. 물량 정체에도 수입액 견고 — 한국 \'프리미엄 오마카세 성지\' 증거"
    telemetry={{ status: 'SYNCED', syncDate: '관세청 + FAO' }}
    chartHeight={350}
    chart={
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis dataKey="Year" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
        <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fill: '#38bdf8', fontSize: 12 }} tickFormatter={(v) => `${v.toLocaleString()}`} />
        <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{ fill: '#f43f5e', fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}M`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar yAxisId="left" dataKey="Volume" name="수입량 (톤)" fill="url(#a11y-stripe-h)" color="#38bdf8" fillOpacity={0.8} radius={[4, 4, 0, 0]} barSize={40} />
        <Line yAxisId="right" type="monotone" dataKey="Value" name="수입액 (천 USD)" stroke="#f43f5e" strokeWidth={4} dot={{ r: 5 }} activeDot={{ r: 8 }} />
      </ComposedChart>
    }
    takeaway={{
      situation: '한국 참다랑어 수입의 물량 대비 금액 증가 속도가 빨라 단가 구조적 상승(프리미엄화) 뚜렷. 한국이 아시아 최대 고급 Omakase 시장으로 부상.',
      actionPlan: '매입원가 상승 압박(환율·물류비) 방어를 위해 선물환(FX Forward) 헷지 계약 체결. 일본 단순 중계를 넘어 사시미·초밥 세트 가공 설비에 신규 자본 투입. 국내 하이엔드 HoReCa 직납 비중을 40%+로 확대해 중간 유통 부가가치 내재화.',
      source: '관세청 수입통계 + FAO FishStatJ',
    }}
  />
);

export default TunaKoreaPosition;
