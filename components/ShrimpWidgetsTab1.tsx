import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, ReferenceLine, Tooltip as RechartsTooltip, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Globe, Anchor, TrendingUp, DollarSign, Layers, Factory, Activity, Target, Scale, Truck, ShoppingCart, Flag, ShieldCheck, PieChart as PieChartIcon, Settings, RefreshCw, BarChart2, Briefcase, Flame, Cog, AlertTriangle, DivideSquare, Compass, Link } from 'lucide-react';
import { WidgetCard, tooltipStyle, COLORS } from './ShrimpWidgetCommon';
import { megatrendData, capVsAquaData, aquaValueTimeline, aquaShareData, top10Prod, top10Aqua, top10Cap, top10AquaVal, captureCeiling, hhi } from './ShrimpDataHelper';

// W01: Megatrend
export const W01_Megatrend = () => (
  <WidgetCard title="수생태계 메가트렌드 (1970-2022)" icon={Globe} term="Production Megatrend" desc="글로벌 전체 생산량" source="FAO FishStatJ - Global Production Timeline" situation="[Aquaculture Hyper-Growth] 2000년대 이후 인공 양식(Aquaculture) 인프라의 폭발적 증가로 새우 생산량 곡선이 구조적 수직 팽창(Vertical Expansion) 단계에 진입하며, 글로벌 식량 밸류체인의 판도가 영구적으로 재편되었습니다." actionPlan="**[Actionable Insight]** [Value-Chain Migration] 자연산 어획에 의존하는 낡은 비즈니스 모델(Legacy Model)에서 즉각 탈피하십시오. 전사 CAPEX를 글로벌 양식 밸류체인 편입 및 스마트 아쿠아팜 지분 확보에 집중하여 매입원가(COGS) 주도권(Cost Leadership)을 탈환해야 합니다. (Conviction Buy)">
    <SafeResponsiveContainer width="100%" height="100%">
      <AreaChart data={megatrendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
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
  <WidgetCard title="어획(Capture) vs 양식(Aqua) 크로스오버" icon={Layers} term="Cap vs Aqua" desc="생산 방식별 교차점" source="FAO FishStatJ - Species Group by Timeline" situation="[Production Golden-Cross] 2000년대 초반을 기점으로 양식 생산량이 자연산 어획량을 영구적으로 초월(Structural Golden-Cross)하며, 공급 주도권이 해양 선단에서 육상 플랜트로 완전히 이전되었습니다." actionPlan="**[Actionable Insight]** [CAPEX Reallocation] 기존 원양어선 선단(Fleet)에 대한 신규 투자를 전면 보류(Hold)하십시오. 가용 유동성(Liquidity)을 양식 인프라 펀드(Infrastructure Fund) 및 최첨단 육상 가공 플랜트(Processing Plant) 확보에 전면 재배치(Reallocation)해야 합니다. (Conviction Buy)">
    <SafeResponsiveContainer width="100%" height="100%">
      <ComposedChart data={capVsAquaData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
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
  <WidgetCard title="새우 양식업 본질가치(Value) 성장" icon={DollarSign} term="Aqua Value" desc="양식업 연간 USD 생산가치" source="FAO FishStatJ - Aquaculture Value Timeline" situation="[Market Value Explosion] 생산량(Volume) 팽창과 마켓 프라이싱(Pricing) 상승이 결합된 강력한 쌍끌이 호황으로, 글로벌 양식 산업의 총체적 시장 가치(Total Addressable Market)가 천문학적 스케일로 팽창 중입니다." actionPlan="**[Actionable Insight]** [Premium Asset Acquisition] 단순 볼륨(Volume) 기반의 덤핑 경쟁을 즉시 중단하십시오. 단위당 최고 마진율(Value)을 보장하는 친환경 인증(ASC) 및 질병 내성(SPF)을 갖춘 하이엔드 프리미엄 양식장 자산(Asset) 인수에 전사 M&A 역량을 집중하여 잉여현금흐름(FCF)을 극대화하십시오. (Strong Buy)">
    <SafeResponsiveContainer width="100%" height="100%">
      <AreaChart data={aquaValueTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
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
  <WidgetCard title="양식 침투율(Aquaculture Share)" icon={TrendingUp} term="Aqua Penetration" desc="전체 생산 중 양식이 차지하는 비중" source="FAO FishStatJ - Timeline Analysis" situation="[Aquaculture Penetration] 글로벌 새우 공급망(Supply Chain)의 65% 이상이 양식업 베이스로 완전히 재편(Market Penetration)되며, 양식 매입원가(COGS) 경쟁력이 시장의 표준(Standard)으로 자리 잡았습니다." actionPlan="**[Actionable Insight]** [Two-Track SCM Strategy] 포트폴리오를 철저히 이원화(Two-track)하십시오. 자연산은 최고가 파인다이닝향 니치 마켓(Niche Market) 전용으로 격리하고, 볼륨을 책임지는 B2B 프랜차이즈 체인은 100% 매입원가(COGS) 통제가 가능한 양식 기반 SCM으로 전면 개편(Restructuring)해야 생존 가능합니다. (Re-rating Expected)">
    <SafeResponsiveContainer width="100%" height="100%">
      <ComposedChart data={aquaShareData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
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
  <WidgetCard title="글로벌 생산 Top 10 국가" icon={Globe} term="Top Production" desc="최근 국가별 총생산량" source="FAO FishStatJ - Recent Production by Country" situation="[Triopoly Hegemony] 중국, 인도, 에콰도르 3개국이 글로벌 양식 생산 물량의 절대다수를 통제하며, 사실상의 시장 독과점(Oligopoly/Triopoly) 헤게모니를 완벽하게 구축했습니다." actionPlan="**[Actionable Insight]** [Macro Risk Monitoring] 이 3대 메이저 국가의 기후변화(El Nino) 및 생물학적 리스크가 당사 영업이익(OPM)의 치명적 변수로 작용합니다. C/I/E(China/India/Ecuador) 벨트에 대한 퀀트 기반 실시간 리스크 모니터링 데스크를 즉각 신설하여 잉여현금흐름(FCF)을 극대화하십시오. (Strong Buy)">
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={top10Prod} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
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
  <WidgetCard title="글로벌 양식업 Top 10 기지" icon={Factory} term="Top Aqua Base" desc="양식업 집중 육성 국가 순위" source="FAO FishStatJ - Aquaculture by Country" situation="[Geopolitical Concentration Risk] 양식업의 구조적 주도권이 광활한 토지와 값싼 자본이 집약된 아시아 및 에콰도르(LATAM) 지역으로 극단적 쏠림(Geopolitical Concentration) 현상을 보이고 있습니다." actionPlan="**[Actionable Insight]** [FDI & Joint Venture Strategy] 무의미한 제3국 투자를 배제하십시오. 압도적 원물 소싱 캐파(CAPA)가 보장되는 인도 또는 에콰도르 핵심 기지에 직접투자(FDI) 기반의 조인트벤처(JV) 스마트 팩토리를 설립하여 서플라이 체인의 최상단을 점유해야 합니다. (Conviction Buy)">
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={top10Aqua} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
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
  <WidgetCard title="자연산 어획 잔존 세력 Top 10" icon={Anchor} term="Capture Remnants" desc="야생 새우 어획 선단 유지 국가" source="FAO FishStatJ - Capture by Country" situation="[Niche Market Dominance] 범용 양식업의 폭발적 팽창 속에서도, 중국과 아르헨티나는 거대 조업 선단을 활용해 붉은새우(Argentine Red Shrimp) 등 고부가가치 특수 어종 생태계(Niche Market)를 강력하게 장악하고 있습니다." actionPlan="**[Actionable Insight]** [Targeted Allocation Strategy] 양식(Vannamei)과 자연산 붉은새우(Argentine Red)의 타겟 소비층(Target Audience)은 완전히 디커플링(Decoupling)되어 있습니다. B2B 하이엔드 파인다이닝 전용으로 자연산 희귀 어획 물량을 독점 락인(Lock-in)하여 초격차 경쟁력을 확보하여 잉여현금흐름(FCF)을 극대화하십시오. (Strong Buy)">
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={top10Cap} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
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
  <WidgetCard title="양식업 부가가치 창출 Top 10" icon={DollarSign} term="Aqua Value Gen" desc="양식업으로 달러를 쓸어담는 국가" source="FAO FishStatJ - Aquaculture Value" situation="[Value Capture Monopoly] 글로벌 물량 생산량(Volume) Top 3 국가가 창출하는 부가가치(Value-Add) Top 3 순위와 완벽히 동기화(Synchronization)되며 극단적인 Bottom-line(순이익) 과점 체제(Oligopoly)를 완성했습니다." actionPlan="**[Actionable Insight]** [Pricing Power Hedging] 메이저 3국은 물량 공세(Dumping)를 넘어 글로벌 마켓 프라이싱 권한(Pricing Power)마저 독점하고 있습니다. 특정 국가에 대한 소싱 의존도(Exposure)를 30% 이하로 통제(Diversification)하여 공급망 병목 리스크(Bottleneck)를 완벽히 헤징(Hedging)해야 합니다. (Conviction Buy)">
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={top10AquaVal} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
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
  <WidgetCard title="자연산 어획량 정체 한계선(Ceiling)" icon={Activity} term="Catch Ceiling" desc="환경적 요인으로 인한 어획 한계" source="FAO FishStatJ - Capture Timeline Analysis" situation="[Capture Yield Stagnation] 극심한 해양 생태계 파괴 여파로 지난 20년간 글로벌 자연산 어획량은 3.5M 톤(Tonnes)의 완벽한 횡보 박스권(Stagnation Box)에 갇혀 한계치(Ceiling)에 도달했습니다." actionPlan="**[Actionable Insight]** [ESG Premium Exploitation] 자연산 새우의 희소 가치(Scarcity Value)는 영구적으로 치솟을 것입니다. MSC(해양관리협의회) 지속가능성 라벨링이 가능한 합법적 조업 쿼터(Quota)를 프리미엄 가격에 선제 싹쓸이(Buyout)하여 럭셔리 VVIP 라인업을 즉각 런칭하여 잉여현금흐름(FCF)을 극대화하십시오. (Strong Buy)">
    <SafeResponsiveContainer width="100%" height="100%">
      <ComposedChart data={captureCeiling} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} domain={[0, 'auto']} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="#64748b" opacity={0.6} />
        <ReferenceLine y={3500000} stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '생태계 허용 한계량 (3.5M Ton)', fill: 'var(--color-danger)', fontSize: 11 }} />
      </ComposedChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W10: HHI
export const W10_HHI = () => (
  <WidgetCard title="글로벌 생산 SCM 집중도 (HHI Index)" icon={Target} term="HHI Concentration" desc="Herfindahl-Hirschman Index 독점 체제 분석" source="Macro Intelligence Data derived from FAO" situation={`[HHI Supply Concentration] 현재 글로벌 HHI(허핀달-허쉬만 지수)는 약 ${Math.round(hhi)} 포인트 수준으로, 메이저 상위 3개국이 전체 서플라이 체인의 멱법칙(Power Law)을 완벽히 주도하는 강력한 중독점(Oligopoly) 체제를 시사합니다.`} actionPlan="**[Actionable Insight]** [Supply Chain Diversification Leverage] 공급망 다변화(Supply Chain Diversification) 헷징(Hedging)을 위해 멕시코, 베트남 등 '고성장 신흥 기지'의 Tier-2 벤더 물량을 의무적으로 15% 이상 할당(Allocation)하여, 메이저 3국과의 단가 협상 시 강력한 지렛대(Negotiation Leverage)로 활용하여 잉여현금흐름(FCF)을 극대화하십시오. (Strong Buy)">
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
      <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
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
