'use client';

import React from 'react';
import { Sprout, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import WidgetCard from '../WidgetCard';

/* ── Data: MSC 인증 어업이 실제로 달성한 개선(improvement) 건수 ───────────────
   출처: MSC Annual Report 2024-25 Supplementary Data (improvement 시트)
   누적 2,625건 / 최근 3년(2022.4~2025.3) 558건 — 영역군별 분해                 */

const improvements = [
  { cat: '자원·수확전략',  count: 213, color: '#10b981', note: '자원평가·HCR 도입' },
  { cat: 'ETP·혼획저감',   count: 175, color: '#38bdf8', note: '멸종위기종·부수어획' },
  { cat: '관리·거버넌스',  count: 94,  color: '#a78bfa', note: '어업관리·정책' },
  { cat: '생태계·서식지',  count: 76,  color: '#f59e0b', note: '해저서식지·생태계' },
];

const tooltipStyle = {
  backgroundColor: 'rgba(20, 28, 52, 0.95)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 8,
  color: 'var(--w-slate-200)',
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
        <span style={{ color: 'var(--w-slate-400)' }}>최근 3년 개선</span>
        <span style={{ fontWeight: 700, color: d.color }}>{d.count}건</span>
      </div>
      <div style={{ marginTop: 4, fontSize: '0.66rem', color: 'var(--w-slate-400)' }}>{d.note}</div>
    </div>
  );
};

export default function MscImprovementsDelivered() {
  return (
    <WidgetCard
      id="W-MSC27"
      title="MSC 어업 개선 실적 (영역군별)"
      icon={Sprout}
      iconColor="#10b981"
      pillar="S5"
      cardDesc="MSC 인증 어업이 최근 3년(2022.4~2025.3)간 실제로 달성한 개선 558건의 영역군별 분해"
      unit="건"
      telemetry={{ status: 'STATIC', syncDate: '2024-25' }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* KPI 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '10px', padding: '12px 14px',
            }}>
              <div style={{ fontSize: '0.66rem', color: 'var(--w-slate-400)', marginBottom: '2px' }}>누적 개선 (제도 출범 이후)</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--w-emerald-500)' }}>2,625</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)' }}>건</span>
              </div>
            </div>
            <div style={{
              background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)',
              borderRadius: '10px', padding: '12px 14px',
            }}>
              <div style={{ fontSize: '0.66rem', color: 'var(--w-slate-400)', marginBottom: '2px' }}>최근 3년 개선</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--w-sky-400)' }}>558</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)' }}>건</span>
              </div>
            </div>
          </div>

          {/* 영역군별 바 차트 */}
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={improvements}
                layout="vertical"
                margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
                <XAxis type="number" domain={[0, 240]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="cat" width={92} tick={{ fill: 'var(--w-slate-300)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive={false} barSize={22}>
                  {improvements.map((d, i) => (
                    <Cell key={i} fill={d.color} fillOpacity={0.85} />
                  ))}
                  <LabelList dataKey="count" position="right" formatter={(v: unknown) => `${v}건`} style={{ fill: 'var(--w-slate-400)', fontSize: 11, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '10px',
          }}>
            <TrendingUp size={16} color="#10b981" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--w-slate-300)' }}>
              최근 3년 개선의 <b style={{ color: 'var(--w-sky-400)' }}>31%(175건)</b>가 멸종위기종·혼획 저감 — 단순 '라벨'이 아닌 실측 보존 성과
            </span>
          </div>
        </div>
      }
      takeaway={{
        situation: 'MSC 인증 어업은 제도 출범 이후 누적 2,625건의 환경 개선을 달성했으며, 최근 3년에만 558건이 추가됐습니다. 영역군별로는 자원·수확전략 213건, ETP(멸종위기·보호종)·혼획 저감 175건, 관리·거버넌스 94건, 생태계·서식지 76건 순입니다.',
        actionPlan: 'MSC 인증은 마케팅 라벨이 아니라 어업 현장의 정량적 개선을 강제하는 제도임을 바이어 설득 자료로 활용해야 합니다. 한국 선단이 인증을 추진할 때, ETP·혼획 저감 개선 실적을 우선 확보하면 EU·미국 리테일러의 ESG 조달 심사를 빠르게 통과할 수 있습니다.',
        source: 'MSC Annual Report 2024-25 Supplementary Data (improvement, ~2025.3)',
      }}
    />
  );
}
