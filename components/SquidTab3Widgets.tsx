'use client';
import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart, Cell } from 'recharts';
import { AlertTriangle, GitMerge, Trophy, Clock, Warehouse, Stamp, Crown, Skull, BarChart2, Layers } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

const SRC = 'KMI + KAMIS + 관세청 수입통계 (2010-2023)';

export function Widget21_SupplyDeadCross() {
  const data = [{ year: '2010', domestic: 150, import: 50 }, { year: '2015', domestic: 120, import: 80 }, { year: '2020', domestic: 50, import: 150 }, { year: '2023', domestic: 20, import: 200 }];
  return (
    <WidgetCard title="한국 연근해 수급 절벽 데드크로스" icon={AlertTriangle} iconColor="#f43f5e" pillar="S1" cardDesc="국내 어획량 vs 수입 의존도 — 2018년 데드크로스 후 격차 확대" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Line type="monotone" dataKey="domestic" name="한국 연안 어획량" stroke="#f43f5e" strokeWidth={3} />
          <Line type="monotone" dataKey="import" name="글로벌 수입 의존도" stroke="var(--color-info)" strokeWidth={3} />
        </LineChart>
      }
      takeaway={{ situation: `<div><p>"데드크로스(Death Cross)"란 두 trend line이 교차해 한 쪽이 영구히 우위를 잃는 결정적 변곡점.</p><p>한국 오징어 자급률 위기: <strong>2018년 자급률 vs 수입 의존 데드크로스 발생</strong>. 수입 의존도 상승세 지속 — 단순 무역 패턴이 아닌 식량 안보 구조 문제. (KMI·관세청 통계 기반, 업계추정 포함)</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 자급률은 통계가 아닌 <strong>"국가 식량 안보 instrument"</strong>.</p><p><strong>3단계</strong>: ① 원양 선단 직접 확보 capex ② 페루·아르헨 현지 합작 법인 minority equity 인수 (자원국 인사이더) ③ 해양수산부 식량 안보 산업 자금 활용 partnership.</p></div>`, source: SRC }}
    />
  );
}

