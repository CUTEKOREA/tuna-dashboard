'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ComposedChart, BarChart, Bar, CartesianGrid, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { TrendingUp, ArrowDownRight, Globe, AlertTriangle, ShieldAlert, BarChart3, PieChart, LineChart } from 'lucide-react';
import TakeawayBox from './TakeawayBox';

import declineData from '../data/tuna_traditional_decline.json';
import empireData from '../data/tuna_thai_empire.json';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


const getKorCountry = (engName: string) => {
  const map: Record<string, string> = {
    'United States of America': '미국',
    'USA': '미국',
    'Japan': '일본',
    'Republic of Korea': '한국',
    'Spain': '스페인',
    'Thailand': '태국',
    'other': '기타 식민지',
  };
  return map[engName] || engName;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
return (
      <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', zIndex: 1000}}>
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

const widgetStyle = {
  background: 'rgba(0, 0, 0, 0.2)', 
  border: '1px solid rgba(255, 255, 255, 0.05)', 
  borderRadius: '8px', 
  padding: '1.5rem', 
  display: 'flex', 
  flexDirection: 'column' as const, 
  gap: '1rem',
  height: '100%',
};

const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const titleStyle = { margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' };
const chartStyle = { height: '260px', flexShrink: 0, width: '100%', position: 'relative' as const };

/* 1. Traditional Giants Decline */
export const WidgetTunaGiantsFall = () => (
  <div style={widgetStyle}>
    <div style={{ ...headerStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
      <h3 style={titleStyle}><ArrowDownRight size={18} color="#f43f5e" /> [산업 구조변화] 전통 참치 강국의 몰락 (1980-2023)
      <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'rgba(16,185,129,0.1)', border:'1px solid #10b981', color:'var(--color-success)', fontSize:'0.65rem', fontWeight:600, padding:'1px 5px', borderRadius:'4px', letterSpacing:'0.2px', marginLeft:'6px' }}>🟢 LIVE API (FAO)</span>
      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>(단위: 생산량 kMT)</span>
      </h3>
    </div>
    <div style={chartStyle}>
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={declineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} minTickGap={5}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v)=>`${v}k`}/>
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="japan" name={getKorCountry("Japan")} stroke="var(--color-danger)" strokeWidth={3} dot={false}/>
          <Line type="monotone" dataKey="usa" name={getKorCountry("USA")} stroke="var(--color-info)" strokeWidth={3} dot={false}/>
          <Line type="monotone" dataKey="korea" name={getKorCountry("Republic of Korea")} stroke="#14b8a6" strokeWidth={3} dot={false}/>
        </ComposedChart>
      </SafeResponsiveContainer>
    </div>
    <TakeawayBox 
      source="FAO FishStatJ & National Fisheries Statistics - Processed Tuna Volume"
      situation={<>1990년대 이후 미국, 일본, 한국(전통 트로이카)의 가공 공장들이 사실상 전멸하고 있습니다. '참치를 가장 많이 잡던 나라'가 '참치로 부가가치를 버는 나라'가 아님을 증명합니다.</>}
      actionPlan="**[Actionable Insight]** 국내의 비싼 인건비로 캔/가공을 고집하는 것은 자살행위와 같습니다. 어획 부문에 집중된 현 자본을 해외 현지 2차 가공 플랜트 인수에 긴급 재배치해야 해야 합니다. (Conviction Buy)"
    />
  </div>
);

/* 2. Thai Union Empire */
export const WidgetThaiEmpire = () => (
  <div style={widgetStyle}>
    <div style={{ ...headerStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
      <h3 style={titleStyle}><Globe size={18} color="var(--color-warning)" /> [가공 패권] 태국과 스페인의 통조림 제국
      <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'rgba(16,185,129,0.1)', border:'1px solid #10b981', color:'var(--color-success)', fontSize:'0.65rem', fontWeight:600, padding:'1px 5px', borderRadius:'4px', letterSpacing:'0.2px', marginLeft:'6px' }}>🟢 LIVE API (FAO)</span>
      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>(단위: 생산량 kMT)</span>
      </h3>
    </div>
    <div style={chartStyle}>
      <SafeResponsiveContainer width="100%" height="100%">
        <AreaChart data={empireData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} minTickGap={5}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v)=>`${v}k`}/>
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="spain" stackId="1" name={getKorCountry("Spain")} stroke="var(--color-warning)" fill="rgba(245, 158, 11, 0.6)" strokeWidth={2} />
          <Area type="monotone" dataKey="thailand" stackId="1" name={getKorCountry("Thailand")} stroke="var(--color-success)" fill="rgba(16, 185, 129, 0.6)" strokeWidth={2} />
          <Area type="monotone" dataKey="other" stackId="1" name="원물 하청 국가군" stroke="#64748b" fill="rgba(100, 116, 139, 0.3)" strokeWidth={1} />
        </AreaChart>
      </SafeResponsiveContainer>
    </div>
    <TakeawayBox 
      source="FAO FishStatJ Global Comodity Production & Trade"
      situation={<>참치잡이 배가 거의 없는 국토인 태국(Thai Union)과 유럽의 마진 브로커 스페인(Jealsa 등)이 1990년 대비 10배 폭발하며 전 세계 가공 마진을 집어삼켰습니다.</>}
      actionPlan="**[Actionable Insight]** 글로벌 참치 산업에서 통조림/가공(Downstream) 영역은 이미 '원물 블록 매입 후 자동화 제조'를 통한 '초대형 식음료 비즈니스'로 전환되었습니다."
    />
  </div>
);
