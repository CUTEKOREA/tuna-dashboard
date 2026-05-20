import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie, Treemap } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Globe, TrendingUp, Anchor, ShieldCheck, Ship, DollarSign, Database, Rocket, AlertTriangle, Crosshair, BarChart2, Activity, Zap } from 'lucide-react';
import styles from './MackerelStrategy.module.css';
import TakeawayBox from './TakeawayBox';

const glassContainerStyle = {
  background: 'rgba(0, 15, 30, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px', display: 'flex', flexDirection: 'column' as const, height: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', position: 'relative' as const
};


export function Widget17_OilMargin() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_oil_margin.json').then(r => r.json()).then(setData); }, []);
  return (
    <div style={glassContainerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Zap size={20} color="var(--color-danger)" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-danger)', margin: 0 }}>
          출항 마지노선: 유가(MGO) 쇼크 대비 조업 셧다운 데드라인
        </h3>
        
      </div>
      <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
        연료비가 전체 어선의 마진 단가를 초과 잠식시켜버리는 회계 자본 잠식회사 곡선
      </div>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}></div>
      <div style={{ height: 280 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={9} tickMargin={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`$${v}`} tickMargin={10} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Bar dataKey="추정_영업이익" fill="var(--color-success)" name="척당 월 추정 이익(초과 시 손실 폭주)" radius={[4,4,0,0]} />
            <Line type="monotone" dataKey="MGO_유가" stroke="var(--color-danger)" strokeWidth={3} name="국제 선박 화물유가(MGO)" dot={{r:3}} />
            <Line type="monotone" dataKey="어획_단가" stroke="var(--color-info)" strokeWidth={2} name="현행 스팟 도매가 형성선" dot={false} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          situation="시장 형성 어획 단가 대비 기름값(유가 상승 속도)이 너무도 가팔라, 특정 MGO 임계 유가선(예: 톤당 700불)을 상향 돌파 시 선원들이 몸을 갈아넣어 만선 회항을 하여도 은행 잔고는 적자로 잠식되는 수학적 절망 구간이 공표되었습니다."
          actionPlan="부서 내 유가 모니터링 경보를 DEFCON 2레벨로 대기 격상시키십시오. 고유가 장기 늪으로 진입하여 매입원가 보전을 실패할 경우, 글로벌 금융권 선박 MGO 파생상품 옵션을 즉각 매수 헷징하는 선제 조항을 본사 매뉴얼에 즉시 편입할 것을 긴급 발의합니다."
          source="Silla Financial Operations Internal System & S&P Global Platts"
        />
      </div>
    </div>
  );
}

export function Widget18_FXMargin() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_fx_margin.json').then(r => r.json()).then(setData); }, []);
  return (
    <div style={glassContainerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <DollarSign size={20} color="#8b5cf6" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#8b5cf6', margin: 0 }}>
          무역의 배신: 고환율 쇼크에 따른 손익 역상관성
        </h3>
        
      </div>
      <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
        원물 달러매입(USD) 수입 결제 구조하에서 달러 고환율에 파괴되는 국내 OPM
      </div>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}></div>
      <div style={{ height: 280 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`₩${v}`} tickMargin={10} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--color-danger)" fontSize={11} tickFormatter={(v)=>`${v}%`} tickMargin={10} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Line yAxisId="left" type="monotone" dataKey="환율_원달러" stroke="var(--color-warning)" strokeWidth={3} name="원/달러 환율 공시가" dot={{r:3}} />
            <Line yAxisId="right" type="monotone" dataKey="영업이익률" stroke="var(--color-danger)" strokeWidth={4} name="무역 가공 본부 OPM" dot={{r:4}} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          situation="강달러 1,300원대~1,400원선 뉴노멀 악재가 수년째 도래함에 따라, 무역 지부가 식당들에게 현행 정상 마진율에 물건을 열심히 팔아도 연말 결산 시 환차손 데미지로 인해 영업 무역 장부가 산산조각 박살 나는 역상관의 충격 현장입니다."
          actionPlan="당장의 스팟 달러 구매를 전부 스톱 홀딩하십시오. 주요 외국계 1금융권과 통화 선도 분할(FRA) 계약 체결을 즉각 발동시켜 차기 조업 시즌 1년 치 결제 펀드 자본을 강력 고정 락인하고 경영진 보호막을 두르셔야 생존합니다."
          source="Bank of Korea Exchange Rate & Corporate Finance Data"
        />
      </div>
    </div>
  );
}