export function Widget22_ImportHHI() {
  const data = [{ year: '2010', hhi: 4500 }, { year: '2015', hhi: 3200 }, { year: '2020', hhi: 2800 }, { year: '2023', hhi: 1800 }];
  return (
    <WidgetCard title="원산지 다변화 허핀달-허쉬만 지수(HHI)" icon={GitMerge} iconColor="#10b981" pillar="S3" cardDesc="수입 집중도 HHI — 3000 이상 위험, 1800 안정 (자체추정, KMI·관세청 기반)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis domain={[0, 5000]} stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Bar dataKey="hhi" name="집중도 지수(HHI)">{data.map((entry: any, index: number) => (<Cell key={index} fill={entry.hhi > 3000 ? 'var(--color-danger)' : 'var(--color-success)'} />))}</Bar>
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"HHI(Herfindahl-Hirschman Index)"는 시장 집중도 측정 지수. 3,000+ 위험, 1,800 안정.</p><p>한국 오징어 수입 HHI 추이: 포클랜드 단일 의존 구조에서 페루·칠레·오만·인도로 다변화 후 집중도 완화 추세 (업계추정 기반, 정확한 HHI 수치는 관세청 원자료 확인 필요). 영해 분쟁(포클랜드)·정치 리스크 충격 완화.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: HHI 1,800은 단순 분산이 아닌 <strong>"향후 5년 추가 다변화의 기준선"</strong>.</p><p><strong>3단계</strong>: ① 5개국 이상 균등 분산 portfolio 유지 ② 신규 어장 진입 — 서아프리카(모로코·모리타니)·인도양(예멘) 라이선스 forward 락업 ③ HHI 1,500 이하 목표 — 어느 한 국가 정치 충격에도 매입 안정.</p></div>`, source: SRC }}
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
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Area type="monotone" dataKey="imported" stackId="1" fill="var(--color-warning)" stroke="var(--color-warning)" name="수입산 소비율" />
          <Area type="monotone" dataKey="domestic" stackId="1" fill="var(--color-info)" stroke="var(--color-info)" name="국산 소비율" />
        </AreaChart>
      }
      takeaway={{ situation: `<div><p>한국 오징어 시장의 2000~2020년대 구조 변화: 국산 자원 감소로 <strong>국산 "생" 오징어는 프리미엄 횟집(luxury) 중심으로, 일반 외식·가정용은 페루·아르헨산 냉동 비중이 크게 높아짐</strong>. (비중 수치는 업계추정)</p><p>"입맛의 체념(Taste Resignation)" — 소비자가 수입 냉동을 default로 인식하는 경향이 강화. 이 구조는 단기간 역전이 어려운 추세.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 시장 분리는 위협이 아닌 <strong>"이중 채널 전략의 자연스러운 기반"</strong>.</p><p><strong>3단계</strong>: ① 국산 = 프리미엄 횟감 라인 (ASP +200~300%) — 미슐랭 스시·산지 직거래 ② 수입 = 가공·외식 B2B 라인 (volume 베이스) ③ 두 채널 분리 운영으로 마진 +12~18%p.</p></div>`, source: SRC }}
    />
  );
}

export function Widget24_LeadTime() {
  const data = [{ origin: '중국(가공)', avg: 5 }, { origin: '베트남', avg: 10 }, { origin: '칠레/페루', avg: 35 }, { origin: '아르헨티나', avg: 55 }];
  return (
    <WidgetCard title="거점별 냉동 컨테이너 리드타임 편차" icon={Clock} iconColor="#8b5cf6" pillar="S3" cardDesc="원산지별 평균 입고 소요 일수 — 업계추정 (실측치 아님)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis dataKey="origin" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={80} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Bar dataKey="avg" name="평균 소요 일수(Days)" fill="#8b5cf6" />
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"리드타임 편차(Lead Time Variance)"란 원물 계약 → 실제 창고 입고까지 걸리는 시간. 거점별 차이가 cash flow에 직접 영향.</p><p>업계추정: 남미 아르헨티나 원물은 계약금 지불 후 창고 입고까지 장기 소요 — 자금 경색(Cash Lock) 구간 발생 가능. 중국·베트남 가공품 직납은 상대적으로 단기. (실측치 검증 필요)</p><p>의미: 단순 logistics 차이가 아닌 <strong>"working capital 회전율 격차"</strong>. 70일 cash lock vendor는 매출 기준 자본 효율 -25~35%.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 리드타임은 단순 logistics가 아닌 <strong>"cash flow optimization instrument"</strong>.</p><p><strong>3단계</strong>: ① 남미 직수입 비중 60% 이하로 통제 ② 중국·베트남 가공품 직납 비율 40% 이상 유지 — cash cycle -50% ③ JP Morgan Trade Finance와 90-day deferred payment 패키지 — cash lock 부담 transfer.</p></div>`, source: SRC }}
    />
  );
}

export function Widget25_WarehouseGap() {
  const data = [{ month: '7월', 입고량: 500, 출고소비: 450 }, { month: '8월', 입고량: 550, 출고소비: 400 }, { month: '9월', 입고량: 600, 출고소비: 350 }, { month: '10월', 입고량: 400, 출고소비: 650 }];
  return (
    <WidgetCard title="콜드체인 창고 체화량 vs 실제 소비 갭" icon={Warehouse} iconColor="#fcd34d" pillar="S3" cardDesc="조업 성수기 입고 vs 소비 출고 갭 — 업계추정·자체추정 (illustrative)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <ComposedChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Bar dataKey="입고량" fill="var(--color-info)" fillOpacity={0.6} />
          <Line type="monotone" dataKey="출고소비" stroke="#fcd34d" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{ situation: `<div><p>"체화량 vs 소비 갭"이란 콜드체인 창고에 입고된 원물 vs 실제 출고·소비량의 차이. 정상 시즌은 비슷하게 움직이지만 가격 상승 기대 시 vendor가 출고 지연.</p><p>업계추정 패턴: 조업 성수기(7~9월) 대량 입고 + 가격 상승 기대로 출고 지연 발생, 소비 곡선과 격차 형성 가능. 보관료 누적으로 눈치 게임 구조. (차트 수치는 구조 설명용 추정치)</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 체화 게임의 timing optimization이 마진의 30%를 좌우.</p><p><strong>3단계</strong>: ① 9월 체화 임계치 돌파 자동 alert ② 11월 1차 출하 시작 — 시세 추가 상승분 + 보관료 누적분 동시 락인 ③ JP Morgan Commodity Quant Desk와 inventory optimization ML 모델 collab.</p></div>`, source: SRC }}
    />
  );
}

