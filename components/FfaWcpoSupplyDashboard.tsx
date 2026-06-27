'use client';

import React from 'react';
import { Ship } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import WidgetCard from './WidgetCard';
import { truncateKoreanLabel } from '../lib/chart-standards';
import { ChartPatternDefs } from './ChartPatterns';
import SafeResponsiveContainer from './SafeResponsiveContainer';

// ─── 어종별 2024 WCPFC 어획 데이터 (FFA/SPC 검증) ───────────────────────────
const SPECIES_DATA = [
  { species: '가다랑어', abbr: 'SKJ', catchMt: 2045720, share: 67, yoy: '+24%', valueBn: 3.21, valueYoy: '+8%' },
  { species: '황다랑어', abbr: 'YFT', catchMt: 741473,  share: 24, yoy: '-1.5%', valueBn: 1.62, valueYoy: '-20%' },
  { species: '눈다랑어', abbr: 'BET', catchMt: 151611,  share: 5,  yoy: '+4%', valueBn: 0.51, valueYoy: '-26%' },
  { species: '날개다랑어', abbr: 'ALB', catchMt: 120201, share: 4,  yoy: '+19%', valueBn: 0.29, valueYoy: '-5%' },
];

// 도넛 차트용 데이터
const DONUT_DATA = SPECIES_DATA.map((s) => ({
  name: `${s.species} (${s.abbr})`,
  value: s.catchMt,
  share: s.share,
}));

// 어종별 색상: SKJ=cyan, YFT=amber, BET=rose, ALB=violet
const SPECIES_COLORS = ['#22d3ee', '#f59e0b', '#ef4444', '#8b5cf6'];

// ─── 연도별 총 어획량 추이 (2012-2024, FFA/SPC 근사치) ──────────────────────
const HISTORICAL_DATA = [
  { year: '2012', catchMt: 2511000 },
  { year: '2014', catchMt: 2874000 },
  { year: '2016', catchMt: 2726000 },
  { year: '2018', catchMt: 2981000 },
  { year: '2019', catchMt: 2918000 },
  { year: '2020', catchMt: 2623000 },
  { year: '2021', catchMt: 2632000 },
  { year: '2022', catchMt: 2774000 },
  { year: '2023', catchMt: 2660000 },
  { year: '2024', catchMt: 3059005 },
];

// ─── 커스텀 도넛 라벨 ─────────────────────────────────────────────────────────
const renderDonutLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, share, name,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (share < 4) return null;
  return (
    <text
      x={x}
      y={y}
      fill="rgba(255,255,255,0.85)"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={11}
    >
      {name} {share}%
    </text>
  );
};

// ─── 커스텀 툴팁 (도넛) ─────────────────────────────────────────────────────
const DonutTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, share } = payload[0].payload;
  return (
    <div style={{
      background: '#0a0f1f',
      border: '1px solid #334155',
      borderRadius: 8,
      padding: '8px 14px',
    }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>
        {name}
      </p>
      <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.8rem' }}>
        {value.toLocaleString()} MT ({share}%)
      </p>
    </div>
  );
};

// ─── 커스텀 툴팁 (라인) ─────────────────────────────────────────────────────
const LineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0a0f1f',
      border: '1px solid #334155',
      borderRadius: 8,
      padding: '8px 14px',
    }}>
      <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.8rem' }}>
        {label}년
      </p>
      <p style={{ color: '#22d3ee', fontWeight: 600, margin: '4px 0 0 0', fontSize: '0.85rem' }}>
        총 어획량: {payload[0].value.toLocaleString()} MT
      </p>
    </div>
  );
};

// ─── KPI 패널 데이터 ─────────────────────────────────────────────────────────
const KPI_ITEMS = [
  { label: '총 어획량', value: '3,059,005 MT', sub: '전년비 +15% (역대 최고)', trendColor: '#22d3ee' },
  { label: '총 가치', value: '$5.6B', sub: '전년비 -6%', trendColor: '#f59e0b' },
  { label: '최대 어종', value: 'SKJ 67%', sub: '가다랑어 2,045,720 MT' },
  { label: '가치 최대', value: 'SKJ $3.21B', sub: '전년비 +8%' },
];

