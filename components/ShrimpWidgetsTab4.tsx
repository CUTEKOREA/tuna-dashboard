import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ReferenceLine, Tooltip as RechartsTooltip, Cell, ScatterChart, Scatter } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Anchor, DollarSign, Activity, Target, Settings, RefreshCw, BarChart2, Briefcase, Flame, Link } from 'lucide-react';
import { WidgetCard, tooltipStyle, COLORS } from './ShrimpWidgetCommon';
import { unitPriceExport, aquaValuePerTon, unitPriceTimeline } from './ShrimpDataHelper';
import { ChartPatternDefs } from './ChartPatterns';

// W31: PriceGap
export const W31_PriceGap = () => (
  <WidgetCard title="수출국별 평균 수출 단가 갭" icon={DollarSign} term="Export Unit Value" desc="FAO 총수출액÷총물량 파생 단가 — 혼합 HS 평균 (FOB 아님)" source="FAO 무역 통계 파생 (수출액÷물량, 자체 산출)" situation="FAO 총수출액을 총물량으로 나눈 파생 단가($/톤) 기준으로는 중국($11,942)·네덜란드($10,406)가 최상위이고, 베트남($8,456)이 그 뒤를 잇습니다. 에콰도르($5,943)는 최하위권으로, 고가 품목·재수출이 섞인 혼합 HS 평균이라 순수 1차 원물가로 단정하긴 어렵습니다." actionPlan="[가공 믹스 고도화] 파생 단가가 높은 국가일수록 탈각·코팅 등 가공 믹스 비중이 큰 것으로 추정됩니다. 단순 원물 벤더 포지션을 줄이고 초정밀 탈각·빵가루 코팅 등 부가가치 공정을 내재화해 프라이싱 방어력을 확보하는 방향을 검토하십시오. (단, 본 단가는 혼합 HS 평균이라 품목별 정밀 비교는 별도 HS 분해가 필요합니다.)" telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={unitPriceExport.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
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
  <WidgetCard title="양식 생산액 톤당 환산 단가 지표" icon={Anchor} term="Aqua Value/Ton" desc="FAO 양식 생산액÷생산량 파생값 ($/톤) — 실측 팜게이트가 아님" source="FAO 양식 통계 파생 (생산액÷생산량, 자체 산출)" situation="FAO 양식 생산액을 생산량으로 나눈 톤당 환산 단가 기준으로는 에콰도르($3,600)가 파생 대상국 중 최하위, 인도($4,383)·인도네시아($4,216)가 그 위에 위치합니다. 다만 이는 실측 팜게이트가가 아니라 통계 파생값으로, 어종·규격 믹스 차이가 섞여 있어 양식 효율성의 직접 지표로 단정하기는 어렵습니다." actionPlan="[원물 원가 모니터링] 파생 단가가 낮은 산지(에콰도르 등)는 대량 생산 기반의 원가 경쟁력이 추정되나, 본 지표는 통계 파생값입니다. 실제 소싱 의사결정은 현지 실측 팜게이트가·수질/기후 리스크를 별도 확인한 뒤 진행하고, 스마트 아쿠아팜 등 수율 개선 기술은 중장기 헷지 옵션으로 검토하십시오." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={aquaValuePerTon.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
        <XAxis dataKey="country" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${v}`} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="valuePerTon" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W33: PriceTrend
export const W33_PriceTrend = () => (
  <WidgetCard title="글로벌 기준선(Benchmark) 단가 사이클" icon={Activity} term="Global Price Cycle" desc="1990~2023년 새우 톤당 평균 수출 단가의 변동성 (FAO 파생)" source="FAO 무역 통계 파생 (수출액÷물량, 자체 산출)" situation="새우의 도매 베이스라인은 타 육류(가금류/돈육)와 달리, 수년 단위로 폭등과 폭락을 오가는 사이클릭(Cyclical) 성향을 보입니다. 데이터가 존재하는 가장 최근 시점(2023년) 단가는 톤당 약 $7,087로, 직전 몇 년($7,300~7,800) 대비 하락 국면입니다. 다만 본 시계열의 절대 최저점은 2004년(약 $5,643)이므로 2023년이 사상 최저점은 아닙니다." actionPlan="[역발상 분할 매입] 사이클 하락 국면에서는 공포에 휩쓸린 일괄 투매보다, 현지 팩토리 물량을 분할로 선도 매입(Forward Buy)하며 평단가를 관리하는 접근이 유효합니다. 콜드체인 터미널 가동률을 단계적으로 끌어올려 재고 회전을 확보하되, 2024년 이후 단가는 본 데이터에 없으므로 최신 실거래가로 별도 확인 후 포지션을 조정하십시오." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <AreaChart data={unitPriceTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
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
    <WidgetCard title="동일 사이즈 원산지별 출하가 비교 (예시)" icon={Target} term="Size Pricing" desc="규격(마리수/파운드)별 단가 비교 — 자체 추정(illustrative) 예시 데이터" source="자체 추정 예시 데이터 (규격별 단가 일러스트, 실거래가 아님)" situation="예시 데이터 기준으로, 모든 규격대에서 에콰도르 단가가 인도·베트남보다 낮게 형성되는 일반적 원산지 가격 서열을 보여줍니다(20/30 기준 에콰도르 $5.2 < 인도 $5.8 < 베트남 $6.5). 본 수치는 검증된 실거래 인용가가 아닌 구조 설명용 예시값으로, 특정 시점 시세 단정에는 사용할 수 없습니다." actionPlan="[원산지 단가 모니터링] 규격별 원산지 가격차는 소싱 믹스 설계의 기본 변수입니다. Urner Barry·Undercurrent News 등 실측 시세를 syncDate와 함께 인용해 본 예시값을 실데이터로 교체한 뒤, 가격 경쟁력이 확인된 산지에 한해 분할 매입을 검토하십시오." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
          <XAxis dataKey="size" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${v}`} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="ecuador" name="에콰도르" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="india" name="인도" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="vietnam" name="베트남" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W35: ProcMargin
export const W35_ProcMargin = () => {
  const data = [{ category: '원물 보관', margin: 3 }, { category: 'HLSO(머리제거)', margin: 8 }, { category: 'PD(완전탈각)', margin: 15 }, { category: 'Breaded(빵가루)', margin: 35 }];
  return (
    <WidgetCard title="가공 심화도(Value-Add) 마진 구조 (예시)" icon={Settings} term="Processing Margin" desc="가공 단계별 영업이익률 일러스트 — 자체 추정(illustrative) 예시 데이터" source="자체 추정 예시 데이터 (단계별 마진 일러스트, 실측 회계자료 아님)" situation="예시 데이터 기준으로, 단순 원물 보관(약 3%)에서 탈각(PD, 약 15%)·브레딩(약 35%)으로 가공도를 높일수록 영업이익률이 단계적으로 상승하는 구조를 보여줍니다. 단, 3·8·15·35%는 검증된 실측 회계치가 아닌 방향성 설명용 예시값으로, 절대 마진율로 인용해서는 안 됩니다." actionPlan="[가공 내재화 검토] 가공도가 높을수록 마진이 두터워지는 일반적 경향은 업계 통념과 부합합니다. 다만 실제 OPM은 라인·품목별 실측 원가표로 검증이 선행되어야 합니다. 검증된 마진이 확보되는 공정에 한해 단계적으로 가공 라인(탈각·코팅)을 내재화하고, 무인 설비 투자는 회수 기간을 산정한 뒤 분할 집행하십시오." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `${v}%`} />
          <YAxis dataKey="category" type="category" width={80} stroke="#94a3b8" fontSize={11} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Bar dataKey="margin" fill="var(--color-success)" radius={[0, 4, 4, 0]} />
        </ComposedChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W36: PriceCycle
export const W36_PriceCycle = () => {
  const data = [{y:'19',p:6.1},{y:'20',p:5.5},{y:'21',p:6.8},{y:'22',p:7.0},{y:'23',p:5.2},{y:'24',p:4.9}];
  return (
    <WidgetCard title="단가 하락장(Down Cycle) 트렌드 (예시)" icon={RefreshCw} term="Down Cycle" desc="팬데믹 이후 단가 흐름 일러스트 — 자체 추정(illustrative) 예시 데이터" source="자체 추정 예시 데이터 ($/kg 단위, 연도별 일러스트)" situation="예시 데이터 기준으로, 팬데믹 기(약 $6.8~7.0/kg)에 고점을 형성한 단가가 이후 하락 추세($4.9/kg대)로 전환되는 모습을 보여줍니다. 본 수치는 검증된 실측 시세가 아닌 사이클 형태 설명용 예시값이며, '10년래 절대바닥' 같은 절대 수준 단정의 근거로는 사용할 수 없습니다." actionPlan="[하락 국면 분할 매입] 하락 추세 국면에서는 일괄 투매·일괄 매집보다 분할 매입으로 평단가를 관리하는 접근이 유효합니다. 단, 본 위젯은 예시값 기반이므로 실제 진입 시점은 FAO·Urner Barry 등 실측 시세를 syncDate와 함께 확인한 뒤 결정하십시오." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
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
    <WidgetCard title="사료(어분/Fishmeal)가 vs 양식 단가 연동성 (예시)" icon={Link} term="Feed-Price Linkage" desc="어분가-출하가 상관 일러스트 — 자체 추정(illustrative) 4점 예시 데이터" source="자체 추정 예시 데이터 (어분가·출하가 4점 산점, 실측 시계열 아님)" situation="예시 4개 점 기준으로, 어분(Fishmeal)가 상승과 새우 출하가 상승이 같은 방향으로 움직이는 양(+)의 연동 경향을 보여줍니다. 다만 4점만으로는 상관계수·리드타임(선행 개월)을 통계적으로 단정할 수 없으며, '원가 60% 어분'·'6~8개월 선행' 수치도 본 위젯에서 검증된 값이 아닙니다." actionPlan="[선행 지표 가설 검증] 어분가가 양식 원가를 끌어올린다는 가설은 합리적이나, 실측 월별 시계열로 상관·시차를 회귀 검증한 뒤에만 트레이딩 트리거로 사용하십시오. 검증 전에는 페루 어분/멸치 어획 지표를 참고 보조 지표로만 모니터링하는 것을 권고합니다." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
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
    <WidgetCard title="중국 수입량과 글로벌 단가 연동 (예시)" icon={Briefcase} term="China Demand" desc="중국 수입량·글로벌 단가 관계 일러스트 — 자체 추정(illustrative) 예시 데이터" source="자체 추정 예시 데이터 (중국 수입량·단가 4개년 일러스트, 실측 세관 통계 아님)" situation="예시 데이터 기준으로, 중국 수입량(2021~2024)과 글로벌 단가가 대체로 같은 방향으로 움직이는 모습을 보여줍니다. 다만 4개년 점만으로는 '3개월 선행 변곡' 같은 인과·시차를 단정할 수 없으며, 본 수치는 실제 중국 세관 통계를 호출한 값이 아닌 구조 설명용 예시값입니다." actionPlan="[중국 수요 모니터링] 중국 내수가 글로벌 새우 시세의 주요 변수라는 점은 업계 통념과 부합합니다. 다만 선행 베팅에 쓰려면 중국 해관총서(GACC) 실측 수입 통계로 시차를 검증한 뒤 사용하고, 검증 전에는 수요 방향성 참고 지표로만 활용하십시오." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
          <XAxis dataKey="y" stroke="#94a3b8" fontSize={11} />
          <YAxis yAxisId="L" stroke="#ec4899" fontSize={11} />
          <YAxis yAxisId="R" orientation="right" stroke="var(--color-info)" fontSize={11} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Bar yAxisId="L" dataKey="c" name="중국수입량" fill="#ec4899" radius={[4,4,0,0]} opacity={0.6}/>
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
    <WidgetCard title="공정별 부가가치 단계 단가 (예시)" icon={BarChart2} term="Value-Add Steps" desc="가공 단계별 단위 판매가 일러스트 ($/kg) — 자체 추정(illustrative) 예시 데이터" source="자체 추정 예시 데이터 (가공 단계별 단가 일러스트, 수율표 원본 부재)" situation="예시 데이터 기준으로, 원물(HOSO, $4.5)에서 머리제거(HLSO)·순살(PTO)·튀김용(Breaded, $9.8)으로 가공도가 올라갈수록 단위 판매가가 단계적으로 상승하는 구조를 보여줍니다. 단, 4점은 검증된 수율표가 아닌 예시값이며 '지수함수적 중첩'은 본 데이터로 입증되지 않습니다(차트도 워터폴이 아닌 단순 바 형태)." actionPlan="[가공 단계별 단가 검증] 가공 심화로 단가가 오르는 경향은 합리적이나, 실제 단계별 마진은 수율·로스율을 반영한 실측 수율표로 검증해야 합니다. 검증된 단계에 한해 현지 반가공 + 국내 최종 가공의 하이브리드 SCM을 단계적으로 도입하십시오." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v=>`$${v}`} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Bar dataKey="v" fill="var(--color-warning)" radius={[4,4,0,0]} />
        </BarChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};

// W40: GoldenLockin
export const W40_GoldenLockin = () => {
  const data = [{y:'19',p:60},{y:'20',p:55},{y:'21',p:70},{y:'22',p:65},{y:'23',p:45},{y:'24',p:42}];
  return (
    <WidgetCard title="단가 지수 저점 인디케이터 (예시)" icon={Flame} term="Price Index Low" desc="가격 지수와 기준선 비교 일러스트 — 자체 추정(illustrative) 예시 데이터" source="자체 추정 예시 데이터 (가격 지수 일러스트 + 임의 기준선 50, 실측 MA 아님)" situation="예시 지수 기준으로, 최근 값(2023~2024, 42~45)이 임의로 설정한 기준선(50)을 하회하며 상대적 저점 구간에 위치합니다. 단 본 지수는 실측 10년 이동평균이 아닌 설명용 예시값이고 기준선 50도 임의값이므로, '역사상 최저'·'데드 바닥' 같은 절대 단정의 근거로는 사용할 수 없습니다." actionPlan="[저점 분할 매입 검토] 상대적 저점 국면에서는 일괄 락인보다 분할 매입으로 평단가를 관리하는 보수적 접근을 권고합니다. 실제 이동평균·밸류에이션은 FAO 등 실측 시계열로 재산출한 뒤, 검증된 저점에 한해 B2B 선도 계약 범위를 단계적으로 확대하십시오. 과도한 레버리지는 지양하십시오." telemetry={{ status: 'STATIC' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
          <XAxis dataKey="y" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} domain={[30, 80]} />
          <ReferenceLine y={50} stroke="var(--color-danger)" strokeDasharray="3 3" label={{ position: 'top', value: '기준선 50 (예시)', fill: 'var(--color-danger)', fontSize: 10 }} />
          <RechartsTooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="p" stroke="var(--color-success)" strokeWidth={3} />
        </LineChart>
      </SafeResponsiveContainer>
    </WidgetCard>
  );
};
