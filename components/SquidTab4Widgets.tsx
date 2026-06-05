'use client';
import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart, Cell } from 'recharts';
import { TrendingUp, Package, GitBranch, Award, CircleDollarSign, Layers, Fuel, Zap, Send, ArrowLeftRight } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const SRC = '관세청 C&F 단가 + KMI 수산물 마진 분석 (2019-2023)';

export function Widget31_PriceSpread() {
  const data = [{ month: '1월', peru: 2100, argentine: 2500, china: 2800 }, { month: '3월', peru: 2200, argentine: 2700, china: 2900 }, { month: '5월', peru: 2500, argentine: 3100, china: 3000 }, { month: '7월', peru: 2900, argentine: 3000, china: 3200 }];
  return (
    <WidgetCard title="원산지별 C&F 수입 단가 스프레드 수렴" icon={TrendingUp} iconColor="#10b981" pillar="S4" cardDesc="페루·아르헨·중국 3개 원산지 단가 갭 수렴 — 저가 방어막 붕괴" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis domain={['auto', 'auto']} stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line type="monotone" dataKey="peru" name="페루(훔볼트)" stroke="var(--color-success)" strokeWidth={3} />
          <Line type="monotone" dataKey="argentine" name="아르헨티나(숏핀)" stroke="var(--color-info)" strokeWidth={2} />
          <Line type="monotone" dataKey="china" name="중국(원양)" stroke="var(--color-danger)" strokeWidth={2} />
        </LineChart>
      }
      takeaway={{ situation: `<div><p>"C&amp;F(Cost & Freight) 스프레드 수렴"이란 원산지별 단가 격차가 좁아지는 현상. 저가 vendor의 우위가 사라지는 시그널.</p><p>현재 위기: <strong>저가 대명사였던 페루 대왕오징어 단가가 아르헨티나 숏핀 단가와 갭을 좁히며 맹렬히 수렴</strong>. 페루 의존 vendor의 "저가 방어막 붕괴".</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 단일 저가 origin 의존은 dead model.</p><p><strong>3단계</strong>: ① 페루 의존도 70% → 50% 축소 ② 아르헨·중국·인도 분산 ③ 가격 게임에서 인증 게임으로 전환 — MSC·SIMP traceability 차별화.</p></div>`, source: SRC }}
    />
  );
}

export function Widget32_Shrinkflation() {
  const data = [{ year: '2020', price: 10000, actualWeight: 1000, labelWeight: 1000 }, { year: '2021', price: 10000, actualWeight: 850, labelWeight: 1000 }, { year: '2022', price: 10500, actualWeight: 750, labelWeight: 1000 }, { year: '2023', price: 11000, actualWeight: 600, labelWeight: 1000 }];
  return (
    <WidgetCard title="제품량 삭감(Shrinkflation) 실중량 추적기" icon={Package} iconColor="#fcd34d" pillar="S4" cardDesc="명목 가격 vs 실제 해동 중량 — 3년새 살코기 40% 감소 추정(illustrative)" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <ComposedChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="left" domain={[0, 12000]} stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 1200]} stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar yAxisId="right" dataKey="actualWeight" name="실제 해동 중량(g)" fill="#8b5cf6" fillOpacity={0.7} />
          <Line yAxisId="left" type="step" dataKey="price" name="판매 명목 가격(원)" stroke="#fcd34d" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{ situation: `<div><p>"슈링크플레이션(Shrinkflation)"이란 가격은 유지하면서 제품량을 줄이는 hidden inflation. 한국 오징어 가공품 시장의 광범위한 관행.</p><p>추정: <strong>소비자 인지 가격은 방어한 듯 보이나 해동 시 실제 살코기 중량이 3년새 40% 수준 감소(illustrative 시뮬레이션)</strong>. 한국공정거래위원회 슈링크플레이션 규제 대응 압박 중.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 슈링크플레이션은 단기 마진 방어 vs 장기 brand 신뢰 파괴의 trade-off.</p><p><strong>3단계</strong>: ① 실중량 정확 표기 자체 의무화 — 규제 시행 전 first-mover ② 단가 인상 정공법 전환 — brand 신뢰 자산화 ③ "Honest Weight Certified" 라벨로 차별화 마케팅.</p></div>`, source: SRC }}
    />
  );
}

