'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, BarChart, Bar, CartesianGrid } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Factory, AlertTriangle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

import fishmealData from '../data/mackerel_fishmeal.json';
import chinaStealthData from '../data/mackerel_china_stealth.json';

const getKorCountry = (engName: string) => {
  const map: Record<string, string> = {
    'Chile': '칠레',
    'Peru': '페루',
    'China': '중국',
    'other': '기타 식민지',
  };
  return map[engName] || engName;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', zIndex: 1000}}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: '4px' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: '4px 0', color: entry.color || entry.payload.fill, fontSize: '13px', fontWeight: 600 }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, {maximumFractionDigits: 1}) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MackerelProcessedWidgets() {
  const ChartObj1 = (
    <div style={{ height: '260px', width: '100%', position: 'relative' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <BarChart data={fishmealData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} minTickGap={5} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v)=>`${v}k`}/>
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="chile" stackId="1" name={getKorCountry("Chile")} fill="url(#a11y-stripe-h)" color={A11Y_PALETTE[6]} radius={[0, 0, 0, 0]} barSize={20} />
          <Bar dataKey="peru" stackId="1" name={getKorCountry("Peru")} fill="url(#a11y-diag)" color={A11Y_PALETTE[1]} radius={[0, 0, 0, 0]} />
          <Bar dataKey="other" stackId="1" name="기타 비주류국가" fill="url(#a11y-dots)" color={A11Y_PALETTE[7]} radius={[4, 4, 0, 0]} fillOpacity={0.6} />
        </BarChart>
      </SafeResponsiveContainer>
    </div>
  );

  const ChartObj2 = (
    <div style={{ height: '260px', width: '100%', position: 'relative' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <AreaChart data={chinaStealthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} minTickGap={2} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v)=>`${v}k`}/>
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="china" name="중국 고등어 가공량(천 톤)" stroke="var(--color-danger)" fill="url(#colorChina)" strokeWidth={2} />
          <defs>
            <linearGradient id="colorChina" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        </AreaChart>
      </SafeResponsiveContainer>
    </div>
  );

  return (
    <>
      <WidgetCard
        title="칠레-페루 어분(Fishmeal) 제국의 탄생"
        icon={Factory}
        iconColor="#eab308"
        pillar="P1"
        cardDesc=""
        telemetry={{ status: 'STATIC', syncDate: '2023' }}
        customBody={ChartObj1}
        takeaway={{
          situation: "칠레(50.7만 톤)와 페루(17.6만 톤)의 고등어류 조업 물량 중 약 10만 톤 이상이 식용이 아닌 '농수산 펠릿 사료(Fishmeal)'로 집중 가공되어 사라집니다.",
          actionPlan: "고등어류 단가는 이제 '서민 식탁'이 아닌, 10배 이상 거대한 '연어 양식장 매입원가' 및 '초고가 펫케어 시장'에 연동되어 최저 가격 바닥(Floor)이 붕괴되지 않는 구조입니다.",
          source: "FAO FishStatJ - Global Production & Non-Food Uses",
        }}
      />
      <WidgetCard
        title="중국의 스텔스 싹쓸이 (블랙홀)"
        icon={AlertTriangle}
        iconColor="var(--color-danger)"
        pillar="P1"
        cardDesc=""
        telemetry={{ status: 'STATIC', syncDate: '2023' }}
        customBody={ChartObj2}
        takeaway={{
          situation: "2000년 5,187톤에 불과했던 중국 내 고등어 가공량이 2023년 무려 322,729톤(약 62배 폭증)으로 치솟으며 글로벌 원물을 모조리 쓸어버리고 있습니다.",
          actionPlan: "수리미에 이어 고등어마저 훠궈/어묵 등 중국 내수 시장으로 쏠리며 한국의 수입 단가를 위협합니다. 글로벌 바잉 파워(Buying Power) 붕괴 전 대응이 시급합니다. (Immediate Action Required)",
          source: "FAO FishStatJ - Processed volume statistics",
        }}
      />
    </>
  );
}
