'use client';

import React from 'react';
import { Map } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from 'recharts';
import WidgetCard from '../WidgetCard';

/* ── Data: FAO 대해역별 MSC 인증 어획량 / 총 어획량 비율 (%) ──────────────────
   출처: MSC Annual Report 2024-25 Supplementary Data (faomap 시트) + FAO 2025
   참치 주력 어장(WCPO·EPO·인도양)은 별색으로 강조 — 한국 원양 선단 조업 해역    */

const TUNA = '#f59e0b';   // 참치 주력 어장 강조색
const BASE = '#38bdf8';   // 기타 상업 해역

const areaData = [
  { area: '동중부태평양', pct: 78.5, tuna: true },   // 77 EPO
  { area: '북동태평양',   pct: 64.7, tuna: false },  // 67
  { area: '남서태평양',   pct: 52.9, tuna: false },  // 81
  { area: '북서대서양',   pct: 52.8, tuna: false },  // 21
  { area: '중서대서양',   pct: 47.3, tuna: false },  // 31
  { area: '북동대서양',   pct: 39.2, tuna: false },  // 27
  { area: '남동대서양',   pct: 25.3, tuna: false },  // 47
  { area: '북서태평양',   pct: 18.4, tuna: false },  // 61
  { area: '남동태평양',   pct: 13.2, tuna: false },  // 87
  { area: '서중부태평양', pct: 9.0,  tuna: true },   // 71 WCPO
  { area: '남서대서양',   pct: 5.9,  tuna: false },  // 41
  { area: '서인도양',     pct: 3.6,  tuna: true },   // 51
  { area: '동인도양',     pct: 2.0,  tuna: true },   // 57
  { area: '중동부대서양', pct: 1.3,  tuna: false },  // 34
  { area: '지중해·흑해',  pct: 0.2,  tuna: false },  // 37
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
        <span style={{ color: '#94a3b8' }}>MSC 인증 비율</span>
        <span style={{ fontWeight: 700, color: d.tuna ? TUNA : BASE }}>{d.pct}%</span>
      </div>
      {d.tuna && (
        <div style={{ marginTop: 4, fontSize: '0.66rem', color: TUNA }}>● 참치 주력 어장 (원양 선단 조업)</div>
      )}
    </div>
  );
};

export default function MscFaoAreaPenetration() {
  return (
    <WidgetCard
      id="W-MSC26"
      title="FAO 대해역별 MSC 인증 침투율"
      icon={Map}
      iconColor="#38bdf8"
      pillar="S5"
      cardDesc="FAO 19개 대해역별 'MSC 인증 어획량 ÷ 총 어획량' 비율 — 참치 주력 어장(주황) 강조"
      unit="%"
      telemetry={{ status: 'STATIC', syncDate: '2024-25' }}
      chartHeight={440}
      chart={
        <BarChart data={areaData} layout="vertical" margin={{ top: 4, right: 44, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 90]}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: unknown) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="area"
            width={84}
            tick={{ fill: '#cbd5e1', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]} isAnimationActive={false} barSize={15}>
            {areaData.map((d, i) => (
              <Cell key={i} fill={d.tuna ? TUNA : BASE} fillOpacity={d.tuna ? 0.95 : 0.55} />
            ))}
            <LabelList
              dataKey="pct"
              position="right"
              formatter={(v: unknown) => `${v}%`}
              style={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      }
      takeaway={{
        situation: '동중부태평양(78.5%)·북동태평양(64.7%) 등 미주 인접 해역은 MSC 인증이 포화 단계에 진입했습니다. 반면 세계 최대 참치 어장인 서중부태평양(WCPO)은 9.0%, 인도양은 서부 3.6%·동부 2.0%, 지중해는 0.2%에 불과해 어획량 대비 인증 공백이 큽니다.',
        actionPlan: '한국 원양 선단의 주력 조업 해역(WCPO·인도양)이 바로 MSC 침투율이 가장 낮은 구간입니다. 경쟁이 적은 지금 WCPO 가다랑어부터 선제 인증을 확보하면, 인증 프리미엄과 EU·미국 매대 접근권을 동시에 선점할 수 있습니다.',
        source: 'MSC Annual Report 2024-25 Supplementary Data (faomap), FAO Global Capture Production 1950-2023',
      }}
    />
  );
}
