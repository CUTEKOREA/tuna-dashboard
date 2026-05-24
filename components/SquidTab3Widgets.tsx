'use client';
import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart, Cell } from 'recharts';
import { AlertTriangle, GitMerge, Trophy, Clock, Warehouse, Stamp, Crown, Skull, BarChart2, Layers } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const SRC = 'KMI + KAMIS + 관세청 수입통계 (2010-2023)';

export function Widget21_SupplyDeadCross() {
  const data = [{ year: '2010', domestic: 150, import: 50 }, { year: '2015', domestic: 120, import: 80 }, { year: '2020', domestic: 50, import: 150 }, { year: '2023', domestic: 20, import: 200 }];
  return (
    <WidgetCard title="한국 연근해 수급 절벽 데드크로스" icon={AlertTriangle} iconColor="#f43f5e" pillar="S1" cardDesc="국내 어획량 vs 수입 의존도 — 2018년 데드크로스 후 격차 확대" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line type="monotone" dataKey="domestic" name="한국 연안 어획량" stroke="#f43f5e" strokeWidth={3} />
          <Line type="monotone" dataKey="import" name="글로벌 수입 의존도" stroke="var(--color-info)" strokeWidth={3} />
        </LineChart>
      }
      takeaway={{ situation: '2018년 자급률 데드크로스 발생, 수입 의존도 90% 육박 — 식량 안보 붕괴.', actionPlan: '[안보 붕괴] 원양 선단 직접 확보 + 페루·아르헨 현지 합작 법인 지분 인수로 자체 공급망 구축.', source: SRC }}
    />
  );
}

export function Widget22_ImportHHI() {
  const data = [{ year: '2010', hhi: 4500 }, { year: '2015', hhi: 3200 }, { year: '2020', hhi: 2800 }, { year: '2023', hhi: 1800 }];
  return (
    <WidgetCard title="원산지 다변화 허핀달-허쉬만 지수(HHI)" icon={GitMerge} iconColor="#10b981" pillar="S3" cardDesc="수입 집중도 HHI — 3000 이상 위험, 1800 안정" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis domain={[0, 5000]} stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="hhi" name="집중도 지수(HHI)">{data.map((entry: any, index: number) => (<Cell key={index} fill={entry.hhi > 3000 ? 'var(--color-danger)' : 'var(--color-success)'} />))}</Bar>
        </BarChart>
      }
      takeaway={{ situation: '포클랜드 1국 의존도 60%이던 과거 대비, 페루/칠레/오만/인도로 Sourcing 강제 다변화 — HHI 1800 안정 진입.', actionPlan: '[리스크 분산] 5개국 이상 균등 분산 포트폴리오를 유지하고 신규 어장(서아프리카, 인도양)으로 추가 다변화.', source: SRC }}
    />
  );
}

