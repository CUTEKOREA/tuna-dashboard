'use client';
import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ScatterChart, Scatter, ZAxis } from 'recharts';
import { CandlestickChart, Activity, ShieldCheck, Cpu, Snowflake, Users, Banknote, Anchor, Bot, PlaneTakeoff } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

// 5. 명란 D2C vs B2B 수익 맵
const roeData = [
  { category: '벌크 통어란 (0303.91, 관세율 10%)', margin: 8, retailVol: 100 },
  { category: '가공 파명란 (B-Grade)', margin: 15, retailVol: 40 },
  { category: '초프리미엄 저염/무색소 조제 명란 (D2C)', margin: 55, retailVol: 10 },
];

export function WidgetRoeMarginSpread() {
  return (
    <WidgetCard
      title="조제 명란 마진 스프레드 맵 (D2C vs 벌크)"
      icon={CandlestickChart}
      iconColor="#cbd5e1"
      pillar="S2"
      cardDesc="저관세 0303.91 수입 어란을 조제 명란(1604)으로 국내에서 전환했을 때의 부가가치 폭발점 계산"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      termTooltip={{ term: 'Roe D2C vs B2B Margin Spread', description: '저관세 0303.91 수입 어란을 조제 명란(1604)으로 국내에서 전환했을 때의 부가가치 폭발점 계산' }}
      chartHeight={260}
      chart={
        <ComposedChart layout="vertical" data={roeData} margin={{ top: 10, right: 30, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
          <XAxis type="number" stroke="var(--w-slate-400)" fontSize={11} tickFormatter={(v)=>`${v}%`} />
          <YAxis dataKey="category" type="category" stroke="var(--w-slate-300)" fontSize={10} width={150} tick={{fill: 'var(--w-slate-200)'}} />
          <RechartsTooltip contentStyle={{ backgroundColor: 'var(--w-navy-900)', border: 'none', color: 'var(--text-primary)' }} />
          <Bar dataKey="margin" name="최종 영업 이익률 (Margin %)" fill="var(--color-success)" barSize={20} radius={[0, 4, 4, 0]} />
        </ComposedChart>
      }
      takeaway={{
        source: 'FIS 명란젓 시장 동향 + 자체추정 (마진 수치 채널별 추정)',
        situation: `<div>
<p>"명란(Roe)"이란 명태의 알. 명태 전체 포트폴리오(필레·수리미·로) 중 가장 부가가치 높은 부위로, 한국 시장에서 핵심 밥도둑 반찬으로 자리매김.</p>
<p>채널별 마진 추정: <strong>벌크 B2B 납품(식당 도매상) 마진 약 8%</strong> vs <strong>고부가 선물세트·저염 명란 브랜드 D2C 마진 약 55%</strong> — 약 6.9배 격차 추정. 같은 어란을 어떤 채널로 어떤 SKU로 파느냐가 마진을 결정.</p>
<p>왜 이 격차? ① 한국 명란 시장은 사실상 한·일 양국 demand가 글로벌의 95%+ — 뚜렷한 demand pool ② D2C 채널은 중간 유통 마진 300~500bp 직접 회수 ③ 선물세트·저염 SKU는 가격 민감도 낮은 luxury segment ④ 명란은 vegetarian 대체 불가능한 차별화 성분(콜레스테롤·EPA).</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 명란은 단순 명태 부산물이 아닌 <strong>"한국 향식 luxury food brand의 단독 SKU 후보"</strong>. 어란 매출 portfolio를 B2B 80% → D2C 50%로 재배치하면 EBITDA +12~18%p.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>벌크 B2B 식당 도매상 직납 물량 축소</strong>: 마진 8% segment 비중 80% → 30%로 단계적 감축.</li>
<li style="margin-bottom: 8px;"><strong>부산/속초 스마트 팩토리 조제 명란 라인 풀-가동 + D2C 브랜드 launch</strong>: "한국 향식 luxury Roe" 포지셔닝. Amorepacific Sulwhasoo·CJ Hetbahn 같은 한국 luxury K-brand 모델 차용.</li>
<li><strong>일본 cross-border export 가속</strong>: 일본 명란젓 시장 약 $800M, 한국 향식이 점진적으로 일본 입맛 침투 중. 우리 자체 brand로 일본 미슐랭 한식당 + 도쿄 isetan·신주쿠 takashimaya 직납.</li>
</ol>
</div>`,
      }}
    />
  );
}

// 6. 전가 저항선
const transferData = [
  { priceInc: 0, saleVol: 100, prod: '벌크 동태 (대체재 多)' },
  { priceInc: 10, saleVol: 95, prod: '벌크 동태 (대체재 多)' },
  { priceInc: 25, saleVol: 60, prod: '벌크 동태 (대체재 多)' }, // 급락
  { priceInc: 0, saleVol: 100, prod: '순살 필레 버거 (대체 불가)' },
  { priceInc: 10, saleVol: 98, prod: '순살 필레 버거 (대체 불가)' },
  { priceInc: 25, saleVol: 90, prod: '순살 필레 버거 (대체 불가)' },
];

export function WidgetPriceTransferResistance() {
  return (
    <WidgetCard
      title="수입원가 소비자가 전가 저항선 지수"
      icon={Activity}
      iconColor="#cbd5e1"
      pillar="S4"
      cardDesc="원가 급등분을 납품 단가에 가산(전가)할 때 발생하는 소비자 구매량(수요) 감소의 마지노선"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      termTooltip={{ term: 'Price Transfer Resistance', description: '원가 급등분을 납품 단가에 가산(전가)할 때 발생하는 소비자 구매량(수요) 감소의 마지노선' }}
      chartHeight={260}
      chart={
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
          <XAxis dataKey="priceInc" type="number" name="판매가 인상률" tickFormatter={(v)=>`+${v}%`} stroke="var(--w-slate-400)" />
          <YAxis dataKey="saleVol" type="number" name="판매량 유지율" tickFormatter={(v)=>`${v}%`} stroke="var(--w-slate-400)" domain={[40, 110]} />
          <ZAxis dataKey="prod" type="category" name="제품군" />
          <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--w-navy-900)', border: '1px solid #334155' }} />
          <Scatter name="전가 수요 감소 트렌드" data={transferData} fill="#fca5a5" line={{ stroke: '#fca5a5', strokeWidth: 2 }} />
        </ScatterChart>
      }
      takeaway={{
        source: '자체추정 (SKU별 가격탄력성 시뮬레이션)',
        situation: `<div>
<p>"가격 전가 저항선(Price Pass-through Resistance)"이란 매입원가 상승을 소비자가에 얼마나 전가할 수 있는지의 한계. 동일 원물(명태)이라도 SKU에 따라 차이가 큽니다.</p>
<p>시뮬레이션 기반 추정: <strong>벌크 통마리/동태</strong> — 시장 판매가 +20% 인상 시 수요 -40~50% (소비자가 오징어·돼지고기로 이탈 추정). <strong>프랜차이즈 피쉬버거 필레·영유아 순살 패키지</strong> — 가격 +25% 인상해도 이탈 10% 미만 추정.</p>
<p>왜 격차? 벌크 동태는 대체재(다른 단백질) 많고 소비자 정보 비대칭 낮음. 반면 가공 필레·영유아 SKU는 ① 가공·위생 신뢰 ② B2B 계약 락업 (피쉬버거 프랜차이즈) ③ 영유아 카테고리는 가격 무탄력 — switching cost 매우 높음.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: KPI를 <strong>"벌크 톤수"에서 "가공 RTC 마진 수성률"</strong>로 전환. 명태 P&amp;L의 본질은 volume이 아닌 price elasticity 낮은 SKU에 capacity 집중.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>RTC 필레 portfolio 비중 확대</strong>: 현재 30% → 60%로 단계적 확대. 냉동창고 슬롯 재배치.</li>
<li style="margin-bottom: 8px;"><strong>프랜차이즈 피쉬버거 B2B 5년 fixed-price 계약</strong>: 맥도날드·롯데리아·맘스터치 등 5사와 5년 long-term contract으로 채널 lock-in.</li>
<li><strong>영유아·실버 카테고리 신규 SKU launch</strong>: 가격 무탄력 segment 진입. 식약처 "고령친화우수식품" + "어린이 기호식품 품질인증" 동시 획득. ASP +40~60% 프리미엄.</li>
</ol>
</div>`,
      }}
    />
  );
}

// 7. MSC 프리미엄 스프레드
const mscData = [
  { year: '2023', mscPrice: 2200, normalPrice: 2100 },
  { year: '2024', mscPrice: 2450, normalPrice: 2200 },
  { year: '2025', mscPrice: 2800, normalPrice: 2350 },
  { year: '2026', mscPrice: 3200, normalPrice: 2400 },
];

export function WidgetMSCPremiumSpread() {
  return (
    <WidgetCard
      title="MSC 인증 프리미엄 가격 탈동조화"
      icon={ShieldCheck}
      iconColor="#cbd5e1"
      pillar="S5"
      cardDesc="글로벌 ESG 의무화 트렌드에 따른 MSC(해양관리협의회) 인증 명태의 가격 프리미엄 벌어짐 현상"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      termTooltip={{ term: 'MSC Premium Spread', description: '글로벌 ESG 의무화 트렌드에 따른 MSC(해양관리협의회) 인증 명태의 가격 프리미엄 벌어짐 현상' }}
      chartHeight={260}
      chart={
        <AreaChart data={mscData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="year" stroke="var(--w-slate-400)" fontSize={12} />
          <YAxis stroke="var(--w-slate-400)" fontSize={12} domain={[1500, 3500]} tickFormatter={(v)=>`$${v}`} />
          <RechartsTooltip contentStyle={{ backgroundColor: 'var(--w-navy-900)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area type="monotone" dataKey="mscPrice" name="MSC 인증 프리미엄 단가" stroke="var(--w-violet-500)" fill="var(--w-violet-500)" fillOpacity={0.3} />
          <Area type="monotone" dataKey="normalPrice" name="일반 비인증 단가" stroke="#475569" fill="#475569" fillOpacity={0.1} />
        </AreaChart>
      }
      takeaway={{
        source: 'UN FAO 에코라벨 지표 + 업계추정 (MSC 프리미엄 가격 스프레드)',
        situation: `<div>
<p><strong>MSC(Marine Stewardship Council)</strong>는 지속가능 수산물 인증의 글로벌 골드 스탠다드. 명태(Pollock) segment에서 MSC가 사실상의 entry license가 됨.</p>
<p>매대 차단 트리거: <strong>맥도날드(글로벌 피쉬버거 1위)·이케아·서브웨이</strong>가 "100% MSC 명태만 사용" 의무화. 결과: 비인증 명태는 글로벌 외식 B2B에서 사실상 매대 차단.</p>
<p>가격 격차: MSC 알래스카·러시아산 명태 vs 비인증 어획물 spread가 해마다 기하급수적 이격(Decoupling). 2026년 평균 spread <strong>+18~25%</strong>. 원물 부족(러시아 제재·MSC 쿼터 강화) 시 격차 +35%+ 폭증 가능.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: MSC 인증 spread는 단순 ESG 프리미엄이 아닌 <strong>"글로벌 외식 B2B 입장권"</strong>. 비인증 매입은 한국 내수에만 갇히는 단기 시야.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>MSC 인증 쿼터 100% 집중 매입</strong>: 비인증 덤핑 유혹 차단. 약간의 프리미엄(+18~25%) 부담하더라도 MSC만 매입.</li>
<li style="margin-bottom: 8px;"><strong>알래스카 MSC 쿼터 5년 forward 락업</strong>: 알래스카는 정치적으로 안정 + MSC 100% 인증 어장. 5년 forward 계약으로 향후 spread 폭증 시 알파 확보. 러시아 비중은 30% 이하로 단계적 축소.</li>
<li><strong>"MSC certified pollock" 글로벌 B2B 채널 락업</strong>: 맥도날드·서브웨이·이케아·미군 PX·일본 이온 톱밸류 6대 채널에 5년 exclusive 공급 계약 체결. 단순 vendor에서 strategic supplier로 격상.</li>
</ol>
</div>`,
      }}
    />
  );
}

// 8. 공장 로봇 도입 BEP
const bepData = [
  { year: '2023', manualCost: 1500, robotCost: 2800 },
  { year: '2024', manualCost: 1650, robotCost: 2700 },
  { year: '2025', manualCost: 1900, robotCost: 2600 },
  { year: '2026', manualCost: 2200, robotCost: 2100 }, // BEP Crossover
  { year: '2027', manualCost: 2600, robotCost: 1800 },
];

export function WidgetFactoryAutomation() {
  return (
    <WidgetCard
      title="스마트 팩토리 자동화 손익분기 역전 지표"
      icon={Cpu}
      iconColor="#cbd5e1"
      pillar="S2"
      cardDesc="최저임금 인상 및 숙련공 노령화에 따른 수작업 비용과 로봇 기반 절단/해동 자동화 설비 도입의 손익분기점"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      termTooltip={{ term: 'Automation BEP Crossover', description: '최저임금 인상 및 숙련공 노령화에 따른 수작업 비용과 로봇 기반 절단/해동 자동화 설비 도입의 손익분기점' }}
      chartHeight={260}
      chart={
        <ComposedChart data={bepData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
          <XAxis dataKey="year" stroke="var(--w-slate-400)" fontSize={12} />
          <YAxis stroke="var(--w-slate-300)" fontSize={12} domain={[1000, 3000]} tickFormatter={(v)=>`₩${v}`} />
          <RechartsTooltip contentStyle={{ backgroundColor: 'var(--w-navy-900)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area type="monotone" dataKey="manualCost" name="기존 수작업 1톤당 임가공비" fill="#f43f5e" fillOpacity={0.2} stroke="#f43f5e" strokeWidth={2} />
          <Line type="monotone" dataKey="robotCost" name="자동화 로봇 1톤당 공정비 (상각 포함)" stroke="var(--color-success)" strokeWidth={3} dot={{r: 5}} />
        </ComposedChart>
      }
      takeaway={{
        source: '업계추정 (BCG 제조업 자동화 지표 참조 + 자체 CAPEX 시뮬레이션)',
        situation: `<div>
<p>전통적으로 명태 가공은 <strong>중국 다롄·칭다오</strong>의 저임 노동력에 의존했습니다. 그러나 두 변수의 X자 교차로 인해 게임이 바뀌고 있습니다.</p>
<p>변수 1: <strong>중국 임가공비 폭증</strong> — 다롄·칭다오 시급 5년간 +85%, 동시에 젊은 숙련공이 어류 가공 기피로 구인난 심화. 변수 2: <strong>AI 비전 자동화 단가 하락</strong> — Pin-bone removal 머신·자동 필레팅 머신 도입 단가가 규모의 경제로 -40~50%.</p>
<p>크로스오버 시점: <strong>2026년</strong>. 이 시점부터 로봇 공정의 비용 효율이 중국 수작업을 완전히 압도. 메뚜기 전략(중국 → 베트남 → 인도네시아로 저임 거점 이동)은 사실상 끝.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 명태 가공의 미래는 저임 노동력 이주가 아닌 <strong>"한국 내 AI 자동화 허브 집중 capex"</strong>. 부산/속초 hub에 가공 capacity 집중 + 품질 균일화 + 위생 리스크 차단.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>중국 OEM 비중 감축</strong>: 다롄 50% → 20%로 단계적 축소. capex를 한국으로 재배치.</li>
<li style="margin-bottom: 8px;"><strong>부산/속초 AI 가공 라인 즉시 capex</strong>: BAADER/Marel automated filleting + AI vision pin-bone removal. 라인당 $3~5M, 회수 36개월.</li>
<li><strong>"K-Pollock automated processing hub" 진화</strong>: 5년 후 한국이 글로벌 명태 자동화 가공의 신표준 hub로 자리매김. 자체 SaaS 라이센싱으로 동남아 mid-tier 가공사에 추가 수익원.</li>
</ol>
</div>`,
      }}
    />
  );
}

// [NEW] 21. 최상급 냉동 보관료(Reefer) 공간 부족 프리미엄 (Tab 3)
const dataReeferCapacity = [
  { month: 'Q1', capacityPct: 82, reeferCost: 45 },
  { month: 'Q2', capacityPct: 89, reeferCost: 55 },
  { month: 'Q3', capacityPct: 95, reeferCost: 85 },
  { month: 'Q4', capacityPct: 98, reeferCost: 120 }
];

export const WidgetReeferCapacity = () => {
  return (
    <WidgetCard
      title="[Cost] 콜드체인(Reefer) 가동률 및 보관료 폭주"
      icon={Snowflake}
      iconColor="#06b6d4"
      pillar="S3"
      cardDesc="냉동 화물(Reefer) 창고 가동률 상승에 따른 보관 단가 페널티 급등 추이"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={260}
      chart={
        <ComposedChart data={dataReeferCapacity} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
          <XAxis dataKey="month" stroke="var(--w-slate-400)" fontSize={12} />
          <YAxis yAxisId="left" stroke="var(--w-slate-400)" fontSize={11} tickFormatter={(v)=>`${v}%`} domain={[60, 100]} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--w-cyan-500)" fontSize={11} tickFormatter={(v)=>`$${v}`} />
          <RechartsTooltip contentStyle={{ backgroundColor: 'var(--w-navy-900)', border: 'none', color: 'var(--text-primary)' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--w-slate-300)' }} />
          <Bar yAxisId="left" dataKey="capacityPct" name="냉동창고 가동률(%)" fill="var(--color-info)" radius={[4, 4, 0, 0]} barSize={30} />
          <Line yAxisId="right" type="monotone" dataKey="reeferCost" name="플러그/보관 인상료($)" stroke="var(--w-cyan-500)" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{
        source: '업계추정 (부산·인천 냉동창고 운영업체 평균 단가 참조)',
        situation: `<div>
<p><strong>"Reefer Cold Storage"</strong>는 -18℃ 이하 유지되는 냉동 컨테이너·창고. 명태는 100% 냉동 유통이므로 reefer capa가 곧 비즈니스 capa.</p>
<p>병목 현상: 동남아 우회 물류(홍해·수에즈 대체) + 명태 가공 적체로 부산·인천 reefer 창고 <strong>가동률 95% 초과</strong>. Full Capacity 초과 시 보관 단가가 평시 +200~400% 페널티급 폭등.</p>
<p>의미: 창고에 원물을 장기 보관하는 것 자체가 매초 "악성 비용". 평소 톤당 월 $25 보관비가 peak 시즌 $80~120까지 치솟음. 마진 -5~10%p 직접 잠식.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: Reefer capa는 단순 logistics가 아닌 <strong>"명태 비즈니스 throughput의 hard ceiling"</strong>. 비수기 선제적 capa 락업이 alpha generator.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>JIT(Just-in-Time) 가공 원칙</strong>: 원물 매입 → 가공 → 출하 cycle을 30일 이내로 단축. 재고 회전율 +2배.</li>
<li style="margin-bottom: 8px;"><strong>비수기 자사 콜드체인 창고 슬롯 장기 매입</strong>: 1~3월 비수기에 부산·인천 reefer 슬롯 12개월 forward 락업. 평시 단가의 70%로 확보.</li>
<li><strong>"Cold storage SaaS arbitrage"</strong>: 우리가 확보한 잉여 slot을 mid-tier 수산사에 sub-lease — 보관료 매출로 EBITDA +3~5%p 추가. JP Morgan Cold Chain Finance와 partnership.</li>
</ol>
</div>`,
      }}
    />
  );
}

// [NEW] 22. 원양 선원 노령화 및 구인난 임금 타격 게이지 (Tab 3)
const dataCrewShortage = [
  { year: '2020', avgAge: 48, wageIndex: 100 },
  { year: '2022', avgAge: 51, wageIndex: 115 },
  { year: '2024', avgAge: 54, wageIndex: 140 },
  { year: '2026(E)', avgAge: 56, wageIndex: 175 }
];

export const WidgetCrewShortage = () => {
  return (
    <WidgetCard
      title="[Cost] 선단 선원 노령화 및 인건비 타격"
      icon={Users}
      iconColor="var(--color-warning)"
      pillar="S1"
      cardDesc="원양 선원 평균 연령 초고령화와 외인 선원 임금 지수 폭등 추이"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={260}
      chart={
        <ComposedChart data={dataCrewShortage} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
          <XAxis dataKey="year" stroke="var(--w-slate-400)" fontSize={12} />
          <YAxis yAxisId="left" stroke="var(--w-slate-400)" fontSize={11} domain={[40, 60]} tickFormatter={(v)=>`${v}세`} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-warning)" fontSize={11} domain={[80, 200]} />
          <RechartsTooltip contentStyle={{ backgroundColor: 'var(--w-navy-900)', border: 'none', color: 'var(--text-primary)' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--w-slate-300)' }} />
          <Bar yAxisId="left" dataKey="avgAge" name="항해사/선원 평균 연령" fill="var(--w-navy-900)" stroke="var(--w-slate-300)" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="stepAfter" dataKey="wageIndex" name="외인 선원 임금 지수(2020=100)" stroke="var(--color-warning)" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{
        source: '업계추정 (BIMCO/ITF 선원 수급 보고서 참조)',
        situation: `<div>
<p>북태평양 혹한기 명태 조업은 극한 환경 노동 — 영하 30℃ + 풍랑 + 한 번 출항 시 3~6개월. 젊은 인력이 절대적으로 기피하는 직종.</p>
<p>고령화 현실: <strong>한국 원양 선원 평균 연령 56세</strong>로 초고령화. 신규 진입 거의 0, 은퇴 가속. 동시에 외인 선원(인도네시아·필리핀·베트남) 프리미엄 임금 매해 두 자릿수 폭등 — 5년간 +85%.</p>
<p>결과: "물고기가 있어도 배트맨(선원)이 없어 조업 포기" 사태 빈발. 향후 5년 한국 원양 선단의 가동률 -20~30% 잠재 위험.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 선원 부족은 단순 인건비 변수가 아닌 <strong>"한국 원양어업 자체 존속 위협"</strong>. 외인 직소싱 + 자동화 capex 2-track 동시 필요.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>동남아 외인 선원 직소싱 전담 부서 내재화</strong>: 인도네시아·필리핀·베트남 manning agency 의존 탈피, 본사 직접 채용. 인건비 -15~20% + 중간 수수료 절감.</li>
<li style="margin-bottom: 8px;"><strong>크레인/그물 자동화 설비 업그레이드</strong>: 척당 capex $2~4M으로 인력 소요 -40%. 10년 회수 기간.</li>
<li><strong>"무인 자동 어선" 차세대 capex</strong>: 5~10년 R&amp;D로 한국형 무인 명태 어선 개발. Kongsberg(노르웨이)·Mitsui OSK(일본)와 partnership. 2035년 첫 commissioning 목표. 본질적으로 선원 비용 zero 구조 전환.</li>
</ol>
</div>`,
      }}
    />
  );
}

// [NEW] 23. 한-동남아-러 3각 환율 헷징 타겟 (Tab 3)
const dataFXHedging = [
  { month: 'USD 1330', fxLoss: 5, action: 'Buy' },
  { month: 'USD 1350', fxLoss: 12, action: 'Hold' },
  { month: 'USD 1380', fxLoss: 25, action: 'Stop' },
  { month: 'USD 1410', fxLoss: 45, action: 'Hedge' }
];

export const WidgetFXHedging = () => {
  return (
    <WidgetCard
      title="[Cost] 강달러 환차손 임계점 방어 시뮬레이션"
      icon={Banknote}
      iconColor="var(--color-success)"
      pillar="S2"
      cardDesc="달러 매입 기반 수입업의 원/달러 환율별 영업이익 환차손 시뮬레이션"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={260}
      chart={
        <BarChart data={dataFXHedging} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} barSize={40}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
          <XAxis dataKey="month" stroke="var(--w-slate-400)" fontSize={12} />
          <YAxis stroke="var(--color-danger)" fontSize={11} domain={[0, 60]} tickFormatter={(v)=>`-${v}%`} />
          <RechartsTooltip contentStyle={{ backgroundColor: 'var(--w-navy-900)', border: 'none', color: 'var(--text-primary)' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--w-slate-300)' }} />
          <Bar dataKey="fxLoss" name="영업이익 환차손 증발률(%)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{
        source: '자체추정 (환율별 마진 시뮬레이션)',
        situation: `<div>
<p>명태 비즈니스의 가장 큰 hidden risk: <strong>환율</strong>. 매입(러시아·알래스카·미국)은 100% USD 베이스, 국내 매출(통조림·필레·황태)은 100% KRW 베이스. 즉 currency mismatch가 본업 마진의 가장 큰 외생 변수.</p>
<p>임계점: <strong>USD/KRW ₩1,380 초과</strong> 시 가공 마진이 환차손으로 빈 껍데기. 평시 마진 8%가 환율 ₩1,400 도달 시 1~2%로 압축.</p>
<p>의미: 명태 회사의 본질은 <strong>"수산업 + FX trading 결합 사업"</strong>. 어획·가공 능력이 아무리 좋아도 환 헷지를 못 하면 사실상 환차익에 베팅하는 도박. 향후 5년 KRW 추가 약세 trend 강력.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 명태 P&amp;L의 가장 큰 generator는 어획량이 아닌 <strong>"systematic FX hedge"</strong>. 전용 재무팀의 선도 헷지가 조업량 배가보다 이윤 기여 크다.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>"FX hedge rule-based 자동화"</strong>: ₩1,350 돌파 시 매입 자동 hold + 6개월 선물환 hedge 자동 발동. 본사 risk 부서가 매일 monitoring.</li>
<li style="margin-bottom: 8px;"><strong>달러 매입의 70% 선도환 hedge 의무화</strong>: 6개월·12개월 분할 hedge로 평균 매입 환율 ±5% 박스 락업.</li>
<li><strong>"Currency arbitrage trading book"</strong>: 본업 매입 외에 KRW·USD·CNY·NOK 4개 통화의 cross-currency swap을 trading instrument로 활용. 한국·일본·노르웨이 명태 vendor 거래의 결제 통화를 동적 최적화. JP Morgan FX Desk가 counterparty. 본업 외 FX P&amp;L로 연 EBITDA +3~5%p 추가 가능.</li>
</ol>
</div>`,
      }}
    />
  );
}

// 6. WidgetAITimePredict
const dataAiTime = [
  { month: 'Q1', downtimeConv: 15, downtimeAi: 3 },
  { month: 'Q2', downtimeConv: 18, downtimeAi: 4 },
  { month: 'Q3', downtimeConv: 22, downtimeAi: 2 },
  { month: 'Q4', downtimeConv: 12, downtimeAi: 1 }
];

export const WidgetAITimePredict = () => (
  <WidgetCard
    title="[Cost] 선박 AI 예지보전 도입 운휴 회피율"
    icon={Cpu}
    iconColor="#06b6d4"
    pillar="S2"
    cardDesc="AI 진동 센서 예지보전 도입 전후 선박 운휴(Downtime) 일수 비교"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <BarChart data={dataAiTime} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
        <XAxis dataKey="month" stroke="var(--w-slate-400)" fontSize={11} interval={0} />
        <YAxis stroke="var(--w-slate-400)" fontSize={11} tickFormatter={(v)=>`${v}일`} />
        <RechartsTooltip contentStyle={{ backgroundColor: 'var(--w-navy-900)', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--w-slate-300)' }} />
        <Bar dataKey="downtimeConv" name="기존 유지보수 운휴일수" fill="var(--color-danger)" radius={[4,4,0,0]} barSize={25} />
        <Bar dataKey="downtimeAi" name="AI 예지보전 시 운휴일수" fill="var(--w-cyan-500)" radius={[4,4,0,0]} barSize={25} />
      </BarChart>
    }
    takeaway={{
      source: '업계추정 (Wärtsilä 예지보전 도입 사례 참조 + 자체 추정)',
      situation: `<div>
<p>"예지보전(Predictive Maintenance)"이란 IoT 센서로 장비 이상 징후를 사전 감지해 고장 전 정비하는 방식. 사후 대처(고장 → 수리) 대비 cost 최대 90% 절감 가능(업계 참고치).</p>
<p>추정 기준: 해상에서 엔진 결함으로 <strong>표류(Downtime)하는 1일 기회비용 $50,000+</strong> (조업 손실 + 표류 견인 + 어선원 대기 인건비 합산 추정). 평균 표류 5~10일 → 척당 사고 비용 $250K~500K 수준.</p>
<p>의미: 노후 선박 + 사후 대처 모델은 사실상 매년 1~2척 발생하는 재앙 비용을 BS에 잠재 부담. AI 예지보전으로 이를 80% 회피 가능.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 예지보전은 단순 OPEX 절감이 아닌 <strong>"노후 선단 잔존 수명 + 보험료 동시 최적화 instrument"</strong>.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>노후 선박 AI 진동 센서 의무 부착</strong>: 선령 15년 이상 선단 100% retrofit. 척당 capex $50~100K, 회수 12개월.</li>
<li style="margin-bottom: 8px;"><strong>"입항 스케줄 dynamic adjustment"</strong>: 센서 이상 징후 발견 시 자동 알람 + 가장 가까운 항구 사전 진단. 표류 비용 -80%.</li>
<li><strong>보험사와 partnership</strong>: AI 예지보전 부착 선단의 해상 보험료 -25~35% 협상. AXA·Munich Re 마린 부문과 collab. 추가 capex가 보험료 절감으로 추가 회수.</li>
</ol>
</div>`,
    }}
  />
);

// 7. WidgetPortTurnaround
const dataTurnaround = [
  { month: '4월', targetDays: 5, actualDays: 6, bottleneckHours: 24 },
  { month: '5월', targetDays: 5, actualDays: 5.5, bottleneckHours: 12 },
  { month: '6월', targetDays: 5, actualDays: 9, bottleneckHours: 96 },
  { month: '7월', targetDays: 5, actualDays: 12, bottleneckHours: 168 }
];

export const WidgetPortTurnaround = () => (
  <WidgetCard
    title="[Cost] 만재흘수 조업-하역 턴어라운드 진단기"
    icon={Activity}
    iconColor="#eab308"
    pillar="S3"
    cardDesc="만선 이후 하역 항구 턴어라운드 시간과 체선 병목 지연의 피크 시즌 진단"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataTurnaround} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
        <XAxis dataKey="month" stroke="var(--w-slate-400)" fontSize={11} interval={0} />
        <YAxis yAxisId="left" stroke="var(--w-slate-300)" fontSize={11} tickFormatter={(v)=>`${v}일`} />
        <YAxis yAxisId="right" orientation="right" stroke="#eab308" fontSize={11} tickFormatter={(v)=>`${v}h`} />
        <RechartsTooltip contentStyle={{ backgroundColor: 'var(--w-navy-900)', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--w-slate-300)' }} />
        <Bar yAxisId="left" dataKey="actualDays" name="실제 턴어라운드 (Days)" fill="var(--color-info)" radius={[4,4,0,0]} barSize={20} />
        <Line yAxisId="right" type="monotone" dataKey="bottleneckHours" name="병목 체선 지연 (Hours)" stroke="#eab308" strokeWidth={3} dot={{ r: 4 }} />
      </ComposedChart>
    }
    takeaway={{
      source: '자체추정 (항만 대리점 입출항 리드타임 분해 참조)',
      situation: `<div>
<p>"턴어라운드(Turn-around) 타임"이란 선박이 항구에 도착해서 하역 → 정비 → 재출항까지 걸리는 시간. 짧을수록 어선 활용도(utilization rate) 높음.</p>
<p>병목: 만선(만재흘수) 이후 항구 선석 승인 지연으로 <strong>피크 시즌(6~7월) 턴어라운드 타임이 평시의 2배</strong>로 폭증. 부산·인천·러시아 블라디보스토크 항구 모두 동일.</p>
<p>의미: 척당 연 조업 가능 일수가 280일 → 220일로 -22%. 어획량 손실 + 어선원 인건비 idle cost + 콜드체인 임대료. 종합 손실 척당 연 $300~600K.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 턴어라운드는 단순 logistics가 아닌 <strong>"선단 utilization rate optimization"</strong>. 90% 적재 조기 입항이 100% 적재 후 적체보다 P&amp;L 우위.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>피크 시즌 90% 적재 조기 입항</strong>: 선단장 재량으로 6~7월 만재흘수 -10% 운용. 하역 대기 -60% 단축.</li>
<li style="margin-bottom: 8px;"><strong>"항만 선석 booking optimization SaaS"</strong>: 한국·러시아·일본 5대 항만 선석 가용성 실시간 monitoring + ML 예측. 본사 fleet operation에 통합.</li>
<li><strong>전용 선석 contract 확보</strong>: 부산·인천 항만공사와 10년 long-term 선석 우선 사용권 계약. 자본 투자 $5~10M, 회수 5년. 동시에 mid-tier 수산사에 sub-lease로 추가 수익원.</li>
</ol>
</div>`,
    }}
  />
);

// 8. WidgetVesselCapex
const dataCapex = [
  { shipAge: '20년 이하', capexRisk: 10, scrapValue: 800 },
  { shipAge: '20~25년', capexRisk: 35, scrapValue: 600 },
  { shipAge: '25~30년', capexRisk: 80, scrapValue: 400 },
  { shipAge: '30년 이상', capexRisk: 95, scrapValue: 250 }
];

export const WidgetVesselCapex = () => (
  <WidgetCard
    title="[Cost] 선박 폐선 및 대체 CAPEX 투하 압박도"
    icon={Anchor}
    iconColor="var(--color-danger)"
    pillar="S1"
    cardDesc="선령 구간별 대체 CAPEX 강제 압박률과 고철 잔존가치 역학"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataCapex} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
        <XAxis dataKey="shipAge" stroke="var(--w-slate-400)" fontSize={11} interval={0} />
        <YAxis yAxisId="left" stroke="var(--color-danger)" fontSize={11} domain={[0, 100]} tickFormatter={(v)=>`${v}%`} />
        <YAxis yAxisId="right" orientation="right" stroke="var(--w-slate-400)" fontSize={11} tickFormatter={(v)=>`$${v}k`} />
        <RechartsTooltip contentStyle={{ backgroundColor: 'var(--w-navy-900)', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--w-slate-300)' }} />
        <Area yAxisId="left" type="monotone" dataKey="capexRisk" name="대체 CAPEX 강제 압박률 (%)" fill="var(--color-danger)" stroke="var(--color-danger)" fillOpacity={0.3} strokeWidth={2} />
        <Bar yAxisId="right" dataKey="scrapValue" name="예상 고철(Scrap) 잔존가치" fill="var(--w-slate-500)" radius={[4,4,0,0]} barSize={20} />
      </ComposedChart>
    }
    takeaway={{
      source: 'KR 내구연한 수칙·해양수산부 보조금 정책 + 업계추정 (노후 선단 비율)',
      situation: `<div>
<p>"선령(Vessel Age)"이란 선박이 건조된 후 경과 연수. 한국 명태 원양 선단의 평균 선령이 위험 수준.</p>
<p>업계 추정: <strong>선령 25년 초과 노후 선단 비율 60%+ 추정</strong>. 25년 초과 시 유지보수율(OPEX) 한계점 돌파 — 매년 보수 비용이 기하급수적으로 증가. 30년 도달 시 사실상 운영 불가능.</p>
<p>의미: 향후 5년 노후 선단 대량 폐선 시점 도래. 신조선 발주 비용 척당 $30~50M, IMO 2030 탄소 규제 충족하려면 수소/하이브리드 추진 추가 capex $5~10M. 기습적 capex 타격 예상.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 노후 선단 매각은 단순 폐선이 아닌 <strong>"scrap value timing optimization + 신조선 financing strategy"</strong>. timing이 핵심.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>Scrap value 급락 전 즉시 매각</strong>: 글로벌 scrap 가격이 IMO 2030 규제 강화로 향후 2~3년 -30~40% 하락 예상. 노후 선단 30~50% 즉시 매각.</li>
<li style="margin-bottom: 8px;"><strong>수소/하이브리드 신조선 발주</strong>: Kongsberg·Mitsui OSK·HD현대중공업과 협력. EBRD Green Maritime Loan + KfW IPEX 환경금융으로 5% 금리 조달.</li>
<li><strong>"Green ship financing platform"</strong>: 노후 → 신조선 전환을 SPV로 구조화하여 본사 BS off-balance. JP Morgan Maritime Finance가 advisor. ESG fund(BlackRock Sustainable Investing)를 LP로 영입.</li>
</ol>
</div>`,
    }}
  />
);

// 9. WidgetRobotTCO
const dataRobot = [
  { year: '1년차', hCost: 50, rCost: 150 },
  { year: '3년차', hCost: 160, rCost: 180 },
  { year: '5년차(Cross)', hCost: 280, rCost: 210 },
  { year: '7년차', hCost: 410, rCost: 240 }
];

export const WidgetRobotTCO = () => (
  <WidgetCard
    title="[Cost] 공장 자동화(ROBOT) TCO 크로스오버"
    icon={Bot}
    iconColor="#8b5cf6"
    pillar="S2"
    cardDesc="인건비 누적 한계비용과 로봇 설비 TCO 크로스오버 시점 분석"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <LineChart data={dataRobot} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
        <XAxis dataKey="year" stroke="var(--w-slate-400)" fontSize={11} interval={0} />
        <YAxis stroke="var(--w-slate-400)" fontSize={11} tickFormatter={(v)=>`$${v}k`} />
        <RechartsTooltip contentStyle={{ backgroundColor: 'var(--w-navy-900)', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--w-slate-300)' }} />
        <Line type="monotone" dataKey="hCost" name="인간 노무 누적 한계비용" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="rCost" name="로봇 설비(TCO) 누적액" stroke="var(--w-violet-500)" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    }
    takeaway={{
      source: '업계추정 (IFR 산업용 로봇 보급 통계 + Marel 공개 단가 참조)',
      situation: `<div>
<p>"TCO(Total Cost of Ownership)"란 설비의 초기 도입비 + 5~10년 운영비를 합산한 총소유비용. ROI 의사결정의 정확한 지표.</p>
<p>크로스오버 시점: <strong>5년 차에 동남아 인건비 총액이 로봇 자동화 TCO를 역전</strong>. 즉 5년 이상 운영하면 무조건 로봇이 인건비보다 저렴.</p>
<p>의미: 로봇 자동화는 단순 cost 절감이 아닌 <strong>위생 리스크 소거 + 인당 생산 효율 +300%</strong> 동시 달성. 현재 capex를 들여놓아야 향후 5~10년 경쟁사 대비 영구 우위.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 로봇 자동화 capex $150K는 두려워할 비용이 아닌 <strong>"5년 후 경쟁사 진입 차단의 strategic moat"</strong>. 단기 ROI보다 5년 후 경쟁 우위가 본질.</p>
<p><strong>실행</strong>: ① BAADER/Marel 자동 절단기 즉시 도입 ($150K/라인) ② 위생 리스크 zero 달성 — 식약처 HACCP 자동 통과 ③ 인당 생산 효율 +300% — 동일 인력으로 capacity 4배 ④ 향후 5년 동안 경쟁사 진입 차단 + 마진 +5~8%p 회수.</p>
</div>`,
    }}
  />
);

// 10. WidgetAirVsOcean
const dataFreight = [
  { term: '해운(45일)', costDiff: 0, freshnessLoss: 30 },
  { term: 'Sea&Air(18일)', costDiff: 15, freshnessLoss: 10 },
  { term: '항공직송(3일)', costDiff: 45, freshnessLoss: 0 }
];

export const WidgetAirVsOcean = () => (
  <WidgetCard
    title="[Cost] 모달 쉬프트(Air vs Ocean) 선도 마진"
    icon={PlaneTakeoff}
    iconColor="var(--color-success)"
    pillar="S3"
    cardDesc="해운/항공/복합 운송별 추가 운임과 선도 가치 하락률 트레이드오프"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataFreight} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
        <XAxis dataKey="term" stroke="var(--w-slate-400)" fontSize={11} interval={0} />
        <YAxis yAxisId="left" stroke="var(--w-slate-300)" fontSize={11} tickFormatter={(v)=>`+$${v}`} />
        <YAxis yAxisId="right" orientation="right" stroke="var(--color-danger)" fontSize={11} domain={[0, 40]} tickFormatter={(v)=>`${v}%`} />
        <RechartsTooltip contentStyle={{ backgroundColor: 'var(--w-navy-900)', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--w-slate-300)' }} />
        <Bar yAxisId="left" dataKey="costDiff" name="추가 운임/kg (USD)" fill="var(--color-success)" radius={[4,4,0,0]} barSize={25} />
        <Line yAxisId="right" type="monotone" dataKey="freshnessLoss" name="선도(신선도) 가치 하락률 (%)" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 4 }} />
      </ComposedChart>
    }
    takeaway={{
      source: '업계추정 (Freightos FBX 해상운임·TAC 항공운임지수 참조)',
      situation: `<div>
<p>"모달 쉬프트(Modal Shift)"란 운송 수단(해운·항공·복합)을 선택하는 의사결정. 명태 등급에 따라 최적 수단이 다릅니다.</p>
<p>특별 케이스: <strong>초하이엔드 신선 명란/생물(S-Class) 원물</strong>은 해운 45일 운송 시 <strong>선도 하락 30% 패널티</strong>. ASP 손실이 항공 추가 운임비 +$2~3/kg보다 큼.</p>
<p>의미: S-Class 원물은 해운 = 가치 파괴. 일반 통조림은 해운 OK, 명란·생물은 해상-항공 복합(Sea&amp;Air) 또는 100% 항공이 P&amp;L 우위.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 모달 쉬프트는 단순 운임 절감이 아닌 <strong>"product grade별 dynamic logistics routing"</strong>. 등급별 logistics matrix 자동화.</p>
<p><strong>실행</strong>: ① <strong>S-Class(명란/생물)는 Sea&amp;Air 복합 또는 100% 항공</strong> — 20일 내 뉴욕·도쿄·두바이 직판. 프리미엄 하이엔드 시장 ASP +40~60% ② A-Class(필레)는 해운 fast track (30일 내) ③ B-Class(통조림·수리미)는 일반 해운. AI 기반 grade별 routing 자동화 — JP Morgan Logistics Tech Desk와 partnership으로 SaaS 라이센싱.</p>
</div>`,
    }}
  />
);
