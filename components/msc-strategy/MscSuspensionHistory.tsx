'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import WidgetCard from '../WidgetCard';

/* ── Data ─────────────────────────────────────────────────────────── */

const suspensionData = [
  { year: 2019, fishery: 'SZLC WCPO 가다랑어·황다랑어', reason: '혼획 초과 (상어류)', duration: '18개월', outcome: '조건부 복원', color: '#f59e0b' },
  { year: 2020, fishery: 'OPAGAC IO 가다랑어', reason: 'IOTC HCR 미이행', duration: '24개월', outcome: '정지 유지', color: '#ef4444' },
  { year: 2021, fishery: 'Echebastar IO 가다랑어', reason: '자원 건전성 미달', duration: '12개월', outcome: '재인증 성공', color: '#f59e0b' },
  { year: 2022, fishery: 'PNA WCPO 자유학교 가다랑어', reason: '조건 미충족', duration: '6개월', outcome: '조건부 복원', color: '#10b981' },
  { year: 2023, fishery: 'Tri Marine WCPO 선망', reason: '옵저버 커버리지 부족', duration: '진행 중', outcome: '심사 중', color: '#f59e0b' },
  { year: 2024, fishery: 'AGAC IO 가다랑어·황다랑어', reason: 'IOTC 관리조치 미흡', duration: '12개월+', outcome: '조건부 복원', color: '#f59e0b' },
];

const OUTCOME_STYLES: Record<string, { color: string; bg: string }> = {
  '조건부 복원': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  '정지 유지': { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  '재인증 성공': { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  '심사 중': { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

/* ── Component ────────────────────────────────────────────────────── */

export default function MscSuspensionHistory() {
  const body = (
    <div style={{ position: 'relative', paddingLeft: '32px' }}>
      {/* Vertical timeline line */}
      <div style={{
        position: 'absolute',
        left: '14px',
        top: '8px',
        bottom: '8px',
        width: '2px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 2,
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {suspensionData.map((item, idx) => {
          const outcomeStyle = OUTCOME_STYLES[item.outcome] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };

          return (
            <div key={idx} style={{ position: 'relative' }}>
              {/* Timeline Dot */}
              <div style={{
                position: 'absolute',
                left: '-24px',
                top: '16px',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: item.color,
                boxShadow: `0 0 8px ${item.color}66`,
                border: '2px solid rgba(15,23,42,0.9)',
              }} />

              {/* Card */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderLeft: `3px solid ${item.color}`,
                borderRadius: 10,
                padding: '14px 16px',
              }}>
                {/* Top Row: Year + Fishery */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: item.color,
                      background: `${item.color}1a`,
                      padding: '2px 8px',
                      borderRadius: 4,
                      marginRight: '8px',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {item.year}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>
                      {item.fishery}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: outcomeStyle.color,
                    background: outcomeStyle.bg,
                    padding: '2px 10px',
                    borderRadius: 6,
                    flexShrink: 0,
                  }}>
                    {item.outcome}
                  </span>
                </div>

                {/* Detail Row */}
                <div style={{ display: 'flex', gap: '20px', fontSize: '0.75rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>사유: </span>
                    <span style={{ color: '#94a3b8' }}>{item.reason}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>기간: </span>
                    <span style={{ color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>{item.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div style={{
        marginTop: '20px',
        background: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.15)',
        borderRadius: 10,
        padding: '14px 16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        textAlign: 'center',
      }}>
        <div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ef4444', fontVariantNumeric: 'tabular-nums' }}>6건</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>총 정지·유예</div>
        </div>
        <div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b', fontVariantNumeric: 'tabular-nums' }}>50%</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>IOTC 해역 비중</div>
        </div>
        <div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>14.4개월</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>평균 정지 기간</div>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="W15. MSC 인증 정지·유예 연대기"
      icon={AlertTriangle}
      iconColor="#ef4444"
      pillar="S5"
      cardDesc="2019~2024년 주요 MSC 참치 인증 정지·유예 사례의 사유·기간·결과 추적"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      customBody={body}
      takeaway={{
        situation: "2019~2024년 총 6건의 주요 인증 정지·유예 사례 중, IOTC 해역 관련이 3건(50%)으로 가장 빈번. 주요 사유는 RFMO 관리조치 미흡(HCR 미이행), 혼획 초과, 옵저버 커버리지 부족 순. 정지 기간은 평균 14.4개월.",
        actionPlan: "인증 정지 시 해당 원료의 MSC 라벨 사용이 즉시 중단 — 유럽 리테일러 매대 탈락으로 직결. 한국 선단의 인증 유지를 위해 ① IOTC 해역 조업 시 옵저버 100% 탑재, ② 혼획 저감장치(shark line) 의무화, ③ 조건(Condition) 이행 전담팀 운영이 필요.",
        source: "MSC Annual Report 2023-2025, MSC Supplementary Information, MSC Tuna Yearbook 2025/2026",
      }}
    />
  );
}
