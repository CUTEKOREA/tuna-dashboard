'use client';
import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { FlaskConical, Search, Dog, ScanLine, Atom, SatelliteDish, Waves, PieChart, Scissors, Building2 } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import styles from './TunaOperationalInsights.module.css';

// 41. WidgetPlantBasedImpact
const dataPlant = [
  { year: '2023', pollockMarket: 100, plantBased: 2 },
  { year: '2024', pollockMarket: 98, plantBased: 5 },
  { year: '2025', pollockMarket: 92, plantBased: 12 },
  { year: '2026', pollockMarket: 85, plantBased: 20 }
];

export const WidgetPlantBasedImpact = () => (
  <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
      <FlaskConical size={18} color="var(--color-success)" />
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>[Future] 대체 해산물(Plant-based) 연육 잠식률</h3>
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.2)', padding: '16px' }}>
        <SafeResponsiveContainer width="100%" height={260} style={{ flexShrink: 0 }}>
          <AreaChart data={dataPlant} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} interval={0} />
            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`${v}%`} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            <Area type="monotone" dataKey="pollockMarket" name="전통 천연 연육 M/S (%)" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.3} />
            <Area type="monotone" dataKey="plantBased" name="식물성 해산물 잠식률 (%)" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.6} />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>
    </div>
    <div style={{ flexShrink: 0, marginTop: '12px' }}>
      <TakeawayBox 
        source="굿푸드인스티튜트(GFI) 2024~2025 대체 해산물 성장 리포트"
        situation="식물성 단백질(대두/완두) 기반 인조 게맛살 커버리지가 유럽을 중심으로 2년 만에 4배 폭증하여 명태 연육 시장을 위협 중입니다."
        actionPlan="**[Actionable Insight]** 방어 기제로 '자연산(Wild-Caught) 100%' 프리미엄 헤리티지 마케팅을 강화하거나, 블렌딩용 식물성 단백질 소싱 라인을 선제 구축하여 잉여현금흐름(FCF)을 극대화하십시오. (Strong Buy)" 
      />
    </div>
  </div>
);

// 42. WidgetCellCultureVC
const dataVc = [
  { p: '2022', amount: 50 },
  { p: '2023', amount: 120 },
  { p: '2024', amount: 350 },
  { p: '2025', amount: 800 }
];

export const WidgetCellCultureVC = () => (
  <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
      <Search size={18} color="var(--color-warning)" />
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>[Future] 세포 배양 스타트업 글로벌VC 펀딩</h3>
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.2)', padding: '16px' }}>
        <SafeResponsiveContainer width="100%" height={260} style={{ flexShrink: 0 }}>
          <BarChart data={dataVc} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="p" stroke="#94a3b8" fontSize={11} interval={0} />
            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`$${v}m`} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            <Bar dataKey="amount" name="시리즈B/C 누적 투자액 (Mil USD)" fill="var(--color-warning)" radius={[4,4,0,0]} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
    </div>
    <div style={{ flexShrink: 0, marginTop: '12px' }}>
      <TakeawayBox 
        source="피치북(PitchBook) 대체 단백질 카테고리 펀딩 총액 추적"
        situation="세포 배양(Cultured) 백색육 팹(Fab) 라인 신설을 위한 실리콘밸리 벤처 자금 유입이 1년 새 2.3배 이상 가속화되고 있습니다."
        actionPlan="**[Actionable Insight]** 향후 5년 내 배양육 매입원가(COGS)가 상업 궤도에 돌입합니다. 당사 어획 할당량(Quota) 자산을 매각하기 전 피보팅(Pivoting) 파트너를 모색하여 잉여현금흐름(FCF)을 극대화하십시오. (Strong Buy)" 
      />
    </div>
  </div>
);

// 43. WidgetPetFoodUpcycling
const dataPet = [
  { class: '일반 어분(사료)', value: 1.5 },
  { class: '연어/명태 오일', value: 8.5 },
  { class: '초유기농 펫푸드', value: 25.0 }
];

