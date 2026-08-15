'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import WidgetCard from '../WidgetCard';

type Status = 'pass' | 'partial' | 'fail';

interface StockRow {
  species: string;
  rfmo: string;
  p1Score: number;
  hcr: Status;
  status: Status;
}

const stockData: StockRow[] = [
  { species: '가다랑어', rfmo: 'WCPFC 서부', p1Score: 100, hcr: 'pass', status: 'pass' },
  { species: '가다랑어', rfmo: 'WCPFC 동부', p1Score: 85, hcr: 'pass', status: 'pass' },
  { species: '가다랑어', rfmo: 'IATTC', p1Score: 80, hcr: 'partial', status: 'pass' },
  { species: '가다랑어', rfmo: 'ICCAT 동부', p1Score: 88.1, hcr: 'pass', status: 'pass' },
  { species: '가다랑어', rfmo: 'ICCAT 서부', p1Score: 82, hcr: 'partial', status: 'pass' },
  { species: '가다랑어', rfmo: 'IOTC', p1Score: 72, hcr: 'fail', status: 'pass' },
  { species: '황다랑어', rfmo: 'WCPFC', p1Score: 88.8, hcr: 'pass', status: 'pass' },
  { species: '황다랑어', rfmo: 'IATTC', p1Score: 75, hcr: 'partial', status: 'pass' },
  { species: '황다랑어', rfmo: 'ICCAT', p1Score: 60, hcr: 'fail', status: 'fail' },
  { species: '황다랑어', rfmo: 'IOTC', p1Score: 55, hcr: 'fail', status: 'fail' },
  { species: '눈다랑어', rfmo: 'WCPFC', p1Score: 78, hcr: 'partial', status: 'pass' },
  { species: '눈다랑어', rfmo: 'IATTC', p1Score: 58, hcr: 'fail', status: 'fail' },
  { species: '눈다랑어', rfmo: 'ICCAT', p1Score: 70, hcr: 'partial', status: 'pass' },
  { species: '눈다랑어', rfmo: 'IOTC', p1Score: 50, hcr: 'fail', status: 'fail' },
  { species: '날개다랑어', rfmo: 'WCPFC 북부', p1Score: 85, hcr: 'pass', status: 'pass' },
  { species: '날개다랑어', rfmo: 'WCPFC 남부', p1Score: 82, hcr: 'pass', status: 'pass' },
  { species: '날개다랑어', rfmo: 'ICCAT 북부', p1Score: 80, hcr: 'partial', status: 'pass' },
  { species: '날개다랑어', rfmo: 'ICCAT 남부', p1Score: 78, hcr: 'partial', status: 'pass' },
  { species: '날개다랑어', rfmo: 'IOTC', p1Score: 55, hcr: 'fail', status: 'fail' },
];

const STATUS_COLOR: Record<Status, string> = {
  pass: '#10b981',
  partial: '#f59e0b',
  fail: '#ef4444',
};

const STATUS_BG: Record<Status, string> = {
  pass: 'rgba(16,185,129,0.15)',
  partial: 'rgba(245,158,11,0.15)',
  fail: 'rgba(239,68,68,0.12)',
};

const STATUS_LABEL: Record<Status, string> = {
  pass: 'PASS',
  partial: 'PARTIAL',
  fail: 'FAIL',
};

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'rgba(16,185,129,0.12)';
  if (score >= 60) return 'rgba(245,158,11,0.12)';
  return 'rgba(239,68,68,0.10)';
}

// Group by species
function groupBySpecies(data: StockRow[]): Map<string, StockRow[]> {
  const map = new Map<string, StockRow[]>();
  data.forEach((row) => {
    if (!map.has(row.species)) map.set(row.species, []);
    map.get(row.species)!.push(row);
  });
  return map;
}

const SPECIES_COLORS: Record<string, string> = {
  '가다랑어': '#38bdf8',
  '황다랑어': '#f59e0b',
  '눈다랑어': '#a78bfa',
  '날개다랑어': '#10b981',
};

