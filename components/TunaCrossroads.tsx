/**
 * 글로벌 참다랑어 Catch vs Farmed — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 85줄 → After 57줄 (-33%)
 */

'use client';
import React from 'react';
import { Anchor } from 'lucide-react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ComposedChart } from 'recharts';
import data from '../data/tuna_crossroad.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{`${label}년 참다랑어 공급`}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '4px 0 0 0', fontSize: '0.8rem' }}>
          <span>{entry.name}: </span>
          <strong>{Number(entry.value).toLocaleString()} 톤</strong>
        </p>
      ))}
    </div>
  );
};

const TunaCrossroads = () => (
  <WidgetCard
    title="글로벌 참다랑어 생산량 크로스로드 (Catch vs Farmed)"
    icon={Anchor}
    iconColor="#8b5cf6"
    pillar="S1"
    cardDesc="참다랑어 자연 어획량(쿼터로 1980년 이후 정체) vs 축양/양식량(우상향 돌파)을 ComposedChart로 결합"
    telemetry={{ status: 'SYNCED', syncDate: 'FAO FishStatJ' }}
    chartHeight={350}
    chart={
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis dataKey="Year" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
        <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} tickFormatter={(v) => `${v.toLocaleString()}`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Area type="monotone" dataKey="Wild_Volume" name="자연 어획량 (Wild Catch)" fill="rgba(139, 92, 246, 0.2)" stroke="#8b5cf6" strokeWidth={2} />
        <Line type="monotone" dataKey="Aqua_Volume" name="축양/양식량 (Aquaculture)" stroke="#22c55e" strokeWidth={4} dot={false} activeDot={{ r: 8 }} />
      </ComposedChart>
    }
    takeaway={{
      situation: '엄격한 글로벌 쿼터로 천연산 참다랑어 어획량이 1980년 이후 정체. 반면 축양·양식 생산량은 우상향 돌파해 산업 구조의 근본적 전환 진행 중.',
      actionPlan: '어획(자연산) 중심 사업은 글로벌 쿼터 규제로 성장 정체. 성장의 돌파구는 양식·축양. 기존 원양어선 투자를 줄이고 완전양식(Closed-cycle) R&D 및 해상 가두리 인프라에 자본 재배치. 천연 치어 쿼터 삭감 시 종묘 가격 폭등에 대비해 핵심 Hatchery와 JV 또는 지분 투자로 원물 소스 선점.',
      source: 'FAO FishStatJ — Bluefin Tuna Wild Catch vs Aquaculture',
    }}
  />
);

export default TunaCrossroads;
