'use client';
import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { Globe2, Flame, Ship, Lock, Cpu, Network, Anchor, Factory, DollarSign, Leaf } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

const SRC = 'FAO Capture Production + RFMO Records (2015-2023)';

export function Widget11_HegemonyBubble() {
  const data = [
    { country: 'C국', catch: 800, growth: 12, size: 80 },
    { country: 'P국', catch: 550, growth: 4, size: 55 },
    { country: 'A국', catch: 350, growth: 2, size: 35 },
    { country: 'K국', catch: 50, growth: -18, size: 5 },
    { country: 'J국', catch: 40, growth: -22, size: 4 },
  ];
  return (
    <WidgetCard title="글로벌 어획 패권 블랙홀" icon={Globe2} iconColor="#f87171" pillar="S1" cardDesc="국가별 생산량·성장률·선단규모 3축 — 패권 이동 가시화" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" dataKey="catch" name="생산량(만톤)" stroke="rgba(255,255,255,0.5)" fontSize={11} domain={[0, 1000]} />
          <YAxis type="number" dataKey="growth" name="성장률(%)" stroke="rgba(255,255,255,0.5)" fontSize={11} domain={[-30, 20]} />
          <ZAxis type="number" dataKey="size" range={[50, 800]} name="선단규모" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Scatter name="국가" data={data} fill="var(--color-danger)">
            {data.map((entry: any, index: number) => (<Cell key={index} fill={entry.growth < 0 ? '#64748b' : (entry.catch > 400 ? 'var(--color-danger)' : 'var(--color-info)')} />))}
          </Scatter>
        </ScatterChart>
      }
      takeaway={{ situation: `<div><p>중국 원양 선단이 페루·아르헨티나 EEZ 자원을 지속 확대 중. 업계추정 기준 글로벌 오징어 어획에서 중국 비중이 과반을 넘어선 것으로 추산된다(자체추정).</p><p>한국·일본은 5년간 <strong>-18~-22% 성장률</strong>로 궤도 이탈. 이는 단순 어획 경쟁이 아닌 "국가 규모 자본·선단·외교력 결합 게임"으로 전환됨을 의미.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 정면 원양 패권 경쟁 또는 차별화 우회 — 양자택일.</p><p><strong>3단계</strong>: ① 한국 신조선 capex 대형화로 패권 게임 참여(중기 6~10년) ② 또는 가공·B2B(RTC·HMR) 차별화로 회피 — 부가가치 라인 집중 ③ "Korea Specialty Squid" 글로벌 mass-premium 브랜드 포지셔닝.</p></div>`, source: SRC }}
    />
  );
}

export function Widget12_QuotaBurnRate() {
  const data = [{ month: 'Jan', rate: 10 }, { month: 'Feb', rate: 45 }, { month: 'Mar', rate: 85 }, { month: 'Apr', rate: 100, isClosed: true }];
  return (
    <WidgetCard title="국가별/어장별 쿼터 소진 속도 (Burn Rate)" icon={Flame} iconColor="#f59e0b" pillar="S1" cardDesc="ITQ 쿼터 월별 소진율 — 조기 클로징 = 시세 폭등 트리거" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t}%`} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Bar dataKey="rate" name="쿼터 소진율(%)">{data.map((entry: any, index: number) => (<Cell key={index} fill={entry.isClosed ? 'var(--color-danger)' : 'var(--color-info)'} />))}</Bar>
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"쿼터 Burn Rate"란 정부가 부여한 ITQ(개별양도성쿼터) 어획 한도가 월별로 소진되는 속도. 정상 시즌은 12개월에 걸쳐 분산 소진.</p><p>이상 현상: <strong>아르헨티나 앞바다 쿼터가 4월에 100% 조기 소진</strong>되며 어업 셧다운. 군집 밀도 상승 + 선단 집적이 원인. 셧다운 직후 글로벌 spot 가격이 급등하는 패턴이 반복 관측된다(업계추정 +30~50% 수준).</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 쿼터 소진율은 단순 정보가 아닌 <strong>"3개월 후 가격 폭등 leading indicator"</strong>.</p><p><strong>실행</strong>: ① 소진율 80% 임계치 자동 alert ② 잔여 선적 물량을 프리미엄으로 일괄 매입(Buyout) 발동 ③ 셧다운 직후 spot 매도 타이밍을 포착해 마진 회수를 노릴 수 있다.</p></div>`, source: SRC }}
    />
  );
}

