'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, ReferenceLine, Label } from 'recharts';
import { Map } from 'lucide-react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';

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

function ScatterTooltipContent({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'rgba(20, 28, 52, 0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8,
      padding: 12,
      color: '#e2e8f0',
      fontSize: 14,
      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: '#ffffff' }}>{d.country}</div>
      <div style={{ color: '#cbd5e1' }}>MSC 침투율: <span style={{ fontWeight: 600, color: '#38bdf8' }}>{d.x}%</span></div>
      <div style={{ color: '#cbd5e1' }}>연간 성장률: <span style={{ fontWeight: 600, color: '#34d399' }}>{d.y}%</span></div>
      <div style={{ color: '#94a3b8', marginTop: 4 }}>시장 규모: {d.z.toLocaleString()}톤</div>
    </div>
  );
}

function renderScatterLabel(props: any) {
  const { cx, cy, payload } = props;
  if (!payload) return null;
  return (
    <text x={cx} y={cy - 14} textAnchor="middle" fill="#cbd5e1" fontSize={11} fontWeight={600}>
      {payload.country}
    </text>
  );
}

export default function MscSouthVsNorthEurope() {
  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 8 }}>
      {/* Section A: Dual Panel Comparison */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          남유럽 vs 북유럽 시장 특성 비교
        </div>
        <div style={{ border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, overflow: 'hidden', background: 'rgba(30,41,59,0.3)' }}>
          <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(30,41,59,0.5)' }}>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>비교 축</th>
                <th style={{ padding: 12, textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>🌞 남유럽 (ES/IT)</th>
                <th style={{ padding: 12, textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>❄️ 북유럽 (DE/UK)</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={row.axis} style={i < comparison.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.03)' } : undefined}>
                  <td style={{ padding: 12, fontWeight: 600, color: '#cbd5e1' }}>{row.axis}</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#fbbf24', fontWeight: 500 }}>{row.south}</td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#38bdf8', fontWeight: 500 }}>{row.north}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section B: Opportunity Matrix Scatter */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>기회 매트릭스 (침투율 × 성장률)</span>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, fontWeight: 600, textTransform: 'lowercase' }}>
            <span style={{ color: '#10b981' }}>🟢 수확(Harvest)</span>
            <span style={{ color: '#f59e0b' }}>🟡 가속(Accelerate)</span>
            <span style={{ color: '#ef4444' }}>🟠 개척(Develop)</span>
          </div>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis type="number" dataKey="x" name="MSC 침투율" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false}>
                <Label value="현재 MSC 침투율(%)" position="bottom" offset={0} style={{ fill: '#64748b', fontSize: 11 }} />
              </XAxis>
              <YAxis type="number" dataKey="y" name="연간 성장률" domain={[0, 35]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false}>
                <Label value="연간 성장률(%)" angle={-90} position="insideLeft" offset={10} style={{ fill: '#64748b', fontSize: 11 }} />
              </YAxis>
              <ZAxis type="number" dataKey="z" range={[200, 800]} name="시장 규모" />
              <ReferenceLine x={50} stroke="#94a3b8" strokeOpacity={0.5} strokeDasharray="4 4" />
              <ReferenceLine y={15} stroke="#94a3b8" strokeOpacity={0.5} strokeDasharray="4 4" />
              <Tooltip content={<ScatterTooltipContent />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={opportunityData} fill="#38bdf8" fillOpacity={0.7} isAnimationActive={false} label={renderScatterLabel} />
            </ScatterChart>
          </SafeResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      id="W-MSC03"
      title="남유럽 vs 북유럽 & 기회 매트릭스"
      icon={Map}
      iconColor="#a78bfa"
      pillar="S5"
      cardDesc="유럽 MSC 참치 시장의 남북 이질성 비교 및 진출 우선순위 매핑"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      takeaway={{
        situation: "유럽 MSC 참치 시장은 북유럽(성숙기, 높은 프리미엄)과 남유럽(성장기, 올리브유/황다랑어 선호)의 이질적 성향을 보입니다. 독일(93%)은 이미 포화 상태이나 스페인(32%)과 이탈리아(50%)는 가속 성장이 기대됩니다.",
        actionPlan: "한국 기업의 유럽 진출 시, 북유럽은 포화 상태이므로 프리미엄 신제품으로 접근하고, 성장이 기대되는 이탈리아와 스페인에는 황다랑어+올리브유 조합의 현지화 제품으로 시장 점유를 선점해야 합니다.",
        source: "MSC Europe Regional Analysis 2024",
      }}
      customBody={body}
    />
  );
}
