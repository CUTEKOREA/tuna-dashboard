import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Legend, ReferenceLine, Tooltip as RechartsTooltip } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Globe, Anchor, TrendingUp, DollarSign, Layers, Factory, Activity, Target } from 'lucide-react';
import { WidgetCard, tooltipStyle, COLORS } from './ShrimpWidgetCommon';
import { megatrendData, capVsAquaData, aquaValueTimeline, aquaShareData, top10Prod, top10Aqua, top10Cap, top10AquaVal, captureCeiling, hhi } from './ShrimpDataHelper';
import { ChartPatternDefs } from './ChartPatterns';

// W01: Megatrend
export const W01_Megatrend = () => (
  <WidgetCard title="수생태계 메가트렌드 (1970-2022)" icon={Globe} term="Production Megatrend" desc="글로벌 전체 생산량" source="FAO FishStatJ - Global Production Timeline" situation="2000년대 이후 인공 양식(Aquaculture) 인프라의 폭발적 증가로 새우 생산량 곡선이 구조적 수직 팽창(Vertical Expansion) 단계에 진입하며, 글로벌 식량 밸류체인의 판도가 영구적으로 재편되었습니다." actionPlan="[Value-Chain Migration] 자연산 어획에 의존하는 낡은 비즈니스 모델(Legacy Model)에서 즉각 탈피하십시오. 전사 CAPEX를 글로벌 양식 밸류체인 편입 및 스마트 아쿠아팜 지분 확보에 집중하여 매입원가 주도권(Cost Leadership)을 탈환해야 합니다." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <AreaChart data={megatrendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="value" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.3} />
      </AreaChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W02: CapVsAqua
export const W02_CapVsAqua = () => (
  <WidgetCard title="어획(Capture) vs 양식(Aqua) 크로스오버" icon={Layers} term="Cap vs Aqua" desc="생산 방식별 교차점" source="FAO FishStatJ - Species Group by Timeline" situation="2000년대 초반을 기점으로 양식 생산량이 자연산 어획량을 영구적으로 초월(Structural Golden-Cross)하며, 공급 주도권이 해양 선단에서 육상 플랜트로 완전히 이전되었습니다." actionPlan="[CAPEX Reallocation] 기존 원양어선 선단에 대한 신규 투자를 전면 보류(Hold)하십시오. 가용 유동성(Liquidity)을 양식 인프라 펀드(Infrastructure Fund) 및 최첨단 육상 가공 플랜트(Processing Plant) 확보에 전면 재배치(Reallocation)해야 합니다." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <ComposedChart data={capVsAquaData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line dataKey="capture" name="자연산 어획" stroke="var(--color-danger)" strokeWidth={2} dot={false} />
        <Line dataKey="aquaculture" name="인공 양식" stroke="var(--color-success)" strokeWidth={3} dot={false} />
      </ComposedChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W03: AquaValue
export const W03_AquaValue = () => (
  <WidgetCard title="새우 양식업 본질가치(Value) 성장" icon={DollarSign} term="Aqua Value" desc="양식업 연간 USD 생산가치" source="FAO FishStatJ - Aquaculture Value Timeline" situation="생산량(Volume) 팽창과 마켓 프라이싱(Pricing) 상승이 결합된 강력한 쌍끌이 호황으로, 글로벌 양식 산업의 총체적 시장 가치(Total Addressable Market)가 천문학적 스케일로 팽창 중입니다." actionPlan="[Premium Asset Acquisition] 단순 볼륨(Volume) 기반의 덤핑 경쟁을 즉시 중단하십시오. 단위당 최고 마진율(Value)을 보장하는 친환경 인증(ASC) 및 질병 내성(SPF)을 갖춘 하이엔드 프리미엄 양식장 자산(Asset) 인수에 전사 M&A 역량을 집중." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <AreaChart data={aquaValueTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${(v/1000000).toFixed(1)}B`} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="value" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.3} />
      </AreaChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W04: AquaShare
export const W04_AquaShare = () => (
  <WidgetCard title="양식 침투율(Aquaculture Share)" icon={TrendingUp} term="Aqua Penetration" desc="전체 생산 중 양식이 차지하는 비중" source="FAO FishStatJ 양식·어획 시계열 (양식÷(양식+어획) 자체 산출)" situation="FAO 시계열 기준 글로벌 새우 생산의 양식 비중은 2024년 약 74.9%로, 공급망의 3분의 2 이상이 양식 베이스로 재편되며 양식 매입원가 경쟁력이 시장의 표준(Standard)으로 자리 잡았습니다. (산출 기준에 따라 비중이 달라질 수 있어 차트 시계열 정의를 기준으로 표기)" actionPlan="[Two-Track SCM Strategy] 포트폴리오를 철저히 이원화(Two-track)하십시오. 자연산은 최고가 파인다이닝향 니치 마켓(Niche Market) 전용으로 격리하고, 볼륨을 책임지는 B2B 프랜차이즈 체인은 100% 매입원가 통제가 가능한 양식 기반 SCM으로 전면 개편(Restructuring)해야 생존 가능합니다. (Re-rating Expected)" telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <ComposedChart data={aquaShareData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `${v}%`} domain={[0, 100]} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Area type="step" dataKey="share" name="양식 비중(%)" fill="var(--color-info)" stroke="var(--color-info)" fillOpacity={0.3} />
        <ReferenceLine y={50} stroke="var(--color-danger)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '50% 잠식 임계점', fill: 'var(--color-danger)', fontSize: 10 }} />
      </ComposedChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W05: Top10Prod
export const W05_Top10Prod = () => (
  <WidgetCard title="글로벌 생산 Top 10 국가" icon={Globe} term="Top Production" desc="최근 국가별 총생산량" source="FAO FishStatJ - Recent Production by Country" situation="중국, 인도, 에콰도르 3개국이 글로벌 양식 생산 물량의 절대다수를 통제하며, 사실상의 시장 독과점(Oligopoly/Triopoly) 헤게모니를 완벽하게 구축했습니다." actionPlan="[Macro Risk Monitoring] 이 3대 메이저 국가의 기후변화(El Nino) 및 생물학적 리스크가 당사 영업이익(OPM)의 치명적 변수로 작용합니다. C/I/E(China/India/Ecuador) 벨트에 대한 퀀트 기반 실시간 리스크 모니터링 데스크를 즉각 신설." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={top10Prod} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
        <YAxis dataKey="country" type="category" width={70} stroke="#94a3b8" fontSize={11} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="var(--color-success)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W06: Top10Aqua
export const W06_Top10Aqua = () => (
  <WidgetCard title="글로벌 양식업 Top 10 기지" icon={Factory} term="Top Aqua Base" desc="양식업 집중 육성 국가 순위" source="FAO FishStatJ - Aquaculture by Country" situation="양식업의 구조적 주도권이 광활한 토지와 값싼 자본이 집약된 아시아 및 에콰도르(LATAM) 지역으로 극단적 쏠림(Geopolitical Concentration) 현상을 보이고 있습니다." actionPlan="[FDI & Joint Venture Strategy] 무의미한 제3국 투자를 배제하십시오. 원물 소싱 캐파(CAPA)가 보장되는 인도 또는 에콰도르 핵심 기지에 직접투자(FDI) 기반의 조인트벤처 스마트 팩토리를 설립하여 서플라이 체인의 최상단을 점유해야 합니다." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={top10Aqua} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
        <YAxis dataKey="country" type="category" width={70} stroke="#94a3b8" fontSize={11} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="var(--color-info)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W07: Top10Cap
export const W07_Top10Cap = () => (
  <WidgetCard title="자연산 어획 잔존 세력 Top 10" icon={Anchor} term="Capture Remnants" desc="야생 새우 어획 선단 유지 국가" source="FAO FishStatJ 국가별 어획량(국가 합계, 어종 분해 없음)" situation="범용 양식업의 폭발적 팽창 속에서도 중국(약 57.8만t)과 아르헨티나(약 22.2만t)가 자연산 새우 어획 상위 국가를 유지하고 있습니다. (본 차트는 국가 합계 어획량으로, 붉은새우 등 특정 어종 단위 비중은 어종 분해 데이터가 없어 직접 확인되지 않음.)" actionPlan="[자연산 니치 포지셔닝] 자연산 어획과 양식(흰다리새우)의 타겟 소비층은 사실상 분리되어 있습니다. 아르헨티나 등 자연산 어획 강국과의 소싱 라인을 확보해 B2B 하이엔드·파인다이닝 전용 희귀 물량을 선점하는 전략이 유효합니다." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={top10Cap} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
        <YAxis dataKey="country" type="category" width={70} stroke="#94a3b8" fontSize={11} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="var(--color-danger)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W08: Top10AquaVal
export const W08_Top10AquaVal = () => (
  <WidgetCard title="양식업 부가가치 창출 Top 10" icon={DollarSign} term="Aqua Value Gen" desc="양식업으로 달러를 쓸어담는 국가" source="FAO FishStatJ - Aquaculture Value" situation="글로벌 물량 생산량(Volume) Top 3 국가가 창출하는 부가가치(Value-Add) Top 3 순위와 완벽히 동기화(Synchronization)되며 극단적인 Bottom-line(순이익) 과점 체제(Oligopoly)를 완성했습니다." actionPlan="[Pricing Power Hedging] 메이저 3국은 물량 공세(Dumping)를 넘어 글로벌 마켓 프라이싱 권한(Pricing Power)마저 독점하고 있습니다. 특정 국가에 대한 소싱 의존도(Exposure)를 30% 이하로 통제(Diversification)하여 공급망 병목 리스크(Bottleneck)를 완벽히 헤징(Hedging)해야 합니다." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={top10AquaVal} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${(v/1000000).toFixed(1)}B`} />
        <YAxis dataKey="country" type="category" width={70} stroke="#94a3b8" fontSize={11} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="var(--color-warning)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W09: CapCeiling
export const W09_CapCeiling = () => (
  <WidgetCard title="자연산 어획량 정체 한계선(Ceiling)" icon={Activity} term="Catch Ceiling" desc="환경적 요인으로 인한 어획 한계" source="FAO FishStatJ 자연산 어획 시계열 (한계선은 자체 표기 박스권 상단)" situation="지난 20년간(2004년 이후) 글로벌 자연산 새우 어획량은 약 2.75~3.63M톤 박스권에서 횡보하고 있으며, 2024년은 약 3.18M톤입니다. 차트의 3.5M톤 선은 과학적 생태 한계가 아니라 관측 박스권 상단을 표시한 자체 참고선입니다." actionPlan="[ESG Premium Exploitation] 자연산 새우의 희소 가치(Scarcity Value)는 영구적으로 치솟을 것입니다. MSC(해양관리협의회) 지속가능성 라벨링이 가능한 합법적 조업 쿼터를 프리미엄 가격에 선제 싹쓸이(Buyout)하여 럭셔리 VVIP 라인업을 즉각 런칭." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <ComposedChart data={captureCeiling} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} domain={[0, 'auto']} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="#64748b" opacity={0.6} />
        <ReferenceLine y={3500000} stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '관측 박스권 상단 (약 3.5M톤, 자체 표기)', fill: 'var(--color-danger)', fontSize: 11 }} />
      </ComposedChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W10: HHI
export const W10_HHI = () => (
  <WidgetCard title="글로벌 생산 SCM 집중도 (HHI Index)" icon={Target} term="HHI Concentration" desc="Herfindahl-Hirschman Index 독점 체제 분석" source="FAO FishStatJ 국가별 생산량 기반 HHI 자체 산출(Σ(점유율%)²)" situation={`[HHI 공급 집중도] FAO 생산량으로 산출한 글로벌 HHI(허핀달-허쉬만 지수)는 약 ${Math.round(hhi)} 포인트로, 통상 기준(HHI<1500=비집중·경쟁적)상 아직 비집중 구간입니다. 다만 중국·에콰도르·인도 상위 3개국이 물량의 상당 부분을 점유해 집중도가 점진적으로 높아지는 추세이므로, 특정국 공급 충격에 대한 모니터링은 여전히 필요합니다.`} actionPlan="[Supply Chain Diversification Leverage] 공급망 다변화(Supply Chain Diversification) 헷징(Hedging)을 위해 멕시코, 베트남 등 '고성장 신흥 기지'의 Tier-2 벤더 물량을 의무적으로 15% 이상 할당(Allocation)하여, 메이저 3국과의 단가 협상 시 강력한 지렛대(Negotiation Leverage)로 활용." telemetry={{ status: 'STATIC' }}>
    <div style={{ padding: '0 10px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: '#94a3b8', fontSize: '12px' }}>Total Volume</span>
        <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{(top10Prod.reduce((s:any,c:any)=>s+c.value,0)/1000000).toFixed(1)} M Tonnes</span>
      </div>
      <div style={{ height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', overflow: 'hidden' }}>
        {top10Prod.slice(0,5).map((c:any, i:number) => (
          <div key={i} style={{ width: `${(c.value/top10Prod[0].value)*100}%`, background: COLORS[i%COLORS.length] }} title={`${c.country}: ${(c.value/1000000).toFixed(1)}M`} />
        ))}
      </div>
      <div data-mobile-stack style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {top10Prod.slice(0,4).map((c:any, i:number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#cbd5e1' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i%COLORS.length] }} />
            {c.country}
          </div>
        ))}
      </div>
    </div>
  </WidgetCard>
);
