'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import WidgetCard from '../WidgetCard';

/* ── Data ─────────────────────────────────────────────────────────── */

const rfmoData = [
  { rfmo: 'WCPFC', hcr: 'green' as const, tac: 'green' as const, observer: 'amber' as const, suspensionRisk: 'low' as const, certified: 42, label: '서중부태평양' },
  { rfmo: 'IOTC', hcr: 'red' as const, tac: 'amber' as const, observer: 'red' as const, suspensionRisk: 'high' as const, certified: 8, label: '인도양' },
  { rfmo: 'ICCAT', hcr: 'amber' as const, tac: 'green' as const, observer: 'green' as const, suspensionRisk: 'medium' as const, certified: 15, label: '대서양' },
  { rfmo: 'IATTC', hcr: 'amber' as const, tac: 'amber' as const, observer: 'amber' as const, suspensionRisk: 'medium' as const, certified: 6, label: '동부태평양' },
];

type RAGColor = 'green' | 'amber' | 'red';
type RiskLevel = 'low' | 'medium' | 'high';

const RAG_COLORS: Record<RAGColor, string> = {
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
};

const RAG_LABELS: Record<RAGColor, string> = {
  green: '양호',
  amber: '부분',
  red: '미흡',
};

const RISK_STYLES: Record<RiskLevel, { color: string; bg: string; label: string }> = {
  low: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: '낮음' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: '중간' },
  high: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: '높음' },
};

/* ── RAG Dot ─────────────────────────────────────────────────────── */

function RagDot({ status }: { status: RAGColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
      <div style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: RAG_COLORS[status],
        boxShadow: `0 0 6px ${RAG_COLORS[status]}66`,
      }} />
      <span style={{ fontSize: '0.72rem', color: RAG_COLORS[status], fontWeight: 600 }}>
        {RAG_LABELS[status]}
      </span>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────────── */

export default function MscRfmoAlignment() {
  const columns = ['RFMO', 'HCR 채택', 'TAC 설정', '옵저버 프로그램', '정지 리스크', '인증 어업 수'];

  const body = (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {columns.map((col) => (
              <th key={col} style={{
                padding: '12px 14px',
                textAlign: 'center',
                color: '#64748b',
                fontWeight: 600,
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rfmoData.map((row, i) => (
            <tr key={row.rfmo} style={{
              borderBottom: i < rfmoData.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              {/* RFMO Name */}
              <td style={{ padding: '14px', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem' }}>{row.rfmo}</div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>{row.label}</div>
              </td>

              {/* HCR */}
              <td style={{ padding: '14px', textAlign: 'center' }}>
                <RagDot status={row.hcr} />
              </td>

              {/* TAC */}
              <td style={{ padding: '14px', textAlign: 'center' }}>
                <RagDot status={row.tac} />
              </td>

              {/* Observer */}
              <td style={{ padding: '14px', textAlign: 'center' }}>
                <RagDot status={row.observer} />
              </td>

              {/* Suspension Risk */}
              <td style={{ padding: '14px', textAlign: 'center' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: RISK_STYLES[row.suspensionRisk].color,
                  background: RISK_STYLES[row.suspensionRisk].bg,
                }}>
                  {RISK_STYLES[row.suspensionRisk].label}
                </span>
              </td>

              {/* Certified Fisheries */}
              <td style={{
                padding: '14px',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '1rem',
                color: row.certified >= 20 ? '#10b981' : row.certified >= 10 ? '#38bdf8' : '#f59e0b',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {row.certified}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Row */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 16px',
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        fontSize: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ color: '#94a3b8' }}>양호 (Green)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ color: '#94a3b8' }}>부분 (Amber)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ color: '#94a3b8' }}>미흡 (Red)</span>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="W14. RFMO 관리체계 정합성 매트릭스"
      icon={Shield}
      iconColor="#38bdf8"
      pillar="S5"
      cardDesc="4대 RFMO의 MSC 인증 기준 충족 현황 — HCR·TAC·옵저버 프로그램 RAG 평가 및 인증 정지 리스크"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      customBody={body}
      takeaway={{
        situation: "WCPFC가 4개 항목 중 2개 '양호'로 가장 안정적. IOTC는 HCR 미채택+옵저버 프로그램 미흡으로 정지 리스크 '높음' — 인도양 8개 인증 어업 전체가 재인증 불확실성에 노출. ICCAT은 TAC 관리가 양호하나 HCR 이행이 부분적.",
        actionPlan: "IOTC 조업 비중이 높은 한국 원양 선단은 규제 리스크 최대 노출. IOTC의 수확전략 채택이 2026~2027년으로 예상되며, 미채택 시 MSC 인증 정지 가능성. 조업 해역 다변화(IOTC→WCPFC)를 통한 규제 리스크 분산 필요.",
        source: "MSC Preserving Ocean Life Biodiversity Report 2025, MSC Tuna Yearbook 2025/2026",
      }}
    />
  );
}
