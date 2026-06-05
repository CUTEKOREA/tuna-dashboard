'use client';
import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { FlaskConical, Search, Dog, ScanLine, Atom, SatelliteDish, Waves, PieChart, Scissors, Building2 } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

// 41. WidgetPlantBasedImpact
const dataPlant = [
  { year: '2023', pollockMarket: 100, plantBased: 2 },
  { year: '2024', pollockMarket: 98, plantBased: 5 },
  { year: '2025', pollockMarket: 92, plantBased: 12 },
  { year: '2026', pollockMarket: 85, plantBased: 20 }
];

export const WidgetPlantBasedImpact = () => (
  <WidgetCard
    title="[Future] 대체 해산물(Plant-based) 연육 잠식률"
    icon={FlaskConical}
    iconColor="var(--color-success)"
    pillar="S4"
    cardDesc="GFI 기준 식물성 해산물의 명태 연육 시장 M/S 잠식 추이"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <AreaChart data={dataPlant} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`${v}%`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Area type="monotone" dataKey="pollockMarket" name="전통 천연 연육 M/S (%)" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.3} />
        <Area type="monotone" dataKey="plantBased" name="식물성 해산물 잠식률 (%)" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.6} />
      </AreaChart>
    }
    takeaway={{
      source: '굿푸드인스티튜트(GFI) 2024~2025 대체 해산물 성장 리포트',
      situation: `<div>
<p>"Plant-based Surimi"란 대두·완두 단백질 기반의 식물성 인조 게맛살. 명태 연육의 직접 대체재.</p>
<p>위협 수준: <strong>유럽 중심 plant-based 연육 커버리지 2년(2023→2025) 사이 6배 확대(잠식률 2%→12%)</strong>. Z세대·ESG 소비자 + 비건 트렌드 + 가격 -25% 우위. 향후 5년 명태 연육 글로벌 시장 -15~25%p 잠식 가능.</p>
<p>의미: 정면 가격 경쟁은 패배 확정. <strong>"Wild-Caught 100% 프리미엄"</strong> 또는 <strong>"우리가 plant-based ingredient supplier가 되는"</strong> 2 전략 선택.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: plant-based 위협은 경쟁이 아닌 <strong>"우리가 self-cannibalize할 기회"</strong>.</p>
<p><strong>3단계</strong>: ① "Wild-Caught 100% MSC" 프리미엄 헤리티지 마케팅 강화 ② 식물성 50% + 명태 50% hybrid SKU launch ③ CVC로 Good Catch·Ordinary Seafood minority equity 인수 — Kodak 폐기, Netflix 채택.</p>
</div>`,
    }}
  />
);

// 42. WidgetCellCultureVC
const dataVc = [
  { p: '2022', amount: 50 },
  { p: '2023', amount: 120 },
  { p: '2024', amount: 350 },
  { p: '2025', amount: 800 }
];

export const WidgetCellCultureVC = () => (
  <WidgetCard
    title="[Future] 세포 배양 스타트업 글로벌VC 펀딩"
    icon={Search}
    iconColor="var(--color-warning)"
    pillar="S5"
    cardDesc="피치북 기준 대체 단백질 카테고리 시리즈B/C 누적 투자액 추이"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <BarChart data={dataVc} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="p" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`$${v}m`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar dataKey="amount" name="시리즈B/C 누적 투자액 (Mil USD)" fill="var(--color-warning)" radius={[4,4,0,0]} />
      </BarChart>
    }
    takeaway={{
      source: '피치북(PitchBook) 대체 단백질 카테고리 펀딩 총액 추적',
      situation: `<div>
<p>"세포 배양(Cultured) 백색육"이란 동물 세포를 bioreactor에서 배양해 만드는 인공 단백질. 어획·양식 없이 lab에서 fillet 생산 가능.</p>
<p>VC 자금 trend: <strong>실리콘밸리 cultured 백색육 fab 신설 펀딩 1년 새 2.3배 가속화</strong>. BlueNalu·Wildtype Foods·Finless Foods 시리즈 B·C 대규모 자금 유입으로 밸류에이션 급등(업계 추정). JP Morgan Industrials·Goldman Sustainability 같은 mega 자본 진입.</p>
<p>의미: 향후 5~10년 내 cultured 백색육 단위 원가가 상업 궤도 진입. 현재 명태 100x → 5년 후 5x → 10년 후 1x 도달 가능. 시장 진입은 일방향 게임.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 어획 할당량 자산이 향후 stranded asset 될 위험 vs cultured 시장 leader 지위 확보. <strong>피보팅 timing이 본질</strong>.</p>
<p><strong>3단계</strong>: ① 어획 할당량 매각 전 cultured 파트너 모색 — BlueNalu·Wildtype Foods 시리즈 B/C 5~10% 인수 ② 본사 가공 라인 30%를 bioreactor retrofit 검토 — 5~10년 후 OEM 위탁생산 가능 ③ "Hybrid SKU" launch — cultured 30% + wild-caught 70% 통조림으로 점진적 self-cannibalize.</p>
</div>`,
    }}
  />
);

