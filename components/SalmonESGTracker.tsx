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
      situation: `<div>
<p>노르웨이 평균 ESG 점수 <strong>${avgScore}/100</strong>. 글로벌 양식 연어 ESG의 골드 스탠다드.</p>
<p>강점: <strong>강제노동 리스크 95점(최저) + Barentswatch 통합 추적 시스템이 EU TRACES와 연동되어 이력 추적성 90점</strong>. SIMP·EU 강제노동규제 면제 zone.</p>
<p>약점: 해상 양식 환경 영향 72점 — RAS(순환여과) 전환이 35%에 머물러 개선 여지.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 노르웨이는 단순 vendor가 아닌 <strong>"ESG entry license 자산"</strong>. 비중 확대로 SIMP/CBAM 위험 자동 헷지.</p>
<p><strong>3단계</strong>: ① 단기 노르웨이산 비중 확대 — SIMP·EU 강제노동규제 리스크 헷지 ② 중기 RAS 생산자(Salmar·Mowi RAS 라인) 직거래 라인 확보 ③ ESG 프리미엄 +12~18%p 마진 흡수.</p>
</div>`,
    },
    '칠레': {
      situation: `<div>
<p>칠레 평균 ESG 점수 <strong>${avgScore}/100</strong>. 노르웨이 다음 vendor지만 환경 risk 큼.</p>
<p>분야별: 강제노동 85점(양호) · 환경 영향 58점(약점) — <strong>SRS 감염·항생제 사용·FCR 1.40 열위 누적</strong> · 이력 추적 75점(Sernapesca 인증 + SIMP 대응 진행 중).</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 칠레는 <strong>"가격 메리트 + 환경 ESG 리스크" trade-off vendor</strong>. 채널별 선택적 활용이 본질.</p>
<p><strong>3단계</strong>: ① SRS 발병기 직전 선구매로 가격 메리트 ② B2C 채널(대형마트 PB) 노출 축소 — ESG 우려 회피 ③ 가공·외식 채널 중심 우회 판매.</p>
</div>`,
    },
    '러시아': {
      situation: `<div>
<p>러시아 평균 ESG 점수 <strong>${avgScore}/100</strong>. 모든 분야 적색 신호.</p>
<p>위험: <strong>OFAC/EU 제재 대상국 지위 — 강제노동 40·환경 45·이력추적 30 전 부문 적색</strong>. 제3국 우회 수출 의심 → SIMP·EU CBAM 위반 시 거래정지 리스크 직접 노출.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 러시아 직간접 노출은 단순 risk가 아닌 <strong>"즉시 채널 추방 trigger"</strong>.</p>
<p><strong>3단계</strong>: ① 러시아산 직·간접 조달 즉시 중단 ② 공급사 KYC 강화 ③ C/O 원산지 재검증 프로세스 — 제3국 우회 노출까지 사전 차단.</p>
</div>`,
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

      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
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
      cardDesc="원산지(노르웨이·칠레·러시아)별 강제노동·환경·이력추적 3축 ESG 점수 비교 — 점수는 정성 지표 기반 자체 추정(illustrative), 1차 출처 미연동"
      telemetry={{ status: 'STATIC', syncDate: '2026-06-05' }}
      customBody={body}
      takeaway={{
        situation: tk.situation,
        actionPlan: tk.actionPlan,
        source: '점수: 자체 추정(illustrative, 정성 지표 점수화) · 정성 근거 참고문헌: 윤미경(2021) 원양 ESG · 박찬엽(2025) 강제노동 규범화 · 이남수(2025) 수산 업사이클링 (해당 문헌은 ESG 점수의 1차 출처 아님)',
      }}
    />
  );
}
