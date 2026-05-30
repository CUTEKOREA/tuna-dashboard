/**
 * R4. VDS 시장 인디케이터 위젯
 *
 * VDS(Vessel Day Scheme) 조업일 가격 추이와 PNA 수익 시계열을 이중 Y축 차트로 시각화.
 * 선망·연승 선단 규모, 조업일수, 경제 지표 등 핵심 KPI 제공.
 *
 * pillar: S1 (원료 수급)
 * source: FFA EDIS / PNA Annual Report
 */

'use client';
import React from 'react';
import { Ship } from 'lucide-react';
import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Cell,
} from 'recharts';
import WidgetCard from './WidgetCard';
import { truncateKoreanLabel } from '../lib/chart-standards';
import { ChartPatternDefs } from './ChartPatterns';

// ─── VDS 가격 + PNA 수익 시계열 데이터 ────────────────────────────────────

interface VdsDataPoint {
  year: number;
  vdsPrice: number;      // USD/day
  pnaRevenue: number;    // USD million
}

const vdsData: VdsDataPoint[] = [
  { year: 2015, vdsPrice:  8000, pnaRevenue: 350 },
  { year: 2016, vdsPrice: 10000, pnaRevenue: 450 },
  { year: 2017, vdsPrice: 11000, pnaRevenue: 500 },
  { year: 2018, vdsPrice: 12500, pnaRevenue: 550 },
  { year: 2019, vdsPrice: 13000, pnaRevenue: 580 },
  { year: 2020, vdsPrice: 10500, pnaRevenue: 460 },
  { year: 2021, vdsPrice: 11000, pnaRevenue: 500 },
  { year: 2022, vdsPrice: 13000, pnaRevenue: 550 },
  { year: 2023, vdsPrice: 14000, pnaRevenue: 600 },
  { year: 2024, vdsPrice: 14500, pnaRevenue: 650 },
];

// ─── 선단 통계 (FFA 검증 데이터) ────────────────────────────────────────────

const fleetStats = {
  purseSeineVessels: 228,
  purseSeineChange: -5,        // %
  longlineVessels: 2158,
  longlineChange: -3,          // %
  psFishingDays: 53313,
  psFishingDaysChange: 2,      // %
  psSets: 62476,
  psSetsChange: 21,            // %
  picFlagPsShare: 59,          // %
  picFlagPsCount: 145,
  picFlagPsTotal: 247,
  thaiSkjPrice: 1523,          // $/MT
  thaiSkjChange: -14,          // %
  yaizuSkjPrice: 1466,         // $/MT
  yaizuSkjChange: -24,         // %
  psEconIndex: 111,
  llEconIndex: 84,
};

// ─── 파생 통계 ──────────────────────────────────────────────────────────────

const latestVds = vdsData[vdsData.length - 1];
const prevVds = vdsData[vdsData.length - 2];
const vdsPriceChange = latestVds.vdsPrice - prevVds.vdsPrice;
const vdsPriceChangePct = ((vdsPriceChange / prevVds.vdsPrice) * 100).toFixed(1);

const totalRevenueGrowth = (
  ((latestVds.pnaRevenue - vdsData[0].pnaRevenue) / vdsData[0].pnaRevenue) * 100
).toFixed(0);

// ─── 커스텀 툴팁 ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as VdsDataPoint;
  if (!point) return null;

  return (
    <div style={{
      background: 'rgba(0,15,30,0.95)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: '0.82rem',
    }}>
      <p style={{ color: '#f8fafc', fontWeight: 700, margin: '0 0 6px 0' }}>
        {point.year}년
      </p>
      <p style={{ color: '#94a3b8', margin: '3px 0' }}>
        VDS 가격:{' '}
        <span style={{ color: '#f59e0b', fontWeight: 600 }}>
          ${point.vdsPrice.toLocaleString()}/일
        </span>
      </p>
      <p style={{ color: '#94a3b8', margin: '3px 0' }}>
        PNA 수익:{' '}
        <span style={{ color: '#10b981', fontWeight: 600 }}>
          ${point.pnaRevenue}M
        </span>
      </p>
    </div>
  );
};

// ─── 위젯 본체 ──────────────────────────────────────────────────────────────

