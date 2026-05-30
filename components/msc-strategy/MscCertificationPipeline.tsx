'use client';

import React from 'react';
import { Filter } from 'lucide-react';
import WidgetCard from '../WidgetCard';

/* ── Data ─────────────────────────────────────────────────────────────────── */

interface FunnelStage {
  label: string;
  labelKo: string;
  count: number;
  color: string;
  widthPct: number; // visual width percentage
}

const stages: FunnelStage[] = [
  { label: 'Certified',            labelKo: '인증 유지',   count: 71, color: '#10b981', widthPct: 100 },
  { label: 'Pre-assessment',       labelKo: '사전심사',     count: 45, color: '#64748b', widthPct: 63 },
  { label: 'Full Assessment',      labelKo: '정식심사',     count: 23, color: '#f59e0b', widthPct: 32 },
  { label: 'Suspended/Withdrawn',  labelKo: '정지·철회',   count: 12, color: '#ef4444', widthPct: 17 },
];

/* ── Component ────────────────────────────────────────────────────────────── */

export default function MscCertificationPipeline() {
  return (
    <WidgetCard
      title="W-MSC03. MSC 인증 파이프라인"
      icon={Filter}
      iconColor="#f59e0b"
      pillar="S5"
      cardDesc="전 세계 참치 어업의 MSC 인증 파이프라인 단계별 현황 및 전환율 시각화"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      customBody={
        <div style={{ padding: '0 20px 16px 20px' }}>
          {/* KPI row */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '20px',
          }}>
            {/* FIP → MSC Conversion Rate */}
            <div style={{
              flex: 1,
              background: 'rgba(56,189,248,0.08)',
              border: '1px solid rgba(56,189,248,0.2)',
              borderRadius: 10,
              padding: '14px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4, fontWeight: 500 }}>
                FIP → MSC 전환율
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1.1 }}>
                18%
              </div>
            </div>
            {/* Average time to certification */}
            <div style={{
              flex: 1,
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 10,
              padding: '14px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4, fontWeight: 500 }}>
                평균 인증 소요기간
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1.1 }}>
                2.8<span style={{ fontSize: '0.9rem', fontWeight: 600, marginLeft: 2 }}>년</span>
              </div>
            </div>
            {/* Total fisheries in pipeline */}
            <div style={{
              flex: 1,
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 10,
              padding: '14px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4, fontWeight: 500 }}>
                파이프라인 총 어업 수
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', lineHeight: 1.1 }}>
                151<span style={{ fontSize: '0.9rem', fontWeight: 600, marginLeft: 2 }}>건</span>
              </div>
            </div>
          </div>

          {/* Funnel bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stages.map((stage) => (
              <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Label */}
                <div style={{
                  width: 140,
                  flexShrink: 0,
                  textAlign: 'right',
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                  lineHeight: 1.3,
                }}>
                  <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{stage.labelKo}</div>
                  <div style={{ fontSize: '0.7rem' }}>{stage.label}</div>
                </div>
                {/* Bar */}
                <div style={{ flex: 1, position: 'relative' }}>
                  <div style={{
                    width: `${stage.widthPct}%`,
                    height: 36,
                    background: `linear-gradient(90deg, ${stage.color}33, ${stage.color}55)`,
                    border: `1px solid ${stage.color}66`,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 12,
                    transition: 'width 0.3s ease',
                    position: 'relative',
                    overflow: 'visible',
                  }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      color: stage.color,
                      whiteSpace: 'nowrap',
                    }}>
                      {stage.count}
                      <span style={{ fontSize: '0.72rem', fontWeight: 500, marginLeft: 3, color: '#94a3b8' }}>
                        어업
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Flow annotation */}
          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 8,
            border: '1px solid rgba(148,163,184,0.08)',
            fontSize: '0.75rem',
            color: '#64748b',
            lineHeight: 1.6,
            textAlign: 'center',
          }}>
            사전심사 45건 → 정식심사 진행 23건 → 인증 완료 71건 (누적) &nbsp;|&nbsp; 정지·철회 12건
          </div>
        </div>
      }
      takeaway={{
        situation: '현재 45개 어업이 사전심사(Pre-assessment) 단계에 있으며, 이 중 23개가 정식심사 진행 중. 평균 인증 소요기간 2.8년. FIP에서 MSC로 전환하는 비율은 18%에 불과하며, 정지·철회된 인증도 12건 존재.',
        actionPlan: '향후 2~3년 내 신규 인증 어업 20+개 추가 예상 — MSC 인증 참치 공급량 15~20% 확대 전망. 이는 MSC 참치캔 소매가 안정화 요인으로 작용할 전망. 한국 선단은 조기 인증으로 \'초기 공급자 프리미엄\' 확보 가능.',
        source: 'MSC Annual Report 2024-2025, MSC Supplementary Information',
      }}
    />
  );
}
