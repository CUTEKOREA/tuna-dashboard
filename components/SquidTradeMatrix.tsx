'use client';
import React, { useState } from 'react';
import { Globe, ArrowRight, Package, DollarSign, TrendingUp } from 'lucide-react';
import WidgetCard from './WidgetCard';
import matrixData from '../data/squid_trade_matrix.json';

const SHORT_NAMES: Record<string, string> = {
  'China': '🇨🇳 중국', 'Peru': '🇵🇪 페루', 'Spain': '🇪🇸 스페인', 'India': '🇮🇳 인도',
  'Argentina': '🇦🇷 아르헨', 'Indonesia': '🇮🇩 인니', 'Falkland Islands (Malvinas)': '🇫🇰 포클랜드',
  'Chile': '🇨🇱 칠레', 'Viet Nam': '🇻🇳 베트남', 'United States of America': '🇺🇸 미국',
  'Thailand': '🇹🇭 태국', 'Republic of Korea': '🇰🇷 한국', 'Japan': '🇯🇵 일본',
  'Italy': '🇮🇹 이탈리아', 'Malaysia': '🇲🇾 말레이시아', 'Philippines': '🇵🇭 필리핀',
  'France': '🇫🇷 프랑스', 'Morocco': '🇲🇦 모로코', 'Portugal': '🇵🇹 포르투갈',
  'Taiwan Province of China': '🇹🇼 대만', 'Pakistan': '🇵🇰 파키스탄', 'Netherlands': '🇳🇱 네덜란드',
  'Germany': '🇩🇪 독일', 'United Kingdom': '🇬🇧 영국', 'Russian Federation': '🇷🇺 러시아',
  'Mexico': '🇲🇽 멕시코', 'Ecuador': '🇪🇨 에콰도르', 'Türkiye': '🇹🇷 튀르키예',
  'Egypt': '🇪🇬 이집트', 'Algeria': '🇩🇿 알제리', 'Saudi Arabia': '🇸🇦 사우디',
  'Nigeria': '🇳🇬 나이지리아', 'Brazil': '🇧🇷 브라질', 'Australia': '🇦🇺 호주',
  'New Zealand': '🇳🇿 뉴질랜드', 'Canada': '🇨🇦 캐나다', 'Senegal': '🇸🇳 세네갈',
  'Mauritania': '🇲🇷 모리타니', 'South Africa': '🇿🇦 남아공',
};

function getShort(name: string) {
  return SHORT_NAMES[name] || name;
}

export default function SquidTradeMatrix() {
  const [hoveredFlow, setHoveredFlow] = useState<any>(null);

  const countries = matrixData.countries as string[];
  const flows = matrixData.flows as any[];

  const lookup: Record<string, Record<string, any>> = {};
  let maxVol = 0;
  for (const f of flows) {
    lookup[f.exporter] = lookup[f.exporter] || {};
    lookup[f.exporter][f.importer] = f;
    if (f.volume_t > maxVol) maxVol = f.volume_t;
  }

  function cellColor(vol: number) {
    if (vol <= 0) return 'transparent';
    const intensity = Math.pow(vol / maxVol, 0.4);
    const r = Math.round(6 + intensity * 233);
    const g = Math.round(182 - intensity * 140);
    const b = Math.round(212 - intensity * 180);
    return `rgba(${r}, ${g}, ${b}, ${0.15 + intensity * 0.7})`;
  }

  const body = (
    <div>
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
                      {isDiag ? '—' : vol > 0 ? (vol > 1000 ? `${(vol / 1000).toFixed(0)}K` : vol) : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: '16px',
        background: 'rgba(0, 20, 40, 0.7)', border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: '8px', padding: '16px',
        transition: 'all 0.2s ease',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '160px',
      }}>
        {hoveredFlow ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ color: '#67e8f9', fontWeight: 700, fontSize: '0.95rem' }}>{getShort(hoveredFlow.exporter)}</span>
              <ArrowRight size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.95rem' }}>{getShort(hoveredFlow.importer)}</span>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={16} style={{ color: '#67e8f9', flexShrink: 0 }} />
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>무역량</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>{hoveredFlow.volume_t?.toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>톤</span></div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>금액</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>${(hoveredFlow.value_usd_k / 1000).toFixed(1)}<span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>M</span></div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>단가</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>${hoveredFlow.unit_price?.toLocaleString()}<span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>/t</span></div>
                </div>
              </div>
            </div>

            {hoveredFlow.volume_t > 10000 && (
              <div style={{
                background: 'rgba(6, 182, 212, 0.1)', borderRadius: '6px', padding: '8px',
                color: '#67e8f9', fontSize: '0.75rem', lineHeight: 1.4,
                borderLeft: '3px solid rgba(6, 182, 212, 0.5)',
                marginTop: '4px',
              }}>
                ⚡ 핵심 무역 라인 — 글로벌 공급망 중점 구역
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ color: 'rgba(6, 182, 212, 0.5)', fontSize: '2rem', marginBottom: '8px' }}><Globe size={32} style={{ display: 'inline' }} /></div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.5, fontWeight: 600 }}>
              상세 무역 정보<br /><span style={{ fontSize: '0.75rem', fontWeight: 400 }}>셀 위에 마우스를 올려 확인하십시오</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="글로벌 오징어 무역 매트릭스 (2023, Top 15)"
      icon={Globe}
      iconColor="#67e8f9"
      pillar="S4"
      cardDesc="수출국(행) → 수입국(열) 양자 간 무역량 히트맵 — 중국은 수출·수입 동시 1위의 글로벌 가공 허브"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      customBody={body}
      takeaway={{
        situation: `<div>
<p>"양자 간 무역 매트릭스(Bilateral Trade Matrix)"는 글로벌 오징어 밸류체인의 정점 vs 변방 관계를 정량화한 indicator.</p>
<p>2023 매트릭스 기준: <strong>중국이 허브 — 페루 수출의 약 54%·인도네시아 약 69%·미국 약 91%가 중국 가공 거점으로 유입 (매트릭스 내 수입 합산 약 40만 톤)</strong> → 가공품이 태국·베트남·대만으로 재유출. <strong>글로벌 공급망 내 중국 집중 구조</strong>.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 대중국 원물 집중화 우회. <strong>"다이렉트 소싱 파트너십"</strong>이 본질.</p>
<p><strong>3단계</strong>: ① 베트남(가공 단가 유리)·인도네시아(원물 조달 유리)에 자체 가공·물류 spoke 배치 ② 중국 칭다오 우회 — 중국 수출 통제 리스크·중간 마진 최소화 ③ 대중국 원물 의존 비중을 단계적으로 분산하는 Multi-spoke 직소싱 체계 구축 검토.</p>
</div>`,
        source: "FAO FishStatJ Squid Trade Flow Matrix (2023)",
      }}
    />
  );
}
