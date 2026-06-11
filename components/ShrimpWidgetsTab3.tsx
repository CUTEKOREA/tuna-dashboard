import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, ReferenceLine, Tooltip as RechartsTooltip, Cell, PieChart, Pie } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Globe, Anchor, TrendingUp, DollarSign, Layers, Factory, Activity, Target, Scale, Truck, ShoppingCart, Flag, ShieldCheck, PieChart as PieChartIcon, Settings, RefreshCw, BarChart2, Briefcase, Flame, Cog, AlertTriangle, DivideSquare, Compass, Link, RefreshCcw } from 'lucide-react';
import { WidgetCard, tooltipStyle, COLORS } from './ShrimpWidgetCommon';
import { koreaImportTimeline, koreaSelfSufficiency, unitPriceExport } from './ShrimpDataHelper';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

// W21: KoreaImportTimeline
export const W21_KoreaImpTimeline = () => (
  <WidgetCard title="한국 새우 연간 수입 톤수 추이" icon={Target} term="Korea Import Yield" desc="1994년 이후 국내 도입 물량선 (톤)" source="FAOSTAT 수산 무역 — 한국 수입 물량 시계열(1994~2023)" situation="대한민국 새우 수입 물량은 2000년대 이후 구조적 성장기를 거치며 우상향 추세를 보였고, 2023년 기준 약 96,299톤 수준입니다." actionPlan="[조달 규모 우위 확보] 자본력 기반의 바잉 파워(Buying Power)를 활용해 프랜차이즈·대형 외식 B2B 공급 라인을 확대하고, 물량 기반 협상력으로 안정적 매입 단가를 확보하는 것을 검토하십시오." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <AreaChart data={koreaImportTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} interval={0} tick={{ fontSize: 10 }} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="value" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.3} />
      </AreaChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W22: KoreaSelfSuff
