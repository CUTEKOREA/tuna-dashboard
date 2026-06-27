import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { TrendingUp, DollarSign, Scale, Truck, ShoppingCart, Flag } from 'lucide-react';
import { WidgetCard, tooltipStyle } from './ShrimpWidgetCommon';
import { tradeQtyMerged, tradeUsdMerged, recent5yr, topExportersQty, topImportersQty, topExportersUsd, topImportersUsd, tradeBalanceCountry, cagr1976 } from './ShrimpDataHelper';
import { ChartPatternDefs } from './ChartPatterns';

// W11: TradeVolLong
export const W11_TradeVolLong = () => (
  <WidgetCard title="수출입 물동량 롱텀 트렌드" icon={Truck} term="Trade Volume LT" desc="1976~2023년 글로벌 수출입 통관량(톤)" source="FAO FishStatJ 무역 시계열(수출입 물량, 1976~2023) · STATIC, 동기화 2026-05-29" situation="글로벌 새우 수출 통관량은 1976년 약 32만 톤에서 2023년 약 396만 톤으로 장기 우상향했고, 수입 물량도 동반 확대되며 양식 대량생산과 콜드체인 물류망 확장이 구조적 추세로 이어지고 있습니다." actionPlan="[상품화 차익] 새우 원물의 글로벌 상품화가 성숙기에 진입했습니다. 현지 생산 라인 신설보다 환율·판가 스프레드를 겨냥한 무역 차익(아비트라지) 데스크에 자본을 우선 배치하는 전략을 검토하십시오." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <ComposedChart data={tradeQtyMerged} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
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
  <WidgetCard title="무역 거래대금 롱텀 트렌드" icon={DollarSign} term="Trade Value LT" desc="1976~2023년 달러 환산 수출입 거래대금" source="FAO FishStatJ 무역 시계열(수출입 거래대금, 1976~2023) · STATIC, 동기화 2026-05-29" situation="물리적 톤수 대비 달러 거래대금이 장기적으로 더 가파르게 상승해, 탈각·포장 등 가공 고도화가 단위가치를 끌어올리는 추세를 보였습니다. 수출·수입 거래대금이 동반 확대되며 시장 규모가 구조적으로 커졌습니다." actionPlan="[가공 허브 내재화] 단순 벌크 수입 브로커리지 모델 의존도를 낮추십시오. 수입 1차 원물을 국내 허브에서 B2C 프리미엄 팩으로 소분해 스프레드 마진을 내부화하는 밸류에드 라인 구축을 검토하십시오." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <AreaChart data={tradeUsdMerged} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `$${(v/1000000).toFixed(0)}B`} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="export" name="수출 대금($)" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.4} />
        <Area type="monotone" dataKey="import" name="수입 대금($)" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.25} />
      </AreaChart>
    </SafeResponsiveContainer>
  </WidgetCard>
);