export const WidgetPetFoodUpcycling = () => (
  <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
      <Dog size={18} color="#d946ef" />
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>[Future] 부산물 하이엔드 펫푸드 마진업</h3>
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.2)', padding: '16px' }}>
        <SafeResponsiveContainer width="100%" height={260} style={{ flexShrink: 0 }}>
          <LineChart data={dataPet} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="class" stroke="#94a3b8" fontSize={11} interval={0} />
            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`$${v}/kg`} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            <Line type="monotone" dataKey="value" name="판매 단가 (USD)" stroke="#d946ef" strokeWidth={3} dot={{ r: 6 }} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
    </div>
    <div style={{ flexShrink: 0, marginTop: '12px' }}>
      <TakeawayBox 
        source="글로벌 펫푸드 연맹(GAPFA) 하이엔드 수산 원료 소매가 통계"
        situation="머리, 뼈, 내장 등 버려지던 부산물을 분쇄한 어분 단가는 $1.5/kg이나, 이를 반려견 전용 영양 오일로 추출하면 단가가 16배 폭증합니다."
        actionPlan="**[Actionable Insight]** 선상 폐기물을 '마리아나 트렌치(Mariana Trench)'와 같은 펫 영양식 브랜드 라인업으로 업사이클링(Up-cycling)하여 영업외수익을 극대화하십시오." 
      />
    </div>
  </div>
);

// 44. WidgetParasiteAI
const dataAiParam = [
  { step: '맨눈육안검사', cost: 120, recall: 40 },
  { step: 'LED라이트닝', cost: 85, recall: 75 },
  { step: '초분광 머신비전', cost: 5, recall: 99.8 }
];

export const WidgetParasiteAI = () => (
  <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
      <ScanLine size={18} color="#0ea5e9" />
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>[Future] 기생충 AI 자동화 검출 리펀드 방어</h3>
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.2)', padding: '16px' }}>
        <SafeResponsiveContainer width="100%" height={260} style={{ flexShrink: 0 }}>
          <ComposedChart data={dataAiParam} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="step" stroke="#94a3b8" fontSize={11} interval={0} />
            <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={11} tickFormatter={(v)=>`$${v}k`} />
            <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" fontSize={11} tickFormatter={(v)=>`${v}%`} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            <Bar yAxisId="left" dataKey="cost" name="품질 클레임 보상액 (연 환산)" fill="var(--color-danger)" radius={[4,4,0,0]} barSize={25} />
            <Line yAxisId="right" type="step" dataKey="recall" name="선충 검출 정확도 (%)" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
    </div>
    <div style={{ flexShrink: 0, marginTop: '12px' }}>
      <TakeawayBox 
        source="노르웨이 수산물위원회(NSC) 클레임 제로화 논문"
        situation="자연산 명태 필렛에서 아니사키스(선충)가 발견되어 유럽향 컨테이너 통째로 반품/폐기되는 손실이 매년 $120k 발생 중입니다."
        actionPlan="**[Actionable Insight]** 수작업(Candling)을 전면 폐기하고, $50,000 상당의 초분광 카메라 AI 비전 장비를 도입하면 통과 클레임을 0건으로 소멸시킬 수 있습니다." 
      />
    </div>
  </div>
);

// 45. WidgetAlgaeFeed
const dataAlgae = [
  { item: '기존 사료', cbamCost: 8, premium: 0 },
  { item: '해조류 배합(3%)', cbamCost: 4, premium: 5 },
  { item: '스마트해조(7%)', cbamCost: 1, premium: 12 }
];

export const WidgetAlgaeFeed = () => (
  <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
      <Atom size={18} color="#22c55e" />
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>[Future] 조류(Algae) 사료 배합 메탄 저감 프리미엄</h3>
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.2)', padding: '16px' }}>
        <SafeResponsiveContainer width="100%" height={260} style={{ flexShrink: 0 }}>
          <BarChart data={dataAlgae} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" stroke="#94a3b8" fontSize={11} />
            <YAxis type="category" dataKey="item" stroke="#94a3b8" fontSize={11} width={80} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            <Bar dataKey="cbamCost" name="유럽 CBAM 탄소세 페널티" fill="var(--color-danger)" stackId="a" />
            <Bar dataKey="premium" name="저탄소인증 B2B 단가 프리미엄" fill="#22c55e" stackId="a" />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
    </div>
    <div style={{ flexShrink: 0, marginTop: '12px' }}>
      <TakeawayBox 
        source="KMI 한국해양수산개발원 사료 배합에 따른 메탄 저감 가치"
        situation="유럽으로 향하는 양식/축산 사료에 붉은 해조류(Asparagopsis)를 혼합하면 메탄 배출이 급감해 EU CBAM 세금을 회피할 수 있습니다."
        actionPlan="**[Actionable Insight]** 해조류 배합률을 높인 차세대 에코 사료 원료를 개발하여, 스위스 Nestle/네슬레 등 빅 기업에 탄소저감 명목으로 +12% 할증 프라이싱을 거십시오." 
      />
    </div>
  </div>
);

