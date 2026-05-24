import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie, Treemap } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Globe, TrendingUp, Anchor, ShieldCheck, Ship, DollarSign, Database, Rocket, AlertTriangle, Crosshair, BarChart2, Activity, Zap } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export function Widget9_FilletRatio() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_fillet_hg.json').then(r => r.json()).then(setData); }, []);
  return (
    <WidgetCard
      title="선상 혁신: H&G 대신 Fillet(필레) 생산 트렌드 장악력"
      icon={Ship}
      iconColor="var(--color-success)"
      pillar="S2"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="더 비싼 고수익 1차 동결(FAS) 필레 가공 비율의 점진적인 퀀텀 도약 지표"
      takeaway={{
        situation: "어선들의 가공 트렌드가 급변하고 있습니다. 단순 H&G(벌크형 투척 품목) 중심에서, 바다 한가운데서 잡은 즉시 배 안에서 싱글 프로즌(Single-Frozen) 처리하여 뼈 없는 최고급 필레로 뽑아내는 테크놀로지 배합률이 기하급수적으로 폭증 중입니다.",
        actionPlan: "해동을 거치지 않은 최상위 신선도의 선상 가공품(FAS) 라인 파이프를 먼저 뚫어내는 기업이 글로벌 B2B 프리미엄 다이닝 납품 입찰전을 쓸어 담습니다. 구형 H&G 매입 비중을 줄이고 최첨단 FAS 선박들과의 전속 거래 예산을 최대로 배분.",
        source: "FAO Fisheries & Aquaculture Production Data"
      }}
      customBody={
        <div style={{ height: 280 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`${v}%`} tickMargin={10} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
              <Area type="monotone" stackId="1" dataKey="현장가공_Fillet비율" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.8} name="완제품 선상 필레 생산 점유율" />
              <Area type="monotone" stackId="1" dataKey="단순_HG비율" stroke="#64748b" fill="#64748b" fillOpacity={0.3} name="저급 일반 H&G(머리내장 제거) 비율" />
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
      cardDesc="블록(Block) 형태의 생 소비를 뛰어넘는 수리미 기반 범용 원자재 시장의 폭발"
      takeaway={{
        situation: "어묵 배합, 인조 게맛살(크래미), 패스트푸드 가공의 필수 베이스이자 미래 대체육 라인인명태 연육(Surimi) 생산량 그래프의 가파른 상승 저항선을 보여줍니다. 이제 명태는 더 이상 원형 생선이 아니라 화학적 식품 원료로서 그 가치가 복리 우상향 중입니다.",
        actionPlan: "수리미 공급권은 당사 그룹 매출의 생명줄입니다. SA / FA 등급 등 최상위 하이엔드 수리미를 뽑아내는 상위 3개 러시아계 공장의 연간 쿼터를 싹쓸이하여 경쟁사들이 B급 원료로 밀려나게 만드는 압사 치킨게임을 지시합니다.",
        source: "Global Surimi Production & Trade Annual Index"
      }}
      customBody={
        <div style={{ height: 280 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v) => (v/1000) + 'k'} tickMargin={10} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
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
        situation: "프리미엄 명태 연육과 동남아산 값싼 열대어(Tropical)의 가격 갭(Spread)을 관찰합니다. 이 가격 갭이 2배율(2.0x)을 초과 돌파하는 임계점에 진입하면 대량 B2B 어묵 제조사들은 매입원가 절감을 위해 맛이 조악해짐에도 싼 열대어 원료 레시피 교체를 단행합니다.",
        actionPlan: "핵심 클라이언트인 식품 공장들이 염가 제품 라인으로 이탈하는 엑소더스를 차단해야 합니다. 100% 명태만 고집하지 말고, 자사 차원에서 명태 70%와 가성비 열대어 30%를 황금 비율로 사전 혼합한 중간 마진 가격대의 새로운 방어형 아이템을 출시하여야 합니다.",
        source: "Urner Barry Seafood Market Analytics"
      }}
      customBody={
        <div style={{ height: 280 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`$${v}`} tickMargin={10} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
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
      title="히든 프로핏: 프리미엄 명란(Roe) 폭발적 D2C 마진율"
      icon={Database}
      iconColor="#fbbf24"
      pillar="S2"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="전체 물량의 초소형 파이를 차지하나 순이익금 상회를 주도하는 히든 부위 폭발성"
      takeaway={{
        situation: "명태 전신을 분해할 때 명란(Roe) 부위가 전체 톤수 중량에서 차지하는 포션은 채 3%에 불과하나, 특수 발효/염장 상품화되었을 때 벌어들이는 1g 당 영업 무형 마진은 타 부위를 압살하며 전체 수익 곡선을 홀로 띄웁니다.",
        actionPlan: "원물 처리 공정에서 소중한 란(Roe)이 포함된 완전 개체급 생물과 기타 부위를 한국 오프라인 도매상에게 '통나무형 벌크'로 싸게 하역 덤핑하는 행태를 멈추십시오. 명란만 독점 추출하는 D2C 자체 브랜딩 패키지 부서를 본사에 설립해야 합니다.",
        source: "일본 관세청 명란(Mentaiko) 수입 및 도매 유통 단가 DB"
      }}
      customBody={
        <div style={{ height: 280 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20 }}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={11} interval={0} angle={0} textAnchor="middle" tickMargin={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`$${v}단가`} tickMargin={10} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
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
