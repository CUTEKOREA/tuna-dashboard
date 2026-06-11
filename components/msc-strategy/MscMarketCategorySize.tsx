'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import WidgetCard from '../WidgetCard';

interface CategoryItem {
  name: string;
  volume: number;
  growth: number;
  fill: string;
}

interface CountryItem {
  country: string;
  value: number;
}

/* MSC Annual Report 2024-25 부속 데이터 liveproductvolume 시트 (전 어종, 2024-25 회계연도)
   성장률은 2023-24 대비 YoY 실측: 냉동 510,333→507,296(-0.6%), 캔 269,425→334,746(+24.2%),
   칠드 188,249→191,046(+1.5%), 펫푸드 92,856→120,092(+29.3%), 푸드투고 30,843→36,562(+18.5%) */
const categoryData: CategoryItem[] = [
  { name: '냉동', volume: 507296, growth: -0.6, fill: '#a78bfa' },
  { name: '캔/통조림', volume: 334746, growth: 24.2, fill: '#38bdf8' },
  { name: '칠드/냉장', volume: 191046, growth: 1.5, fill: '#64748b' },
  { name: '펫푸드', volume: 120092, growth: 29.3, fill: '#f59e0b' },
  { name: '푸드투고', volume: 36562, growth: 18.5, fill: '#10b981' },
];

const countryWholesale: CountryItem[] = [
  { country: '🇺🇸 미국', value: 1572 },
  { country: '🇩🇪 독일', value: 1283 },
  { country: '🇬🇧 영국', value: 1224 },
  { country: '🇫🇷 프랑스', value: 1030 },
  { country: '🇮🇹 이탈리아', value: 576 },
];

const totalVolume = categoryData.reduce((sum, d) => sum + d.volume, 0);
const maxWholesale = Math.max(...countryWholesale.map((c) => c.value));

function formatVolume(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}만`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}천`;
  return `${v}`;
}

