'use client';
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line, Area, Cell } from 'recharts';
import { Zap, PieChart, Target } from 'lucide-react';
import styles from './PorkDashboard.module.css';
import { asfSeafoodData, proteinPortfolioData, selfSufficiencyData } from './porkData';

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

export function Widget10_ASFSeafood() {
  return (
    <WidgetCard title="ASF 발병 → 수산물 반사수혜 시뮬레이션" icon={Zap} telemetry="FAOSTAT QCL | 2017-2023"
      desc="중국 돈육 생산량(천 톤) 급감 시 글로벌 수산물 도매가 지수(2017=100) 반등 상관관계"
      sit="2018-2019 중국 ASF 사태로 돈육 생산 20.9% 붕괴 시, 대체 단백질인 수산물 도매가 지수가 100→135로 35% 동반 폭등하는 '공급 충격 전이(Shock Transmission)' 현상이 확인됨. 중국 생산 회복(2021-2023) 시 수산물 가격도 하락 전환."
      tak="WOAH 모니터링 상 ASF 경보 발령 즉시, 자사 핵심 수산물(명태/오징어)의 재고를 최대로 확보하고 판가를 선제적으로 인상하여 시세차익을 극대화하십시오.">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={asfSeafoodData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} minTickGap={20} />
          <YAxis yAxisId="left" stroke="#f43f5e" tick={{ fill: '#f43f5e' }} domain={[35000, 62000]} />
          <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" tick={{ fill: '#06b6d4' }} domain={[90, 145]} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
          <Legend verticalAlign="top" height={36} />
          <Area yAxisId="left" type="monotone" dataKey="chinaProduction" name="중국 생산량 (천 톤)" fill="#f43f5e" stroke="#f43f5e" fillOpacity={0.15} strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="seafoodIndex" name="수산물 도매가 지수" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5, fill: '#06b6d4' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}

export function Widget11_ProteinPortfolio() {
  return (
    <WidgetCard title="단백질 포트폴리오 최적 배분 비교" icon={PieChart} telemetry="FAO/USDA 종합 | 2024"
      desc="돈육 vs 수산물 vs 가금류 — 5개 핵심 지표(단가, 리스크, 탄소, ESG, 마진) 비교 분석"
      sit="돈육은 단가가 저렴하나 ASF/곡물가 리스크 85점으로 극심하고 탄소 배출이 높음. 수산물은 ESG 프리미엄 85점으로 최고이며 마진율도 70%로 가장 높음. 가금류는 FCR 효율 최고이나 AI(조류독감) 리스크 70점."
      tak="단일 단백질에 올인하지 말고 '돈육 30% + 수산물 50% + 가금류 20%' 비율로 리스크 헤지된 포트폴리오를 구축하여, 한 품목의 공급 충격이 전사 매출에 미치는 변동성을 최소화하십시오.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={proteinPortfolioData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="metric" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} minTickGap={10} />
          <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="pork" name="돼지고기" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="seafood" name="수산물" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          <Bar dataKey="poultry" name="가금류" fill="#eab308" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}

export function Widget12_SelfSufficiency() {
  return (
    <WidgetCard title="한국 단백질 시장 자급률 갭" icon={Target} telemetry="FAOSTAT FBS + USDA PSD | 2022"
      desc="한국 주요 단백질 품목별 자급률(%) vs 수입 의존도(%) — 공략 기회 맵"
      sit="한국 핵심 단백질 품목 모두 자급률 70% 미만. 소고기(40%)와 돈육(66%)의 수입 갭이 매년 확대 중. 수산물 자급률도 65%로 구조적 수입 의존."
      tak="자급률 갭이 가장 큰 소고기 > 돈육 > 수산물 순으로 수입 물류/유통 인프라를 선점하십시오. 기존 수산물 콜드체인을 돈육/소고기로 확장하여 '단백질 Total Solution' 기업으로 피봇하는 것이 중장기 성장 전략의 핵심입니다.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={selfSufficiencyData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
          <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} domain={[0, 100]} />
          <YAxis type="category" dataKey="protein" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} width={60} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="selfRate" name="자급률 (%)" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
          <Bar dataKey="importRate" name="수입 의존도 (%)" stackId="a" fill="#f43f5e" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
