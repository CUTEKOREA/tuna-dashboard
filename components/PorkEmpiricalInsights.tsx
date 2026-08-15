'use client';

import React from 'react';
import {
  ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Legend, Tooltip, PieChart, Pie, Cell
} from 'recharts';
import { Activity, ShieldAlert, GitFork } from 'lucide-react';
import WidgetCard from './WidgetCard';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { ChartPatternDefs } from './ChartPatterns';

const customTooltipStyle = {
  background: 'rgba(10, 16, 40, 0.95)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '8px',
  padding: '8px 12px',
  color: 'var(--w-slate-50)',
  fontSize: '12px'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={customTooltipStyle}>
      <p style={{ margin: '0 0 4px 0', fontWeight: 700 }}>{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '11px', color: 'var(--w-slate-300)' }}>
          <span style={{ color: e.color }}>■ {e.name}</span>
          <strong>{typeof e.value === 'number' ? e.value.toLocaleString() : e.value}</strong>
        </div>
      ))}
    </div>
  );
};

// 1. Supply Chain Data (Pie) — 관세청 HS6별 점유율 via agri_data (2026.03-04, 2개월 누적)
//   신선 0203 / 가공 1601+1602. 점유율=물량 기준. 컨버터 재현가능.
const freshMeatData = [
  { name: '미국', value: 29.6 },
  { name: '스페인', value: 27.4 },
  { name: '캐나다', value: 10.5 },
  { name: '네덜란드', value: 6.6 },
  { name: '독일', value: 6.1 },
  { name: '기타', value: 19.8 },
];
const processedMeatData = [
  { name: '미국', value: 86 },
  { name: '덴마크', value: 10.3 },
  { name: '기타', value: 3.7 },
];
const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#64748b'];

