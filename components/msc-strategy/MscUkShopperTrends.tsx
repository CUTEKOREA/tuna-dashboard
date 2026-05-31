'use client';

import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
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
  const body = (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        {trendData.map((item) => {
          const diff = item.y2026 - item.y2023;
          const isUp = diff > 0;

          return (
            <div
              key={item.metric}
              style={{
                border: `1px solid ${isUp ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                borderRadius: '0.75rem',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                background: isUp ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                {item.metric}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* 2023 value */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>2023년</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                    {item.y2023}{item.unit}
                  </div>
                </div>

                {/* Arrow and diff */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isUp ? '#34d399' : '#f87171',
                  }}>
                    {isUp ? <TrendingUp size={14} strokeWidth={3} /> : <TrendingDown size={14} strokeWidth={3} />}
                    {isUp ? '+' : ''}{diff}pp
                  </div>
                  <ArrowRight style={{ color: '#475569', marginTop: '0.25rem' }} size={16} />
                </div>

                {/* 2026 value */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>2026년</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f1f5f9', fontVariantNumeric: 'tabular-nums' }}>
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
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(56,189,248,0.1)',
        border: '1px solid rgba(56,189,248,0.3)',
        borderRadius: '0.75rem',
        fontSize: '0.875rem',
        color: '#cbd5e1',
        fontWeight: 500,
      }}>
        <span style={{ color: '#38bdf8', fontWeight: 700, marginRight: '0.5rem' }}>핵심 패턴:</span>
        구매 빈도 하락(-4pp) + 지속가능성 중시(+15pp) + 프리미엄 지불 의향 상승(+12pp) =
        <span style={{
          color: '#f1f5f9',
          fontWeight: 700,
          marginLeft: '0.25rem',
          padding: '0.125rem 0.375rem',
          background: 'rgba(30,41,59,0.5)',
          borderRadius: '0.25rem',
        }}>
          "트레이드업(가치소비)" 구조적 전환
        </span>
      </div>
    </div>
  );

  return (
    <WidgetCard
      id="W-MSC10"
      title="영국 참치 쇼퍼 행동 변화 (2023→2026)"
      description="핵심 6개 소비 지표 변화 분석 (트레이드업 패턴)"
      icon={TrendingUp}
      iconColor="#22d3ee"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2026' }}
      cardDesc="B2C 소비 트렌드"
      takeaway={{
        situation: "최근 3년간 영국 소비자의 구매 빈도(주 1회 이상)는 32%에서 28%로 하락했으나, 지속가능성을 중시하는 비중은 53%로 크게 증가했고 프리미엄 지불 의향(53%)도 높아졌습니다. 즉, 빈도는 줄이고 단가는 높이는 현상이 뚜렷합니다.",
        actionPlan: "대량 판매 중심의 저마진 모델에서 벗어나 프리미엄 라인업(유기농 용매, 프리미엄 어종 등) 비중을 확대하여 장기적인 이익률을 방어해야 합니다. 이 트렌드는 향후 2~3년 내 남유럽으로 확산될 것입니다.",
        source: "MSC UK Tuna Shopper Report 2023/2026",
      }}
      customBody={body}
    />
  );
}