export function Widget13_FleetExpansion() {
  const data = [{ year: '2015', ships: 400, tonnage: 800 }, { year: '2019', ships: 600, tonnage: 1500 }, { year: '2023', ships: 850, tonnage: 2800 }];
  return (
    <WidgetCard title="C국 초대형 원양 선단 팽창 다이내믹스" icon={Ship} iconColor="#67e8f9" pillar="S1" cardDesc="2015-2023 선박수·총톤수 변화 — 척수 2배 vs 톤수 3.5배의 체급 격차" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-danger)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Line yAxisId="left" type="monotone" dataKey="ships" name="선박 수(척)" stroke="var(--color-info)" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="tonnage" name="총 톤수(GT Index)" stroke="var(--color-danger)" strokeWidth={3} />
        </LineChart>
      }
      takeaway={{ situation: `<div><p>중국 원양 선단의 2015~2023 팽창 패턴: <strong>척수 2배 vs 총 톤수·집어등 HP 3.5배</strong>. 즉 척수보다 체급(개별 선박 크기·동력) 증가가 훨씬 가파름.</p><p>이는 단순 선단 확장이 아닌 <strong>"초대형 집약 선단화"</strong> — 집어등 마력·소나·자동화로 한 척이 5~10배 어획 가능. 한국 평균 선단 규모로는 중국 대형 선단과의 직접 경쟁이 구조적으로 불리하다(업계추정).</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 체급 격차는 단순 자산 차이가 아닌 <strong>"원양 경쟁력 급격 저하의 핵심 변수"</strong>.</p><p><strong>3단계</strong>: ① 한국 신조선 capex를 대형 등급(1,500~2,500GT)으로 격상 의무화 ② 집어등·소나·AI 어군탐지 차세대 패키지 일괄 retrofit ③ EBRD·KfW Green Maritime Loan 5% 금리 활용 — Maersk 같은 대형 vendor 협력.</p></div>`, source: SRC }}
    />
  );
}

export function Widget14_EEZProtectionism() {
  const data = [{ year: '2020', tariff: 5, fee: 100 }, { year: '2021', tariff: 6, fee: 150 }, { year: '2022', tariff: 10, fee: 250 }, { year: '2023', tariff: 15, fee: 400 }];
  return (
    <WidgetCard title="연안국(아르헨/페루) 배타적 보호주의 지표" icon={Lock} iconColor="#fcd34d" pillar="S3" cardDesc="외국선 입항료 + 수출세 — 자원국 마진 선취 가속" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Area type="monotone" dataKey="fee" name="외국적선 입항/조업료 지수" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.3} />
          <Area type="step" dataKey="tariff" name="스팟 수출세/관세율(%)" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.6} />
        </AreaChart>
      }
      takeaway={{ situation: `<div><p>"자원 무기화(Resource Nationalism)"란 자원 보유국이 외국 선단·기업의 매입 비용을 일방적으로 인상해 자국 마진을 선취하는 정책. 페루·아르헨티나가 핵심.</p><p>현 상황: 원물 반출에 <strong>15% 패널티 관세 + 외국선 조업료 400% 인상</strong>. 한국 vendor의 페루·아르헨 매입 cost +25~35% 직접 압박.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 외부 buyer로는 cost 게임에서 영구 패배. <strong>"자원국 인사이더" 지위 확보</strong>가 본질.</p><p><strong>3단계</strong>: ① 페루·아르헨 현지 합작 법인 minority equity 5~10% 인수 — 정부 입장에서 "현지 일자리·세수 기여" 명분 ② 현지 가공·물류 인프라 직접 투자 — outside buyer → local stakeholder 전환 ③ World Bank IFC MIGA 정치보험으로 sovereign risk -60% 헷지.</p></div>`, source: SRC }}
    />
  );
}

