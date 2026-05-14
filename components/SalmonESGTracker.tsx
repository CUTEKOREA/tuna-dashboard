// @ts-nocheck
"use client";
import React, { useState } from 'react';
import { Leaf, Shield, AlertTriangle, CheckCircle, Users, Thermometer } from 'lucide-react';

// ============================================================================
// Module D: ESG & 공급망 투명성 트래커
// 근거: 「수산업 강제노동 규범화 대응체계 구축연구」(박찬엽, 2025)
//       「원양산업의 ESG 도입 기초 연구」(윤미경, 2021)
//       「수산물 업사이클링 생태계 조성 방안」(이남수, 2025)
// ============================================================================

interface ESGScore {
  category: string;
  score: number;
  maxScore: number;
  status: 'low' | 'medium' | 'high';
  icon: any;
  details: string[];
  research?: string;
}

export default function SalmonESGTracker() {
  const [selectedOrigin, setSelectedOrigin] = useState<string>('노르웨이');

  const originData: Record<string, ESGScore[]> = {
    '노르웨이': [
      {
        category: '강제노동 리스크', score: 95, maxScore: 100, status: 'low', icon: Users,
        details: ['OECD 회원국 · ILO 핵심협약 비준', '양식업 노동자 보호법 시행', '제3자 사회감사 연 1회 의무'],
        research: '「수산업 강제노동 규범화 대응체계 구축연구」(박찬엽, 2025)',
      },
      {
        category: '환경 영향', score: 72, maxScore: 100, status: 'medium', icon: Thermometer,
        details: ['RAS(순환여과) 전환율 35%', '해상 양식장 해저 오염 모니터링', '사료 전환율(FCR) 1.15 — 업계 최고'],
        research: '「수산물 업사이클링 생태계 조성 방안」(이남수, 2025)',
      },
      {
        category: '이력 추적성', score: 90, maxScore: 100, status: 'low', icon: Shield,
        details: ['Barentswatch 통합 추적 시스템', '부화→가공→수출 전 과정 디지털 기록', 'EU TRACES 연동 완료'],
      },
    ],
    '칠레': [
      {
        category: '강제노동 리스크', score: 85, maxScore: 100, status: 'low', icon: Users,
        details: ['ILO 핵심협약 비준 완료', '계절 노동자 보호 규정 존재', '다만 하도급 체인 투명성 개선 필요'],
        research: '「수산업 강제노동 규범화 대응체계 구축연구」(박찬엽, 2025)',
      },
      {
        category: '환경 영향', score: 58, maxScore: 100, status: 'high', icon: Thermometer,
        details: ['SRS 감염 빈발 → 항생제 사용량 高', '해양 적조 리스크 (2016 대규모 폐사)', 'FCR 1.40 — 노르웨이 대비 열위'],
      },
      {
        category: '이력 추적성', score: 75, maxScore: 100, status: 'medium', icon: Shield,
        details: ['Sernapesca 인증 시스템 운영', '수출용 C/O 발급 체계 안정', 'SIMP 대응 체계 구축 중'],
      },
    ],
    '러시아': [
      {
        category: '강제노동 리스크', score: 40, maxScore: 100, status: 'high', icon: Users,
        details: ['OFAC/EU 제재 대상국', '극동 지역 어업 노동환경 불투명', '강제노동 리스크 "높음" 분류'],
      },
      {
        category: '환경 영향', score: 45, maxScore: 100, status: 'high', icon: Thermometer,
        details: ['IUU 어업 우려 (EU Yellow Card 이력)', '환경 모니터링 체계 취약', '폐수 관리 규정 미비'],
      },
      {
        category: '이력 추적성', score: 30, maxScore: 100, status: 'high', icon: Shield,
        details: ['서방 제재로 직접 교역 차단', '제3국 우회 수출 의심 사례', '디지털 이력추적 시스템 부재'],
      },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', label: 'LOW RISK' };
      case 'medium': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'MEDIUM' };
      case 'high': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', label: 'HIGH RISK' };
      default: return { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', label: 'N/A' };
    }
  };

  const scores = originData[selectedOrigin] || [];
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) : 0;

  return (
    <div style={{
      background: '#181818', borderRadius: '12px', overflow: 'hidden',
      boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        background: 'linear-gradient(90deg, rgba(16,185,129,0.1), rgba(34,197,94,0.05))',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Leaf size={18} color="#10b981" />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>ESG 공급망 투명성 트래커</span>
          <span style={{ fontSize: '0.65rem', color: '#64748b', background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>Module D</span>
        </div>
        <div style={{
          fontSize: '1.5rem', fontWeight: 800,
          color: avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#f59e0b' : '#ef4444',
        }}>
          {avgScore}/100
        </div>
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* Origin Selector */}
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
        </div>

        {/* Score Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {scores.map((s, i) => {
            const cfg = getStatusColor(s.status);
            const IconComp = s.icon;
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
                  {s.details.map((d, j) => (
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

      {/* Research Footer */}
      <div style={{
        padding: '0.6rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.04)',
        fontSize: '0.6rem', color: '#475569', fontStyle: 'italic',
        background: 'rgba(0,0,0,0.2)',
      }}>
        📚 종합 근거: 「원양산업의 ESG 도입 기초 연구」(윤미경, 2021) · 「수산업 강제노동 규범화 대응체계 구축연구」(박찬엽, 2025)
      </div>
    </div>
  );
}
