'use client';

import React from 'react';
import { Store } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const retailerData = [
  { name: 'Tesco', country: '🇬🇧', conversion: 100, skus: 24, pbMsc: 100, color: '#10b981', barFrom: 'rgba(16,185,129,0.8)', barTo: '#10b981' },
  { name: 'Aldi', country: '🇩🇪🇬🇧', conversion: 95, skus: 8, pbMsc: 100, color: '#10b981', barFrom: 'rgba(16,185,129,0.8)', barTo: '#10b981' },
  { name: 'Lidl', country: '🇩🇪🇬🇧', conversion: 92, skus: 6, pbMsc: 95, color: '#10b981', barFrom: 'rgba(16,185,129,0.8)', barTo: '#10b981' },
  { name: 'Carrefour', country: '🇫🇷🇪🇸', conversion: 78, skus: 18, pbMsc: 72, color: '#38bdf8', barFrom: 'rgba(56,189,248,0.8)', barTo: '#38bdf8' },
  { name: 'Mercadona', country: '🇪🇸', conversion: 45, skus: 12, pbMsc: 35, color: '#f59e0b', barFrom: 'rgba(245,158,11,0.8)', barTo: '#f59e0b' },
  { name: 'Esselunga', country: '🇮🇹', conversion: 62, skus: 15, pbMsc: 55, color: '#38bdf8', barFrom: 'rgba(56,189,248,0.8)', barTo: '#38bdf8' },
  { name: "Sainsbury's", country: '🇬🇧', conversion: 98, skus: 20, pbMsc: 100, color: '#10b981', barFrom: 'rgba(16,185,129,0.8)', barTo: '#10b981' },
  { name: 'REWE', country: '🇩🇪', conversion: 96, skus: 14, pbMsc: 98, color: '#10b981', barFrom: 'rgba(16,185,129,0.8)', barTo: '#10b981' },
];

function getPbColor(val: number): string {
  if (val >= 90) return '#34d399';
  if (val >= 60) return '#38bdf8';
  return '#fbbf24';
}

export default function MscRetailerSkuMonitor() {
  const body = (
    <div style={{ width: '100%', marginTop: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {retailerData.map((r) => (
          <div
            key={r.name}
            style={{
              background: 'rgba(30,41,59,0.3)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 12,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Header: Name + Country */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--w-slate-200)' }}>{r.name}</span>
                <span style={{ fontSize: 12 }}>{r.country}</span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: r.color }}>
                {r.conversion}%
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', backgroundColor: 'rgba(30,41,59,0.5)', borderRadius: 999, height: 6, overflow: 'hidden', marginBottom: 12 }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 999,
                  background: `linear-gradient(to right, ${r.barFrom}, ${r.barTo})`,
                  width: `${r.conversion}%`,
                }}
              />
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--w-slate-400)', fontWeight: 500 }}>MSC SKU</span>
                <span style={{ color: 'var(--w-slate-300)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{r.skus}개</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--w-slate-400)', fontWeight: 500 }}>PB MSC</span>
                <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: getPbColor(r.pbMsc) }}>
                  {r.pbMsc}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <WidgetCard
      id="W-MSC11"
      title="리테일러 MSC 전환 현황"
      description="유럽 8대 유통사의 인증 수용도 실시간 모니터링"
      icon={Store}
      iconColor="#10b981"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="글로벌 B2B 거래 분석"
      takeaway={{
        situation: "영국·독일 주요 리테일러는 사실상 100% MSC 전환을 완료했습니다(Tesco 100%, Aldi 95%). 반면 남유럽은 스페인 Mercadona(45%), 이탈리아 Esselunga(62%)로 전환이 진행 중입니다. 디스카운트 채널의 PB 100% MSC 정책이 업계 표준으로 자리잡고 있습니다.",
        actionPlan: "스페인 최대 리테일러인 Mercadona의 MSC 전환율이 상승하면 스페인 전체 MSC 침투율이 급등할 것입니다. OEM 납품 기업은 Mercadona 'Hacendado' PB 라인의 MSC 전환 타임라인을 밀착 추적해야 합니다.",
        source: "MSC Country Market Analysis 2025-2026",
      }}
      customBody={body}
    />
  );
}
