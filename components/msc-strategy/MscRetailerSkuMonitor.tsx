'use client';

import React from 'react';
import { Store } from 'lucide-react';
import WidgetCard from '../WidgetCard';

/* ── Data ─────────────────────────────────────────────────────────── */

const retailerData = [
  { name: 'Tesco', country: '🇬🇧', conversion: 100, skus: 24, pbMsc: 100, color: '#10b981' },
  { name: 'Aldi', country: '🇩🇪🇬🇧', conversion: 95, skus: 8, pbMsc: 100, color: '#10b981' },
  { name: 'Lidl', country: '🇩🇪🇬🇧', conversion: 92, skus: 6, pbMsc: 95, color: '#10b981' },
  { name: 'Carrefour', country: '🇫🇷🇪🇸', conversion: 78, skus: 18, pbMsc: 72, color: '#38bdf8' },
  { name: 'Mercadona', country: '🇪🇸', conversion: 45, skus: 12, pbMsc: 35, color: '#f59e0b' },
  { name: 'Esselunga', country: '🇮🇹', conversion: 62, skus: 15, pbMsc: 55, color: '#38bdf8' },
  { name: "Sainsbury's", country: '🇬🇧', conversion: 98, skus: 20, pbMsc: 100, color: '#10b981' },
  { name: 'REWE', country: '🇩🇪', conversion: 96, skus: 14, pbMsc: 98, color: '#10b981' },
];

/* ── Component ────────────────────────────────────────────────────── */

export default function MscRetailerSkuMonitor() {
  const body = (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
    }}>
      {retailerData.map((r) => (
        <div
          key={r.name}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            padding: '14px 16px',
          }}
        >
          {/* Header: Name + Country */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>{r.name}</span>
              <span style={{ fontSize: '0.85rem' }}>{r.country}</span>
            </div>
            <span style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: r.color,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {r.conversion}%
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 6,
            height: 6,
            overflow: 'hidden',
            marginBottom: '10px',
          }}>
            <div style={{
              width: `${r.conversion}%`,
              height: '100%',
              borderRadius: 6,
              background: `linear-gradient(90deg, ${r.color}cc, ${r.color})`,
            }} />
          </div>

          {/* Metrics Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>MSC SKU </span>
              <span style={{ color: '#94a3b8', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{r.skus}개</span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>PB MSC </span>
              <span style={{
                color: r.pbMsc >= 90 ? '#10b981' : r.pbMsc >= 60 ? '#38bdf8' : '#f59e0b',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {r.pbMsc}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <WidgetCard
      title="W11. 리테일러 MSC 전환 현황"
      icon={Store}
      iconColor="#10b981"
      pillar="S5"
      cardDesc="유럽 주요 8개 리테일러의 MSC 전환율·SKU 수·PB(자체브랜드) MSC 비중 실시간 모니터링"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      customBody={body}
      takeaway={{
        situation: "영국·독일 주요 리테일러는 사실상 100% MSC 전환 완료(Tesco 100%, Aldi 95%, REWE 96%). 반면 남유럽은 Mercadona(45%), Esselunga(62%)로 전환 진행 중. 디스카운트 채널(Aldi/Lidl)의 PB 100% MSC 정책이 업계 표준으로 자리잡는 중.",
        actionPlan: "Mercadona(스페인 최대 리테일러, PB 80%)의 MSC 전환율 45%→80% 상승 시, 스페인 MSC 침투율 급등 예상. OEM 납품 기업은 Mercadona 'Hacendado' PB 라인의 MSC 전환 타임라인을 밀착 추적해야.",
        source: "MSC Country Market Analysis 2025-2026, MSC UK/Ireland Market Report 2024",
      }}
    />
  );
}
