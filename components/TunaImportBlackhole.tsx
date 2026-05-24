/**
 * 참다랑어 양식 블랙홀 수입국 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 99줄 → After 60줄 (-39%)
 */

'use client';
import React from 'react';
import { Anchor } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import data from '../data/tuna_import_blackhole.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '4px 0 0 0', fontSize: '0.8rem' }}>
          <span>총 수입량: </span>
          <strong>{Number(entry.value).toLocaleString()} 톤</strong>
        </p>
      ))}
    </div>
  );
};

const getBarColor = (country: string) => {
  if (country === '일본') return '#ef4444';
  if (country === '한국') return '#3b82f6';
  return '#64748b';
};

const TunaImportBlackhole = () => (
  <WidgetCard
    title="참다랑어 양식 블랙홀 수입국 분석"
    icon={Anchor}
    iconColor="#ef4444"
    pillar="S4"
    cardDesc="FAO FishStatJ 양자 무역 데이터로 세계 10대 참다랑어 양식국 발 \'양식 오리진\' 수입 물량을 합산 — 2019~2023 일본 블랙홀 구조 분석"
    telemetry={{ status: 'SYNCED', syncDate: 'FAO FishStatJ' }}
    chartHeight={380}
    chart={
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
        <XAxis type="number" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <YAxis type="category" dataKey="Country" width={140} stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="Volume" radius={[0, 6, 6, 0]} barSize={22}>
          {(data as any[]).map((entry, i) => <Cell key={i} fill={getBarColor(entry.Country)} />)}
        </Bar>
      </BarChart>
    }
    takeaway={{
      situation: '전 세계 양식 참다랑어 수입의 과반을 일본이 빨아들이는 블랙홀 구조 확인. 글로벌 소비 접근의 구조적 병목.',
      actionPlan: '도쿄 츠키지·도요스 경매 우회. 최대 산지인 호주·지중해(몰타) 양식장과 산지 직거래 채널 개통으로 중간 유통마진 회수. 한국발 미국·EU 직수출 프리미엄 브랜드의 가격 경쟁력 확보.',
      source: 'FAO FishStatJ Farmed Bluefin Import Volume',
    }}
  />
);

export default TunaImportBlackhole;