export const W22_KoreaSelfSuff = () => (
  <WidgetCard title="대한민국 자급률 (Self-sufficiency)" icon={ShieldCheck} term="Korea Self-Sufficiency" desc="국내 생산 / (국내 생산 + 수입) 산출 (%)" source="FAOSTAT 한국 생산량·수입량 기반 자체 산출 (2023: 생산 27,906톤 / 수입 96,299톤)" situation={`[자급 기반 취약] 2023년 기준 국내 새우 자급률은 ${koreaSelfSufficiency}%로, 소비 물량의 대부분을 수입에 의존하고 있어 환율·해외 산지 가격 변동에 대한 노출도가 높은 구조입니다.`} actionPlan="[자급 기반 투자 검토] 수입 의존도를 낮추기 위해 스마트 바이오플락(Bio-floc) 육상 양식 R&D 투자와 국내 무균 프리미엄(SPF) 라인업의 부분적 수직 자립화를 단계적으로 검토하십시오." telemetry={{ status: 'STATIC' }}>
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', padding: '0 20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#f8fafc' }}>
          <span>국내 조업/양식 자급</span>
          <span>수입산 완전 의존도</span>
        </div>
        <div style={{ height: '30px', background: 'var(--color-danger)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: `${koreaSelfSufficiency}%`, height: '100%', background: 'var(--color-success)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontWeight: 'bold', textShadow: '0 0 4px #000' }}>
            자급 {koreaSelfSufficiency}% / 수입 {(100-koreaSelfSufficiency).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  </WidgetCard>
);

// W23: KoreaUnitPrice
export const W23_KoreaUnitPrice = () => {
  // Top-5 exporter unit prices (export USD / qty) — NOT Korea import prices
  const koreaCompare = unitPriceExport.slice(0, 5);
  return (
    <WidgetCard title="주요 수출국 단가 비교 (2023)" icon={DollarSign} term="Exporter Unit Price" desc="주요 수출국별 수출단가 = 수출액 / 수출물량 (USD/톤, 2023)" source="FAOSTAT 수출액·수출물량 기반 자체 산출 단가 — 한국 매입가는 별도 데이터 미확보" situation="2023년 기준 주요 수출국 단가는 에콰도르 약 5,943, 인도 6,850, 베트남 8,456 USD/톤 수준으로 산지별 편차가 큽니다. 본 차트는 수출국 단가만 표시하며, 한국 매입 단가와의 직접 비교 데이터는 확보되지 않아 한국 프리미엄/페널티 여부는 단정할 수 없습니다." actionPlan="[직거래 단가 검증] 종합상사 경유 구조를 점검하고, 베트남 까마우(Ca Mau) 등 주요 산지의 수출 단가를 자체 매입 단가와 직접 대조해 유통 마진 누수 여부를 실측·검증한 뒤 다이렉트 소싱을 검토하십시오." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={koreaCompare} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="country" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${v}`} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Bar dataKey="price" fill="var(--color-warning)" radius={[4,4,0,0]} />
        </ComposedChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W24: AsiaImpCompare
export const W24_AsiaImpCompare = () => {
  // 한국=2023 실수입 96,299톤(FAOSTAT). 일본·대만은 자체 추정(illustrative) 예시값
  const asiaImp = [
    { name: '일본', value: 180000 },
    { name: '한국', value: 96299 },
    { name: '대만', value: 45000 }
  ];
  return (
    <WidgetCard title="동북아 새우 소비 규모 비교" icon={Flag} term="Asia Consumption" desc="한/일/대만 수입 물량 비교 (톤) — 한국 실측, 일본·대만 자체 추정" source="한국=FAOSTAT 2023 수입(96,299톤). 일본·대만=업계 자체 추정(illustrative, 1차 출처 미확보)" situation="2023년 한국 새우 수입은 약 96,299톤(FAOSTAT 실측)이며, 일본·대만 수치는 업계 자체 추정 예시값입니다. 동북아 주요 소비국 간 규모 차이를 가늠하기 위한 참고용 비교입니다." actionPlan="[고부가 물량 선점] 일본향 고품질 라인(빵가루새우, 초밥용 나비새우)을 공급하는 상위 산지 물량을 확보해, 국내 하이엔드 외식 채널 공급 기반을 단계적으로 넓히는 방안을 검토하십시오." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <BarChart data={asiaImp} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
          <YAxis dataKey="name" type="category" width={50} stroke="#94a3b8" fontSize={11} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" fill="#06b6d4" radius={[0,4,4,0]}>
            {asiaImp.map((e,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
          </Bar>
        </BarChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W25: KoreaImpInflection
export const W25_KoreaImpInflection = () => {
  // 자체 추정(illustrative) 예시 데이터 — 정밀 시계열 아님, 추세 도식용 (천톤)
  const data = [
    { year: '00', vol: 20 }, { year: '05', vol: 35 }, { year: '10', vol: 45 },
    { year: '15', vol: 60 }, { year: '20', vol: 80 }, { year: '22', vol: 92 }
  ];
  return (
    <WidgetCard title="한국 수입 3단계 인플렉션(Inflection)" icon={Activity} term="Import Inflection" desc="수입 증가 변곡점 도식 (천톤) — 자체 추정 예시 데이터" source="추세 도식용 자체 추정(illustrative) — 1차 시계열 출처 미확보" situation="2000년대 이후 수입이 우상향한 배경으로는 1) FTA 무관세 발효 2) 미디어 먹방 확산 3) HMR/밀키트 확대가 거론됩니다. 본 차트의 수치는 추세를 도식화한 자체 추정 예시값으로, 정밀 검증된 시계열은 아닙니다." actionPlan="[IQF 조달 비중 확대] HMR 수요 확대에 대응해 블록 냉동 위주의 조달 비중을 낮추고, 즉시 투입 가능한 개별급속냉동(IQF) 포트폴리오 비중을 단계적으로 늘리는 방안을 검토하십시오." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="vol" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
          <ReferenceLine x="15" stroke="var(--color-success)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'HMR 붐', fill: 'var(--color-success)', fontSize: 10 }} />
        </AreaChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W26: KoreaConsMix
export const W26_KoreaConsMix = () => {
  // 자체 추정(illustrative) 채널 비중 — 특정 보고서·연도 미확인
  const data = [
    { name: 'HMR/밀키트', value: 45 }, { name: '외식 B2B', value: 35 }, { name: '가정 소매', value: 20 }
  ];
  return (
    <WidgetCard title="국내 소비 믹스(Consumption Mix)" icon={PieChartIcon} term="Market Mix" desc="수입 새우의 최종 소비 채널 비중 (%) — 자체 추정 예시" source="업계 자체 추정(illustrative) — 특정 보고서·연도 미확인, 1차 출처 추적 불가" situation="국내 새우 소비는 B2B 외식 중심에서 B2C HMR/밀키트(이마트 트레이더스·쿠팡 등)로 무게중심이 이동하는 흐름으로 추정됩니다. 표시된 채널 비중은 검증된 1차 통계가 아닌 자체 추정 예시값입니다." actionPlan="[B2C·DTC 채널 강화] HMR 수요 확대에 맞춰 컬리·쿠팡향 소분 패키징 라인 구축을 검토하고, 채널별 마진을 비교해 B2C 직접 소비자(DTC) 비중을 점진적으로 확대하는 전략을 검토하십시오." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="rgba(0,0,0,0)" label={({name, percent}: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 10 }}>
            {data.map((entry: any, index: number) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <RechartsTooltip contentStyle={tooltipStyle} />
        </PieChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W27: KoreaFTABenefit
export const W27_KoreaFTABenefit = () => {
  // 관세율은 협정 개요 기반 하드코딩 예시값 — 실제 적용세율은 HSK 10자리·협정 양허표 확인 필요
  const data = [
    { origin: '베트남 (VKFTA)', tariff: 0 },
    { origin: '인도 (CEPA 단서)', tariff: 5 },
    { origin: '에콰도르 (미체결)', tariff: 20 }
  ];
  return (
    <WidgetCard title="FTA 무관세 혜택 비교" icon={ShieldCheck} term="Tariff Defense" desc="국가별 새우(HS 0306) 적용 관세율 비교 (%) — 협정 개요 기반 예시값" source="HS 0306 분류 기준 협정 개요 인용 — 관세율은 하드코딩 예시(협정 양허표 직접 인용 아님)" situation="새우(HS 0306) 수입에서 VKFTA 발효로 베트남산은 무관세 적용을 받는 반면, 미체결국은 기본 관세가 유지되는 구조입니다. 표시된 관세율은 협정 개요 기반 예시값으로, 정확한 적용세율은 HSK 10자리·협정 양허표로 확인해야 합니다." actionPlan="[관세 시나리오 대비] 에콰도르 SECA 등 신규 협정이 타결되면 남미산 매입 여건이 개선될 수 있으므로, 협정 진행 상황을 모니터링하며 산지 다변화 시나리오를 사전에 준비하십시오." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `${v}%`} />
          <YAxis dataKey="origin" type="category" width={80} stroke="#94a3b8" fontSize={10} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Bar dataKey="tariff" name="관세율(%)" radius={[0, 4, 4, 0]}>
            {data.map((e,i) => <Cell key={i} fill={e.tariff === 0 ? 'var(--color-success)' : 'var(--color-danger)'} />)}
          </Bar>
        </BarChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W28: KoreaPremiumGap
export const W28_KoreaPremiumGap = () => {
  // 자체 추정(illustrative) 예시 단가 — 한/일 매입가 비교 도식용 (USD/kg)
  const data = [{ item: '에콰도르산 통마리', krPrice: 6.5, jpPrice: 6.8 }];
  return (
    <WidgetCard title="한·일 매입 단가 비교" icon={DollarSign} term="Country Price Compare" desc="동일 원물 한·일 매입 단가 비교 (USD/kg) — 자체 추정 예시" source="한·일 단가 비교 자체 추정(illustrative) — 검증된 거래 단가 출처 미확보" situation="표시된 예시 데이터에서는 동일 원물(에콰도르산 통마리)의 한국 매입가(6.5)가 일본 매입가(6.8)보다 다소 낮게 나타납니다. 단, 이는 검증된 1차 거래 단가가 아닌 자체 추정 예시값으로, 한국이 프리미엄을 지불한다고 단정할 근거는 없습니다." actionPlan="[매입 단가 실측 검증] 한·일 매입 단가의 실제 격차를 추정에 의존하지 말고, 동일 사이즈·산지 기준 거래 단가를 직접 수집·대조해 협상 포지션을 객관적으로 점검한 뒤 블록 딜 여부를 판단하십시오." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="item" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${v}`} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="krPrice" name="한국수입가" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="jpPrice" name="일본수입가" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W29: KoreaTradeBal
export const W29_KoreaTradeBal = () => {
  // FAOSTAT 2023 실측 물량: 수입 96,299톤 / 수출 1,513톤 (천톤 단위 표기)
  const data = [{ year: '2023', imp: 96.3, exp: 1.5 }];
  return (
    <WidgetCard title="한국 새우 무역수지(Trade Balance)" icon={Scale} term="Trade Balance" desc="수입 물량 vs 수출 물량 (천톤, 2023)" source="FAOSTAT 한국 수산 무역 물량 (2023: 수입 96,299톤 / 수출 1,513톤)" situation="2023년 한국 새우 무역은 수입 약 96,299톤(천톤 96.3) 대 수출 약 1,513톤(천톤 1.5)으로, 수입 일변도의 구조적 물량 적자가 뚜렷합니다." actionPlan="[가공 역수출 검토] 수입 원물에 부가가치를 더해 재수출하는 모델을 검토하십시오. 국내 가공으로 K-안주·간편식으로 밸류업한 뒤, 미주 교민 마켓(H-Mart 등) 등을 대상으로 한 역수출 라인의 채산성을 점검하십시오." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} />
          <YAxis dataKey="year" type="category" width={40} stroke="#94a3b8" fontSize={11} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="imp" name="수입(천톤)" fill="var(--color-danger)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="exp" name="수출(천톤)" fill="var(--color-success)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W30: KoreaImpVsGDP
export const W30_KoreaImpVsGDP = () => {
  // 2015=100 기준 지수 — 자체 추정(illustrative) 예시값, 실 시계열 매시업 미검증
  const data = [
    { year: '15', gdp: 100, imp: 100 }, { year: '20', gdp: 115, imp: 145 }, { year: '23', gdp: 122, imp: 170 }
  ];
  return (
    <WidgetCard title="한국 경제성장률 대비 수입 팽창 속도" icon={TrendingUp} term="GDP Decoupling" desc="GDP 지수 vs 새우 수입 지수 (2015=100) — 자체 추정 예시" source="2015=100 기준 자체 추정(illustrative) 지수 — 검증된 GDP·통관 시계열 매시업 아님" situation="표시된 예시 지수에서는 새우 수입 지수가 GDP 지수보다 빠르게 상승하는 모습이 나타나, 경기 흐름과 일정 부분 탈동조화하는 경향을 시사합니다. 단, 수치는 자체 추정 예시값으로 정밀 검증된 시계열은 아닙니다." actionPlan="[경기방어 수요 점검] 새우 수요가 경기 둔화 국면에서도 비교적 견조한지 실제 소비·수입 시계열로 검증한 뒤, 경기방어 성격이 확인되면 밸류체인 투자 비중 조정을 검토하십시오." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} domain={[80, 200]} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="gdp" name="GDP Index" stroke="#64748b" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="imp" name="Shrimp Import Index" stroke="#8b5cf6" strokeWidth={3} />
        </LineChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};
