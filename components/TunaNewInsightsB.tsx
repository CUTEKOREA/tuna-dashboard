/**
 * NewInsights B 3개 위젯 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 183줄 → After 130줄 (-29%)
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart } from 'recharts';
import { FlaskConical, Landmark, Factory } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

// illustrative 합성치 — KMI/식품산업통계 공개 단일화 대기, 자체추정 시나리오
const coinBrothData = [
  { year: '2022', 액상_시장: 520, 분말_코인: 80, 마진율_분말: 35 },
  { year: '2023', 액상_시장: 580, 분말_코인: 120, 마진율_분말: 38 },
  { year: '2024', 액상_시장: 630, 분말_코인: 180, 마진율_분말: 40 },
  { year: '2025', 액상_시장: 700, 분말_코인: 260, 마진율_분말: 42 },
  { year: '2026E', 액상_시장: 750, 분말_코인: 380, 마진율_분말: 45 },
];

// illustrative 합성치 — 공개 실효세율 미공시, OECD Pillar Two 적용 자체추정 시나리오
const pillarTwoData = [
  { company: 'Thai Union', before: 7.2, after: 13.5 },
  { company: 'Dongwon', before: 8.1, after: 12.8 },
  { company: 'Bolton', before: 6.5, after: 14.2 },
  { company: 'FCF Fishery', before: 5.8, after: 11.5 },
];

// Source: ILO Global Wage Report 2024 + VASEP Annual Report 2024 + 관세청 KCS VKFTA HSK 1604.14.20.00
const vietnamData = [
  { metric: '월 임금($)', Vietnam: 342, Thailand: 431 },
  { metric: '리드타임(일)', Vietnam: 6.35, Thailand: 7.13 },
  { metric: '인증 수(개)', Vietnam: 10, Thailand: 8 },
  { metric: 'VKFTA 관세(%)', Vietnam: 0, Thailand: 8 },
];

export function InsightTunaExtract() {
  return (
    <WidgetCard
      title="가다랑어(Skipjack) 액젓 분말화 (2026)"
      icon={FlaskConical}
      iconColor="#10b981"
      pillar="S5"
      cardDesc="국내 참치액 시장 700~1,000억원(추정, 출처별 편차). 코인 육수 시장 +20% YoY 성장 중. 분말화로 냉동→건화물 전환 시 물류비 획기적 절감 (2026년 기준)"
      telemetry={{ status: 'STATIC', syncDate: '2026년 기준' }}
      termTooltip={{ term: '코인 육수', description: '가다랑어(Skipjack) 추출액은 액젓이 아니라 \'코인 육수\' 시장(국내 700~1,000억원 추정)을 지배할 B2B 분말 소재입니다. 분무건조 기술로 물류비 50% 절감.' }}
      kpiPanel={[
        { label: '코인 육수 시장 성장률', value: '+20% YoY', sub: '가다랑어 분말 소재 수요 폭발', trendColor: '#10b981' },
      ]}
      chartHeight={280}
      chart={
        <ComposedChart data={coinBrothData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="var(--w-slate-400)" />
          <YAxis yAxisId="left" stroke="var(--w-slate-400)" unit="억" />
          <YAxis yAxisId="right" orientation="right" stroke="var(--w-emerald-500)" unit="%" />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.9)', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Bar yAxisId="left" dataKey="액상_시장" name="액상 시장(억원)" fill="var(--w-slate-500)" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="분말_코인" name="분말/코인 시장(억원)" fill="var(--w-emerald-500)" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="마진율_분말" name="분말 B2B 마진율(%)" stroke="var(--w-amber-400)" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>한국 참치액 시장은 <strong>700~1,000억원 규모</strong>(출처별 편차)로 액상 시장은 사실상 포화. 청정원·연두·하선정 등 4~5개 브랜드가 가격 경쟁을 벌이는 포화시장.</p>
<p>옆에 새로운 성장 시장이 열렸습니다. <strong>"코인 육수"(분말 우마미)</strong> 시장입니다. 캡슐 한 알로 한 그릇 국물을 만드는 탈수 분말 형태로, <strong>+20% YoY 급성장</strong>. 견인 요인: ① 1인 가구 증가 ② 캠핑·아웃도어 ③ Z세대 미니멀 트렌드.</p>
<p>핵심 기회: 가다랑어 추출액의 <strong>분무건조(spray drying)</strong>. 액상→분말 전환 시 ① 부피·무게 -85% ② <strong>냉동 컨테이너→건화물 전환</strong> ③ 통관·물류비 -50%+ ④ 유통기한 24개월+ (액상 6개월 대비).</p>
<p>의미: 액상은 한국 내수만 가능한 작은 시장, 분말은 글로벌 수출 가능한 큰 시장. 기술 전환만으로 시장 규모 5~10배 확대 가능(자체추정).</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 참치액의 미래는 액상이 아닌 <strong>"글로벌 수출 가능 분말"</strong>. 본사는 한국 액상 가공사에서 <strong>"글로벌 우마미 농축 플랫폼"</strong>으로 진화해 EV/EBITDA를 식품가공 8배 → 소재 플랫폼 18~22배로 밸류에이션 재평가 가능(업계추정).</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>베트남 분무건조 파일럿 즉시 가동</strong>: 베트남 가다랑어 가공 거점에 분무건조 라인 설치 ($5~8M). 인건비·전기료 저렴, 운영 비용 한국 대비 -40%(자체추정). 6~9개월 회수.</li>
<li style="margin-bottom: 8px;"><strong>CJ·대상 등 코인 육수 제조사에 B2B 핵심 원료 납품 계약 선제 체결</strong>: TN(Total Nitrogen) 1.5%+ 고농축 스펙으로 차별화. 5년 exclusive 공급 + Take-or-Pay 조건.</li>
<li><strong>"글로벌 우마미 농축소재" 진출</strong>: 일본 키코만·중국 라오간마·동남아 우마미 선도사 30곳 B2B 원료 공급. 5년 후 글로벌 분말 우마미 상류 공급자 포지션. 기반 확보 후 Givaudan·Symrise 등 글로벌 향미 기업 파트너십·인수 가능성 검토.</li>
</ol>
</div>`,
        source: 'KMI 식품산업통계정보 (2026) · 자체추정 (700~1,000억원 범위, 식약처/aT 단일화 대기) · 차트 수치는 illustrative 시나리오',
      }}
    />
  );
}

export function InsightPillarTwo() {
  return (
    <WidgetCard
      title="OECD Pillar Two 세금 쇼크 (황다랑어 밸류체인)"
      icon={Landmark}
      iconColor="#fbbf24"
      pillar="S4"
      cardDesc="조세 피난처와 이전가격 조작에 의존하던 다국적 수산기업의 실효세율이 OECD Pillar Two(2026 시행)로 2배 폭등"
      telemetry={{ status: 'STATIC', syncDate: '2026년 기준' }}
      termTooltip={{ term: 'Pillar Two', description: '2026년 글로벌 최저한세 15% 적용. 조세 피난처를 경유하는 다국적 황다랑어/눈다랑어 유통 기업의 실효세율이 7%→14%로 급등.' }}
      kpiPanel={[
        { label: '평균 실효세율 변화', value: '6.5~8% → 12~14%', sub: '▲ ROE 근본적 훼손 (2026, 자체추정)', trendColor: '#fbbf24' },
      ]}
      chartHeight={280}
      chart={
        <BarChart data={pillarTwoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="company" stroke="var(--w-slate-400)" />
          <YAxis stroke="var(--w-slate-400)" unit="%" domain={[0, 18]} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.9)', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="before" name="기존 실효세율(%)" fill="var(--w-slate-500)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="after" name="Pillar Two 적용 후(%) (2026E)" fill="var(--w-amber-400)" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p><strong>OECD Pillar Two</strong>는 글로벌 다국적 기업의 최저 법인세율을 <strong>15%</strong>로 강제하는 국제 합의입니다(2026년 시행). 핵심 목적: 케이만·버뮤다 같은 조세 피난처에 유령법인을 두고 실효 세율을 5~7%로 낮추던 글로벌 기업의 우회 구조 차단.</p>
<p>참치 산업에서의 영향: Thai Union(태국), Bolton(이탈리아) 등 다국적 수산기업이 그동안 사용해온 <strong>이전가격(Transfer Pricing) 조작 구조 붕괴</strong>. 차트 기반 자체추정 시 실효 법인세율이 6.5~8% → 12~14%로 <strong>약 2배 급등</strong>(illustrative 시나리오).</p>
<p>구체 mechanism: 고단가 황다랑어(Yellowfin)를 케이만 유령법인이 한국에서 $5,000/톤에 매입 → 미국으로 $8,000/톤에 판매 → $3,000/톤 차익이 케이만에서 5% 과세. 이 구조가 Pillar Two로 막힌다.</p>
<p>의미: 글로벌 수산업계의 "디지털세" 격. Bolton·Thai Union 등 다국적 기업의 EBITDA가 5~8% 직접 압박. <strong>유령법인 구조 의존 기업 기업가치 15~20% 할인</strong>(업계추정). 반대로 실질 가공 거점을 보유한 스페인·한국 업체가 상대적 우위.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: Pillar Two는 단순 세제 변경이 아닌 <strong>"글로벌 수산업계 기업가치 재편 이벤트"</strong>. 유령법인 의존 다국적 기업에는 약세 포지션, 실질 거점 기반 국내 업체에는 강세 포지션을 취하는 방향으로 포트폴리오 재편.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>포트폴리오 내 유령법인 구조 의존 기업 기업가치 15~20% 할인 반영</strong>(업계추정): Thai Union·Bolton 주가 또는 지분 평가에 즉시 적용. 신규 설비투자·인수 의사결정에 반영.</li>
<li style="margin-bottom: 8px;"><strong>대체 파트너 재선별</strong>: 세무 구조 리스크 낮고 유럽 내 실질 가공 거점을 보유한 <strong>스페인(Frinsa·NIRSA)·이탈리아(Generale Conserve)</strong> 지역 업체를 우선 파트너로. 향후 Pillar Two 추가 영향에서 자유.</li>
<li><strong>"Pillar Two 차익 투자"</strong>: Thai Union·Bolton 같은 다국적 기업의 EBITDA 압박 자산(매각 가능)을 PE 컨소시엄 공동 출자로 인수. 글로벌 M&amp;A 자문사 협력 권장. 5년 후 기업가치 회복 시 내부수익률 18~25% 잠재(업계추정).</li>
</ol>
</div>`,
        source: 'KIEP 국제조세 동향 (2025) · EU 집행위 발표자료 · 차트 수치는 illustrative 자체추정(기업별 실효세율 미공시)',
      }}
    />
  );
}

export function InsightVietnamOEM() {
  return (
    <WidgetCard
      title="베트남 OEM 역전 — 황다랑어 가공 생태계 장악"
      icon={Factory}
      iconColor="#06b6d4"
      pillar="S2"
      cardDesc="2026년 베트남 임금 $342(태국 대비 -20%), VKFTA 무관세. MMPA 규제로 원물 부족 → 한국 원양 선단에 절대적 교섭력 집중"
      telemetry={{ status: 'STATIC', syncDate: '2026년 기준' }}
      termTooltip={{ term: 'MMPA·VKFTA', description: '미국 MMPA 규제와 원물 부족 이중고 속에서 베트남 가공업체의 약세가 오히려 원양 선단 보유 기업에게 최적의 지분 투자 윈도우를 제공.' }}
      chartHeight={280}
      chart={
        <BarChart data={vietnamData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="var(--w-slate-400)" />
          <YAxis dataKey="metric" type="category" stroke="var(--w-slate-400)" width={100} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.9)', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="Vietnam" name="🇻🇳 베트남 (2026)" fill="var(--w-cyan-500)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="Thailand" name="🇹🇭 태국 (2026)" fill="var(--w-slate-500)" radius={[0, 4, 4, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p><strong>MMPA(Marine Mammal Protection Act)</strong>는 미국이 운영하는 해양 포유류 보호법으로, 자국 기준을 충족하지 못하는 국가의 수산물 수입을 금지합니다. <strong>2026년 베트남 어업 수입 금지 결정</strong>이 발효되며 베트남 황다랑어(Yellowfin) 가공 산업이 직격탄.</p>
<p>베트남의 이중고:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>미국 시장 차단</strong>: 베트남 수산 수출의 35%(미국 채널) 즉시 차단</li>
<li><strong>황다랑어 어획 자체 제한</strong>: MMPA 준수를 위한 어법 제한으로 어획 capacity -25%</li>
<li><strong>현지 가공 공장 원물 가뭄</strong>: 자체 어획 부족 + 외부 수입 비용 상승으로 가공사 EBITDA 압박</li>
</ul>
<p>역설적 기회: 베트남 가공사들의 distress가 <strong>안정적 원양 선단을 보유한 한국 조업사에게 베트남 OEM 공장을 장악할 교섭력(Leverage)을 제공</strong>합니다. 베트남 가공사는 원물 공급 보장이 절박하고, 우리는 OEM capacity가 필요. 양측 swap 가능.</p>
<p>의미: 평시에는 매수 불가능했던 베트남 최상위 가공사(Tan Phat Foods 등 BRC/IFS 인증 보유 업체)의 소수 지분을 저평가 국면에서 인수 가능한 일회성 기회.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 베트남 위기는 한국 조업사에게 <strong>"지분 인수 최적 국면"</strong>. 평시에는 EBITDA 8~10배에 거래되던 중견 가공사를 EBITDA 4~5배 저평가 국면에서 소수 지분 인수 가능한 12~18개월 기회(업계추정).</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>지분-공급권 교환 즉시 가동</strong>: Tan Phat Foods 등 BRC/IFS 인증 보유 현지 최상위 가공사 5~7곳에 소수 지분 15~25%를 <strong>원물(황다랑어) 5년 장기 공급권과 교환</strong>. 현금 부담 최소화, 가공사 측 공급 안정화.</li>
<li style="margin-bottom: 8px;"><strong>MMPA 준수 개조 컨설팅</strong>: 한국 어선의 MMPA 적합 조업 노하우를 베트남 가공사에 라이센싱. 라이센스 수수료 + 지분 배당 이중 회수.</li>
<li><strong>"베트남 OEM 플랫폼" 진화</strong>: 5년 후 베트남 가공 역량의 25~30%를 통합 — 단순 OEM 외주가 아닌 브랜드·연구개발·물류 통합 플랫폼. EU·일본·동남아 수출의 중간 가공 거점으로 활용. 글로벌 산업 금융 자문사와 협력해 특수목적법인(SPV) 구조로 본사 재무 부담 분리.</li>
</ol>
</div>`,
        source: 'ILO Global Wage Report (2025) · 관세청 KCS VKFTA',
      }}
    />
  );
}
