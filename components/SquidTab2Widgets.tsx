'use client';
import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { Globe2, Flame, Ship, Lock, Cpu, Network, Anchor, Factory, DollarSign, Leaf } from 'lucide-react';
import WidgetCard from './WidgetCard';

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
    <WidgetCard title="글로벌 어획 패권 블랙홀" icon={Globe2} iconColor="#f87171" pillar="S1" cardDesc="국가별 생산량·성장률·선단규모 3축 — 패권 이동 가시화" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" dataKey="catch" name="생산량(만톤)" stroke="rgba(255,255,255,0.5)" fontSize={11} domain={[0, 1000]} />
          <YAxis type="number" dataKey="growth" name="성장률(%)" stroke="rgba(255,255,255,0.5)" fontSize={11} domain={[-30, 20]} />
          <ZAxis type="number" dataKey="size" range={[50, 800]} name="선단규모" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Scatter name="국가" data={data} fill="var(--color-danger)">
            {data.map((entry: any, index: number) => (<Cell key={index} fill={entry.growth < 0 ? '#64748b' : (entry.catch > 400 ? 'var(--color-danger)' : 'var(--color-info)')} />))}
          </Scatter>
        </ScatterChart>
      }
      takeaway={{ situation: 'C국 선단이 P국·A국 EEZ 자원을 원양 조업으로 흡수, 한국·일본은 -18~-22% 성장률로 궤도 이탈.', actionPlan: '[자본의 블랙홀] 한국 선단도 동일한 원양 패권 게임에 참여하거나, 차별화된 가공·B2B 카테고리로 경쟁을 회피.', source: SRC }}
    />
  );
}

