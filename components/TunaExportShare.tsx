/**
 * 양식 참다랑어 글로벌 수출 점유율 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 109줄 → After 68줄 (-38%)
 */

'use client';
import React from 'react';
import { Anchor } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import rawData from '../data/tuna_export_share.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const colors: Record<string, string> = {
  '일본': '#ef4444',
  '몰타': '#8b5cf6',
  '미국': '#3b82f6',
  '기타 (Others)': '#64748b',
};
const defaultColors = ['#f59e0b', '#22c55e', '#ec4899', '#06b6d4', '#a855f7'];
const getColor = (dest: string, idx: number) => colors[dest] || defaultColors[idx % defaultColors.length];

const allKeys = new Set<string>();
(rawData as any[]).forEach((row) => {
  Object.keys(row).filter((k) => k !== 'Exporter').forEach((k) => allKeys.add(k));
});
const destinations = Array.from(allKeys);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{label} 수출 내역</p>
      {payload.filter((e: any) => e.value > 0).map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '4px 0 0 0', fontSize: '0.8rem' }}>
          <span>→ {entry.name}: </span>
          <strong>{Number(entry.value).toLocaleString()} 톤</strong>
        </p>
      ))}
    </div>
  );
};

const TunaExportShare = () => (
  <WidgetCard
    title="양식 참다랑어 글로벌 수출 점유율"
    icon={Anchor}
    iconColor="#ef4444"
    pillar="S4"
    cardDesc="FAO FishStatJ 무역 데이터에서 양식 생산 10개국 발 수출만 추출. 고부가가치 참다랑어의 극단적 일본 단일 시장 종속 구조 시각화"
    telemetry={{ status: 'SYNCED', syncDate: 'FAO FishStatJ' }}
    chartHeight={380}
    chart={
      <BarChart data={rawData as any[]} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis dataKey="Exporter" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
        <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        {destinations.map((dest, idx) => (
          <Bar key={dest} dataKey={dest} stackId="a" fill={getColor(dest, idx)} radius={idx === destinations.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
        ))}
      </BarChart>
    }
    takeaway={{
      situation: '고부가가치 양식 참다랑어 수출의 극단적 일본 집중도 — \'모든 길은 도쿄로\'. 수출 다변화 없이는 단일 시장 의존 리스크 극대화.',
      actionPlan: '일본 내수 침체나 엔저 심화 시 수익성 즉각 붕괴. 구매자를 미국과 UAE(두바이) 최고급 하이엔드 레스토랑 타겟으로 강제 다변화. 한국산 참다랑어를 일본 바이어 화이트라벨 납품에서 탈피해 자체 프리미엄 K-Bluefin 브랜드로 독립.',
      source: 'FAO FishStatJ Farmed Export Destination Share',
    }}
  />
);

export default TunaExportShare;
