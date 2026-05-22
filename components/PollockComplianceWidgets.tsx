import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie, Treemap } from 'recharts';
import WidgetCard from './WidgetCard';
import { Globe, TrendingUp, Anchor, ShieldCheck, Ship, DollarSign, Database, Rocket, AlertTriangle, Crosshair, BarChart2, Activity, Zap } from 'lucide-react';

export function Widget13_Decoupling() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_decoupling.json').then(r => r.json()).then(setData); }, []);
  return (
        <WidgetCard
      title="지정학 충격: 가격 디커플링 (러시아 제재 vs 미국산 폭등)"
      icon={AlertTriangle}
      iconColor="var(--color-danger)"
      pillar="S3"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="서방 제재 유탄 맞은 러시아산 투매 파괴와 이격되는 미국산 프리미엄 현상"
      chart={
<LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="quarter" stroke="rgba(255,255,255,0.5)" fontSize={9} tickMargin={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`$${v}`} tickMargin={10} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Line type="monotone" dataKey="미국_MSC_프리미엄" stroke="var(--color-info)" strokeWidth={3} name="미 알래스카 가격" dot={{r:4}} />
            <Line type="step" dataKey="러시아_일반_덤핑" stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="5 5" name="러시아산 제재 단가락" dot={false} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
          </LineChart>
      }
      takeaway={{
        situation: "우크라이나 이슈 이후 서방 금융망 제재 발동으로 단일 시세를 유지하던 궤도가 붕괴, 투트랙 스프레드(Decoupling)가 발생했습니다. EU/북미 하역을 금지당한 러시아산 덤핑 매물과 폭우성 초과수요가 박힌 프리미엄 미국산 단가로 분리 진화 중입니다.",
        actionPlan: "제재망이 적용되지 않는 대한민국 및 아시아 제3세계 내수 유통 파이프라인에는 덤핑 하락한 빈사 상태의 러시아산 블록을 초저가로 흡수해 매입 단가를 혁파하십시오. 반면 까다로운 서방 수출 D2C 라인은 미국산 MSC 물동량으로 이원화 매칭 전략을 가동해야 합니다.",
        source: "US Treasury OFAC Sanctions Index & FAS Global"
      }}
    />
  );
}

export function Widget14_MscRatio() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_msc_ratio.json').then(r => r.json()).then(setData); }, []);
  return (
        <WidgetCard
      title="무역 장벽 1순위: 친환경 에코 인증(MSC) 장악력 심화"
      icon={ShieldCheck}
      iconColor="var(--color-success)"
      pillar="S3"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="글로벌 상위 프랜차이즈 식자재 입점 불허 기준선 역할을 하는 MSC 인증률 폭발 추이"
      chart={
<AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`${v}%`} tickMargin={10} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Area type="monotone" stackId="1" dataKey="MSC_인증물량_비율" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.6} name="ESG 합격선: MSC 필수요구량" />
            <Area type="monotone" stackId="1" dataKey="무인증_물량_비율" stroke="#334155" fill="#334155" fillOpacity={0.6} name="불량품질/B급 무인증 적체량" />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
          </AreaChart>
      }
      takeaway={{
        situation: "EU 및 대형 패스트푸드(피시앤칩스 맥도날드 등) ESG 구매 강령 발효로 인해, 해양관리협의회 에코 인증(Uncertified) 딱지가 없는 무인증 원물들의 퇴출이 급가속하며 시장 내 상륙지가 차단되고 있습니다.",
        actionPlan: "무인증 취급 어선 파트너의 완전 몰락이 최소 3년 시계열 안에 종식됩니다. 원양 조업에서부터 가공, 한국 공장 수입까지 이어지는 구매 밸류체인 전 구간에 MSC CoC(Chain of Custody, 관리연쇄) 인증 모듈을 즉시 100% 도입 의결합니다.",
        source: "Marine Stewardship Council (MSC) Annual Survey"
      }}
    />
  );
}

export function Widget15_IuuRisk() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_iuu_risk.json').then(r => r.json()).then(setData); }, []);
  return (
        <WidgetCard
      title="잠재 시한폭탄: 지역별 IUU(불법어업) 페널티 리스크 한계점"
      icon={AlertTriangle}
      iconColor="var(--color-danger)"
      pillar="S3"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="트레이스(이력 추적) 증빙 실패 시 항만 하역 압류 및 블랙리스트 지정 경고등"
      chart={
<BarChart data={data} layout="vertical" margin={{left:10}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
            <YAxis dataKey="region" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={95} tickMargin={5} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Bar dataKey="위험도" fill="var(--color-danger)" name="적발시 누적 벌금/페널티" radius={[0,4,4,0]} />
            <Bar dataKey="통제율" fill="var(--color-info)" name="바이어의 Traceability 방어력" radius={[0,4,4,0]} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
          </BarChart>
      }
      takeaway={{
        situation: "러시아 및 연변 인근 중국 하청 팩커들의 불법 혐의 적발 리스크 스팟 포인트 지도입니다. 미국 해경이나 유럽 세관에 적발 시 수십억대 납품 컨테이너 전량 압류조치 등 극강 단호한 무관용 제재 구간(레드존)에 진입하였습니다.",
        actionPlan: "자사가 운용 중인 매입 채널 중, 위성 어선 송신기(VMS)나 가공 생산 번호를 위변조 증거 없이 서류화(Trace) 해내지 못하는 낡은 2, 3차 소규모 영세 화교 벤더는 오늘일자로 전체 서플라이 체인에서 강제 컷오프(Cut-off) 처리 명령합니다.",
        source: "NOAA Fisheries IUU Biennial Report"
      }}
    />
  );
}

export function Widget16_ClimateShift() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_climate_shift.json').then(r => r.json()).then(setData); }, []);
  return (
        <WidgetCard
      title="기후 변화의 재난: 주력 어장 북상 임계치 곡선"
      icon={Globe}
      iconColor="#38bdf8"
      pillar="S3"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="베링해 난류 이상 기온 시뮬레이션 기반 황금 어장의 위도 상실 모델링"
      chart={
<AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="latitude" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`${v}만톤`} tickMargin={10} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Area type="monotone" dataKey="1990년_수확량" stroke="#64748b" fill="#64748b" fillOpacity={0.4} name="1990년대 중위도 수확 볼륨" />
            <Area type="monotone" dataKey="2023년_수확량" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.6} name="현재 고위도 수확 최적화 이동 볼륨" />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
          </AreaChart>
      }
      takeaway={{
        situation: "지구온난화와 난류 베링해 유입 가속화 여파로 기존 명태 서식 어장이 생존을 위해 대거 수백 km 이상 극지방으로 북상(Migration) 하였습니다. 과거의 경험론적 명당 어군 지도의 데이터적 가치는 사실상 붕괴 및 파괴되었습니다.",
        actionPlan: "수익을 갉아먹는 기존 중위도 무리한 투망 및 쓸데없는 선박 유류비 낭비의 근절을 지시합니다. 위성 수온 감지 AI 관측 플랫폼을 그룹 내 전 선단 조타실에 의무 탑재 및 결합하고, 선장 감각이 아닌 AI 지시 코디네이트(좌표)로 작전 반경을 기계화 조절.",
        source: "NOAA Alaska Fisheries Science Center (AFSC) Ecosystem Report"
      }}
    />
  );
}