export function Widget12_QuotaBurnRate() {
  const data = [{ month: 'Jan', rate: 10 }, { month: 'Feb', rate: 45 }, { month: 'Mar', rate: 85 }, { month: 'Apr', rate: 100, isClosed: true }];
  return (
    <WidgetCard title="국가별/어장별 쿼터 소진 속도 (Burn Rate)" icon={Flame} iconColor="#f59e0b" pillar="S1" cardDesc="ITQ 쿼터 월별 소진율 — 조기 클로징 = 시세 폭등 트리거" telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t}%`} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="rate" name="쿼터 소진율(%)">{data.map((entry: any, index: number) => (<Cell key={index} fill={entry.isClosed ? 'var(--color-danger)' : 'var(--color-info)'} />))}</Bar>
        </BarChart>
      }
      takeaway={{ situation: '아르헨 앞바다 쿼터가 4월에 100% 조기 소진되며 어업이 셧다운 — 군집 밀도 상승과 선단 집적이 원인.', actionPlan: '[조기 클로징] 쿼터 소진 80% 임계치 돌파 시 잔여 선적 물량을 프리미엄으로 일괄 매입(Buyout) 발동.', source: SRC }}
    />
  );
}

export function Widget13_FleetExpansion() {
  const data = [{ year: '2015', ships: 400, tonnage: 800 }, { year: '2019', ships: 600, tonnage: 1500 }, { year: '2023', ships: 850, tonnage: 2800 }];
  return (
    <WidgetCard title="C국 초대형 원양 선단 팽창 다이내믹스" icon={Ship} iconColor="#67e8f9" pillar="S1" cardDesc="2015-2023 선박수·총톤수 변화 — 척수 2배 vs 톤수 3.5배의 체급 격차" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-danger)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line yAxisId="left" type="monotone" dataKey="ships" name="선박 수(척)" stroke="var(--color-info)" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="tonnage" name="총 톤수(GT Index)" stroke="var(--color-danger)" strokeWidth={3} />
        </LineChart>
      }
      takeaway={{ situation: '배 척수는 2배 늘었지만, 총 톤수와 집어등 마력(HP)은 3.5배 상승. 싹쓸이급 \'스카이 워커\' 선단화.', actionPlan: '[체급 확장] 한국도 신조선 CAPEX를 대형 등급으로 격상하지 않으면 원양에서 영구 도태됨.', source: SRC }}
    />
  );
}

export function Widget14_EEZProtectionism() {
  const data = [{ year: '2020', tariff: 5, fee: 100 }, { year: '2021', tariff: 6, fee: 150 }, { year: '2022', tariff: 10, fee: 250 }, { year: '2023', tariff: 15, fee: 400 }];
  return (
    <WidgetCard title="연안국(아르헨/페루) 배타적 보호주의 지표" icon={Lock} iconColor="#fcd34d" pillar="S3" cardDesc="외국선 입항료 + 수출세 — 자원국 마진 선취 가속" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Area type="monotone" dataKey="fee" name="외국적선 입항/조업료 지수" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.3} />
          <Area type="step" dataKey="tariff" name="스팟 수출세/관세율(%)" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.6} />
        </AreaChart>
      }
      takeaway={{ situation: '자원국들이 원물 반출에 15% 패널티 관세 부과, 외국선 조업료 400% 인상 — 마진 선취.', actionPlan: '[자원 무기화] 페루/아르헨 현지 합작 법인 지분 인수로 \'자원국 인사이더\' 지위 확보.', source: SRC }}
    />
  );
}

export function Widget15_TechVsCPUE() {
  const data = [{ name: 'K국 (구형)', hp: 100, cpue: 25 }, { name: 'J국 (구형)', hp: 120, cpue: 30 }, { name: 'C국 (신형 집어등)', hp: 300, cpue: 120 }, { name: 'P국 (초대형망)', hp: 280, cpue: 150 }];
  return (
    <WidgetCard title="등선 마력(HP) 기술력 vs 단위어획량(CPUE)" icon={Cpu} iconColor="#8b5cf6" pillar="S1" cardDesc="조업 기술 자본 투입 대비 CPUE 효율 비교 — 5배 격차" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={100} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="cpue" name="하루 어획량 효율(CPUE)" fill="var(--color-success)" />
          <Bar dataKey="hp" name="광원/마력 투입 자본" fill="#6366f1" />
        </BarChart>
      }
      takeaway={{ situation: '동일 어장 내에서 C/P국이 집어등 마력·소나 탐지기로 CPUE 효율을 5배 격차로 벌림.', actionPlan: '[자본의 승리] 한국 선단의 집어등·소나 시스템을 차세대 LED+AI 어군탐지 패키지로 일괄 교체 CAPEX 결의.', source: SRC }}
    />
  );
}

export function Widget16_TradeFlows() {
  const data = [{ source: '페루/아르헨', dest: '중국 가공장', value: 600 }, { source: '중국 가공장', dest: '한국/일본', value: 300 }, { source: '중국 가공장', dest: '미국/EU', value: 250 }, { source: '대서양 공해', dest: '유럽', value: 150 }];
  return (
    <WidgetCard title="무역 흐름(Flow) 블랙홀 경로" icon={Network} iconColor="#a78bfa" pillar="S4" cardDesc="전 세계 물량의 60%가 중국 Zhoushan/Shidao 경유 — 의존성 구조" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis dataKey="dest" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={100} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="value" name="이동 물동량(천톤)" fill="#8b5cf6" />
        </BarChart>
      }
      takeaway={{ situation: '전 세계 물량의 60%가 중국 Zhoushan/Shidao 등을 거쳐야만 최종 상품(Tube/Ring)으로 전환 — 심각한 의존성.', actionPlan: '[병목 지점] 베트남·인도네시아에 자체 가공/물류 스포크 배치하여 중국 통제 리스크 우회.', source: SRC }}
    />
  );
}

export function Widget17_PortHubs() {
  const data = [{ month: 'Q1', Zhoushan_CN: 120, Callao_PE: 90, Busan_KR: 20 }, { month: 'Q2', Zhoushan_CN: 180, Callao_PE: 150, Busan_KR: 15 }, { month: 'Q3', Zhoushan_CN: 210, Callao_PE: 60, Busan_KR: 12 }, { month: 'Q4', Zhoushan_CN: 150, Callao_PE: 80, Busan_KR: 18 }];
  return (
    <WidgetCard title="글로벌 거점 항구 하역 물동량 추이" icon={Anchor} iconColor="#67e8f9" pillar="S3" cardDesc="중국 저우산 vs 페루 카야오 vs 부산 하역량 분기별 비교" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line type="monotone" dataKey="Zhoushan_CN" stroke="var(--color-danger)" strokeWidth={3} />
          <Line type="monotone" dataKey="Callao_PE" stroke="var(--color-info)" strokeWidth={2} />
          <Line type="monotone" dataKey="Busan_KR" stroke="#64748b" strokeWidth={2} strokeDasharray="3 3" />
        </LineChart>
      }
      takeaway={{ situation: '선사들이 높은 위판고를 보장하는 중국 저우산 항구로 직행 뱃머리를 돌리며 한국·일본 하역량 이탈 지속.', actionPlan: '[인프라 쏠림] 부산 위판 단가 인센티브 보조금 정책 또는 가공 면세 특구 지정 등 인프라 매력도 회복 필요.', source: SRC }}
    />
  );
}

export function Widget18_ProcessingBlackhole() {
  const data = [{ year: '2019', Vietnam: 20, India: 5, China: 65, Others: 10 }, { year: '2023', Vietnam: 35, India: 15, China: 45, Others: 5 }];
  return (
    <WidgetCard title="글로벌 임가공 거점 이동 (블랙홀 현상)" icon={Factory} iconColor="#10b981" pillar="S2" cardDesc="중국 → 베트남·인도로 가공 거점 분산 — 인건비 상승 효과" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical" stackOffset="expand">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t * 100}%`} />
          <YAxis dataKey="year" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="Vietnam" stackId="a" fill="var(--color-success)" />
          <Bar dataKey="India" stackId="a" fill="var(--color-warning)" />
          <Bar dataKey="China" stackId="a" fill="var(--color-danger)" />
        </BarChart>
      }
      takeaway={{ situation: '중국 인건비 상승으로 해체/절단 작업이 베트남·인도로 대거 아웃소싱 — 동남아가 새로운 가공 블랙홀.', actionPlan: '[거점 분산] 베트남 호치민/하이퐁 가공 OEM 파트너십을 확대하여 중국 가공 의존도 40% 이하 통제.', source: SRC }}
    />
  );
}