export function Widget15_TechVsCPUE() {
  const data = [{ name: 'K국 (구형)', hp: 100, cpue: 25 }, { name: 'J국 (구형)', hp: 120, cpue: 30 }, { name: 'C국 (신형 집어등)', hp: 300, cpue: 120 }, { name: 'P국 (초대형망)', hp: 280, cpue: 150 }];
  return (
    <WidgetCard title="등선 마력(HP) 기술력 vs 단위어획량(CPUE)" icon={Cpu} iconColor="#8b5cf6" pillar="S1" cardDesc="조업 기술 자본 투입 대비 CPUE 효율 비교 — 5배 격차" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={100} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Bar dataKey="cpue" name="하루 어획량 효율(CPUE)" fill="var(--color-success)" />
          <Bar dataKey="hp" name="광원/마력 투입 자본" fill="#6366f1" />
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"CPUE(Catch Per Unit Effort, 단위어획량)"는 동일 노력 투입(연료·시간·인력) 대비 어획량 — 어선 효율의 표준 지표.</p><p>동일 어장 내 격차: <strong>중국·페루 선단이 집어등 마력·소나·AI 어군탐지로 한국 대비 CPUE 5배</strong>. 즉 같은 어장에서 한국 어선이 1톤 잡을 때 그들은 5톤 잡음.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: CPUE 격차는 단순 효율 차이가 아닌 <strong>"한국 원양 수익성 구조 압박의 핵심 요인"</strong>. 자본 투입의 paradigm shift 필요.</p><p><strong>3단계</strong>: ① 한국 선단 집어등·소나 차세대 LED+AI 어군탐지 패키지 일괄 교체 — 척당 capex $200~500K ② Furuno·Marport·Simrad 3대 글로벌 vendor 패키지 도입 ③ "Precision Fishing AI 자체 모델" — 우리 어선 데이터로 학습한 ML 모델로 어군 예측. 글로벌 해양금융기관 협력을 통한 financing 구조 검토.</p></div>`, source: SRC }}
    />
  );
}

export function Widget16_TradeFlows() {
  const data = [{ source: '페루/아르헨', dest: '중국 가공장', value: 600 }, { source: '중국 가공장', dest: '한국/일본', value: 300 }, { source: '중국 가공장', dest: '미국/EU', value: 250 }, { source: '대서양 공해', dest: '유럽', value: 150 }];
  return (
    <WidgetCard title="무역 흐름(Flow) 블랙홀 경로" icon={Network} iconColor="#a78bfa" pillar="S4" cardDesc="전 세계 물량의 60%가 중국 저우산·시다오 경유 — 의존성 구조(자체추정)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis dataKey="dest" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={100} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Bar dataKey="value" name="이동 물동량(천톤)" fill="#8b5cf6" />
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"무역 흐름 블랙홀"이란 글로벌 commodity가 한 지점을 반드시 경유해야 하는 단일 통과 의존 구조.</p><p>오징어의 충격적 현실: <strong>전 세계 물량의 60%가 중국 저우산·시다오 등을 거쳐야만 최종 상품(Tube/Ring) 전환</strong>. 한국·일본·EU·미국 vendor 모두 중국 경유 의존.</p><p>리스크: 중국 정치적 이슈·관세·통관 변동 시 글로벌 60% supply 동시 차단. 단일 실패점 노출.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 중국 의존도는 단순 logistics가 아닌 <strong>"지정학 리스크 + 공급망 단일 실패점"</strong>.</p><p><strong>3단계</strong>: ① 베트남 하이퐁·호치민 + 인도네시아 자카르타에 자체 가공/물류 spoke 배치 ② 한국 부산·인천 가공 hub capacity 확대로 직접 가공 비중 +30%p ③ "Multi-spoke processing platform" — 중국 의존도 60% → 30% 이하 분산.</p></div>`, source: SRC }}
    />
  );
}

