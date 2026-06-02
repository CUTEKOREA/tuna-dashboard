// @ts-nocheck
'use client';

import React from 'react';
import {
  ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Legend,
  ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip
} from 'recharts';
import { Activity, ShieldAlert, Target } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

const customTooltipStyle = {
  background: 'rgba(0,15,30,0.95)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#f8fafc',
  fontSize: '12px'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={customTooltipStyle}>
      <p style={{ margin: '0 0 4px 0', fontWeight: 700 }}>{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '11px', color: '#cbd5e1' }}>
          <span style={{ color: e.color }}>■ {e.name}</span>
          <strong>{typeof e.value === 'number' ? e.value.toLocaleString() : e.value}</strong>
        </div>
      ))}
    </div>
  );
};

// 1. Feed Cost Spread Data
const feedCostData = [
  { month: '23-Q1', corn: 280, soy: 540, hanwooCost: 115, usBeefPrice: 9.8 },
  { month: '23-Q2', corn: 260, soy: 510, hanwooCost: 108, usBeefPrice: 9.5 },
  { month: '23-Q3', corn: 230, soy: 480, hanwooCost: 102, usBeefPrice: 9.2 },
  { month: '23-Q4', corn: 210, soy: 460, hanwooCost: 98, usBeefPrice: 8.9 },
  { month: '24-Q1', corn: 200, soy: 430, hanwooCost: 92, usBeefPrice: 8.7 },
  { month: '24-Q2', corn: 190, soy: 420, hanwooCost: 89, usBeefPrice: 8.5 },
  { month: '24-Q3(F)', corn: 185, soy: 410, hanwooCost: 87, usBeefPrice: 8.4 },
];

export function InsightFeedCostSpread({ accent = '#e11d48' }: any) {
  return (
    <WidgetCard
      title="한우 사료 원가 vs 수입육 수입 단가 스프레드"
      icon={Activity}
      iconColor={accent}
      pillar="S2"
      cardDesc="미국산 옥수수(CBOT) 및 브라질 대두박(WB) 단가에 따른 한우 사육 원가 압박 분석"
      telemetry={{ status: 'SYNCED', syncDate: 'CBOT & WB Pink Sheet -1d' }}
      chartHeight={300}
      takeaway={{
        situation: "미국 옥수수 선물 200달러 붕괴 및 브라질 대두박 하락세 지속. 곡물가 하락으로 한우 농가 사육 원가 지수(115→87) 대폭 완화.",
        actionPlan: "한우 조기 출하 압력이 감소하여 향후 6개월 한우 도매가 상승(공급 제한) 우려. 외식 B2B는 단가 연동 하락 중인 미국/호주산 수입육 장기계약 비중 확대 필수.",
        source: "CBOT Corn Futures, World Bank Pink Sheet (Soybean Meal), KCS"
      }}
      chart={
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={feedCostData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} domain={[150, 600]} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} domain={[6, 12]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
              <Area yAxisId="left" type="monotone" dataKey="corn" name="옥수수(US$/t)" fill="url(#pattern-amber)" stroke="#f59e0b" fillOpacity={0.3} />
              <Area yAxisId="left" type="monotone" dataKey="soy" name="대두박(US$/t)" fill="url(#pattern-rose)" stroke="#e11d48" fillOpacity={0.3} />
              <Line yAxisId="right" type="monotone" dataKey="hanwooCost" name="한우원가지수" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="usBeefPrice" name="미국산단가($/kg)" stroke="#38bdf8" strokeWidth={2} strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      }
    />
  );
}

// 2. Cut Tracker Data
const cutTrackerData = [
  { month: '23-Q1', bonelessVol: 78, boneVol: 35, bonelessPrice: 8.5, bonePrice: 11.2 },
  { month: '23-Q2', bonelessVol: 82, boneVol: 32, bonelessPrice: 8.2, bonePrice: 10.8 },
  { month: '23-Q3', bonelessVol: 85, boneVol: 45, bonelessPrice: 8.0, bonePrice: 12.5 }, // 추석
  { month: '23-Q4', bonelessVol: 79, boneVol: 38, bonelessPrice: 8.1, bonePrice: 11.5 },
  { month: '24-Q1', bonelessVol: 88, boneVol: 42, bonelessPrice: 7.9, bonePrice: 12.0 }, // 설날
  { month: '24-Q2', bonelessVol: 91, boneVol: 30, bonelessPrice: 7.6, bonePrice: 11.0 },
  { month: '24-Q3(F)', bonelessVol: 93, boneVol: 48, bonelessPrice: 7.5, bonePrice: 12.8 }, // 추석 예상
];

