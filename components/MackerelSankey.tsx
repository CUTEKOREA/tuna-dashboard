'use client';

import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import { getMackerelData } from '@/lib/data/mackerel';
import WidgetCard from './WidgetCard';

const rawData = getMackerelData('sankey');

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

  const customBody = (
    <>
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
            <div style={{ height: '16px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(140,170,255,0.10)' }}>
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
    </>
  );

  return (
    <WidgetCard
      title="가성비 단백질 배급망 (무역 플로우)"
      icon={Truck}
      iconColor="#14b8a6"
      pillar="S3"
      cardDesc="FAO FishStatJ 2023 — 수출국 → 수입국 상위 30개 무역 플로우 (자체추정·illustrative)"
      telemetry={{ status: 'STATIC' }}
      customBody={customBody}
      takeaway={{
        situation: `<div>
<p>무역 플로우 매트릭스란 글로벌 상품의 수출국→수입국 흐름을 시각화해 공급망 집중도·교란 취약점을 진단하는 분석법. 단일국 의존도 75% 초과는 공급 집중 위험 신호로 분류된다.</p>
<p>실측(FAO FishStatJ 2023): <strong>본 데이터셋 기준 한국 고등어 수입은 노르웨이 단일 공급원 의존(100%). 칠레·러시아·영국→아프리카/동남아 벌크 라인은 별도 이원 구조로 운영 중.</strong> 데이터셋에 한국 수출 플로우는 포함되지 않음.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 노르웨이 단일 공급 의존은 공급망 단일 실패지점으로, 어획 쿼터 변동 또는 인증 리스크 발생 시 매입 원가가 직접 영향을 받는 구조다.</p>
<p><strong>대응 방향</strong>: ① 아이슬란드·페로 제도산 대형어로 보완 소싱 검토(대형어용) ② 칠레산·영국산은 가공·통조림용 대체 가능성 타진 ③ 공급국 다변화 비율 목표는 외부 시황 데이터 확인 후 설정 권장.</p>
</div>`,
        source: "FAO FishStatJ 글로벌 고등어 무역 통계 (2023); 자체 추정(illustrative)"
      }}
    />
  );
}