// 43. WidgetPetFoodUpcycling
const dataPet = [
  { class: '일반 어분(사료)', value: 1.5 },
  { class: '연어/명태 오일', value: 8.5 },
  { class: '초유기농 펫푸드', value: 25.0 }
];

export const WidgetPetFoodUpcycling = () => (
  <WidgetCard
    title="[Future] 부산물 하이엔드 펫푸드 마진업"
    icon={Dog}
    iconColor="#d946ef"
    pillar="S2"
    cardDesc="부산물 등급별(어분→오일→펫푸드) 판매 단가 마진업 비교"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <LineChart data={dataPet} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="class" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`$${v}/kg`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Line type="monotone" dataKey="value" name="판매 단가 (USD)" stroke="#d946ef" strokeWidth={3} dot={{ r: 6 }} />
      </LineChart>
    }
    takeaway={{
      source: 'GAPFA(글로벌 반려동물 식품 연합) 공개 자료 및 업계 추정',
      situation: `<div>
<p>"펫푸드 업사이클링"이란 명태 부산물(머리·뼈·내장)을 반려동물 전용 영양 오일·sourcing으로 재가공하는 전략. 한국 펫시장 +25% YoY 성장.</p>
<p>17배 격차: <strong>분쇄 어분 단가 $1.5/kg vs 초유기농 펫푸드 단가 $25/kg(업계 추정)</strong>. 명태 오일로 1차 가공만 해도 $8.5/kg — SKU 전환만으로 5배 단가 상승.</p>
<p>의미: 명태 부산물은 더 이상 폐기물이 아닌 <strong>"3분기 후 펫푸드 carry asset"</strong>. 한국·중국·일본 펫시장 동시 진입 가능한 high-margin segment.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 부산물은 cost center가 아닌 <strong>"premium pet food platform raw material"</strong>.</p>
<p><strong>3단계</strong>: ① 선상 부산물 100% 회수 + 자체 brand "Mariana Trench Pet Nutrition" 출시 ② 한국 (CJ·하림 펫푸드)·일본 (Mars Petcare Japan)·중국 (애완 ecommerce) 3개국 동시 진출 ③ "Premium Pet Food JV" — Nestlé Purina와 50:50 합작, 우리는 원료 100% 독점 공급 + Thai Union i-Tail Corp 사례 차용.</p>
</div>`,
    }}
  />
);

// 44. WidgetParasiteAI
const dataAiParam = [
  { step: '맨눈육안검사', cost: 120, recall: 40 },
  { step: 'LED라이트닝', cost: 85, recall: 75 },
  { step: '초분광 머신비전', cost: 5, recall: 99.8 }
];

