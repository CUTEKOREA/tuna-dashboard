'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ComposedChart, BarChart, Bar, CartesianGrid, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { TrendingUp, Globe, AlertTriangle, PieChart } from 'lucide-react';
import TakeawayBox from './TakeawayBox';

import { getSurimiData } from '@/lib/data/surimi';
import { ChartPatternDefs } from './ChartPatterns';

const hegemonyData = getSurimiData('hegemony');
const lithuaniaData = getSurimiData('lithuania');
const koreaDeficitData = getSurimiData('koreaDeficit');
const multiplierData = getSurimiData('multiplier');

const getKorCountry = (engName: string) => {
  const map: Record<string, string> = {
    'Russian Federation': '러시아',
    'Denmark': '덴마크',
    'China': '중국',
    'Thailand': '태국',
    'Kazakhstan': '카자흐스탄',
    'Poland': '폴란드',
    'Sweden': '스웨덴',
    'Taiwan Province of China': '대만',
    'China, Hong Kong SAR': '홍콩',
    'Colombia': '콜롬비아',
    'USA': '미국',
    'United States of America': '미국',
    'Norway': '노르웨이',
    'Chile': '칠레',
    'Japan': '일본',
    'France': '프랑스',
    'Republic of Korea': '한국',
    'Germany': '독일',
    'United Kingdom': '영국',
    'United Kingdom of Great Britain and Northern Ireland': '영국',
    'Netherlands (Kingdom of the)': '네덜란드',
    'Netherlands': '네덜란드',
    'Spain': '스페인',
    'Italy': '이탈리아',
    'Vietnam': '베트남',
    'Lithuania': '리투아니아',
    'Belarus': '벨라루스',
    'Belgium': '벨기에',
    'Canada': '캐나다',
    '기타 국가(Others)': '기타 국가',
  };
  return map[engName] || engName;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1a2442', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', zIndex: 1000}}>
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
  border: '1px solid rgba(140, 170, 255, 0.10)', 
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

/* 1. China Hegemony */
export const WidgetChinaHegemony = () => (
  <div style={widgetStyle}>
    <div style={headerStyle}>
      <h3 style={titleStyle}><TrendingUp size={18} color="var(--color-danger)" /> 중국의 수리미 생산 블랙홀 현상</h3>
      
    </div>
    <div style={chartStyle}>
      <SafeResponsiveContainer width="100%" height="100%">
        <AreaChart data={hegemonyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} minTickGap={5} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v)=>`${v/1000}M`}/>
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="china" stackId="1" name="중국(China)" stroke="var(--color-danger)" fill="rgba(239, 68, 68, 0.6)" strokeWidth={2} />
          <Area type="monotone" dataKey="usa" stackId="1" name="미국(USA)" stroke="var(--color-info)" fill="rgba(59, 130, 246, 0.6)" strokeWidth={2} />
          <Area type="monotone" dataKey="other" stackId="1" name="기타 국가" stroke="var(--color-success)" fill="rgba(16, 185, 129, 0.6)" strokeWidth={2} />
        </AreaChart>
      </SafeResponsiveContainer>
    </div>
    <TakeawayBox 
      situation={<>2000년대 10만 톤 수준이던 중국의 수리미 생산량이 현재 158만 톤(전세계 75%)을 초과하며 폭발했습니다. 전 세계 명태/수리미 원물 블랙홀이 형성되었습니다.</>}
      actionPlan="글로벌 수리미 원물(블록) 가격은 중국의 국내 내수(훠궈, 어묵 소비) 경기에 완전히 연동됩니다. 항시 중국 소비물가지수를 모니터링해야 합니다."
    />
  </div>
);

/* 2. Lithuania Paradox */
export const WidgetLithuaniaParadox = () => {
  const chartData = lithuaniaData.map(d => ({ ...d, country: getKorCountry(d.country) }));
  return (
    <div style={widgetStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}><Globe size={18} color="var(--color-warning)" /> 리투아니아 패러독스: 가공 마진의 승리</h3>
        
      </div>
      <div style={chartStyle}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
            <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val/1000}M`} />
            <YAxis type="category" dataKey="country" stroke="#f8fafc" tick={{ fontSize: 11, fontWeight: 600 }} width={60} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="value_k" name="수리미 누적 수출액($1000)" fill="var(--color-warning)" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <TakeawayBox 
        situation={<>러시아산 저가 블록을 수입하여 맛살(Vici 브랜드)로 가공, 전 유럽에 유통하는 리투아니아가 글로벌 수리미 전체 수출액 1위를 달성했습니다.</>}
        actionPlan="단순 어획/블록 무역에서 벗어나, 베트남 또는 동유럽에 B2C 2차 가공(맛살, 어묵) 생산 기지를 투자/M&A해야 마진율을 극대화할 수 있습니다."
      />
    </div>
  );
};

/* 3. Korea Deficit */
export const WidgetKoreaDeficit = () => (
  <div style={widgetStyle}>
    <div style={headerStyle}>
      <h3 style={titleStyle}><AlertTriangle size={18} color="#f43f5e" /> 대한민국 딜레마: 글로벌 #1 수입국의 한계</h3>
      
    </div>
    <div style={chartStyle}>
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={koreaDeficitData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} minTickGap={2}/>
          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v)=>`$${v}M`}/>
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="import_m" name="한국 수리미 수입 지출액($M)" fill="rgba(244, 63, 94, 0.7)" radius={[4, 4, 0, 0]} barSize={30}/>
          <Line type="monotone" dataKey="export_m" name="한국 수리미 가공 수출액($M)" stroke="#14b8a6" strokeWidth={3} dot={{r:4}}/>
        </ComposedChart>
      </SafeResponsiveContainer>
    </div>
    <TakeawayBox 
      situation={<>한국은 2023년 한 해에만 약 2억 5천만 달러어치 수리미를 사들인 '세계 최강의 수리미 수입국(블랙홀 2)'입니다. 반면 수출 파워는 수입의 20%에 그칩니다.</>}
      actionPlan="국내 B2C 어묵류 소매 단가의 구조적 마진이 원물 매입 비용에 먹히고 있다는 뜻입니다. 국내 최저가 방어를 위한 선제적 '원양 선단 물량 스왑' 전략을 가동해야 합니다."
    />
  </div>
);

/* 4. Multiplier */
export const WidgetSurimiMultiplier = () => {
  const COLORS = ['#64748b', '#8b5cf6'];
  return (
    <div style={widgetStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}><PieChart size={18} color="#8b5cf6" /> 가치 창출 배수: 원물 블록 vs 2차 가공품</h3>
        
      </div>
      <div style={{...chartStyle, display: 'flex', flexDirection: 'row'}}>
        <SafeResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie data={multiplierData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="name" label={({name, value}) => `${name} ($${value.toFixed(0)}M)`} labelLine={false} style={{fontSize: '12px', fontWeight: 600}}>
              {multiplierData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
          </RechartsPieChart>
        </SafeResponsiveContainer>
      </div>
      <TakeawayBox 
        situation={<>2023년 기준 동결 수리미 원물의 글로벌 수출 가치는 1억 6천만 달러인 반면, 2차 가공된 수리미는 4억 달러를 돌파했습니다 (약 2.5배).</>}
        actionPlan="단순 원물 B2B 무역상(Trader)으로 남지 마십시오. 자체 K-Surimi 브랜드를 런칭하여 글로벌 $401M의 하이엔드 부가 가치 시장을 공략해야 합니다."
      />
    </div>
  );
};
