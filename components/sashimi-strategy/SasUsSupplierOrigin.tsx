'use client';

import React from 'react';
import { Ship } from 'lucide-react';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';
import WidgetCard from '../WidgetCard';

/* ── Data: 2024 미국 비통조림 참치 수입 — 공급국별 금액($M) ────────────────────
   출처: UN Comtrade (local) us_tuna_imports_by_partner_2024.csv
   한국은 상위 6개국에 없음 → 동남아·중남미·지중해와 경쟁하는 도전자 포지션      */

const KR = '#f59e0b';
const BASE = '#38bdf8';

const supplierData = [
  { country: '인도네시아', value: 207, note: '냉동필렛 최대' },
  { country: '베트남',     value: 189, note: '냉동필렛 2위' },
  { country: '멕시코',     value: 78,  note: '신선 참다랑어' },
  { country: '스페인',     value: 66,  note: '지중해 축양 BFT' },
  { country: '태국',       value: 39,  note: '가공 로인' },
  { country: '파나마',     value: 28,  note: '신선 사시미' },
];

const tooltipStyle = {
  backgroundColor: 'rgba(20, 28, 52, 0.95)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 8, color: '#e2e8f0', fontSize: '0.78rem', padding: '8px 12px',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ color: '#94a3b8' }}>수입액 (2024)</span>
        <span style={{ fontWeight: 700, color: BASE }}>${d.value}M</span>
      </div>
      <div style={{ marginTop: 4, fontSize: '0.66rem', color: '#94a3b8' }}>{d.note}</div>
    </div>
  );
};

export default function SasUsSupplierOrigin() {
  return (
    <WidgetCard
      id="W-SAS29"
      title="미국 수입 공급국 & 어종 집중도"
      description="2024년 비통조림 참치 수입액 기준 (공급국별)"
      icon={Ship}
      iconColor="#38bdf8"
      pillar="S3"
      cardDesc="UN Comtrade 2024 — 미국 비통조림 참치 수입의 공급국별 금액($M)·세그먼트 집중도"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      takeaway={{
        situation: '2024년 미국 비통조림 참치 수입은 인도네시아($207M)·베트남($189M)이 주도하며, 냉동 필렛($487M 라인)에서 이 두 나라가 72%를 점유합니다. 신선 프리미엄(참다랑어)은 멕시코·스페인(지중해 축양)이 92%를 독점하는 별도 구조입니다. 한국은 상위 공급국에 없습니다.',
        actionPlan: '한국 -60℃ 가공공장은 동남아(냉동 saku) 가격 경쟁보다, 멕시코·지중해가 장악한 신선 프리미엄 또는 ULT 초저온 사시미라는 차별화 차선이 현실적입니다. 인니·베트남과의 정면 원가 경쟁은 불리하므로 품질·트레이서빌리티로 승부해야 합니다.',
        source: 'UN Comtrade 2024 (us_tuna_imports_by_partner_2024.csv, HS 030487/030232/030235)',
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          <div style={{ height: '232px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierData} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
                <XAxis type="number" domain={[0, 230]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}M`} />
                <YAxis type="category" dataKey="country" width={72} tick={{ fill: '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false} barSize={18}>
                  {supplierData.map((d, i) => <Cell key={i} fill={BASE} fillOpacity={0.7} />)}
                  <LabelList dataKey="value" position="right" formatter={(v: number) => `$${v}M`} style={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>냉동 필렛 집중도</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: BASE }}>인니+베트남 72%</div>
              <div style={{ fontSize: '0.58rem', color: '#64748b' }}>$487M 라인 / 포케·스시 벌크</div>
            </div>
            <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>신선 참다랑어 집중도</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: KR }}>멕시코+스페인 92%</div>
              <div style={{ fontSize: '0.58rem', color: '#64748b' }}>$147M / 지중해 축양 프리미엄</div>
            </div>
          </div>
        </div>
      }
    />
  );
}
