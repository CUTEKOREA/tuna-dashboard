'use client';

import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { ArrowLeftRight } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const tradeData = [
  { year: '2015', filletExport: 198, filletImport: 76, skipjackExport: 143, yfExport: 66 },
  { year: '2016', filletExport: 210, filletImport: 82, skipjackExport: 155, yfExport: 72 },
  { year: '2017', filletExport: 235, filletImport: 95, skipjackExport: 168, yfExport: 107 },
  { year: '2018', filletExport: 248, filletImport: 132, skipjackExport: 196, yfExport: 85 },
  { year: '2019', filletExport: 240, filletImport: 115, skipjackExport: 170, yfExport: 75 },
  { year: '2020', filletExport: 220, filletImport: 90, skipjackExport: 145, yfExport: 60 },
  { year: '2021', filletExport: 273, filletImport: 110, skipjackExport: 175, yfExport: 68 },
  { year: '2022', filletExport: 260, filletImport: 180, skipjackExport: 185, yfExport: 65 },
  { year: '2023', filletExport: 258, filletImport: 250, skipjackExport: 190, yfExport: 62 },
  { year: '2024', filletExport: 255, filletImport: 109, skipjackExport: 191, yfExport: 59 },
];

const insights = [
  { label: '사시미 필렛 수출', range: '$198M→$255M', trend: '안정 궤도', color: '#10b981' },
  { label: '필렛 수입', range: '$76M→$250M→$109M', trend: '급등 후 급락', color: '#ef4444' },
  { label: '눈다랑어 수입', range: '$25M→$1.5M', trend: '자체 어획 전환', color: '#a78bfa' },
  { label: '가다랑어 수출 (→태국)', range: '$143M→$191M', trend: '안정적 벌크', color: '#38bdf8' },
];

export default function SasKoreaTradeDecade() {
  return (
    <WidgetCard
      id="W-SAS20"
      title="한국 10년 무역 구조 변화 (2015-2024)"
      icon={ArrowLeftRight}
      iconColor="#38bdf8"
      pillar="S2"
      cardDesc="냉동 필렛 수출입, 가다랑어 벌크, 황다랑어 등 주요 품목의 10년 궤적"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      takeaway={{
        situation: "한국 냉동 참치 필렛(사시미/스테이크) 수출은 10년간 $198M→$255M으로 안정 궤도를 유지하고 있습니다. 반면 필렛 수입은 2023년 $250M으로 급등 후 2024년 $109M으로 급락하여 변동성이 큽니다. 눈다랑어 수입은 $25M→$1.5M으로 사실상 소멸 — 자체 어획으로 전환했습니다.",
        actionPlan: "필렛 수입의 급등급락(2022-24)은 지중해 BFT 가격 변동에 의한 것으로, 공급처 다변화가 필요합니다. 가다랑어→태국 캔 공장 수출($191M)은 안정적이나 저마진 벌크이므로, 사시미 필렛 수출 비중 확대가 수익성 개선의 핵심입니다.",
        source: "kr_tuna_trade_byspecies_2015-2024.csv",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Chart */}
          <div style={{ height: 240, width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={tradeData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="exportGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="importGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backgroundColor: 'rgba(30,41,59,0.95)', color: '#e2e8f0' }}
                  formatter={(value: number, name: string) => [`$${value}M`, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ color: '#94a3b8', fontSize: '0.7rem' }} />
                <Area type="monotone" dataKey="filletExport" name="필렛 수출 (사시미)" stroke="#10b981" strokeWidth={2.5} fill="url(#exportGrad)" isAnimationActive={false} />
                <Area type="monotone" dataKey="filletImport" name="필렛 수입 (BFT)" stroke="#ef4444" strokeWidth={2} fill="url(#importGrad)" isAnimationActive={false} />
                <Line type="monotone" dataKey="skipjackExport" name="가다랑어 (→태국)" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="yfExport" name="황다랑어 수출" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>

          {/* Insight pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {insights.map((ins) => (
              <div key={ins.label} style={{
                padding: '8px 12px', borderRadius: '8px',
                background: `${ins.color}08`, border: `1px solid ${ins.color}20`,
                display: 'flex', flexDirection: 'column', gap: '2px',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: ins.color }}>{ins.label}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{ins.range}</div>
                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{ins.trend}</div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
