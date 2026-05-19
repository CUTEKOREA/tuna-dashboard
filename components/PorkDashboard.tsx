'use client';
import React from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Area, Cell } from 'recharts';
import { Activity, TrendingUp, Package, Globe, Leaf, Zap, Shield, Factory, Ship, ShoppingCart } from 'lucide-react';
import styles from './PorkDashboard.module.css';
import { asfCycleData, feedCostData, tradeSpreadData, esgData } from './porkData';
import { Widget6_Top10Producers, Widget7_ProductionTrend, Widget8_KoreaSupply, Widget9_KoreaImportPartners } from './PorkWidgetsL2';
import { Widget10_ASFSeafood, Widget11_ProteinPortfolio, Widget12_SelfSufficiency } from './PorkWidgetsL3';

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

const PillarHeader = ({ title, icon: Icon }: any) => (
  <div className={styles.pillarHeader}>
    <Icon className={styles.pillarIcon} size={28} />
    <h2 className={styles.pillarTitle}>{title}</h2>
  </div>
);

const LayerBadge = ({ layer, label }: { layer: number; label: string }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: layer === 1 ? 'rgba(59,130,246,0.15)' : layer === 2 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)', color: layer === 1 ? '#3b82f6' : layer === 2 ? '#10b981' : '#f43f5e', border: `1px solid ${layer === 1 ? 'rgba(59,130,246,0.3)' : layer === 2 ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`, marginBottom: '1rem' }}>
    <span>L{layer}</span><span>{label}</span>
  </div>
);

