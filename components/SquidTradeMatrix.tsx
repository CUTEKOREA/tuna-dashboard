'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './MackerelStrategy.module.css';
import { Globe, ArrowRight, Package, DollarSign, TrendingUp } from 'lucide-react';
import matrixData from '../data/squid_trade_matrix.json';
import TakeawayBox from './TakeawayBox';

const SHORT_NAMES: Record<string, string> = {
  'China': '🇨🇳 중국',
  'Peru': '🇵🇪 페루',
  'Spain': '🇪🇸 스페인',
  'India': '🇮🇳 인도',
  'Argentina': '🇦🇷 아르헨',
  'Indonesia': '🇮🇩 인니',
  'Falkland Islands (Malvinas)': '🇫🇰 포클랜드',
  'Chile': '🇨🇱 칠레',
  'Viet Nam': '🇻🇳 베트남',
  'United States of America': '🇺🇸 미국',
  'Thailand': '🇹🇭 태국',
  'Republic of Korea': '🇰🇷 한국',
  'Japan': '🇯🇵 일본',
  'Italy': '🇮🇹 이탈리아',
  'Malaysia': '🇲🇾 말레이시아',
  'Philippines': '🇵🇭 필리핀',
  'France': '🇫🇷 프랑스',
  'Morocco': '🇲🇦 모로코',
  'Portugal': '🇵🇹 포르투갈',
  'Taiwan Province of China': '🇹🇼 대만',
  'Pakistan': '🇵🇰 파키스탄',
  'Netherlands': '🇳🇱 네덜란드',
  'Germany': '🇩🇪 독일',
  'United Kingdom': '🇬🇧 영국',
  'Russian Federation': '🇷🇺 러시아',
  'Mexico': '🇲🇽 멕시코',
  'Ecuador': '🇪🇨 에콰도르',
  'Türkiye': '🇹🇷 튀르키예',
  'Egypt': '🇪🇬 이집트',
  'Algeria': '🇩🇿 알제리',
  'Saudi Arabia': '🇸🇦 사우디',
  'Nigeria': '🇳🇬 나이지리아',
  'Brazil': '🇧🇷 브라질',
  'Australia': '🇦🇺 호주',
  'New Zealand': '🇳🇿 뉴질랜드',
  'Canada': '🇨🇦 캐나다',
  'Senegal': '🇸🇳 세네갈',
  'Mauritania': '🇲🇷 모리타니',
  'South Africa': '🇿🇦 남아공',
};

function getShort(name: string) {
  return SHORT_NAMES[name] || name;
}

