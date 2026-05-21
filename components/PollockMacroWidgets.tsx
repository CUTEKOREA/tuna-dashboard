import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie, Treemap } from 'recharts';
import { WidgetCard } from './WidgetCard';
import { Globe, TrendingUp, Anchor, ShieldCheck, Ship, DollarSign, Database, Rocket, AlertTriangle, Crosshair, BarChart2, Activity, Zap } from 'lucide-react';

export function Widget1_GlobalCatch() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_global_catch_trend.json').then(r => r.json()).then(setData); }, []);
  return (
        <WidgetCard
      title="명태 글로벌 생산 장기 병목 현상 (Bottleneck)"
      icon={Globe}
      iconColor="#38bdf8"
      pillar="S1"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="80년대 고점(700만톤) 이후 30년 넘게 이어진 글로벌 자원의 박스권 딜레마 방증"
      chart={
<AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v) => (v/10000) + '만'} tickMargin={10} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Area type="monotone" dataKey="러시아" stackId="1" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.6} />
            <Area type="monotone" dataKey="미국" stackId="1" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.6} />
            <Area type="monotone" dataKey="기타" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
          </AreaChart>
      }
      takeaway={{
        situation: "전 세계 명태 어획량의 장기 시계열 데이터를 추적합니다. 1980년대 후반 700만 톤이라는 정점을 찍은 이후, 환경적 제약과 쿼터제 도입으로 인해 30년 넘게 350만 톤 수준의 장기 박스권 구간에 봉착했습니다.",
        actionPlan: "글로벌 총 생산량의 Cap(상한선)이 닫혀 있으므로 볼륨(Volume) 확대를 통한 매출 성장은 불가능합니다. 단순 원물(H&G) 수입상 포지션을 즉시 철회하고, 제한된 쿼터에서 명란/연육 등 마진을 극대화하는 고부가가치 가공업체(Value-Adder)로 비즈니스 중심축을 서둘러야 합니다.",
        source: "FAO FishStatJ Global Pollock Catch Data"
      }}
    />
  );
}

export function Widget2_Hegemony() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_hegemony.json').then(r => r.json()).then(setData); }, []);
  return (
        <WidgetCard
      title="초강대국(미·러) 생산 독점 리스크"
      icon={AlertTriangle}
      iconColor="var(--color-danger)"
      pillar="S1"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="글로벌 어획량의 양강 구도 쏠림에 따른 자원 편중성과 스팟 가격 지배 구조 증명"
      chart={
<PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`} labelLine={false} style={{fontSize: '12px', fill: 'var(--text-primary)', fontWeight: 600}}>
              {data.map((entry: any, idx: number) => <Cell key={`cell-${idx}`} fill={entry.fill} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
          </PieChart>
      }
      takeaway={{
        situation: "명태 밸류체인은 사실상 미·러 과점(Duopoly) 생태계입니다. 미국은 100% 옵저버 커버리지 및 MSC 인증을 무기로 프리미엄 선상급랭(FAS) 필렛과 연육 시장의 하이엔드를 독점해 왔습니다. 반면 러시아는 강력한 '투자 쿼터(Investment Quota)' 제도로 대규모 선단 현대화를 추진 중이며, 슈퍼 트롤러의 선상 가공 설비 확충은 미국 독점의 프리미엄 시장으로의 파괴적 진입(Disruptive entry)을 의미합니다. 양국 간 퀄리티 스프레드가 급격히 축소 중입니다.",
        actionPlan: "러시아산 명태의 품질 상향 평준화는 PEF에게 강력한 차익거래 기회를 제공합니다. 가성비가 입증된 러시아산 선상급랭(FAS) 필렛 및 연육의 아시아/유럽 제3국 수출 판권을 선점하는 글로벌 무역상사 롤업(Roll-up) 전략이 유효합니다. 기존 북미산 원료 의존도(Exposure)를 다변화하여 러시아산 가공품을 활용한 글로벌 트레이딩 유통망을 공략함으로써 매입원가 절감 및 글로벌 EBITDA 마진 확장을 도모해야 합니다.",
        source: "미국 해양대기청(NOAA) 및 러시아 연방 수산청(Rosrybolovstvo) Report"
      }}
    />
  );
}

export function Widget3_USARussiaDiverging() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_diverging_catch.json').then(r => r.json()).then(setData); }, []);
  return (
        <WidgetCard
      title="미국 베링해 감축 vs 러시아 연안 증산 (Diverging)"
      icon={TrendingUp}
      iconColor="var(--color-warning)"
      pillar="S1"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="기후 악화로 인한 알래스카 쿼터 급감과 러시아의 무분별 조업 간 이격 확대"
      chart={
<BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Bar dataKey="미국_증감" fill="var(--color-info)" radius={[4,4,0,0]} />
            <Bar dataKey="러시아_증감" fill="var(--color-danger)" radius={[4,4,0,0]} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
          </BarChart>
      }
      takeaway={{
        situation: "최근 10년간 미국과 러시아의 어획 증감을 대비시켰습니다. 미국의 베링해 쿼터는 자연 조건 악화와 보수적 과학 어업 기조로 인해 급감하는 반면, 러시아는 국가 수익을 위해 극단적인 증산 조업을 강행하며 양국의 격차가 심화되는 디커플링(Diverging) 현상이 관측됩니다.",
        actionPlan: "미국 알래스카산 정식 인증(MSC) 블록 원료의 세계적 희소성이 치솟고 있습니다. 저가 러시아산에만 의존하던 기존 포트폴리오를 개편하고, 단가 상승 저항 조항을 포함한 미국산 프리미엄 원물 서플라이 체인을 최우선으로 사수.",
        source: "FAO North Pacific Fishery Management Council Data"
      }}
    />
  );
}

export function Widget4_KoreaImport() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_korea_import_catch.json').then(r => r.json()).then(setData); }, []);
  return (
        <WidgetCard
      title="대한민국 수산 안보: 자국 어획 소멸의 데드크로스"
      icon={Crosshair}
      iconColor="#94a3b8"
      pillar="S1"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="국내 동해안 명태 소멸에 따른 100% 수입 의존 고착화 및 국가 식량 리스크 도래"
      chart={
<LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v) => (v/10000) + '만톤'} tickMargin={10} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Line type="monotone" dataKey="수입량" stroke="#34d399" strokeWidth={3} dot={{r:3}} activeDot={{r:6}} />
            <Line type="monotone" dataKey="자국어획량" stroke="#64748b" strokeDasharray="5 5" strokeWidth={2} dot={false} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
          </LineChart>
      }
      takeaway={{
        situation: "과거 대한민국 식탁을 점령했던 자국 연안 어획량의 절벽 추이와 그를 완벽히 역전해 덮어버린 수입량 상승 곡선을 대조했습니다. 국내 어획 비중은 사실상 0(제로)으로 소멸하였으며 완전 수입 의존 체제가 굳어졌습니다.",
        actionPlan: "국민 생선이라 불리는 명태가 사실상 100% 외산 자원에 종속되어 안보 리스크가 높습니다. 정부 주도의 '원양 합작 쿼터제'에 긴밀히 참여하여 자본 교환 방식의 국가 지위 대리 확보 프로젝트를 선행해야 정부 혜택을 극대화할 수 있습니다.",
        source: "통계청 해양수산부 국적별 어업생산동향조사"
      }}
    />
  );
}