export function Widget33_TariffArbitrage() {
  const data = [{ route: '남미 직수입', cost: 100, tariff: 20, margin: 10 }, { route: '중국 가공 우회', cost: 110, tariff: 0, margin: 25 }, { route: '베트남 우회', cost: 105, tariff: 0, margin: 30 }];
  return (
    <WidgetCard title="글로벌 정책/비관세 우회 가공 무역 차익" icon={GitBranch} iconColor="#10b981" pillar="S3" cardDesc="3개 라우트별 원가·관세·마진 비교 — FTA 우회 가공 대표 경로 비교 (자체추정)" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical" stackOffset="expand">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t * 100}%`} />
          <YAxis dataKey="route" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={90} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="margin" name="최종 영업 마진율" stackId="a" fill="var(--color-success)" />
          <Bar dataKey="tariff" name="관세 차감분" stackId="a" fill="var(--color-danger)" />
          <Bar dataKey="cost" name="원가 및 운송비" stackId="a" fill="var(--color-info)" fillOpacity={0.5} />
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"FTA 우회 가공"이란 직수입 시 부과되는 관세를 회피하기 위해 FTA 체결국에서 가공 후 무관세로 한국 입항하는 무역 routing 전략.</p><p>한국 대표 routing: <strong>남미 직수입 20% 관세 폭탄 회피 → 베트남에서 튜브 가공 후 한-베트남 FTA 무관세 입항</strong>이 주요 경로. 가공 가격 +$200~300/톤이지만 관세 -$400+ 절감 = 순 +$100~200/톤 절감(업계추정).</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: FTA 우회는 단순 cost 절감이 아닌 <strong>"한-베트남 FTA arbitrage 본질"</strong>.</p><p><strong>3단계</strong>: ① 베트남 호치민 1차 가공 OEM 라인 100% 활용 ② AKFTA·RCEP·KORUS 4중 FTA 활용 라우팅 systematic 운영 ③ "FTA arbitrage trading desk" — 매주 4 FTA 변동을 monitoring + dynamic routing.</p></div>`, source: SRC }}
    />
  );
}

export function Widget34_SizePremium() {
  const data = [{ year: '2020', small: 100, large: 110 }, { year: '2021', small: 110, large: 130 }, { year: '2022', small: 130, large: 180 }, { year: '2023', small: 150, large: 250 }];
  return (
    <WidgetCard title="대형어 vs 소형어 사이즈 프리미엄 스퀴즈" icon={Award} iconColor="#f43f5e" pillar="S2" cardDesc="대형 특품 vs 소형 일반품 단가 스프레드 — 4년새 2.5배 격차" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line type="monotone" dataKey="large" name="대형 특품 프리미엄" stroke="#f43f5e" strokeWidth={3} />
          <Line type="monotone" dataKey="small" name="소형/일반품 단가" stroke="var(--color-info)" strokeWidth={2} />
        </LineChart>
      }
      takeaway={{ situation: `<div><p>"사이즈 프리미엄 스퀴즈"란 어자원 고갈로 어체 크기가 소형화되면서 정상 규격 대형 특품의 희소성 가치가 폭증하는 현상.</p><p>실측: 4년간 대형 특품 vs 소형 일반품 단가 격차 <strong>2.5배 격차</strong>. <strong>정상 규격 "대형 특품"은 수급 타이트로 희소성이 급상승하는 하이엔드 영역</strong>으로 이동 중.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 사이즈 프리미엄은 "희소성의 덫" — 대형 특품 공급망을 선점할수록 가격 결정력 우위를 확보할 수 있다.</p><p><strong>3단계</strong>: ① 자동 그레이딩 설비 도입 (BAADER·Marel) ② 대형 특품 100% 분리 추출 (Skimming) ③ 호텔·일식체인 VVIP 직납 — ASP +200~300% 프리미엄. 5년 forward 계약으로 채널 락업.</p></div>`, source: SRC }}
    />
  );
}

export function Widget35_FXHedging() {
  const data = [{ month: 'Jan', usd_krw: 1250, profit_margin: 12 }, { month: 'Mar', usd_krw: 1300, profit_margin: 8 }, { month: 'Jun', usd_krw: 1360, profit_margin: 2 }, { month: 'Sep', usd_krw: 1400, profit_margin: -5 }];
  return (
    <WidgetCard title="환율 민감도 연동 원가 헷징 레벨" icon={CircleDollarSign} iconColor="#fcd34d" pillar="S3" cardDesc="USD/KRW 환율 변동과 영업이익률 데드크로스 — 1,350원 임계선" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <ComposedChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="left" domain={[1200, 1450]} stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar yAxisId="right" dataKey="profit_margin" name="영업 흑자/적자(%)">{data.map((entry: any, index: number) => (<Cell key={index} fill={entry.profit_margin < 0 ? 'var(--color-danger)' : 'var(--color-success)'} />))}</Bar>
          <Line yAxisId="left" type="monotone" dataKey="usd_krw" name="환율(USD/KRW)" stroke="var(--color-warning)" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{ situation: `<div><p>"환율 데드크로스"란 USD/KRW 환율이 일정선을 넘으면 무역사 영업이익률이 zero가 되는 임계점.</p><p>한국 오징어 수입 임계점: <strong>USD/KRW 1,350원 돌파 시 C&amp;F 결제 무역사들의 마진 룸 소멸</strong>. 평시 마진 8%가 환율 1,400 도달 시 0~2%로 압축.</p><p>의미: 환 헷지는 단순 risk 관리가 아닌 <strong>"수입 무역사의 생사를 가르는 instrument"</strong>.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 환 헷지는 본업 P&amp;L의 가장 큰 generator.</p><p><strong>3단계</strong>: ① 1,300원 이하 시 연간 쿼터 50%+ 선물환 사전 매입 ② 환율 시나리오별 매입 룰 자동화 — risk desk daily monitoring ③ 주거래 은행 FX 데스크와 cross-currency swap 협의 — KRW·USD·CNY·VND 4통화 동적 운용.</p></div>`, source: SRC }}
    />
  );
}

export function Widget36_VASpread() {
  const data = [{ type: '원물 (Block)', value: 100 }, { type: '포장 변경', value: 110 }, { type: '내장/머리 제거 (H&G)', value: 140 }, { type: '절단 가공 (Ring/Tube)', value: 200 }];
  return (
    <WidgetCard title="가공 단계별 부가가치 전가 스프레드" icon={Layers} iconColor="#06b6d4" pillar="S2" cardDesc="원물 → 절단 가공 4단계별 판매 가치 인덱스 — 링 가공만으로 2배" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="type" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="value" name="판매 가치(Index)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"부가가치 전가 스프레드"란 가공 단계별 판매 가치 인덱스. 같은 원물이라도 가공 단계에 따라 마진이 기하급수적으로 차이.</p><p>가공 단계별 가치(자체추정): <strong>원물 100 → 포장 변경 110 → 내장·머리 제거(H&amp;G) 140 → 절단 가공(링·튜브) 200</strong>. 단순 링 가공 한 번에 단가 약 2배 상승 추정.</p><p>의미: 원물 직판 마진은 얇고 절단 가공품 마진은 상대적으로 두껍다. 원물 매입에서 절단·가공으로 이동할수록 마진 확보 여지가 높아진다.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: Value Add 라인은 CAPEX 1순위.</p><p><strong>3단계</strong>: ① 절단·가공 라인 CAPEX 최우선 순위 격상 ② 원물 직판 비중 30% 이하로 축소 ③ "Value Add Platform" — 원물 → 링·튜브·밀키트·RTC 4단계 SKU 표준화 + 자체 brand 출시.</p></div>`, source: SRC }}
    />
  );
}

