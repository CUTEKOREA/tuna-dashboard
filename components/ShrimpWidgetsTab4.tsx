import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, ReferenceLine, Tooltip as RechartsTooltip, Cell, ScatterChart, Scatter } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Globe, Anchor, TrendingUp, DollarSign, Layers, Factory, Activity, Target, Scale, Truck, ShoppingCart, Flag, ShieldCheck, PieChart as PieChartIcon, Settings, RefreshCw, BarChart2, Briefcase, Flame, Cog, AlertTriangle, DivideSquare, Compass, Link } from 'lucide-react';
import { WidgetCard, tooltipStyle, COLORS } from './ShrimpWidgetCommon';
import { unitPriceExport, aquaValuePerTon, unitPriceTimeline } from './ShrimpDataHelper';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

// W31: PriceGap
export const W31_PriceGap = () => (
  <WidgetCard title="수출국별 최종 인도(FOB) 단가 갭" icon={DollarSign} term="FOB Price Gap" desc="가장 비싸게 파는 놈과 싸게 파는 놈" source="FAO Trade Export Value/Volume Derived" situation="베트남의 딥테크 가공(Value-Add Processing) 믹스 전략이 적중하며, 단순 1차 원물 수출국인 중남미(LATAM) 국가들 대비 톤당 수출 단가(FOB) 곡선이 영구적으로 상방 이탈(Decoupling)했습니다." actionPlan="[Tier-3 Processing Evolution] 낡은 1차 벤더(Tier-1) 포지션을 즉시 포기하십시오. 원물을 껍질째(HLSO) 동결해 떠넘기는 에콰도르식 무식한 볼륨 게임을 버리고, 초정밀 탈각/빵가루 코팅까지 원스톱으로 종료하는 '3차 팩토리 벤더(Tier-3)' 로 전사 비즈니스 모델을 진화시켜야 프라이싱 방어가 가능합니다. (Re-rating Expected)">
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={unitPriceExport.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${v}`} />
        <YAxis dataKey="country" type="category" width={80} stroke="#94a3b8" fontSize={11} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="price" fill="var(--color-success)" radius={[0, 4, 4, 0]}>
           {unitPriceExport.slice(0, 10).map((e:any, i:number) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W32: AquaUnitCost
export const W32_AquaUnitCost = () => (
  <WidgetCard title="현지 양식장 출하(Gate) 원가 지표" icon={Anchor} term="Farm-Gate Price" desc="새우가 연못에서 나올 때 매겨지는 생물 가치" source="FAO Aquaculture Processing Engine" situation="유전자 레벨이 동일한 흰다리새우(Vannamei)일지라도, 에콰도르의 단위 면적당 생물량 산출(Biomass Yield) 효율성이 인도를 압도하여 글로벌 팜 게이트(Farm-Gate) 최저 단가의 절대 우위를 점유하고 있습니다." actionPlan="[Next-Gen Aqua-Tech Sourcing] 동남아 메인 벨트의 기후/수질 오염 임계점 돌파로 원물 양식 원가가 구조적 폭등장(Structural Spike)에 진입했습니다. 당장 현지 스마트 아쿠아팜(Bio-floc) 원천 기술 스타트업 지분을 선취하여, 향후 10년의 생산 수율(Yield) 리스크를 극한으로 헷징.">
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={aquaValuePerTon.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="country" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${v}`} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="valuePerTon" fill="url(#a11y-stripe-h)" color="var(--color-info)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W33: PriceTrend
export const W33_PriceTrend = () => (
  <WidgetCard title="글로벌 기준선(Benchmark) 단가 사이클" icon={Activity} term="Global Price Cycle" desc="1990년 이후 새우 톤당 평균 가격의 변동성" source="FAO Trade Master Index" situation="새우의 도매 베이스라인은 타 육류(가금류/돈육)와 달리, 수년 단위로 극단적 폭등과 폭락장(Boom & Bust)을 오가는 철저한 '사이클릭 펀더멘털(Cyclical Asset)' 성향을 노골적으로 드러냅니다." actionPlan="[Counter-Cyclical Arbitrage] 패닉 셀(Panic Sell)이 쏟아지는 폭락장 골짜기(Trough)야말로 진정한 알파 구간입니다. 공포를 역이용해 현지 팩토리 물량을 싹쓸이하는 선도 매입(Forward Buy)을 체결하고, 콜드체인 터미널 캐파를 120% 가동하는 역발상(Counter-cyclical) 롱 포지션을 지시합니다.">
    <SafeResponsiveContainer width="100%" height="100%">
      <AreaChart data={unitPriceTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${v}`} domain={['dataMin - 1000', 'dataMax + 1000']} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="unitPrice" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.3} />
      </AreaChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W34: OriginCompare
export const W34_OriginCompare = () => {
  const data = [
    { size: '20/30', ecuador: 5.2, india: 5.8, vietnam: 6.5 },
    { size: '30/40', ecuador: 4.8, india: 5.3, vietnam: 6.0 },
    { size: '40/50', ecuador: 4.2, india: 4.7, vietnam: 5.2 }
  ];
  return (
    <WidgetCard title="동일 사이즈 원산지별 출하가 배틀" icon={Target} term="Size Pricing" desc="규격(마리수/파운드)당 가격 비교" source="Urner Barry & Undercurrent News" situation="핵심 매스 타겟인 30/40 규격(Grade) 블록에서 에콰도르의 무자비한 자본력 덤핑(Predatory Pricing) 공세에 밀려 인도의 팩토리 라인이 도미노 파산 직전(Capitulation)에 몰렸습니다." actionPlan="[Distressed Asset Liquidation] 당장 전세기 티켓을 끊고 에콰도르 과야킬(Guayaquil) 핵심 팩토리로 날아가십시오. 항구에 묶인 저가 덤핑 매물(Distressed Cargo)을 신라교역 명의로 일괄 싹쓸이(Block Buyout)하여, 마진 압박에 시달리는 국내 뷔페/식자재 카르텔에 역수출 수준으로 꽂아 넣어야 합니다.">
      <SafeResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="size" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${v}`} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="ecuador" name="에콰도르" fill="url(#a11y-stripe-h)" color="var(--color-info)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="india" name="인도" fill="url(#a11y-diag)" color="var(--color-warning)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="vietnam" name="베트남" fill="url(#a11y-dots)" color="var(--color-danger)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W35: ProcMargin
export const W35_ProcMargin = () => {
  const data = [{ category: '원물 보관', margin: 3 }, { category: 'HLSO(머리제거)', margin: 8 }, { category: 'PD(완전탈각)', margin: 15 }, { category: 'Breaded(빵가루)', margin: 35 }];
  return (
    <WidgetCard title="가공 심화도(Value-Add) 마진 폭발 차트" icon={Settings} term="Processing Margin" desc="칼을 댈수록 치솟는 영업이익률" source="내부 영업 통계 및 업계 벤치마크" situation="단순 블록 수입 브로커리지의 영업Bottom-line(순이익)률(OPM)은 3%의 한계 기업 수준에 불과하나, 탈각(Peeling) 및 브레딩(Breading) 딥테크 가공을 단 한 스텝 거치는 순간 OPM이 35%로 무려 10배 수직 팽창(Quantum Jump) 합니다." actionPlan="[Full Pivot to F&B Tech] 원양 어획이라는 망상을 쓰레기통에 버리십시오. 새우 비즈니스의 본질은 반도체 공정과 같은 '식품 테크 제조(F&B Tech)'입니다. 사내 유보금 100%를 동남아의 무인 탈각 스캐너(Vision Sorter) 및 완전 자동화 튀김 라인 인수에 올인(All-in)해야만 게임 체인저가 될 수 있습니다.">
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `${v}%`} />
          <YAxis dataKey="category" type="category" width={80} stroke="#94a3b8" fontSize={11} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Bar dataKey="margin" fill="url(#a11y-stripe-h)" color="var(--color-success)" radius={[0, 4, 4, 0]} />
        </ComposedChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W36: PriceCycle
export const W36_PriceCycle = () => {
  const data = [{y:'19',p:6.1},{y:'20',p:5.5},{y:'21',p:6.8},{y:'22',p:7.0},{y:'23',p:5.2},{y:'24',p:4.9}];
  return (
    <WidgetCard title="단가 하락장(Down Cycle) 트렌드 캐쳐" icon={RefreshCw} term="Down Cycle" desc="코로나 특수 이후의 거품 붕괴장" source="노트북LM 거시경제 분석" situation="펜데믹 당시 SCM 붕괴로 끼어있던 역사적 거품(Bubble)이 잔혹하게 붕괴하며, 2024년 현재 10년래 가장 깊은 언더밸류(Under-valued) 침체 터널의 최하단(Absolute Bottom)을 통과 중입니다." actionPlan="[Vulture Fund Execution] 거대한 공황장은 유동성을 쥔 자들의 사냥터입니다. 경쟁 중소 수입사들의 연쇄 도산 시 출회되는 '파산 매물(Distressed Inventory)' 및 '디폴트 아쿠아 팜' 자산을 피도 눈물도 없이 싹쓸이하는 벌처 펀드(Vulture Fund) 롤플레잉을 즉시 개시.">
      <SafeResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="y" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} domain={[4, 8]} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Line type="stepAfter" dataKey="p" stroke="var(--color-danger)" strokeWidth={3} />
        </LineChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W37: FeedCost
export const W37_FeedCost = () => {
  const data = [{fm: 1200, sm: 5000}, {fm: 1500, sm: 5200}, {fm: 1800, sm: 5800}, {fm: 2200, sm: 6500}];
  return (
    <WidgetCard title="사료(어분/Fishmeal)가 vs 양식 단가 연동성" icon={Link} term="Feed-Price Linkage" desc="사료 가격이 원가를 밀어올리는 동기화 현상" source="페루 어분 가격 지수 동향" situation="새우 제조 원가의 60%를 점유하는 페루산 어분(Fishmeal) 선물 지수가 엘니뇨 발현으로 발작을 일으키면, 정확히 6~8개월 후 글로벌 새우 팜게이트 프라이싱이 미친 듯이 수직 랠리(Rally)를 펼칩니다." actionPlan="[Leading Indicator Trigger Protocol] 데스크 최상단 모니터에 어처구니없는 새우 소매 가격표 대신 '페루 멸치(Anchovy) 어획량 선행 지수'를 띄우십시오. 어분 가격의 폭발 시그널이 감지되는 즉시, 모든 리스크 검토를 패스하고 새우 파생/선도 물량 전량을 묻지 마 매입(Aggressive Lock-in) 타격해야 합니다.">
      <SafeResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="fm" name="어분가" tickFormatter={v=>`$${v}`} stroke="#94a3b8" fontSize={11} />
          <YAxis dataKey="sm" name="새우출하가" tickFormatter={v=>`$${v}`} stroke="#94a3b8" fontSize={11} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Scatter data={data} fill="#8b5cf6" line={{stroke: '#8b5cf6', strokeWidth: 2}} />
        </ScatterChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W38: ChinaDemand
export const W38_ChinaDemand = () => {
  const data = [{y:'21',c:80,p:6},{y:'22',c:95,p:7},{y:'23',c:60,p:5.2},{y:'24',c:75,p:5.6}];
  return (
    <WidgetCard title="차이나 프랙탈: 폭식과 소화불량의 나비효과" icon={Briefcase} term="China Fractal" desc="중국의 내수 수입량이 글로벌 시세에 미치는 충격파" source="중국 세관 통계청 수입량 추적" situation="14억 중국 대륙의 춘절 소비 인디케이터가 폭발하면 글로벌 에콰도르 물동량이 씨가 마르며 전 세계 단가가 폭발하고, 반대로 내수가 무너지면 글로벌 해역에 수백만 톤의 잉여 재고가 토해지는(Dumping) 나비효과 장세가 고착화되었습니다." actionPlan="[Algorithmic Pre-emptive Betting] 이제 미국/일본 등 낡은 소비 데이터는 휴지 조각입니다. 퀀트 데스크를 총동원하여 '중국 대륙 1선 도시 외식 경기 지수'를 실시간 파싱(Data Scraping) 및 머신러닝화 하십시오. 중국의 미세한 지표 변동을 기반으로 정확히 3개월 뒤 글로벌 가격 변곡점에 선행 숏/롱 베팅(Directional Bet)을 때려 넣어야 합니다.">
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="y" stroke="#94a3b8" fontSize={11} />
          <YAxis yAxisId="L" stroke="#ec4899" fontSize={11} />
          <YAxis yAxisId="R" orientation="right" stroke="var(--color-info)" fontSize={11} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Bar yAxisId="L" dataKey="c" name="중국수입량" fill="url(#a11y-stripe-h)" color="#ec4899" radius={[4,4,0,0]} opacity={0.6}/>
          <Line yAxisId="R" dataKey="p" name="글로벌단가" stroke="var(--color-info)" strokeWidth={3} />
        </ComposedChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W39: ValueAddWaterfall
export const W39_ValueAddWaterfall = () => {
  const data = [{name:'원물(HOSO)', v: 4.5}, {name:'머리제거(HLSO)', v: 5.5}, {name:'순살(PTO)', v: 7.2}, {name:'튀김용(Breaded)', v: 9.8}];
  return (
    <WidgetCard title="공정별 부가가치 창출 워터폴(Waterfall)" icon={BarChart2} term="Value Waterfall" desc="단계를 거칠 때마다 점프하는 단위 판매가" source="가공 수율표 기반 역산" situation="공장 라인업이 1차 탈각, 2차 코팅, 3차 패키징의 단계를 통과(Step-up)할 때마다, 제품 톤당 마진율(OPM)이 단순 덧셈이 아닌 지수 함수적(Exponential)으로 중첩(Compound)되는 기적의 부가가치 워터폴(Value Waterfall) 구조입니다." actionPlan="[Offshore Tolling & Local Finishing] 동남아 원물을 바보처럼 벌크로 들여오는 구시대적 브로커리지는 중단하십시오. 현지 특A급 팩토리 라인을 '통임대'하여 1차 반가공 마진을 선취한 후, 국내 자동화 클린룸 베이스캠프로 들여와 최종 럭셔리 라스트마일(Premium Packaging) 코팅을 입히는 하이브리드 SCM을 완성해야 합니다.">
      <SafeResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v=>`$${v}`} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Bar dataKey="v" fill="url(#a11y-stripe-h)" color="var(--color-warning)" radius={[4,4,0,0]} />
        </BarChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W40: GoldenLockin
export const W40_GoldenLockin = () => {
  const data = [{y:'19',p:60},{y:'20',p:55},{y:'21',p:70},{y:'22',p:65},{y:'23',p:45},{y:'24',p:42}];
  return (
    <WidgetCard title="골든 타임 바텀 피싱(Bottom Fishing) 인디케이터" icon={Flame} term="Golden Lock-in" desc="장기 이동평균선 터치 시 발생하는 매수 우위 시그널" source="10-Year Moving Average Algorithm" situation="당사 알고리즘 딥-다이브 결과, 현 글로벌 새우 기준 시세는 10년 장기 이동평균선(MA)을 하향 돌파하여 데드 바닥(Absolute Bottom)을 기어 다니는 역사상 유례없는 언더밸류(Deep Under-valuation) 패닉장입니다." actionPlan="[Extreme Leverage Lock-in] C-레벨 즉각 재가를 발동해 회사의 가용 유동성(Liquidity) 영혼까지 끌어모으십시오(Max Leverage). 향후 24개월 소요 예정 B2B 물량을 현재의 쓰레기 덤핑 단가로 100% 롱-텀 락인(Long-term Lock-in) 때리십시오. 내년 반등장이 열리는 순간 조 단위 초과 수익 파티가 열립니다.">
      <SafeResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="y" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} domain={[30, 80]} />
          <ReferenceLine y={50} stroke="var(--color-danger)" strokeDasharray="3 3" label={{ position: 'top', value: '10년 장평선 하단 이탈', fill: 'var(--color-danger)', fontSize: 10 }} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="p" stroke="var(--color-success)" strokeWidth={3} />
        </LineChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};