export const WidgetParasiteAI = () => (
  <WidgetCard
    title="[Future] 기생충 AI 자동화 검출 리펀드 방어"
    icon={ScanLine}
    iconColor="#0ea5e9"
    pillar="S2"
    cardDesc="검출 방법별 품질 클레임 보상액과 선충 검출 정확도 대비"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataAiParam} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="step" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={11} tickFormatter={(v)=>`$${v}k`} />
        <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" fontSize={11} tickFormatter={(v)=>`${v}%`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar yAxisId="left" dataKey="cost" name="품질 클레임 보상액 (연 환산)" fill="var(--color-danger)" radius={[4,4,0,0]} barSize={25} />
        <Line yAxisId="right" type="step" dataKey="recall" name="선충 검출 정확도 (%)" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
      </ComposedChart>
    }
    takeaway={{
      source: '노르웨이 수산물위원회(NSC) 클레임 제로화 논문',
      situation: `<div>
<p>"아니사키스(Anisakis)"는 명태에 자연 기생하는 선충. 인체 섭취 시 위장염 유발 → EU·일본·미국 규제 엄격. 단 1마리만 발견되어도 컨테이너 통째로 반품·폐기.</p>
<p>현재 손실: <strong>매년 유럽향 컨테이너 반품·폐기 $120K+</strong>. 전통 검출 방식인 수작업 Candling은 인력 의존 + 검출률 80% 한계.</p>
<p>AI 솔루션: <strong>$50K 초분광 카메라 AI 비전</strong>으로 검출률 99.8% 도달. 통관 클레임 0건 가능. 회수 기간 6개월 이내.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: AI 기생충 검출은 단순 cost 절감이 아닌 <strong>"EU·미국 시장 entry license"</strong>. 미장착 vendor는 향후 channel 추방 위험.</p>
<p><strong>3단계</strong>: ① 수작업 Candling 100% 폐기 + $50K AI 비전 장비 즉시 도입 (전 라인) ② 검출률 99.9% 달성 후 "EU-ready certified vendor" 자체 라벨 자산화 ③ AI 기술을 SaaS로 mid-tier 가공사 30곳에 라이센싱 — 연 $100~200K/고객 추가 수익원.</p>
</div>`,
    }}
  />
);

// 45. WidgetAlgaeFeed
const dataAlgae = [
  { item: '기존 사료', cbamCost: 8, premium: 0 },
  { item: '해조류 배합(3%)', cbamCost: 4, premium: 5 },
  { item: '스마트해조(7%)', cbamCost: 1, premium: 12 }
];

export const WidgetAlgaeFeed = () => (
  <WidgetCard
    title="[Future] 조류(Algae) 사료 배합 메탄 저감 프리미엄"
    icon={Atom}
    iconColor="#22c55e"
    pillar="S5"
    cardDesc="해조류 사료 배합률별 CBAM 페널티 절감 및 저탄소 프리미엄 비교"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <BarChart data={dataAlgae} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} layout="vertical">
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis type="number" stroke="#94a3b8" fontSize={11} />
        <YAxis type="category" dataKey="item" stroke="#94a3b8" fontSize={11} width={80} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar dataKey="cbamCost" name="유럽 CBAM 탄소세 페널티" fill="var(--color-danger)" stackId="a" />
        <Bar dataKey="premium" name="저탄소인증 B2B 단가 프리미엄" fill="#22c55e" stackId="a" />
      </BarChart>
    }
    takeaway={{
      source: 'KMI 한국해양수산개발원 사료 배합에 따른 메탄 저감 가치',
      situation: `<div>
<p>"Asparagopsis"는 붉은 해조류로 양식·축산 사료에 혼합 시 메탄 배출 -80% 감축 효과. EU CBAM(탄소국경조정세) 회피 instrument.</p>
<p>규제 임계점: <strong>EU CBAM 2027 발효 강화로 메탄 배출 높은 사료 vendor 톤당 EUR 50~120 탄소세 부과</strong>. Asparagopsis 배합 사료는 면제 또는 -70% 감면 혜택.</p>
<p>의미: 단순 사료 ingredient가 아닌 <strong>"향후 5년 글로벌 사료 시장의 entry license"</strong>. first-mover로 capacity 확보 시 +12~18% 프리미엄 가격 책정 가능.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: Asparagopsis는 단순 ESG 원료가 아닌 <strong>"CBAM arbitrage instrument"</strong>.</p>
<p><strong>3단계</strong>: ① Asparagopsis 배합률 높은 차세대 에코 사료 R&amp;D 가속 ② Nestlé Purina·Skretting·Cargill Aqua 3대 사료 회사에 OEM 공급 — 탄소저감 명목 +12% 할증 ③ Asparagopsis 양식 farm minority equity 인수 (호주 Sea Forest 등) — supply 락업 + IP 우위.</p>
</div>`,
    }}
  />
);