export default function FfaVdsMarketIndicator() {
  return (
    <WidgetCard
      title="VDS 시장 인디케이터"
      icon={Ship}
      iconColor="#22d3ee"
      pillar="S1"
      cardDesc="PNA Vessel Day Scheme 조업일 가격과 태평양도서국 수익 추이 (FFA EDIS 기반)"
      telemetry={{ status: 'STATIC', syncDate: '2025-Q4' }}
      termTooltip={{
        term: 'VDS',
        description: 'Vessel Day Scheme. PNA(태평양도서국연합) 8개국이 운영하는 선망 조업일 입찰 제도. 참치 조업 비용의 핵심 결정 요인으로, 1일 조업권 가격이 연간 협상을 통해 결정됨.',
      }}
      kpiPanel={[
        {
          label: 'VDS 가격',
          value: `$${(latestVds.vdsPrice / 1000).toFixed(1)}K/일`,
          sub: `전년 대비 +${vdsPriceChangePct}%`,
          trendColor: '#f59e0b',
        },
        {
          label: '선망 선단',
          value: `${fleetStats.purseSeineVessels}척`,
          sub: `전년 대비 ${fleetStats.purseSeineChange}%`,
          trendColor: '#ef4444',
        },
        {
          label: '조업일수',
          value: `${(fleetStats.psFishingDays / 1000).toFixed(1)}K`,
          sub: `+${fleetStats.psFishingDaysChange}% YoY`,
          trendColor: '#10b981',
        },
        {
          label: 'PS 경제지수',
          value: fleetStats.psEconIndex.toString(),
          sub: '20년 평균 상회',
          trendColor: '#10b981',
        },
      ]}
      chartHeight={320}
      chart={
        <ComposedChart data={vdsData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
          <ChartPatternDefs />
          <defs>
            <linearGradient id="vdsPriceAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="vdsRevenueBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="year"
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
            tickFormatter={(v) => truncateKoreanLabel(v, 7)}
          />
          <YAxis
            yAxisId="left"
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: '#f59e0b', fontSize: 10 }}
            domain={[6000, 16000]}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            label={{
              value: 'VDS 가격 ($/일)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#f59e0b', fontSize: 10 },
              offset: -5,
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: '#10b981', fontSize: 10 }}
            domain={[200, 750]}
            tickFormatter={(v: number) => `$${v}M`}
            label={{
              value: 'PNA 수익 ($M)',
              angle: 90,
              position: 'insideRight',
              style: { fill: '#10b981', fontSize: 10 },
              offset: -5,
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Legend
            wrapperStyle={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}
            formatter={(value: string) => (
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>
            )}
          />
          <Bar
            yAxisId="right"
            dataKey="pnaRevenue"
            name="PNA 수익"
            barSize={28}
            radius={[3, 3, 0, 0]}
          >
            {vdsData.map((entry, idx) => (
              <Cell
                key={`rev-${idx}`}
                fill={entry.year === 2024 ? '#10b981' : '#10b981'}
                fillOpacity={entry.year === 2024 ? 0.9 : 0.55}
              />
            ))}
          </Bar>
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="vdsPrice"
            name="VDS 가격"
            stroke="#f59e0b"
            strokeWidth={2.5}
            fill="url(#vdsPriceAreaGrad)"
            dot={{ fill: '#f59e0b', r: 4, strokeWidth: 0 }}
            activeDot={{ fill: '#fbbf24', r: 6, strokeWidth: 2, stroke: '#f59e0b' }}
          />
        </ComposedChart>
      }
      takeaway={{
        situation: `2024년 VDS 가격은 $${(latestVds.vdsPrice / 1000).toFixed(1)}K/일로 전년 대비 +${vdsPriceChangePct}% 상승하며 역대 최고치를 경신했습니다. PNA 수익도 $${latestVds.pnaRevenue}M으로 2015년 대비 +${totalRevenueGrowth}% 성장했습니다. 선망 선단은 ${fleetStats.purseSeineVessels}척(${fleetStats.purseSeineChange}%), 연승은 ${fleetStats.longlineVessels}척(${fleetStats.longlineChange}%)으로 소폭 감소했으나, 선망 조업 횟수는 ${fleetStats.psSets.toLocaleString()}회(+${fleetStats.psSetsChange}%)로 급증해 조업 효율이 크게 향상되었습니다. 태국 수입 가다랑어 가격은 $${fleetStats.thaiSkjPrice}/MT(${fleetStats.thaiSkjChange}%), 야이즈항 가격은 $${fleetStats.yaizuSkjPrice}/MT(${fleetStats.yaizuSkjChange}%)로 하락세입니다.`,
        actionPlan: `VDS 가격 상승 추세 지속에 대비하여 PNA 조업일 조기 확보 전략을 권고합니다. MPA(해양보호구역) 확대(특히 키리바시 피닉스제도, 팔라우)와 화산 활동(2022년 훙가통가 유형) 리스크가 가용 조업 해역을 축소할 수 있어, 대체 어장(공해, IATTC 해역) 라이선스를 병행 확보해야 합니다. 선망 경제지수(${fleetStats.psEconIndex})가 20년 평균을 상회하므로 선망 기반 소싱은 여전히 수익성이 있으나, 연승(경제지수 ${fleetStats.llEconIndex})은 비용 압박이 커 선별적 운용이 필요합니다.`,
        source: 'FFA EDIS / PNA Annual Report (2015–2024)',
      }}
    />
  );
}
