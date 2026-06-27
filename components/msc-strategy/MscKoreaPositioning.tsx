'use client';

import React from 'react';
import { Flag, CheckCircle, XCircle } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const rfmoMembership = [
  { rfmo: 'WCPFC', label: '서중부태평양', status: 'green', note: '가다랑어 P1=100점' },
  { rfmo: 'IOTC', label: '인도양', status: 'red', note: 'HCR 전 어종 미이행' },
  { rfmo: 'ICCAT', label: '대서양', status: 'amber', note: '황다랑어 HCR 실패' },
  { rfmo: 'IATTC', label: '동부태평양', status: 'amber', note: '눈다랑어 자원 취약' },
  { rfmo: 'CCSBT', label: '남방참다랑어', status: 'amber', note: '쿼터 7.16%' },
];

const comparison = [
  { country: '🇪🇨 에콰도르', before: '2,300t', after: '38,800t', growth: '17배', euExport: '+230%', year: '2022→2024', color: '#10b981' },
  { country: '🇸🇳 세네갈', before: '0', after: '첫 인증', growth: '신규', euExport: '진입', year: '2024.11', color: '#38bdf8' },
  { country: '🇰🇷 한국', before: '0', after: '0', growth: '-', euExport: '미인증', year: '현재', color: '#ef4444' },
];

const statusColors: Record<string, { bg: string; fg: string; border: string }> = {
  green: { bg: 'rgba(16,185,129,0.12)', fg: '#10b981', border: 'rgba(16,185,129,0.3)' },
  amber: { bg: 'rgba(245,158,11,0.12)', fg: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  red: { bg: 'rgba(239,68,68,0.12)', fg: '#ef4444', border: 'rgba(239,68,68,0.3)' },
};

export default function MscKoreaPositioning() {
  return (
    <WidgetCard
      id="W-MSC25"
      title="한국 원양참치 MSC 포지셔닝"
      icon={Flag}
      iconColor="#ef4444"
      pillar="S1"
      cardDesc="5개 RFMO 정회원 × MSC 인증 0건 — 한국 원양 선단의 기회와 갭 분석"
      telemetry={{ status: 'STATIC', syncDate: '2025' }}
      takeaway={{
        situation: "한국은 전 세계에서 극소수의 5개 참치 RFMO 모두 정회원 국가이며, CCSBT 쿼터 7.16%를 보유한 원양 강국입니다. 그러나 MSC 인증 참치 어업은 단 한 건도 없습니다. 반면 에콰도르는 MSC 인증 후 2년 만에 어획량 17배, EU 수출 230% 증가를 달성했습니다.",
        actionPlan: "한국 원양 선단의 MSC 인증 공백은 최대의 기회이자 리스크입니다. WCPFC 가다랑어(P1 100점) 조업분을 최우선 인증 대상으로 추진하면, 가장 빠르게 인증을 획득할 수 있습니다. 에콰도르 사례가 보여주듯, 인증 후 EU 시장 접근이 극적으로 개선됩니다.",
        source: "ISSF 2025-08, MSC Annual Report 2024-2025",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* RFMO Membership Badges */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '10px' }}>
              한국 RFMO 정회원 현황 (MSC 인증 가능성)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {rfmoMembership.map((r) => {
                const sc = statusColors[r.status];
                return (
                  <div key={r.rfmo} style={{
                    background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: '10px',
                    padding: '10px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={12} color={sc.fg} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: sc.fg }}>{r.rfmo}</span>
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{r.label}</div>
                    <div style={{ fontSize: '0.58rem', color: sc.fg, fontWeight: 500, marginTop: '2px' }}>{r.note}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparison Table */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '10px' }}>
              MSC 인증 전후 비교 — 에콰도르 vs 한국
            </div>
            <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr 0.8fr',
                background: 'rgba(255,255,255,0.04)', padding: '8px 12px',
                fontSize: '0.65rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                <span>국가</span><span>인증 전</span><span>인증 후</span><span>성장</span><span>EU 수출</span>
              </div>
              {/* Rows */}
              {comparison.map((c) => (
                <div key={c.country} style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr 0.8fr',
                  padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.04)',
                  fontSize: '0.75rem', alignItems: 'center',
                  background: c.country.includes('한국') ? 'rgba(239,68,68,0.05)' : 'transparent',
                }}>
                  <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{c.country}</span>
                  <span style={{ color: '#94a3b8' }}>{c.before}</span>
                  <span style={{ color: c.color, fontWeight: 600 }}>{c.after}</span>
                  <span style={{ color: c.color, fontWeight: 700 }}>{c.growth}</span>
                  <span style={{ color: c.color, fontWeight: 600 }}>{c.euExport}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Callout */}
          <div style={{
            padding: '12px 16px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <XCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ef4444' }}>
                한국 = 5개 RFMO 모두 정회원, MSC 인증 0건
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                조업 능력은 최상위급이나, 지속가능성 인증은 공백 — 글로벌 공급망에서의 포지션 위축 리스크
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