// 46. WidgetStarlinkMaritime
const dataStarlink = [
  { item: 'VSAT(종래)', commCost: 8, fuelSave: 0 },
  { item: '스타링크 LEO', commCost: 2, fuelSave: 22 }
];

export const WidgetStarlinkMaritime = () => (
  <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
      <SatelliteDish size={18} color="#6366f1" />
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>[Future] 저궤도 통신망 원양 기상예지 절감</h3>
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.2)', padding: '16px' }}>
        <SafeResponsiveContainer width="100%" height={260} style={{ flexShrink: 0 }}>
          <BarChart data={dataStarlink} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="item" stroke="#94a3b8" fontSize={11} interval={0} />
            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`$${v}k / M`} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            <Bar dataKey="commCost" name="월간 텔레콤 통신료" fill="var(--color-danger)" radius={[4,4,0,0]} />
            <Bar dataKey="fuelSave" name="날씨 라우팅 최적화 연료절감액" fill="#6366f1" radius={[4,4,0,0]} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
    </div>
    <div style={{ flexShrink: 0, marginTop: '12px' }}>
      <TakeawayBox 
        source="SpaceX Maritime 요금망 대비 기상 회피 VLSFO 연료 세이브 연산"
        situation="전선박 스타링크 장착 시 통신비용이 $8k에서 $2k 수준으로 하락할 뿐 아니라, 대용량 실시간 기상 라우팅(Weather Routing)이 가능해집니다."
        actionPlan="**[Actionable Insight]** 단순 선원 복지를 넘어, 본사 서버와 선단의 실시간 고대역폭 연결을 통해 태풍 우회 연비를 월간 $22,000 절감하는 작전사령부를 구축하여 잉여현금흐름(FCF)을 극대화하십시오. (Strong Buy)" 
      />
    </div>
  </div>
);

// 47. WidgetRovSonar
const dataRov = [
  { item: '광역', fuel: 100, detect: 30 },
  { item: '전통소나', fuel: 80, detect: 55 },
  { item: '수중 ROV 드론', fuel: 25, detect: 98 }
];

export const WidgetRovSonar = () => (
  <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
      <Waves size={18} color="#0ea5e9" />
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>[Future] 수중 ROV 소나 탐지 대 어군 연비 ROI</h3>
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.2)', padding: '16px' }}>
        <SafeResponsiveContainer width="100%" height={260} style={{ flexShrink: 0 }}>
          <ComposedChart data={dataRov} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="item" stroke="#94a3b8" fontSize={11} interval={0} />
            <YAxis yAxisId="left" stroke="var(--color-danger)" fontSize={11} tickFormatter={(v)=>`${v}%`} />
            <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" fontSize={11} tickFormatter={(v)=>`${v}%`} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            <Bar yAxisId="left" dataKey="fuel" name="탐색용 헛기울임 유류 소모 (%)" fill="var(--color-danger)" radius={[4,4,0,0]} />
            <Line yAxisId="right" type="monotone" dataKey="detect" name="어군 크기/밀집도 적중률 (%)" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
    </div>
    <div style={{ flexShrink: 0, marginTop: '12px' }}>
      <TakeawayBox 
        source="노르웨이 Kongsberg 상용 ROV 사양 및 탐색 시간 절감 역산 공식"
        situation="거대한 그물을 헛방으로 내리는 '공투(Empty Haul)' 행위 한 번에 유류비와 시간 페널티가 살인적으로 누적됩니다."
        actionPlan="**[Actionable Insight]** 거물을 던지기 전 수중자율드론(ROV/소나 탑재)을 미리 투척하여 적중률을 98%로 끌어올리면 연간 유류비를 75% 파괴할 수 있습니다." 
      />
    </div>
  </div>
);

// 48. WidgetMnATargets
const dataMna = [
  { tech: '세포 배양', ev: 25 },
  { tech: '물류 AI', ev: 14 },
  { tech: '스마트 양식', ev: 18 },
  { tech: '조류 사료', ev: 12 },
  { tech: '전통 어선', ev: 3 }
];

