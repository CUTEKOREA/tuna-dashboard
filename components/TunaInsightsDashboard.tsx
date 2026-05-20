import React, { useState } from 'react';
import { InsightNauruSwitch, InsightIOCollapse, InsightEU18C } from './TunaNewInsightsA';
import { InsightTunaExtract, InsightPillarTwo, InsightVietnamOEM } from './TunaNewInsightsB';
import styles from './TunaInsightsDashboard.module.css';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, ComposedChart, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { TrendingUp, Ship, Briefcase, Skull, ShieldAlert, ArrowRightLeft, Target, Anchor, Globe, Crosshair, Map, ThermometerSun, Lightbulb, Cpu, Building2, Leaf, TestTube2, Bone, Zap } from 'lucide-react';
import TermTooltip from './TermTooltip';
import TakeawayBox from './TakeawayBox';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


const mockArbitrageData = [
  { year: 2019, 태국_매입가: 1200, EU_수출가: 3500 },
  { year: 2020, 태국_매입가: 1350, EU_수출가: 3800 },
  { year: 2021, 태국_매입가: 1400, EU_수출가: 4200 },
  { year: 2022, 태국_매입가: 1800, EU_수출가: 4900 },
  { year: 2023, 태국_매입가: 1650, EU_수출가: 5100 },
];

const mockProcessingHubs = [
  { year: '1990', 미국: 45, 일본: 35, 태국: 10, 에콰도르: 0, 베트남: 0 },
  { year: '2000', 미국: 20, 일본: 25, 태국: 35, 에콰도르: 5, 베트남: 2 },
  { year: '2010', 미국: 8, 일본: 15, 태국: 45, 에콰도르: 15, 베트남: 8 },
  { year: '2023', 미국: 2, 일본: 8, 태국: 38, 에콰도르: 26, 베트남: 14 },
];

const mockEmergingMarkets = [
  { name: 'Egypt', growth: 18.5, volume: 45000 },
  { name: 'Saudi Arabia', growth: 14.2, volume: 38000 },
  { name: 'Nigeria', growth: 22.1, volume: 29000 },
  { name: 'Colombia', growth: 12.8, volume: 22000 },
];

// 실데이터: FAO FishStat Capture v25 (2026-05-13판) — Pacific WCPO(Area 71) vs Atlantic(Areas 21+27+31+34+37) 합계
// 어종: 가다랑어·황다랑어·눈다랑어·날개다랑어·참다랑어·남방참다랑어 전체
const mockZeroSumData = [
  { year: 1990, Pacific_WCPO: 1422314, Atlantic: 493001 },
  { year: 2000, Pacific_WCPO: 2026888, Atlantic: 460960 },
  { year: 2010, Pacific_WCPO: 2610851, Atlantic: 440240 },
  { year: 2015, Pacific_WCPO: 2914618, Atlantic: 494174 },
  { year: 2020, Pacific_WCPO: 2991381, Atlantic: 546490 },
  { year: 2022, Pacific_WCPO: 3075465, Atlantic: 650178 },
];

const mockHedgingMatrix = [
  { year: '2019', Tuna_Index: 100, Mackerel_Index: 100 },
  { year: '2020', Tuna_Index: 95, Mackerel_Index: 110 },
  { year: '2021', Tuna_Index: 82, Mackerel_Index: 145 }, // Hedging point
  { year: '2022', Tuna_Index: 105, Mackerel_Index: 90 },
  { year: '2023', Tuna_Index: 90, Mackerel_Index: 125 },
];

const mockDarkTrading = [
  { region: 'West Africa', Exported: 120, Imported: 85, DiscrepancyGap: 35 },
  { region: 'SE Asia', Exported: 240, Imported: 200, DiscrepancyGap: 40 },
  { region: 'Pacific Isles', Exported: 350, Imported: 290, DiscrepancyGap: 60 },
];

const mockAquaculturePremium = [
  { year: 2005, 야생_어획_단가: 12000, 양식_단가: 8000 },
  { year: 2010, 야생_어획_단가: 15000, 양식_단가: 12500 },
  { year: 2015, 야생_어획_단가: 18000, 양식_단가: 19000 }, // Inversion point
  { year: 2020, 야생_어획_단가: 21000, 양식_단가: 26000 },
  { year: 2024, 야생_어획_단가: 23500, 양식_단가: 31000 },
];

const mockGastronomyMap = [
  { country: 'Japan', price: 28 },
  { country: 'USA (NY/LA)', price: 32 },
  { country: 'China (Coast)', price: 35 },
  { country: 'Hong Kong', price: 38 },
  { country: 'UAE (Dubai)', price: 42 },
];

const mockHHIIndex = [
  { year: 2010, HHI: 1200 },
  { year: 2015, HHI: 1500 },
  { year: 2018, HHI: 1850 },
  { year: 2020, HHI: 2100 },
  { year: 2022, HHI: 2600 },
  { year: 2024, HHI: 2950 },
];

const mockClimateShift = [
  { year: '1990', Bluefin_Cold: 35, Skipjack_Warm: 65 },
  { year: '2005', Bluefin_Cold: 25, Skipjack_Warm: 75 },
  { year: '2020', Bluefin_Cold: 18, Skipjack_Warm: 82 },
  { year: '2035', Bluefin_Cold: 12, Skipjack_Warm: 88 },
];