export default function MscStockScorecard() {
  const grouped = groupBySpecies(stockData);
  const passCount = stockData.filter((d) => d.p1Score >= 80).length;
  const failCount = stockData.length - passCount;

  const body = (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'separate', borderSpacing: '0 3px' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '0.70rem', fontWeight: 700, color: 'var(--w-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 90 }}>
              어종
            </th>
            <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '0.70rem', fontWeight: 700, color: 'var(--w-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 100 }}>
              RFMO / 해역
            </th>
            <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '0.70rem', fontWeight: 700, color: 'var(--w-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 80 }}>
              P1 점수
            </th>
            <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '0.70rem', fontWeight: 700, color: 'var(--w-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 80 }}>
              HCR
            </th>
            <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '0.70rem', fontWeight: 700, color: 'var(--w-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 80 }}>
              자원 상태
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from(grouped.entries()).map(([species, rows]) =>
            rows.map((row, idx) => (
              <tr key={`${species}-${row.rfmo}`} style={{ background: 'rgba(30,41,59,0.3)' }}>
                {idx === 0 && (
                  <td
                    rowSpan={rows.length}
                    style={{
                      padding: '10px',
                      fontWeight: 700,
                      color: SPECIES_COLORS[species] || 'var(--w-slate-200)',
                      fontSize: '0.82rem',
                      borderRadius: '8px 0 0 8px',
                      verticalAlign: 'middle',
                      borderLeft: `3px solid ${SPECIES_COLORS[species] || 'var(--w-sky-400)'}`,
                    }}
                  >
                    {species}
                  </td>
                )}
                <td style={{ padding: '8px 10px', color: 'var(--w-slate-300)', fontWeight: 500 }}>
                  {row.rfmo}
                </td>
                <td style={{ padding: '4px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px 0',
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      fontVariantNumeric: 'tabular-nums',
                      color: getScoreColor(row.p1Score),
                      background: getScoreBg(row.p1Score),
                    }}
                  >
                    {row.p1Score}
                  </div>
                </td>
                <td style={{ padding: '4px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: '0.70rem',
                      letterSpacing: '0.03em',
                      color: STATUS_COLOR[row.hcr],
                      background: STATUS_BG[row.hcr],
                    }}
                  >
                    {STATUS_LABEL[row.hcr]}
                  </div>
                </td>
                <td style={{ padding: '4px', borderRadius: idx === rows.length - 1 ? '0 8px 8px 0' : undefined }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: '0.70rem',
                      letterSpacing: '0.03em',
                      color: STATUS_COLOR[row.status],
                      background: STATUS_BG[row.status],
                    }}
                  >
                    {STATUS_LABEL[row.status]}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Summary Stats */}
      <div
        style={{
          marginTop: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}
      >
        <div
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 10,
            padding: '12px 8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--w-emerald-500)', fontVariantNumeric: 'tabular-nums' }}>
            {passCount}
          </div>
          <div style={{ fontSize: 11, color: 'var(--w-emerald-400)', fontWeight: 600, marginTop: 2 }}>
            P1 통과 (≥80)
          </div>
        </div>
        <div
          style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10,
            padding: '12px 8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--w-red-500)', fontVariantNumeric: 'tabular-nums' }}>
            {failCount}
          </div>
          <div style={{ fontSize: 11, color: '#f87171', fontWeight: 600, marginTop: 2 }}>
            P1 미달 (&lt;80)
          </div>
        </div>
        <div
          style={{
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 10,
            padding: '12px 8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--w-amber-500)', fontVariantNumeric: 'tabular-nums' }}>
            7<span style={{ fontSize: 14, fontWeight: 600 }}>/19</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--w-amber-400)', fontWeight: 600, marginTop: 2 }}>
            HCR 완전 이행
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 14, fontSize: '0.72rem', color: 'var(--w-slate-500)', fontWeight: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(16,185,129,0.4)', display: 'inline-block' }} /> PASS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(245,158,11,0.4)', display: 'inline-block' }} /> PARTIAL
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(239,68,68,0.3)', display: 'inline-block' }} /> FAIL
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      id="W-MSC19"
      title="참치 자원 P1 스코어카드"
      description="23개 상업 참치 자원의 MSC P1(자원 건전성) 평가 현황"
      icon={ShieldCheck}
      iconColor="#10b981"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="ISSF 기술보고서 기반 참치 자원별 P1 점수·HCR 이행·자원 상태 RAG 히트맵"
      customBody={body}
      takeaway={{
        situation: "23개 상업 참치 자원 중 12개만 MSC P1(자원 건전성)을 통과합니다. 핵심 실패 원인은 수확통제규칙(HCR) 미이행 — 23개 중 7개만 HCR을 완전 이행했습니다. 인도양(IOTC) 전 어종이 HCR 미비로 취약합니다.",
        actionPlan: "HCR 미이행 자원(16개)은 RFMO에서 수확전략이 채택되지 않는 한 MSC 인증이 불가능합니다. 한국 선단은 IOTC 의존도를 줄이고 WCPFC 조업 비중을 확대하는 것이 인증 획득의 핵심 전략입니다.",
        source: "ISSF Technical Report 2025-08",
      }}
    />
  );
}