// 46. WidgetStarlinkMaritime
const dataStarlink = [
  { item: 'VSAT(종래)', commCost: 8, fuelSave: 0 },
  { item: '스타링크 LEO', commCost: 2, fuelSave: 22 }
];

export const WidgetStarlinkMaritime = () => (
  <WidgetCard
    title="[Future] 저궤도 통신망 원양 기상예지 절감"
    icon={SatelliteDish}
    iconColor="#6366f1"
    pillar="S3"
    cardDesc="SpaceX Maritime 요금 대비 기상 회피 VLSFO 연료 세이브 연산"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <BarChart data={dataStarlink} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="item" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`$${v}k / M`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar dataKey="commCost" name="월간 텔레콤 통신료" fill="var(--color-danger)" radius={[4,4,0,0]} />
        <Bar dataKey="fuelSave" name="날씨 라우팅 최적화 연료절감액" fill="#6366f1" radius={[4,4,0,0]} />
      </BarChart>
    }
    takeaway={{
      source: 'SpaceX Maritime 공개 요금표 및 해운업계 VLSFO 연료 절감 자체 추정',
      situation: `<div>
<p>"저궤도 통신망(LEO Satellite, Starlink)"이란 SpaceX의 위성 인터넷. 원양 어선에 장착 시 대용량·저지연 통신 가능.</p>
<p>실측 효과: <strong>통신비용 척당 $8K → $2K (-75%)</strong> 절감. 더 큰 가치: <strong>실시간 기상 라우팅(Weather Routing)</strong>으로 태풍 우회 + 연비 최적화 가능.</p>
<p>의미: Starlink는 단순 통신비 절감이 아닌 <strong>"본사-선단 실시간 작전사령부 구축의 enabler"</strong>. 월간 $22K 연비 절감 + 안전·생산성 동시 향상.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: Starlink는 선원 복지가 아닌 <strong>"fleet operation의 digital transformation infrastructure"</strong>.</p>
<p><strong>3단계</strong>: ① 전선박 Starlink 의무 장착 — 척당 $5K capex, 회수 3개월 ② "본사 fleet 작전사령부" 구축 — 실시간 기상·어획 데이터 통합 monitoring + 태풍 회피 ML routing ③ 데이터 수익화 — 우리 fleet의 어획·기상 데이터를 NOAA·EU Copernicus·reinsurance에 라이센싱.</p>
</div>`,
    }}
  />
);

// 47. WidgetRovSonar
const dataRov = [
  { item: '광역', fuel: 100, detect: 30 },
  { item: '전통소나', fuel: 80, detect: 55 },
  { item: '수중 ROV 드론', fuel: 25, detect: 98 }
];

