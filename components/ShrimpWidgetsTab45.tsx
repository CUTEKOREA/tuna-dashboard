import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Legend, ReferenceLine, Tooltip as RechartsTooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Anchor, Layers, Factory, Target, ShieldCheck, BarChart2, Cog, AlertTriangle, DivideSquare, Compass } from 'lucide-react';
import { WidgetCard, tooltipStyle } from './ShrimpWidgetCommon';
import { processedTimeline, top10Processed, processingRatio } from './ShrimpDataHelper';
import { ChartPatternDefs } from './ChartPatterns';

// W41: ProcTimeline
export const W41_ProcTimeline = () => (
  <WidgetCard title="가공식품화(Processing) 물동량 추이" icon={Factory} term="Processed Timeline" desc="가공 처리 물동량(톤) 연도별 추이 — FAOSTAT 가공 도메인 파생" source="FAOSTAT 수산 가공 도메인(연도별 가공 물동량 파생, STATIC 2026-05-29)" situation="단순 1차 원물(Raw Commodity) 시장을 벗어나, 글로벌 HMR(가정간편식) 수요 확대와 맞물려 가공(Processed Value-Add) 제품군의 물동량(톤)이 장기 우상향 추세를 보이고 있습니다." actionPlan="[R&D CAPEX 재배분] 구시대적 원양어선 수리 위주 CAPEX 비중을 축소하고, R&D 예산을 고부가가치 소스 배합 및 튀김(Batter & Breading) 공정 등 가공 역량 확보에 우선 배분하여 가공식품 사업으로의 점진적 피벗을 검토해야 합니다." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <AreaChart data={processedTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
      </AreaChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W42: ProcTop10
export const W42_ProcTop10 = () => (
  <WidgetCard title="공장제 가공 파워보드 Top 10" icon={Cog} term="Processing Top" desc="공장 설비로 마진을 쥐어짜는 핵심국가 리스트" source="FAO Processed by Country" situation="동남아시아 3국(태국, 베트남, 인니)의 저임금-고숙련(Low-cost, High-skilled) 노동 집약 클러스터가 글로벌 수작업 탈각(Peeling) 프로세싱 밸류체인을 완벽히 초토화 및 독식했습니다." actionPlan="[Cross-Border M&A Strategy] 한국의 살인적 포장 인건비(Labor Cost)로는 영업이익(OPM) 방어가 불가능합니다. 베트남 및 인니의 GMP/HACCP 인증을 기보유한 한계 기업(Distressed Assets)을 헐값에 공격적 인수합병(Bolt-on M&A)하여 아시아 전진 가공 기지(Processing Hub)로 즉시 재편." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={top10Processed} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
        <YAxis dataKey="country" type="category" width={80} stroke="#94a3b8" fontSize={11} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="var(--color-info)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W43: ProcRatio
export const W43_ProcRatio = () => (
  <WidgetCard title="원물 대비 가공 처리 비율" icon={DivideSquare} term="Process/Prod Ratio" desc="가공 처리량 ÷ 원물 생산량 (%) — 자체 산출 파생 지표" source="자체 산출: FAOSTAT 가공량 ÷ 생산량 비율(%) (STATIC 2026-05-29)" situation="막대한 1차 양식 원물을 쏟아내는 중국/인도와 대조적으로, 선진국(유럽/한국)은 수입 원물을 기반으로 가공(Value-Add Processing) 마진을 수취하는 '부가가치 조립 국가(Assembly Model)' 궤적을 밟고 있습니다." actionPlan="[Fabless Food-Tech Paradigm] 새우 비즈니스를 반도체 팹리스(Fabless) 모델로 격상시키십시오. 에콰도르/인도의 거대 양식장(Foundry)에서 아웃소싱 생산된 1차 원물을 수입하여, 국내 하이엔드 로컬 프리미엄 브랜딩(IP) 및 패키징 기법을 결합하는 '고도화 설계/마케팅' 역량에 전사 자원을 올인." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={processingRatio.slice(0, 5)} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="country" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `${v}%`} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="ratio" name="가공/원물 투입비율" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W44: VertIntegration
export const W44_VertIntegration = () => (
  <WidgetCard title="국가별 원물 생산 vs 가공 처리량 비교" icon={Layers} term="Vertical Integration" desc="국가별 원물 생산(톤)과 가공 처리(톤) 병치 비교 — FAOSTAT 파생" source="FAOSTAT 생산·가공 도메인(국가별 생산량·가공량 파생, STATIC 2026-05-29)" situation="차트는 상위 국가의 원물 생산량(톤)과 가공 처리량(톤)을 병치한 것으로, 가공 처리량이 생산량을 상회하는 국가일수록 수입 원물 기반 가공 의존도가 높음을 시사합니다(기업 단위 수직계열화 데이터는 본 차트에 미포함)." actionPlan="[Defensive Triad Execution] 파편화된 국내 중소 유통망으로는 글로벌 거대 자본의 덤핑 공세(Margin Squeeze)를 방어할 수 없습니다. 신라교역 그룹 차원에서 최소한 [가공 플랜트 - 글로벌 무역 데스크 - 초대형 콜드체인(Cold Chain)]의 3각 코어 인프라를 직영 100% 수직 계열화하여 구조적 해자(Moat)를 구축." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <ComposedChart data={processingRatio.slice(0, 5)} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="country" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="production" name="양식장 생산파워" fill="#64748b" radius={[4, 4, 0, 0]} />
        <Line dataKey="processed" name="스마트팩토리 처리량" stroke="var(--color-success)" strokeWidth={3} dot={{r:4}} />
      </ComposedChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W45: DiseaseRisk
export const W45_DiseaseRisk = () => {
  // Illustrative example data — not sourced time series
  const data = [{y:'10',v:100},{y:'12',v:115},{y:'13',v:60},{y:'15',v:80},{y:'18',v:120},{y:'22',v:145}];
  return (
    <WidgetCard title="EMS/WSSV 질병 리스크 경보" icon={AlertTriangle} term="Disease Collapse" desc="질병 충격 시나리오 개념도 — 자체 추정·예시 데이터(illustrative)" source="자체 추정(illustrative)·예시 데이터 — 1차 출처 미확보" situation="조기폐사증후군(EMS)·백점병(WSSV) 등 양식 질병은 과거 아시아 권역에서 대규모 폐사를 유발한 바 있는 생물학적 꼬리위험(Tail Risk)입니다. 차트의 지수·하락 폭은 검증된 시계열이 아닌 개념 설명용 예시값입니다." actionPlan="[Geographic Hedging Protocol] 양식업 최대 리스크인 팬데믹(WSSV/EHP) 리스크를 원천 봉쇄하십시오. 인도, 베트남, 에콰도르 3개 대륙에 소싱 파이프라인을 33%씩 완벽히 물리적 분산(Geographic Hedging)시켜, 경쟁사 공급망 마비 시 반사이익을 수취하는 시스템을 가동해야 합니다." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="y" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 160]} />
          <ReferenceLine x="13" stroke="var(--color-danger)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'EMS 판데믹 충격', fill: 'var(--color-danger)', fontSize: 10 }} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="v" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.3} />
        </AreaChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W46: ClimateImpact
export const W46_ClimateImpact = () => {
  // Illustrative example data — not a sourced NOAA/FAO merged series
  const data = [{y:'14',t:25.1,v:100},{y:'15',t:26.5,v:85},{y:'16',t:26.8,v:78},{y:'18',t:25.2,v:110},{y:'20',t:25.0,v:125}];
  return (
    <WidgetCard title="엘니뇨(El Nino) 수온-출하량 개념도" icon={Target} term="Climate Risk" desc="수온 상승과 출하량 반비례 개념도 — 자체 추정·예시 데이터(illustrative)" source="자체 추정(illustrative)·예시 데이터 — NOAA MEI·FAO 결합 시계열은 미구현" situation="엘니뇨(El Niño) 발현으로 적도 해수면 온도(SST)가 상승하면 페루 어분(Fishmeal) 매입원가 상승과 양식장 용존 산소량(DO) 저하로 폐사 리스크가 커질 수 있습니다. 차트의 수온·출하량 값은 검증된 관측치가 아닌 관계를 보여주는 예시값입니다." actionPlan="[Algorithmic Climate Hedging] 트레이딩 데스크의 퀀트 지표에 엘니뇨(ENSO) 기상 인디케이터를 최우선 가중치로 연동(Integration)하십시오. 임계치 도달 시, 무관세 혜택을 포기하더라도 즉시 대서양/인도양 등 비(非)태평양 영향권의 대체 물량으로 자동 롤오버(Auto-Rollover)하는 헷징 매뉴얼을 발동해야 합니다." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="y" stroke="#94a3b8" fontSize={11} />
          <YAxis yAxisId="L" stroke="var(--color-danger)" fontSize={11} domain={[24, 27]} />
          <YAxis yAxisId="R" orientation="right" stroke="var(--color-info)" fontSize={11} domain={[60, 140]} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Line yAxisId="L" type="monotone" dataKey="t" name="적도 수온(C)" stroke="var(--color-danger)" strokeWidth={3} />
          <Bar yAxisId="R" dataKey="v" name="양식 출하량" fill="var(--color-info)" opacity={0.6} radius={[4,4,0,0]} />
        </ComposedChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W47: DualSourcing
export const W47_DualSourcing = () => {
  const data = [
    { subject: '가격경쟁력', eq: 95, id: 80, vn: 60 },
    { subject: '가공수준', eq: 40, id: 60, vn: 95 },
    { subject: '관세혜택', eq: 30, id: 80, vn: 100 },
    { subject: '물류거리', eq: 40, id: 70, vn: 95 },
    { subject: '안정성(질병)', eq: 85, id: 65, vn: 70 }
  ];
  return (
    <WidgetCard title="국가별 소싱 역량 정성 평가" icon={Compass} term="Dual Sourcing Radar" desc="5개 축 국가별 소싱 역량 — 자체 정성 평가(0~100 상대 점수)" source="자체 정성 평가(Internal Qualitative Assessment) — 외부 1차 출처 아님, 0~100 상대 스코어 (STATIC 2026-05-29)" situation="에콰도르는 원물 생산능력(Volume)은 우수하나 물류 리드타임과 1차 가공 품질에 약점이 있고, 베트남은 물량 한계에도 0% 무관세 혜택과 높은 가공 역량(Value-Add)을 보유한 비대칭(Asymmetric) 구조입니다(점수는 자체 정성 평가 기준)." actionPlan="[Strategic Portfolio Balancing] 단일 국가 의존형 소싱 체계를 재검토 필요. 무한리필 B2B 및 식자재 마켓에는 에콰도르산 벌크(HLSO) 물량을 투하(Dumping)하고, 하이엔드 오프라인 리테일(초밥/밀키트)에는 베트남산 프리미엄 가공품을 꽂아 넣는 철저한 '투 트랙 듀얼 소싱(Dual-Sourcing)' 포트폴리오를 락인해야 합니다." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.2)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
          <Radar name="에콰도르" dataKey="eq" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.3} />
          <Radar name="인도" dataKey="id" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.3} />
          <Radar name="베트남" dataKey="vn" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.3} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </RadarChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W48: ProcHubROI
export const W48_ProcHubROI = () => {
  // Illustrative assumption — Capex(억원), ROI(연환산 %)
  const data = [{name:'베트남(현지조인트)', cost:45, roi: 85}, {name:'부산(자동화라인)', cost:120, roi: 70}];
  return (
    <WidgetCard title="자동화 프로세싱 허브 셋업 비교(가정치)" icon={Anchor} term="Hub ROI" desc="입지별 초기 투자(억원)·연환산 ROI(%) 가정 비교 — 자체 추정(illustrative)" source="자체 추정(illustrative)·예시 가정치 — 공단 입주비 시뮬레이션 기반, 실측 산출식 미확보" situation="수작업 집약도가 높은 새우 탈각(Peeling)·가공 공정을 인건비가 높은 한국 본토에서 전부 수행하면 영업이익(OPM) 방어가 어려워 자본 잠식 리스크가 커질 수 있습니다. 도표의 투자비·ROI 수치는 검증된 실적이 아닌 예시 가정치입니다." actionPlan="[JV & Tech-Driven QA Hub] 동남아 핵심 파트너사에 소수 지분(Minority Equity) 투자를 단행하여 현지 노동집약 가공 라인을 사실상 직영 통제(Control) 하십시오. 반면 국내에는 AI 비전 스캐닝(Vision Sorter) 기반의 무인화 클린룸 및 최종 QC 패키징 센터만 운용하는 극단적 투트랙(Two-track) 효율화 모델을 셋업해야 합니다." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} />
          <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" fontSize={11} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="cost" name="초기 투하(Capex)" fill="var(--color-danger)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="roi" name="연환산 ROI(%)" fill="var(--color-success)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W49: ValueChainFlow
export const W49_ValueChainFlow = () => {
  // Illustrative margin split (%) — not a sourced cost accounting
  const data = [{step:'종자/사료',v:15}, {step:'양식(원물)',v:35}, {step:'무역/물류',v:10}, {step:'가공/패키지',v:40}];
  return (
    <WidgetCard title="밸류체인 단계별 이윤 귀속(가정치)" icon={BarChart2} term="Margin Flow" desc="가치사슬 단계별 마진 배분(%) — 자체 추정(illustrative)" source="자체 추정(illustrative)·예시 마진 배분 — 1차 원가회계 출처 미확보 (STATIC 2026-05-29)" situation="예시 배분 기준으로 종자/사료(15%)·양식 원물(35%) 단계의 귀속 마진이 상대적으로 낮은 반면, 가공/패키지(40%)와 무역/물류(10%)를 합한 후방 단계에 마진이 더 집중되는 구조를 가정합니다(수치는 검증된 실적이 아닌 예시값)." actionPlan="[Vertical Margin Capture] 이윤 배분의 멱법칙(Power Law)을 활용하십시오. 고마진 2차 가공(Processing) 라인을 자사 캐시카우 코어로 즉각 내부화하고, B2C 최종 소매 콜드체인 터미널에 당사 독자 브랜드(Private Brand) IP를 강력하게 꽂아 넣어 라스트마일 마진을 독식해야 합니다." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v=>`${v}%`} />
          <YAxis dataKey="step" type="category" width={80} stroke="#94a3b8" fontSize={11} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Bar dataKey="v" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W50: StratScorecard
export const W50_StratScorecard = () => {
  const data = [{m:'원가 통제방어력',v:90},{m:'밸류에드 역량',v:40},{m:'소싱 다양성',v:35},{m:'환율/운임 헷지',v:80},{m:'브랜드 침투',v:55}];
  return (
    <WidgetCard title="신라교역 새우 사업 역량 스코어카드" icon={ShieldCheck} term="Strategy Scorecard" desc="5개 역량 축 자체 정성 평가(0~100 상대 점수) — 외부 1차 출처 아님" source="자체 정성 평가(Internal Qualitative Assessment) — 0~100 상대 스코어, AI 요약 산출 아님 (STATIC 2026-05-29)" situation="자체 정성 평가 기준으로, 당사의 원가 통제 방어력과 환율/운임 헷지 역량은 상대적으로 높게 평가되는 반면, 부가가치를 창출하는 자체 브랜드 파워(IP)와 고부가 가공(Value-Add) 역량은 상대적으로 낮게 평가됩니다(점수는 정성 평가 기준이며 정량 지표 집계가 아님)." actionPlan="[Bolt-on M&A & HMR Pivot] 전통적인 원양 1차 벤더(Tier-1)의 비즈니스 한계를 인정하고 껍질을 깨십시오. 즉시 가용 유동성을 총동원하여 푸드테크 기반 가공 스타트업에 대한 공격적 볼트온 M&A(Bolt-on M&A)를 결행하고, HMR 시장 직접 침투(Direct-to-Consumer)에 사활을 걸어야 차세대 밸류에이션 리레이팅이 가능합니다. (Re-rating Expected)" telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.2)" />
          <PolarAngleAxis dataKey="m" tick={{ fill: '#f8fafc', fontSize: 10, fontWeight: 'bold' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
          <Radar name="역량 스코어" dataKey="v" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
          <RechartsTooltip contentStyle={tooltipStyle} />
        </RadarChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};
