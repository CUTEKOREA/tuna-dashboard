import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import WidgetCard from './WidgetCard';
import { DollarSign, Rocket, BarChart2, Zap } from 'lucide-react';
import { ChartPatternDefs } from './ChartPatterns';

export function Widget17_OilMargin() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_oil_margin.json').then(r => r.json()).then(setData); }, []);
  return (
        <WidgetCard
      title="출항 마지노선: 유가(MGO) 쇼크 대비 조업 셧다운 데드라인"
      icon={Zap}
      iconColor="var(--color-danger)"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      cardDesc="연료비가 전체 어선의 마진 단가를 초과 잠식시켜버리는 회계 자본 잠식회사 곡선"
      chart={
<ComposedChart data={data}>
  <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={9} tickMargin={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`$${v}`} tickMargin={10} />
            <Tooltip contentStyle={{ background: '#0a0f1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Bar dataKey="추정_영업이익" fill="var(--color-success)" name="척당 월 추정 이익(초과 시 손실 폭주)" radius={[4,4,0,0]} />
            <Line type="monotone" dataKey="MGO_유가" stroke="var(--color-danger)" strokeWidth={3} name="국제 선박 화물유가(MGO)" dot={{r:3}} />
            <Line type="monotone" dataKey="어획_단가" stroke="var(--color-info)" strokeWidth={2} name="현행 스팟 도매가 형성선" dot={false} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
          </ComposedChart>
      }
      takeaway={{
        situation: "시장 형성 어획 단가 대비 유가(MGO) 상승 속도가 빠르게 확대되고 있으며, 특정 임계 유가선(업계추정: 톤당 700달러 수준) 돌파 시 만선 회항 조업에서도 조업 마진이 음수로 전환되는 구간이 발생할 수 있습니다.",
        actionPlan: "유가 모니터링 임계 알림 체계를 구축하고, 고유가 장기화 시나리오 대비 MGO 파생상품 헤지 옵션 검토를 재무 담당에 요청하는 것이 바람직합니다.",
        source: "자체추정(운항원가 모델) / S&P Global Platts 참고"
      }}
    />
  );
}

export function Widget18_FXMargin() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_fx_margin.json').then(r => r.json()).then(setData); }, []);
  return (
        <WidgetCard
      title="무역의 배신: 고환율 쇼크에 따른 손익 역상관성"
      icon={DollarSign}
      iconColor="#8b5cf6"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      cardDesc="원물 달러매입(USD) 수입 결제 구조하에서 달러 고환율에 파괴되는 국내 OPM"
      chart={
<LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`₩${v}`} tickMargin={10} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--color-danger)" fontSize={11} tickFormatter={(v)=>`${v}%`} tickMargin={10} />
            <Tooltip contentStyle={{ background: '#0a0f1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Line yAxisId="left" type="monotone" dataKey="환율_원달러" stroke="var(--color-warning)" strokeWidth={3} name="원/달러 환율 공시가" dot={{r:3}} />
            <Line yAxisId="right" type="monotone" dataKey="영업이익률" stroke="var(--color-danger)" strokeWidth={4} name="무역 가공 본부 OPM" dot={{r:4}} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
          </LineChart>
      }
      takeaway={{
        situation: "원/달러 환율이 1,300원대~1,400원대로 장기화되면서, 달러 결제 원물 수입 비중이 높은 무역 구조에서는 매출이 유지되더라도 환차손으로 인해 영업이익률이 하락하는 역상관 관계가 나타나는 것으로 추정됩니다.",
        actionPlan: "스팟 달러 매입 비중 축소와 통화 선도(FRA) 계약 등 헤지 수단 검토를 재무팀과 협의하고, 다음 조업 시즌 결제 구조에 반영하는 방안을 고려할 수 있습니다.",
        source: "한국은행 환율 공시 / 내부 재무 추정(자체추정)"
      }}
    />
  );
}

export function Widget19_CollagenSpinoff() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_collagen_spinoff.json').then(r => r.json()).then(setData); }, []);
  return (
        <WidgetCard
      title="버려진 황금: 펩타이드 콜라겐 뷰티테크 스핀오프"
      icon={Rocket}
      iconColor="var(--color-success)"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      cardDesc="수산 부산물로 처리되던 명태 어피(껍질)의 고부가가치 전환 가능성 비교(부문별 매출비중·이익기여도 / 자체추정)"
      chart={
<BarChart data={data}>
  <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="sector" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`${v}%`} tickMargin={10} />
            <Tooltip contentStyle={{ background: '#0a0f1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Bar dataKey="매출비중" fill="#cbd5e1" name="그룹 전사 매출 점유(Volume)" radius={[4,4,0,0]} />
            <Bar dataKey="이익기여도" fill="#8b5cf6" name="영업 순수익 현금 캐리 포션" radius={[4,4,0,0]} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
          </BarChart>
      }
      takeaway={{
        situation: "어피(껍질)는 기존 수산 부산물 대비 마린 콜라겐 펩타이드 원료로 전환 시 이익기여도가 매출 비중 대비 현저히 높을 수 있다는 업계추정이 있으며, 글로벌 마린 콜라겐 시장은 성장세를 보이고 있습니다(구체적 수치는 공개 보고서 교차 검증 필요).",
        actionPlan: "어피 고도화 가공의 수익성과 투자 규모를 정량적으로 분석한 뒤, 결과에 따라 파일럿 검토 또는 외부 파트너십 탐색을 고려할 수 있습니다.",
        source: "업계추정 / 글로벌 마린 콜라겐 시장 동향 참고(출처 교차검증 권고)"
      }}
    />
  );
}

export function Widget20_Portfolio2030() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_2030_portfolio.json').then(r => r.json()).then(setData); }, []);
  return (
        <WidgetCard
      title="경영 최종 공의회: 2030 생존 포트폴리오의 미래"
      icon={BarChart2}
      iconColor="#38bdf8"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      cardDesc="사양화되는 기존 사업과 신규 블루오션 후보군의 이익률·성장성·시장규모 비교(자체추정 / 버블 크기=시장규모)"
      chart={
<ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis type="number" dataKey="이익률" name="이익률(%)" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`${v}%`} tickMargin={10} />
            <YAxis type="number" dataKey="성장성" name="성장율(Cagr)" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`${v}%`} tickMargin={10} />
            <ZAxis type="number" dataKey="시장크기" range={[50, 600]} name="글로벌 현금동원 마진볼륨(Bubble)" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#0a0f1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Scatter name="포트폴리오 대전환 점유도" data={data} fill="#0ea5e9">
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.성장성 > 10 ? 'var(--color-danger)' : 'var(--color-info)'} stroke="rgba(0,0,0,0.4)" strokeWidth={1} />
              ))}
            </Scatter>
          </ScatterChart>
      }
      takeaway={{
        situation: "본 차트는 자체추정 기반 포트폴리오 시뮬레이션으로, 1차 벌크형 도매 사업이 이익률·성장성 양면에서 신규 사업 후보 대비 열위에 놓일 수 있음을 시각적으로 나타냅니다. 실제 수치는 내부 재무 데이터로 검증이 필요합니다.",
        actionPlan: "2030 포트폴리오 전환 방향(자사 브랜드 D2C, 수리미, 콜라겐 인프라 등)의 투자 우선순위를 내부 수익성 분석 결과에 근거해 단계적으로 검토하는 것이 적절합니다.",
        source: "자체추정(전략 시뮬레이션) / 내부 전략 검토 참고"
      }}
    />
  );
}