export function InsightCutTracker({ accent = '#fb923c' }: any) {
  return (
    <WidgetCard
      title="B2B 순살(Boneless) vs B2C 뼈(With-bone) 타겟 최적화"
      icon={Target}
      iconColor={accent}
      pillar="S4"
      cardDesc="미국산 소고기 수입 부위별(순살 870 vs 뼈 867) 물량 및 단가 분리 트래킹"
      telemetry={{ status: 'SYNCED', syncDate: 'FAOSTAT QCL & KCS -1M' }}
      chartHeight={300}
      takeaway={{
        situation: "한국은 순살(Boneless) 수입 비중이 압도적(32만톤)이나, 미국산 뼈고기(With-bone) 수출의 53%가 한국(15만톤)에 집중됨. 명절 시즌(Q1, Q3) 뼈고기 단가 급등 발생.",
        actionPlan: "LA갈비 등 뼈고기는 명절 3개월 전 선취 매입 필수. B2B 프랜차이즈용 순살 부위는 단가 하락 안정세이므로 단기 스팟 매입 비중 확대로 재고 비용 절감.",
        source: "FAOSTAT Detailed Trade Matrix, KCS Import Data"
      }}
      chart={
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={cutTrackerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} domain={[6, 14]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
              <Bar yAxisId="left" dataKey="bonelessVol" name="순살 수입량(천톤)" fill="#fb923c" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar yAxisId="left" dataKey="boneVol" name="뼈 수입량(천톤)" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={20} />
              <Line yAxisId="right" type="monotone" dataKey="bonelessPrice" name="순살 단가($/kg)" stroke="#fcd34d" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="bonePrice" name="뼈 단가($/kg)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      }
    />
  );
}

// 3. Disease Risk Radar
const diseaseRadarData = [
  { country: '미국 (BSE청정)', riskLevel: 10, altCapacity: 90, exportReliance: 100, logiSpeed: 90 },
  { country: '호주 (초청정국)', riskLevel: 5, altCapacity: 85, exportReliance: 80, logiSpeed: 100 },
  { country: '브라질 (부분통제)', riskLevel: 65, altCapacity: 100, exportReliance: 40, logiSpeed: 60 },
  { country: '아르헨 (대체지)', riskLevel: 45, altCapacity: 60, exportReliance: 30, logiSpeed: 50 },
  { country: '우루과이 (가공대체)', riskLevel: 25, altCapacity: 40, exportReliance: 20, logiSpeed: 50 },
  { country: '인도 (FMD위험)', riskLevel: 95, altCapacity: 70, exportReliance: 10, logiSpeed: 40 },
];

export function InsightDiseaseRadar({ accent = '#ef4444' }: any) {
  return (
    <WidgetCard
      title="글로벌 소고기 질병 & 대체지 Risk Radar"
      icon={ShieldAlert}
      iconColor={accent}
      pillar="S4"
      cardDesc="WOAH 질병(BSE/FMD) 데이터 기반 수입 중단 꼬리 위험(Tail Risk) 및 대체 시나리오"
      telemetry={{ status: 'LIVE', syncDate: 'WOAH WAHIS -12h' }}
      chartHeight={300}
      takeaway={{
        situation: "미국/호주는 질병 리스크 최저(5~10%)이나 발생 시 한국 수입망 마비. 브라질은 BSE 발생 이력으로 수출 의존도 낮음.",
        actionPlan: "북미/오세아니아 셧다운(BSE 발동) 시 즉각 남미(아르헨/우루과이) 가공육 및 부분육 라인으로 전환하는 비상 매뉴얼 상시 가동. (Risk Trigger: WOAH Level 3 알럿)",
        source: "WOAH (World Organisation for Animal Health) WAHIS DB"
      }}
      chart={
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={diseaseRadarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="country" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} />
              <Radar name="질병 리스크 지수" dataKey="riskLevel" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
              <Radar name="대체 공급 여력" dataKey="altCapacity" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      }
    />
  );
}
