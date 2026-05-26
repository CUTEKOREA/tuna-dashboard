'use client';

import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import rawData from '../data/mackerel_sankey.json';
import WidgetCard from './WidgetCard';

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
    </>
  );

  return (
    <WidgetCard
      title="가성비 단백질 배급망 (무역 플로우)"
      icon={Truck}
      iconColor="#14b8a6"
      pillar="S3"
      cardDesc="2023 수출국 → 수입국 상위 무역 플로우 — 긴급 덤핑 루트 점검"
      telemetry={{ status: 'STATIC' }}
      customBody={customBody}
      takeaway={{
        situation: `<div>
<p>"무역 플로우 매트릭스(Trade Flow Matrix)"란 글로벌 commodity의 수출국→수입국 흐름을 시각화해 공급망 집중도·교란 취약점을 진단하는 분석법. 단일국 의존도 75%+ 는 critical concentration risk.</p>
<p>실측: <strong>한국 수입의 75~80%가 노르웨이 단일국 의존 — TAC 52% 삭감 + MSC 인증 상실로 공급 안정성 critical. 칠레/아일랜드→아프리카/동남아 벌크 라인은 별도 이원 구조</strong>. 한국→가나/나이지리아 재수출 신흥 루트도 확장 중.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 노르웨이 80% 의존은 단순 편중이 아닌 <strong>"공급 cliff 사건 시 즉시 P&L 파산할 single point of failure"</strong>.</p>
<p><strong>3단계</strong>: ① 노르웨이 의존도 2027년까지 50% 이하 로드맵 ② 아이슬란드·페로제도산 대형어로 대체 소싱(대형어용), 칠레산·아일랜드산은 가공·통조림용 한정 ③ 가나/나이지리아 재수출 라인을 자체 수출 인프라로 전환 — 중계 마진 내재화.</p>
</div>`,
        source: "FAO FishStatJ Mackerel Trade Flow Matrix (2023)"
      }}
    />
  );
}
