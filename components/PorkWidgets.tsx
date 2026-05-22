// @ts-nocheck
'use client';
import React from 'react';
import { BarChart, Bar, LineChart, Line, ComposedChart, Area, XAxis, YAxis, CartesianGrid, Legend, Cell, Tooltip as RT } from 'recharts';
import { Globe, TrendingUp, ShoppingCart, Target, Zap, Shield } from 'lucide-react';
import WidgetCard from './WidgetCard';
import * as D from './porkData';

const CT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
      <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
          <span style={{ color: e.color }}>■ {e.name}</span>
          <strong>{typeof e.value === 'number' ? e.value.toLocaleString() : e.value}</strong>
        </div>
      ))}
    </div>
  );
};
const COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#eab308', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'];

const W = ({ title, icon, sub, accent, telemetry, sit, strat, source, pillar, children }: any) => (
  <WidgetCard
    title={title}
    icon={icon}
    iconColor={accent || '#f43f5e'}
    pillar={pillar}
    cardDesc={sub || ''}
    telemetry={{ status: 'STATIC', syncDate: telemetry }}
    chartHeight={375}
    chart={children}
    takeaway={{ situation: sit, actionPlan: strat, source }}
  />
);

export function W1_ASFCycle({ accent }: any) {
  return <W title="글로벌 생산량 및 질병(ASF) 사이클" icon={Globe} accent={accent} pillar="S1" sub="중국 중심 글로벌 돈육 생산량(천 톤) 및 산지 가격 지수 | FAOSTAT QCL 2015-2024"
    telemetry="FAOSTAT QCL 2015-2024"
    sit="2019년 중국 ASF 사태로 글로벌 생산량 54,992→43,498천톤(-20.9%) 급감. 3~4년 주기 질병 충격이 반복됨."
    strat="WOAH ASF 모니터링 + CME Lean Hogs 선물을 수산물 가격 전략 선행 지표로 삼아 동적 가격 전략 실행." source="FAOSTAT QCL Item 1035">
    <ComposedChart data={D.asfCycleData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
      <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} /><YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
      <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} /><RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Bar yAxisId="left" dataKey="production" name="중국 생산량 (천톤)" fill="#3b82f6" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
      <Line yAxisId="right" type="monotone" dataKey="price" name="산지 가격 지수" stroke="#f43f5e" strokeWidth={2.5} dot={true} />
    </ComposedChart>
  </W>;
}

export function W2_FeedMargin({ accent }: any) {
  return <W title="곡물가(사료) 연동 마진 압박 지수" icon={TrendingUp} accent={accent} pillar="S2" sub="사료곡물 가격 지수 대비 가공 마진율(%) 추이 | CBOT 2022-2023"
    telemetry="CBOT 2022-2023"
    sit="사료비가 원가의 60% 이상. 2022년 곡물가 피크 당시 가공 마진이 적자(-2%)로 전환."
    strat="곡물가 상승 시 고마진 특수 부위(삼겹살/항정살) 직판 비율 확대, 저마진 부위는 B2B 급식 전환." source="CBOT Corn/Soy">
    <ComposedChart data={D.feedCostData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
      <XAxis dataKey="quarter" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} /><YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} />
      <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} /><RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Line yAxisId="left" type="monotone" dataKey="feedIndex" name="사료 가격 지수" stroke="#eab308" strokeWidth={2.5} />
      <Bar yAxisId="right" dataKey="porkMargin" name="가공 마진율 (%)" fill="#10b981" radius={[4, 4, 0, 0]}>{D.feedCostData.map((e, i) => <Cell key={i} fill={e.porkMargin < 0 ? '#ef4444' : '#10b981'} />)}</Bar>
    </ComposedChart>
  </W>;
}

export function W3_TradeSpread({ accent }: any) {
  return <W title="주요 대륙간 무역 단가 스프레드" icon={Globe} accent={accent} pillar="S3" sub="EU·북미·아시아 간 수출입 돈육 평균 단가(달러/톤) | OEC 2023"
    telemetry="OEC 2023"
    sit="EU 환경 규제에 따른 생산량 감소로 EU산 단가가 북미산을 추월. 아시아 시장의 높은 소비력."
    strat="단가가 안정적인 북미 및 남미(브라질)산 비중을 높여 다변화 전략 시급." source="OEC Trade Data">
    <LineChart data={D.tradeSpreadData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
      <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} /><YAxis stroke="#64748b" tick={{ fontSize: 9 }} /><RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Line type="monotone" dataKey="asiaPrice" name="아시아 도착가" stroke="#f43f5e" strokeWidth={2.5} /><Line type="monotone" dataKey="euPrice" name="EU 수출가" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" />
      <Line type="monotone" dataKey="usPrice" name="북미 수출가" stroke="#eab308" strokeWidth={2} strokeDasharray="5 5" />
    </LineChart>
  </W>;
}