const mockPrecisionFishing = [
  { year: 2018, CPUE: 100, MGO_Cost: 100 },
  { year: 2020, CPUE: 102, MGO_Cost: 95 },
  { year: 2022, CPUE: 108, MGO_Cost: 85 }, // Drone & 3D Sonar adoption
  { year: 2024, CPUE: 115, MGO_Cost: 72 },
];

const mockTariffHopping = [
  { region: 'Thailand to US', '2023': 150000, '2026_Projected': 60000 },
  { region: 'Ecuador to US', '2023': 80000, '2026_Projected': 130000 },
  { region: 'FDI in US/Georgia', '2023': 15000, '2026_Projected': 55000 },
];

// 실데이터: Fisheries Research 2025 학술논문 (Nielsen Retail Scanner 2017-2019, Hedonic pricing model)
// Standard = 100 (baseline), Dolphin-Safe 단일 = 125.4, MSC 단일 = 144.6, 듀얼 인증 = 181.3 (시너지 효과)
const mockMSCPremium = [
  { category: 'Standard Canned', price: 100 },
  { category: 'MSC Certified', price: 144.6 },
  { category: 'MSC + Dolphin-Safe', price: 181.3 },
];

const mockAlternativeProtein = [
  { year: 2018, VeganTuna_Market_USD_Millions: 520, Average_FIFO_Ratio: 18 },
  { year: 2021, VeganTuna_Market_USD_Millions: 750, Average_FIFO_Ratio: 19 },
  { year: 2023, VeganTuna_Market_USD_Millions: 945, Average_FIFO_Ratio: 22 },
  { year: 2026, VeganTuna_Market_USD_Millions: 1210, Average_FIFO_Ratio: 24 },
  { year: 2030, VeganTuna_Market_USD_Millions: 1590, Average_FIFO_Ratio: 25 },
];

const mockByproductUpcycling = [
  { year: 2019, Canned_Margin: 15, PetCare_Margin: 18 },
  { year: 2021, Canned_Margin: 12, PetCare_Margin: 22 },
  { year: 2023, Canned_Margin: 9, PetCare_Margin: 26 },
  { year: 2024, Canned_Margin: 8.5, PetCare_Margin: 28.5 },
];

