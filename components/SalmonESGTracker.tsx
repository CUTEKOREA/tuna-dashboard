// @ts-nocheck
"use client";
import React, { useState } from 'react';
import { Leaf, Shield, Users, Thermometer } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/salmon_esg_tracker.json';

const ICONS: Record<string, any> = { Users, Thermometer, Shield };
const originData: Record<string, any[]> = rawData.originData;

export default function SalmonESGTracker() {
  const [selectedOrigin, setSelectedOrigin] = useState<string>('노르웨이');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', label: '낮은 위험' };
      case 'medium': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: '보통' };
      case 'high': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', label: '높은 위험' };
      default: return { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', label: 'N/A' };
    }
  };

  const scores = originData[selectedOrigin] || [];
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) : 0;

  const takeawayByOrigin: Record<string, { situation: string; actionPlan: string }> = {
    '노르웨이': {
      situation: `노르웨이 평균 ESG 점수 ${avgScore}/100. 강제노동 리스크는 95점으로 최저 수준이며, Barentswatch 통합 추적 시스템이 EU TRACES와 연동되어 이력 추적성도 90점에 달합니다. 다만 해상 양식 환경 영향은 72점으로 RAS(순환여과) 전환이 35%에 머물러 개선 여지가 있습니다.`,
      actionPlan: '단기적으로 노르웨이산 비중 확대를 통해 SIMP/EU 강제노동규제 리스크를 헷지하고, 중기적으로 RAS 생산자와의 직거래 라인을 확보하여 ESG 프리미엄을 마진으로 흡수합니다.',
    },
    '칠레': {
      situation: `칠레 평균 ESG 점수 ${avgScore}/100. 강제노동 부문은 85점으로 양호하나 환경 영향이 58점으로 SRS 감염·항생제 사용량·FCR 1.40 열위가 누적 리스크를 형성합니다. 이력 추적은 75점으로 Sernapesca 인증 체계는 안정적이지만 SIMP 대응이 진행 중입니다.`,
      actionPlan: '칠레산은 SRS 발병기 직전 선구매로 가격 메리트를 취하되, 환경 ESG 우려가 큰 B2C 채널(대형마트 PB)에서는 노출을 축소하고 가공·외식 채널 중심으로 우회 판매합니다.',
    },
    '러시아': {
      situation: `러시아 평균 ESG 점수 ${avgScore}/100. OFAC/EU 제재 대상국 지위로 강제노동(40)·환경(45)·이력추적(30) 전 부문이 적색 신호입니다. 제3국 우회 수출 의심 사례가 보고되어 SIMP·EU CBAM 위반 시 거래정지 리스크가 직접 노출됩니다.`,
      actionPlan: '러시아산 직·간접 조달을 즉시 중단하고, 공급사 KYC 강화 및 C/O 원산지 재검증 프로세스를 도입하여 제3국 우회 노출까지 사전 차단합니다.',
    },
  };

  const tk = takeawayByOrigin[selectedOrigin] || takeawayByOrigin['노르웨이'];

  const body = (
    <div style={{ padding: '0 0 0.5rem 0' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {Object.keys(originData).map(o => (
          <button key={o} onClick={() => setSelectedOrigin(o)} style={{
            padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
            background: selectedOrigin === o ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.03)',
            border: selectedOrigin === o ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.1)',
            color: selectedOrigin === o ? '#10b981' : '#94a3b8',
          }}>
            {o === '노르웨이' ? '🇳🇴' : o === '칠레' ? '🇨🇱' : '🇷🇺'} {o}
          </button>
        ))}
        <div style={{
          marginLeft: 'auto', fontSize: '1rem', fontWeight: 800,
          color: avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#f59e0b' : '#ef4444',
        }}>
          평균 {avgScore}/100
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {scores.map((s, i) => {
          const cfg = getStatusColor(s.status);
          const IconComp = ICONS[s.iconName] || Shield;
          return (
            <div key={i} style={{
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              borderRadius: '8px', padding: '1rem', textAlign: 'center',
            }}>
              <IconComp size={20} color={cfg.color} style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.4rem' }}>{s.category}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: cfg.color, marginBottom: '0.3rem' }}>{s.score}</div>
              <span style={{
                fontSize: '0.6rem', padding: '2px 6px', borderRadius: '3px',
                background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontWeight: 700,
              }}>{cfg.label}</span>

              <div style={{ marginTop: '0.6rem', textAlign: 'left' }}>
                {s.details.map((d: string, j: number) => (
                  <div key={j} style={{ fontSize: '0.65rem', color: '#94a3b8', lineHeight: 1.5, paddingLeft: '0.5rem', borderLeft: `2px solid ${cfg.border}`, marginBottom: '0.2rem' }}>
                    {d}
                  </div>
                ))}
              </div>

              {s.research && (
                <div style={{ fontSize: '0.55rem', color: '#475569', fontStyle: 'italic', marginTop: '0.5rem' }}>
                  📚 {s.research.slice(0, 50)}...
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="ESG 공급망 투명성 트래커"
      icon={Leaf}
      iconColor="#10b981"
      pillar="S5"
      cardDesc="원산지(노르웨이·칠레·러시아)별 강제노동·환경·이력추적 3축 ESG 점수 비교"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      customBody={body}
      takeaway={{
        situation: tk.situation,
        actionPlan: tk.actionPlan,
        source: '윤미경(2021) 원양 ESG · 박찬엽(2025) 강제노동 규범화 · 이남수(2025) 수산 업사이클링',
      }}
    />
  );
}