export function W4_ESG({ accent }: any) {
  return <W title="육류별 탄소 배출 지수 비교" icon={Shield} accent={accent} pillar="S5" sub="주요 단백질 원천별 1kg 생산 당 CO2e 배출량 | FAOSTAT 2024"
    telemetry="FAOSTAT 2024"
    sit="돈육(12.3kg CO2e)은 수산물(2~5kg) 대비 으로 높음. Scope 3 규제 시 과세 대상."
    strat="ESG 보고서에서 수산물의 낮은 탄소 배출을 강조하여 '그린 프리미엄' 획득." source="FAOSTAT Emissions">
    <BarChart data={D.esgData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal vertical={false} />
      <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} /><YAxis type="category" dataKey="category" stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} width={80} /><RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Bar dataKey="carbon" name="CO2e (kg/kg)" radius={[0, 4, 4, 0]}>{D.esgData.map((e, i) => <Cell key={i} fill={e.carbon > 15 ? '#ef4444' : e.carbon > 10 ? '#f59e0b' : '#10b981'} />)}</Bar>
    </BarChart>
  </W>;
}

export function W5_Top10({ accent }: any) {
  return <W title="글로벌 Top 10 생산국 점유율" icon={Target} accent={accent} pillar="S1" sub="국가별 돈육 생산량(천 톤) 및 글로벌 점유율 | FAOSTAT QCL 2022"
    telemetry="FAOSTAT QCL 2022"
    sit="중국 단독 44%(56,346천 톤) 독과점. 상위 3국 합산 57.6%로 HHI 2,100+ 고집중도."
    strat="중국 의존도가 극단적인 시장에서 ASF 재발 시 수산물 수요 폭증 연쇄반응 대비 재고 선확보." source="FAOSTAT QCL Item 1035">
    <BarChart data={D.top10ProducersData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal vertical={false} />
      <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} /><YAxis type="category" dataKey="country" stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} width={55} /><RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Bar dataKey="production" name="생산량 (천톤)" radius={[0, 4, 4, 0]}>{D.top10ProducersData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Bar>
    </BarChart>
  </W>;
}

export function W6_Trend({ accent }: any) {
  return <W title="주요 8개국 생산량 10년 추이" icon={TrendingUp} accent={accent} pillar="S1" sub="주요 생산국 돈육 생산량(천 톤) 시계열 | FAOSTAT QCL 2015-2024"
    telemetry="FAOSTAT QCL 2015-2024"
    sit="독일 2018년 5,350→2024년 4,289천톤(-20%). 브라질 +56%, 베트남 +33% 폭발적 성장."
    strat="역성장 중인 EU국 소싱 축소, 브라질/베트남 저가 원물 직소싱망 구축." source="FAOSTAT QCL">
    <LineChart data={D.productionTrendData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
      <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} /><YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} /><RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Line type="monotone" dataKey="중국" stroke="#f43f5e" strokeWidth={3} dot={false} /><Line type="monotone" dataKey="미국" stroke="#3b82f6" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="브라질" stroke="#10b981" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="독일" stroke="#eab308" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="스페인" stroke="#ec4899" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="베트남" stroke="#06b6d4" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="한국" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={false} />
    </LineChart>
  </W>;
}

export function W7_KoreaSupply({ accent }: any) {
  return <W title="한국 돈육 수급 구조 분석" icon={ShoppingCart} accent={accent} pillar="S4" sub="한국 국내 생산·수입·1인당 소비 시계열 | FAOSTAT QCL+FBS 2015-2023"
    telemetry="FAOSTAT QCL+FBS 2015-2023"
    sit="한국 1인당 돈육 소비 10년간 30.9→41.4kg(+34%) 폭증. 생산 증가율(+20%)이 소비를 못따라감."
    strat="기존 수산물 콜드체인을 돈육까지 확장하는 '단백질 통합 솔루션' 전략으로 시장 주도권 확보." source="FAOSTAT FBS">
    <ComposedChart data={D.koreaSupplyData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
      <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} /><YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} />
      <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} domain={[30, 45]} /><RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Bar yAxisId="left" dataKey="production" name="국내 생산 (천톤)" fill="#3b82f6" radius={[4, 4, 0, 0]} /><Bar yAxisId="left" dataKey="imports" name="수입 (천톤)" fill="#10b981" radius={[4, 4, 0, 0]} />
      <Line yAxisId="right" type="monotone" dataKey="perCapita" name="1인당 소비 (kg)" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
    </ComposedChart>
  </W>;
}