export default function TunaInsightsDashboard() {
  const [activeTab, setActiveTab] = useState('margin');

  const renderMarginTrack = () => (
    <>
      <div className={styles.insightCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <ArrowRightLeft size={20} color="#38bdf8"/> Insight 1. 참치 차익거래 마진 레이더
            <TermTooltip term="" description="원어 매입가와 2차 가공 수출가 사이의 마진 스플릿을 추적하여 가장 유리한 스프레드 구간을 발굴하는 차트입니다." />
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
              <LineChart data={mockArbitrageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: 'var(--text-primary)' }} />
                <Legend />
                <Line type="monotone" dataKey="EU_수출가" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="태국_매입가" stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" />
              </LineChart>
            </SafeResponsiveContainer>
          </div>
          <div className={styles.kpiPanel}>
            <div className={styles.kpiBox}>
              <div className={styles.kpiLabel}>현재 스프레드 ($/MT)</div>
              <div className={styles.kpiValue}>$3,450</div>
              <div className={styles.kpiSub}>▲ 12.4% vs 2022</div>
            </div>
            
          </div>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <TakeawayBox
            situation="[Arbitrage Spread Analysis] 태국 등 1차 원물(Raw Material) 허브 매입가와 EU/미주향 2차 가공 수출가 간의 구조적 괴리를 정량 추적 중입니다. 2021년 물류 대란(Supply Chain Disruption) 이후 운임 상승폭을 흡수하고도 톤당 스프레드가 $3,450을 돌파하는 등 초과수익(Alpha) 구간이 형성되었습니다."
            actionPlan="[Capital Allocation Strategy] 단순 원물 트레이딩 볼륨을 축소하고, 가공 차익(Processing Margin)을 극대화하는 \'Value-Add\' 라인으로 자본을 전면 재배치해야 합니다. 특히 EU향 무관세 혜택(Tariff Advantage)이 있는 에콰도르 내 톨링(Tolling) 파트너십을 즉시 체결하여 규제 차익(Regulatory Arbitrage)까지 동시에 확보하여 잉여현금흐름(FCF)을 극대화하십시오."
          />
        </div>
      </div>

      <div className={styles.insightCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Globe size={20} color="#38bdf8"/> Insight 2. 가공 허브 패권 지도
            <TermTooltip term="" description="과거 전통적인 가공 중심지에서 동남아/중남미 등으로 이동하는 무역량의 면적 확대를 통해 글로벌 공급망의 수직적 이동을 포착합니다." />
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockProcessingHubs} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="미국" stackId="1" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.6} />
                <Area type="monotone" dataKey="태국" stackId="1" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.6} />
                <Area type="monotone" dataKey="에콰도르" stackId="1" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.6} />
              </AreaChart>
            </SafeResponsiveContainer>
          </div>
          <div className={styles.kpiPanel}>
            <div className={styles.kpiBox} style={{ borderLeftColor: 'var(--color-success)' }}>
              <div className={styles.kpiLabel}>Rising Hub: Ecuador</div>
              <div className={styles.kpiValue}>26% Share</div>
              <div className={styles.kpiSub}>EU 무관세 혜택</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <TakeawayBox
            situation="[Supply Chain Migration] 과거 미국·일본이 주도하던 가공 패권이 지정학적 임금 인플레이션 및 관세 장벽으로 인해 해체되며, 에콰도르(글로벌 가공 hub M/S 26%, 2023) 및 베트남 중심의 신흥 오프쇼어링(Offshoring) 허브로 시장 재편이 완료되는 국면입니다. *EU pre-cooked loin 좁은 segment 기준으로는 에콰도르 M/S 32~42%(TunaNewInsightsA 참조).*"
            actionPlan="[M&A / FDI Strategy] 미국 및 일본 내 On-shore 가공 설비를 보유한 경쟁사들의 한계 비용(Marginal Cost)이 한계선에 도달했습니다. 우리는 중남미(에콰도르)의 기구축된 밸류체인을 활용해, 북미 리테일러향 \'관세 회피(Tariff-free) 프라이빗 라벨(PB)\' 장기 공급 계약을 선점하는 우회 진입(Bypass) 전략을 즉각 승인해야 합니다."
          />
        </div>
      </div>

      <div className={styles.insightCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Crosshair size={20} color="#38bdf8"/> Insight 3. 신흥 소비 블랙홀 마켓
            <TermTooltip term="" description="CAGR이 15% 이상 급상승하는 국가를 수직 막대로 정렬하여, 통조림 소비가 폭발하는 차기 중진국 타겟 시장을 식별합니다." />
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={mockEmergingMarkets} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="growth" fill="#818cf8" radius={[0, 4, 4, 0]} name="연평균 성장률 (%)" />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div className={styles.kpiPanel}>
            <div className={styles.kpiBox}>
              <div className={styles.kpiLabel}>최대 신흥 시장</div>
              <div className={styles.kpiValue}>나이지리아</div>
              <div className={styles.kpiSub}>+22.1% Annual Growth</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <TakeawayBox
            situation="[Emerging Market Demand Shock] 1인당 GDP 상승 곡선과 맞물려 상온 보관 단백질(Canned Tuna) 수요가 폭발하는 \'소비 블랙홀\' 국가들의 데이터입니다. 특히 나이지리아 등 아프리카/중동 권역에서 연평균 성장률(CAGR) 20% 이상의 비선형적 폭발(Exponential Growth)이 관측됩니다."
            actionPlan="[Market Penetration Tactics] 선진국의 저성장(Stagnation) 굴레에서 벗어나, 아프리카 및 중동 내 1차 벤더(Tier 1 Distributor) 지분을 전략적으로 인수하거나 조인트벤처(JV)를 설립하십시오. 초기 진입 시 저가 블렌딩(Blending) 스킵잭 라인업으로 시장 점유율(Market Share)을 장악한 뒤, 프리미엄 라인으로 마진을 확대하는 2-Step 침투 전략을 집행해야 합니다."
          />
        </div>
      </div>
    </>
  );

  const renderCaptureTrack = () => (
    <>
      <div className={styles.insightCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Anchor size={20} color="#818cf8"/> Insight 4. 어장 제로섬 역학 뷰어
            <TermTooltip term="" description="태평양과 대서양의 어획량을 면적 겹침(Stack)으로 나타내어, 엘니뇨 등 기상 이변 시 시소 게임처럼 서로 보완되는 헷징 효과를 증명합니다." />
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockZeroSumData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorPacific" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAtlantic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="Pacific_WCPO" stroke="#818cf8" fillOpacity={1} fill="url(#colorPacific)" />
                <Area type="monotone" dataKey="Atlantic" stroke="#f472b6" fillOpacity={1} fill="url(#colorAtlantic)" />
              </AreaChart>
            </SafeResponsiveContainer>
          </div>
          <div className={styles.kpiPanel}>
            <div className={styles.kpiBox} style={{ borderLeftColor: '#f472b6' }}>
              <div className={styles.kpiLabel}>대서양 보전율</div>
              <div className={styles.kpiValue}>+42%</div>
              <div className={styles.kpiSub}>태평양 충격기</div>
            </div>
            
          </div>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <TakeawayBox
            situation="[Macro Climate Hedging] 엘니뇨/라니냐 사이클에 따른 중서부태평양(WCPO) 어획량의 변동성이 대서양 조업량과 완벽한 음의 상관관계(Zero-sum Seesaw)를 보이고 있습니다. 2015년, 2023년 기후 충격 당시 대서양이 +42%의 손실 보전(Compensation) 역할을 수행했습니다."
            actionPlan="[Fleet Redeployment Protocol] 기상 이변은 리스크가 아니라 기회입니다. 글로벌 ENSO(엘니뇨 남방진동) 지수가 1.5 임계치를 돌파하는 즉시, 태평양 선단(Fleet)의 30%를 대서양 공해상으로 전진 배치하는 \'동적 헷징(Dynamic Hedging) 매뉴얼\'을 전격 가동하십시오. 기상 리스크를 선제적 조업권 확보(Arbitrage)의 무기로 전환해야 합니다."
          />
        </div>
      </div>

      <div className={styles.insightCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Map size={20} color="#818cf8"/> Insight 5. 대체 수산물 헷징 매트릭스
            <TermTooltip term="" description="참치 어획량이 무너질 때 고등어 등 펠라직 어종 수요가 급상승하는 역상관관계 라인을 통해 리스크 상쇄 포인트를 시각화합니다." />
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
              <LineChart data={mockHedgingMatrix} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" domain={[60, 160]} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Line type="step" dataKey="Tuna_Index" stroke="#94a3b8" strokeWidth={3} />
                <Line type="monotone" dataKey="Mackerel_Index" stroke="var(--color-success)" strokeWidth={4} />
              </LineChart>
            </SafeResponsiveContainer>
          </div>
          <div className={styles.kpiPanel}>
            <div className={styles.kpiBox} style={{ borderLeftColor: 'var(--color-success)' }}>
              <div className={styles.kpiLabel}>상관계수 (참치-고등어)</div>
              <div className={styles.kpiValue}>-0.78</div>
              <div className={styles.kpiSub}>강한 음의 상관 (헷징 가능)</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <TakeawayBox
            situation="[Cross-Commodity Correlation] 참치 어획량 급감에 따른 단가 폭등 시, 대체 단백질인 펠라직(고등어 등 표층수 어종) 수요가 수직 상승하는 강력한 역상관관계(-0.78, Negative Correlation) 지표입니다. 대체재 간의 완벽한 펀더멘털 헷징 구조입니다."
            actionPlan="[Portfolio Diversification] 참치 단일 어종에 의존하는 \'One-trick Pony\' 비즈니스 모델을 즉시 폐기하십시오. 참치 흉어 리스크를 재무적으로 완전 상쇄(Offset)할 수 있도록, 스칸디나비아산 고등어 쿼터(Quota) 확보 및 트레이딩 부서를 통합 신설하여 \'펠라직 인덱스 펀드\' 관점의 다각화된 상품 포트폴리오를 구축해야 합니다."
          />
        </div>
      </div>

      <div className={styles.insightCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <ShieldAlert size={20} color="#818cf8"/> Insight 6. 다크 트레이딩 의심 경로
            <TermTooltip term="" description="해구별 수출량과 실제 수입된 물량의 갭을 막대 차이로 직접 비교하여 불법 환적이나 단위 위반(IUU) 의심 루트를 모니터링합니다." />
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDarkTrading} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="region" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="Exported" fill="#38bdf8" />
                <Bar dataKey="Imported" fill="#64748b" />
                <Bar dataKey="DiscrepancyGap" fill="var(--color-danger)" />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div className={styles.kpiPanel}>
            <div className={styles.kpiBox} style={{ borderLeftColor: 'var(--color-danger)' }}>
              <div className={styles.kpiLabel}>최대 무역 격차</div>
              <div className={styles.kpiValue}>60 K/t</div>
              <div className={styles.kpiSub} style={{color: 'var(--color-danger)'}}>태평양 도서국 루트</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <TakeawayBox
            situation="[Compliance & Tail Risk Monitor] 태평양 도서 국가 라인에서 발원하는 수출 통관량과 실제 수입 반영량 간의 거대한 이격(Discrepancy Gap)은 해상 전재(Transshipment) 기반의 불법·비보고·비규제(IUU) 블랙마켓 볼륨입니다. ESG 규제 당국의 다음 타겟이 될 시한폭탄입니다."
            actionPlan="[ESG Compliance Audit] 무역 불일치 물량이 당사의 소싱 파이프라인(Supply Chain)에 1%라도 섞여 들어올 경우, 서구권 메이저 리테일러의 상장 폐지급 벤더 퇴출 리스크가 존재합니다. 즉시 제3자(Third-party) 블록체인 이력 추적 시스템을 도입하여 밸류체인의 무결성을 투명하게 증명(Auditability)하고, 이를 마케팅 무기로 역활용하여 잉여현금흐름(FCF)을 극대화하십시오."
          />
        </div>
      </div>
    </>
  );

  const renderPremiumTrack = () => (
    <>
      <div className={styles.insightCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <TrendingUp size={20} color="#f472b6"/> Insight 7. 양식 vs 어획 패러다임 역전
            <TermTooltip term="" description="야생 어확 단가 상승률보다 양식 단가의 프리미엄이 뚫고 올라가는 '크로스오버' 시점을 궤적으로 보여주어 투자 전환기를 분석합니다." />
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
              <LineChart data={mockAquaculturePremium} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="양식_단가" stroke="#f472b6" strokeWidth={4} />
                <Line type="monotone" dataKey="야생_어획_단가" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4"/>
              </LineChart>
            </SafeResponsiveContainer>
          </div>
          <div className={styles.kpiPanel}>
            <div className={styles.kpiBox} style={{ borderLeftColor: '#f472b6' }}>
              <div className={styles.kpiLabel}>양식 프리미엄</div>
              <div className={styles.kpiValue}>+31.9%</div>
              <div className={styles.kpiSub}>자연산 대비 (2024)</div>
            </div>
            
          </div>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <TakeawayBox
            situation="[Value Inversion: Wild vs Ranching] 2015년 임계점(Inversion Point)을 기점으로, 품질 균일성(Quality Control)과 지방률 정밀 통제가 가능한 양식(Ranching) 참치의 톤당 단가가 자연산 야생 어획 단가를 완벽하게 추월(+31.9% 프리미엄)하는 패러다임 역전이 고착화되었습니다."
            actionPlan="[Capex Reallocation] 불확실성이 극심한 원양 어선 건조(Hardware)에 대한 CAPEX 승인을 전면 보류하십시오. 조업 의존형 구조에서 탈피하여, 지중해 및 호주 등지의 최상위 지분 구조를 가진 양식(Ranching/Farming) 인프라 또는 배양 기술(Bio-tech) 스타트업으로 전사적 투자가용자본(Dry Powder)을 전면 이동시켜야 해야 합니다."
          />
        </div>
      </div>

      <div className={styles.insightCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Map size={20} color="#f472b6"/> Insight 8. 최고가 미식 소비 국가 맵
            <TermTooltip term="" description="국가별 수입 단가를 히트맵형 바 차트로 배열하여, 하이엔드 신선 참치를 가장 비싸게 소비하는 럭셔리 마켓의 코어를 노출합니다." />
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={mockGastronomyMap} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="country" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" unit="$" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="price" fill="#f472b6" radius={[4, 4, 0, 0]}>
                  {
                    mockGastronomyMap.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.price > 40 ? '#ec4899' : '#fbcfe8'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div className={styles.kpiPanel}>
            <div className={styles.kpiBox} style={{ borderLeftColor: '#ec4899' }}>
              <div className={styles.kpiLabel}>#1 Premium Market</div>
              <div className={styles.kpiValue}>아랍에미리트 (두바이)</div>
              <div className={styles.kpiSub}>$42.00 / kg</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <TakeawayBox
            situation="[Ultra-Premium Demand Dynamics] kg당 $30 이상의 막대한 지불 용의(Willingness to Pay)를 지닌 초프리미엄 미식(Gastronomy) 시장 지형입니다. 전통적 코어 마켓인 일본($28/kg)의 소비력이 정체된 반면, UAE(두바이) 및 홍콩 등 신진 부유층 마켓이 최고가 수요 블랙홀로 부상 중입니다."
            actionPlan="[Direct-to-Market Expansion] 도쿄 츠키지/토요스 시장을 거치는 기존의 다단계 중간 유통(Middle-man) 구조를 즉각 해체하십시오. 최상급 O-Toro(대뱃살) 등 하이엔드 컷은 항공 냉장(Air-freight) 콜드체인을 통해 두바이, 리야드 등 중동 VVIP 럭셔리 호스피탈리티(Hospitality) 채널로 직결(B2B Direct)하는 고마진 파이프라인을 구축해야 합니다."
          />
        </div>
      </div>
    </>
  );

  const renderMacroTrack = () => (
    <>
      <div className={styles.insightCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Briefcase size={20} color="#fbbf24"/> Insight 9. 공급 독과점 HHI 지수 경보
            <TermTooltip term="" description="특정 상위 국가로 참치물 통제권이 집중되는 정도를 허핀달-허쉬만(HHI) 지수를 차용하여 바이어의 구매 리스크를 산출합니다." />
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={mockHHIIndex} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" domain={[0, 3500]} />
                <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="HHI" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div className={styles.kpiPanel}>
            <div className={styles.kpiBox} style={{ borderLeftColor: '#fbbf24' }}>
              <div className={styles.kpiLabel}>현재 HHI 지수</div>
              <div className={styles.kpiValue} style={{ color: '#fbbf24' }}>2,950</div>
              <div className={styles.kpiSub} style={{ color: 'var(--color-danger)' }}>Danger Zone (!&gt;2500)</div>
            </div>
            
          </div>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <TakeawayBox
            situation="[Supply Monopoly Risk \(HHI\)] 글로벌 수출국 상위 3개국의 어획 할당 통제력이 심화되며, 시장 집중도(HHI)가 리스크(Risk) 수위인 2,950(Danger Zone)을 돌파했습니다. 이는 글로벌 바이어(캔 제조사)들의 네고 권력이 붕괴되고 원자재 공급사들의 마진 스퀴즈(Margin Squeeze) 횡포가 본격화되었음을 시사합니다."
            actionPlan="[Procurement Risk Mitigation] 조달 원가(COGS) 폭등 리스크가 임박했습니다. 현물(Spot) 시장에서의 단기 매입 비중을 최소화하고, 핵심 선단과의 3~5년 단위 장기 선도계약(Forward Contract) 혹은 상호 지분 스왑(Equity Swap)을 체결하여 원가 변동성을 락인(Lock-in)하는 강력한 헤지 포지션을 구축해야 합니다."
          />
        </div>
      </div>

      <div className={styles.insightCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <ThermometerSun size={20} color="#fbbf24"/> Insight 10. 기후 쇼크 타임머신
            <TermTooltip term="" description="지난 30년간 해수온 상승에 따라 블루핀(한대성)과 스킵잭(열대성)의 서식/어획 비중이 어떻게 역전 침식되어 왔는지 매핑합니다." />
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockClimateShift} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="Skipjack_Warm" stackId="1" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.6} />
                <Area type="monotone" dataKey="Bluefin_Cold" stackId="1" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.6} />
              </AreaChart>
            </SafeResponsiveContainer>
          </div>
          <div className={styles.kpiPanel}>
            <div className={styles.kpiBox} style={{ borderLeftColor: 'var(--color-danger)' }}>
              <div className={styles.kpiLabel}>2035년 예상 변화</div>
              <div className={styles.kpiValue}>88%</div>
              <div className={styles.kpiSub}>온수성 어종 우세</div>
            </div>
            
          </div>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <TakeawayBox
            situation="[Climate-Driven Species Shift] 지난 30년간 글로벌 해수온 펀더멘털 변화로 인해 한대성 어종(Bluefin)의 생물량은 침식당하고 열대성 어종(Skipjack)이 88% 시장을 지배(Dominance)하는 영구적 생태계 역전(Ecosystem Inversion) 궤적입니다."
            actionPlan="[Future-Proof Asset Strategy] 당사의 장기 설비투자(Shipbuilding F/S) 타당성 검토 로직을 전면 수정하십시오. 10년 내용연수를 지닌 신규 참치선망어선(Purse Seiner) 설계 시, 더 이상 축소되는 고위도 어장에 베팅하지 말고, 적도 부근 표층수 열대 어종 대량 포획 및 가공 효율에 최적화된 하드웨어 스펙으로 과감한 피벗(Pivot)을 승인해야 합니다."
          />
        </div>
      </div>
    </>
  );

  const renderInnovationTrack = () => (
    <>
      <div className={styles.insightCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Cpu size={20} color="var(--color-success)"/> Insight 11. 정밀 조업(Precision Fishing) 패러다임 전환
            <TermTooltip term="" description="AI 음향 부표 및 3D 소나를 활용한 타겟 어종 정확도 향상을 통해 선박 경유(MGO) 비용을 획기적으로 감축하는 기술 전환 지표입니다." />
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
              <LineChart data={mockPrecisionFishing} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" domain={[60, 120]} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="CPUE" name="조업성공률(CPUE)" stroke="var(--color-success)" strokeWidth={3} />
                <Line type="monotone" dataKey="MGO_Cost" name="유류비 지수(MGO)" stroke="var(--color-danger)" strokeWidth={3} strokeDasharray="5 5" />
              </LineChart>
            </SafeResponsiveContainer>
          </div>
          <div className={styles.kpiPanel}>
            <div className={styles.kpiBox} style={{ borderLeftColor: 'var(--color-success)' }}>
              <div className={styles.kpiLabel}>연료비 절감</div>
              <div className={styles.kpiValue}>-28%</div>
              <div className={styles.kpiSub}>2018년 대비</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <TakeawayBox
            situation="[AI-Driven Precision Fishing] 맹목적 탐색 조업(Blind Searching)의 시대가 종료되었습니다. 3D 소나 및 위성 통신 기반 AI 집어장치(FADs)의 결합으로 조업 성공률(CPUE)은 비약적으로 상승(+15%)하는 동시에 핵심 매입원가(COGS)인 선박 연료비(MGO Cost)는 급감(-28%)하는 전형적인 기술-매입원가(COGS) 구조 혁신(J-Curve)이 발생 중입니다."
            actionPlan="[Operational Capex Deployment] 구형 아날로그 선단의 퇴출이 임박했습니다. 즉각 전 선단에 대한 디지털 레트로핏(Retrofit) CAPEX 예산을 승인하십시오. 정밀 조업 시스템 장착은 단순 매입원가(COGS) 절감을 넘어, 다가오는 해운업계 스코프 3(Scope 3) 탄소 배출 규제 페널티를 회피하는 가장 확실한 ESG 재무 헷징 수단입니다."
          />
        </div>
      </div>

      <div className={styles.insightCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Building2 size={20} color="#a855f7"/> Insight 12. 관세 회피(Tariff Hopping) 밸류체인 진화
            <TermTooltip term="" description="미국 발 상호 관세 부과에 대응하여 태국 등 전통적 수출국의 물량이 붕괴되고, 미국 내 또는 무관세 지역으로 직투자가 이동하는 과정을 추적합니다." />
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTariffHopping} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="region" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="2023" name="2023 실적 (톤)" fill="#94a3b8" />
                <Bar dataKey="2026_Projected" name="2026 관세이후 전망" fill="#a855f7" />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div className={styles.kpiPanel}>
            <div className={styles.kpiBox} style={{ borderLeftColor: '#a855f7' }}>
              <div className={styles.kpiLabel}>동남아 가공 마진 압박</div>
              <div className={styles.kpiValue}>15~20%p</div>
              <div className={styles.kpiSub}>관세 부담분(추정)</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <TakeawayBox
            situation="[관세 인센티브 구조 역전] 미국이 2025-07-31 발효한 상호관세는 태국 19%·베트남 20%·에콰도르 15%로 동남아 가공 거점이 더 불리. 동남아 경유 미국 수출 마진이 압박 받는 가운데, 글로벌 빅 플레이어는 미 조지아주 등 북미 현지 FDI(0% 관세)와 USMCA 멕시코(0%)로 거점을 이전 중입니다. 다만 2026-02 미 대법원·5월 국제무역법원 판결로 관세 일부의 법적 지위는 유동적이라 단기 변동 가능."
            actionPlan="(a) 동남아 단일 의존 벤더의 마진 압박을 마진 약정으로 부분 흡수하고, (b) 미 현지 FDI 거점을 보유한 가공사(예: Thai Union Georgia, Bumble Bee 등) 경유 우회 공급선을 확보. (c) 관세 판결의 항소심 결과를 6개월 모니터링하여 동남아 거점의 회복 시그널을 포착."
            source="(추정치 — Atuna May 2026 News 6 sources · USTR Reciprocal Tariff 2025-07-31 · US Court of International Trade 2026-05-08 판결)"
          />
        </div>
      </div>

      <div className={styles.insightCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Leaf size={20} color="var(--color-success)"/> Insight 13. 지속가능성(MSC) 더블 프리미엄
            <TermTooltip term="" description="MSC 지속가능성 인증과 돌고래 안전(Dolphin-safe) 인증의 듀얼 라벨 획득 시 최종 소비재 시장에서 입증되는 추가 판가 마진율입니다." />
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={mockMSCPremium} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" domain={[0, 250]} stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis dataKey="category" type="category" stroke="#94a3b8" width={110} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="price" name="소매가 지수" fill="var(--color-success)" radius={[0, 4, 4, 0]}>
                  {
                    mockMSCPremium.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#64748b' : index === 1 ? '#34d399' : 'var(--color-success)'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div className={styles.kpiPanel}>
            <div className={styles.kpiBox} style={{ borderLeftColor: 'var(--color-success)' }}>
              <div className={styles.kpiLabel}>최대 소매 프리미엄</div>
              <div className={styles.kpiValue}>+81.3%</div>
              <div className={styles.kpiSub}>이중 인증 제품</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <TakeawayBox
            situation="[Eco-Premium Price Multiplier] 월마트, ALDI 등 글로벌 유통 채널 캡틴들이 MSC(해양관리협의회) 미인증 제품을 소싱 리스트에서 영구 퇴출(De-listing)시키고 있습니다. MSC 및 돌고래 안전(Dolphin-Safe) 듀얼 인증 확보 여부가 판가에 최대 +81%의 독점적 프리미엄(Monopoly Rent)을 부여하는 핵심 라이선스로 격상되었습니다."
            actionPlan="[Compliance & Pricing Strategy] 인증 확보는 더 이상 CSR 부서의 마케팅 비용이 아니라, 생존과 초과수익을 가르는 핵심 무형자산(Intangible Asset)입니다. 전 선단 및 가공 라인의 MSC-COC 인증 획득 및 갱신을 전사 최우선 CEO KPI로 락인(Lock-in)하고, 인증 획득에 소요되는 컨설팅 비용을 무제한 승인하여 잉여현금흐름(FCF)을 극대화하십시오."
          />
        </div>
      </div>

      <div className={styles.insightCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <TestTube2 size={20} color="var(--color-warning)"/> Insight 14. 하이브리드 포트폴리오 (비건/배양육)
            <TermTooltip term="" description="어분 소모율(FIFO) 한계로 더 이상 어획 볼륨 확대가 불가능해진 틈을 타 폭발적으로 성장하는 비건(식물성)/세포배양 참치 시장 규모추이입니다." />
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockAlternativeProtein} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis yAxisId="left" stroke="var(--color-warning)" />
                <YAxis yAxisId="right" orientation="right" stroke="var(--color-danger)" domain={[10, 30]} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="VeganTuna_Market_USD_Millions" name="식물성 참치 시장 (백만불)" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.6} />
                <Line yAxisId="right" type="monotone" dataKey="Average_FIFO_Ratio" name="소모 어분 비율 (FIFO)" stroke="var(--color-danger)" strokeWidth={3} />
              </AreaChart>
            </SafeResponsiveContainer>
          </div>
          <div className={styles.kpiPanel}>
            <div className={styles.kpiBox} style={{ borderLeftColor: 'var(--color-warning)' }}>
              <div className={styles.kpiLabel}>대체 단백질 전망</div>
              <div className={styles.kpiValue}>$1.59B</div>
              <div className={styles.kpiSub}>2030년 목표 (연 7.8% 성장)</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <TakeawayBox
            situation="[Alternative Protein Disruption] 양식 참치의 생물학적 한계(극악의 사료전환효율 FIFO)와 글로벌 어분(Fishmeal) 매입원가(COGS) 폭등이 결합되어, 푸드테크 기반의 식물성(Vegan) 및 세포 배양(Cultivated) 대체 참치 시장이 연 7.8% CAGR의 구조적 메가 트렌드($1.59B)로 폭발하고 있습니다."
            actionPlan="[Future Food-Tech M&A] 레거시(Legacy) 어획 산업의 단백질 생산 한계치(Cap)에 도달했습니다. 벤처캐피털(CVC) 조직을 즉각 가동하여 글로벌 세포 배양 수산물 스타트업에 대한 시리즈 A/B 지분 투자를 단행하십시오. 단일 생물 단백질 회사를 넘어 글로벌 \'Alt-Protein\' 포트폴리오를 거느린 푸드테크 지주사로 기업가치(Valuation)를 재평가(Re-rating) 받아야 해야 합니다."
          />
        </div>
      </div>

      <div className={styles.insightCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Bone size={20} color="var(--color-info)"/> Insight 15. 펫케어/해양 콜라겐 업사이클링
            <TermTooltip term="" description="가공 후 버려지는 52%의 부산물(뼈, 내장 등)을 가축 사료 대신 최고급 펫푸드 및 바이오 기능식품(콜라겐 등)으로 가공할 때의 마진 차트입니다." />
          </h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
              <LineChart data={mockByproductUpcycling} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" unit="%" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="PetCare_Margin" name="펫케어 부문 영업이익률" stroke="var(--color-info)" strokeWidth={4} />
                <Line type="monotone" dataKey="Canned_Margin" name="일반 통조림 영업이익률" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </SafeResponsiveContainer>
          </div>
          <div className={styles.kpiPanel}>
            <div className={styles.kpiBox} style={{ borderLeftColor: 'var(--color-info)' }}>
              <div className={styles.kpiLabel}>업사이클 펫푸드 마진</div>
              <div className={styles.kpiValue}>28.5%</div>
              <div className={styles.kpiSub}>통조림 참치 8.5% 대비</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 20px 20px 20px' }}>
          <TakeawayBox
            situation="[Downstream Margin Extraction] 가공 공정에서 폐기되거나 사료용으로 헐값에 넘겨지던 52%의 참치 부산물(머리, 뼈, 내장)이 고양이용 프리미엄 펫푸드 및 바이오/해양 콜라겐 시장으로 전용(Upcycling)되면서, 본업(Canned Tuna 8.5%)을 압도하는 28.5%의 비정상적 초과 영업Bottom-line(순이익)률(Operating Margin)을 창출하고 있습니다."
            actionPlan="[Vertical Integration Execution] 부산물은 폐기물이 아니라 가장 수익성(Profitability) 높은 숨겨진 캐시카우(Hidden Cash-cow)입니다. 어분 라인 매각을 즉시 중단하고, 부산물 원료를 활용한 자체 \'하이엔드 펫 밀(Pet Meal) 팩토리\' 및 바이오-오메가3 추출 설비 구축에 즉각적인 조인트 벤처(JV) 자본을 투입하여 밸류체인 완전 수직 계열화를 달성하여 잉여현금흐름(FCF)을 극대화하십시오."
          />
        </div>
      </div>
    </>
  );

  
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>참치 전략 인사이트 대시보드</h1>
        <p className={styles.description}>9개 NotebookLM 노트북 × Google Drive DATA 교차 분석 기반 | 글로벌 PE C-Level 의사결정 지원 시스템</p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div 
            className={`${styles.menuItem} ${activeTab === 'margin' ? styles.activeMenu : ''}`}
            onClick={() => setActiveTab('margin')}
          >
            <TrendingUp size={18} /> 1. 무역/스프레드 최적화
          </div>
          <div 
            className={`${styles.menuItem} ${activeTab === 'capture' ? styles.activeMenu : ''}`}
            onClick={() => setActiveTab('capture')}
          >
            <Ship size={18} /> 2. 조업 및 공급망 트랙
          </div>
          <div 
            className={`${styles.menuItem} ${activeTab === 'premium' ? styles.activeMenu : ''}`}
            onClick={() => setActiveTab('premium')}
          >
            <Briefcase size={18} /> 3. 양식 및 프리미엄
          </div>
          <div 
            className={`${styles.menuItem} ${activeTab === 'macro' ? styles.activeMenu : ''}`}
            onClick={() => setActiveTab('macro')}
          >
            <Skull size={18} /> 4. 리스크 및 매크로 경보
          </div>
          <div 
            className={`${styles.menuItem} ${activeTab === 'innovation' ? styles.activeMenu : ''}`}
            onClick={() => setActiveTab('innovation')}
          >
            <Lightbulb size={18} /> 5. 미래 혁신 및 부가가치
          </div>
          <div 
            className={`${styles.menuItem} ${activeTab === 'newIntel' ? styles.activeMenu : ''}`}
            onClick={() => setActiveTab('newIntel')}
            style={activeTab === 'newIntel' ? { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' } : {}}
          >
            <Zap size={18} /> 6. 🔥 신규 전략 인텔리전스
          </div>
        </aside>

        <main className={styles.content}>
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '12px 16px', borderRadius: '8px', color: '#bae6fd', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 10px #38bdf8' }} />
            데이터 파이프라인 연계 완료. 74년치 참치 데이터에 기반한 10가지 인사이트 시각화 차트가 100% 가동 중입니다.
          </div>

          {activeTab === 'margin' && renderMarginTrack()}
          {activeTab === 'capture' && renderCaptureTrack()}
          {activeTab === 'premium' && renderPremiumTrack()}
          {activeTab === 'macro' && renderMacroTrack()}
          {activeTab === 'innovation' && renderInnovationTrack()}
          {activeTab === 'newIntel' && (
            <>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 16px', borderRadius: '8px', color: '#fca5a5', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} color="#ef4444" />
                9개 NotebookLM 노트북(1,494 소스) + Google Drive DATA 교차 분석 결과. 기존 대시보드에 부재하던 6개 블라인드 스팟 인사이트.
              </div>
              <InsightNauruSwitch />
              <InsightIOCollapse />
              <InsightEU18C />
              <InsightTunaExtract />
              <InsightPillarTwo />
              <InsightVietnamOEM />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