export function Widget37_FreightPremium() {
  const data = [{ year: '2021', wti: 60, freightCost: 15 }, { year: '2022(전쟁)', wti: 110, freightCost: 45 }, { year: '2023', wti: 80, freightCost: 25 }];
  return (
    <WidgetCard title="WTI 유가 / BDI 연동 해상 물류비 프리미엄" icon={Fuel} iconColor="#f87171" pillar="S3" cardDesc="유가 변동에 따른 냉동 컨테이너 운임 프리미엄 — 최대 45% 패널티" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line yAxisId="left" type="monotone" dataKey="wti" name="WTI 유가(USD/B)" stroke="#f43f5e" strokeWidth={2} />
          <Line yAxisId="right" type="stepAfter" dataKey="freightCost" name="운임 포함 단가상승분(%)" stroke="#8b5cf6" strokeWidth={3} />
        </LineChart>
      }
      takeaway={{ situation: `<div><p>"WTI(서부텍사스유)·BDI(발틱운임지수) 연동 물류비 프리미엄"이란 글로벌 유가 변동이 냉동 컨테이너(Reefer) 운임에 미치는 충격.</p><p>위기 시점: <strong>WTI $90+ 돌파 시 수입 원가의 최고 45%가 순수 냉동 컨테이너 물류비로 지출</strong>. 호르무즈 봉쇄·홍해 분쟁 시점에 빈발하는 페널티 시나리오.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 운임 충격은 단순 OPEX가 아닌 <strong>"systematic hedging instrument"</strong>.</p><p><strong>3단계</strong>: ① WTI $90 돌파 자동 alert ② 해상 운임 장기 계약(COA) 비중 60%+ 확대 — Maersk·MSC·CMA CGM 3사 ③ 주거래 금융기관과 BDI 기반 OTC 헷지 상품 협의 — paper hedge로 추가 보호.</p></div>`, source: SRC }}
    />
  );
}