export function Widget19_CollagenSpinoff() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_collagen_spinoff.json').then(r => r.json()).then(setData); }, []);
  return (
    <div style={glassContainerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Rocket size={20} color="var(--color-success)" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-success)', margin: 0 }}>
          버려진 황금: 펩타이드 콜라겐 뷰티테크 스핀오프
        </h3>
        
      </div>
      <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
        수산 폐기물 쓰레기로 버려지던 명태 어피(껍질)의 영업 이익 하드 펌핑 신화
      </div>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}></div>
      <div style={{ height: 280 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="sector" stroke="rgba(255,255,255,0.5)" fontSize={11} tickMargin={10} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`${v}%`} tickMargin={10} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Bar dataKey="매출비중" fill="#cbd5e1" name="그룹 전사 매출 점유(Volume)" radius={[4,4,0,0]} />
            <Bar dataKey="이익기여도" fill="#8b5cf6" name="영업 순수익 현금 캐리 포션" radius={[4,4,0,0]} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', paddingTop: '10px' }} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          situation="kg당 100원 남짓 동물의 먹이나 쓰레기장 수산 폐기물로 버려지던 하급 어피(껍질)가 초미세 흡수율을 자랑하는 푸드테크(마린 콜라겐 펩타이드) 화장품 원료로 폭발하면서, 기존 생선 뼈째 파는 본업의 Bottom-line(순이익)률을 수십 배 비웃는 현금 창출 괴물로 탈바꿈했습니다."
          actionPlan="단순 어피 수집 하청과 공장 청소를 곁다리 업무 취급하던 인식을 뒤엎으십시오. 어피 분자 고도화 가공을 그룹 이사회 최우선 혁신 태스크포스(TF)로 단독 출범시키고, 글로벌 톱티어 에스테틱 제약 및 뷰티 계열사와 조인트 벤처 양해 각서를 체결하여 기술 우위를 독식."
          source="Global Marine Pharmaceuticals Valuation Intelligence"
        />
      </div>
    </div>
  );
}

export function Widget20_Portfolio2030() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/data/pollock_2030_portfolio.json').then(r => r.json()).then(setData); }, []);
  return (
    <div style={glassContainerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <BarChart2 size={20} color="#38bdf8" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8', margin: 0 }}>
          경영 최종 공의회: 2030 생존 포트폴리오의 미래
        </h3>
        
      </div>
      <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
        사양화되는 기존 비즈니스와 캐시카우를 대체할 블루오션의 Bubble Map
      </div>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}></div>
      <div style={{ height: 280 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis type="number" dataKey="이익률" name="이익률(%)" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`${v}%`} tickMargin={10} />
            <YAxis type="number" dataKey="성장성" name="성장율(Cagr)" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v)=>`${v}%`} tickMargin={10} />
            <ZAxis type="number" dataKey="시장크기" range={[50, 600]} name="글로벌 현금동원 마진볼륨(Bubble)" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
            <Scatter name="포트폴리오 대전환 점유도" data={data} fill="#0ea5e9">
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.성장성 > 10 ? 'var(--color-danger)' : 'var(--color-info)'} stroke="rgba(0,0,0,0.4)" strokeWidth={1} />
              ))}
            </Scatter>
          </ScatterChart>
        </SafeResponsiveContainer>
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          situation="매출 절대다수(Volume) 규모의 환상을 심어주며 임원진의 눈을 가렸던 옛 영광의 1차 벌크형 도매 비즈니스는 성장성과 Bottom-line(순이익)률이 모두 박살 난 왼쪽 하단 사분면 침수 늪으로 추락한 명백한 재무 데이터를 고발합니다."
          actionPlan="현 상태에 안주하여 재래식 냉동 창고에 흑자 도산의 무덤을 파지 마십시오. 오늘 회장단 최고위 협의체에서 2030 플랜을 기안하십시오. 회사의 향후 모든 수 백억 대 CapEx(시설 투자 자본) 신규 확충의 100%를 오로지 자사 브랜딩 D2C 멸균 제품, 파생 화학 수리미, 바이오 제약 콜라겐 인프라에 전면 융단 폭격 이동할 것을 의결 선언해야 합니다."
          source="Silla Strategy Consulting Group: 2030 Value Roadmap"
        />
      </div>
    </div>
  );
}
