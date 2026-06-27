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
import { ChartPatternDefs } from './ChartPatterns';

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
    telemetry={{ status: 'STATIC', syncDate: 'FAO FishStatJ 2023' }}
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
      situation: `<div>
<p>"모든 길은 도쿄로" — 고부가가치 양식 참다랑어 글로벌 수출의 극단적 일본 집중 패턴. 글로벌 양식 참다랑어 수출의 <strong>60~75%가 일본 단독 행</strong>.</p>
<p>이 구조의 위험성: 일본 단일 시장에 의존하는 공급자는 ① 일본 내수 침체 시 매출 50%+ 직격 ② 엔저 심화 시 수익성 즉각 붕괴 ③ 일본 상사(미쓰비시·미쓰이) 매입 협상력에 100% 종속.</p>
<p>의미: 수출 다변화 없는 공급자는 환율·거시경제 변수에 단일종목 노출. 그러나 일본 외 시장(미국·UAE·홍콩)도 이미 일본 비교 가격으로 묶여있어 자체 브랜드 파워 없이는 진입 어려움.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 일본 의존 탈피는 단순 채널 분산이 아닌 <strong>"한국산 참다랑어 독자 브랜드 구축"</strong>. 일본 바이어 위탁 라벨에서 독립한 자체 브랜드만이 글로벌 다변화 가능.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>강제 다변화</strong>: 일본 비중 75% → 50%로 강제 축소. 미국 25% + UAE 15% + 홍콩 10%로 4개국 포트폴리오 구성.</li>
<li style="margin-bottom: 8px;"><strong>"K-블루핀 프리미엄" 자체 브랜드 출시</strong>: 일본 위탁 라벨 거래 → 한국 브랜드 직접 수출 전환. LA·NY·두바이·홍콩 미슐랭 스시 직거래 채널 선점.</li>
<li><strong>"한국산 참다랑어" 글로벌 마케팅</strong>: 한국 정부(해양수산부·aT) 협력 — 글로벌 한식 마케팅 예산에 한국산 참다랑어 편입. 한류 콘텐츠 연계 홍보로 브랜드 인지도 가속.</li>
</ol>
</div>`,
      source: 'FAO FishStatJ Farmed Export Destination Share',
    }}
  />
);

export default TunaExportShare;
