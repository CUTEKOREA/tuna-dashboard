'use client';

import React from 'react';
import { Grid3X3 } from 'lucide-react';
import WidgetCard from '../WidgetCard';

interface SpeciesRow {
  species: string;
  speciesKo: string;
  WCPFC: number;
  IOTC: number;
  ICCAT: number;
  IATTC: number;
  [key: string]: string | number;
}

const data: SpeciesRow[] = [
  { species: 'Skipjack',   speciesKo: '가다랑어',   WCPFC: 72, IOTC: 38, ICCAT: 45, IATTC: 55 },
  { species: 'Yellowfin',  speciesKo: '황다랑어',   WCPFC: 45, IOTC: 22, ICCAT: 35, IATTC: 40 },
  { species: 'Albacore',   speciesKo: '날개다랑어', WCPFC: 85, IOTC: 30, ICCAT: 78, IATTC: 65 },
  { species: 'Bigeye',     speciesKo: '눈다랑어',   WCPFC: 35, IOTC: 15, ICCAT: 28, IATTC: 30 },
];

const rfmos = ['WCPFC', 'IOTC', 'ICCAT', 'IATTC'] as const;

function avg(nums: number[]): number {
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function getCellStyle(pct: number): React.CSSProperties {
  if (pct >= 65) return { background: 'rgba(16,185,129,0.2)', color: '#10b981' };
  if (pct >= 40) return { background: 'rgba(245,158,11,0.2)', color: '#f59e0b' };
  return { background: 'rgba(239,68,68,0.1)', color: '#ef4444' };
}

export default function MscSpeciesCoverageHeatmap() {
  const colAvgs = rfmos.map((r) => avg(data.map((d) => d[r] as number)));
  const totalAvg = avg(colAvgs);

  const body = (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '120px' }}>어종</th>
            {rfmos.map((r) => (
              <th key={r} style={{ padding: '8px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{r}</th>
            ))}
            <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>평균</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const vals = rfmos.map((r) => row[r] as number);
            const rowAvg = avg(vals);
            return (
              <tr key={row.species} style={{ background: 'rgba(30,41,59,0.3)' }}>
                <td style={{ padding: '12px', borderRadius: '8px 0 0 8px', fontWeight: 600, color: '#cbd5e1' }}>
                  {row.species}
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '8px', fontWeight: 400 }}>({row.speciesKo})</span>
                </td>
                {rfmos.map((r) => (
                  <td key={r} style={{ padding: '4px' }}>
                    <div style={{
                      width: '100%',
                      padding: '8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      fontVariantNumeric: 'tabular-nums',
                      ...getCellStyle(row[r] as number),
                    }}>
                      {row[r]}%
                    </div>
                  </td>
                ))}
                <td style={{ padding: '4px', borderRadius: '0 8px 8px 0' }}>
                  <div style={{
                    width: '100%',
                    padding: '8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    opacity: 0.8,
                    fontVariantNumeric: 'tabular-nums',
                    ...getCellStyle(rowAvg),
                  }}>
                    {rowAvg}%
                  </div>
                </td>
              </tr>
            );
          })}
          <tr style={{ background: 'transparent' }}>
            <td style={{ padding: '12px', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>해역 평균</td>
            {colAvgs.map((ca, i) => (
              <td key={i} style={{ padding: '4px' }}>
                <div style={{
                  width: '100%',
                  padding: '8px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  opacity: 0.9,
                  fontVariantNumeric: 'tabular-nums',
                  ...getCellStyle(ca),
                }}>
                  {ca}%
                </div>
              </td>
            ))}
            <td style={{ padding: '4px' }}>
              <div style={{
                width: '100%',
                padding: '8px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                fontWeight: 700,
                fontSize: '0.88rem',
                fontVariantNumeric: 'tabular-nums',
                ...getCellStyle(totalAvg),
              }}>
                {totalAvg}%
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(16,185,129,0.4)', display: 'inline-block' }} /> ≥65% (안전)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(245,158,11,0.4)', display: 'inline-block' }} /> 40–64% (보통)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(239,68,68,0.3)', display: 'inline-block' }} /> &lt;40% (위험)
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="어종 × 해역 MSC 인증 커버리지"
      icon={Grid3X3}
      iconColor="#38bdf8"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="MSC 인증 비율을 참치 4대 어종 × 4대 RFMO 해역별로 매핑한 히트맵 · 글로벌 소싱 리스크 관리"
      customBody={body}
      takeaway={{
        situation: "전 세계 상업 참치 자원 중 MSC 인증 커버리지는 어종·해역별로 극심한 편차를 보입니다. 날개다랑어(WCPFC 85%)는 높은 반면, 눈다랑어(IOTC 15%)는 최저입니다. 해역별로는 WCPFC 전체 평균 59%로 가장 높고, IOTC가 26%로 가장 낮습니다.",
        actionPlan: "한국 원양 선단의 IOTC 조업 비중이 높은 상황에서 인도양 인증 갭은 원료 수출 시 유럽 바이어 요구를 충족하기 어렵게 만듭니다. WCPFC 가다랑어(72%) 중심의 인증 원료 확보 전략이 현실적입니다.",
        source: "MSC Sustainable Tuna Yearbook 2025",
      }}
    />
  );
}
