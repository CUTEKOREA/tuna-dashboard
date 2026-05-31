'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

const formats = [
  { name: '무한리필/뷔페', price: '1.5~1.9만원/인', trend: '+53% 검색량 YoY', icon: '🍽', color: '#38bdf8', desc: '고물가 시대 가성비 추구' },
  { name: '프리미엄 오마카세', price: '10~30만원/인', trend: '안정', icon: '🍣', color: '#f59e0b', desc: '혼마구로 전문, 프라이빗 다이닝' },
  { name: '참치정육점형', price: '2~5만원/인', trend: '신규 포맷', icon: '🪣', color: '#10b981', desc: '빅아이 30개+, 0 로열티' },
];

const brands = [
  { name: '이춘복참치', stores: '~10', type: '직영', specialty: '혼마구로', supplier: '직접 매입' },
  { name: '동원VIP참치', stores: '-', type: '독립운영', specialty: '종합', supplier: 'VIP참치유통' },
  { name: '빅아이', stores: '~30', type: '가맹', specialty: '정육점형', supplier: '동원수산' },
  { name: '킬만참치', stores: '-', type: '이자카야', specialty: '무한리필', supplier: '-' },
];

const d2cBrands = ['참치타임', '참치팩토리', '참치팸', '샵모비딱', '사조사시미몰'];

export default function SasKoreaFoodserviceD2C() {
  return (
    <WidgetCard
      id="W-SAS16"
      title="한국 참치 외식 양극화 + D2C 부상"
      description="무한리필 vs 오마카세 양극화, 참치정육점 신포맷, D2C 온라인 배달 현황"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="한국 참치 외식 시장의 포맷별 가격대·트렌드 및 D2C 채널 현황 인포그래픽"
      takeaway={{
        situation: "한국 참치 외식은 '무한리필(1.5만원)' vs '오마카세(10만원+)'로 극단적 양극화가 진행 중입니다. 무한리필/뷔페 검색량이 YoY +53% 증가했으며, 이는 고물가 시대의 가성비 추구 트렌드입니다. 동시에 '참치정육점' 신규 포맷과 D2C 온라인 배달(참치타임, 참치팸 등)이 전국 상권을 공략 중입니다.",
        actionPlan: "'정육점형' 포맷(0 로열티, 동원수산 원료 공급)은 낮은 진입장벽으로 가맹 확산이 빠릅니다. D2C 채널은 콜드체인 없이 전국 배송이 가능하여, 중소 가공업체의 신규 수익원이 될 수 있습니다.",
        source: 'KR_SME_Franchise_Dossier, KR_franchise_table.csv',
      }}
      customBody={
        <div style={{ padding: '0 4px' }}>
          {/* ── 포맷 카드 3열 ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {formats.map((f) => (
              <div
                key={f.name}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${f.color}33`,
                  borderTop: `3px solid ${f.color}`,
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ fontSize: '1.6rem' }}>{f.icon}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0' }}>{f.name}</div>
                <div style={{ fontSize: '0.78rem', color: f.color, fontWeight: 600 }}>{f.price}</div>
                <div
                  style={{
                    display: 'inline-block',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#fff',
                    background: f.color,
                    borderRadius: '6px',
                    padding: '2px 8px',
                    alignSelf: 'flex-start',
                  }}
                >
                  {f.trend}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* ── 브랜드 테이블 ── */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
              🏪 주요 참치 외식 브랜드
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.75rem',
                  color: '#cbd5e1',
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    {['브랜드', '매장수', '운영', '특화', '원료 공급'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '6px 8px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#94a3b8',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {brands.map((b) => (
                    <tr key={b.name} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 600 }}>{b.name}</td>
                      <td style={{ padding: '6px 8px' }}>{b.stores}</td>
                      <td style={{ padding: '6px 8px' }}>{b.type}</td>
                      <td style={{ padding: '6px 8px' }}>{b.specialty}</td>
                      <td style={{ padding: '6px 8px' }}>{b.supplier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── D2C 브랜드 필 리스트 ── */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
              📦 D2C 온라인 배달 브랜드
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {d2cBrands.map((b) => (
                <span
                  key={b}
                  style={{
                    background: 'linear-gradient(135deg, #6366f122, #8b5cf622)',
                    border: '1px solid #6366f144',
                    borderRadius: '20px',
                    padding: '5px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#c4b5fd',
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}
