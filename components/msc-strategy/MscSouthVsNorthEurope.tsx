'use client';

import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ZAxis,
  ReferenceLine,
  Label,
} from 'recharts';
import { Map } from 'lucide-react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';

/* ── Data ─────────────────────────────────────────────────────────── */

const comparison = [
  { axis: '선호 어종', south: '황다랑어 (프리미엄)', north: '가다랑어 (대중)' },
  { axis: '선호 용매', south: '올리브유', north: '염수/해바라기유' },
  { axis: 'MSC 프리미엄', south: '낮음 (16~20%)', north: '높음 (25~35%)' },
  { axis: 'PB 비중', south: 'ES 80% / IT 28%', north: 'DE 71% / UK 43%' },
  { axis: '성장 여력', south: '높음 (침투 32~50%)', north: '낮음 (침투 65~93%)' },
];

const opportunityData = [
  { country: '독일', x: 93, y: 5, z: 87862 },
  { country: '영국', x: 65, y: 12, z: 45840 },
  { country: '프랑스', x: 67, y: 15, z: 32683 },
  { country: '이탈리아', x: 50, y: 22, z: 28500 },
  { country: '스페인', x: 32, y: 18, z: 52000 },
  { country: '폴란드', x: 25, y: 28, z: 15000 },
];

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: '0.78rem',
  padding: '8px 12px',
};

/* ── Custom Scatter Tooltip ──────────────────────────────────────── */

function ScatterTooltipContent({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.country}</div>
      <div>MSC 침투율: {d.x}%</div>
      <div>연간 성장률: {d.y}%</div>
      <div>시장 규모: {d.z.toLocaleString()}톤</div>
    </div>
  );
}

/* ── Custom Scatter Label ────────────────────────────────────────── */

function renderScatterLabel(props: any) {
  const { cx, cy, payload } = props;
  return (
    <text x={cx} y={cy - 14} textAnchor="middle" fill="#e2e8f0" fontSize={11} fontWeight={600}>
      {payload.country}
    </text>
  );
}

/* ── Component ────────────────────────────────────────────────────── */

export default function MscSouthVsNorthEurope() {
  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ─── Section A: Dual Panel Comparison ─── */}
      <div>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px',
        }}>
          남유럽 vs 북유럽 시장 특성 비교
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  비교 축
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'center', color: '#f59e0b', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🌞 남유럽 (ES/IT)
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'center', color: '#38bdf8', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ❄️ 북유럽 (DE/UK)
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={row.axis} style={{ borderBottom: i < comparison.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td style={{ padding: '10px 14px', color: '#e2e8f0', fontWeight: 600 }}>{row.axis}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#f59e0b' }}>{row.south}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#38bdf8' }}>{row.north}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Section B: Opportunity Matrix Scatter ─── */}
      <div>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px',
        }}>
          기회 매트릭스 — 침투율 × 성장률
        </div>

        {/* Quadrant Legend */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '0.75rem' }}>
          <span style={{ color: '#10b981' }}>🟢 수확 (Harvest)</span>
          <span style={{ color: '#f59e0b' }}>🟡 가속 (Accelerate)</span>
          <span style={{ color: '#ef4444' }}>🟠 개척 (Develop)</span>
        </div>

        <div style={{ width: '100%', height: 340 }}>
          <SafeResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                type="number"
                dataKey="x"
                name="MSC 침투율"
                domain={[0, 100]}
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v: number) => `${v}%`}
              >
                <Label value="현재 MSC 침투율(%)" position="bottom" offset={0} style={{ fill: '#64748b', fontSize: 11 }} />
              </XAxis>
              <YAxis
                type="number"
                dataKey="y"
                name="연간 성장률"
                domain={[0, 35]}
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v: number) => `${v}%`}
              >
                <Label value="연간 성장률(%)" angle={-90} position="insideLeft" offset={10} style={{ fill: '#64748b', fontSize: 11 }} />
              </YAxis>
              <ZAxis type="number" dataKey="z" range={[200, 800]} name="시장 규모" />

              {/* Quadrant Reference Lines */}
              <ReferenceLine x={50} stroke="rgba(255,255,255,0.15)" strokeDasharray="6 4" />
              <ReferenceLine y={15} stroke="rgba(255,255,255,0.15)" strokeDasharray="6 4" />

              <Tooltip content={<ScatterTooltipContent />} />
              <Scatter
                data={opportunityData}
                fill="#38bdf8"
                fillOpacity={0.7}
                stroke="#38bdf8"
                strokeWidth={1}
                isAnimationActive={false}
                label={renderScatterLabel}
              />
            </ScatterChart>
          </SafeResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="W12-13. 남유럽 vs 북유럽 & 기회 매트릭스"
      icon={Map}
      iconColor="#a78bfa"
      pillar="S5"
      cardDesc="유럽 MSC 참치 시장의 남북 이질성 비교 및 침투율×성장률 기반 국가별 진출 우선순위 매핑"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      customBody={body}
      takeaway={{
        situation: "유럽 MSC 참치 시장은 '두 개의 유럽'으로 양분. 북유럽(DE 93%, UK 65%)은 이미 성숙기로 성장률 5~12%, 남유럽(ES 32%, IT 50%)은 성장기로 18~22%. 독일은 포화 수확 단계, 이탈리아·스페인은 가속·개척 단계.",
        actionPlan: "한국 수출 기업의 유럽 진출 우선순위: ① 이탈리아(높은 성장률+볼륨), ② 스페인(최대 미개척 시장), ③ 폴란드(동유럽 교두보). 독일·영국은 이미 포화 — 기존 공급자 대체 전략 필요.",
        source: "MSC Tuna Market Analysis 2024-2026 전체 국가 종합",
      }}
    />
  );
}