export default function SquidTradeMatrix() {
  const [hoveredFlow, setHoveredFlow] = useState<any>(null);

  const countries = matrixData.countries as string[];
  const flows = matrixData.flows as any[];

  // Build lookup: exporter→importer→volume
  const lookup: Record<string, Record<string, any>> = {};
  let maxVol = 0;
  for (const f of flows) {
    lookup[f.exporter] = lookup[f.exporter] || {};
    lookup[f.exporter][f.importer] = f;
    if (f.volume_t > maxVol) maxVol = f.volume_t;
  }

  // Color scale
  function cellColor(vol: number) {
    if (vol <= 0) return 'transparent';
    const intensity = Math.pow(vol / maxVol, 0.4);
    const r = Math.round(6 + intensity * 233);
    const g = Math.round(182 - intensity * 140);
    const b = Math.round(212 - intensity * 180);
    return `rgba(${r}, ${g}, ${b}, ${0.15 + intensity * 0.7})`;
  }

  const cellSize = Math.min(38, Math.max(26, Math.floor(640 / countries.length)));

  return (
    <div className={styles.glassCard} style={{ borderColor: 'rgba(6, 182, 212, 0.3)', overflow: 'visible' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#67e8f9', marginBottom: '6px', fontWeight: 700, fontSize: '1rem', position: 'relative' }}>
        <Globe size={18} /> 글로벌 오징어 무역 매트릭스 (2023, Top 15)
        
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', marginBottom: '12px' }}>
        수출국(행) → 수입국(열) 양자 간 무역량 히트맵. 중국은 수출·수입 동시 1위의 <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>글로벌 가공 허브</span>
      </p>

      {/* First Row: Heatmap table (Full Width) */}
      <div style={{ overflowX: 'auto', paddingBottom: '12px', width: '100%' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.65rem', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '3px 5px', color: 'rgba(255,255,255,0.4)', textAlign: 'right', fontSize: '0.6rem' }}>수출↓ / 수입→</th>
              {countries.map(c => (
                <th key={c} style={{ padding: '3px', color: 'rgba(255,255,255,0.7)', writingMode: 'vertical-rl', textOrientation: 'mixed', height: '70px', fontSize: '0.6rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {getShort(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {countries.map(exp => (
              <tr key={exp}>
                <td style={{ padding: '3px 8px', color: 'rgba(255,255,255,0.8)', fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right', fontSize: '0.65rem' }}>
                  {getShort(exp)}
                </td>
                {countries.map(imp => {
                  const flow = lookup[exp]?.[imp];
                  const vol = flow?.volume_t || 0;
                  const isDiag = exp === imp;
                  return (
                    <td
                      key={imp}
                      onMouseEnter={() => flow && setHoveredFlow(flow)}
                      onMouseLeave={() => setHoveredFlow(null)}
                      style={{
                        height: '38px', minWidth: '38px',
                        background: isDiag ? 'rgba(255,255,255,0.03)' : cellColor(vol),
                        border: '1px solid rgba(255,255,255,0.06)',
                        textAlign: 'center', cursor: vol > 0 ? 'pointer' : 'default',
                        color: vol > maxVol * 0.3 ? 'var(--text-primary)' : 'rgba(255,255,255,0.4)',
                        fontWeight: vol > maxVol * 0.1 ? 700 : 400,
                        fontSize: '0.55rem',
                        transition: 'all 0.15s',
                      }}
                    >
                      {isDiag ? '—' : vol > 0 ? (vol > 1000 ? `${(vol/1000).toFixed(0)}K` : vol) : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Second Row: Detailed Trade Info + Takeaway Box */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '20px', marginTop: '16px' }}>
        {/* Detail panel (상세무역정보) */}
        <div style={{
          background: 'rgba(0, 20, 40, 0.7)', border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: '8px', padding: '16px', 
          transition: 'all 0.2s ease',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '160px'
        }}>
          {hoveredFlow ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Route */}
              <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ color: '#67e8f9', fontWeight: 700, fontSize: '0.95rem' }}>{getShort(hoveredFlow.exporter)}</span>
                <ArrowRight size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
                <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.95rem' }}>{getShort(hoveredFlow.importer)}</span>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {/* Volume */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={16} style={{ color: '#67e8f9', flexShrink: 0 }} />
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>무역량</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>{hoveredFlow.volume_t?.toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>톤</span></div>
                  </div>
                </div>

                {/* Value */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>금액</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>${(hoveredFlow.value_usd_k / 1000).toFixed(1)}<span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>M</span></div>
                  </div>
                </div>

                {/* Unit price */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={16} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>단가</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>${hoveredFlow.unit_price?.toLocaleString()}<span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>/t</span></div>
                  </div>
                </div>
              </div>

              {/* Global share hint */}
              {hoveredFlow.volume_t > 10000 && (
                <div style={{
                  background: 'rgba(6, 182, 212, 0.1)', borderRadius: '6px', padding: '8px',
                  color: '#67e8f9', fontSize: '0.75rem', lineHeight: 1.4,
                  borderLeft: '3px solid rgba(6, 182, 212, 0.5)',
                  marginTop: '4px'
                }}>
                  ⚡ 핵심 무역 라인 — 글로벌 공급망 중점 구역
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ color: 'rgba(6, 182, 212, 0.5)', fontSize: '2rem', marginBottom: '8px' }}><Globe size={32} style={{ display: 'inline' }}/></div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.5, fontWeight: 600 }}>
                상세 무역 정보<br /><span style={{ fontSize: '0.75rem', fontWeight: 400 }}>셀 위에 마우스를 올려 확인하십시오</span>
              </div>
            </div>
          )}
        </div>

        {/* Takeaway Box */}
        <div style={{ display: 'flex' }}>
          <TakeawayBox
            source="FAO FishStatJ Squid Trade Flow Matrix (2023)"
            situation="2023년 양자 간 무역(Bilateral Trade) 매트릭스를 분석하면, 글로벌 오징어 밸류체인은 '중국을 정점으로 한 블랙홀 구조'를 보여줍니다. 페루(약 35%), 인도네시아(약 65%), 미국(약 60%) 등 주요 조업국 원물의 막대한 물량이 중국 가공 거점(수입 45만 톤)으로 빨려 들어가며, 여기서 생산된 가공품이 다시 태국, 일본, 한국, 대만 등으로 뻗어나가는 거대한 거미줄 독점망을 형성하고 있습니다."
            actionPlan="대중국 원물 집중화에 대응하기 위해, 중국 칭다오 가공 거점을 단순히 경유하는 기존 소싱을 우회할 루트를 찾아야 합니다. 중국의 태국 및 동남아시아향 가공 수출 물량을 파악하고, 베트남(가공 단가 유리)이나 인도네시아(원물 조달 유리)에 자체 가공/물류 스포크를 배치함으로써 중국 수출 통제 리스크와 중간 마진을 최소화하는 다이렉트 소싱 파트너십을 구축해야 합니다."
          />
        </div>
      </div>
    </div>
  );
}