// W13: RecentTradeQty
export const W13_RecentTradeQty = () => (
  <WidgetCard title="최근 5개년 무역 물동량" icon={TrendingUp} term="Recent Qty" desc="2019~2023년 수출입 물량(톤) 비교" source="FAO FishStatJ 무역 데이터(2019~2023) · STATIC, 동기화 2026-05-29" situation="팬데믹과 지정학적 물류 대란 국면에서도 2019~2023년 기초 소비 물동량의 큰 훼손 없이 유지되어, 새우의 비교적 낮은 수요 탄력성(필수재 성격)을 시사합니다." actionPlan="[재고 운영 정교화] 수급 미스매치가 발생하는 구간을 모니터링하되, 검증되지 않은 투기성 포지션은 지양하고 냉동 보관·조달 타이밍을 조절하는 운영 차원의 재고 헤지로 한정하십시오." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={recent5yr} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
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
  <WidgetCard title="최근 5개년 무역 달러 규모" icon={DollarSign} term="Recent Value" desc="2019~2023년 수출입 거래대금(USD) 비교" source="FAO FishStatJ 무역 데이터(거래대금, 원자료 천USD 단위, 2019~2023) · STATIC, 동기화 2026-05-29" situation="2019~2023년 USD 거래 규모가 물량 대비 상대적으로 견조하게 유지되어 단가 전가가 일정 부분 작동했음을 시사합니다. 다만 '판가 100% 전가' 같은 단정은 본 데이터로 직접 확인되지 않습니다." actionPlan="[무역 금융 선제 관리] 수입 대금 규모 확대에 대비해 무역 금융 한도와 L/C 라인을 점검하되, 일률적 오버부킹 대신 실제 조달 계획에 연동한 단계적 한도 확보를 권고합니다." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={recent5yr} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
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
  <WidgetCard title="글로벌 수출 물량 Top 10" icon={Truck} term="Export Volume" desc="수출 물량(톤) 상위 10개국" source="FAO FishStatJ 무역 데이터(수출 물량 상위국, 2023) · STATIC, 동기화 2026-05-29" situation="에콰도르와 인도 양대 국가가 수출 물량 Top 10 합계의 약 60%를 차지하며 공급을 주도합니다(Top 10 기준이며 전 세계 전량 대비 비중은 아님). 두 나라 중심의 강한 양강 구조가 관측됩니다." actionPlan="[전략적 장기 계약] 신규 벤더 확충 시 물량 정점인 에콰도르 주요 수출 팩토리와의 다이렉트 장기 소싱 계약에 협상 자원을 우선 배치하는 방안을 검토하십시오." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={topExportersQty} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
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
  <WidgetCard title="글로벌 수입 물량 Top 10" icon={ShoppingCart} term="Import Volume" desc="수입 물량(톤) 상위 10개국" source="FAO FishStatJ 무역 데이터(수입 물량 상위국, 2023) · STATIC, 동기화 2026-05-29" situation="미국·중국이 양대 수입 마켓을 형성하고, 데이터상 유럽은 단일 EU 집계가 아니라 스페인·프랑스·독일·네덜란드 등 개별 국가로 분산되어 있습니다. 수요가 소수 거대 시장에 집중되는 구조입니다." actionPlan="[수급 변동 대응] 미중 무역 긴장이나 중국 내수 둔화로 글로벌 시장에 풀리는 잉여 물량을 모니터링해, 한국 로컬 수요에 맞춘 기회적 조달 채널을 점검하는 방안을 검토하십시오." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={topImportersQty} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
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
  <WidgetCard title="글로벌 수출 달러 파워 Top 10" icon={DollarSign} term="Export Value" desc="수출 금액(USD) 기준 상위 10개국" source="FAO FishStatJ 무역 데이터(수출 거래대금 상위국, 2023) · STATIC, 동기화 2026-05-29" situation="물량 순위와 달러 매출 순위가 일부 어긋나, 탈각·자숙 등 가공 부가가치를 더한 국가들이 금액 기준에서 상대적으로 강세를 보입니다(데이터상 에콰도르가 수출 금액 1위)." actionPlan="[부가가치 소싱으로 마진 방어] 원물 단가 경쟁 일변도 대신, 가공 역량이 높은 베트남·태국 팩토리의 완제품 브랜드를 B2B로 직접 연계하는 것이 로컬 영업이익률 방어에 유리할 수 있습니다." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={topExportersUsd} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
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
  <WidgetCard title="글로벌 수입 지출 달러 파워 랭킹" icon={Flag} term="Import Value" desc="수입 금액(USD) 기준 상위 10개국" source="FAO FishStatJ 무역 데이터(수입 거래대금 상위국, 2023) · STATIC, 동기화 2026-05-29" situation="데이터상 한국은 수입 금액 기준 약 7위로, 미국·중국·일본 등 거대 수입국에 이어 상위권에서 적지 않은 외환을 새우 수입에 지출하고 있습니다." actionPlan="단순 수입을 넘어, 본사 자본으로 베트남·인도네시아 등에 선급금을 지급해 조달 물량 확보력을 키우는 트레이딩 하우스 입지 강화를 검토하십시오." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={topImportersUsd} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
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
  <WidgetCard title="주요 국가간 무역수지(Surplus) 흑적자 현황" icon={Scale} term="Trade Surplus" desc="수출액 Top10 − 수입액 Top10 매칭 차액(자체 산출, 근사치)" source="FAO FishStatJ 수출·수입 거래대금 상위국 매칭 차액(자체 산출) · 한쪽 Top10에만 포함된 국가는 반대편이 0으로 처리되어 실제 전체 무역수지와 다를 수 있음 · STATIC, 동기화 2026-05-29" situation="수출 상위국은 흑자, 거대 소비국(미국·일본 등)은 적자로 나타나는 공급-소비 양극화가 관측됩니다. 단, 본 차액은 수출·수입 상위 10개국만 매칭한 근사치로, 한쪽 순위에만 든 국가는 반대편 값이 0으로 처리되어 정밀 무역수지와는 차이가 있습니다." actionPlan="수출 흑자국(공급)과 수입 적자국(소비)을 잇는 크로스보더 브로커리지로 물류 마진을 추가 창출하는 방안을 검토하십시오." telemetry={{ status: 'STATIC' }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={tradeBalanceCountry.slice(0, 10).concat(tradeBalanceCountry.slice(-3))} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
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
  <WidgetCard title="무역 팽창 엔진 (CAGR 속도계)" icon={TrendingUp} term="Compound Annual Growth Rate" desc="수출 물량 장기 연평균 성장률(1976~2023, 자체 산출)" source="FAO FishStatJ 수출 물량 시계열(1976~2023) 기반 CAGR 자체 산출 · STATIC, 동기화 2026-05-29" situation={`1976~2023년 글로벌 새우 수출 물량은 연평균 약 ${cagr1976}%로 장기 우상향했습니다. 다만 1976년 기저(약 32만 톤)가 작아 초기 구간의 성장률 영향이 큰 점은 감안해야 합니다.`} actionPlan="장기적으로 견조한 성장세를 보인 품목이나, 단가·수급 변동 리스크는 상존하므로 창고·인프라 확장은 수요 가시성에 연동해 단계적으로 진행하는 것을 권고합니다." telemetry={{ status: 'STATIC' }}>
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>1976 - Present CAGR</div>
      <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-warning)', fontFamily: 'monospace' }}>
        +{cagr1976}%
      </div>
      <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '16px', textAlign: 'center', padding: '0 20px' }}>
        수산물 중 <strong>장기 우상향 추세</strong>가 비교적 견조한 섹터로, 양식 확대와 글로벌 소비 증가가 성장을 뒷받침해 왔습니다.
      </div>
    </div>
  </WidgetCard>
);
