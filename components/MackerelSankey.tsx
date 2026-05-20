'use client';

import React, { useState } from 'react';
import styles from './MackerelStrategy.module.css';
import { Truck } from 'lucide-react';
import rawData from '../data/mackerel_sankey.json';
import TakeawayBox from './TakeawayBox';

export default function MackerelSankey() {
  const [showAll, setShowAll] = useState(false);
  const data = (rawData as any[]);
  const maxVol = Math.max(...data.map((d: any) => d.volume_t));
  const displayData = showAll ? data : data.slice(0, 15);

  // Group by source
  const sources = [...new Set(data.map((d: any) => d.source))];
  const sourceColors: Record<string, string> = {};
  const palette = ['var(--color-info)','var(--color-danger)','var(--color-success)','var(--color-warning)','#8b5cf6','#06b6d4','#ec4899','#f97316','#14b8a6','#6366f1'];
  sources.forEach((s, i) => { sourceColors[s] = palette[i % palette.length]; });

  return (
    <div className={styles.glassCard} style={{ borderColor: 'rgba(20, 184, 166, 0.3)' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14b8a6', marginBottom: '6px', fontWeight: 700, fontSize: '1.1rem' }}>
          <Truck size={20} /> 가성비 단백질 배급망 (무역 플로우)
          
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', margin: 0 }}>
          2023 수출국 → 수입국 상위 무역 플로우 — 긴급 덤핑 루트 점검
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '140px 20px 140px 1fr 80px', gap: '8px', padding: '6px 12px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
          <span>수출국</span><span></span><span>수입국</span><span>규모</span><span style={{ textAlign: 'right' }}>물량</span>
        </div>
        {displayData.map((d: any, i: number) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '140px 20px 140px 1fr 80px', gap: '8px', alignItems: 'center',
            padding: '8px 12px', borderRadius: '8px',
            background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
          }}>
            <span style={{ color: sourceColors[d.source] || 'var(--text-primary)', fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.source}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>→</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.target}</span>
            <div style={{ height: '16px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{
                height: '100%', borderRadius: '4px',
                width: `${Math.max((d.volume_t / maxVol) * 100, 3)}%`,
                background: `linear-gradient(90deg, ${sourceColors[d.source] || '#14b8a6'}80, ${sourceColors[d.source] || '#14b8a6'}30)`,
              }} />
            </div>
            <span style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{(d.volume_t / 1000).toFixed(1)}K톤</span>
          </div>
        ))}
      </div>

      {data.length > 15 && (
        <button onClick={() => setShowAll(!showAll)} style={{
          marginTop: '12px', padding: '8px 16px', background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.3)',
          borderRadius: '8px', color: '#14b8a6', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, width: '100%'
        }}>
          {showAll ? '접기 ▲' : `전체 ${data.length}개 플로우 보기 ▼`}
        </button>
      )}
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          source="FAO FishStatJ Mackerel Trade Flow Matrix (2023)"
          situation="글로벌 고등어 무역의 핵심 축은 '노르웨이→한국/일본(대형어, 프리미엄)'과 '칠레/아일랜드→아프리카/동남아(소형어, 벌크)'의 이원 구조입니다. 한국은 수입의 75~80%를 노르웨이 단일 국가에 의존하는 극단적 편중 상태이며, 노르웨이의 TAC 삭감(52%)과 MSC 인증 상실로 공급 안정성이 심각하게 훼손된 상황입니다. 특히 한국→가나/나이지리아 재수출 루트가 급성장하며, 한국이 '중간 유통 허브' 역할까지 수행 중입니다."
          actionPlan="노르웨이 의존도(Exposure) 80%를 2027년까지 50% 이하로 낮추는 로드맵을 수립하십시오. 칠레산(잭마커렐)·아일랜드산(대서양고등어)을 보완 소싱 루트로 개척하되, 칠레산은 소형어 중심이므로 가공(필레/통조림)용으로 한정하고, 노르웨이산 대체재로는 아이슬란드·페로제도산 대형어를 우선 테스트."
        />
      </div>
    </div>
  );
}
