'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

const countries = [
  {
    flag: '🇺🇸', name: '미국', role: '사시미 소비(수입)',
    trade2024: '수입 $829M', rawMaterial: '80-85% 수입',
    bluefin: '수입 $147M (MX/ES)', keyCompany: 'True World Foods',
    japanDep: '-', keyRisk: 'CO 처리, 2025 관세',
    color: '#10b981',
  },
  {
    flag: '🇪🇺', name: 'EU', role: 'BFT 생산→일본 수출',
    trade2024: '사시미 수입 €0.2-0.4B', rawMaterial: 'EU내 축양 + 역외',
    bluefin: '생산→90% 일본', keyCompany: 'Balfegó, Ricardo Fuentes',
    japanDep: 'BFT 90%', keyRisk: 'ICCAT 쿼터, BFT 가격',
    color: '#a78bfa',
  },
  {
    flag: '🇰🇷', name: '한국', role: 'WCPO 어획→수출 강국',
    trade2024: '수출 $543M / 수입 $128M', rawMaterial: '자체 선단 (WCPO)',
    bluefin: '수입 $10M (지중해)', keyCompany: '동원 (StarKist US#1)',
    japanDep: '사시미 80%', keyRisk: '가다랑어↓, 일본 의존',
    color: '#f59e0b',
  },
  {
    flag: '🇯🇵', name: '일본', role: '세계 최대 사시미 시장',
    trade2024: '최대 BFT 수입국', rawMaterial: '수입 + 국내',
    bluefin: '수입 (ES/MX/AU/KR)', keyCompany: 'Maruha, Nissui',
    japanDep: '(수입국)', keyRisk: '장기 수요 감소',
    color: '#ef4444',
  },
];

const fields: { key: keyof typeof countries[0]; label: string }[] = [
  { key: 'role', label: '역할' },
  { key: 'trade2024', label: '2024 무역' },
  { key: 'rawMaterial', label: '원료 구조' },
  { key: 'bluefin', label: 'BFT 포지션' },
  { key: 'keyCompany', label: '핵심 기업' },
  { key: 'japanDep', label: '일본 의존도' },
  { key: 'keyRisk', label: '핵심 리스크' },
];

export default function SasFourCountryComparison() {
  return (
    <WidgetCard
      id="W-SAS18"
      title="4개국 사시미 공급망 구조 비교"
      description="미국·EU·한국·일본의 역할, 무역 구조, BFT 포지션 비교"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="글로벌 사시미 공급망의 4개국(미국·EU·한국·일본) 구조적 역할 및 리스크 비교 카드"
      takeaway={{
        situation: "글로벌 사시미 공급망은 '삼각형+1' 구조입니다. EU→일본 BFT(90%) + 한국→일본 사시미(80%) = 일본의 공급 백본. 한국만이 생산자+수출자+프리미엄 수입자(혼마구로)의 3중 역할을 동시에 수행하는 유일한 국가입니다.",
        actionPlan: "일본 수요 감소는 EU(축양)+ 한국(연승) 모두에게 구조적 리스크입니다. EU는 Balfegó가 미국(38%)/중국(15%)으로 다변화 중이며, 한국도 동일한 수출 다변화 전략이 시급합니다.",
        source: 'US Census/UN Comtrade(HS0302-0304), KCS, KMI, GLOBEFISH',
      }}
      customBody={
        <div>
          {/* ── 4-column 카드 레이아웃 ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            {countries.map((c) => (
              <div
                key={c.name}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${c.color}33`,
                  borderTop: `3px solid ${c.color}`,
                  borderRadius: '10px',
                  padding: '14px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0px',
                }}
              >
                {/* 국가 헤더 */}
                <div
                  style={{
                    textAlign: 'center',
                    marginBottom: '10px',
                    paddingBottom: '10px',
                    borderBottom: `1px solid ${c.color}22`,
                  }}
                >
                  <div style={{ fontSize: '2rem', lineHeight: 1 }}>{c.flag}</div>
                  <div
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: c.color,
                      marginTop: '4px',
                    }}
                  >
                    {c.name}
                  </div>
                </div>

                {/* 필드 목록 */}
                {fields.map((f) => (
                  <div key={f.key} style={{ marginBottom: '8px' }}>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: 'var(--w-slate-500)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '2px',
                      }}
                    >
                      {f.label}
                    </div>
                    <div
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--w-slate-200)',
                        lineHeight: 1.35,
                        fontWeight: f.key === 'role' ? 600 : 400,
                      }}
                    >
                      {c[f.key] as string}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* ── 구조 요약 배너 ── */}
          <div
            style={{
              marginTop: '16px',
              background: 'linear-gradient(135deg, var(--w-navy-900), #0a0f1f)',
              border: '1px solid #f59e0b33',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '1.6rem' }}>🔺</div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#facc15' }}>
                삼각형+1 공급 구조
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-400)', lineHeight: 1.5, marginTop: '2px' }}>
                EU(축양 BFT) → 일본 | 한국(연승 사시미) → 일본 | 미국(소비) ← 전세계 |
                한국만 생산+수출+수입의 3중 역할 수행
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
