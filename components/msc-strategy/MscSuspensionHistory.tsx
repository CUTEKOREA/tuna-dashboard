'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const suspensionData = [
  { year: 2019, fishery: 'SZLC WCPO 가다랑어·황다랑어', reason: '혼획 초과 (상어류)', duration: '18개월', outcome: '조건부 복원', color: '#f59e0b', shadow: '0 0 8px rgba(245,158,11,0.5)', borderColor: '#f59e0b' },
  { year: 2020, fishery: 'OPAGAC IO 가다랑어', reason: 'IOTC HCR 미이행', duration: '24개월', outcome: '정지 유지', color: '#ef4444', shadow: '0 0 8px rgba(239,68,68,0.5)', borderColor: '#ef4444' },
  { year: 2021, fishery: 'Echebastar IO 가다랑어', reason: '자원 건전성 미달', duration: '12개월', outcome: '재인증 성공', color: '#f59e0b', shadow: '0 0 8px rgba(245,158,11,0.5)', borderColor: '#f59e0b' },
  { year: 2022, fishery: 'PNA WCPO 자유학교 가다랑어', reason: '조건 미충족', duration: '6개월', outcome: '조건부 복원', color: '#10b981', shadow: '0 0 8px rgba(16,185,129,0.5)', borderColor: '#10b981' },
  { year: 2023, fishery: 'Tri Marine WCPO 선망', reason: '옵저버 커버리지 부족', duration: '진행 중', outcome: '심사 중', color: '#f59e0b', shadow: '0 0 8px rgba(245,158,11,0.5)', borderColor: '#f59e0b' },
  { year: 2024, fishery: 'AGAC IO 가다랑어·황다랑어', reason: 'IOTC 관리조치 미흡', duration: '12개월+', outcome: '조건부 복원', color: '#f59e0b', shadow: '0 0 8px rgba(245,158,11,0.5)', borderColor: '#f59e0b' },
];

const OUTCOME_INLINE: Record<string, { bg: string; color: string }> = {
  '조건부 복원': { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24' },
  '정지 유지': { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
  '재인증 성공': { bg: 'rgba(16,185,129,0.1)', color: '#34d399' },
  '심사 중': { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8' },
};

export default function MscSuspensionHistory() {
  const body = (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', marginTop: 8, position: 'relative', paddingLeft: 32 }}>
      {/* Vertical timeline line */}
      <div style={{ position: 'absolute', left: 14, top: 8, bottom: 8, width: 2, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 999 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {suspensionData.map((item, idx) => {
          const outcomeStyle = OUTCOME_INLINE[item.outcome] || { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8' };

          return (
            <div key={idx} style={{ position: 'relative' }}>
              {/* Timeline Dot */}
              <div style={{
                position: 'absolute',
                left: -24,
                top: 16,
                width: 12,
                height: 12,
                borderRadius: '50%',
                border: '2px solid #0a0f1f',
                backgroundColor: item.color,
                boxShadow: item.shadow,
                zIndex: 10,
              }} />

              {/* Card */}
              <div style={{
                background: 'rgba(30,41,59,0.3)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderLeft: `3px solid ${item.borderColor}`,
                borderRadius: 8,
                padding: 12,
              }}>
                {/* Top Row: Year + Fishery */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      backgroundColor: 'rgba(30,41,59,0.8)',
                      color: item.color,
                    }}>
                      {item.year}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--w-slate-200)' }}>
                      {item.fishery}
                    </span>
                  </div>
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    backgroundColor: outcomeStyle.bg,
                    color: outcomeStyle.color,
                  }}>
                    {item.outcome}
                  </span>
                </div>

                {/* Detail Row */}
                <div style={{ display: 'flex', gap: 24, fontSize: 12, marginTop: 4 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ color: 'var(--w-slate-400)', fontWeight: 500 }}>사유:</span>
                    <span style={{ color: 'var(--w-slate-300)', fontWeight: 600 }}>{item.reason}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ color: 'var(--w-slate-400)', fontWeight: 500 }}>기간:</span>
                    <span style={{ color: 'var(--w-slate-300)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{item.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div style={{
        marginTop: 20,
        background: 'rgba(239,68,68,0.05)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 12,
        padding: 12,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        textAlign: 'center',
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--w-red-500)', fontVariantNumeric: 'tabular-nums' }}>6건</div>
          <div style={{ fontSize: 12, color: '#f87171', marginTop: 2, fontWeight: 600 }}>총 정지·유예</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--w-amber-500)', fontVariantNumeric: 'tabular-nums' }}>50%</div>
          <div style={{ fontSize: 12, color: 'var(--w-amber-400)', marginTop: 2, fontWeight: 600 }}>IOTC 해역 비중</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--w-slate-400)', fontVariantNumeric: 'tabular-nums' }}>14.4<span style={{ fontSize: 14, fontWeight: 600, marginLeft: 2 }}>개월</span></div>
          <div style={{ fontSize: 12, color: 'var(--w-slate-500)', marginTop: 2, fontWeight: 600 }}>평균 정지 기간</div>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      id="W-MSC14"
      title="MSC 인증 정지·유예 연대기"
      description="2019~2024년 주요 MSC 참치 인증 정지 사례 추적"
      icon={AlertTriangle}
      iconColor="#ef4444"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="글로벌 컴플라이언스 이력"
      takeaway={{
        situation: "총 6건의 주요 정지 사례 중 IOTC(인도양) 해역 관련이 3건(50%)으로 가장 빈번했습니다. 관리조치 미흡, 혼획 초과 등이 주 원인이며 평균 14개월간 인증이 정지되었습니다.",
        actionPlan: "인증 정지는 유럽 리테일 매대 탈락으로 직결됩니다. 원양 선단은 IOTC 조업 시 옵저버 100% 탑재, 혼획 저감장치 도입 등 강력한 ESG 대응 체계를 구축해야 합니다.",
        source: "MSC Annual Report 2024",
      }}
      customBody={body}
    />
  );
}