export function InsightPorkSupplyChain({ accent = '#8b5cf6' }: any) {
  return (
    <WidgetCard
      title="신선육 vs 가공육 수입망 리스크 및 양극화"
      icon={GitFork}
      iconColor={accent}
      pillar="S3"
      cardDesc="신선육(HS 0203) vs 가공육(HS 1601·1602) 한국 수입 파트너 점유율 비교 | 관세청 2026.03-04(2개월 누적)"
      telemetry={{ status: 'SYNCED', syncDate: '관세청 2026.03-04(2개월)' }}
      chartHeight={300}
      takeaway={{
        situation: "신선육(HS 0203)은 미국 29.6%·스페인 27.4%·캐나다 10.5%로 분산된 반면, 가공육(소시지·HS 1601/1602)은 미국 86%·덴마크 10.3%로 미국 단일 의존이 극심합니다 (관세청 2026.03-04, 2개월 누적, 물량 기준).",
        actionPlan: "미국 내 돼지 질병 발생 또는 서부 항만 물류 파업 발동 시, 삼겹살/목살 등 원육 수급보다 B2B 외식 프랜차이즈의 소시지/베이컨 대란 리스크가 뚜렷한으로 높습니다. B2B 식자재 벤더는 가공품 유럽(덴마크) 대체선 확대가 시급합니다.",
        source: "관세청 수입통계 HS6별 분석 (2026.03-04, 2개월 누적)"
      }}
      chart={
        <div style={{ height: 300, width: '100%', display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <p style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', fontSize: '11px', color: 'var(--w-slate-400)', fontWeight: 600 }}>신선육 HS 0203 (118.4천톤·2개월)</p>
            <SafeResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie data={freshMeatData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                  {freshMeatData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <p style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', fontSize: '11px', color: 'var(--w-slate-400)', fontWeight: 600 }}>가공육 HS 1601·1602 (1.87천톤·2개월)</p>
            <SafeResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie data={processedMeatData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                  {processedMeatData.map((entry, index) => <Cell key={`pcell-${index}`} fill={['var(--w-amber-500)', 'var(--w-emerald-500)', 'var(--w-slate-500)'][index % 3]} />)}
                </Pie>
              </PieChart>
            </SafeResponsiveContainer>
          </div>
        </div>
      }
    />
  );
}

// 2. ASF & China Factor
const chinaFactorData = [
  { year: '2017', chinaInv: 440, globalPrice: 100, asfOutbreaks: 0 },
  { year: '2018', chinaInv: 428, globalPrice: 95, asfOutbreaks: 20 },
  { year: '2019', chinaInv: 310, globalPrice: 145, asfOutbreaks: 150 }, // ASF shock
  { year: '2020', chinaInv: 406, globalPrice: 130, asfOutbreaks: 60 },
  { year: '2021', chinaInv: 449, globalPrice: 110, asfOutbreaks: 15 },
  { year: '2022', chinaInv: 452, globalPrice: 115, asfOutbreaks: 8 },
  { year: '2023', chinaInv: 430, globalPrice: 112, asfOutbreaks: 5 },
  { year: '2024(추정)', chinaInv: 415, globalPrice: 118, asfOutbreaks: 2 },
];

export function InsightAsfChinaFactor({ accent = '#f43f5e' }: any) {
  return (
    <WidgetCard
      title="차이나 팩터(China Factor) 및 ASF 리스크 선행지표"
      icon={ShieldAlert}
      iconColor={accent}
      pillar="S1"
      cardDesc="글로벌 돈육 시장의 절대 강자(중국 51%) 사육 두수 증감과 아시아 지역 ASF 발병 추이 결합"
      telemetry={{ status: 'STATIC', syncDate: 'USDA PSD/WOAH 업계추정 2024' }}
      chartHeight={300}
      takeaway={{
        situation: "중국 내 사육 두수(Swine Inventory)가 2019년 ASF 사태로 30% 급감했을 당시, 글로벌 돼지고기 단가는 50% 이상 수직 상승하는 커플링 구조를 보였습니다.",
        actionPlan: "중국 사육 두수는 2024년 415백만 마리로 하락 반전이 추정됐습니다(USDA PSD 업계추정, 2024 기준 동결). 이런 하락 반전 국면에서는 중국 발 재고 비축 사이클 진입 전 향후 6개월 물량의 글로벌 선도 매입(Forward Buying)을 우선 확정해야 단가 방어가 가능합니다.",
        source: "USDA PSD (Swine Inventory), WOAH WAHIS"
      }}
      chart={
        <ComposedChart data={chinaFactorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
          <XAxis dataKey="year" stroke="var(--w-slate-500)" tick={{ fontSize: 9 }} />
          <YAxis yAxisId="left" stroke="var(--w-slate-500)" tick={{ fontSize: 9 }} domain={[200, 500]} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--w-slate-500)" tick={{ fontSize: 9 }} domain={[0, 200]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
          <Bar yAxisId="right" dataKey="asfOutbreaks" name="아시아 ASF 발병(건)" fill="url(#a11y-diag)" stroke="var(--w-red-500)" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.4} />
          <Area yAxisId="left" type="monotone" dataKey="chinaInv" name="중국 사육 두수(백만)" fill="url(#a11y-dots)" stroke="var(--w-amber-500)" fillOpacity={0.2} />
          <Line yAxisId="right" type="step" dataKey="globalPrice" name="글로벌 돈가 지수" stroke="var(--w-sky-400)" strokeWidth={2.5} dot={{ r: 3 }} />
        </ComposedChart>
      }
    />
  );
}

// 3. Hog-Corn Ratio
const hogCornData = [
  { qtr: '23-Q1', cornPrice: 280, porkWholesale: 165, ratio: 12.5 },
  { qtr: '23-Q2', cornPrice: 260, porkWholesale: 160, ratio: 13.0 },
  { qtr: '23-Q3', cornPrice: 230, porkWholesale: 170, ratio: 15.5 },
  { qtr: '23-Q4', cornPrice: 210, porkWholesale: 168, ratio: 16.8 },
  { qtr: '24-Q1', cornPrice: 200, porkWholesale: 162, ratio: 17.0 },
  { qtr: '24-Q2', cornPrice: 190, porkWholesale: 165, ratio: 18.2 }, // Ratio 호전
  { qtr: '24-Q3', cornPrice: 185, porkWholesale: 175, ratio: 19.8 },
];

export function InsightHogCornRatio({ accent = '#ec4899' }: any) {
  return (
    <WidgetCard
      title="돈가-옥수수 마진 지수 (Hog-Corn Ratio)"
      icon={Activity}
      iconColor={accent}
      pillar="S2"
      cardDesc="100% 곡물 사료에 의존하는 양돈 산업의 수익성 지표 (비율 상승 시 농가 이익) | 자체구성 2023-Q1~2024-Q3, CBOT 방향성 참고"
      telemetry={{ status: 'STATIC', syncDate: '자체구성 2024-Q3 기준' }}
      chartHeight={300}
      takeaway={{
        situation: "2024-Q3 기준 옥수수 선물 가격 하락(CBOT 185달러/톤)으로 돈가-옥수수 비율(Hog-Corn Ratio)이 12.5(2023-Q1)에서 19.8로 호전됐습니다. 당시 농가의 양돈 사육 유인을 강하게 자극하는 수준이었습니다.",
        actionPlan: "이 마진 개선 구간에서 글로벌 농가는 모돈(어미돼지) 증식 사이클로 전환하는 패턴을 보였습니다. 증식 후 6~9개월 뒤 공급 확대(시장 가격 하락)가 따라오는 구조이므로, 유사 국면 재현 시 장기 선도 계약보다 스팟(Spot) 비중 확대가 유효합니다.",
        source: "CBOT Corn Futures, CME Lean Hog — 자체구성 (2024-Q3 동결 데이터)"
      }}
      chart={
        <ComposedChart data={hogCornData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
          <XAxis dataKey="qtr" stroke="var(--w-slate-500)" tick={{ fontSize: 9 }} />
          <YAxis yAxisId="left" stroke="var(--w-slate-500)" tick={{ fontSize: 9 }} domain={[150, 300]} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--w-slate-500)" tick={{ fontSize: 9 }} domain={[10, 25]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
          <Area yAxisId="left" type="monotone" dataKey="cornPrice" name="옥수수 단가($/t)" fill="var(--w-amber-500)" stroke="var(--w-amber-500)" fillOpacity={0.1} />
          <Line yAxisId="left" type="monotone" dataKey="porkWholesale" name="돈육 도매($/100lb)" stroke="var(--w-sky-400)" strokeWidth={2} strokeDasharray="5 5" />
          <Bar yAxisId="right" dataKey="ratio" name="Hog-Corn 비율" fill={accent} radius={[4, 4, 0, 0]} barSize={25}>
            {hogCornData.map((e, index) => <Cell key={`cell-${index}`} fillOpacity={e.ratio > 15 ? 0.8 : 0.4} />)}
          </Bar>
        </ComposedChart>
      }
    />
  );
}