export function Widget17_PortHubs() {
  const data = [{ month: 'Q1', Zhoushan_CN: 120, Callao_PE: 90, Busan_KR: 20 }, { month: 'Q2', Zhoushan_CN: 180, Callao_PE: 150, Busan_KR: 15 }, { month: 'Q3', Zhoushan_CN: 210, Callao_PE: 60, Busan_KR: 12 }, { month: 'Q4', Zhoushan_CN: 150, Callao_PE: 80, Busan_KR: 18 }];
  return (
    <WidgetCard title="글로벌 거점 항구 하역 물동량 추이" icon={Anchor} iconColor="#67e8f9" pillar="S3" cardDesc="중국 저우산 vs 페루 카야오 vs 부산 하역량 분기별 비교" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Line type="monotone" dataKey="Zhoushan_CN" stroke="var(--color-danger)" strokeWidth={3} />
          <Line type="monotone" dataKey="Callao_PE" stroke="var(--color-info)" strokeWidth={2} />
          <Line type="monotone" dataKey="Busan_KR" stroke="#64748b" strokeWidth={2} strokeDasharray="3 3" />
        </LineChart>
      }
      takeaway={{ situation: `<div><p>글로벌 거점 항구별 오징어 하역 물동량 시프트가 가속 중. 중국 저우산이 사실상 글로벌 1위 항구로 격상.</p><p>패턴: <strong>선사들이 높은 위판고를 보장하는 중국 저우산 항구로 직행 뱃머리를 돌리며 한국 부산·일본 하역량 이탈 지속</strong>. 부산 위판 물동량이 수년간 감소세를 보이는 것으로 추산된다(자체추정).</p><p>의미: 부산 위판장의 단순 물량 손실이 아닌 <strong>"한국 수산 산업 인프라 자체 공동화"</strong>. 위판 → 가공 → 물류 산업 클러스터 동시 약화.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 부산 인프라 매력도 회복은 단순 위판장 운영이 아닌 <strong>"국가 산업 전략 수준 개입"</strong>이 필요.</p><p><strong>3단계</strong>: ① 부산 위판 단가 인센티브 보조금 정책 — 해양수산부와 협력 ② 부산항 인근 가공 면세 특구 지정 추진 — 자유무역지역(FTZ) 등급 격상 ③ "K-Squid 통합 클러스터" 형성 — 위판 + 가공 + 콜드체인 + 수출까지 single-stop platform화.</p></div>`, source: SRC }}
    />
  );
}

export function Widget18_ProcessingBlackhole() {
  const data = [{ year: '2019', Vietnam: 20, India: 5, China: 65, Others: 10 }, { year: '2023', Vietnam: 35, India: 15, China: 45, Others: 5 }];
  return (
    <WidgetCard title="글로벌 임가공 거점 이동 (블랙홀 현상)" icon={Factory} iconColor="#10b981" pillar="S2" cardDesc="중국 → 베트남·인도로 가공 거점 분산 — 인건비 상승 효과" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical" stackOffset="expand">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t * 100}%`} />
          <YAxis dataKey="year" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Bar dataKey="Vietnam" stackId="a" fill="var(--color-success)" />
          <Bar dataKey="India" stackId="a" fill="var(--color-warning)" />
          <Bar dataKey="China" stackId="a" fill="var(--color-danger)" />
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"임가공 거점 블랙홀"이란 글로벌 가공 노동력이 한 국가에 쏠렸다가 인건비 상승으로 다른 국가로 이동하는 paradigm shift.</p><p>현재 진행: <strong>중국 인건비 상승</strong>(업계추정)으로 오징어 해체·절단 작업이 베트남·인도로 대거 아웃소싱. 동남아가 새로운 가공 블랙홀로 부상.</p><p>의미: 한국 vendor도 중국 가공 의존도가 높으면 향후 5년 cost 상승 직격. 베트남·인도 선점 진입자가 중기적 가격 우위를 점할 가능성이 있다.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 거점 분산은 단순 cost 절감이 아닌 <strong>"중기 가공 경쟁력 확보를 위한 핵심 결정"</strong>.</p><p><strong>3단계</strong>: ① 베트남 호치민·하이퐁 가공 OEM 파트너십 확대 — 중국 의존도 40% 이하 ② 인도 코친·뭄바이 신규 거점 검토 — MPEDA 정부 지원 활용 ③ "Multi-country processing matrix" — 중국 35% + 베트남 35% + 인도 20% + 한국 직가공 10% 분산.</p></div>`, source: SRC }}
    />
  );
}

export function Widget19_SubsidiesVsDepletion() {
  const data = [{ name: '보조금 높음', subsidies: 80, depletionRate: 25 }, { name: '보조금 중간', subsidies: 40, depletionRate: 12 }, { name: '보조금 낮음', subsidies: 10, depletionRate: 5 }];
  return (
    <WidgetCard title="유류 보조금 vs 초과 남획 상관관계" icon={DollarSign} iconColor="#06b6d4" pillar="S1" cardDesc="국가 유류 보조금이 한계 어선을 바다에 잔류시켜 남획 가속" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Bar dataKey="subsidies" name="보조금 지수" fill="var(--color-info)" />
          <Bar dataKey="depletionRate" name="어장 고갈 가속도" fill="var(--color-danger)" />
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"유류 보조금 vs 남획 상관관계"란 정부 유류 보조금이 한계 어선(BEP 이하)을 바다에 잔류시켜 자원 고갈을 가속하는 역설.</p><p>실측: 보조금을 가장 많이 투입하는 국가일수록 한계 어선이 철수하지 않고 바다에 잔류해 남획을 가속하는 경향이 있다(자체추정).</p><p>의미: 단순 비용 변수가 아닌 <strong>"WTO 어업 보조금 협상의 글로벌 게임 체인저"</strong>. 보조금 단계 폐지 시 글로벌 어업 capacity 감축 시나리오가 예상된다(자체추정).</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 유류 보조금은 단순 OPEX 절감이 아닌 <strong>"ESG governance 시그널"</strong>.</p><p><strong>3단계</strong>: ① WTO 어업 보조금 협상 캠페인 동참 — sustainability vendor 지위 자산화 ② 한국 자체 유류 보조금을 ESG 연동 인센티브로 전환 — MSC·VDS 인증 선단 우대 ③ 글로벌 capacity 축소 시점에 우리 보유 라이선스 valuation rerate.</p></div>`, source: SRC }}
    />
  );
}