export function W8_ImportPartners({ accent }: any) {
  return <W title="한국 수입 파트너 의존도" icon={Globe} accent={accent} pillar="S3" sub="한국 돈육(뼈 없는 부분육) 수입 파트너 국가별 물량 | FAOSTAT TM 2022"
    telemetry="FAOSTAT TM 2022"
    sit="스페인(27.1%) + 미국(25.7%) 양강 체제가 전체의 52.8% 장악. 가공품은 미국 95% 단일 의존."
    strat="칠레/브라질/멕시코 등 신흥국과 장기 수매 계약 체결, 미국 가공품 의존도 단계적 저감." source="FAOSTAT TM HS1038">
    <BarChart data={D.koreaImportPartnersData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal vertical={false} />
      <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} /><YAxis type="category" dataKey="country" stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} width={60} /><RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Bar dataKey="volume" name="수입량 (톤)" radius={[0, 4, 4, 0]}>{D.koreaImportPartnersData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Bar>
    </BarChart>
  </W>;
}

export function W9_ASFSeafood({ accent }: any) {
  return <W title="ASF 발병 → 수산물 반사수혜 시뮬레이션" icon={Zap} accent={accent} pillar="S1" sub="중국 돈육 생산량 급감 시 수산물 도매가 지수 반등 상관관계 | FAOSTAT QCL 2017-2023"
    telemetry="FAOSTAT QCL 2017-2023"
    sit="2018-2019 중국 ASF로 돈육 생산 20.9% 붕괴 시, 수산물 도매가 100→135로 35% 동반 폭등."
    strat="WOAH ASF 경보 발령 즉시, 자사 핵심 수산물 재고 최대 확보 및 판가 선제적 인상." source="FAOSTAT QCL + Fish Price Index">
    <ComposedChart data={D.asfSeafoodData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
      <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} /><YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
      <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} /><RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Area yAxisId="left" type="monotone" dataKey="chinaProduction" name="중국 생산량 (천톤)" fill="#f43f5e" stroke="#f43f5e" fillOpacity={0.15} strokeWidth={2} />
      <Line yAxisId="right" type="monotone" dataKey="seafoodIndex" name="수산물 도매가 지수" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5, fill: '#06b6d4' }} />
    </ComposedChart>
  </W>;
}

export function W10_Portfolio({ accent }: any) {
  return <W title="단백질 포트폴리오 최적 배분 비교" icon={Target} accent={accent} pillar="S4" sub="돈육 vs 수산물 vs 가금류 — 5개 핵심 지표 비교 | FAO/USDA 종합 2024"
    telemetry="FAO/USDA 종합 2024"
    sit="돈육은 저렴하나 ASF 리스크 85점으로 극심, 탄소 배출 높음. 수산물은 ESG 85점 최고, 마진율 70% 최고."
    strat="'돈육 30% + 수산물 50% + 가금류 20%' 리스크 헤지 포트폴리오 구축." source="FAO / USDA PSD">
    <BarChart data={D.proteinPortfolioData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
      <XAxis dataKey="metric" stroke="#64748b" tick={{ fontSize: 8, fill: '#64748b' }} /><YAxis stroke="#64748b" tick={{ fontSize: 9 }} /><RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Bar dataKey="pork" name="돼지고기" fill="#f43f5e" radius={[4, 4, 0, 0]} /><Bar dataKey="seafood" name="수산물" fill="#06b6d4" radius={[4, 4, 0, 0]} /><Bar dataKey="poultry" name="가금류" fill="#eab308" radius={[4, 4, 0, 0]} />
    </BarChart>
  </W>;
}

export function W11_SelfSufficiency({ accent }: any) {
  return <W title="한국 단백질 자급률 갭" icon={Target} accent={accent} pillar="S4" sub="한국 주요 단백질 품목별 자급률(%) vs 수입 의존도(%) | FAOSTAT FBS + USDA PSD 2022"
    telemetry="FAOSTAT FBS + USDA PSD 2022"
    sit="한국 핵심 단백질 품목 모두 자급률 70% 미만. 소고기(40%)와 돈육(66%) 수입 갭 매년 확대."
    strat="자급률 갭이 큰 소고기 > 돈육 > 수산물 순으로 수입 인프라 선점. 콜드체인 확장." source="FAOSTAT FBS / USDA PSD">
    <BarChart data={D.selfSufficiencyData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal vertical={false} />
      <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} /><YAxis type="category" dataKey="protein" stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} width={60} /><RT content={<CT />} /><Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
      <Bar dataKey="selfRate" name="자급률 (%)" stackId="a" fill="#10b981" /><Bar dataKey="importRate" name="수입 의존도 (%)" stackId="a" fill="#f43f5e" radius={[0, 4, 4, 0]} />
    </BarChart>
  </W>;
}
