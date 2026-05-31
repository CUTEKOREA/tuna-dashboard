'use client';

import React from 'react';
import { Users } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const heatmapData = [
  { gen: 'Z세대 (18-25)', low: 62, mid: 75, high: 88 },
  { gen: '밀레니얼 (26-40)', low: 55, mid: 68, high: 83 },
  { gen: 'X세대 (41-55)', low: 38, mid: 52, high: 65 },
  { gen: '베이비부머 (56+)', low: 25, mid: 35, high: 48 },
];

const incomeLabels = ['저소득', '중위소득', '고소득'];
const incomeKeys = ['low', 'mid', 'high'] as const;

function getHeatStyle(value: number): React.CSSProperties {
  if (value >= 80) return { background: 'rgba(16,185,129,0.8)', color: '#ffffff' };
  if (value >= 65) return { background: 'rgba(16,185,129,0.5)', color: '#ecfdf5' };
  if (value >= 50) return { background: 'rgba(16,185,129,0.3)', color: '#d1fae5' };
  if (value >= 35) return { background: 'rgba(16,185,129,0.15)', color: '#cbd5e1' };
  return { background: 'rgba(100,116,139,0.1)', color: '#94a3b8' };
}

export default function MscDemographicAcceptance() {
  const body = (
    <div style={{ width: '100%', marginTop: '0.5rem' }}>
      <div style={{
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        background: 'rgba(30,41,59,0.5)',
      }}>
        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            padding: '0.75rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            세대 \ 소득
          </div>
          {incomeLabels.map((label) => (
            <div key={label} style={{
              padding: '0.75rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#cbd5e1',
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {heatmapData.map((row, rowIdx) => (
          <div
            key={row.gen}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              borderBottom: rowIdx < heatmapData.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}
          >
            {/* Row label */}
            <div style={{
              padding: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}>
              {row.gen}
            </div>

            {/* Value cells */}
            {incomeKeys.map((key) => {
              const val = row[key];
              const heatStyle = getHeatStyle(val);
              return (
                <div key={key} style={{ padding: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{
                    width: '100%',
                    maxWidth: '80px',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    ...heatStyle,
                  }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
                      {val}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '1rem',
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
          <span>낮음</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <div style={{ width: '1.25rem', height: '0.75rem', borderRadius: '0.25rem', background: 'rgba(100,116,139,0.1)' }} />
            <div style={{ width: '1.25rem', height: '0.75rem', borderRadius: '0.25rem', background: 'rgba(16,185,129,0.15)' }} />
            <div style={{ width: '1.25rem', height: '0.75rem', borderRadius: '0.25rem', background: 'rgba(16,185,129,0.3)' }} />
            <div style={{ width: '1.25rem', height: '0.75rem', borderRadius: '0.25rem', background: 'rgba(16,185,129,0.5)' }} />
            <div style={{ width: '1.25rem', height: '0.75rem', borderRadius: '0.25rem', background: 'rgba(16,185,129,0.8)' }} />
          </div>
          <span>높음</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
          <span style={{ color: '#34d399', fontWeight: 700, marginRight: '0.25rem' }}>세대 격차 핵심:</span>
          Z세대(62%) vs 부머(25%)
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      id="W-MSC02"
      title="세대 × 소득별 MSC 수용도 매트릭스"
      description="세대 및 소득별 MSC 인증 프리미엄 지불 의향(%)"
      icon={Users}
      iconColor="#10b981"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      cardDesc="B2C 소비자 분석"
      takeaway={{
        situation: "Z세대+고소득층(88%)이 MSC 프리미엄 수용도 최고치를 기록한 반면, 베이비부머+저소득층(25%)은 최저치입니다. 소득 간 격차보다 세대 간 격차가 훨씬 더 뚜렷합니다.",
        actionPlan: "SNS 기반의 MZ세대 타겟팅에는 'MSC 인증'을 주요 마케팅 소구점으로 부각하고, 시니어 대상 일반 리테일 시장에서는 가격 민감도를 고려하여 PB 위주의 가성비 접근이 필요합니다.",
        source: "UK Consumer Insights 2024",
      }}
      customBody={body}
    />
  );
}
