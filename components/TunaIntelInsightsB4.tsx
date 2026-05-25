'use client';
/**
 * Phase B4 신규 인사이트 위젯 4종 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 289줄 → After 200줄 (-31%)
 *
 * 1. ThaiImportShift1Q26 (S1)
 * 2. FrimeAcquisitionWidget (S2)
 * 3. PerfectStormWidget (S1)
 * 4. RasSystemWidget (S5)
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ComposedChart, Line } from 'recharts';
import { Anchor, Building2, AlertTriangle, Recycle } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

// ───────────────────────────────────────────────────────────────
// 1. 태국 2026-Q1 원어 수입 동향 (S1)
// ───────────────────────────────────────────────────────────────
const thaiImportData = [
  { species: '가다랑어', '2025_Q1': 151000, '2026_Q1': 143436 },
  { species: '황다랑어', '2025_Q1': 44593, '2026_Q1': 38348 },
];

const thaiSourceShiftData = [
  { region: 'WCPO (서태평양)', '2025_Q1': 65, '2026_Q1': 48 },
  { region: 'IO (인도양)', '2025_Q1': 22, '2026_Q1': 38 },
  { region: '기타', '2025_Q1': 13, '2026_Q1': 14 },
];

export function ThaiImportShift1Q26() {
  return (
    <WidgetCard
      title="태국 가공 허브 1Q26 원어 수입 — 인도양 대체 확대"
      icon={Anchor}
      iconColor="#06b6d4"
      pillar="S1"
      cardDesc="2026-Q1 태국 냉동 원어 수입 193,367톤. 가다랑어 143,436톤(-5% YoY), 황다랑어 38,348톤(-14% YoY). WCPO 65→48% / IO 22→38% 대체"
      unit="(단위: 톤 / %)"
      telemetry={{ status: 'SYNCED', syncDate: 'Atuna 2026-05-04' }}
      customBody={
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ height: 240 }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4, textAlign: 'center' }}>어종별 수입량 (톤)</div>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={thaiImportData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                <ChartPatternDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="species" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <RechartsTooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: '0.75rem' }} />
                <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
                <Bar dataKey="2025_Q1" name="2025 Q1" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="2026_Q1" name="2026 Q1" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ height: 240 }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4, textAlign: 'center' }}>해역별 공급 비중 (%)</div>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={thaiSourceShiftData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                <ChartPatternDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="region" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
                <RechartsTooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: '0.75rem' }} />
                <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
                <Bar dataKey="2025_Q1" name="2025 Q1" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="2026_Q1" name="2026 Q1" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
        </div>
      }
      takeaway={{
        situation: `<div>
<p>태국은 글로벌 참치 가공 허브 1위(점유율 30%). 이 허브가 어떤 어장에서 원어를 들여오는지가 곧 글로벌 참치 공급망 지도. 2026 1분기 결과는 <strong>역사적 지각변동</strong>입니다.</p>
<p>WCPO 의존도가 65% → 48%로 <strong>-17%p 급감</strong>, 인도양 비중이 22% → 38%로 <strong>+16%p 급증</strong>. 슈퍼 엘니뇨 충격으로 마이크로네시아·대만·나우루·한국 공급이 급감하자 태국 가공사들이 부족분을 <strong>몰디브·세이셸·인도·필리핀</strong>으로 긴급 대체.</p>
<p>어종별 임팩트도 차별적: 가다랑어 -5%, <strong>황다랑어 -14%</strong>. 황다랑어가 더 타이트한 이유는 ① 황다랑어 어획에 더 깊은 수심 필요 → ENSO 충격 시 가다랑어보다 회복 느림 ② 황다랑어 가격대(가다랑어의 1.8~2.2배)가 가공사 매입 의사결정의 우선순위.</p>
<p>의미: WCPO 단일 의존 vendor는 지금 죽고 있고, <strong>인도양·필리핀 어획 쿼터 보유자가 단기 우위</strong>. 가격 협상에서 quota holder가 sweet spot.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 어장 이동은 단순 supply shift가 아닌 <strong>"쿼터 가치 재평가 사건"</strong>. 인도양·필리핀·한국 WCPO 쿼터 vendor는 향후 12~24개월 가격 협상에서 sweet spot.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>단기</strong>: 한국·대만·필리핀 WCPO 어획 쿼터 단기 가치 상승 활용 — 라이센싱 협상에서 <strong>+12~18% 프리미엄</strong> 회수.</li>
<li style="margin-bottom: 8px;"><strong>중기</strong>: 동원·사조의 인도양(IOTC) 조업 확대로 인도양 capacity 30~40% 추가 확보. 태국 가공사 dependence 흐름에 편승하여 long-term contract 락업.</li>
<li><strong>장기</strong>: 황다랑어 product line ASP <strong>+8~15% 인상</strong>. 가다랑어 대비 -14% 공급 감소 + 1.8~2.2배 가격대 결합으로 마진 +12%p 회수. 동시에 "ENSO-resilient sourcing" 마케팅으로 EU loin 채널에 sustainability premium 추가.</li>
</ol>
</div>`,
        source: 'Atuna \'Thai Processors Turn To IO WR As Pacific Supply Dwindles In Q1\' (2026.05.04) · 관련 기사 3건',
      }}
    />
  );
}

// ───────────────────────────────────────────────────────────────
// 2. Frime SA 인수 (S2)
// ───────────────────────────────────────────────────────────────
const frimeProductLine = [
  { product: '신선 로인', share: 45 },
  { product: '냉동 로인', share: 35 },
  { product: '스테이크', share: 20 },
];

export function FrimeAcquisitionWidget() {
  return (
    <WidgetCard
      title="Frime SA 인수 — 스페인 최대 황다랑어 가공사 소유권 변경"
      icon={Building2}
      iconColor="#f59e0b"
      pillar="S2"
      cardDesc="Frime SA: 스페인 최대 신선·냉동 황다랑어 로인·스테이크 가공사. EU 시장 21% 점유, MSC 인증 어장만 사용. 2026년 새 소유주 인수"
      unit="(단위: %)"
      telemetry={{ status: 'SYNCED', syncDate: 'Atuna May 2026' }}
      customBody={
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '0 16px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 8 }}>EU pre-cooked loin 시장 점유율</div>
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>21%</div>
              <div style={{ fontSize: '0.75rem', color: '#fcd34d', marginTop: 6 }}>스페인 최대 단일 사업자</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4 }}>(MSC 인증 어장 100%)</div>
            </div>
            <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#cbd5e1' }}>
              <strong style={{ color: '#fbbf24' }}>주력:</strong> 유럽 리테일·외식 직접 공급. 신선/냉동 황다랑어 로인 중심.
            </div>
          </div>
          <div style={{ height: 200 }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4, textAlign: 'center' }}>제품군 (추정)</div>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={frimeProductLine} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <ChartPatternDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
                <YAxis type="category" dataKey="product" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: '0.75rem' }} />
                <Bar dataKey="share" name="제품 비중" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
        </div>
      }
      takeaway={{
        situation: `<div>
<p><strong>Frime SA</strong>는 스페인 최대 황다랑어 가공사로 EU pre-cooked loin 시장의 단일 <strong>21% 점유</strong>. EU 시장에서 사실상 가장 영향력 있는 single processor. 2026년 새 소유주에게 인수 — 거래 구조·인수 주체는 비공개.</p>
<p>왜 중요? Frime은 ① <strong>MSC 인증 어장 100% 조달</strong> (지속가능성 프리미엄) ② EU pre-cooked loin segment의 가격 결정력 보유 ③ 2025년 EU loin 수입량 역대 최고 194,258톤 기록의 핵심 backbone. 인수자는 곧 EU 시장의 게임 룰을 다시 쓸 수 있는 위치.</p>
<p>업계 추측: 글로벌 통조림 4대 메이저(Bolton·Thai Union·Bumble Bee·Bumble Bee 계열) 중 한 곳이 EU 거점 강화 차원에서 인수했을 가능성. 누가 인수했는지에 따라 향후 한국 수출 vendor 등재 게임 룰이 완전히 바뀝니다.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: Frime 인수는 단순 M&amp;A 뉴스가 아니라 <strong>"EU loin 시장의 권력 구조 재편 사건"</strong>. 한국 vendor는 향후 12개월 내 새 소유주에 line up하는 vendor onboarding race에서 빠르게 포지셔닝해야 한다.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>단기 (90일)</strong>: Frime 새 소유주 identity 즉시 확인 (Atuna·EUMOFA·SEC 13D filing 모니터링). 4대 메이저 중 누구인지가 우리 EU 채널 전략의 1순위 변수.</li>
<li style="margin-bottom: 8px;"><strong>중기</strong>: 동원·사조가 <strong>ANFACO-CECOPESCA</strong>(스페인 가공사 협회) 채널로 스페인 23개 핵심 가공사 중 중견 1~2곳과 <strong>OEM/JV 협상 개시</strong>. Frime 외 alternative 거점 확보로 single point dependency 회피.</li>
<li><strong>장기</strong>: <strong>"MSC 100% 인증 어장 supply" 표준화</strong>. Frime의 MSC 100% 조달 모델을 한국 KMI 표준으로 정착 — 우리도 EU 채널에 MSC 100% 어장 vendor로 자리매김. 동시에 한국 농수산식품유통공사(aT)에 EU 가공 거점 협력 사업 제안 — 정부 자금으로 EU 거점 minority equity 확보.</li>
</ol>
</div>`,
        source: 'Atuna May 2026 News 6 sources · NotebookLM EU·스페인 참치 가공사 노트북 · ANFACO-CECOPESCA 산업 통계',
      }}
    />
  );
}

// ───────────────────────────────────────────────────────────────
// 3. 퍼펙트 스톰 종합 (S1)
// ───────────────────────────────────────────────────────────────
const stormTimeline = [
  { date: '2025-10', skj_price: 1700, mgo_index: 100 },
  { date: '2025-11', skj_price: 1650, mgo_index: 102 },
  { date: '2025-12', skj_price: 1500, mgo_index: 105 },
  { date: '2026-01', skj_price: 1500, mgo_index: 108 },
  { date: '2026-02', skj_price: 1580, mgo_index: 125 },
  { date: '2026-03', skj_price: 1800, mgo_index: 160 },
  { date: '2026-04', skj_price: 2100, mgo_index: 195 },
  { date: '2026-05', skj_price: 1975, mgo_index: 198 },
];

export function PerfectStormWidget() {
  return (
    <WidgetCard
      title="퍼펙트 스톰 — 호르무즈 + WCPO + 가공업체 저항"
      icon={AlertTriangle}
      iconColor="#ef4444"
      pillar="S1"
      cardDesc="2026 Q1~Q2 참치 산지가격을 흔든 3가지 동시 충격. 가다랑어 방콕가($/MT) vs MGO 지수(2025-10=100)"
      unit="(단위: $/MT · MGO Index)"
      telemetry={{ status: 'SYNCED', syncDate: 'Atuna 2026-05-06' }}
      chartHeight={280}
      chart={
        <ComposedChart data={stormTimeline} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
          <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} unit="$" />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <RechartsTooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: '0.75rem' }} />
          <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
          <Bar yAxisId="left" dataKey="skj_price" name="가다랑어 방콕가($/MT)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="mgo_index" name="MGO 지수(2025-10=100)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"퍼펙트 스톰"이란 동시 다발적 위기가 결합되어 시너지로 시장을 초토화하는 현상. 2026 Q2 가다랑어 가격 폭등은 정확히 그 사례입니다.</p>
<p><strong>3가지 동시 충격</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 4px;"><strong>호르무즈 봉쇄 위기</strong>: 2026-02 말 미·이스라엘-이란 분쟁 격화로 호르무즈 해협 봉쇄 위협 → 글로벌 MGO(어선 연료) 톤당 $2,000 돌파. 어획 cost의 <strong>약 68%를 연료가 잠식</strong>.</li>
<li style="margin-bottom: 4px;"><strong>WCPO 어획 급감</strong>: 슈퍼 엘니뇨로 1Q26 WCPO 어획량 전년 동기 대비 <strong>-22%(-39,000톤)</strong>.</li>
<li><strong>가공업체 저항</strong>: 4월 22일 $2,100 체결가에서 태국 가공사들이 매입 거부·관망세. 5월 6일 $1,975까지 하락. 추가 상승의 천장은 <strong>가공업체 손익분기점(약 $2,050)</strong>이 결정.</li>
</ol>
<p>의미: 가격 상승은 외생 변수(전쟁·기후)가 fuel, 천장은 내생 변수(가공사 손익분기점)이 cap. <strong>$1,950~2,050 박스권이 6~8주 지속</strong> 가능성. 박스 하단 매입이 위험 대비 수익률 최적.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: Q2 위기는 단순 사이클이 아닌 <strong>"3중 외생 충격 + 가공사 저항선이 만든 박스권 trading opportunity"</strong>. 본사 매입 데스크는 reactive가 아닌 <strong>systematic trading book</strong>으로 운영.</p>
<p><strong>실행</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>박스 하단 분할 매입</strong>: $1,950~$1,980 구간 자동 발주, $2,000+ 호가는 회피. 6~8주에 걸쳐 분할 매수로 평균 매입가 $1,970 타게팅.</li>
<li style="margin-bottom: 8px;"><strong>인도양 대체 공급선 동시 가동</strong>: 몰디브·세이셸·인도·필리핀 비중을 임시 +20%p 확대. WCPO 의존도를 65% → 55%로 낮춤.</li>
<li><strong>가공업체 저항선 모니터링</strong>: 태국 캐너의 주간 매입 재개 시그널을 weekly intelligence report로 추적. 매입 재개가 확인되는 순간 가격 $2,100+ 돌파 가능성 — 추가 매입 가속 또는 forward 계약 락업.</li>
<li><strong>호르무즈 정상화 trigger</strong>: 호르무즈 봉쇄 해소되면 MGO $1,200 수준으로 정상화 — 그 시점에 forward sell 또는 short hedge 진입.</li>
</ol>
</div>`,
        source: 'Atuna 방콕 가다랑어 실측 (skjbkk 2025-10~2026-05) · Atuna May 2026 News · WCPFC 1Q26 어획량 통계',
      }}
    />
  );
}

// ───────────────────────────────────────────────────────────────
// 4. 동원·사조 RAS 시스템 (S5)
// ───────────────────────────────────────────────────────────────
const rasComparisonData = [
  { metric: '단위 면적당 생산성', traditional: 1.0, RAS: 4.5 },
  { metric: '용수 사용량', traditional: 1.0, RAS: 0.05 },
  { metric: '항생제 사용', traditional: 1.0, RAS: 0.1 },
  { metric: 'FIFO 비율', traditional: 1.0, RAS: 0.8 },
];

export function RasSystemWidget() {
  return (
    <WidgetCard
      title="동원·사조 RAS 시스템 — 부유식 순환여과양식 시험 운영"
      icon={Recycle}
      iconColor="#10b981"
      pillar="S5"
      cardDesc="동원산업이 MSC 지속가능성 충족·비용 절감 위해 RAS 시험 운영. 전통 가두리 대비 생산성·용수·항생제·FIFO 일괄 비교"
      unit="(단위: 전통 양식 대비 배수)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05 (NotebookLM 가나 노트북)' }}
      chartHeight={240}
      chart={
        <BarChart data={rasComparisonData} layout="vertical" margin={{ top: 10, right: 20, left: 100, bottom: 10 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <YAxis type="category" dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} width={100} />
          <RechartsTooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: '0.75rem' }} />
          <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
          <Bar dataKey="traditional" name="전통 가두리" fill="#94a3b8" radius={[0, 4, 4, 0]} />
          <Bar dataKey="RAS" name="RAS (순환여과)" fill="#10b981" radius={[0, 4, 4, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p><strong>RAS(Recirculating Aquaculture System)</strong>는 부유식 순환여과양식 — 바다에 떠 있는 폐쇄 양식 시설로 물·사료·배설물을 100% 순환시키는 차세대 양식 기술입니다.</p>
<p>전통 가두리 양식 대비 압도적 우위:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li>단위 면적당 생산성 <strong>4.5배</strong></li>
<li>용수 사용 <strong>-95%</strong> (해양 오염 회피)</li>
<li>항생제 사용 <strong>-90%</strong> (MSC 인증 기준 충족)</li>
<li>FIFO(어분 의존도) 단축 잠재력 (사료 회수율 95%+)</li>
</ul>
<p>약점: ① 초기 CAPEX 매우 높음 ($30~50M/시설) ② 양식 가능 어종 제한 (현재 광어·연어 중심, 참치는 R&amp;D 단계).</p>
<p>한국 동원산업이 시험 운영 중. 동시에 가나에서 <strong>WASTE2TASTE 프로젝트</strong>(부산물 활용 어유·콜라겐 추출 공정) 진행 — RAS와 결합 시 "순환 경제(circular economy)" 모델 완성: 양식 → 가공 → 부산물 → 바이오 소재 → 다시 양식 사료.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: RAS는 단순 양식 기술이 아닌 <strong>"한국 수산주의 PBR rerating instrument"</strong>. 현재 한국 수산주는 글로벌 동종 대비 PBR -20% 디스카운트 — ESG·기후 관련 부재가 핵심 사유. RAS 파일럿이 성공하면 디스카운트 해소 + 추가 프리미엄 가능.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>단기</strong>: 동원 RAS 파일럿의 KPI(생산성·FIFO·OPEX/kg)를 <strong>분기별 공개 압박</strong>으로 ESG 투자자(BlackRock·MSCI ESG·Sustainalytics) 신뢰 확보. 동원 단독이 아닌 한국 수산 전체의 ESG 시그널로 활용.</li>
<li style="margin-bottom: 8px;"><strong>중기</strong>: 사조산업도 단독 또는 동원 컨소시엄 형태로 RAS 합류. 양사 공동 ESG initiative로 PBR -20% 디스카운트 해소 — 시가총액 +20~30% 회복 가능.</li>
<li><strong>장기</strong>: <strong>아프리카(가나·세네갈) 가공 거점에 WASTE2TASTE 결합</strong>. 본사 RAS + 아프리카 가공 부산물 = 순환 경제 듀얼 엔진. World Bank IFC Blue Economy Fund + AfDB 협력으로 자본 조달. 5년 후 우리는 단순 한국 수산사가 아닌 <strong>"global circular protein platform"</strong>으로 valuation rerate (EV/EBITDA 8x → 18~22x).</li>
</ol>
</div>`,
        source: 'NotebookLM 가나 서아프리카 참치 노트북 · WASTE2TASTE 프로젝트 · MSC 양식 표준',
      }}
    />
  );
}