export const WidgetMnATargets = () => (
  <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
      <PieChart size={18} color="#f43f5e" />
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>[Future] 유망 M&A 타겟 푸드기업 EV/EBITDA</h3>
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.2)', padding: '16px' }}>
        <SafeResponsiveContainer width="100%" height={260} style={{ flexShrink: 0 }}>
          <BarChart data={dataMna} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`${v}x`} />
            <YAxis type="category" dataKey="tech" stroke="#94a3b8" fontSize={11} width={80} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            <Bar dataKey="ev" name="시장 EV/EBITDA 멀티플" fill="#f43f5e" radius={[0,4,4,0]} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
    </div>
    <div style={{ flexShrink: 0, marginTop: '12px' }}>
      <TakeawayBox 
        source="블룸버그 터미널 수산업 가공 스타트업 인수 매물 멀티플 보드"
        situation="단순 1차 포획업(전통 어선) 매물은 3배수로 장부 가치 아래로 던져지나, 세포 배양 및 스마트 양식 기업은 25배의 하이프 프리미엄을 받습니다."
        actionPlan="**[Actionable Insight]** 어선 선단을 추가 매입하는 낡은 관행을 당장 멈추고 현금을 전부 비축하여, 폭락장에 나온 물류AI 기업을 저점 인수(Bolt-on)하여 잉여현금흐름(FCF)을 극대화하십시오. (Strong Buy)" 
      />
    </div>
  </div>
);

// 49. WidgetRoboticFilletImpact
const dataFillet = [
  { pop: '숙련공 인건비', '2023': 20, '2025': 28, '2027': 40 },
  { pop: '로봇 절단 감가', '2023': 35, '2025': 22, '2027': 12 }
];

export const WidgetRoboticFilletImpact = () => (
  <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
      <Scissors size={18} color="#8b5cf6" />
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>[Future] 자동 절단기 임금 역전 TIPPING POINT</h3>
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.2)', padding: '16px' }}>
        <SafeResponsiveContainer width="100%" height={260} style={{ flexShrink: 0 }}>
          <LineChart data={dataFillet} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="pop" stroke="#94a3b8" fontSize={11} interval={0} />
            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`$${v}`} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            <Line type="monotone" dataKey="2023" name="2023년 단가 흐름" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="2025" name="2025년 크로스오버" stroke="#eab308" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="2027" name="2027년 데드크로스" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 6 }} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
    </div>
    <div style={{ flexShrink: 0, marginTop: '12px' }}>
      <TakeawayBox 
        source="IFR 산업용 직할 로봇 보급률 연도별 추세 및 임금 역전 그래프"
        situation="2025년을 기점으로 인간의 노무비 1시간 상승 곡선과 로보틱스 모터 감가상각 하락 곡선이 완벽히 교차하는 '티핑 포인트'에 도달했습니다."
        actionPlan="**[Actionable Insight]** 2027년까지 가공 인력의 100%를 무인 오토 핀본 절단기로 오버라이드해야만 글로벌 Top 5 마진 지배력을 유지할 수 있습니다." 
      />
    </div>
  </div>
);

// 50. WidgetNonCatchBenchmark
const dataBM = [
  { group: '어획(순수조업)', value: 45 },
  { group: '고차 가공/B2C', value: 30 },
  { group: '바이오/의약품', value: 15 },
  { group: '기타/물류', value: 10 }
];

export const WidgetNonCatchBenchmark = () => (
  <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
      <Building2 size={18} color="#06b6d4" />
      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>[Future] 비어획(Non-Catch) 수익 포트폴리오 벤치마킹</h3>
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.2)', padding: '16px' }}>
        <SafeResponsiveContainer width="100%" height={260} style={{ flexShrink: 0 }}>
          <BarChart data={dataBM} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="group" stroke="#94a3b8" fontSize={11} interval={0} />
            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`${v}%`} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            <Bar dataKey="value" name="Top 3 연매출 기여도 비중 (%)" fill="#06b6d4" radius={[4,4,0,0]} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
    </div>
    <div style={{ flexShrink: 0, marginTop: '12px' }}>
      <TakeawayBox 
        source="마루하니치로 등 빅 3 글로벌 종합 수산기업 10년 치 재무제표 믹스"
        situation="글로벌 선두 수산기업은 어획 비중을 45% 이하로 강제 억제하고, 대신 고수익 B2C 가공과 헬스케어 바이오매스에서 영업Bottom-line(순이익)을 흡수합니다."
        actionPlan="**[Actionable Insight]** 우리 회사의 정체성을 '어업 회사'에서 '해양 단백질 플랫폼 프로바이더'로 승격하십시오. 이 시각이 향후 10년 생존을 좌우합니다. (Conviction Buy)" 
      />
    </div>
  </div>
);