export const WidgetRovSonar = () => (
  <WidgetCard
    title="[Future] 수중 ROV 소나 탐지 대 어군 연비 ROI"
    icon={Waves}
    iconColor="#0ea5e9"
    pillar="S1"
    cardDesc="탐색 방법별 유류 소모율 vs 어군 적중률 ROI 비교"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataRov} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="item" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis yAxisId="left" stroke="var(--color-danger)" fontSize={11} tickFormatter={(v)=>`${v}%`} />
        <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" fontSize={11} tickFormatter={(v)=>`${v}%`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar yAxisId="left" dataKey="fuel" name="탐색용 헛기울임 유류 소모 (%)" fill="var(--color-danger)" radius={[4,4,0,0]} />
        <Line yAxisId="right" type="monotone" dataKey="detect" name="어군 크기/밀집도 적중률 (%)" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
      </ComposedChart>
    }
    takeaway={{
      source: 'Kongsberg Maritime 상용 ROV 제품 사양 및 업계 추정',
      situation: `<div>
<p>"공투(Empty Haul, Dry Set)"란 그물을 내려도 어획물이 없거나 미미한 헛수고 조업. 명태 조업에서 매번 발생하는 최대 비효율.</p>
<p>cost 손실: <strong>공투 1회당 유류비 $5~10K + 시간 4~8시간 + 인건비 + 그물 마모</strong>. 평시 공투율 25~30%, ENSO 시즌 40%+. 척당 연 공투 비용 $200~500K.</p>
<p>ROV 솔루션: <strong>수중자율드론(ROV) + AI 소나로 사전 어군 탐지 시 적중률 98% 도달</strong>. 공투율 25% → 2%, 연간 유류비 -75% 절감.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: ROV는 단순 OPEX 절감이 아닌 <strong>"climate beta + ENSO 충격 시 vendor 생존 instrument"</strong>.</p>
<p><strong>3단계</strong>: ① ROV/AI 소나 척당 capex $50~100K — 회수 6~9개월 ② 본사 fleet 전체 의무 장착 + ML 어군 탐지 모델 자체 개발 ③ Kongsberg·Saab Seaeye와 partnership — ROV 라이센싱 + 데이터 공유. mid-tier 한국 수산사에 SaaS 라이센싱.</p>
</div>`,
    }}
  />
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
  <WidgetCard
    title="[Future] 유망 M&A 타겟 푸드기업 EV/EBITDA"
    icon={PieChart}
    iconColor="#f43f5e"
    pillar="S4"
    cardDesc="블룸버그 기준 수산업 스타트업 인수 멀티플 비교"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <BarChart data={dataMna} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`${v}x`} />
        <YAxis type="category" dataKey="tech" stroke="#94a3b8" fontSize={11} width={80} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar dataKey="ev" name="시장 EV/EBITDA 멀티플" fill="#f43f5e" radius={[0,4,4,0]} />
      </BarChart>
    }
    takeaway={{
      source: '블룸버그 터미널 수산업 가공 스타트업 인수 매물 멀티플 보드',
      situation: `<div>
<p>"EV/EBITDA"란 기업 가치를 영업이익으로 나눈 배수. M&amp;A 의사결정의 핵심 지표.</p>
<p>현 시장 격차: <strong>전통 어선 1차 포획업 매물은 EV/EBITDA 3배수 (장부 가치 이하)</strong> vs <strong>세포 배양·스마트 양식·물류 AI 기업은 25배 하이프 프리미엄</strong>. 8배 격차.</p>
<p>의미: 어선 매입은 평가 절하된 자산으로 cash burn, AI·바이오 인수는 valuation rerate trigger. <strong>capital allocation 결단이 향후 10년 valuation을 좌우</strong>.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: M&amp;A는 단순 자산 확장이 아닌 <strong>"valuation multiple jump instrument"</strong>.</p>
<p><strong>3단계</strong>: ① 어선 선단 추가 매입 100% 동결 — 현금 비축 ② 물류 AI·세포 배양·스마트 양식 startup 타겟팅 — 시리즈 B/C 5~10% 인수, $5~20M ticket ③ 본사 portfolio를 "어획 회사 → marine tech platform"으로 재포지셔닝 — EV/EBITDA 8x → 18~22x rerating.</p>
</div>`,
    }}
  />
);

// 49. WidgetRoboticFilletImpact
const dataFillet = [
  { pop: '숙련공 인건비', '2023': 20, '2025': 28, '2027': 40 },
  { pop: '로봇 절단 감가', '2023': 35, '2025': 22, '2027': 12 }
];

