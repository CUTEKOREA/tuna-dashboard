'use client';

import React, { useState, useEffect } from 'react';
import styles from './PetFoodDashboard.module.css';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Globe, Flag, Ship, Briefcase, TrendingUp, Bone, RefreshCcw,
  AlertCircle, Crown, MapPin, Target, Truck, LineChart as LineChartIcon,
  ShieldCheck, Leaf, Recycle, ShoppingCart, Award, Factory, Scale,
  Users, Zap, DollarSign, BarChart2, PieChart as PieChartIcon, Activity,
  ArrowRightLeft, Network, BookOpen, ChevronDown, ChevronUp, MessageSquare,
  Anchor, Radio, Thermometer, Eye, FileCheck, Ban
} from 'lucide-react';
import TermTooltip from './TermTooltip';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import PetFoodMap from './PetFoodMap';
import TakeawayBox from './TakeawayBox';
import EstimateBadge from './EstimateBadge';
import WidgetCard from './WidgetCard';



const PINK = '#94a3b8';
const PIE_COLORS = ['var(--color-info)', 'var(--color-success)', 'var(--color-warning)', '#8b5cf6', '#06b6d4', 'var(--color-danger)', '#f97316', '#64748b', '#ec4899', '#14b8a6'];

/* ======= HELPER COMPONENTS ======= */
const CardHeader = ({ title, icon: Icon, term, desc }: any) => (
  <div className={styles.cardHeader}>
    <h3 className={styles.cardTitle}>
      <Icon size={18} className={styles.cardIcon} /> {title}
    </h3>
    {term && <TermTooltip term={term} description={desc} />}
  </div>
);


const KpiCard = ({ label, value, unit }: { label: string; value: string; unit?: string }) => (
  <div className={styles.kpiCard}>
    <div className={styles.kpiLabel}>{label}</div>
    <div className={styles.kpiValue}>{value}<span className={styles.kpiUnit}>{unit}</span></div>
  </div>
);

/* Data is loaded dynamically via fetch() from /data/petfood_dashboard.json */

