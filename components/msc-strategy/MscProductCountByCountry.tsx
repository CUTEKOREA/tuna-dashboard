'use client';

import React from 'react';
import { Boxes, Zap } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList
} from 'recharts';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';

/* ── Data: 국가별 '판매 중인 MSC 라벨 소비자 제품 수(SKU)' ───────────────────
   출처: MSC Annual Report 2024-25 Supplementary Data (liveproductcount 시트)
   2024/25 기준 + 2009/10 대비 성장 배수. 이탈리아는 10→1,105개로 110배 폭증.   */

const ITALY = '#ef4444';
const BASE = '#38bdf8';

const countryData = [
  { country: '독일',     count: 2402, base: 700, mult: '3.4배', hot: false },
  { country: '프랑스',   count: 2280, base: 133, mult: '17배',  hot: true },
  { country: '미국',     count: 1380, base: 253, mult: '5.5배', hot: false },
  { country: '영국',     count: 1255, base: 281, mult: '4.5배', hot: false },
  { country: '이탈리아', count: 1105, base: 10,  mult: '110배', hot: true },
  { country: '네덜란드', count: 964,  base: 301, mult: '3.2배', hot: false },
  { country: '벨기에',   count: 830,  base: 34,  mult: '24배',  hot: true },
  { country: '스위스',   count: 820,  base: 151, mult: '5.4배', hot: false },
  { country: '스웨덴',   count: 816,  base: 106, mult: '7.7배', hot: false },
  { country: '덴마크',   count: 509,  base: 86,  mult: '5.9배', hot: false },
];

const tooltipStyle = {
  backgroundColor: 'rgba(20, 28, 52, 0.95)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: '0.78rem',
  padding: '8px 12px',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ color: '#94a3b8' }}>제품 수 (2024/25)</span>
        <span style={{ fontWeight: 700 }}>{d.count.toLocaleString()}개</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 2 }}>
        <span style={{ color: '#94a3b8' }}>2009/10 대비</span>
        <span style={{ fontWeight: 600, color: d.hot ? ITALY : BASE }}>{d.mult} ({d.base.toLocaleString()}개→)</span>
      </div>
    </div>
  );
};

export default function MscProductCountByCountry() {
  return (
    <WidgetCard
      id="W-MSC29"
      title="국가별 MSC 제품 수 성장"
      icon={Boxes}
      iconColor="#38bdf8"
      pillar="S4"
      cardDesc="판매 중인 MSC 라벨 소비자 제품 수(SKU) — 2024/25 기준, 2009/10 대비 성장 배수 병기"
      unit="개"
      telemetry={{ status: 'STATIC', syncDate: '2024-25' }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          <div style={{ width: '100%', height: 300 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} layout="vertical" margin={{ top: 4, right: 52, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
                <XAxis type="number" domain={[0, 2600]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v.toLocaleString()} />
                <YAxis type="category" dataKey="country" width={60} tick={{ fill: '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive={false} barSize={16}>
                  {countryData.map((d, i) => (
                    <Cell key={i} fill={d.hot ? ITALY : BASE} fillOpacity={d.hot ? 0.92 : 0.6} />
                  ))}
                  <LabelList dataKey="mult" position="right" style={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '10px',
          }}>
            <Zap size={16} color={ITALY} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
              <b style={{ color: ITALY }}>이탈리아 10개→1,105개 (110배)</b> · 프랑스 17배 · 벨기에 24배 — 남유럽·신흥 시장이 MSC 매대를 빠르게 확장 중
            </span>
          </div>
        </div>
      }
      takeaway={{
        situation: '독일(2,402개)·프랑스(2,280개)가 MSC 제품 수에서 성숙 시장을 형성한 반면, 이탈리아는 2009/10년 10개에서 2024/25년 1,105개로 110배 폭증했습니다. 프랑스(17배)·벨기에(24배)도 고성장을 지속해, 침투율 포화 단계인 독일과 대조됩니다.',
        actionPlan: '제품 수(SKU) 성장 곡선은 남유럽 신규 진입 타이밍의 선행지표입니다. 이탈리아·프랑스처럼 SKU가 폭증 중인 시장은 리테일러가 MSC 라인업을 적극 확대하는 국면이므로, 한국 인증 참치캔의 신규 리스팅 협상에 가장 유리한 진입 창구입니다.',
        source: 'MSC Annual Report 2024-25 Supplementary Data (liveproductcount)',
      }}
    />
  );
}
