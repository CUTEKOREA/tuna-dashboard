'use client';
import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart, Cell } from 'recharts';
import { TrendingUp, Package, GitBranch, Award, CircleDollarSign, Layers, Fuel, Zap, Send, ArrowLeftRight } from 'lucide-react';
import WidgetCard from './WidgetCard';

const SRC = '관세청 C&F 단가 + KMI 수산물 마진 분석 (2019-2023)';

export function Widget31_PriceSpread() {
  const data = [{ month: '1월', peru: 2100, argentine: 2500, china: 2800 }, { month: '3월', peru: 2200, argentine: 2700, china: 2900 }, { month: '5월', peru: 2500, argentine: 3100, china: 3000 }, { month: '7월', peru: 2900, argentine: 3000, china: 3200 }];
  return (
    <WidgetCard title="원산지별 C&F 수입 단가 스프레드 수렴" icon={TrendingUp} iconColor="#10b981" pillar="S4" cardDesc="페루·아르헨·중국 3개 원산지 단가 갭 수렴 — 저가 방어막 붕괴" telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={250}
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
      takeaway={{ situation: '저가의 대명사였던 페루 대왕오징어 단가가 아르헨티나산 숏핀 단가와 갭을 좁히며 맹렬히 수렴.', actionPlan: '[저가 방어막 붕괴] 저가 페루 의존도 70% → 50%로 축소하고 아르헨·중국 분산 비중 확대.', source: SRC }}
    />
  );
}

export function Widget32_Shrinkflation() {
  const data = [{ year: '2020', price: 10000, actualWeight: 1000, labelWeight: 1000 }, { year: '2021', price: 10000, actualWeight: 850, labelWeight: 1000 }, { year: '2022', price: 10500, actualWeight: 750, labelWeight: 1000 }, { year: '2023', price: 11000, actualWeight: 600, labelWeight: 1000 }];
  return (
    <WidgetCard title="제품량 삭감(Shrinkflation) 실중량 추적기" icon={Package} iconColor="#fcd34d" pillar="S4" cardDesc="명목 가격 vs 실제 해동 중량 — 3년새 살코기 40% 증발" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="left" domain={[0, 12000]} stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 1200]} stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar yAxisId="right" dataKey="actualWeight" name="실제 해동 중량(g)" fill="#8b5cf6" fillOpacity={0.7} />
          <Line yAxisId="left" type="step" dataKey="price" name="판매 명목 가격(원)" stroke="#fcd34d" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{ situation: '소비자 인지 가격은 방어한 듯 보이나 해동 시 실제 살코기 중량이 3년새 40% 이상 증발.', actionPlan: '[기만적 인플레] 한국공정거래위원회 슈링크플레이션 규제 대응 — 실중량 정확 표기 + 단가 인상 정공법 전환.', source: SRC }}
    />
  );
}

export function Widget33_TariffArbitrage() {
  const data = [{ route: '남미 직수입', cost: 100, tariff: 20, margin: 10 }, { route: '중국 가공 우회', cost: 110, tariff: 0, margin: 25 }, { route: '베트남 우회', cost: 105, tariff: 0, margin: 30 }];
  return (
    <WidgetCard title="글로벌 정책/비관세 우회 가공 무역 차익" icon={GitBranch} iconColor="#10b981" pillar="S3" cardDesc="3개 라우트별 원가·관세·마진 비교 — FTA 우회 가공이 절대 공식" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical" stackOffset="expand">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t * 100}%`} />
          <YAxis dataKey="route" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={90} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="margin" name="최종 영업 마진율" stackId="a" fill="var(--color-success)" />
          <Bar dataKey="tariff" name="관세 차감분" stackId="a" fill="var(--color-danger)" />
          <Bar dataKey="cost" name="원가 및 운송비" stackId="a" fill="var(--color-info)" fillOpacity={0.5} />
        </BarChart>
      }
      takeaway={{ situation: '남미 직수입 시 20% 관세 폭탄을 회피하기 위해, 베트남에서 튜브 가공 후 무관세(FTA) 입항이 절대 공식화.', actionPlan: '[루트 아비트라지] 베트남 호치민 1차 가공 OEM 라인 100% 활용하여 한-베트남 FTA 무관세 혜택 풀 활용.', source: SRC }}
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
      takeaway={{ situation: '굶주림으로 어체 크기가 소형화되며, 정상 규격의 \'대형 특품\'은 돈을 주고도 못 구하는 하이엔드 럭셔리 진입.', actionPlan: '[희소성의 덫] 자동 그레이딩 설비 도입 + 대형 특품 100% 분리 추출(Skimming)하여 호텔·일식체인 VVIP 직납.', source: SRC }}
    />
  );
}