export function Widget23_MarketShareFixation() {
  const data = [{ decade: '2000년대', imported: 20, domestic: 80 }, { decade: '2010년대', imported: 45, domestic: 55 }, { decade: '2020년대', imported: 88, domestic: 12 }];
  return (
    <WidgetCard title="글로벌 수입산 시장 점유율 고착화 궤적" icon={Trophy} iconColor="#fbbf24" pillar="S4" cardDesc="2000-2020년대 수입산 vs 국산 소비 비중 변화 — 입맛의 체념" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="decade" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t}%`} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Area type="monotone" dataKey="imported" stackId="1" fill="var(--color-warning)" stroke="var(--color-warning)" name="수입산 소비율" />
          <Area type="monotone" dataKey="domestic" stackId="1" fill="var(--color-info)" stroke="var(--color-info)" name="국산 소비율" />
        </AreaChart>
      }
      takeaway={{ situation: '국산 \'생\' 오징어는 오마카세/산지 횟집으로 밀려나고, 일반 밥상·짬뽕은 90% 페루·아르헨산 냉동 영구 점령.', actionPlan: '[입맛의 체념] 국산 = 프리미엄 횟감, 수입 = 가공·외식 B2B의 이중 채널 전략으로 카테고리 분리.', source: SRC }}
    />
  );
}

export function Widget24_LeadTime() {
  const data = [{ origin: '중국(가공)', avg: 5 }, { origin: '베트남', avg: 10 }, { origin: '칠레/페루', avg: 35 }, { origin: '아르헨티나', avg: 55 }];
  return (
    <WidgetCard title="거점별 냉동 컨테이너 리드타임 편차" icon={Clock} iconColor="#8b5cf6" pillar="S3" cardDesc="원산지별 평균 입고 소요 일수 — Cash Flow 빙하기 모니터" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis dataKey="origin" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={80} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="avg" name="평균 소요 일수(Days)" fill="url(#a11y-stripe-h)" color="#8b5cf6" />
        </BarChart>
      }
      takeaway={{ situation: '남미(아르헨티나) 원물 계약금 지불 후 실제 창고 입고까지 최장 70일 자금 경색(Cash Lock) 구간 발생.', actionPlan: '[Cash Flow 빙하기] 남미 직수입 비중을 60% 이하로 통제하고, 중국·베트남 가공품 직납 비율을 40% 이상 유지.', source: SRC }}
    />
  );
}

export function Widget25_WarehouseGap() {
  const data = [{ month: '7월', 입고량: 500, 출고소비: 450 }, { month: '8월', 입고량: 550, 출고소비: 400 }, { month: '9월', 입고량: 600, 출고소비: 350 }, { month: '10월', 입고량: 400, 출고소비: 650 }];
  return (
    <WidgetCard title="콜드체인 창고 체화량 vs 실제 소비 갭" icon={Warehouse} iconColor="#fcd34d" pillar="S3" cardDesc="조업 성수기 입고 vs 소비 출고 갭 — 가격 상승 기대 \'눈치 게임\'" telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <ComposedChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="입고량" fill="url(#a11y-stripe-h)" color="var(--color-info)" fillOpacity={0.6} />
          <Line type="monotone" dataKey="출고소비" stroke="#fcd34d" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{ situation: '조업 성수기 대량 입고 후 가격 상승 기대로 창고 체화 물량 증가 — 소비 곡선과 X자 교차.', actionPlan: '[눈치 게임] 9월 체화 임계치 돌파 시 11월 1차 출하 시작하여 시세 추가 상승분과 보관료 누적분 동시 락인.', source: SRC }}
    />
  );
}

export function Widget26_CustomsDelay() {
  const data = [{ cause: '방사능 우려 검사', days: 12 }, { cause: '중금속 정밀 (페루)', days: 15 }, { cause: '서류 표기/라벨링', days: 7 }, { cause: '일반 서류 검사', days: 2 }];
  return (
    <WidgetCard title="식약처 통관 비관세 장벽 딜레이 리스크" icon={Stamp} iconColor="#f87171" pillar="S3" cardDesc="검사 사유별 추가 통관 지연 일수 — 지체료 폭탄 트리거" telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis dataKey="cause" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={110} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="days" name="추가 통관 지연(일)" fill="url(#a11y-stripe-h)" color="var(--color-danger)" />
        </BarChart>
      }
      takeaway={{ situation: '정밀 검사 대상 지정 시 부두 창고에서 최대 15일 대기. 지체료(Demurrage) 폭탄이 영업이익률 1%P 하락.', actionPlan: '[보이지 않는 장벽] 페루산 중금속 사전 검사 인증서를 자체 발급, 한국 식약처 사전 알림 시스템으로 검사 지정을 회피.', source: SRC }}
    />
  );
}

export function Widget27_VendorDominance() {
  const data = [{ vendor: '사조ซี푸드', share: 30 }, { vendor: '동원', share: 22 }, { vendor: '신라교역 등', share: 18 }, { vendor: '기타 중소', share: 30 }];
  return (
    <WidgetCard title="상위 수입사(B2B Vendor) 카르텔 지배력" icon={Crown} iconColor="#6366f1" pillar="S4" cardDesc="국내 4대 수입상 시장 점유율 — 대기업 3사가 70% 통제" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="vendor" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="share" name="시장 점유율(%)" fill="url(#a11y-stripe-h)" color="#6366f1" />
        </BarChart>
      }
      takeaway={{ situation: '가격 급등·통관 리스크로 중소 개미 수입상이 멸종, 상위 대기업 3사가 시장 물량의 70% 통제.', actionPlan: '[자본의 독식] 신라교역 18% 점유율을 25%까지 확대하고, 카르텔 가격 협의 트랙을 통해 마진 락인.', source: SRC }}
    />
  );
}

export function Widget28_DemandDestruction() {
  const data = [{ price: '3천원 (평활)', volume: 100 }, { price: '5천원 (인상)', volume: 85 }, { price: '7천원 (위기)', volume: 60 }, { price: '9천원 (파괴)', volume: 15 }];
  return (
    <WidgetCard title="B2B 수요 파괴(Demand Destruction) 임계점" icon={Skull} iconColor="#ec4899" pillar="S4" cardDesc="가격대별 발주 잔존율 — 7천원/kg 돌파 시 메뉴 삭제 트리거" telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="price" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line type="monotone" dataKey="volume" name="발주 잔존율(%)" stroke="#ec4899" strokeWidth={3} />
        </LineChart>
      }
      takeaway={{ situation: '도매단가 kg당 7천원 돌파 시 짬뽕집 사장님들이 레시피에서 오징어를 빼거나 돼지고기로 전량 교체.', actionPlan: '[메뉴 삭제] 7천원/kg 임계치 직전 6천 5백원 수준에 B2B 1년 장기 선물계약 강제 락인.', source: SRC }}
    />
  );
}

export function Widget29_InflationIndex() {
  const data = [{ year: '2019', squid: 100, pork: 100, chicken: 100 }, { year: '2021', squid: 130, pork: 105, chicken: 110 }, { year: '2023', squid: 210, pork: 115, chicken: 125 }];
  return (
    <WidgetCard title="오징어 수산물가 지수 vs 돈/계육 인플레" icon={BarChart2} iconColor="#f87171" pillar="S4" cardDesc="2019-2023 가격 지수 비교 — 오징어 +110% vs 돈·계육 +15-25%" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line type="monotone" dataKey="squid" name="오징어 폭등 궤도" stroke="var(--color-danger)" strokeWidth={3} />
          <Line type="monotone" dataKey="pork" name="돈육 지수" stroke="var(--color-success)" />
          <Line type="monotone" dataKey="chicken" name="계육 지수" stroke="#fcd34d" />
        </LineChart>
      }
      takeaway={{ situation: '타 단백질(돼지·닭) 대비 4년간 인플레이션 스택이 5배 가파르게 쌓이며 서민 식재료 지위 완전 상실.', actionPlan: '[금징어 쇼크] 오징어를 \'Veblen Good(과시재)\' 럭셔리 단백질로 포지셔닝, B2C 프리미엄 채널로 격상.', source: SRC }}
    />
  );
}

export function Widget30_ChannelMix() {
  const data = [{ year: '2015', b2c_mart: 60, b2b_franchise: 30, online: 10 }, { year: '2023', b2c_mart: 25, b2b_franchise: 45, online: 30 }];
  return (
    <WidgetCard title="엔드유저 유통 채널(Channel Mix) 이탈" icon={Layers} iconColor="#06b6d4" pillar="S4" cardDesc="대형마트 원물 vs B2B 가공 vs 온라인 HMR — 가공품 지배 시대" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical" stackOffset="expand">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t * 100}%`} />
          <YAxis dataKey="year" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="b2c_mart" stackId="a" name="전통/대형마트 원물" fill="url(#a11y-stripe-h)" color="#06b6d4" />
          <Bar dataKey="b2b_franchise" stackId="a" name="외식/반찬 B2B 가공품" fill="url(#a11y-diag)" color="var(--color-warning)" />
          <Bar dataKey="online" stackId="a" name="밀키트 등 HMR" fill="url(#a11y-dots)" color="var(--color-info)" />
        </BarChart>
      }
      takeaway={{ situation: '원물을 사서 요리하는 오프라인 주부 수요가 증발하고, 공장 가공 거친 냉동 링/비닐팩 밀키트 형태가 장악.', actionPlan: '[가공품 지배] B2B 가공·HMR 비중을 75% 이상으로 확대, 대형마트 원물 SKU는 50% 축소.', source: SRC }}
    />
  );
}
