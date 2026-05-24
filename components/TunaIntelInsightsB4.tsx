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
        situation: '태국 가공 허브의 2026 1분기 원어 수입이 가다랑어 -5%, 황다랑어 -14% 동시 감소. 슈퍼 엘니뇨로 WCPO에서 마이크로네시아·대만·나우루·한국 공급 급감하자 태국 가공업체가 부족분을 몰디브·세이셸·인도·필리핀 등 인도양으로 긴급 대체. WCPO 의존도 65 → 48%(-17%p), 인도양 비중 22 → 38%(+16%p).',
        actionPlan: '(a) 한국·대만·필리핀의 WCPO 어획 쿼터 가치가 단기 상승했으므로 쿼터 라이센싱 시 우위 협상. (b) 동원·사조의 인도양(IOTC) 조업 확대 검토 — 태국 가공사들이 대체 공급선으로 인도양을 적극 채택하는 흐름에 편승. (c) 가다랑어 vs 황다랑어 감소율 차이(-5% vs -14%)를 보면 황다랑어가 더 타이트하므로 황다랑어 product line 가격 인상 여지가 더 큼.',
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
        situation: 'Frime은 EU pre-cooked loin 시장 단일 21% 점유 스페인 최대 황다랑어 가공사로 2026년 새 소유주 인수. MSC 인증 어장 100% 조달 지속가능성 프리미엄 포지션. 거래 구조·인수 주체는 비공개. 2025년 EU loin 수입량은 역대 최고 194,258톤 기록 — Frime 인수는 그 흐름의 마지막 단추.',
        actionPlan: '(a) Frime 새 소유주 단기 모니터링 (Bolton/Thai Union/Bumble Bee 계열인지). 글로벌 통조림 4대 메이저 중 누구의 EU 가공 거점 강화인지가 한국 수출 게임 룰을 결정. (b) 동원·사조가 ANFACO-CECOPESCA 채널로 스페인 23개 핵심 가공사 중 중견 1~2곳과 OEM/JV 협상 개시 시점. (c) MSC 인증 어장 100% 모델은 한국 KMI 표준으로도 적용 가능 — 인증 기반 프리미엄 라인업 설계.',
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
        situation: '2026 Q2 가다랑어 가격 폭등은 3가지 동시 충격의 합성. (1) 호르무즈: 2026-02말 미·이스라엘-이란 분쟁 격화로 호르무즈 봉쇄 위기 → MGO 톤당 $2,000 돌파, 어획 비용의 약 68% 잠식. (2) WCPO: 슈퍼 엘니뇨로 1Q26 어획량이 전년 동기 대비 -22%(-39,000톤) 급감. (3) 가공업체 저항: 4월 22일 $2,100 체결가에서 태국 가공사들이 매입 거부·관망세 전환, 5월 6일 $1,975로 하락. 가격 추가 상승의 천장은 가공업체 손익분기점이 결정.',
        actionPlan: '(a) 1,950~2,050 박스권이 6~8주 지속 가능성 — 박스 하단 분할 매입이 안전. (b) 호르무즈 리스크 해소까지 단기 매입은 2~4주 단위로 분할해 $2,000+ 호가 노출 회피. (c) 인도양(IOTC) 대체 공급선(몰디브·세이셸·인도·필리핀) 비중 확대로 WCPO 단일 의존도 낮추기. (d) 가공업체 저항이 깨지는 시그널(태국 캐너 매입 재개) 주간 모니터링.',
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
        situation: '동원산업은 MSC 지속가능성 기준 충족 + 비용 절감 위해 RAS(부유식 순환여과양식) 시험 운영 중. RAS는 전통 가두리 양식 대비 단위 면적당 생산성 4.5배, 용수 사용 95% 절감, 항생제 사용 90% 감소. 초기 CAPEX 높고 양식 가능 어종 제한이라는 약점도 존재. 가나에서는 WASTE2TASTE 프로젝트가 부산물 활용 어유·콜라겐 추출 공정 연구 중 — RAS와 결합 시 순환 경제 모델 완성.',
        actionPlan: '(a) 동원 RAS 파일럿의 KPI(생산성·FIFO·OPEX/kg)를 분기별 공개 압박해 ESG 투자자 신뢰 확보. (b) 사조산업도 단독 또는 동원 컨소시엄 형태로 RAS 합류 시 양사 ESG 디스카운트 해소 가능 (한국 수산주 글로벌 동종 대비 PBR -20% 디스카운트). (c) 가나·세네갈 가공 거점에 WASTE2TASTE 모델 결합 — 본사 RAS + 아프리카 가공 부산물 = 순환 경제 듀얼 엔진.',
        source: 'NotebookLM 가나 서아프리카 참치 노트북 · WASTE2TASTE 프로젝트 · MSC 양식 표준',
      }}
    />
  );
}
