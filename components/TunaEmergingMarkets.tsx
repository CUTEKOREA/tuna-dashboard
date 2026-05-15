'use client';
import React, { useState, useEffect } from 'react';
import { Globe, MapPin } from 'lucide-react';
import styles from './TunaInsightsDashboard.module.css';
import TakeawayBox from './TakeawayBox';

interface Market { country: string; code: string; pop_m: number; tuna_import_growth_5yr: number; current_import_mt: number; opportunity_usd_m: number; priority: string; barrier: string; }

export function EmergingMarketsHeatmap() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tuna-emerging-markets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const regions = [
    { key: 'africa', title: '🌍 아프리카', color: '#f59e0b', markets: data?.africa?.markets || [] },
    { key: 'middle_east', title: '🕌 중동', color: '#22c55e', markets: data?.middle_east?.markets || [] },
    { key: 'asean', title: '🌏 ASEAN', color: '#06b6d4', markets: data?.asean?.markets || [] },
  ];

  const totalOpp = data?.composite_score?.total_opportunity_usd_m || 1899;

  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Globe size={18} style={{ color: '#f59e0b' }} />
          [신흥시장 기회] 글로벌 사우스 참치 시장 기회 레이더
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>(단위: USD Million)</span>
        </h3>
        <p className={styles.cardDesc}>
          국정연 아프리카 수산협력·할랄 수출전략·ASEAN 무역 보고서 기반으로 아프리카·중동·ASEAN 권역의 참치 수입 성장률, 시장 규모, 진입 장벽을 복합 분석하여 우선순위별 시장 기회를 제시합니다.
        </p>
      </div>
      <div className={styles.cardBody} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
      {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div> : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {regions.map(region => (
            <div key={region.key}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: region.color, marginBottom: '6px' }}>{region.title}</div>
              <div style={{ display: 'grid', gap: '4px' }}>
                {region.markets.slice(0, 3).map((m: Market, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.72rem' }}>
                    <MapPin size={12} color={region.color} />
                    <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 600 }}>{m.country}</span>
                    <span style={{ color: region.color, fontWeight: 700, fontFamily: 'monospace' }}>+{m.tuna_import_growth_5yr}%</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>${m.opportunity_usd_m}M</span>
                    <span style={{ padding: '1px 6px', borderRadius: '4px', fontSize: '0.55rem', fontWeight: 700, background: m.priority === 'HIGH' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: m.priority === 'HIGH' ? '#ef4444' : '#f59e0b' }}>{m.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <TakeawayBox
        situation="[신흥시장 폭발 성장] 글로벌 사우스 참치 시장 총 기회규모는 $1.9B입니다. 나이지리아($597M, 5년 성장률 +23%)와 인도네시아($352M, +18%)가 최대 성장 시장이며, UAE 할랄 프리미엄 시장($180M)은 kg당 단가가 일반 시장 대비 30~40% 높아 마진 극대화에 유리합니다."
        actionPlan="[3단계 진입 전략] ① 나이지리아: 현지 캔 브랜드 라이센싱으로 마켓 선점(3년 내 점유율 5% 목표), ② UAE: 할랄 인증 + 프리미엄 라인 전개로 kg당 $2 추가 마진 확보, ③ 베트남: OEM 가공 허브로 활용하여 현지 인건비 사익을 극대화해야 합니다."
        source="국정연 아프리카 수산협력(2023-05) · 할랄 수출전략(2023-09) · UN Comtrade"
      />
      </div>
    </div>
  );
}

export default EmergingMarketsHeatmap;