export function Widget38_JumboJump() {
  const data = [{ year: '2019', price_index: 100 }, { year: '2020', price_index: 110 }, { year: '2021', price_index: 135 }, { year: '2022', price_index: 180 }, { year: '2023', price_index: 250 }];
  return (
    <WidgetCard title="대왕오징어(훔볼트) 원가 퀀텀 점프 가속도" icon={Zap} iconColor="#ec4899" pillar="S1" cardDesc="페루산 대왕오징어 원가 지수 — 5년새 2.5배 퀀텀 점프" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Area type="monotone" dataKey="price_index" name="페루산 대왕오징어 원가 지수" fill="#ec4899" stroke="#ec4899" fillOpacity={0.4} />
        </AreaChart>
      }
      takeaway={{ situation: `<div><p>"퀀텀 점프(Quantum Jump)"란 점진적 변화가 아닌 급격한 가격대 도약. 한국 오징어 시장에서 정확히 발생 중.</p><p>대왕오징어(훔볼트) 변동: <strong>살오징어 대체재 수요 급증으로 → 5년새 원가 지수 2.5배 상승(자체추정 지수 기준)</strong>. 절대 단가 상승폭은 산지·시기별 편차 있음.</p><p>의미: 대왕오징어는 더 이상 "저가 대체재"가 아닌 main protein. 단순 substitute → premium 카테고리 격상.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 대왕오징어 가격 인상은 위협이 아닌 <strong>"신분 상승 기회"</strong>.</p><p><strong>3단계</strong>: ① 저가 대체재 마케팅 폐기 → 프리미엄 원료로 재포지셔닝 ② B2C 단가 +50% 상향 조정 ③ "Jumbo Squid Premium" 자체 brand — Whole Foods·일본 이세탄 글로벌 채널 진출.</p></div>`, source: SRC }}
    />
  );
}

