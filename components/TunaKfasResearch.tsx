/**
 * KFAS Research 4개 위젯 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 306줄 → After 215줄 (-30%)
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Ship, AlertTriangle, Recycle, TestTube } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

const byproductData = [
  { part: '머리', protein: 18.2, lipid: 8.5, ash: 12.1, collagen: 14.8 },
  { part: 'Frame(중골)', protein: 22.1, lipid: 5.2, ash: 15.3, collagen: 18.2 },
  { part: '내장', protein: 14.5, lipid: 12.8, ash: 3.2, collagen: 5.1 },
  { part: '혈합육', protein: 26.4, lipid: 3.1, ash: 2.8, collagen: 2.3 },
  { part: '알(Roe)', protein: 30.5, lipid: 7.0, ash: 3.5, collagen: 1.2 },
  { part: '껍질', protein: 12.3, lipid: 2.1, ash: 8.9, collagen: 28.5 },
];

const longlineData = [
  { period: '1960s', vessels: 120, catch_kt: 60, bigeye_pct: 45, yellowfin_pct: 35 },
  { period: '1970s', vessels: 180, catch_kt: 80, bigeye_pct: 40, yellowfin_pct: 38 },
  { period: '1980s', vessels: 250, catch_kt: 65, bigeye_pct: 38, yellowfin_pct: 35 },
  { period: '1990s', vessels: 200, catch_kt: 50, bigeye_pct: 42, yellowfin_pct: 30 },
  { period: '2000s', vessels: 150, catch_kt: 40, bigeye_pct: 48, yellowfin_pct: 25 },
  { period: '2010s', vessels: 100, catch_kt: 20, bigeye_pct: 55, yellowfin_pct: 20 },
  { period: '2020s', vessels: 70, catch_kt: 9, bigeye_pct: 60, yellowfin_pct: 18 },
];

const ioRiskData = [
  { subject: '지속가능성', purseSeine: 2.1, longline: 1.5, gillnet: 2.8, fullMark: 3 },
  { subject: '생물다양성', purseSeine: 1.8, longline: 1.2, gillnet: 2.5, fullMark: 3 },
  { subject: '서식처 건전성', purseSeine: 1.5, longline: 1.0, gillnet: 2.9, fullMark: 3 },
  { subject: '사회·경제성', purseSeine: 1.3, longline: 1.1, gillnet: 1.8, fullMark: 3 },
  { subject: 'FAD 부수어획', purseSeine: 2.4, longline: 0.8, gillnet: 2.7, fullMark: 3 },
  { subject: '해양포유류 혼획', purseSeine: 1.6, longline: 1.9, gillnet: 2.6, fullMark: 3 },
];

const elderlyFoodData = [
  { product: '함박스테이크', hardness: 16.5, protein: 20.6, acceptance: 85 },
  { product: '완탕', hardness: 12.2, protein: 18.3, acceptance: 82 },
  { product: '토마토스프', hardness: 7.0, protein: 15.1, acceptance: 88 },
  { product: '어육패티(40:60)', hardness: 9.7, protein: 22.4, acceptance: 90 },
  { product: '어육패티(60:40)', hardness: 11.2, protein: 24.1, acceptance: 87 },
];

export function KfasByproductValueChain() {
  return (
    <WidgetCard
      title="참치 부산물 → 고부가 바이오 소재 전환 파이프라인"
      icon={Recycle}
      iconColor="#10b981"
      pillar="S5"
      cardDesc="가다랑어·황다랑어 가공 부산물(총 생산량의 30~60%)의 부위별 화학·영양학적 프로파일링 및 효소 가수분해물의 기능성 평가 결과"
      telemetry={{ status: 'STATIC', syncDate: 'KFAS 2026' }}
      kpiPanel={[
        { label: '부산물 비중', value: '30~60%', sub: '총 어류 생산량 대비', trendColor: '#10b981' },
        { label: '한국 다랑어 어획량', value: '290천톤', sub: '해양수산부(MOF) 2024 기준', trendColor: '#f59e0b' },
      ]}
      chartHeight={280}
      chart={
        <BarChart data={byproductData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="part" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }} interval={0} height={50} />
          <YAxis stroke="#94a3b8" unit="%" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="protein" name="조단백(g/100g)" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="lipid" name="조지방" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="collagen" name="콜라겐" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>한국 다랑어류 어획량은 연 <strong>29만 톤</strong>(MOF 2024). 이 중 가공 부산물(머리·껍질·뼈·내장·알)이 <strong>30~60%</strong>를 차지합니다(Klomklao &amp; Benjakul 2016). 즉 <strong>연 9~17만 톤이 폐기물로 처리</strong>되어 왔습니다.</p>
<p>한국수산과학회(KFAS) 최신 연구로 그 폐기물의 분자 가치가 정량화되었습니다: ① <strong>가다랑어 부산물 6개 부위</strong> 화학·영양학 프로파일 완성 ② <strong>황다랑어 알(Roe) Alcalase 가수분해물</strong>의 ACE(혈압 조절 효소) 억제활성 82% · DPPH(항산화) 78% 측정 ③ 통조림 부산물 위생안전성 MFDS 기준치 이하 검증 — 즉 식품·바이오 소재로 즉시 사용 가능.</p>
<p>의미: 폐기물 처리비를 들이고 버리던 부산물이 사실은 <strong>고부가 바이오 원료의 광맥</strong>이었음. 톤당 $50~80 처리비를 톤당 $4,000~12,000 매출로 전환 가능한 잠재 자산(업계추정).</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 다랑어 부산물은 폐기물이 아니라 <strong>"미회수 바이오 원료 광맥(unrealized bio-asset)"</strong>이다. 본사는 단순 가공사에서 <strong>"marine bio-active ingredient platform"</strong>으로 진화하여 EV/EBITDA를 가공사 8x에서 specialty ingredient 18~22x로 multiple rerate 정당화.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>단기 (12~18개월)</strong>: 본사 가공 공장 10곳에 <strong>by-product separation 라인</strong> 구축 ($1.5~3M/공장). 1차 출시 SKU 3종 — 콜라겐($15~25/kg), 어유 DHA/EPA($30~50/kg), ACE 억제 펩타이드($80~120/kg). 연 부산물 17만 톤의 10% 전환 시 매출 <strong>$50~70M, EBITDA 35%</strong>.</li>
<li style="margin-bottom: 8px;"><strong>중기 (24~48개월)</strong>: KFAS 연구 IP를 본사 명의로 patent filing (한국·미국·EU·일본 4개국). Givaudan·Symrise·Croda·DSM 같은 글로벌 specialty ingredient leader 4사 중 1곳과 <strong>5~10년 exclusive supply 계약</strong> — 우리가 sole upstream supplier. 마진 50%+.</li>
<li><strong>장기 (5~10년)</strong>: <strong>"Marine Bio Ingredient Catalog"</strong> 30+ SKU로 확장. 화장품·건강기능식품·의약품·동물영양 4개 industry cross-sell. 동시에 BioMar(노르웨이) 또는 Aker BioMarine 같은 mid-size specialty leader 인수로 platform 가속. JP Morgan Specialty Chemical Desk가 advisor.</li>
</ol>
</div>`,
        source: 'KFAS 한수지 Vol.59(1), 2026 / Vol.58(1), 2025',
      }}
    />
  );
}

export function KfasLonglineEvolution() {
  return (
    <WidgetCard
      title="한국 원양 다랑어 연승어업 60년 구조 변동"
      icon={Ship}
      iconColor="#3b82f6"
      pillar="S1"
      cardDesc="1957년 인도양 시험조업 이후 3대양으로 확대된 한국 연승어업의 선단 규모, 어획량, 어종 구성의 장기 변화 추적"
      telemetry={{ status: 'STATIC', syncDate: 'KFAS 2025' }}
      kpiPanel={[
        { label: '선단 규모 축소율', value: '-72%', sub: '1980s 250척 → 2020s 70척', trendColor: '#ef4444' },
        { label: 'MSC 인증 필요성', value: '필수', sub: '미끼 자원 포함 지속가능성', trendColor: '#3b82f6' },
      ]}
      chartHeight={280}
      chart={
        <ComposedChart data={longlineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="period" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }} />
          <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" unit="%" tick={{ fill: '#f59e0b', fontSize: 12, fontWeight: 500 }} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
          <Legend />
          <Bar yAxisId="left" dataKey="vessels" name="조업 척수" fill="#3b82f6" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
          <Line yAxisId="left" type="monotone" dataKey="catch_kt" name="어획량(천톤)" stroke="#ef4444" strokeWidth={3} />
          <Line yAxisId="right" type="monotone" dataKey="bigeye_pct" name="눈다랑어 비중(%)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"연승어업(Longline Fishing)"이란 수 킬로미터 길이의 낚싯줄에 미끼 달린 갈고리 수천 개를 매달아 참치를 잡는 방식입니다. 선망(Purse Seine)이 가다랑어 떼를 통째로 잡는 양적 어법이라면, 연승은 고가 어종(눈다랑어·황다랑어)을 한 마리씩 잡는 <strong>"selective high-value"</strong> 어법입니다.</p>
<p>한국 원양 연승어업의 60년 흥망성쇠: 1957년 시험조업 → <strong>1980년대 250척·65천톤 정점</strong> → WCPFC 규제 강화 + 경제성 악화로 <strong>2020년대 70척·9천톤</strong>(척수 -72%, 어획량 -86%). 그러나 어종 구성은 고급화: <strong>눈다랑어(Bigeye, 고단가) 비중 45%→60%</strong>.</p>
<p>두 가지 신규 병목: ① <strong>WCPFC 쿼터 강화</strong> — 향후 5년 추가 -10~15% 가능성 ② <strong>인도네시아산 풀가라지(미끼) MSC 인증 압박</strong> — 미끼 자원의 지속가능성이 MSC 인증의 신규 게이트로 부상. 미끼 부족 시 연승어업 자체가 중단.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 연승어업은 더 이상 "양적 어획"이 아니라 <strong>"high-value selective protein boutique"</strong>이다. 70척의 소수정예 선단은 박물관 자산이 아니라 일본·중동 럭셔리 시장의 독점 공급 파이프라인. 척당 생산성 127t→129t 유지하면서 ASP +30~50% 추가 회수 가능.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>단기</strong>: <strong>"Sustainable Longline Premium"</strong> 브랜딩으로 일본 도쿄 토요스 + 두바이 호스피탈리티 직거래 채널 락업. 가격 +25~40% 프리미엄.</li>
<li style="margin-bottom: 8px;"><strong>중기</strong>: <strong>MSC 미끼자원 인증 선제 착수</strong> — 인도네시아 풀가라지 MSY 대비 어획률(52.8%) 정밀 검증 + IPNLF(국제연승조합) 파트너십. MSC 인증을 first-mover로 확보하면 향후 5년 경쟁사 진입 차단.</li>
<li><strong>장기</strong>: <strong>VDS(Vessel Day Scheme) 입어 포트폴리오 재편</strong>. 기후변화로 태평양 조업거점이 남위로 이동 — 솔로몬·바누아투·키리바시 VDS 라이센스 forward 매입. PNA Sovereign Fund와 결합하면 long-term VDS access 보장 + 사업 sustainability.</li>
</ol>
</div>`,
        source: 'KFAS 한수지 Vol.58(4), 2025 / Vol.58(6), 2025',
      }}
    />
  );
}

export function KfasIndianOceanRisk() {
  return (
    <WidgetCard
      title="인도양 다랑어어업 생태계 위험도 레이더"
      icon={AlertTriangle}
      iconColor="#f97316"
      pillar="S5"
      cardDesc="IOTC 관할 서부인도양 해역 — 어업별(선망/연승/자망) 생태계기반 위험도 평가(EBFA) 결과. 자망(Gillnet)이 전 지표에서 최고 위험."
      telemetry={{ status: 'STATIC', syncDate: 'KFAS 2023-2025' }}
      kpiPanel={[
        { label: '자망 FAD 위험도', value: 'HIGH', sub: '서식처 훼손 + 부수어획', trendColor: '#ef4444' },
        { label: 'IO 수익 비중', value: '80%', sub: '인도양 전체 다랑어어업 중', trendColor: '#10b981' },
      ]}
      chartHeight={280}
      chart={
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={ioRiskData}>
          <PolarGrid stroke="rgba(255,255,255,0.15)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }} />
          <PolarRadiusAxis angle={30} domain={[0, 3]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
          <Legend />
          <Radar name="선망(Purse Seine)" dataKey="purseSeine" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
          <Radar name="연승(Longline)" dataKey="longline" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
          <Radar name="자망(Gillnet)" dataKey="gillnet" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
        </RadarChart>
      }
      takeaway={{
        situation: `<div>
<p>인도양 참치 어업은 연 <strong>$20억(약 2.7조원)</strong> 산업이며, 그 중 80%가 서부인도양(WIO, Western Indian Ocean)에서 발생합니다. 한국의 인도양 의존도 약 35% — WCPO 충격 시 backup으로도 핵심.</p>
<p>"EBFA(Ecosystem-Based Fisheries Assessment)"는 어법별로 6개 관리목표(target species·bycatch·ecosystem·habitat·governance·socioeconomic)를 0~3점 척도로 평가한 IOTC 공식 분석 framework. 충격적 결과: <strong>자망(Gillnet) 어업이 6개 전 지표에서 최고 위험(Risk Score 2.5~2.9/3.0)</strong>. 특히 FAD(부유물 집어장치) 결합 자망은 부수어획·서식처 건전성에서 극단적 고위험.</p>
<p>가장 심각한 게: <strong>눈다랑어(Bigeye)가 "과도어획(Overfished)" 상태 진입</strong>. IOTC가 향후 2~3년 내 TAC(총허용어획량) 강화 발동 가능성 매우 높음 — 자망 어업 퇴출이 1순위 대상.</p>
<p>실질 의미: 향후 5년 내 인도양 자망 의존 vendor는 EU·미국 시장에서 사실상 추방되고, <strong>연승 어획물만이 허용되는 채널 격리</strong>가 발생합니다. 연승 비중을 미리 확대한 vendor만이 시장 잔류.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 인도양 자망 vs 연승 분리는 단순 ESG 선호가 아니라 <strong>"향후 5년 채널 access 자체를 결정하는 regulatory selection event"</strong>다. 미리 연승 비중을 80%로 끌어올린 vendor만이 EU·미국 modern trade에 남는다.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>단기</strong>: 인도양 소싱 파이프라인에서 자망 원물 100% 회피. 연승 어획물 (Risk Score 1.0~1.9)로 100% 전환. 추가 cost 단가 +15~25% 부담 발생하나 향후 채널 access 보장.</li>
<li style="margin-bottom: 8px;"><strong>중기 (12~24개월)</strong>: IOTC TAC 강화(2027 예상) 발효 전 연승 어선·쿼터 <strong>5년 forward 계약 락업</strong>. 자망 퇴출 시 공급 -15~20% 발생할 때 우리는 미리 확보. 동시에 t-RFMO 5개 기구(IATTC, ICCAT, IOTC, WCPFC, CCSBT)의 CMM(보존관리조치) 준수 여부를 vendor 평가 체크리스트로 표준화.</li>
<li><strong>장기</strong>: <strong>"Sustainable Longline Premium Certification"</strong> 자체 발행 — IOTC + MSC + Marine Trust 3중 인증을 우리 origination 시점부터 일괄 부여. 글로벌 EU·미국 retail에 default ingredient supplier. 인증의 toll gate 자체를 우리가 운영하는 platform로 진화.</li>
</ol>
</div>`,
        source: 'KFAS 한수지 Vol.56(4), 2023 / Vol.58(6), 2025',
      }}
    />
  );
}

export function KfasElderlyFunctionalFood() {
  return (
    <WidgetCard
      title="눈다랑어 고령친화식품 & 기능성 신시장"
      icon={TestTube}
      iconColor="#8b5cf6"
      pillar="S4"
      cardDesc="눈다랑어 기반 연화식 제품(함박/완탕/스프) 및 참치-황새치 어육패티의 품질특성 검증 — 한국 고령화 시대의 신성장 동력"
      telemetry={{ status: 'STATIC', syncDate: 'KFAS 2023-2025' }}
      kpiPanel={[
        { label: '고령친화식품 시장(KR)', value: '₩5조', sub: '2025년 추정 · CAGR 15%+', trendColor: '#8b5cf6' },
        { label: '최적 배합비', value: '40:60', sub: '참치적색육:황새치백색육', trendColor: '#10b981' },
      ]}
      chartHeight={280}
      chart={
        <ComposedChart data={elderlyFoodData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="product" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }} interval={0} height={60} />
          <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#10b981" unit="%" tick={{ fill: '#10b981', fontSize: 12, fontWeight: 500 }} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
          <Legend />
          <Bar yAxisId="left" dataKey="protein" name="조단백(%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="hardness" name="경도(N)" fill="#f59e0b" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
          <Line yAxisId="right" type="monotone" dataKey="acceptance" name="관능 수용도(%)" stroke="#10b981" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>2025년 한국 65세 이상 인구가 <strong>전체의 20%를 돌파</strong>(통계청)하며 초고령 사회 진입. 이에 따라 <strong>"고령친화식품"</strong> 시장이 폭발 성장 중 — 2024년 약 2조원에서 2030년 6조원 전망(농식품부).</p>
<p>고령친화식품의 핵심 요구: ① 씹기·삼키기 쉬운 연화도 ② 단백질 함량 ≥18% ③ 나트륨 ≤350mg/100g ④ 관능수용도(taste acceptance) ≥75%.</p>
<p>한국수산과학회(KFAS) 검증 결과: 우리 <strong>눈다랑어 레토르트 연화식 3종(함박/완탕/스프)</strong>이 경도·단백질·관능평가 모든 지표 통과. 또한 <strong>참치 적색육 : 황새치 백색육 40:60 배합 패티</strong>는 단백질 22.4% · 관능수용도 90% — 동급 육류 패티 대비 단백질 동등 + 지방 50% 저감.</p>
<p>현재 시장 상황: <strong>수산물 기반 고령친화식품은 거의 전무</strong>. 대부분 분유·죽·미음 등 곡물 기반. 우리가 first-mover로 진입하면 향후 5~10년 카테고리 자체를 정의할 기회.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 고령친화식품은 단순 신제품이 아니라 <strong>"한국 인구 구조 변화에 베팅하는 20년 카테고리 베팅"</strong>. 향후 20년 65세 이상 인구가 +400만 증가, 시장이 2.5조→6조원 성장하는 메가 트렌드. category creator로서 first-mover 회수.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>단기</strong>: 눈다랑어 연화식 3종 <strong>"실버 프리미엄"</strong> 라인 상품화. 학교급식 + 요양시설 B2B 우선 — 식약처 "고령친화우수식품" 인증으로 정부 조달 시 가산점 확보. 시장가 단가 +20~30% 프리미엄.</li>
<li style="margin-bottom: 8px;"><strong>중기</strong>: 참치-황새치 40:60 어육 패티를 <strong>HMR(편의점/홈쇼핑) 채널</strong> 출시. USP: "동급 육류 패티 대비 단백질 동등 + 지방 50% 저감". GS25·CU·홈쇼핑 동시 입점, MZ 부모 세대 + 5060 자가 소비 동시 타겟.</li>
<li><strong>장기</strong>: <strong>"Marine Functional Food Platform"</strong> 진화. 사료 cost 절감 카드(KFAS 2023: 대서양참다랑어 양식 사료에 아마인유 15% 대체 시 성장률 무영향)도 동시 활용. 일본·중국·동남아 고령화 국가에 K-marine 고령 식품 export — 일본 65세+ 시장 32M명, 중국 65세+ 200M명+ 거대 시장. 글로벌 functional food leader(Nestlé Health·Abbott Nutrition·Glanbia) M&A target 검토.</li>
</ol>
</div>`,
        source: 'KFAS 한수지 Vol.57(5), 2024 / Vol.56(5), 2023 / Vol.58(3), 2025',
      }}
    />
  );
}