export function Widget26_CustomsDelay() {
  const data = [{ cause: '방사능 우려 검사', days: 12 }, { cause: '중금속 정밀 (페루)', days: 15 }, { cause: '서류 표기/라벨링', days: 7 }, { cause: '일반 서류 검사', days: 2 }];
  return (
    <WidgetCard title="식약처 통관 비관세 장벽 딜레이 리스크" icon={Stamp} iconColor="#f87171" pillar="S3" cardDesc="검사 사유별 추가 통관 지연 일수 — 업계추정 (illustrative)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis dataKey="cause" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={110} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Bar dataKey="days" name="추가 통관 지연(일)" fill="var(--color-danger)" />
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"비관세 장벽(Non-Tariff Barrier)"이란 관세 외의 검사·인증·표준 등 통관 지연 요인. 글로벌 무역에서 cost 영향이 관세보다 큰 경우 많음.</p><p>한국 식약처 정밀 검사 지정 시 부두 창고 대기 및 Demurrage(지체료) 발생으로 영업이익률에 영향. 페루산 중금속·아르헨티나 미생물 의심이 주요 트리거. (지연 일수는 업계추정 기준)</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 비관세 장벽은 단순 risk가 아닌 <strong>"vendor whitelist 등재 instrument"</strong>.</p><p><strong>3단계</strong>: ① 페루산 중금속 사전 검사 인증서 자체 발급 — 식약처 사전 알림 시스템 등록 ② "Pre-cleared vendor" 지위 획득 — 정밀 검사 면제 ③ 이 시스템을 SaaS로 mid-tier 수입사에 라이센싱.</p></div>`, source: SRC }}
    />
  );
}

export function Widget27_VendorDominance() {
  const data = [{ vendor: '사조씨푸드', share: 30 }, { vendor: '동원', share: 22 }, { vendor: '신라교역 등', share: 18 }, { vendor: '기타 중소', share: 30 }];
  return (
    <WidgetCard title="상위 수입사(B2B Vendor) 카르텔 지배력" icon={Crown} iconColor="#6366f1" pillar="S4" cardDesc="국내 4대 수입상 시장 점유율 — 업계추정 (실측 점유율 아님)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="vendor" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Bar dataKey="share" name="시장 점유율(%)" fill="#6366f1" />
        </BarChart>
      }
      takeaway={{ situation: `<div><p>한국 오징어 B2B 수입 시장은 가격 급등·통관 리스크로 중소 수입상 감소, 대형사 중심으로 집중되는 추세 (업계추정 기준). 점유율 수치는 공개된 공인 통계가 아닌 추정치로 참고 수준. 신라교역은 4위권 수입사로 분류됨.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 신라 4위권 지위를 상위권으로 격상해 가격 협의력 확보.</p><p><strong>3단계</strong>: ① 점유율 확대 — 가격 협의 트랙 참여 지위 강화 ② 물량 기반 마진 구조 개선 ③ 공정거래 준수 전제 하에 업계 표준 정립자 지위 지향.</p></div>`, source: SRC }}
    />
  );
}

export function Widget28_DemandDestruction() {
  const data = [{ price: '3천원 (평활)', volume: 100 }, { price: '5천원 (인상)', volume: 85 }, { price: '7천원 (위기)', volume: 60 }, { price: '9천원 (파괴)', volume: 15 }];
  return (
    <WidgetCard title="B2B 수요 파괴(Demand Destruction) 임계점" icon={Skull} iconColor="#ec4899" pillar="S4" cardDesc="가격대별 발주 잔존율 — 임계가격 구간 업계추정 (illustrative)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="price" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Line type="monotone" dataKey="volume" name="발주 잔존율(%)" stroke="#ec4899" strokeWidth={3} />
        </LineChart>
      }
      takeaway={{ situation: `<div><p>"수요 파괴(Demand Destruction) 임계점"이란 가격이 일정 선을 넘으면 B2B 바이어가 메뉴에서 영구 제외하는 가격대.</p><p>한국 오징어 B2B 임계점 추정: 도매단가 일정 수준 돌파 시 짬뽕·해물탕 등 외식업에서 오징어를 대체재로 교체하는 경향이 나타남. 한 번 빠진 메뉴의 재진입에는 상당 기간이 필요. (가격대·잔존율 수치는 업계추정 구조 예시)</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 임계가격 구간은 단순 가격이 아닌 <strong>"한국 B2B 시장 이탈 방어선"</strong>.</p><p><strong>3단계</strong>: ① 6,500원 수준에서 B2B 1년 장기 선물계약 강제 락인 — 7,000 돌파 방지 ② 도매 단가 협상 시 이 임계점 의식적 유지 — 단기 +10% 마진보다 장기 시장 보존이 본질 ③ "B2B Demand Defense Fund" — 임계점 임박 시 자체 보조금으로 단가 holding.</p></div>`, source: SRC }}
    />
  );
}

export function Widget29_InflationIndex() {
  const data = [{ year: '2019', squid: 100, pork: 100, chicken: 100 }, { year: '2021', squid: 130, pork: 105, chicken: 110 }, { year: '2023', squid: 210, pork: 115, chicken: 125 }];
  return (
    <WidgetCard title="오징어 수산물가 지수 vs 돈/계육 인플레" icon={BarChart2} iconColor="#f87171" pillar="S4" cardDesc="2019-2023 가격 지수 비교 — KAMIS 기반 추정, 세부 수치 검증 필요" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Line type="monotone" dataKey="squid" name="오징어 폭등 궤도" stroke="var(--color-danger)" strokeWidth={3} />
          <Line type="monotone" dataKey="pork" name="돈육 지수" stroke="var(--color-success)" />
          <Line type="monotone" dataKey="chicken" name="계육 지수" stroke="#fcd34d" />
        </LineChart>
      }
      takeaway={{ situation: `<div><p>"금징어 쇼크"란 한국 오징어 가격이 일반 단백질 인플레이션을 뚜렷한으로 추월하면서 "서민 식재료" 지위를 상실한 현상.</p><p>2019~2023년 가격 지수 추정: 오징어 가격 상승폭이 돼지·닭 대비 현저히 크게 나타남 (업계추정 기반, KAMIS 원자료 교차 확인 권장). 수퍼마켓에서 오징어 가격이 일부 어종 수준에 근접하는 사례 증가.</p><p>의미: 단순 가격 변동이 아닌 <strong>"서민 식재료에서 상대적 프리미엄 식재료로의 카테고리 이동"</strong> 가능성.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 금징어 현상은 위협이 아닌 <strong>"Veblen Good(과시재) repositioning 기회"</strong>.</p><p><strong>3단계</strong>: ① 오징어를 "Veblen Good" 럭셔리 단백질로 포지셔닝 — 가격 인상에도 수요 유지 ② B2C 프리미엄 채널로 격상 — Whole Foods·Erewhon·일본 이세탄 ③ "Premium K-Squid" 자체 brand — ASP +50~80% 프리미엄.</p></div>`, source: SRC }}
    />
  );
}

export function Widget30_ChannelMix() {
  const data = [{ year: '2015', b2c_mart: 60, b2b_franchise: 30, online: 10 }, { year: '2023', b2c_mart: 25, b2b_franchise: 45, online: 30 }];
  return (
    <WidgetCard title="엔드유저 유통 채널(Channel Mix) 이탈" icon={Layers} iconColor="#06b6d4" pillar="S4" cardDesc="대형마트 원물 vs B2B 가공 vs 온라인 HMR — 업계추정 비중 (illustrative)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical" stackOffset="expand">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t * 100}%`} />
          <YAxis dataKey="year" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Bar dataKey="b2c_mart" stackId="a" name="전통/대형마트 원물" fill="#06b6d4" />
          <Bar dataKey="b2b_franchise" stackId="a" name="외식/반찬 B2B 가공품" fill="var(--color-warning)" />
          <Bar dataKey="online" stackId="a" name="밀키트 등 HMR" fill="var(--color-info)" />
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"Channel Mix 이탈"이란 소비자 구매 채널이 한 형태에서 다른 형태로 영구 이동하는 현상. 한국 오징어 시장에서 가속 진행 중.</p><p>변화 추세: 원물 직접 조리 수요 감소, 냉동 가공·밀키트 형태 비중 증가 추세. 견인 요인: 1인 가구 증가, 조리 시간 단축 선호, 가공품 위생 신뢰 향상. (채널별 비중은 업계추정 구조 예시)</p><p>의미: 단순 트렌드가 아닌 <strong>"마트 원물 매대 vs 가공 매대 배분의 구조적 재편"</strong>. 원물 중심 공급사는 채널 전략 재검토 필요.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: Channel Mix 이동은 단순 마케팅이 아닌 <strong>"본업 P&amp;L 자체 paradigm shift"</strong>.</p><p><strong>3단계</strong>: ① B2B 가공·HMR 비중 75% 이상 확대 ② 대형마트 원물 SKU 50% 축소 — 매대 공간을 RTC·HMR로 전환 ③ "K-Squid HMR Platform" 자체 brand — 마켓컬리·쿠팡·SSG.com DTC 채널.</p></div>`, source: SRC }}
    />
  );
}
