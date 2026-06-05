/**
 * 신흥시장 기회 레이더 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 71줄 → After 56줄 (-21%, customBody 활용)
 */

'use client';
import React, { useState, useEffect } from 'react';
import { Globe, MapPin } from 'lucide-react';
import WidgetCard from './WidgetCard';

interface Market {
  country: string; code: string; pop_m: number;
  tuna_import_growth_5yr: number; current_import_mt: number;
  opportunity_usd_m: number; priority: string; barrier: string;
}

export function EmergingMarketsHeatmap() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tuna-emerging-markets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then((r) => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const regions = [
    { key: 'africa', title: '🌍 아프리카', color: '#f59e0b', markets: data?.africa?.markets || [] },
    { key: 'middle_east', title: '🕌 중동', color: '#22c55e', markets: data?.middle_east?.markets || [] },
    { key: 'asean', title: '🌏 ASEAN', color: '#06b6d4', markets: data?.asean?.markets || [] },
  ];

  return (
    <WidgetCard
      title="글로벌 사우스 참치 시장 기회 레이더"
      icon={Globe}
      iconColor="#f59e0b"
      pillar="S4"
      cardDesc="국정연 아프리카 수산협력·할랄 수출전략·ASEAN 무역 보고서 기반 아프리카·중동·ASEAN 권역의 참치 수입 성장률·시장 규모·진입 장벽 복합 분석"
      unit="(단위: USD Million)"
      telemetry={{ status: 'SYNCED', syncDate: '2025-12', source: 'UN Comtrade + 국정연' }}
      customBody={
        loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>로딩 중...</div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {regions.map((region) => (
              <div key={region.key}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: region.color, marginBottom: '6px' }}>{region.title}</div>
                <div style={{ display: 'grid', gap: '4px' }}>
                  {region.markets.slice(0, 3).map((m: Market, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.72rem' }}>
                      <MapPin size={12} color={region.color} />
                      <span style={{ flex: 1, color: '#f8fafc', fontWeight: 600 }}>{m.country}</span>
                      <span style={{ color: region.color, fontWeight: 700, fontFamily: 'monospace' }}>+{m.tuna_import_growth_5yr}%</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>${m.opportunity_usd_m}M</span>
                      <span style={{ padding: '1px 6px', borderRadius: '4px', fontSize: '0.55rem', fontWeight: 700, background: m.priority === 'HIGH' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: m.priority === 'HIGH' ? '#ef4444' : '#f59e0b' }}>{m.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      }
      takeaway={{
        situation: `<div>
<p>"글로벌 사우스(Global South)"란 아프리카·동남아·중동·남미 신흥국 묶음. 선진국 시장이 정체된 반면 글로벌 사우스 참치 시장은 고성장세를 보이고 있음. 총 기회 규모 <strong>약 $1.9B</strong>(국정연·UN Comtrade 추산, 2023).</p>
<p>핵심 시장 매트릭스:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>나이지리아 $597M, 5년 +23%</strong> — 인구 2.2억, 중산층 형성기, 통조림 수요 증가</li>
<li><strong>인도네시아 $352M, +18%</strong> — 무슬림 인구 2.7억, 할랄 인증 및 가격 민감 시장</li>
<li><strong>UAE 할랄 프리미엄 $180M</strong> — kg당 단가 일반 시장 대비 +30~40% 마진 우위(업계 추정)</li>
</ul>
<p>시사점: 글로벌 사우스는 ① 통조림 물량 성장 ② 할랄 프리미엄 시장 ③ 현지 가공 거점 후보 세 가지 경로를 동시에 활용 가능한 복합 기회 시장.</p>
</div>`,
        actionPlan: `<div>
<p><strong>전략 방향</strong>: 글로벌 사우스를 단순 신규 시장이 아닌 중장기 한국 참치 브랜드의 글로벌 성장 거점으로 접근. 시장별 차별화 전략으로 단계적 진입 검토.</p>
<p><strong>3단계 진입 방안</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>나이지리아 — 현지 캔 브랜드 라이센싱</strong>: 현지 1차 유통사 소수 지분 5~10% 취득 + 브랜드 라이센싱 구조 검토. 3년 내 점유율 5% 목표.</li>
<li style="margin-bottom: 8px;"><strong>UAE — 할랄 인증 + 프리미엄 라인</strong>: JAKIM/MUI 할랄 인증 획득 + 두바이·아부다비 호스피탈리티 직접 채널. kg당 $2 추가 마진 가능성.</li>
<li><strong>베트남 — OEM 가공 거점</strong>: 현지 인건비 차익 활용 + 미국·EU 무관세 혜택 결합. 글로벌 사우스 역내 유통 거점으로 활용 가능.</li>
</ol>
</div>`,
        source: '국정연 아프리카 수산협력(2023-05) · 할랄 수출전략(2023-09) · UN Comtrade',
      }}
    />
  );
}

export default EmergingMarketsHeatmap;