// ─── 컴포넌트 본체 ──────────────────────────────────────────────────────────
export default function FfaWcpoSupplyDashboard() {
  const customBody = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 8px' }}>
      {/* 어종별 점유 도넛 */}
      <div>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '0.85rem',
          color: '#94a3b8',
          fontWeight: 600,
        }}>
          🐟 어종별 어획 비중 (2024)
        </h4>
        <div style={{ width: '100%', height: 260 }}>
          <SafeResponsiveContainer width="100%" height={260}>
            <PieChart>
              <ChartPatternDefs />
              <Pie
                data={DONUT_DATA}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                label={renderDonutLabel}
                labelLine={{ stroke: 'rgba(255,255,255,0.25)', strokeWidth: 1 }}
                strokeWidth={2}
                stroke="#0a0f1f"
              >
                {DONUT_DATA.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={SPECIES_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
              <Legend
                formatter={(value: string) => (
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{value}</span>
                )}
              />
            </PieChart>
          </SafeResponsiveContainer>
        </div>
      </div>

      {/* 어종별 상세 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
      }}>
        {SPECIES_DATA.map((s, i) => (
          <div
            key={s.abbr}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${SPECIES_COLORS[i]}30`,
              borderRadius: 10,
              padding: '10px 14px',
              borderLeft: `3px solid ${SPECIES_COLORS[i]}`,
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}>
              <span style={{ color: SPECIES_COLORS[i], fontWeight: 700, fontSize: '0.85rem' }}>
                {s.species}
              </span>
              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{s.abbr}</span>
            </div>
            <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>
              {s.catchMt.toLocaleString()} MT
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{
                color: s.yoy.startsWith('+') ? '#34d399' : '#f87171',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}>
                어획 {s.yoy}
              </span>
              <span style={{
                color: '#94a3b8',
                fontSize: '0.75rem',
              }}>
                ${s.valueBn}B ({s.valueYoy})
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 연도별 총 어획량 추이 라인 차트 */}
      <div>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '0.85rem',
          color: '#94a3b8',
          fontWeight: 600,
        }}>
          📈 WCPO 총 어획량 추이 (2012-2024)
        </h4>
        <div style={{ width: '100%', height: 240 }}>
          <SafeResponsiveContainer width="100%" height={240}>
            <LineChart data={HISTORICAL_DATA} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="wcpoLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis
                dataKey="year"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(tick) => truncateKoreanLabel(tick, 7)}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<LineTooltip />} />
              <Line
                type="monotone"
                dataKey="catchMt"
                name="총 어획량"
                stroke="url(#wcpoLineGrad)"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#0a0f1f', strokeWidth: 2, stroke: '#22d3ee' }}
                activeDot={{ r: 6, fill: '#22d3ee' }}
              />
            </LineChart>
          </SafeResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="WCPO 수급 대시보드"
      icon={Ship}
      iconColor="#22d3ee"
      pillar="S1"
      cardDesc="FFA/SPC 2024 WCPFC 통계 기반 서중부태평양 참치 어종별 어획량·가치 종합 현황"
      telemetry={{ status: 'STATIC', syncDate: '2024 FFA/SPC' }}
      termTooltip={{
        term: 'WCPO',
        description: 'WCPO(Western and Central Pacific Ocean)는 서중부태평양 해역으로, 전 세계 참치 어획량의 약 55%를 차지하는 최대 참치 어장. WCPFC(서중부태평양수산위원회)가 관리.',
      }}
      kpiPanel={KPI_ITEMS}
      customBody={customBody}
      takeaway={{
        situation: '<div><p>2024년 WCPFC 총 어획량 <strong>3,059,005 MT</strong>로 전년 대비 +15% 증가, <strong>역대 최고 기록</strong>을 경신. 가다랑어(SKJ)가 2,045,720 MT(67%)로 전년 대비 +24% 급증하며 전체 성장 견인.</p><p>반면 총 가치는 <strong>$5.6B으로 전년 대비 -6% 하락</strong>. 물량 증가에도 가격 하락 압력 우세. 황다랑어(YFT) 가치 -20%, 눈다랑어(BET) 가치 -26% 급감으로 고급 어종 수익성 악화.</p><p>SKJ 67% 단일 어종 편중 심화. 라니냐·엘니뇨 사이클에 전체 공급의 2/3가 직접 노출되는 기후 변동성 리스크 구조.</p></div>',
        actionPlan: '<div><p><strong>재정의</strong>: 물량 최대 vs 가치 하락의 디커플링. MT당 가치($/MT)를 핵심 KPI로 전환.</p><ol style="margin: 4px 0 0 18px; padding: 0;"><li style="margin-bottom: 8px;"><strong>어종 포트폴리오 리밸런싱</strong>: SKJ 67% 편중에서 YFT·ALB 비중 확대로 단가 방어. 황다랑어 선도계약(forward) 매입 검토.</li><li style="margin-bottom: 8px;"><strong>가격 하락기 재고 전략</strong>: BET·YFT 가치 급감 국면에서 전략적 재고 축적하여 가격 반등 시 마진 극대화.</li><li><strong>기후 리스크 헷지</strong>: ENSO(엘니뇨-남방진동) 예보 기반 어획량 변동 시나리오별 조달 계획 수립. 2개 해역 이상 분산 소싱 의무화.</li></ol></div>',
        source: 'FFA/SPC WCPFC Tuna Fishery Report 2024, WCPFC Statistical Yearbook',
      }}
    />
  );
}
