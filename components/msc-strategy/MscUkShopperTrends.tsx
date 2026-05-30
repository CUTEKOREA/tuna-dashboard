'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const trendData = [
  { metric: 'MSC 라벨 인지도', y2023: 47, y2026: 54, unit: '%' },
  { metric: '주 1회+ 참치캔 구매', y2023: 32, y2026: 28, unit: '%' },
  { metric: '지속가능성 중시 구매자', y2023: 38, y2026: 53, unit: '%' },
  { metric: '온라인 참치 구매 비중', y2023: 12, y2026: 22, unit: '%' },
  { metric: '프리미엄 지불 의향', y2023: 41, y2026: 53, unit: '%' },
  { metric: 'PB 선호도', y2023: 35, y2026: 43, unit: '%' },
];

export default function MscUkShopperTrends() {
  return (
    <WidgetCard
      title="W-MSC08. 영국 참치 쇼퍼 행동 변화 (2023→2026)"
      icon={TrendingUp}
      iconColor="#22d3ee"
      pillar="S5"
      cardDesc="영국 참치 소비자 6개 핵심 지표의 3개년 변화 추이. '덜 사지만 더 비싼 것을 산다'는 트레이드업 경향 포착"
      telemetry={{ status: 'STATIC', syncDate: '2026' }}
      customBody={
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {trendData.map((item) => {
              const diff = item.y2026 - item.y2023;
              const isUp = diff > 0;
              const diffColor = isUp ? '#10b981' : '#ef4444';
              const bgColor = isUp ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)';
              const borderColor = isUp ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)';

              return (
                <div
                  key={item.metric}
                  style={{
                    background: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 10,
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {/* Metric name */}
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, lineHeight: 1.3 }}>
                    {item.metric}
                  </div>

                  {/* Value comparison row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* 2023 value */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 2 }}>2023</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                        {item.y2023}{item.unit}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <div style={{
                        width: '100%',
                        height: 2,
                        background: `linear-gradient(90deg, #64748b, ${diffColor})`,
                        borderRadius: 1,
                        position: 'relative',
                      }}>
                        <div style={{
                          position: 'absolute',
                          right: -2,
                          top: -3,
                          width: 0,
                          height: 0,
                          borderLeft: `6px solid ${diffColor}`,
                          borderTop: '4px solid transparent',
                          borderBottom: '4px solid transparent',
                        }} />
                      </div>
                      <div style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: diffColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}>
                        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isUp ? '+' : ''}{diff}pp
                      </div>
                    </div>

                    {/* 2026 value */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 2 }}>2026</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>
                        {item.y2026}{item.unit}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary callout */}
          <div style={{
            marginTop: 12,
            padding: '12px 16px',
            background: 'rgba(34,211,238,0.06)',
            border: '1px solid rgba(34,211,238,0.2)',
            borderRadius: 8,
            fontSize: '0.78rem',
            color: '#94a3b8',
            lineHeight: 1.6,
          }}>
            <span style={{ color: '#22d3ee', fontWeight: 700 }}>핵심 패턴:</span>{' '}
            구매 빈도 ↓(-4pp) + 프리미엄 지불 의향 ↑(+12pp) + 지속가능성 중시 ↑(+15pp)
            = <span style={{ color: '#e2e8f0', fontWeight: 600 }}>&quot;트레이드업&quot; 구조적 전환</span>
          </div>
        </div>
      }
      takeaway={{
        situation: "영국 참치 쇼퍼 3년간 핵심 변화: MSC 인지도 47%→54%(+7pp), 지속가능성 중시 구매자 38%→53%(+15pp), 프리미엄 지불 의향 41%→53%(+12pp). 반면 주간 구매 빈도는 32%→28%(-4pp) 감소 — '덜 사지만, 더 비싼 것을 산다'는 트레이드업 경향.",
        actionPlan: "영국의 '프리미엄화+빈도 감소' 패턴이 2~3년 시차로 남유럽에 전파될 전망. 수출 전략을 '대량 저가'에서 '소량 고가 인증 제품'으로 전환해야 장기 마진 방어 가능.",
        source: "MSC UK Tuna Shopper Report 2023, MSC UK Tuna Shopper Report 2026",
      }}
    />
  );
}