export default function MscMarketCategorySize() {
  const body = (
    <div style={{ width: '100%' }}>
      {/* Section 1: Category Treemap Blocks */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          카테고리별 MSC 라벨 제품 판매량 (전 어종 상위 5, 톤)
        </div>

        {/* Treemap — top row (large blocks) */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          {categoryData.slice(0, 2).map((item) => {
            const widthPct = (item.volume / totalVolume) * 100;
            return (
              <div
                key={item.name}
                style={{
                  flex: `0 0 ${widthPct}%`,
                  minWidth: 0,
                  background: `${item.fill}15`,
                  border: `1px solid ${item.fill}33`,
                  borderRadius: 10,
                  padding: '16px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 100,
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: item.fill, marginBottom: 4 }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>
                    {formatVolume(item.volume)}
                    <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#94a3b8', marginLeft: 4 }}>톤</span>
                  </div>
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: `${item.fill}20`,
                    alignSelf: 'flex-start',
                    marginTop: 8,
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: item.fill }}>
                    {item.growth >= 0 ? '+' : ''}{item.growth}%
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>YoY</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Treemap — bottom row (smaller blocks) */}
        <div style={{ display: 'flex', gap: 6 }}>
          {categoryData.slice(2).map((item) => {
            const widthPct = Math.max((item.volume / totalVolume) * 100, 18);
            return (
              <div
                key={item.name}
                style={{
                  flex: `1 1 ${widthPct}%`,
                  minWidth: 0,
                  background: `${item.fill}10`,
                  border: `1px solid ${item.fill}25`,
                  borderRadius: 8,
                  padding: '12px 10px',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: item.fill, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>
                  {formatVolume(item.volume)}
                  <span style={{ fontSize: '0.68rem', fontWeight: 500, color: '#94a3b8', marginLeft: 3 }}>톤</span>
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: item.fill, marginTop: 4 }}>
                  {item.growth >= 0 ? '+' : ''}{item.growth}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(148,163,184,0.08)', margin: '18px 0' }} />

      {/* Section 2: Country Wholesale Bar Chart */}
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          국가별 B2B 도매 시장 규모 ($M)
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {countryWholesale.map((item, idx) => {
            const barWidthPct = (item.value / maxWholesale) * 100;
            const isTop = idx === 0;
            return (
              <div key={item.country} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ minWidth: 100, fontSize: '0.82rem', fontWeight: 600, color: isTop ? '#e2e8f0' : '#94a3b8' }}>
                  {item.country}
                </div>
                <div style={{ flex: 1, height: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                  <div
                    style={{
                      width: `${barWidthPct}%`,
                      height: '100%',
                      background: isTop
                        ? 'linear-gradient(90deg, rgba(56,189,248,0.3), rgba(56,189,248,0.6))'
                        : 'linear-gradient(90deg, rgba(148,163,184,0.1), rgba(148,163,184,0.25))',
                      borderRadius: 6,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <div
                  style={{
                    minWidth: 65,
                    textAlign: 'right',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    color: isTop ? '#38bdf8' : '#cbd5e1',
                  }}
                >
                  ${item.value.toLocaleString()}M
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Highlight callout */}
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 12,
          background: 'rgba(56,189,248,0.05)',
          border: '1px solid rgba(56,189,248,0.15)',
          borderRadius: 10,
          padding: 12,
        }}
      >
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#38bdf8', fontVariantNumeric: 'tabular-nums' }}>
            138.5<span style={{ fontSize: 12, fontWeight: 600 }}>만 톤</span>
          </div>
          <div style={{ fontSize: 11, color: '#7dd3fc', fontWeight: 600, marginTop: 2 }}>
            MSC 라벨 총 판매량 (전 어종, 2024/25)
          </div>
        </div>
        <div style={{ width: 1, background: 'rgba(56,189,248,0.15)' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#f59e0b', fontVariantNumeric: 'tabular-nums' }}>
            +29.3<span style={{ fontSize: 12, fontWeight: 600 }}>%</span>
          </div>
          <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 600, marginTop: 2 }}>
            펫푸드 최고 성장률
          </div>
        </div>
        <div style={{ width: 1, background: 'rgba(56,189,248,0.15)' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
            +44.6<span style={{ fontSize: 12, fontWeight: 600 }}>%</span>
          </div>
          <div style={{ fontSize: 11, color: '#34d399', fontWeight: 600, marginTop: 2 }}>
            인증 프리미엄
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      id="W-MSC21"
      title="MSC 라벨 시장 카테고리 구조"
      description="전 어종 MSC 라벨 제품 카테고리별 판매량 및 주요 국가 B2B 도매 시장 규모"
      icon={ShoppingCart}
      iconColor="#38bdf8"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2024-25' }}
      cardDesc="MSC 연례보고서 2024-25 부속 데이터(liveproductvolume, 전 어종) 기준 — 참치 단독 라벨 판매량은 별도(2024/25 약 30만 톤)"
      customBody={body}
      takeaway={{
        situation: "MSC 라벨 제품 시장(전 어종, 2024/25 총 138.5만 톤)은 냉동(50.7만 톤)이 최대 카테고리이나, 캔/통조림(33.5만 톤, +24.2%)과 펫푸드(12.0만 톤, +29.3%)가 성장을 주도합니다. 참치 단독 라벨 판매량은 2024/25 약 30만 톤(연감 2025)에서 2025/26 40만 톤+(연감 2025-26)로 증가했습니다.",
        actionPlan: "MSC 참치의 B2B 도매 시장은 미국($1,572M)이 독일($1,283M)을 추월하여 최대 시장이 되었습니다. 미국 향 OEM 수출에 MSC 인증을 적용하면, 기존 비인증 제품 대비 +44.6%의 가격 프리미엄 확보가 가능합니다.",
        source: "MSC Annual Report 2024-25 부속 데이터(liveproductvolume 시트, 전 어종) / 참치 라벨 판매량: MSC Sustainable Tuna Yearbook 2025·2025-26",
      }}
    />
  );
}
