/**
 * FfaSupplyConcentrationRisk — 공급 집중도 리스크
 *
 * PNA 국가별 WCPO 어획 점유율을 수평 막대 차트로 시각화하고,
 * HHI(허핀달-허슈만 지수)로 시장 집중도를 평가. 국가별 리스크 태그 표시.
 */

'use client';
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, LabelList } from 'recharts';
import WidgetCard from './WidgetCard';
import { truncateKoreanLabel } from '../lib/chart-standards';

// ─── 데이터 ──────────────────────────────────────────────────────────────────

const supplyData = [
  { 국가: 'PNG', 비중: 28, 어획량: 856521, 리스크: 'MPA·화산' },
  { 국가: '키리바시', 비중: 18, 어획량: 550621, 리스크: 'ENSO' },
  { 국가: '공해', 비중: 12, 어획량: 367081, 리스크: '규제' },
  { 국가: '마셜제도', 비중: 8, 어획량: 244720, 리스크: '정치' },
  { 국가: 'FSM', 비중: 7, 어획량: 214130, 리스크: '인프라' },
  { 국가: '투발루', 비중: 6, 어획량: 183540, 리스크: 'ENSO' },
  { 국가: '나우루', 비중: 5, 어획량: 152950, 리스크: '소규모' },
  { 국가: '팔라우', 비중: 3, 어획량: 91770, 리스크: 'MPA' },
];

// HHI = 28² + 18² + 12² + 8² + 7² + 6² + 5² + 3²
const HHI = 784 + 324 + 144 + 64 + 49 + 36 + 25 + 9; // = 1,435

// ─── 리스크 색상 매핑 ────────────────────────────────────────────────────────

const RISK_COLORS: Record<string, string> = {
  'MPA·화산': '#ef4444',
  'MPA': '#ef4444',
  'ENSO': '#f59e0b',
  '정치': '#8b5cf6',
  '인프라': '#94a3b8',
  '소규모': '#94a3b8',
  '규제': '#3b82f6',
};

function getRiskColor(risk: string): string {
  return RISK_COLORS[risk] || '#94a3b8';
}

// ─── 커스텀 툴팁 ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div style={{
      background: 'rgba(0,15,30,0.95)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: '0.82rem',
    }}>
      <p style={{ color: '#f8fafc', fontWeight: 700, margin: '0 0 6px 0' }}>
        {d.국가}
      </p>
      <p style={{ color: '#94a3b8', margin: '3px 0' }}>
        점유율:{' '}
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>
          {d.비중}%
        </span>
      </p>
      <p style={{ color: '#94a3b8', margin: '3px 0' }}>
        어획량:{' '}
        <span style={{ color: '#22d3ee', fontWeight: 600 }}>
          {d.어획량.toLocaleString()} MT
        </span>
      </p>
      <p style={{ color: '#94a3b8', margin: '3px 0' }}>
        주요 리스크:{' '}
        <span style={{ color: getRiskColor(d.리스크), fontWeight: 600 }}>
          {d.리스크}
        </span>
      </p>
    </div>
  );
};

// ─── 리스크 범례 ─────────────────────────────────────────────────────────────

const riskLegendItems = [
  { label: 'MPA·화산', color: '#ef4444' },
  { label: 'ENSO', color: '#f59e0b' },
  { label: '규제', color: '#3b82f6' },
  { label: '정치', color: '#8b5cf6' },
  { label: '인프라/소규모', color: '#94a3b8' },
];

const RiskLegend = () => (
  <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '12px 0 4px 0',
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.6)',
  }}>
    <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>리스크 태그:</span>
    {riskLegendItems.map((item) => (
      <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: item.color,
          flexShrink: 0,
        }} />
        {item.label}
      </span>
    ))}
  </div>
);

// ─── 위젯 본체 ──────────────────────────────────────────────────────────────

export default function FfaSupplyConcentrationRisk() {
  return (
    <WidgetCard
      title="공급 집중도 리스크"
      icon={AlertTriangle}
      iconColor="#f59e0b"
      pillar="S1"
      cardDesc="PNA 국가별 WCPO 어획 점유율 및 HHI 집중도 분석"
      telemetry={{ status: 'STATIC', syncDate: '2024 FFA/WCPFC' }}
      termTooltip={{
        term: 'HHI',
        description: '허핀달-허슈만 지수. 시장 집중도 측정 지표. 1,500 미만=저집중, 1,500-2,500=중간, 2,500 초과=고집중.',
      }}
      kpiPanel={[
        { label: 'HHI 지수', value: '1,435', sub: '저집중 근접', trendColor: '#f59e0b' },
        { label: 'PNG 점유율', value: '28%', sub: '856,521 MT' },
        { label: '상위 3국 합계', value: '58%', sub: 'PNG+키리바시+공해' },
      ]}
      chartHeight={320}
      chart={
        <BarChart
          data={supplyData}
          layout="vertical"
          margin={{ top: 10, right: 40, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
          <YAxis
            dataKey="국가"
            type="category"
            width={70}
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
            tickFormatter={(v) => truncateKoreanLabel(v, 7)}
          />
          <XAxis
            type="number"
            unit="%"
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Legend
            wrapperStyle={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}
            formatter={(value: string) => (
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>
            )}
          />
          <Bar dataKey="비중" name="어획 점유율 (%)" barSize={20} radius={[0, 4, 4, 0]}>
            {supplyData.map((entry, idx) => (
              <Cell
                key={`supply-${idx}`}
                fill={getRiskColor(entry.리스크)}
                fillOpacity={0.85}
              />
            ))}
            <LabelList
              dataKey="비중"
              position="right"
              style={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600 }}
              formatter={(v: number) => `${v}%`}
            />
          </Bar>
        </BarChart>
      }
      customBody={<RiskLegend />}
      takeaway={{
        situation: 'PNG가 WCPO 어획량의 28%를 점유하여 단일 국가 의존도 높음. HHI 1,435로 저집중·중간 경계 수준(1,500 미만). 상위 3개 공급원(PNG+키리바시+공해)이 58% 점유. PNG는 MPA 확대·화산 활동 리스크, 키리바시는 ENSO 민감도 높음.',
        actionPlan: 'PNG 의존도 분산 필수. FSM·마셜 등 중소국 조업권 확보, PNA 외 어장(대서양, 동태평양) 대안 공급링 검토. 엘니뇨 주기 연동 허리케인 리스크 대비 필수.',
        source: 'FFA/WCPFC 2024 어획 통계',
      }}
    />
  );
}
