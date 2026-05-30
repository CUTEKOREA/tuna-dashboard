'use client';

import React from 'react';
import { Grid3X3 } from 'lucide-react';
import WidgetCard from '../WidgetCard';

/* ── Data ─────────────────────────────────────────────────────────────────── */

interface SpeciesRow {
  species: string;
  speciesKo: string;
  WCPFC: number;
  IOTC: number;
  ICCAT: number;
  IATTC: number;
}

const data: SpeciesRow[] = [
  { species: 'Skipjack',   speciesKo: '가다랑어',   WCPFC: 72, IOTC: 38, ICCAT: 45, IATTC: 55 },
  { species: 'Yellowfin',  speciesKo: '황다랑어',   WCPFC: 45, IOTC: 22, ICCAT: 35, IATTC: 40 },
  { species: 'Albacore',   speciesKo: '날개다랑어', WCPFC: 85, IOTC: 30, ICCAT: 78, IATTC: 65 },
  { species: 'Bigeye',     speciesKo: '눈다랑어',   WCPFC: 35, IOTC: 15, ICCAT: 28, IATTC: 30 },
];

const rfmos = ['WCPFC', 'IOTC', 'ICCAT', 'IATTC'] as const;

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function avg(nums: number[]): number {
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function getCellColor(pct: number): string {
  if (pct >= 65) return 'rgba(16,185,129,0.35)';   // emerald
  if (pct >= 40) return 'rgba(245,158,11,0.30)';    // amber
  return 'rgba(239,68,68,0.30)';                     // red
}

function getTextColor(pct: number): string {
  if (pct >= 65) return '#34d399';
  if (pct >= 40) return '#fbbf24';
  return '#f87171';
}

/* ── Styles ───────────────────────────────────────────────────────────────── */

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: '3px',
  fontSize: '0.82rem',
};

const thStyle: React.CSSProperties = {
  padding: '10px 8px',
  color: '#94a3b8',
  fontWeight: 600,
  fontSize: '0.75rem',
  textAlign: 'center',
  letterSpacing: '0.02em',
};

const speciesCell: React.CSSProperties = {
  padding: '10px 12px',
  color: '#e2e8f0',
  fontWeight: 600,
  fontSize: '0.8rem',
  whiteSpace: 'nowrap',
};

const subLabel: React.CSSProperties = {
  color: '#64748b',
  fontWeight: 400,
  fontSize: '0.72rem',
  marginLeft: '4px',
};

function cellStyle(pct: number): React.CSSProperties {
  return {
    padding: '10px 8px',
    textAlign: 'center',
    fontWeight: 700,
    fontSize: '0.88rem',
    color: getTextColor(pct),
    backgroundColor: getCellColor(pct),
    borderRadius: '6px',
    transition: 'transform 0.15s',
  };
}

const avgCellStyle = (pct: number): React.CSSProperties => ({
  ...cellStyle(pct),
  fontWeight: 600,
  fontSize: '0.8rem',
  opacity: 0.85,
  borderLeft: '2px solid rgba(148,163,184,0.15)',
});

const avgRowCellStyle = (pct: number): React.CSSProperties => ({
  ...cellStyle(pct),
  fontWeight: 600,
  fontSize: '0.8rem',
  opacity: 0.85,
  borderTop: '2px solid rgba(148,163,184,0.15)',
});

/* ── Component ────────────────────────────────────────────────────────────── */

export default function MscSpeciesCoverageHeatmap() {
  const colAvgs = rfmos.map((r) => avg(data.map((d) => d[r])));
  const totalAvg = avg(colAvgs);

  return (
    <WidgetCard
      title="W-MSC01. 어종×해역 MSC 인증 커버리지"
      icon={Grid3X3}
      iconColor="#38bdf8"
      pillar="S5"
      cardDesc="MSC 인증 비율을 참치 4대 어종 × 4대 RFMO 해역별로 매핑한 히트맵 테이블"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      customBody={
        <div style={{ padding: '0 16px 8px 16px', overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: 'left', minWidth: 140 }}>어종</th>
                {rfmos.map((r) => (
                  <th key={r} style={thStyle}>{r}</th>
                ))}
                <th style={{ ...thStyle, color: '#64748b' }}>평균</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const vals = rfmos.map((r) => row[r]);
                const rowAvg = avg(vals);
                return (
                  <tr key={row.species}>
                    <td style={speciesCell}>
                      {row.species}
                      <span style={subLabel}>({row.speciesKo})</span>
                    </td>
                    {rfmos.map((r) => (
                      <td key={r} style={cellStyle(row[r])}>{row[r]}%</td>
                    ))}
                    <td style={avgCellStyle(rowAvg)}>{rowAvg}%</td>
                  </tr>
                );
              })}
              {/* Column averages row */}
              <tr>
                <td style={{ ...speciesCell, color: '#64748b', fontSize: '0.75rem' }}>
                  해역 평균
                </td>
                {colAvgs.map((ca, i) => (
                  <td key={i} style={avgRowCellStyle(ca)}>{ca}%</td>
                ))}
                <td style={{
                  ...avgRowCellStyle(totalAvg),
                  borderLeft: '2px solid rgba(148,163,184,0.15)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                }}>
                  {totalAvg}%
                </td>
              </tr>
            </tbody>
          </table>

          {/* Legend */}
          <div style={{
            display: 'flex', gap: '16px', justifyContent: 'center',
            marginTop: '12px', fontSize: '0.72rem', color: '#64748b',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: 'rgba(16,185,129,0.5)', display: 'inline-block' }} />
              ≥65% 높음
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: 'rgba(245,158,11,0.45)', display: 'inline-block' }} />
              40–64% 보통
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: 'rgba(239,68,68,0.45)', display: 'inline-block' }} />
              &lt;40% 낮음
            </span>
          </div>
        </div>
      }
      takeaway={{
        situation: '전 세계 23개 상업 참치 자원 중 MSC 인증 커버리지는 어종·해역별로 극심한 편차. 날개다랑어(WCPFC 85%)는 높은 반면, 눈다랑어(IOTC 15%)는 최저. WCPFC 전체 평균 59%로 가장 높고, IOTC 26%로 가장 낮음.',
        actionPlan: '한국 원양 선단의 IOTC 조업 비중이 높은 상황에서, 인도양 인증 갭은 원료 수출 시 유럽 바이어 요구를 충족하기 어렵다는 의미. WCPFC 가다랑어(72%) 중심의 인증 원료 확보 전략이 현실적.',
        source: 'MSC Sustainable Tuna Yearbook 2025/2026',
      }}
    />
  );
}
