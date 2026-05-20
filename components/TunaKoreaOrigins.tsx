/**
 * 한국 양식 참다랑어 수입 출처 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 132줄 → After 80줄 (-39%)
 */

'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Anchor } from 'lucide-react';
import koreaOriginsData from '../data/tuna_korea_import_origins.json';
import WidgetCard from './WidgetCard';

const formatNumber = (n: number) => new Intl.NumberFormat('en-US').format(n);

const colors: Record<string, string> = {
  '일본': '#ef4444', '호주': '#f59e0b', '튀르키예': '#22c55e', '스페인': '#8b5cf6',
  '몰타': '#06b6d4', '모로코': '#ec4899', '기타 (Others)': '#64748b',
};
const defaultColors = ['#ec4899', '#06b6d4', '#a855f7', '#3b82f6'];

const allKeys = new Set<string>();
(koreaOriginsData as any[]).forEach((item) => {
  Object.keys(item).forEach((k) => {
    if (k !== 'Year' && k !== '기타 (Others)') allKeys.add(k);
  });
});
const origins = Array.from(allKeys);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: '#0F172A', border: '1px solid #334155', padding: '12px', borderRadius: '8px', color: '#f8fafc' }}>
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{`${label}년`}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ margin: '4px 0', color: entry.color, display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          <span>{entry.name}:</span>
          <span style={{ fontWeight: 'bold' }}>{formatNumber(entry.value)} 톤</span>
        </p>
      ))}
      <div style={{ borderTop: '1px solid #334155', marginTop: '8px', paddingTop: '8px' }}>
        <p style={{ margin: 0, display: 'flex', justifyContent: 'space-between', gap: '16px', color: '#f8fafc' }}>
          <span>총합:</span>
          <span style={{ fontWeight: 'bold' }}>{formatNumber(payload.reduce((acc: number, c: any) => acc + c.value, 0))} 톤</span>
        </p>
      </div>
    </div>
  );
};

const TunaKoreaOrigins = () => (
  <WidgetCard
    title="한국의 양식 참다랑어 수입 출처"
    icon={Anchor}
    iconColor="#8b5cf6"
    pillar="S3"
    cardDesc="FAO FishStatJ 한국 참다랑어 수입 5년치를 양식 Top 10 국가 발만 추출 — 튀르키예·스페인 등 지중해 축양이 한국 프리미엄 시장 장악"
    telemetry={{ status: 'SYNCED', syncDate: '관세청 + FAO FishStatJ' }}
    chartHeight={300}
    chart={
      <BarChart data={koreaOriginsData as any[]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={40}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
        <XAxis dataKey="Year" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${formatNumber(v)}`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        {origins.map((origin, i) => (
          <Bar key={origin} dataKey={origin} stackId="a" fill={colors[origin] || defaultColors[i % defaultColors.length]} animationDuration={2000} />
        ))}
        <Bar key="기타 (Others)" dataKey="기타 (Others)" stackId="a" fill={colors['기타 (Others)']} animationDuration={2000} />
      </BarChart>
    }
    takeaway={{
      situation: '한국 참다랑어 수입의 원산지 비중 변화. 지중해권(튀르키예·스페인·몰타) 축양 물량이 한국 프리미엄 시장을 장악하는 흐름 진행 중.',
      actionPlan: '한국 고급 Omakase 타겟팅에는 자연산 조업보다 지중해 축양 물량 락인이 필수. 일본 상사 경유 패시브 소싱에서 벗어나 유럽 현지 탑티어 팜과 독점적 장기 구매 계약을 직접 확보. 지방 함량(Otoro) 균일성 등 프리미엄 지표를 마케팅 전면에.',
      source: '관세청 수입통계 HSK 0303.41/0303.42 + FAO FishStatJ',
    }}
  />
);

export default TunaKoreaOrigins;
