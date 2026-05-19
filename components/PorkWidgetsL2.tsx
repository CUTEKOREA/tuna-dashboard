'use client';
import React from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Cell } from 'recharts';
import { BarChart3, TrendingUp, ShoppingCart, Globe } from 'lucide-react';
import styles from './PorkDashboard.module.css';
import { top10ProducersData, productionTrendData, koreaSupplyData, koreaImportPartnersData } from './porkData';

const WidgetCard = ({ title, icon: Icon, telemetry, desc, children, sit, tak }: any) => (
  <div className={styles.glassCard}>
    <div className={styles.cardHeader}>
      <div className={styles.cardTitleArea}>
        <Icon className={styles.cardIcon} size={24} />
        <h3 className={styles.cardTitle}>{title}</h3>
      </div>
      <span className={styles.telemetryBadge}>{telemetry}</span>
    </div>
    <div className={styles.cardDesc}>{desc}</div>
    <div className={styles.chartContainer}>{children}</div>
    <div className={styles.takeawayBox}>
      <div className={styles.sitRow}><span className={styles.sitLabel}>📋</span><p className={styles.sitText}>{sit}</p></div>
      <div className={styles.takRow}><span className={styles.takLabel}>💡</span><p className={styles.takText}>{tak}</p></div>
    </div>
  </div>
);

const COLORS = ['#f43f5e','#3b82f6','#10b981','#eab308','#8b5cf6','#ec4899','#06b6d4','#f97316','#6366f1','#14b8a6'];

export function Widget6_Top10Producers() {
  return (
    <WidgetCard title="글로벌 Top 10 생산국 점유율" icon={BarChart3} telemetry="FAOSTAT QCL | 2022"
      desc="2022년 기준 국가별 돈육 생산량(천 톤) 및 글로벌 점유율 — FAOSTAT Item 1035"
      sit="중국이 단독 44%(56,346천 톤)로 사실상 독과점 구조. 상위 3국(중국+미국+브라질) 합산 57.6%로 HHI 2,100+ 수준의 높은 시장 집중도를 보이며, 2019년 ASF 시 중국 -20.9% 급감으로 글로벌 가격 50% 폭등 사례 발생."
      tak="중국 의존도가 극단적인 글로벌 돈육 시장에서 ASF 재발 시 수산물 수요 폭증이 연쇄적으로 발생할 수 있으므로, 자사 핵심 수산물 재고를 선제적으로 확보하십시오.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top10ProducersData} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
          <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis type="category" dataKey="country" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} width={55} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} formatter={(v: number) => `${v.toLocaleString()} 천톤`} />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="production" name="생산량 (천 톤)" radius={[0, 4, 4, 0]}>
            {top10ProducersData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}

export function Widget7_ProductionTrend() {
  return (
    <WidgetCard title="주요 8개국 생산량 10년 추이" icon={TrendingUp} telemetry="FAOSTAT QCL | 2015-2024"
      desc="주요 생산국 10년간 돈육 생산량(천 톤) 시계열 — 패권 이동 및 ASF 충격 추적"
      sit="전통 강국 독일이 2018년 5,350→2024년 4,289천톤(-20% 역성장)하는 반면, 브라질은 3,431→5,359천톤(+56%), 베트남은 2,852→3,785천톤(+33%)으로 폭발적 성장. 글로벌 생산 패권이 남반구 및 아세안으로 이동 중."
      tak="역성장 중인 EU국(독일 등) 소싱을 전략적으로 축소하고, 성장률 +50% 이상인 브라질/베트남의 저가 원물 직소싱망을 구축하여 원가 경쟁력을 확보하십시오.">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={productionTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} minTickGap={20} />
          <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
          <Legend verticalAlign="top" height={36} />
          <Line type="monotone" dataKey="중국" stroke="#f43f5e" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="미국" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="브라질" stroke="#10b981" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="독일" stroke="#eab308" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="스페인" stroke="#ec4899" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="러시아" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="베트남" stroke="#06b6d4" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="한국" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}

export function Widget8_KoreaSupply() {
  return (
    <WidgetCard title="한국 돈육 수급 구조 전방위 분석" icon={ShoppingCart} telemetry="FAOSTAT QCL+FBS | 2015-2023"
      desc="한국 국내 생산(천 톤), 수입(천 톤), 1인당 소비(kg/년) 시계열 — 수급 갭 확대 추적"
      sit="한국 1인당 돈육 소비가 10년간 30.9→41.4kg(+34%)으로 폭증했으나 국내 생산 증가율(+20%)이 소비를 따라가지 못해 수입 의존도가 구조적으로 심화 중. 2022년 총수입 663천톤."
      tak="내수 소비 폭증으로 수입 불가피한 구조이므로, 기존 수산물 콜드체인을 돈육까지 확장하는 '단백질 Total Solution' 전략으로 한국 시장 주도권을 확보하십시오.">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={koreaSupplyData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} minTickGap={20} />
          <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
          <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{ fill: '#f43f5e' }} domain={[30, 45]} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
          <Legend verticalAlign="top" height={36} />
          <Bar yAxisId="left" dataKey="production" name="국내 생산 (천 톤)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="imports" name="수입 (천 톤)" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="perCapita" name="1인당 소비 (kg)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}

export function Widget9_KoreaImportPartners() {
  return (
    <WidgetCard title="한국 수입 파트너 의존도 히트맵" icon={Globe} telemetry="FAOSTAT TM | 2022"
      desc="2022년 한국 돈육(boneless, 1038) 수입 파트너 국가별 물량(톤) 및 점유율 — 총 21개국, 543,061톤"
      sit="스페인(27.1%) + 미국(25.7%) 양강 체제가 전체의 52.8%를 장악. EU 6국 합산 50%+. 신선육은 다변화되었으나 가공품(소시지)은 미국 95% 극단적 단일 의존."
      tak="양강 체제 리스크 헤지를 위해 칠레/브라질/멕시코 등 신흥 수출국과 장기 수매 계약을 체결하고, 가공품의 미국 의존도를 단계적으로 낮추십시오.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={koreaImportPartnersData} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
          <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis type="category" dataKey="country" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} width={60} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} formatter={(v: number) => `${v.toLocaleString()} 톤`} />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="volume" name="수입량 (톤)" radius={[0, 4, 4, 0]}>
            {koreaImportPartnersData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
