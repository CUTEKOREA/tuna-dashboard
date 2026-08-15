'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell, ReferenceLine, Label } from 'recharts';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { Grid3X3 } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const bubbleData = [
  { country: '🇩🇪 독일', pb: 71, msc: 93, volume: 87862, color: '#38bdf8' },
  { country: '🇫🇷 프랑스', pb: 32, msc: 67, volume: 32683, color: '#a78bfa' },
  { country: '🇬🇧 영국', pb: 43, msc: 65, volume: 45840, color: '#10b981' },
  { country: '🇮🇹 이탈리아', pb: 28, msc: 50, volume: 28500, color: '#f59e0b' },
  { country: '🇪🇸 스페인', pb: 80, msc: 32, volume: 52000, color: '#ef4444' },
  { country: '🇵🇱 폴란드', pb: 55, msc: 25, volume: 15000, color: '#64748b' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      backgroundColor: 'rgba(20, 28, 52, 0.95)',
      border: '1px solid rgba(148,163,184,0.15)',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '0.82rem',
      color: 'var(--w-slate-200)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: '8px', color: '#ffffff' }}>{d.country}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
        <span>PB 비중:</span>
        <span style={{ fontWeight: 700, color: 'var(--w-sky-400)' }}>{d.pb}%</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
        <span>MSC 침투율:</span>
        <span style={{ fontWeight: 700, color: 'var(--w-emerald-400)' }}>{d.msc}%</span>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', gap: '16px',
        marginTop: '4px', borderTop: '1px solid rgba(148,163,184,0.2)', paddingTop: '4px', fontSize: '0.75rem',
      }}>
        <span>시장 규모:</span>
        <span style={{ fontWeight: 700, color: 'var(--w-amber-500)' }}>{d.volume.toLocaleString()}톤</span>
      </div>
    </div>
  );
};

export default function MscPbNbMatrix() {
  return (
    <WidgetCard
      id="W-MSC07"
      title="PB(Private Brand) 점유율 × MSC 침투율 매트릭스"
      description="유럽 주요국의 PB 시장 지배력과 지속가능성 요구 상관관계"
      icon={Grid3X3}
      iconColor="#a78bfa"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="리테일 PB/NB 분석"
      takeaway={{
        situation: "국가별로 PB와 MSC의 상관관계가 이질적입니다. 독일은 PB 비중이 71%이면서 MSC 침투율도 93%로 PB가 MSC 시장을 선도합니다. 반면 스페인은 PB 비중이 80%에 달하지만 초저가 경쟁에 치중하여 MSC 침투율은 32%로 저조합니다.",
        actionPlan: "OEM 생산자는 독일형 모델(PB=MSC 의무화)이 남유럽으로 확산되는 것에 대비하여 선제적으로 MSC 인증 라인을 확보해야 리테일러의 공급망에서 탈락하는 것을 방지할 수 있습니다.",
        source: "MSC Tuna Market Analysis 2025",
      }}
      customBody={
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <div style={{ height: 300, width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" dataKey="pb" name="PB 비중" domain={[15, 95]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} axisLine={false} tickLine={false}>
                  <Label value="PB 비중 (%)" position="insideBottom" offset={-15} style={{ fill: 'var(--w-slate-500)', fontSize: 11 }} />
                </XAxis>
                <YAxis type="number" dataKey="msc" name="MSC 침투율" domain={[15, 100]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} axisLine={false} tickLine={false}>
                  <Label value="MSC 침투율 (%)" angle={-90} position="insideLeft" offset={10} style={{ fill: 'var(--w-slate-500)', fontSize: 11 }} />
                </YAxis>
                <ZAxis type="number" dataKey="volume" range={[200, 1200]} name="시장 규모" />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <ReferenceLine y={50} stroke="var(--w-slate-400)" strokeOpacity={0.5} strokeDasharray="4 4" />
                <ReferenceLine x={50} stroke="var(--w-slate-400)" strokeOpacity={0.5} strokeDasharray="4 4" />
                <Scatter data={bubbleData} isAnimationActive={false}>
                  {bubbleData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} fillOpacity={0.7} stroke={entry.color} strokeWidth={2} />
                  ))}
                </Scatter>
              </ScatterChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px', justifyContent: 'center' }}>
            {bubbleData.map((d) => (
              <div key={d.country} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--w-slate-500)', fontWeight: 500 }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color }} />
                {d.country}
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