/* ======= CUSTOM TOOLTIP ======= */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color, margin: 0, fontSize: '0.85rem' }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('en-US') : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ======= MAIN COMPONENT ======= */
export default function PetFoodDashboard() {

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/petfood')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: '2rem', color: '#94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}><div><RefreshCcw size={24} className={styles.rotateIcon} style={{marginBottom: '1rem'}}/></div><div>데이터 로딩 중...</div></div>;

  const { kpis, d_simulator, d_channel_share, d_export_dest, d_w01, d_w02, d_w03, d_w04, d_w05, d_w06, d_w07, d_w08, d_w09, d_w10, d_w11, d_w12, d_w13, d_w14, d_w15, d_w16, d_w17, d_w18, d_w19, d_w20, d_w21, d_w22, d_w23, d_w24, d_w25, d_w26, d_w27_radar, d_w28, d_w30, d_w31, d_w32, d_nw01_bycatch, d_nw02_quota, d_nw03_climate, d_nw04_radar, d_nw05_retention, d_nw05_abidjan, d_nw06_mmpa, d_w33, d_w34, d_w35, d_w36, d_kfas_w01, d_kfas_w02, d_kfas_w03, d_kfas_w04, d_kfas_w05, d_illex_risk, d_protein_mix, d_macro_sensitivity, d_sg_b2b } = data;




  
  const xFmt = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const cleaned = tick.replace(/\s*\(.*?\)\s*/g, '').trim();
    return cleaned.length > 6 ? cleaned.substring(0, 6) + '..' : cleaned;
  };

  return (
    <div className={styles.container}>


      <div className={styles.content}>


        {/* ═══ Executive Strategy Command ═══ */}
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(145deg, #1e293b, #0f172a)', borderRadius: '12px', borderLeft: '4px solid #f472b6', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', fontSize: '1.25rem', marginTop: 0, marginBottom: '1rem' }}>
            <Crown size={22} color="#f472b6" /> [경영진 전략 지휘소]
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
            <strong>전략 요약:</strong> 글로벌 펫푸드 시장 진입의 <span style={{ color: '#f472b6' }}>골든 윈도우는 향후 3~5년</span>입니다. 한국산 펫푸드 수출이 12배 폭증(일본 중심)하고 있으나, 수입 역시 거대하여 1.5억 달러 무역 적자를 기록 중입니다. 경영진은 태국 OEM 인프라를 활용하는 <strong>[S2: D2C OEM]</strong> 모델을 최우선으로 검토하고, 중장기적으로 <strong>[S5: 처방식 JV]</strong>를 통해 고부가가치 시장(ROE 극대화)으로 이전해야 합니다.
          </p>
        </div>

        {/* ═══ 시장 진입 시나리오 예측기 (WidgetCard 마이그레이션) ═══ */}
        <div style={{ marginBottom: '3rem' }}>
          <WidgetCard
            title="시장 진입 시나리오 예측기 (Phase 3)"
            icon={Activity}
            iconColor="#f472b6"
            pillar="S4"
            cardDesc="5대 진입 시나리오별 예상 자본금·매출·ROIC 비교 — PHASE 3 진입 전략 보고서"
            telemetry={{ status: 'STATIC', syncDate: '2026-05' }}
            chartHeight={400}
            chart={
              <ComposedChart data={d_simulator} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} tickFormatter={xFmt} />
                <YAxis yAxisId="left" tickFormatter={(v) => `${v}억`} tick={{ fill: '#94a3b8' }} />
                <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fill: '#94a3b8' }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="capital" name="투입 자본 (억 원)" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="revenue" name="예상 매출 (억 원)" fill="#f472b6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="roic" name="예상 ROIC (%)" stroke="var(--color-success)" strokeWidth={3} />
              </ComposedChart>
            }
            takeaway={{
              situation: '자체 생산기반 없는 유통사 관점에서 5가지 시나리오를 시뮬레이션한 결과, 초기 투입 자본 대비 수익성(ROIC)이 가장 우수한 모델은 S2(D2C OEM, 32%)이며, 브랜드 장악력 확보 후 S5(처방식 JV, 20%)로 확장하는 단계적 접근이 요구됩니다.',
              actionPlan: '과도한 CapEx가 요구되는 S3(M&A) 및 S4(자체 공장 수출)는 보류하고, 즉각적인 현금 창출이 가능한 S2 모델 승인 및 파트너(태국 I-Tail 등) 탐색에 전사적 자원을 집중할 것을 권고합니다.',
              source: 'PHASE 3 진입 전략 보고서',
            }}
          />
        </div>


        <div style={{ marginBottom: '3rem' }}>

          <div className={styles.grid}>

            {/* NEW WIDGET 1 */}
            <WidgetCard
              title="오징어(Illex) 어획 부진 및 원가 리스크 맵"
              icon={AlertCircle}
              iconColor="var(--color-info)"
              pillar="S1"
              cardDesc={`조업 리스크 — 최근 주차 어획량과 참깨/오징어 대체 단가 추이`}
              telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
              customBody={<>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={d_illex_risk} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                      <XAxis dataKey="week" tick={{fill: '#94a3b8'}} tickFormatter={xFmt} />
                      <YAxis yAxisId="left" tickFormatter={(v) => `${v}t`} tick={{fill: '#94a3b8'}} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}`} tick={{fill: '#94a3b8'}} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="catchVolume" name="어획량(톤)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="squidPrice" name="오징어 단가($)" stroke="#ef4444" strokeWidth={3} />
                      <Line yAxisId="right" type="monotone" dataKey="sesamePrice" name="참깨 단가($)" stroke="#10b981" strokeWidth={3} />
                    </ComposedChart>
                  </SafeResponsiveContainer>
                </div>
              </>}
              takeaway={{ situation: "오징어(Illex) 어획량이 Semana 10 기준 3,200톤으로 급락하며 단가가 폭등($4,200/t)하고 있습니다. 반면 식물성 대체 단백질인 참깨 단가는 안정적인 박스권을 유지 중입니다.", actionPlan: "매입원가 방어를 위해 오징어/참치 믹스에서 참깨 등 대체 단백질의 비율을 상향 조정하는 레시피 튜닝을 즉각 실시.", source: "아르헨티나 INIDEP 주간 어획 리포트" }}
            />

            {/* NEW WIDGET 2 */}
            <WidgetCard
              title="식물성 믹스 원가 방어율 예측기"
              icon={Activity}
              iconColor="var(--color-info)"
              pillar="S2"
              cardDesc={`What-If — 동물성/식물성 단백질 믹스 비율에 따른 마진 시뮬레이터`}
              telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
              customBody={<>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={d_protein_mix} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                      <XAxis dataKey="mixRatio" tick={{fill: '#94a3b8'}} />
                      <YAxis yAxisId="left" tick={{fill: '#94a3b8'}} unit="%" />
                      <YAxis yAxisId="right" orientation="right" tick={{fill: '#94a3b8'}} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="margin" name="예상 마진(%)" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth={3} />
                      <Line yAxisId="right" type="monotone" dataKey="cost" name="톤당 원가($)" stroke="#f59e0b" strokeWidth={3} />
                    </ComposedChart>
                  </SafeResponsiveContainer>
                </div>
              </>}
              takeaway={{ situation: "동물성 단백질(어분/오징어)의 단가 변동성이 극심한 가운데, 식물성(참깨 등) 단백질 믹스 비율을 30%로 상향할 경우 톤당 매입원가가 $2,600 수준으로 하락하며 마진이 27%까지 개선됩니다.", actionPlan: "식물성 믹스 비율을 높인 하이브리드 포뮬러를 신제품 라인업으로 기획하여 매입원가 충격을 완충(Buffer)하는 전략을 수립.", source: "글로벌 어분 단가 및 식물성 단백질 데이터" }}
            />

            {/* W33: Clean Label Risk */}
            <WidgetCard
              title="클린 라벨 전환: 카라기난 리스크 방어 🟢 Live API"
              icon={ShieldCheck}
              iconColor="var(--color-info)"
              pillar="S5"
              cardDesc={`Carrageenan — 카라기난 성분을 배제한 클린 라벨 제품의 프리미엄 시장 장악력`}
              telemetry={{ status: 'LIVE', syncDate: '실시간 연동' }}
              customBody={<>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <BarChart data={d_w33} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis type="number"  tickFormatter={xFmt} />
                      <YAxis dataKey="criteria" type="category" width={100} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="carrageenan" name="기존(카라기난)" fill="var(--color-danger)" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="clean_label" name="클린라벨(한천/펙틴)" fill="var(--color-success)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </SafeResponsiveContainer>
                </div>
              </>}
              takeaway={{ situation: "해조류 추출물인 카라기난은 펫푸드 핵심 겔화제이나, 소비자 네거티브 캠페인 확산 및 기후 변화(갯병 발생)로 인한 심각한 공급망 리스크에 노출되어 프리미엄 브랜드에서 전면 퇴출되고 있습니다.", actionPlan: "단기적으로 제품 포뮬러를 한천(Agar)이나 펙틴(Pectin) 등 '클린 라벨(Clean Label)' 규격으로 즉각 리뉴얼하고, 무첨가(Free-from) 마케팅을 전개하여 소비자 불신을 해소하고 가격 방어력을 2.5배 이상 견인해야 합니다.", source: "NotebookLM 펫푸드 포렌식 리서치 (1339bce3-e447-40f5-a5f3-51451ffe2128)" }}
            />
            {/* W10 */}
            <WidgetCard
              title="한국 펫푸드 무역수지 추이 (달러)"
              icon={ArrowRightLeft}
              iconColor="var(--color-info)"
              pillar="S3"
              cardDesc={`무역적자 — 수출이 연 25.2% 급성장했으나 여전히 수입의 2.3배가 적자.`}
              telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
              customBody={<>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d_w10} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(1)}억$`} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="exports" name="수출 (만$)" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="imports" name="수입 (만$)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="deficit" name="무역적자 (만$)" stroke="var(--color-warning)" strokeWidth={3} strokeDasharray="5 5" />
            </ComposedChart>
            </SafeResponsiveContainer>
            </div>
              </>}
              takeaway={{ situation: "한국 펫푸드 시장은 급성장 중이나 2023년 기준 수입액(3억 750만 달러)이 수출액(1억 4,975만 달러)을 2배 이상 초과하며 1억 5,775만 달러의 무역적자를 시현 중입니다. 수출 단가($1.84~$2.82/kg)가 수입 단가($2.38~$3.32/kg)를 밑돌며 중저가 제조의 함정에 빠져 있음을 보여줍니다.", actionPlan: "국내 점유율 70%인 고가 수입 브랜드를 대체할 '하이엔드 프리미엄(기능성/처방식)' 라인업을 즉각 구축해 마진 스프레드를 방어해야 합니다. 더불어 일본, 대만 등 소비 대국으로 수출 전선을 고도화해 ASP(평균판매단가)를 글로벌 수준으로 견인해야 합니다.", source: "[이슈플러스]2025 펫푸드 수출 현황과 전망, South Korea Pet Food Report, 수산분야 펫푸드 산업 활성화 방안" }}
            />
            {/* W15 */}
            <WidgetCard
              title="수출 단가 국가별 격차 ($/kg)"
              icon={DollarSign}
              iconColor="var(--color-info)"
              pillar="S4"
              cardDesc={`Price Gap — 동일 시장에서 미국산이 태국산 대비 3~7배 고가.`}
              telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
              customBody={<>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w15} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="market"  tickFormatter={xFmt} />
            <YAxis tickFormatter={(v) => `$${v}`} unit="/kg" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="usPrice" name="미국산 ($/kg)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="thPrice" name="태국산 ($/kg)" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
            </BarChart>
            </SafeResponsiveContainer>
            </div>
              </>}
              takeaway={{ situation: "글로벌 소비 시장에서 미국산 펫푸드는 $5.15/kg, 태국산은 $3.77/kg의 프리미엄 가격대를 형성하고 있습니다. 미국은 영양 과학으로, 태국은 수산 가공 인프라로 시장을 탈환 중이나 한국산은 여전히 저가 '가성비' 함정에 갇혀 펀더멘털 한계를 노출합니다.", actionPlan: "신규 CAPEX를 억제하고 세계 최고 수준의 태국 톱티어 OEM 인프라를 레버리지한 크로스보더(Cross-border) 아비트리지 전략으로 제조 마진을 극대화해야 합니다. 글로벌 영양 기준을 충족하는 임상 기반 처방식 브랜드를 론칭해 수입산 대비 대등한 단가 멀티플(Multiple) 리레이팅 달성이 필수입니다.", source: "Hong Kong Pet Food Market Report 2026, Thailand's Pet Food Market 2025, 신라교역 포괄적 타당성 및 실행 전략 보고서" }}
            />
            {/* W17 */}
            <WidgetCard
              title="펫푸드 내 원자재 구성비 해부 (%)"
              icon={PieChartIcon}
              iconColor="var(--color-info)"
              pillar="S4"
              cardDesc={`수산물 1.8% — 한국 판매 펫푸드 내 수산물 비중이 단 1.8%.`}
              telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
              customBody={<>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie data={d_w17} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(1)}%`} labelLine={false} fontSize={12}>
            {d_w17.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
            </SafeResponsiveContainer>
            </div>
              </>}
              takeaway={{ situation: "전통 원재료가 육류와 곡물에 편중되어 알러지 및 환경 이슈가 급증하는 반면, 소비자의 80.7%가 수산물 펫푸드 급여 의향을 보입니다. 현재 해양 단백질 비중은 1.8%에 불과하여 저알러지성과 영양 이점을 지닌 폭발적 성장이 예견되는 최적의 블루오션입니다.", actionPlan: "참치 해양 단백질 소싱 역량을 보유한 원양 기업과의 수직계열화(Vertical Integration)로 변동성 제로의 매입원가 통제력(Cost Control)을 선점해야 합니다. 100% 해양 단일 단백질(Single Protein) 프리미엄 라인을 적각 출시하여 하이엔드 틈새 시장의 초과 마진을 독식.", source: "(기본2017-05)반려동물산업 성장에 따른수산분야 펫푸드 산업 활성화 방안, Comprehensive Review of Alternative Proteins" }}
            />
            {/* W19 */}
            <WidgetCard
              title="글로벌 참치 펫푸드 밸류업 마진 비교 (%)"
              icon={Recycle}
              iconColor="var(--color-info)"
              pillar="S4"
              cardDesc={`Empirical Data — 태국 참치캔 생산량 폭증의 핵심 요인: 프리미엄 펫푸드 참치육 수요.`}
              telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
              customBody={<>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w19} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="product"  tickFormatter={xFmt} />
            <YAxis unit="%" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="margin" name="영업이익률(%)" fill={PINK} radius={[4, 4, 0, 0]}>
            {d_w19.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i]} />)}
            </Bar>
            </BarChart>
            </SafeResponsiveContainer>
            </div>
              </>}
              takeaway={{ situation: "글로벌 톱 OEM인 태국 ITC는 휴먼그레이드 참치 원육 기반 프리미엄 라인을 통해 23.1%의 GPM과 18.7%의 순Bottom-line(순이익)률을 달성 중입니다. 횟감용 백육과 펫푸드용 적육을 분리 활용하는 'Full Utilization' 전략은 매입원가율을 극한으로 통제하며 폭발적 마진 수직 상승을 견인합니다.", actionPlan: "자사가 확보한 프리미엄 참치 원물을 태국 최상위 OEM에 사급 형태로 독점 공급하는 '자원 교환형 파트너십'으로 임가공 마진을 극대화해야 합니다. 더불어 고마진 참치 기능성 보조치료식을 앞세워 브랜드 충성도가 높은 '동물병원' 채널을 독점하여 캐시플로우 질을 개선.", source: "I-TAIL CORPORATION ITC TB, 신라교역 펫푸드 유통 신사업 계획서" }}
            />
            {/* W24 */}
            <WidgetCard
              title="단백질 원자재별 톤당 글로벌 단가 비교 ($/kg) 🟢 Live API"
              icon={Scale}
              iconColor="var(--color-info)"
              pillar="S4"
              cardDesc={`어분 최저 — 어분 $0.45~0.50/kg으로 최저 동물성 단백질원.`}
              telemetry={{ status: 'LIVE', syncDate: '실시간 연동' }}
              customBody={<>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w24} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v) => `$${v}`} />
            <YAxis dataKey="ingredient" type="category" width={100} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="cost" name="단가 ($/kg)" fill="#8b5cf6" radius={[0, 6, 6, 0]}>
            {d_w24.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Bar>
            </BarChart>
            </SafeResponsiveContainer>
            </div>
              </>}
              takeaway={{ situation: "해양 단백질원인 어분(Fish Meal)은 $0.45~$0.50/kg로 소고기($1.5~$2.5)나 대체 배양육($4.4~$5.5) 대비 최대 10배 저렴한 절대적 매입원가 우위를 지닙니다. 높은 소화율과 천연 오메가-3 등 영양 우위까지 입증되어 가공 단가 폭등의 한계를 돌파할 유일한 솔루션입니다.", actionPlan: "매입원가 리더십을 갖춘 어분 기반 건식 사료를 캐시카우로 배치해 대체 단백질이 진입 불가한 '매스 프리미엄' Bottom-line(순이익)을 선점해야 합니다. 원양 조업 이력 추적 시스템과 MSC 인증을 클린 라벨(Clean Label)과 연계하여 시장에 가치 차별화를 명확히 각인시켜야 합니다.", source: "Sustainability in the Pet Food Industry, Insects as Feed for Companion and Exotic Pets, 신라교역 신사업 계획서" }}
            />
            {/* W28 */}
            <WidgetCard
              title="대체 단백질 시장의 폭발적 성장성 전망 (억$) 🟢 Live API"
              icon={Leaf}
              iconColor="var(--color-info)"
              pillar="S4"
              cardDesc={`CAGR 8.7% — 대체 단백질 펫푸드 시장 2027년 39억$ 전망.`}
              telemetry={{ status: 'LIVE', syncDate: '실시간 연동' }}
              customBody={<>
            <div className={styles.kpiRow}>
            <KpiCard label="CAGR" value="8.7" unit="%" />
            <KpiCard label="2027(E)" value="39" unit="억$" />
            <KpiCard label="어분 원가" value="$0.48" unit="/kg" />
            <KpiCard label="배양육 원가" value="$4.95" unit="/kg" />
            </div>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <AreaChart data={d_w28} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis tickFormatter={(v) => `$${v}B`} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="size" name="시장 규모 (억$)" stroke="var(--color-success)" fill="rgba(16,185,129,0.15)" strokeWidth={3} />
            </AreaChart>
            </SafeResponsiveContainer>
            </div>
              </>}
              takeaway={{ situation: "버려지던 수산 부산물을 업사이클링(Up-cycling)하는 '블루푸드테크'가 대체 단백질 내 최고 고수익 모델로 부상했습니다. 참치 가공 잔여물을 효소 분해하여 항산화 생리활성 펩타이드로 추출하는 기술은 매입원가 '0'의 폐기물을 톤당 수천 달러의 초고부가가치 영양제(Nutraceuticals)로 탈바꿈시킵니다.", actionPlan: "수명 연장으로 팽창 중인 시니어 펫 시장 타겟의 해양 기반 가수분해 펩타이드 특화 영양제 파이프라인을 선제 전개해야 합니다. 'Zero-Waste' ESG 스토리를 내재화하여 PE 엑시트(Exit) 시점에 대형 SI 투자자들로부터 멀티플(Multiple) 프리미엄을 확보하는 마스터플랜을 가동.", source: "Processing of Tuna Head By-Products into Antioxidant Peptide Ingredients for Aquaculture Feeds, Alternative Proteins Review" }}
            />
          <WidgetCard
            title={d_kfas_w05.title}
            icon={Activity}
            iconColor="var(--color-info)"
            pillar="S4"
            cardDesc={`EPA+DHA 620 — 줄가자미 EPA+DHA 620.24 mg/100g — 오메가-3 최고`}
            telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
            customBody={<>
                  <div className={styles.chartContainer}>
                    <SafeResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={d_kfas_w05.data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="species" tick={{fill: '#94a3b8', fontSize: 11}}  tickFormatter={xFmt} />
                        <YAxis yAxisId="left" tick={{fill: '#94a3b8'}} />
                        <YAxis yAxisId="right" orientation="right" unit="g" tick={{fill: '#94a3b8'}} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="EPA+DHA(mg/100g)" name="EPA+DHA (mg/100g)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="조지방(g/100g)" name="조지방 (g/100g)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                      </ComposedChart>
                    </SafeResponsiveContainer>
                  </div>
            </>}
            takeaway={{ situation: d_kfas_w05.sit, actionPlan: d_kfas_w05.strat, source: d_kfas_w05.source }}
          />
<WidgetCard
  title="RFMO 쿼터 축소 → 원물 공급 리스크"
  icon={Ban}
  iconColor="var(--color-info)"
  pillar="S1"
  cardDesc={`FAD -4%/년 — FAD 제한 350→288개로 연 4% 축소. 원물 단가 상승 불가피.`}
  telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
  customBody={<>
                <div className={styles.kpiRow}>
                  <KpiCard label="2025 TAC" value="73,011" unit="톤" />
                  <KpiCard label="FAD 제한" value="288" unit="개/선박" />
                  <KpiCard label="황다랑어 감축" value="-20" unit="% (2027)" />
                </div>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={d_nw02_quota} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="year" tick={{fill: '#94a3b8'}}  tickFormatter={xFmt} />
                      <YAxis yAxisId="left" tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} tick={{fill: '#94a3b8'}} />
                      <YAxis yAxisId="right" orientation="right" tick={{fill: '#94a3b8'}} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="tac" name="TAC (톤)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="fadLimit" name="FAD 제한 (개/선박)" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 4 }} />
                      <Line yAxisId="right" type="monotone" dataKey="yftReduction" name="황다랑어 감축(%)" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="5 5" />
                    </ComposedChart>
                  </SafeResponsiveContainer>
                </div>
  </>}
  takeaway={{ situation: "ICCAT은 FAD 제한을 2025년 300개 → 2026~27년 288개로 연 4% 축소 중이며, IOTC는 황다랑어를 2027년까지 2017년 대비 20% 감축 의무화했습니다. TAC 증가 대비 FAD 축소의 비대칭 구조는 선단별 어획 효율 하락과 원물 단가 상승을 불가피하게 합니다.", actionPlan: "쿼터 축소에 면역인 '부산물 기반 펫푸드 원료'로 포트폴리오를 전환하는 것이 유일한 구조적 헷지입니다. 목적어종 쿼터가 줄수록 부산물의 상대적 가치는 역설적으로 상승하므로, 가공 잔여물 독점 계약을 선제적으로 체결.", source: "ICCAT Compendium 2025, IOTC Harvest Control Rules, ICCAT Rec. 24-01" }}
/>
<WidgetCard
  title="기후변화 → 참치 서식지 이동 전망 (2050/2100)"
  icon={Thermometer}
  iconColor="var(--color-info)"
  pillar="S1"
  cardDesc={`-15~30% — 중앙 태평양 바이오매스 2100년까지 15~30% 감소 전망.`}
  telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
  customBody={<>
                <div className={styles.kpiRow}>
                  <KpiCard label="500kg 한계수온" value="20" unit="°C" />
                  <KpiCard label="1톤급 한계수온" value="17" unit="°C" />
                  <KpiCard label="중앙태평양 2100" value="-22" unit="%" />
                </div>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <BarChart data={d_nw03_climate} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" unit="%" tick={{fill: '#94a3b8'}}  tickFormatter={xFmt} />
                      <YAxis dataKey="region" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 11}} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="change2050" name="2050년 변화(%)" fill="var(--color-warning)" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="change2100" name="2100년 변화(%)" fill="var(--color-danger)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </SafeResponsiveContainer>
                </div>
  </>}
  takeaway={{ situation: "기후변화로 참치 서식지가 극쪽으로 이동하며, 현재 주요 조업 해역(중앙 북태평양)의 바이오매스가 2100년까지 22% 감소할 전망입니다. 대형 중온어(1톤급)는 수온 17°C에서 과열 리스크에 직면하여 개체 수 하락이 예상됩니다. 반면 동태평양과 지중해는 바이오매스가 증가합니다.", actionPlan: "조업 해역 이동은 물류 비용 증가로 직결되므로, 원물 직접 조달 비용이 구조적으로 상승합니다. 이는 '부산물 업사이클링(Up-cycling)' 전략의 경제적 정당성을 더욱 강화하며, 기후 리스크에 면역인 가공 잔여물 기반 원료 확보가 필수입니다.", source: "Block et al. 2026 (Science), Mesothermic fishes face overheating risk (Science)" }}
/>
</div>
        </div>
        <div style={{ marginBottom: '3rem' }}>

          <div className={styles.grid}>
            {/* W34: Tilapia Skin Upcycling */}
            <WidgetCard
              title="틸라피아 껍질 업사이클링 수익성 🟢 Live API"
              icon={Recycle}
              iconColor="var(--color-info)"
              pillar="S2"
              cardDesc={`Single-ingredient — 단일 원료(Single-ingredient) 반려견 간식 부가가치`}
              telemetry={{ status: 'LIVE', syncDate: '실시간 연동' }}
              customBody={<>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <BarChart data={d_w34} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="product"  tickFormatter={xFmt} />
                      <YAxis unit="%" />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="margin" name="영업이익률(%)" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="waste" name="자원 낭비율(%)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </SafeResponsiveContainer>
                </div>
              </>}
              takeaway={{ situation: "과거 어분(Fishmeal)으로 소진되거나 80%가 폐기되던 틸라피아 생선 껍질이, 현재는 풍부한 오메가-3와 치아 관리 기능을 내세운 '단일 원료(Single-ingredient) 프리미엄 수제 간식'으로 부상했습니다.", actionPlan: "저마진 사료용 가공 라인을 프리미엄 단일 원료 간식 제조 라인업으로 전환하는 '폐기물 제로(Zero-Waste) 업사이클링(Up-cycling)' 전략을 투입하여 기존 폐기 비용을 초고부가가치(GPM 65%) 수익 센터로 역전시켜야 합니다.", source: "NotebookLM 펫푸드 포렌식 리서치 (1339bce3-e447-40f5-a5f3-51451ffe2128)" }}
            />
            {/* W09 */}
            <WidgetCard
              title="주요 기업 매출 및 이익률 비교 (억 원)"
              icon={Scale}
              iconColor="var(--color-info)"
              pillar="S4"
              cardDesc={`Scoreboard — 로얄캐닌 2,093억 원으로 1위.`}
              telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
              customBody={<>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d_w09} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number"  tickFormatter={xFmt} />
            <YAxis dataKey="company" type="category" width={100} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="revenue" name="매출 (억 원)" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            <Line dataKey="margin" name="영업이익률(%)" stroke={PINK} strokeWidth={3} type="monotone" />
            </ComposedChart>
            </SafeResponsiveContainer>
            </div>
              </>}
              takeaway={{ situation: "국내 펫푸드 시장은 초저가 가성비와 하이엔드 프리미엄으로 완벽히 양극화되었습니다. 1위 로얄캐닌코리아는 정밀 영양을 앞세워 12.6%의 고수익을 낸 반면, 매스(Mass) 위주의 토종 선두는 1,076억 매출에도 적자에 직면했습니다. 반대로 '휴먼그레이드' 하림펫푸드와 ODM 1위 오에스피는 Bottom-line(순이익)률 반등에 성공했습니다.", actionPlan: "PEF 투자 시 '규모의 경제'보다 '프리미엄 세그먼트 침투력'에 멀티플(Multiple)을 부여해야 합니다. 어중간한 포트폴리오를 폐기하고, 합성보존료 무첨가 등으로 고마진(MSRP Premium)을 정당화하는 브랜드를 타겟팅하거나 B2C와 ODM을 수직 통합하는 롤업(Roll-up) 전략을 가동.", source: "[The Numbers] 하림펫푸드 매출 500억 돌파, 대한민국 반려동물 사료 시장 진화 전략" }}
            />
            {/* W16 */}
            <WidgetCard
              title="펫푸드 원자재 및 환율 민감도 분석 (%)"
              icon={Activity}
              iconColor="var(--color-info)"
              pillar="S4"
              cardDesc={`Sensitivity — 참치 +10% → 순이익 -8.5%. 환율 1바트 절상 → -10%.`}
              telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
              customBody={<>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w16} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" unit="%"  tickFormatter={xFmt} />
            <YAxis dataKey="factor" type="category" width={120} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="gpmImpact" name="GPM 영향(%)" fill="var(--color-warning)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="profitImpact" name="순이익 영향(%)" fill="var(--color-danger)" radius={[0, 4, 4, 0]} />
            </BarChart>
            </SafeResponsiveContainer>
            </div>
              </>}
              takeaway={{ situation: "수산 펫푸드는 매입원가와 환율에 치명적인 민감도를 지닙니다. 글로벌 톱 타이유니온 i-Tail(ITC)은 원재료의 50%가 참치이며, 참치 매입원가 10% 상승 시 순Bottom-line(순이익)이 8.5% 증발합니다. 수출 비중이 93.6%로 태국 바트 1바트 절상 시 순Bottom-line(순이익) 10%가 깎이는 환율 충격에도 노출되어 있습니다.", actionPlan: "수산 기업 펫푸드 밸류업 핵심은 '매입원가 통제권(Cost Control)'의 내재화입니다. 외부 원물 변동 리스크를 계열사 내에서 흡수하는 수직 통합을 추진하고, 매입원가 상승을 고객사에 전가할 Cost-plus Pricing 계약 및 외환 헷징을 구축해야 살아남습니다.", source: "I-TAIL CORPORATION ITC TB (Finansia, Globlex Securities Analyst Reports)" }}
            />
            {/* W20 */}
            <WidgetCard
              title="i-Tail 글로벌 ODM 매출 및 이익률 구조 (%)"
              icon={Factory}
              iconColor="var(--color-info)"
              pillar="S3"
              cardDesc={`GPM 25% — 마즈·스머커 등 OEM으로 98.7% 매출. GPM 25%.`}
              telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
              customBody={<>
            <div className={styles.kpiRow}>
            <KpiCard label="OEM 비중" value="98.7" unit="%" />
            <KpiCard label="프리미엄 비중" value="47-50" unit="%" />
            <KpiCard label="간식 성장률" value="+36.5" unit="%" />
            <KpiCard label="배당 성향" value="85.6" unit="%" />
            </div>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d_w20} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis yAxisId="left" tickFormatter={(v) => `${v}억`} />
            <YAxis yAxisId="right" orientation="right" unit="%" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" name="매출 (억 바트)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="gpm" name="GPM(%)" stroke={PINK} strokeWidth={3} />
            <Line yAxisId="right" type="monotone" dataKey="npm" name="순이익률(%)" stroke="var(--color-success)" strokeWidth={2} strokeDasharray="5 5" />
            </ComposedChart>
            </SafeResponsiveContainer>
            </div>
              </>}
              takeaway={{ situation: "글로벌 톱 ITC는 전체 매출의 98.7%가 단순 OEM에서 발생함에도 25%의 GPM과 18.7%의 탁월한 순Bottom-line(순이익)률을 달성합니다. 탑티어 고객사와의 21년 장기 락인, 고마진 습식 중심의 생산, 영양학적 솔루션을 역제안하는 자체 혁신 센터(GPCI) 내재화가 그 비결입니다.", actionPlan: "저마진 건식 사료 설비를 고수익 습식/동결건조 및 처방식 라인으로 즉각 전환하는 CapEx 투자가 요구됩니다. 제조 하청(OEM)을 넘어 처방식 포뮬러를 자체 설계하여 고객에게 솔루션을 파는 진정한 ODM으로 체질 개선을 이뤄내야 초과 수익을 담보합니다.", source: "I-TAIL CORPORATION ITC TB, 신라교역 펫푸드 유통 신사업 계획서" }}
            />
            {/* W22 */}
            <WidgetCard
              title="오에스피(OSP) 매출 및 V자 이익률 회복 (%) 🟢 Live API"
              icon={LineChartIcon}
              iconColor="var(--color-info)"
              pillar="S4"
              cardDesc={`V자 회복 — 원가율 78.6% → 이익률 6.5% 저점 → 15.4% V자 회복.`}
              telemetry={{ status: 'LIVE', syncDate: '실시간 연동' }}
              customBody={<>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d_w22} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" unit="%" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" name="매출 (억 원)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="margin" name="영업이익률(%)" stroke={PINK} strokeWidth={3} />
            <Line yAxisId="right" type="monotone" dataKey="costRate" name="매출원가율(%)" stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="5 5" />
            </ComposedChart>
            </SafeResponsiveContainer>
            </div>
              </>}
              takeaway={{ situation: "코스닥 상장사 오에스피(OSP)는 프리미엄 유기농 ODM 1위입니다. 원재료 급등으로 B2B 마진이 급감하자 간식 전문 제조사를 전략적 인수, B2B 모델에 안주하지 않고 PB 브랜드 확대 및 D2C 유통 진출로 영업Bottom-line(순이익)률을 15.4%로 완벽히 V자 회복시켰습니다.", actionPlan: "안정적 캐시플로우의 B2B 제조사를 기반으로 충성 고객을 보유한 B2C/D2C 플랫폼을 Bolt-on 인수하여 유통 수수료를 내재화하는 정석적 Value-up입니다. 자사 제조 인프라(매입원가 절감)와 인수기업 유통망을 융합해 블렌디드 마진을 극대화하십시오.", source: "대한민국 반려동물 사료 시장의 구조적 진화, 대한민국 펫푸드 주요 기업 분석 보고" }}
            />
            {/* W23 */}
            <WidgetCard
              title="하림펫푸드 매출 및 수직계열화 이익 성장 (억 원)"
              icon={Zap}
              iconColor="var(--color-info)"
              pillar="S4"
              cardDesc={`Vertical Integration — 계열사 닭고기 원가 직접 공급으로 흑자 전환.`}
              telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
              customBody={<>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d_w23} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" unit="%" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" name="매출 (억 원)" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="left" dataKey="profit" name="영업이익 (억 원)" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="margin" name="영업이익률(%)" stroke={PINK} strokeWidth={3} />
            </ComposedChart>
            </SafeResponsiveContainer>
            </div>
              </>}
              takeaway={{ situation: "하림펫푸드가 2024년 최대 매출 521억, 영업Bottom-line(순이익)률 6%에 오른 비결은 모기업을 통한 원물 '직접 조달(Vertical Integration)'에 있습니다. 경쟁사가 외부 가격 변동에 고전할 때 하림은 신선 원료를 저매입원가로 통제하며 고판가 프리미엄 마케팅을 완성했습니다.", actionPlan: "1차 밸류체인을 보유한 PE의 필승 전략입니다. 캡티브 원료 공급망을 지닌 펫푸드 부문을 육성해 글로벌 인플레이션 리스크를 완전히 상쇄(Hedging)해야 합니다. 이를 '신선 로컬 식재료(Clean Label)' 브랜딩으로 승화시켜 초과 마진을 달성.", source: "비주류서 미래 핵심 사업으로…식품 대기업 펫푸드 베팅, [The Numbers] 하림펫푸드 분석" }}
            />
            {/* W26 */}
            <WidgetCard
              title="카테고리별 글로벌 펫푸드 성장률 비교 (%) 🟢 Live API"
              icon={Award}
              iconColor="var(--color-info)"
              pillar="S4"
              cardDesc={`PB 20.2% — 미국 PB 펫푸드 성장률 20.2%로 프리미엄(11.1%)의 2배.`}
              telemetry={{ status: 'LIVE', syncDate: '실시간 연동' }}
              customBody={<>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w26} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" unit="%"  tickFormatter={xFmt} />
            <YAxis dataKey="cat" type="category" width={120} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="growth" name="성장률(%)" fill={PINK} radius={[0, 6, 6, 0]}>
            {d_w26.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Bar>
            </BarChart>
            </SafeResponsiveContainer>
            </div>
              </>}
              takeaway={{ situation: "인플레이션 심화로 소비자의 하향 이동(Trading down)이 발생, PB 사료가 시장의 20~38%를 잠식하며 내셔널 브랜드(NB) 대비 3~5배 이상 가파르게 성장 중입니다. 소비자는 어중간한 브랜드를 버리고 가성비와 품질이 보장된 대형 유통사 PB로 대거 이탈 중입니다.", actionPlan: "포트폴리오 내 OEM 제조사는 아마존 등 메가 리테일러의 PB 독점 공급자로 포지셔닝하여 마케팅 비용 제로 구조를 달성해야 합니다. B2C 브랜드를 소유했다면 어중간한 Mid-tier를 버리고 PB가 모방 불가한 특수 기능성 개발로 피봇팅하여 밸류를 방어.", source: "European pet food market share breakdown, 2026 Pet Care Industry Trends" }}
            />
            {/* W31 */}
            <WidgetCard
              title="태국 휴먼그레이드 참치 수출 및 펫푸드 지수"
              icon={Activity}
              iconColor="var(--color-info)"
              pillar="S3"
              cardDesc={`Empirical Data — 태국 캔참치 수출량과 프리미엄 펫푸드 수요 지수 상관관계`}
              telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
              customBody={<>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d_w31} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis yAxisId="left" unit="천톤" />
            <YAxis yAxisId="right" orientation="right" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="cannedExport" name="태국 참치캔 수출(천 톤)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="petfoodDemand" name="펫푸드 수요 지수" stroke="#f472b6" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
            </SafeResponsiveContainer>
            </div>
              </>}
              takeaway={{ situation: "프리미엄 펫푸드 수요 폭증은 참치 원물의 '부위별 종합 활용'이라는 Bottom-line(순이익) 창출 패러다임을 확립했습니다. 기존에 헐값 매각되던 적육(Red meat)과 자숙액이 최고급 반려묘 습식 사료 원료로 업사이클링(Up-cycling) 되며 참치 1톤당 부가가치를 기존 대비 10배 이상 끌어올렸습니다.", actionPlan: "단순 1차 식품 가공에서 벗어나, 폐기되던 수산 부산물을 고부가가치 펫푸드 원료로 전환하는 업사이클링(Up-cycling) 공정에 투자하십시오. 매입원가 센터를 초고마진 Bottom-line(순이익) 센터로 변환하고 순환경제(Zero-Waste) 스토리를 더해 엑시트(Exit) 멀티플(Multiple)을 극대화해야 합니다.", source: "신라교역 타당성 및 실행 전략 보고서, (기본2017-05) 수산분야 펫푸드 산업 활성화 방안" }}
            />
          <WidgetCard
            title={d_kfas_w02.title}
            icon={Zap}
            iconColor="var(--color-info)"
            pillar="S2"
            cardDesc={`항산화 35.2% — Aroase AP-10 효소 최적, DPPH 라디칼 소거능 35.2%`}
            telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
            customBody={<>
                  <div className={styles.chartContainer}>
                    <SafeResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={d_kfas_w02.data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="enzyme" tick={{fill: '#94a3b8', fontSize: 10}} angle={0} textAnchor="middle"  tickFormatter={xFmt} />
                        <YAxis yAxisId="left" tick={{fill: '#94a3b8'}} />
                        <YAxis yAxisId="right" orientation="right" unit="%" tick={{fill: '#94a3b8'}} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="가수분해도(%)" name="가수분해도(%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="left" dataKey="DPPH라디컬소거(%)" name="DPPH 소거(%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="거품활성(%)" name="거품활성(%)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                      </ComposedChart>
                    </SafeResponsiveContainer>
                  </div>
            </>}
            takeaway={{ situation: d_kfas_w02.sit, actionPlan: d_kfas_w02.strat, source: d_kfas_w02.source }}
          />
<WidgetCard
  title={d_kfas_w04.title}
  icon={Leaf}
  iconColor="var(--color-info)"
  pillar="S2"
  cardDesc={`수율 72.5% — 스피룰리나 알칼리추출 72.5% 수율, EAA 312mg/g`}
  telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
  customBody={<>
                  <div className={styles.chartContainer}>
                    <SafeResponsiveContainer width="100%" height="100%">
                      <BarChart data={d_kfas_w04.data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="method" tick={{fill: '#94a3b8', fontSize: 9}} angle={0} textAnchor="middle" height={70}  tickFormatter={xFmt} />
                        <YAxis tick={{fill: '#94a3b8'}} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="단백질수율(%)" name="단백질 수율(%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="EAA함량(mg/g)" name="EAA 함량(mg/g)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </SafeResponsiveContainer>
                  </div>
  </>}
  takeaway={{ situation: d_kfas_w04.sit, actionPlan: d_kfas_w04.strat, source: d_kfas_w04.source }}
/>
</div>
        </div>


      </div>
    </div>
  );
}