export default function PorkDashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>돼지고기(Pork) 인텔리전스 센터</h1>
        <p className={styles.subtitle}>S-Grade 글로벌 돈육 공급망 · 수산물 대체 탄력성 · 3-Layer 피라미드 (12개 위젯)</p>
      </div>

      {/* ===== UPSTREAM: 산지 원물 확보 ===== */}
      <div className={styles.pillarSection}>
        <PillarHeader title="원료 수급 (Raw Material) — UPSTREAM" icon={Factory} />
        <div className={styles.grid}>
          {/* L1-① */}
          <WidgetCard title="글로벌 생산량 및 질병(ASF) 사이클" icon={Activity} telemetry="FAOSTAT QCL | 2015-2024"
            desc="중국 중심 글로벌 돈육 생산량(천 톤) 및 산지 가격 지수 — ASF 충격 시 역상관"
            sit="2019년 중국 ASF 사태로 글로벌 생산량 54,992→43,498천톤(-20.9%) 급감. 3~4년 주기 질병 충격이 반복되며 산지 단가 폭등으로 직결됩니다."
            tak="WOAH ASF 모니터링 + CME Lean Hogs 선물을 수산물 가격 전략 선행 지표로 삼아, 돈육 폭등 시 자사 수산물 마케팅 강화 및 동적 가격 전략으로 수익성을 극대화하십시오.">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={asfCycleData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} minTickGap={20} />
                <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{ fill: '#f43f5e' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
                <Legend verticalAlign="top" height={36} />
                <Bar yAxisId="left" dataKey="production" name="중국 생산량 (천 톤)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="price" name="산지 가격 지수" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </WidgetCard>
          {/* L2-⑥ */}
          <Widget6_Top10Producers />
          {/* L2-⑦ */}
          <Widget7_ProductionTrend />
          {/* L3-⑩ ★ 킬러 */}
          <Widget10_ASFSeafood />
        </div>
      </div>

      {/* ===== MIDSTREAM 1: 가공 & 생산 ===== */}
      <div className={styles.pillarSection}>
        <PillarHeader title="가공 & 생산 (Processing) — MIDSTREAM" icon={Zap} />
        <div className={styles.grid}>
          {/* L1-② */}
          <WidgetCard title="곡물가(사료) 연동 마진 압박 지수" icon={TrendingUp} telemetry="STATIC | 2022-2023"
            desc="사료곡물(대두/옥수수) 가격 지수 대비 가공 마진율(%) 추이"
            sit="사료비가 원가의 60% 이상을 차지하는 돈육 특성상, 2022년 곡물가 피크 당시 가공 마진이 적자(-2%)로 전환되는 마진 스퀴즈 현상이 발생했습니다."
            tak="곡물가 상승 시 고마진 특수 부위(삼겹살/항정살) 직판 비율을 늘리고, 저마진 전/후지는 B2B 급식 및 소시지 가공 공장으로 전환하여 재고 비용을 축소하십시오.">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={feedCostData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="quarter" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} minTickGap={20} />
                <YAxis yAxisId="left" stroke="#eab308" tick={{ fill: '#eab308' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fill: '#10b981' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
                <Legend verticalAlign="top" height={36} />
                <Line yAxisId="left" type="monotone" dataKey="feedIndex" name="사료 가격 지수" stroke="#eab308" strokeWidth={3} />
                <Bar yAxisId="right" dataKey="porkMargin" name="가공 마진율 (%)" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {feedCostData.map((entry, i) => <Cell key={i} fill={entry.porkMargin < 0 ? '#ef4444' : '#10b981'} />)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </WidgetCard>
          {/* L3-⑪ ★ 킬러 */}
          <Widget11_ProteinPortfolio />
        </div>
      </div>

      {/* ===== MIDSTREAM 2: 물류 & 통관 ===== */}
      <div className={styles.pillarSection}>
        <PillarHeader title="물류 & 통관 (Logistics) — MIDSTREAM" icon={Ship} />
        <div className={styles.grid}>
          {/* L1-③ */}
          <WidgetCard title="주요 대륙간 무역 단가 스프레드" icon={Globe} telemetry="OEC | 2023"
            desc="EU, 북미, 아시아 간 수출입 돈육 평균 단가(달러/톤)"
            sit="EU 환경 규제에 따른 생산량 감소로 EU산 단가가 북미산을 추월했으며, 아시아 시장의 높은 소비력으로 거대한 가격 스프레드가 유지되고 있습니다."
            tak="단가가 안정적인 북미 및 남미(브라질)산 비중을 높여 물류/원가 경쟁력을 확보하는 다변화(Diversification) 전략이 시급합니다.">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tradeSpreadData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} minTickGap={20} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} domain={['dataMin - 200', 'dataMax + 200']} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="asiaPrice" name="아시아 도착가 (달러/톤)" stroke="#f43f5e" strokeWidth={3} />
                <Line type="monotone" dataKey="euPrice" name="EU 수출가 (달러/톤)" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="usPrice" name="북미 수출가 (달러/톤)" stroke="#eab308" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </WidgetCard>
          {/* L2-⑨ */}
          <Widget9_KoreaImportPartners />
        </div>
      </div>

      {/* ===== DOWNSTREAM: 판매 & 수요 ===== */}
      <div className={styles.pillarSection}>
        <PillarHeader title="판매 & 수요 (Sales) — DOWNSTREAM" icon={ShoppingCart} />
        <div className={styles.grid}>
          {/* L2-⑧ */}
          <Widget8_KoreaSupply />
          {/* L3-⑫ ★ 킬러 */}
          <Widget12_SelfSufficiency />
        </div>
      </div>

      {/* ===== OVERARCHING: ESG ===== */}
      <div className={styles.pillarSection}>
        <PillarHeader title="ESG & 지속가능성 (Sustainability)" icon={Leaf} />
        <div className={styles.grid}>
          {/* L1-⑤ */}
          <WidgetCard title="육류별 탄소 배출 지수 비교" icon={Shield} telemetry="FAOSTAT | 2024"
            desc="주요 단백질 원천별 1kg 생산 당 탄소(CO2e) 배출량 비교"
            sit="돈육의 탄소 배출량(12.3kg)은 소고기 대비 낮으나 수산물(2~5kg) 대비 압도적으로 높습니다. 글로벌 Scope 3 규제 시 징벌적 과세 대상이 될 수 있습니다."
            tak="ESG 보고서에서 수산물의 낮은 탄소 배출을 강조하여 '그린 프리미엄'을 획득하고, 돈육 부문은 바이오가스 등 업사이클링 투자를 단행하십시오.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={esgData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="category" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="carbon" name="CO2e 배출량 (kg/kg)" fill="#10b981" radius={[0, 4, 4, 0]}>
                  {esgData.map((entry, i) => <Cell key={i} fill={entry.carbon > 15 ? '#ef4444' : entry.carbon > 10 ? '#f59e0b' : '#10b981'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </WidgetCard>
        </div>
      </div>
    </div>
  );
}