export const WidgetRoboticFilletImpact = () => (
  <WidgetCard
    title="[Future] 자동 절단기 임금 역전 TIPPING POINT"
    icon={Scissors}
    iconColor="#8b5cf6"
    pillar="S2"
    cardDesc="IFR 기준 숙련공 인건비 vs 로봇 감가상각 크로스오버 시점 추적"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
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
    }
    takeaway={{
      source: 'IFR 산업용 직할 로봇 보급률 연도별 추세 및 임금 역전 그래프',
      situation: `<div>
<p>"티핑 포인트(Tipping Point)"란 두 trend line이 교차해 시장 dynamics가 영구적으로 뒤집히는 결정적 변곡점.</p>
<p>크로스오버: <strong>2025년 전후 인간 노무비 상승 + 로보틱스 감가상각 하락 곡선의 교차 가능성이 업계 전반에서 제기</strong>. 가공 라인에 따라 실제 역전 시점은 상이할 수 있으나 전환 압력은 가속화 추세.</p>
<p>의미: 2027년까지 가공 인력 100% 무인화 못 한 vendor는 글로벌 Top 5 마진 지배력 상실. 한 번 격차 벌어지면 따라잡기 불가능 — 영구적 산업 reshape.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 자동화 capex는 옵션이 아닌 <strong>"향후 5년 industry incumbent 자격 시험"</strong>.</p>
<p><strong>3단계</strong>: ① 2027년까지 가공 인력 100% 무인 오토 핀본 절단기 override — capex $20~40M ② 본사 한국 hub 자동화율 95%+ 달성 → 글로벌 Top 5 vendor 지위 락업 ③ 자체 자동화 IP를 동남아·라틴아메리카 vendor에 라이센싱 — IP fee 추가 수익원.</p>
</div>`,
    }}
  />
);

// 50. WidgetNonCatchBenchmark
const dataBM = [
  { group: '어획(순수조업)', value: 45 },
  { group: '고차 가공/B2C', value: 30 },
  { group: '바이오/의약품', value: 15 },
  { group: '기타/물류', value: 10 }
];

export const WidgetNonCatchBenchmark = () => (
  <WidgetCard
    title="[Future] 비어획(Non-Catch) 수익 포트폴리오 벤치마킹"
    icon={Building2}
    iconColor="#06b6d4"
    pillar="S4"
    cardDesc="빅3 글로벌 수산기업 10년 치 재무제표 사업 부문별 매출 기여도"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <BarChart data={dataBM} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="group" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`${v}%`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar dataKey="value" name="Top 3 연매출 기여도 비중 (%)" fill="#06b6d4" radius={[4,4,0,0]} />
      </BarChart>
    }
    takeaway={{
      source: '마루하니치로 등 빅 3 글로벌 종합 수산기업 10년 치 재무제표 믹스',
      situation: `<div>
<p>"비어획 수익 포트폴리오(Non-Catch Revenue Portfolio)"란 어획 매출 외의 가공·B2C·바이오·헬스케어·라이센싱 수익 비중. 글로벌 선두 수산기업의 valuation 차별화 핵심.</p>
<p>벤치마크: Mowi(노르웨이)·Thai Union·Maruha Nichiro 등 글로벌 leader는 <strong>어획 비중을 45% 이하로 강제 억제</strong>. 대신 <strong>B2C 가공·헬스케어 바이오매스·페트푸드 platform</strong>에서 영업이익 흡수.</p>
<p>의미: 한국 수산사 평균 어획 비중 70%+ — 글로벌 leader 대비 -25%p valuation discount의 핵심 원인. 정체성 재정의 없이는 향후 10년 생존 어려움.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 우리 회사 정체성을 <strong>"어업 회사 → 해양 단백질 플랫폼 프로바이더"</strong>로 승격. 이 시각이 향후 10년 생존과 valuation rerate를 좌우.</p>
<p><strong>3단계</strong>: ① 어획 비중 70% → 45%로 5년 내 강제 감축 ② B2C 가공 + 헬스케어 바이오 + 펫푸드 platform 3축 동시 capex ③ "Marine Protein Platform" rebrand — Mowi·Thai Union i-Tail Corp 모델 차용, EV/EBITDA 8x → 18~22x rerating. JP Morgan Consumer Goods Desk가 advisor.</p>
</div>`,
    }}
  />
);