export function Widget35_FXHedging() {
  const data = [{ month: 'Jan', usd_krw: 1250, profit_margin: 12 }, { month: 'Mar', usd_krw: 1300, profit_margin: 8 }, { month: 'Jun', usd_krw: 1360, profit_margin: 2 }, { month: 'Sep', usd_krw: 1400, profit_margin: -5 }];
  return (
    <WidgetCard title="환율 민감도 연동 원가 헷징 레벨" icon={CircleDollarSign} iconColor="#fcd34d" pillar="S3" cardDesc="USD/KRW 환율 변동과 영업이익률 데드크로스 — 1,350원 임계선" telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="left" domain={[1200, 1450]} stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar yAxisId="right" dataKey="profit_margin" name="영업 흑자/적자(%)">{data.map((entry: any, index: number) => (<Cell key={index} fill={entry.profit_margin < 0 ? 'var(--color-danger)' : 'var(--color-success)'} />))}</Bar>
          <Line yAxisId="left" type="monotone" dataKey="usd_krw" name="환율(USD/KRW)" stroke="var(--color-warning)" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{ situation: '달러당 1,350원 돌파 시 C&F 결제 무역사들의 마진 룸 소멸. 선물환 사전 매수 여부가 생사를 가름.', actionPlan: '[매크로 폭격] 1,300원 이하 시 연간 쿼터 50% 이상 선물환(Forward) 매입으로 사전 락인.', source: SRC }}
    />
  );
}

export function Widget36_VASpread() {
  const data = [{ type: '원물 (Block)', value: 100 }, { type: '포장 변경', value: 110 }, { type: '내장/머리 제거 (H&G)', value: 140 }, { type: '절단 가공 (Ring/Tube)', value: 200 }];
  return (
    <WidgetCard title="가공 단계별 부가가치 전가 스프레드" icon={Layers} iconColor="#06b6d4" pillar="S2" cardDesc="원물 → 절단 가공 4단계별 판매 가치 인덱스 — 링 가공만으로 2배" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="type" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="value" name="판매 가치(Index)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{ situation: '원물 그대로 판매 시 마진 0에 수렴. 링(Ring)으로 한번만 써는 순간 단가 2배 폭증.', actionPlan: '[Value Add] 절단·가공 라인 CAPEX 투자를 최우선 순위로 격상, 원물 직판 비중을 30% 이하로 축소.', source: SRC }}
    />
  );
}

export function Widget37_FreightPremium() {
  const data = [{ year: '2021', wti: 60, freightCost: 15 }, { year: '2022(전쟁)', wti: 110, freightCost: 45 }, { year: '2023', wti: 80, freightCost: 25 }];
  return (
    <WidgetCard title="WTI 유가 / BDI 연동 해상 물류비 프리미엄" icon={Fuel} iconColor="#f87171" pillar="S3" cardDesc="유가 변동에 따른 냉동 컨테이너 운임 프리미엄 — 최대 45% 패널티" telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={250}
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
      takeaway={{ situation: '글로벌 유가 병목 시 수입 원가의 최고 45%가 순수 \'냉동 컨테이너 물류비\'로 지출되는 패널티 발생.', actionPlan: '[운임 충격] WTI $90 돌파 시 해상 운임 락인 장기 계약(COA) 비중을 60% 이상으로 확대.', source: SRC }}
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
      takeaway={{ situation: '살오징어 대체재로 모든 프랜차이즈가 대왕(훔볼트)을 찾자 수요 폭발로 4년새 원가 2.5배 퀀텀 점프.', actionPlan: '[신분 상승] 더 이상 \'저가 대체재\'가 아닌 프리미엄 원료로 재포지셔닝, B2C 단가도 +50% 상향 조정.', source: SRC }}
    />
  );
}

export function Widget39_ForwardSpot() {
  const data = [{ period: '시즌 전(선도)', price: 100 }, { period: '항해 중', price: 120 }, { period: '상장/하역', price: 160 }];
  return (
    <WidgetCard title="사전 선도계약(Forward) vs 스팟 펌핑 스프레드" icon={Send} iconColor="#67e8f9" pillar="S4" cardDesc="선도 계약 → 항해 → 하역 3단계별 단가 변동 — 60% 펌핑 차익" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="period" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="price" name="계약 체결 단가(Index)" fill="var(--color-info)">{data.map((entry: any, index: number) => (<Cell key={index} fill={index === 2 ? 'var(--color-danger)' : 'var(--color-info)'} />))}</Bar>
        </BarChart>
      }
      takeaway={{ situation: '항해 개시 전 흉어를 예감하고 선도 계약(입도선매)을 체결한 트레이딩 팀은 하역 시점 무위험 60% 펌핑 차익 시현.', actionPlan: '[위험의 대상] 시즌 시작 2개월 전 ENSO/CPUE 시그널 기반 선도 계약 비중을 50% 이상 락인.', source: SRC }}
    />
  );
}

export function Widget40_SubstitutionElasticity() {
  const data = [{ squid_increase: '+10%', substitute_rate: 15 }, { squid_increase: '+20%', substitute_rate: 35 }, { squid_increase: '+30%', substitute_rate: 70 }, { squid_increase: '+40%', substitute_rate: 95 }];
  return (
    <WidgetCard title="가격 상승폭 대비 레시피 대체 탄력성(Elasticity)" icon={ArrowLeftRight} iconColor="#10b981" pillar="S4" cardDesc="살오징어 가격 인상 시 대왕오징어 전환 비율 — 30% 인상 = 70% 전환" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="squid_increase" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t}%`} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line type="monotone" dataKey="substitute_rate" name="대왕징어로의 전환 비율(%)" stroke="var(--color-success)" strokeWidth={4} />
        </LineChart>
      }
      takeaway={{ situation: '일반 오징어 단가 30% 상승 시 B2B 식당들이 레시피를 대왕오징어로 70% 교체하는 티핑포인트 도달.', actionPlan: '[대체 폭주선] 살오징어 단가 +25% 임계치 직전 대왕오징어 원료 비축 60% 완료 — 대체 수요 100% 흡수.', source: SRC }}
    />
  );
}