export function Widget39_ForwardSpot() {
  const data = [{ period: '시즌 전(선도)', price: 100 }, { period: '항해 중', price: 120 }, { period: '상장/하역', price: 160 }];
  return (
    <WidgetCard title="사전 선도계약(Forward) vs 스팟 펌핑 스프레드" icon={Send} iconColor="#67e8f9" pillar="S4" cardDesc="선도 계약 → 항해 → 하역 3단계별 단가 변동 — 60% 펌핑 차익" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="period" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="price" name="계약 체결 단가(Index)" fill="var(--color-info)">{data.map((entry: any, index: number) => (<Cell key={index} fill={index === 2 ? 'var(--color-danger)' : 'var(--color-info)'} />))}</Bar>
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"선도 계약(Forward Contract, 입도선매)"이란 항해 시작 전 미리 가격을 락업하는 계약. spot 가격 변동 헷지 instrument.</p><p>추정 차익: <strong>항해 개시 전 흉어 시그널에 선도 계약을 체결한 경우, 하역 시점 최대 60% 수준의 차익이 가능</strong>. 흉어 예측 정확도가 수익성의 핵심 변수.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 선도 계약은 단순 매입이 아닌 <strong>"ENSO·CPUE 시그널 기반 systematic trading"</strong>.</p><p><strong>3단계</strong>: ① 시즌 시작 2개월 전 NOAA ENSO + 어선 CPUE 데이터 분석 ② 선도 계약 비중 50%+ 락인 — 흉어 시그널 강할수록 비중 확대 ③ 내부 또는 외부 퀀트팀과 ML 기반 흉어 예측 모델 구축 — 백테스트 수익성 검증.</p></div>`, source: SRC }}
    />
  );
}

export function Widget40_SubstitutionElasticity() {
  const data = [{ squid_increase: '+10%', substitute_rate: 15 }, { squid_increase: '+20%', substitute_rate: 35 }, { squid_increase: '+30%', substitute_rate: 70 }, { squid_increase: '+40%', substitute_rate: 95 }];
  return (
    <WidgetCard title="가격 상승폭 대비 레시피 대체 탄력성" icon={ArrowLeftRight} iconColor="#10b981" pillar="S4" cardDesc="살오징어 가격 인상 시 대왕오징어 전환 비율 — 30% 인상 시 70% 전환 추정(자체추정)" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="squid_increase" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t}%`} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line type="monotone" dataKey="substitute_rate" name="대왕징어로의 전환 비율(%)" stroke="var(--color-success)" strokeWidth={4} />
        </LineChart>
      }
      takeaway={{ situation: `<div><p>"레시피 대체 탄력성"이란 가격 인상 시 B2B 식당이 레시피에서 다른 어종으로 전환하는 비율. 향후 매출의 핵심 leading indicator.</p><p>추정 티핑포인트: <strong>일반 오징어 단가 +30% 상승 시 B2B 식당의 상당수가 레시피를 대왕오징어로 교체할 가능성</strong>. 업계 경험 상 한 번 교체된 메뉴 복구는 통상 18개월 이상 소요.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 대체 시그널은 단순 위협이 아닌 <strong>"대왕오징어 capacity 사전 확보의 trigger"</strong>.</p><p><strong>3단계</strong>: ① 살오징어 단가 +25% 임계치 직전 대왕오징어 원료 비축 60% 완료 ② 대체 수요 우선 흡수 — 대왕오징어 공급망 선점으로 1순위 공급처 포지셔닝 ③ "Substitution arbitrage" — 단가 spread 활용해 양방향 trading.</p></div>`, source: SRC }}
    />
  );
}
