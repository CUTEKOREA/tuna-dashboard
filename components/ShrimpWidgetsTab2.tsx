import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, ReferenceLine, Tooltip as RechartsTooltip, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Globe, Anchor, TrendingUp, DollarSign, Layers, Factory, Activity, Target, Scale, Truck, ShoppingCart, Flag, ShieldCheck, PieChart as PieChartIcon, Settings, RefreshCw, BarChart2, Briefcase, Flame, Cog, AlertTriangle, DivideSquare, Compass, Link } from 'lucide-react';
import { WidgetCard, tooltipStyle, COLORS } from './ShrimpWidgetCommon';
import { tradeQtyMerged, tradeUsdMerged, recent5yr, topExportersQty, topImportersQty, topExportersUsd, topImportersUsd, tradeBalanceCountry, cagr1976 } from './ShrimpDataHelper';

// W11: TradeVolLong
export const W11_TradeVolLong = () => (
  <WidgetCard title="수출입 물동량 롱텀 트렌드" icon={Truck} term="Trade Volume LT" desc="1976년 이후 물동량" source="FAO Trade Timeline Qty" situation="[Global Logistics Expansion] 스마트 양식 기술의 대량생산과 글로벌 콜드체인(Cold Chain) 물류망의 결합으로 거시적 관점의 수출 물동량(Trade Volume) 곡선이 구조적 메가 트렌드(Mega-trend)에 진입했습니다." actionPlan="[Commoditization Arbitrage] 새우 원물 자체의 완벽한 글로벌 상품화(Commoditization)가 종료되었습니다. 복잡한 현지 생산 라인보다는 글로벌 환율 및 판가 스프레드를 타겟팅하는 환차익 무역(Arbitrage Trading) 데스크에 자본금(Capital)을 우선 배치하십시오.">
    <SafeResponsiveContainer width="100%" height="100%">
      <ComposedChart data={tradeQtyMerged} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="export" name="수출 통관량(Ton)" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.3} />
        <Line type="monotone" dataKey="import" name="수입 통관량(Ton)" stroke="var(--color-danger)" dot={false} strokeWidth={2} />
      </ComposedChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W12: TradeUsdLong