export function Widget20_CarbonTaxCapex() {
  const data = [{ year: '2025', carbonPenalty: 12, newShipCapex: 10 }, { year: '2027', carbonPenalty: 28, newShipCapex: 20 }, { year: '2030', carbonPenalty: 65, newShipCapex: 40 }];
  return (
    <WidgetCard title="탄소 배출 규제(IMO) 한계 비용 교차점" icon={Leaf} iconColor="#10b981" pillar="S5" cardDesc="2027~2030년 사이 노후선 탄소세가 신조선 CAPEX 추월(illustrative) — 자본 도태 시나리오" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)' }} />
          <Area type="monotone" dataKey="carbonPenalty" name="노후선 탄소세 패널티 누적" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.4} />
          <Area type="monotone" dataKey="newShipCapex" name="신조선 친환경 설비 감가상각" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.4} />
        </AreaChart>
      }
      takeaway={{ situation: `<div><p>"IMO(국제해사기구) 탄소 규제 한계 비용 교차점"이란 노후 선박의 탄소세·입항 페널티가 신조선 건조 비용을 추월하는 시점. 한 번 지나가면 노후 선단은 영구 폐선 결정.</p><p>크로스오버 시점은 2027~2030년 사이로 추산된다(자체추정, illustrative 시나리오). 이 시점 이후 노후 선박 보유한 중소 선사는 강제 퇴출 — 운영비가 매출 초과.</p><p>의미: 이 교차 시점 이후가 글로벌 수산 산업의 자본 도태 구간이 될 수 있다. 미리 친환경 선단 전환 못 한 vendor 다수 퇴출. 그 빈 자리를 ice-class·수소·하이브리드 신조선 보유자가 흡수.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 2028 IMO 교차점은 단순 규제가 아닌 <strong>"글로벌 어업 경쟁 구도 재편의 분기점"</strong>.</p><p><strong>3단계</strong>: ① 2028 D-3 시점(2025) 노후선 폐선·신조 capex 결정 ② ESG·탄소세 기반 친환경 선단(수소·LNG 하이브리드) 전환 capex 가속 ③ EBRD Green Maritime + KfW IPEX 환경금융 5% 금리 활용 — 단독 자본 부담을 상당 수준 절감할 수 있다.</p></div>`, source: SRC }}
    />
  );
}
