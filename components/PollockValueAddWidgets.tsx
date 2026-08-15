import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { TrendingUp, Ship, Database, Activity } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

export function Widget9_FilletRatio() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_fillet_hg.json').then(r => r.json()).then(setData); }, []);
  return (
    <WidgetCard
      title="선상 가공 전환: H&G 대비 필레 생산 비율 추이"
      icon={Ship}
      iconColor="var(--color-success)"
      pillar="S2"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="선상 1차 동결(FAS) 필레 가공 비율 추이 (업계추정치, 예시 데이터)"
      takeaway={{
        situation: "어선들의 가공 트렌드가 전환 중입니다. 단순 H&G(머리·내장 제거) 중심에서, 선상 즉시 싱글 프로즌(FAS) 처리한 필레 생산 비율이 2000년대 이후 점진적으로 상승하는 추세를 보입니다.",
        actionPlan: "FAS 선상 가공품 라인 확보에 선제 투자한 기업이 B2B 프리미엄 납품 입찰에서 유리합니다. H&G 매입 비중을 점진적으로 줄이고 FAS 선박 전속 거래를 검토할 필요가 있습니다.",
        source: "업계추정 (FAO 어획·생산 통계 기반 추산, 선상가공 비율은 자체추정)"
      }}
      customBody={
        <div style={{ height: 280 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`${v}%`} tickMargin={10} />
              <Tooltip contentStyle={{ background: '#0a0f1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--w-slate-50)' }} />
              <Area type="monotone" stackId="1" dataKey="현장가공_Fillet비율" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.8} name="완제품 선상 필레 생산 점유율" />
              <Area type="monotone" stackId="1" dataKey="단순_HG비율" stroke="var(--w-slate-500)" fill="var(--w-slate-500)" fillOpacity={0.3} name="저급 일반 H&G(머리내장 제거) 비율" />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
            </AreaChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}

export function Widget10_SurimiGrowth() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_surimi_trend.json').then(r => r.json()).then(setData); }, []);
  return (
    <WidgetCard
      title="미래 식량: 명태 연육(Surimi) 시장 글로벌 볼륨 상승"
      icon={TrendingUp}
      iconColor="var(--color-warning)"
      pillar="S2"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="명태 연육(Surimi) 글로벌 생산량 추이 (업계추정치, 참고용)"
      takeaway={{
        situation: "어묵·크래미·패스트푸드 등 다양한 가공식품의 원료인 명태 연육(Surimi) 글로벌 생산량은 2000년대 이후 증가 추세를 보입니다. 원형 어류에서 가공 원자재로의 전환이 진행 중입니다.",
        actionPlan: "SA/FA 등급 고품질 수리미 공급망 우선 확보가 중요합니다. 상위 러시아계 공장과의 안정적 장기 거래 관계 구축을 검토할 필요가 있습니다.",
        source: "업계추정 (수리미 생산 추이는 자체추정, FAO·GLOBEFISH 통계 기반)"
      }}
      customBody={
        <div style={{ height: 280 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v) => (v/1000) + 'k'} tickMargin={10} />
              <Tooltip contentStyle={{ background: '#0a0f1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--w-slate-50)' }} />
              <Line type="monotone" dataKey="글로벌_수리미_생산량" stroke="var(--color-warning)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-warning)' }} activeDot={{r:7}} name="글로벌 수리미 생산량(톤)" />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
            </LineChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}

export function Widget11_SurimiSpread() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_surimi_spread.json').then(r => r.json()).then(setData); }, []);
  return (
    <WidgetCard
      title="블렌딩 위협: 대체 연육(Tropical)의 반격과 단가 스프레드"
      icon={Activity}
      iconColor="#8b5cf6"
      pillar="S2"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="고가 명태 연육과 저가 동남아 실꼬리돔(Itoyori) 사이클 이격도 분석"
      takeaway={{
        situation: "프리미엄 명태 연육과 동남아산 열대어(Tropical) 연육의 가격 차이(Spread)를 보여줍니다. 이 가격 격차가 확대될수록 B2B 어묵 제조사들의 대체 원료 전환 유인이 커지는 경향이 있습니다.",
        actionPlan: "주요 식품 공장 거래처의 원료 전환 리스크에 대응해 명태와 열대어 혼합 중간 가격대 제품군을 선제적으로 검토할 필요가 있습니다.",
        source: "Urner Barry Seafood Market Analytics (참고가격, 계약조건에 따라 상이)"
      }}
      customBody={
        <div style={{ height: 280 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`$${v}`} tickMargin={10} />
              <Tooltip contentStyle={{ background: '#0a0f1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--w-slate-50)' }} />
              <Area type="monotone" dataKey="명태연육_단가" stroke="var(--color-info)" fill="rgba(59,130,246,0.15)" strokeWidth={3} name="알래스카/러시아산 명태 연육 고단가" />
              <Area type="monotone" dataKey="열대어연육_단가" stroke="var(--color-danger)" fill="rgba(239,68,68,0.15)" strokeWidth={3} strokeDasharray="5 5" name="동남아 실꼬리돔 베스트 저가 연육" />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
            </AreaChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}

export function Widget12_RoePremium() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_roe_waterfall.json').then(r => r.json()).then(setData); }, []);
  return (
    <WidgetCard
      title="부위별 가치 구조: 명란 고단가 마진 가능성"
      icon={Database}
      iconColor="#fbbf24"
      pillar="S2"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="명태 가공 부위별 가치 구조 (업계추정치, 실제 수익구조는 계약·시황에 따라 상이)"
      takeaway={{
        situation: "명태 전신 대비 명란(Roe) 부위는 중량 기준 약 2~3%에 불과하나, 발효·염장 가공 후 단가는 타 부위 대비 현저히 높아 마진 기여도가 큰 것으로 업계에서 추정됩니다.",
        actionPlan: "명란을 벌크 원물에 묶어 낮은 가격으로 처리하는 방식 대신, 명란만 별도 추출해 고단가 가공 채널(D2C 또는 전문 유통)로 분리 판매하는 구조 검토가 필요합니다.",
        source: "업계추정 (일본 관세청 수입 통계·도매가 참고, 내부 수익구조는 자체추정)"
      }}
      customBody={
        <div style={{ height: 280 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20 }}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={11} interval={0} angle={0} textAnchor="middle" tickMargin={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`$${v}단가`} tickMargin={10} />
              <Tooltip contentStyle={{ background: '#0a0f1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--w-slate-50)' }} />
              <Bar dataKey="value" name="카테고리별 마진추정액" radius={[4,4,0,0]}>
                {data.map((entry: any, idx: number) => <Cell key={idx} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}
