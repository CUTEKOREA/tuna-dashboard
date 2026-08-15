'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const rfmoData = [
  { rfmo: 'WCPFC', hcr: 'green' as const, tac: 'green' as const, observer: 'amber' as const, suspensionRisk: 'low' as const, certified: 42, label: '서중부태평양' },
  { rfmo: 'IOTC', hcr: 'red' as const, tac: 'amber' as const, observer: 'red' as const, suspensionRisk: 'high' as const, certified: 8, label: '인도양' },
  { rfmo: 'ICCAT', hcr: 'amber' as const, tac: 'green' as const, observer: 'green' as const, suspensionRisk: 'medium' as const, certified: 15, label: '대서양' },
  { rfmo: 'IATTC', hcr: 'amber' as const, tac: 'amber' as const, observer: 'amber' as const, suspensionRisk: 'medium' as const, certified: 6, label: '동부태평양' },
];

type RAGColor = 'green' | 'amber' | 'red';
type RiskLevel = 'low' | 'medium' | 'high';

const RAG_STYLES: Record<RAGColor, { color: string, label: string, shadow: string }> = {
  green: { color: '#10b981', label: '양호', shadow: '0 0 8px rgba(16,185,129,0.5)' },
  amber: { color: '#f59e0b', label: '부분', shadow: '0 0 8px rgba(245,158,11,0.5)' },
  red: { color: '#ef4444', label: '미흡', shadow: '0 0 8px rgba(239,68,68,0.5)' },
};

const RISK_INLINE: Record<RiskLevel, { bg: string, color: string, label: string }> = {
  low: { bg: 'rgba(16,185,129,0.1)', color: '#34d399', label: '낮음' },
  medium: { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', label: '중간' },
  high: { bg: 'rgba(239,68,68,0.1)', color: '#f87171', label: '높음' },
};

function RagDot({ status }: { status: RAGColor }) {
  const s = RAG_STYLES[status];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: s.color, boxShadow: s.shadow }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.label}</span>
    </div>
  );
}

export default function MscRfmoAlignment() {
  const columns = ['RFMO', 'HCR 채택', 'TAC 설정', '옵저버 프로그램', '정지 리스크', '인증 어업 수'];

  const body = (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', marginTop: 8 }}>
      <div style={{ background: 'rgba(30,41,59,0.3)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(140,170,255,0.12)' }}>
              {columns.map((col) => (
                <th key={col} style={{ padding: 12, textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--w-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rfmoData.map((row, i) => (
              <tr key={row.rfmo} style={i < rfmoData.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.04)' } : undefined}>
                <td style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: 'var(--w-slate-200)' }}>{row.rfmo}</div>
                  <div style={{ fontSize: 10, color: 'var(--w-slate-500)', fontWeight: 500 }}>{row.label}</div>
                </td>
                <td style={{ padding: 12, textAlign: 'center' }}><RagDot status={row.hcr} /></td>
                <td style={{ padding: 12, textAlign: 'center' }}><RagDot status={row.tac} /></td>
                <td style={{ padding: 12, textAlign: 'center' }}><RagDot status={row.observer} /></td>
                <td style={{ padding: 12, textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    backgroundColor: RISK_INLINE[row.suspensionRisk].bg,
                    color: RISK_INLINE[row.suspensionRisk].color,
                  }}>
                    {RISK_INLINE[row.suspensionRisk].label}
                  </span>
                </td>
                <td style={{
                  padding: 12,
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: 18,
                  fontVariantNumeric: 'tabular-nums',
                  color: row.certified >= 20 ? 'var(--w-emerald-500)' : row.certified >= 10 ? 'var(--w-sky-400)' : 'var(--w-amber-500)',
                }}>
                  {row.certified}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Row */}
        <div style={{ borderTop: '1px solid rgba(140,170,255,0.12)', padding: 12, display: 'flex', justifyContent: 'center', gap: 24, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: 'var(--w-slate-400)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--w-emerald-500)' }} /> 양호
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: 'var(--w-slate-400)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--w-amber-500)' }} /> 부분
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: 'var(--w-slate-400)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--w-red-500)' }} /> 미흡
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      id="W-MSC13"
      title="RFMO 관리체계 정합성 매트릭스"
      description="4대 지역수산기구(RFMO)의 MSC 인증 기준 충족 RAG 평가"
      icon={Shield}
      iconColor="#38bdf8"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="글로벌 컴플라이언스 리스크"
      takeaway={{
        situation: "WCPFC가 가장 안정적(양호 2개)인 반면, IOTC는 수확제어규칙(HCR) 미채택 및 옵저버 미흡으로 정지 리스크가 '높음' 수준입니다. 인도양 참치의 MSC 재인증 불확실성이 큽니다.",
        actionPlan: "IOTC 조업 비중이 높은 원양 선단은 규제 리스크에 가장 크게 노출되어 있습니다. 인도양의 수확전략 채택 전까지, 조업 해역 다변화(IOTC→WCPFC)를 통해 인증 정지 리스크를 분산해야 합니다.",
        source: "MSC Preserving Ocean Life Biodiversity Report 2025",
      }}
      customBody={body}
    />
  );
}
