'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from 'recharts';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { TrendingUp, Eye } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const awarenessData = [
  { year: '2020', awareness: 18, understanding: 14, oceanConcern: 82 },
  { year: '2021', awareness: 20, understanding: 16, oceanConcern: 85 },
  { year: '2022', awareness: 22, understanding: 19, oceanConcern: 87 },
  { year: '2023', awareness: 25, understanding: 24, oceanConcern: 88 },
  { year: '2024', awareness: 28, understanding: 31, oceanConcern: 90 },
];

const premiumData = [
  { label: 'Dolphin-Safe only', premium: 25.4, color: '#10b981' },
  { label: 'MSC only', premium: 44.6, color: '#38bdf8' },
  { label: 'MSC + Dolphin-Safe', premium: 81.3, color: '#a78bfa' },
];

export default function MscConsumerAwareness() {
  return (
    <WidgetCard
      id="W-MSC22"
      title="소비자 인식 & 지불의향(WTP) 트렌드"
      icon={Eye}
      iconColor="#a78bfa"
      pillar="S3"
      cardDesc="MSC 라벨 인지도·이해도 추이 및 에코라벨 조합별 가격 프리미엄 분석"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      takeaway={{
        situation: "MSC 라벨 인지도(22%→28%)와 이해도(19%→31%)가 동반 상승 중이며, 해양 건강 우려는 역대 최고(90%)입니다. 미국 시장 닐슨 스캐너 데이터 기준, MSC 단독 프리미엄은 +44.6%이나 Dolphin-Safe와 이중 라벨 시 +81.3%로 시너지 효과가 발생합니다.",
        actionPlan: "이중 라벨(MSC+Dolphin-Safe)의 프리미엄(81.3%)이 개별 합산(25.4%+44.6%=70%)보다 11.3%p 더 높은 '시너지 효과'가 입증되었습니다. 수출 제품에 두 라벨을 동시 적용하는 것이 가격 프리미엄 극대화의 최적 전략입니다.",
        source: "MSC GlobeScan 2024, Fang et al. 2025 (Fisheries Research)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          {/* Awareness Trend */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.05em' }}>
              MSC 라벨 인지도·이해도 추이 (%)
            </div>
            <div style={{ height: 200, width: '100%' }}>
              <SafeResponsiveContainer width="100%" height="100%">
                <LineChart data={awarenessData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[10, 95]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backgroundColor: 'rgba(30,41,59,0.95)', color: '#e2e8f0' }}
                    labelStyle={{ color: '#e2e8f0' }}
                    itemStyle={{ color: '#cbd5e1' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ color: '#94a3b8', fontSize: '0.75rem' }} />
                  <Line type="monotone" dataKey="awareness" name="인지도" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4, fill: '#38bdf8' }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="understanding" name="이해도" stroke="#a78bfa" strokeWidth={2.5} dot={{ r: 4, fill: '#a78bfa' }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="oceanConcern" name="해양 건강 우려" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#10b981' }} isAnimationActive={false} />
                </LineChart>
              </SafeResponsiveContainer>
            </div>
          </div>

          {/* Price Premium Bars */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.05em' }}>
              에코라벨 조합별 가격 프리미엄 (미국 닐슨 데이터)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {premiumData.map((d) => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '140px', fontSize: '0.75rem', color: '#94a3b8', flexShrink: 0, textAlign: 'right' }}>{d.label}</div>
                  <div style={{ flex: 1, position: 'relative', height: '28px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(d.premium / 100) * 100}%`, height: '100%',
                      background: `linear-gradient(90deg, ${d.color}40, ${d.color})`,
                      borderRadius: '6px', transition: 'width 0.5s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px',
                    }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>+{d.premium}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: '12px', padding: '10px 14px', borderRadius: '8px',
              background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)',
              fontSize: '0.72rem', color: '#a78bfa', fontWeight: 600, textAlign: 'center',
            }}>
              💡 이중 라벨 81.3% &gt; 개별 합산 70% → "1+1=3" 시너지 효과
            </div>
          </div>
        </div>
      }
    />
  );
}