export function Widget19_SubsidiesVsDepletion() {
  const data = [{ name: '보조금 높음', subsidies: 80, depletionRate: 25 }, { name: '보조금 중간', subsidies: 40, depletionRate: 12 }, { name: '보조금 낮음', subsidies: 10, depletionRate: 5 }];
  return (
    <WidgetCard title="유류 보조금 vs 초과 남획 상관관계" icon={DollarSign} iconColor="#06b6d4" pillar="S1" cardDesc="국가 유류 보조금이 한계 어선을 바다에 잔류시켜 남획 가속" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="subsidies" name="보조금 지수" fill="var(--color-info)" />
          <Bar dataKey="depletionRate" name="어장 고갈 가속도" fill="var(--color-danger)" />
        </BarChart>
      }
      takeaway={{ situation: '보조금을 가장 많이 투입하는 국가일수록 철수해야 할 한계 어선들이 바다에 남아 싹쓸이 남획 주도.', actionPlan: '[시장 교란] WTO 어업 보조금 협상 캠페인 동참 + 한국 자체 유류 보조금 ESG 연동 인센티브로 전환.', source: SRC }}
    />
  );
}

export function Widget20_CarbonTaxCapex() {
  const data = [{ year: '2025', carbonPenalty: 12, newShipCapex: 10 }, { year: '2027', carbonPenalty: 28, newShipCapex: 20 }, { year: '2030', carbonPenalty: 65, newShipCapex: 40 }];
  return (
    <WidgetCard title="탄소 배출 규제(IMO) 한계 비용 교차점" icon={Leaf} iconColor="#10b981" pillar="S5" cardDesc="2028년 노후선 탄소세가 신조선 CAPEX 추월 — 자본 도태 시점" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Area type="monotone" dataKey="carbonPenalty" name="노후선 탄소세 패널티 누적" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.4} />
          <Area type="monotone" dataKey="newShipCapex" name="신조선 친환경 설비 감가상각" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.4} />
        </AreaChart>
      }
      takeaway={{ situation: '2028년을 기점으로 노후 선박 탄소세/입항 페널티가 신조선 건조 비용을 추월 — 중소 선사의 강제 퇴출기.', actionPlan: '[자본 도태] 2028년 D-3 시점에 노후선 폐선·신조 CAPEX 결정. ESG·탄소세 기반 친환경 선단 전환 본격화.', source: SRC }}
    />
  );
}