export const W12_TradeUsdLong = () => (
  <WidgetCard title="무역 거래대금 롱텀 트렌드" icon={DollarSign} term="Trade Value LT" desc="1976년 이후 달러 환산 규모" source="FAO Trade Timeline USD" situation="[Value-Add Margin Explosion] 단순 수율 향상을 초월하는 초정밀 탈각/포장 밸류에드(Value-Add) 공정의 고도화로, 물리적 톤수(Volume) 대비 절대적 달러 가치(Value)의 상승 계수(Multiplier)가 압도적으로 치솟고 있습니다." actionPlan="[Processing Hub Internalization] 단순 포대(Bulk) 수입 브로커리지 모델은 폐기해야 합니다. 수입 1차 원물을 국내 허브 클린룸에서 B2C 프리미엄 팩으로 소분(Re-packaging)하여 스프레드 마진을 100% 흡수하는 자체 밸류에드 라인(Value-Add Line)을 구축하십시오.">
    <SafeResponsiveContainer width="100%" height="100%">
      <AreaChart data={tradeUsdMerged} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${(v/1000000).toFixed(0)}B`} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="export" name="수출 대금($)" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.4} />
      </AreaChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W13: RecentTradeQty
export const W13_RecentTradeQty = () => (
  <WidgetCard title="최근 5개년 무역 물동량" icon={TrendingUp} term="Recent Qty" desc="최근 5년간 수출입 톤수 비교" source="FAO Recent Trade Data" situation="[Inelastic Demand Resilience] 팬데믹(COVID-19) 및 지정학적 물류 대란(Disruption)이라는 매크로 쇼크에도 기초 소비 물동량의 훼손이 전혀 발생하지 않는 극단적인 필수재(Inelastic Good) 방어력을 입증했습니다." actionPlan="[Speculative Inventory Operation] 수급 펀더멘털의 미스매치(Mismatch)가 발생하는 마이크로 윈도우를 포착하십시오. 물동량의 병목(Bottleneck) 구간에서 냉동 보관 주차를 극단적으로 조절하는 전술적 롱 포지션(Speculative Long Position) 투기 전략을 승인합니다.">
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={recent5yr} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="exportQty" name="수출 물량(Ton)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="importQty" name="수입 물량(Ton)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W14: RecentTradeUsd
export const W14_RecentTradeUsd = () => (
  <WidgetCard title="최근 5개년 무역 달러 규모" icon={DollarSign} term="Recent Value" desc="최근 5년간 거래 대금 단위 비교" source="FAO Recent Trade Data" situation="[Inflation Hedge Premium] 초인플레이션 국면에서 판가를 100% 전가(Pass-through)할 수 있는 최강의 헤지(Hedge) 자산으로, 전년 동기 대비 USD 거래 스케일의 레벨업(Level-up) 랠리가 지속 중입니다." actionPlan="[Trade Finance Preemption] 전사 재무 데스크(Treasury)에 즉시 지시하십시오. 폭증하는 수입 대금 스케일을 감당하기 위해 글로벌 은행의 무역 금융(Trade Finance) 한도 및 L/C 라인을 현재 대비 최소 30% 이상 선제적 오버부킹(Overbooking) 해야 캐시 플로우 마비를 막습니다.">
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={recent5yr} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${(v/1000000).toFixed(1)}B`} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="exportUsd" name="수출액(USD)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="importUsd" name="수입액(USD)" fill="#ec4899" radius={[4, 4, 0, 0]} />
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W15: ExpTop10Qty
export const W15_ExpTop10Qty = () => (
  <WidgetCard title="글로벌 수출 물량 Top 10" icon={Truck} term="Export Volume" desc="가장 많이 수출하는 국가" source="FAO Trade Recent" situation="[Duopoly Export Hegemony] 에콰도르(LATAM)와 인도(Asia) 양대 국가가 글로벌 덤핑 출하 물량의 50%를 장악하며 글로벌 공급을 쌍끌이하는 완벽한 양강 체제(Duopoly)를 구축했습니다." actionPlan="[Targeted Long-Term Contracting] 신규 벤더 확충 시 동남아권 브로커리지를 패스하십시오. 물량의 정점인 에콰도르 과야킬(Guayaquil) 메이저 수출 팩토리(Supplier) 대표단과의 다이렉트 롱텀(Long-term) 독점 소싱 계약에 협상 자원을 전면 투입해야 합니다.">
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={topExportersQty} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
        <YAxis dataKey="country" type="category" width={70} stroke="#94a3b8" fontSize={11} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="var(--color-success)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W16: ImpTop10Qty
export const W16_ImpTop10Qty = () => (
  <WidgetCard title="글로벌 수입 물량 Top 10" icon={ShoppingCart} term="Import Volume" desc="가장 많이 블랙홀처럼 빨아들이는 국가" source="FAO Trade Recent" situation="[Tri-Polar Demand Vacuum] 미국, 중국, 유럽연합(EU) 3대 메가 컨슈머 마켓이 전 세계 새우 물동량을 진공청소기처럼 빨아들이는 극단적인 수요 쏠림(Demand Tri-Polarization) 상태입니다." actionPlan="[Macro Disruption Arbitrage] 미중 무역 전쟁 텐션 및 중국의 내부 소비 셧다운 시 글로벌 시장에 강제 출하되는 '고아 물량(Orphaned Cargo)'을 실시간 모니터링 하십시오. 이를 초저가 덤핑으로 가로채어 한국 로컬 마켓에 쏟아붓는 극강의 아비트라지(Arbitrage) 채널을 세팅해야 합니다.">
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={topImportersQty} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
        <YAxis dataKey="country" type="category" width={70} stroke="#94a3b8" fontSize={11} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="var(--color-danger)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W17: ExpTop10Usd
export const W17_ExpTop10Usd = () => (
  <WidgetCard title="글로벌 수출 달러 파워 Top 10" icon={DollarSign} term="Export Value" desc="수출 금액(USD) 기준 랭킹" source="FAO Trade Recent" situation="[Value-Add Disruption Matrix] 순수 톤수(Volume) 랭킹을 완전히 무시하는, 초고정밀 탈각/자숙 밸류에드(Value-Add) 마진 장착 국가들의 경이적인 달러 매출 점유율 전복(Disruption) 현상이 목격됩니다." actionPlan="[Margin Defense via Value-Add Sourcing] 원물 단가 싸움에서 패배를 인정하십시오. 무식한 캐파를 앞세운 에콰도르 대신, 가공 기술의 정점에 선 베트남/태국 팩토리의 완제품(Finished Goods) 브랜드를 B2B로 다이렉트 꽂아 넣는 것이 로컬 마진(OPM) 수성에 절대적으로 유리합니다.">
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={topExportersUsd} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${(v/1000000).toFixed(1)}B`} />
        <YAxis dataKey="country" type="category" width={70} stroke="#94a3b8" fontSize={11} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W18: ImpTop10Usd
export const W18_ImpTop10Usd = () => (
  <WidgetCard title="글로벌 수입 지출 달러 파워 랭킹" icon={Flag} term="Import Value" desc="달러를 가장 많이 쓰는 수입국" source="FAO Trade Recent" situation="한국도 무시할 수 없는 수준(Top 10 끝자락)으로 많은 외환 기재를 수입 새우에 태우고 있습니다." actionPlan="단순 수입을 넘어, 한국 본사 자본으로 베트남이나 인니에 선급금(Pre-funding)을 지급하고 통물량을 장악하는 글로벌 트레이딩 하우스 입지를 굳히십시오.">
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={topImportersUsd} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${(v/1000000).toFixed(1)}B`} />
        <YAxis dataKey="country" type="category" width={70} stroke="#94a3b8" fontSize={11} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} />
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W19: TradeBalance
export const W19_TradeBalance = () => (
  <WidgetCard title="주요 국가간 무역수지(Surplus) 흑적자 현황" icon={Scale} term="Trade Surplus" desc="수출액 - 수입액" source="FAO Data Processed" situation="절대적 흑자를 기록하는 공급 허브와, 블랙홀처럼 빨아들여 적자를 내는 거대 소비 시장(미/일/유)의 양극화 구조." actionPlan="수출 흑자국(공급 파워셀러)과 수입 적자국(소비 타겟)을 연결하는 크로스보더(Cross-border) 브로커리지 팀을 신설하여 물류 마진을 추가 창출하십시오.">
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={tradeBalanceCountry.slice(0, 10).concat(tradeBalanceCountry.slice(-3))} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${(v/1000000).toFixed(1)}B`} />
        <YAxis dataKey="country" type="category" width={70} stroke="#94a3b8" fontSize={11} />
        <RechartsTooltip contentStyle={tooltipStyle} formatter={(v:any)=>[ `$${(v/1000).toFixed(0)}M`, '수지' ]} />
        <Bar dataKey="surplus" radius={[0, 4, 4, 0]}>
          {tradeBalanceCountry.slice(0, 10).concat(tradeBalanceCountry.slice(-3)).map((e:any, i:number) => (
            <Cell key={i} fill={e.surplus > 0 ? 'var(--color-success)' : 'var(--color-danger)'} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W20: TradeCAGR
export const W20_TradeCAGR = () => (
  <WidgetCard title="무역 팽창 엔진 (CAGR 속도계)" icon={TrendingUp} term="Compound Annual Growth Rate" desc="수출 물동량 장기 연평균 성장률" source="FAO Data Processed" situation={`1976년 이래 새우 글로벌 무역 물동량은 연평균 성장률(CAGR) 약 8%라는 경이로운 장기 우상향 복리 엔진을 가동해 왔습니다.`} actionPlan="수산업 전 종목 중 가장 강력한 복리 방어력을 가진 상품입니다. 사모펀드 자금을 유치하여 창고 인프라를 무한 확장하더라도 미스매칭(Mismatching) 리스크가 0에 수렴합니다.">
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>1976 - Present CAGR</div>
      <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-warning)', fontFamily: 'monospace' }}>
        +{cagr1976}%
      </div>
      <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '16px', textAlign: 'center', padding: '0 20px' }}>
        전통 수산업 중 <strong>유일하게 침체기를 모르는</strong> 우하향 불가역 섹터. 매일 배럴 단위로 소비량이 증가합니다.
      </div>
    </div>
  </WidgetCard>
);
