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

/**
 * Map value (0-100) to a green intensity color for heatmap cells.
 * High values → vivid emerald, low values → muted slate.
 */
function getHeatColor(value: number): string {
  if (value >= 80) return 'rgba(16,185,129,0.55)';
  if (value >= 65) return 'rgba(16,185,129,0.38)';
  if (value >= 50) return 'rgba(16,185,129,0.22)';
  if (value >= 35) return 'rgba(16,185,129,0.12)';
  return 'rgba(100,116,139,0.15)';
}

function getTextColor(value: number): string {
  if (value >= 65) return '#e2e8f0';
  if (value >= 50) return '#cbd5e1';
  return '#94a3b8';
}

export default function MscDemographicAcceptance() {
  return (
    <WidgetCard
      title="W-MSC09. 세대 × 소득별 MSC 프리미엄 수용도"
      icon={Users}
      iconColor="#10b981"
      pillar="S5"
      cardDesc="영국 소비자 조사 기반, 세대(Z~부머)와 소득(저~고) 교차 분석으로 MSC 인증 제품 프리미엄 지불 의향(%) 히트맵 시각화"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      customBody={
        <div style={{ padding: '0 20px 20px' }}>
          {/* Heatmap Grid */}
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {/* Header row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '160px repeat(3, 1fr)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{
                padding: '12px 16px',
                fontSize: '0.72rem',
                color: '#64748b',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                세대 \ 소득
              </div>
              {incomeLabels.map((label) => (
                <div key={label} style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                  fontWeight: 600,
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
                  gridTemplateColumns: '160px repeat(3, 1fr)',
                  borderBottom: rowIdx < heatmapData.length - 1
                    ? '1px solid rgba(255,255,255,0.04)'
                    : 'none',
                }}
              >
                {/* Row label */}
                <div style={{
                  padding: '16px 16px',
                  fontSize: '0.82rem',
                  color: '#e2e8f0',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {row.gen}
                </div>

                {/* Value cells */}
                {incomeKeys.map((key) => {
                  const val = row[key];
                  return (
                    <div
                      key={key}
                      style={{
                        padding: '12px 8px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          maxWidth: 100,
                          padding: '14px 8px',
                          borderRadius: 8,
                          background: getHeatColor(val),
                          textAlign: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{
                          fontSize: '1.3rem',
                          fontWeight: 800,
                          color: getTextColor(val),
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {val}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend & Insight */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 12,
            gap: 12,
          }}>
            {/* Color legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#64748b' }}>
              <span>낮음</span>
              <div style={{ display: 'flex', gap: 2 }}>
                {[0.1, 0.18, 0.28, 0.4, 0.55].map((opacity, i) => (
                  <div
                    key={i}
                    style={{
                      width: 20,
                      height: 12,
                      borderRadius: 2,
                      background: `rgba(16,185,129,${opacity})`,
                    }}
                  />
                ))}
              </div>
              <span>높음</span>
            </div>

            {/* Key gap metrics */}
            <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>세대 격차: </span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>63pp</span>
                <span style={{ color: '#64748b' }}> (Z+고소득 88% vs 부머+저소득 25%)</span>
              </div>
            </div>
          </div>
        </div>
      }
      takeaway={{
        situation: "Z세대+고소득(88%)이 MSC 프리미엄 수용도 최고, 베이비부머+저소득(25%)이 최저. 세대 간 격차(Z→부머)가 소득 간 격차(고→저)보다 더 크며, 이는 MSC 수요가 장기적으로 구조적 성장할 것을 시사.",
        actionPlan: "MZ세대 타겟 마케팅(SNS, 인플루언서 협업)에 MSC 라벨을 핵심 소구점으로 활용. 저소득층 접근성을 위해 PB MSC 제품의 가격 경쟁력 확보도 병행 — '모든 세대가 접근 가능한 지속가능성' 포지셔닝.",
        source: "MSC UK Consumer Insights 2024, MSC Ireland Consumer Insights 2024",
      }}
    />
  );
}
