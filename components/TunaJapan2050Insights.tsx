/**
 * Japan Sashimi Demand 2050 Insights (6 widgets)
 *
 * 데이터 출처: Kawamoto, T. (2026). "Long-term reconstruction of Japan's tuna
 * market and sashimi tuna demand projections to 2050." Fisheries Science.
 * DOI: 10.1007/s12562-026-01984-9 (CC-BY 4.0, Open Access)
 * 게재일: 2026-04-30
 *
 * 모든 수치는 LWE(Live Weight Equivalent) 기준. 재구성 1993~2022, 전망 2050.
 * 위젯 6개:
 *  ① 일본 사시미 수요 절벽 (2022→2050, Pillar 4)
 *  ② 1인당 사시미 소비 감마곡선 (Pillar 4)
 *  ③ 3개 세그먼트 차등 감소 (Pillar 4)
 *  ④ 일본 2022 공급 구조 분해 (Pillar 1)
 *  ⑤ 사시미 3-Tier 가격 매트릭스 (Pillar 4)
 *  ⑥ 코호트 효과 × 인구 더블 쇼크 (Pillar 5)
 */

'use client';
import React from 'react';
import {
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  TrendingDown,
  LineChart as LineIcon,
  Layers,
  GitFork,
  DollarSign,
  Users,
} from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

// ─── 공통 데이터 (Kawamoto 2026 Fig 5·7·8 추출) ────────────────────────────

// ① 일본 사시미 수요 절벽 — Fig 8
const demandCliffData = [
  { 연도: '2022', 국내: 359, 인바운드: 2, 합계: 361 },
  { 연도: '2030', 국내: 233, 인바운드: 23, 합계: 256 },
  { 연도: '2040', 국내: 140, 인바운드: 29, 합계: 169 },
  { 연도: '2050', 국내: 81, 인바운드: 31, 합계: 112 },
];

// ② 1인당 사시미 소비 감마곡선 — Fig 7 (kg/인/년)
const perCapitaData = [
  { 연도: '1995', 소비량: 5.4 },
  { 연도: '2000', 소비량: 5.5 },
  { 연도: '2002', 소비량: 5.6 },
  { 연도: '2010', 소비량: 4.0 },
  { 연도: '2015', 소비량: 3.5 },
  { 연도: '2022', 소비량: 2.863 },
  { 연도: '2030', 소비량: 1.945 },
  { 연도: '2040', 소비량: 1.245 },
  { 연도: '2050', 소비량: 0.775 },
];

// ③ 3개 세그먼트 — Fig 5 (천 톤, LWE)
const segmentData = [
  { 연도: '1993', 사시미: 700, 가츠오부시: 190, 캔: 165 },
  { 연도: '2000', 사시미: 726, 가츠오부시: 235, 캔: 161 },
  { 연도: '2005', 사시미: 706, 가츠오부시: 225, 캔: 155 },
  { 연도: '2010', 사시미: 560, 가츠오부시: 205, 캔: 148 },
  { 연도: '2015', 사시미: 460, 가츠오부시: 175, 캔: 143 },
  { 연도: '2020', 사시미: 395, 가츠오부시: 155, 캔: 140 },
  { 연도: '2022', 사시미: 359, 가츠오부시: 145, 캔: 137 },
];

// ④ 일본 2022 공급 구조 — Fig 6
const supplyStructureData = [
  { 항목: '선망', value: 158, group: '국내 어법', fill: '#0891b2' },
  { 항목: '연승', value: 107, group: '국내 어법', fill: '#0e7490' },
  { 항목: '채낚기', value: 63, group: '국내 어법', fill: '#155e75' },
  { 항목: '참다랑어 양식', value: 24, group: '국내 어법', fill: '#164e63' },
  { 항목: '원어 수입', value: 217, group: '수입', fill: '#38bdf8' },
  { 항목: '캔 수입', value: 78, group: '수입', fill: '#7dd3fc' },
  { 항목: '가츠오부시', value: 18, group: '수입', fill: '#bae6fd' },
];

// ⑤ 사시미 3-Tier 가격 — Kawamoto 2017 인용 (JPY/kg, 도매가 범위)
const priceTierData = [
  { 티어: '프리미엄', 어종: '참다랑어(PBF·SBF)', 최저가: 1500, 최고가: 4200, 평균: 2850 },
  { 티어: '중급', 어종: '눈다랑어·황다랑어', 최저가: 600, 최고가: 1500, 평균: 1050 },
  { 티어: '저가 일상재', 어종: '가다랑어·날개다랑어', 최저가: 150, 최고가: 300, 평균: 225 },
];

// ⑥ 코호트 효과 × 인구 — UN DESA 2024 인구추계 + Kawamoto 2026 1인당
const cohortShockData = [
  { 연도: '2000', 인구: 126.8, 일인당: 5.5, 총수요: 698 },
  { 연도: '2010', 인구: 128.5, 일인당: 4.0, 총수요: 514 },
  { 연도: '2022', 인구: 124.9, 일인당: 2.863, 총수요: 359 },
  { 연도: '2030', 인구: 120.8, 일인당: 1.945, 총수요: 233 },
  { 연도: '2040', 인구: 112.4, 일인당: 1.245, 총수요: 140 },
  { 연도: '2050', 인구: 104.7, 일인당: 0.775, 총수요: 81 },
];

// ───────────────────────────────────────────────────────────────────────────
// ① 일본 사시미 수요 절벽
// ───────────────────────────────────────────────────────────────────────────

export function InsightJapanDemandCliff() {
  return (
    <WidgetCard
      title="일본 사시미 수요 절벽 — 2050년 1/3 토막"
      icon={TrendingDown}
      iconColor="#ef4444"
      pillar="S4"
      cardDesc="Kawamoto(2026) 감마 모델 국내수요 + 로지스틱 인바운드 시나리오. 단위 (천 톤, LWE)"
      telemetry={{ status: 'STATIC', syncDate: '2026-04-30' }}
      termTooltip={{
        term: 'LWE',
        description: 'Live Weight Equivalent. 활중량 환산. 가공·유통 형태(GG 0.85, Loin 0.40, 캔 0.40 등)에 관계없이 원어 무게 기준으로 통일한 단위.',
      }}
      kpiPanel={[
        {
          label: '2050 총수요 (천 톤)',
          value: '112',
          sub: '▼ 2022 대비 -69%',
          trendColor: '#ef4444',
        },
        {
          label: '인바운드 상쇄율',
          value: '11.2%',
          sub: '국내 감소 278 중 31만 회복',
          trendColor: '#fbbf24',
        },
      ]}
      chartHeight={300}
      chart={
        <ComposedChart data={demandCliffData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
          <XAxis dataKey="연도" stroke="var(--w-slate-400)" />
          <YAxis stroke="var(--w-slate-400)" />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.95)', border: 'none', borderRadius: '8px', color: 'var(--w-slate-50)' }} />
          <Legend />
          <Area type="monotone" dataKey="국내" stackId="1" name="국내 수요" stroke="var(--w-sky-400)" fill="var(--w-sky-400)" fillOpacity={0.55} />
          <Area type="monotone" dataKey="인바운드" stackId="1" name="인바운드 수요" stroke="var(--w-emerald-500)" fill="var(--w-emerald-500)" fillOpacity={0.6} />
          <Line type="monotone" dataKey="합계" name="총수요" stroke="var(--w-red-500)" strokeWidth={3} dot={{ r: 5 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: (
          <div>
            <p>
              <strong>사시미 수요</strong>란 일본 시장에서 회·스시·동(돈부리)·세키타키 등 <strong>날것 그대로 소비되는 참치 물량</strong>을 활중량(LWE)으로 환산한 값입니다. Kawamoto(2026)는 일본 공식 통계가 사시미·캔·가츠오부시를 구분하지 않는 한계를 <strong>잔차법(총 공급 - 캔/가츠오부시 가공량)</strong>으로 우회 추정했습니다.
            </p>
            <p>
              일본 사시미 참치 수요는 2022년 <strong>36만 1천 톤</strong>에서 2050년 <strong>11만 2천 톤</strong>으로 감소 전망. 30년 내 <strong>69% 축소</strong>(국내 -77.5%, 인바운드 +29만 톤 추가). 인바운드 관광 수요는 같은 기간 2 → 31만 톤으로 증가하지만, <strong>국내 감소분(27만 8천 톤)의 약 11%만 상쇄</strong>합니다.
            </p>
            <p>
              감마 모델 AIC -64로 선형(-60)·이차(-59)·지수(-55) 대안 대비 우위. <strong>FIES 가계조사와 30년 시계열 상관 R²=0.9176</strong>으로 추세 일관성 검증됨.
            </p>
          </div>
        ),
        actionPlan: (
          <div>
            <p>
              <strong>재정의</strong>: 일본 사시미 시장은 더 이상 "성숙 시장(mature market)"이 아닌 <strong>"구조적 축소 시장(structurally shrinking market)"</strong>. 매출 보전이 아닌 <strong>의존도 자체의 분산</strong>이 KPI.
            </p>
            <ol style={{ margin: '4px 0 0 18px', padding: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <strong>단기 (12개월)</strong>: 일본향 사시미급 매출 비중이 30% 이상인 사업부에 <strong>"비일본 비중 50%+ 5년 로드맵"</strong> 강제. 분기 KPI에 일본 의존도 감축률 추가.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>중기 (3년)</strong>: 미국(글로벌 사시미 8~10% 점유, 2위)·EU·동남아 신흥 사시미 시장에 <strong>고급 부위(toro·akami) 채널 직진출</strong>. 일본 도매시장 경유 마진을 직거래로 흡수.
              </li>
              <li>
                <strong>장기 (5~10년)</strong>: 일본 시장 hold 비중을 사업 평가에서 제외하고 <strong>"글로벌 사시미 점유율"</strong>로 KPI 자체를 교체. 일본 의존 사업부의 ROIC 평가 시 hurdle rate +200bp 페널티 부과로 자본 재배치 가속.
              </li>
            </ol>
          </div>
        ),
        source: 'Kawamoto T (2026) Fisheries Science, DOI 10.1007/s12562-026-01984-9, Fig 8',
      }}
    />
  );
}

// ───────────────────────────────────────────────────────────────────────────
// ② 1인당 사시미 소비 감마곡선
// ───────────────────────────────────────────────────────────────────────────

export function InsightPerCapitaGamma() {
  return (
    <WidgetCard
      title="1인당 사시미 소비 감마곡선 — 2050년 27%"
      icon={LineIcon}
      iconColor="#fbbf24"
      pillar="S4"
      cardDesc="감마 분포 모델 기반 1인당 사시미 소비 장기 전망. 단위 (kg/인/년, LWE). AIC -64 최우수 적합."
      telemetry={{ status: 'STATIC', syncDate: '2026-04-30' }}
      termTooltip={{
        term: '감마 모델',
        description: '비선형 단조 감소 + 음수 방지 특성을 가진 분포 함수. Kawamoto가 1993~2022 실측치에 적합한 결과 선형·이차·지수 대안 대비 AIC 우위 확인.',
      }}
      kpiPanel={[
        {
          label: '1995 정점',
          value: '5.5 kg',
          sub: '1인당 연 소비',
        },
        {
          label: '2050 전망',
          value: '0.775 kg',
          sub: '▼ 정점 대비 -86%',
          trendColor: '#ef4444',
        },
      ]}
      chartHeight={300}
      chart={
        <LineChart data={perCapitaData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
          <XAxis dataKey="연도" stroke="var(--w-slate-400)" />
          <YAxis stroke="var(--w-slate-400)" unit=" kg" />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.95)', border: 'none', borderRadius: '8px', color: 'var(--w-slate-50)' }} />
          <Legend />
          <ReferenceLine x="2022" stroke="var(--w-amber-400)" strokeDasharray="4 4" label={{ value: '재구성 종료', fill: 'var(--w-amber-400)', fontSize: 11, position: 'top' }} />
          <Line type="monotone" dataKey="소비량" name="1인당 소비 (kg/인/년)" stroke="var(--w-sky-400)" strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
      }
      takeaway={{
        situation: (
          <div>
            <p>
              <strong>1인당 소비량</strong>이란 일본 거주자 한 명이 연간 섭취하는 사시미용 참치 활중량(LWE)입니다. 가정 외식 포함 추정치라 가계조사(FIES)의 가정내 소비 1,100g(2002 정점)과는 다른 척도입니다.
            </p>
            <p>
              일본 1인당 사시미 참치 소비는 2002년경 정점(약 5.5~5.6kg) 이후 2022년 <strong>2.863 kg까지 -48%</strong>, 감마 모델 기준 2050년 <strong>0.775 kg</strong>으로 추가 감소 전망. <strong>정점 대비 -86%, 현재 대비 -73%</strong>. 2030년 1.945kg에서 변곡점 가속 진입.
            </p>
            <p>
              감마 모델은 AIC -64로 4개 대안 중 최우수. <strong>음수가 나오지 않는 함수 형태</strong>가 장기 식품 소비 전망의 핵심 적합성 요건.
            </p>
          </div>
        ),
        actionPlan: (
          <div>
            <p>
              <strong>재정의</strong>: 일본 1인당 소비 감소는 <strong>경기 사이클이 아닌 인구·세대 구조 변화</strong>. 가격 인하·프로모션으로 회복 불가. 본사 사업계획 시나리오에서 <strong>"일본 수요 회복" 시나리오 자체를 삭제</strong>.
            </p>
            <ol style={{ margin: '4px 0 0 18px', padding: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <strong>단기 (12개월)</strong>: 일본 사시미 가격 전략을 <strong>"고단가 부위 프리미엄 방어"</strong>로 전환. Toro(뱃살)·akami(붉은살) 정선 채널에 R&D 자원 집중, 저단가 채널은 가다랑어 캔으로 자연 이전.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>중기 (3년)</strong>: 2030년 1.945kg 변곡점에서 일본 도매시장 직거래 비중을 <strong>50% 이하로 축소</strong>. 신라교역 일본법인의 자체 B2C 채널(고급 외식·이세탄·미츠코시 식품관 등)로 가치 사슬 단축.
              </li>
              <li>
                <strong>장기 (5~10년)</strong>: 2050년 0.775kg 시나리오 하에서 일본은 <strong>"테스트 베드 시장"</strong>으로 재포지셔닝. 매출 절대량 의존 대신 신제품 검증·브랜드 자산 활용 거점으로 역할 전환.
              </li>
            </ol>
          </div>
        ),
        source: 'Kawamoto T (2026) Fig 7, Table 3 (AIC 비교)',
      }}
    />
  );
}

// ───────────────────────────────────────────────────────────────────────────
// ③ 3개 세그먼트 차등 감소
// ───────────────────────────────────────────────────────────────────────────

export function InsightSegmentDecline() {
  return (
    <WidgetCard
      title="3개 세그먼트 차등 감소 — 캔만 견뎠다"
      icon={Layers}
      iconColor="#38bdf8"
      pillar="S4"
      cardDesc="일본 참치 시장 3대 세그먼트의 22년 추이 비교. 단위 (천 톤, LWE). 2000년 정점 대비 변화율 표기."
      telemetry={{ status: 'STATIC', syncDate: '2026-04-30' }}
      termTooltip={{
        term: '세그먼트',
        description: '용도별 시장 구분. 사시미(날것 회), 가츠오부시(가다랑어 훈연 건조 — 출고 시 가공 수율 0.2), 캔(통조림 가공 — cooked loin 수율 0.40).',
      }}
      kpiPanel={[
        {
          label: '사시미 감소율',
          value: '-50%',
          sub: '2000 → 2022',
          trendColor: '#ef4444',
        },
        {
          label: '캔 감소율',
          value: '-15%',
          sub: '상대적 회복탄력성 입증',
          trendColor: '#10b981',
        },
      ]}
      chartHeight={300}
      chart={
        <LineChart data={segmentData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
          <XAxis dataKey="연도" stroke="var(--w-slate-400)" />
          <YAxis stroke="var(--w-slate-400)" />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.95)', border: 'none', borderRadius: '8px', color: 'var(--w-slate-50)' }} />
          <Legend />
          <Line type="monotone" dataKey="사시미" name="사시미" stroke="var(--w-red-500)" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="가츠오부시" name="가츠오부시" stroke="var(--w-amber-400)" strokeWidth={2.5} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="캔" name="캔(통조림)" stroke="var(--w-emerald-500)" strokeWidth={2.5} dot={{ r: 4 }} />
        </LineChart>
      }
      takeaway={{
        situation: (
          <div>
            <p>
              일본 참치 시장은 <strong>사시미(날것)·가츠오부시(훈연 건조)·캔(통조림)</strong> 3개 세그먼트로 구성됩니다. 시장 전체 규모는 2000년 <strong>112만 2천 톤</strong>에서 2022년 <strong>64만 2천 톤</strong>으로 22년간 -43% 축소.
            </p>
            <p>
              세그먼트별 22년 변화: <strong>사시미 -50%</strong>(726→359), <strong>가츠오부시 -38%</strong>(235→145), <strong>캔 -15%</strong>(161→137). <strong>고급 외식 사시미가 가장 빠르게 축소되고 일상 가공식 캔이 가장 견고</strong>한 패턴.
            </p>
            <p>
              해석: 사시미는 <strong>사치재 + 외식 의존</strong>이라 인구·가처분소득 충격에 가장 취약. 캔은 <strong>비축식·재해식 + 저단가 단백질</strong>로 일상 필수재 성격이 강해 경기 충격에 둔감.
            </p>
          </div>
        ),
        actionPlan: (
          <div>
            <p>
              <strong>재정의</strong>: 신라교역 일본향 포트폴리오의 사시미·캔 비중은 <strong>수요 탄력성이 정반대인 두 사업</strong>. 통합 P&amp;L 평가는 위험 신호를 가린다 — <strong>세그먼트별 분리 P&amp;L</strong>로 의사결정.
            </p>
            <ol style={{ margin: '4px 0 0 18px', padding: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <strong>단기 (12개월)</strong>: 캔 비중 확대 우선순위. <strong>방콕·호치민 가다랑어 원어 확보 + OEM 캔 라인 가동률 KPI</strong>로 일본 캔 시장 점유율 추격. 비식용 부산물은 펫푸드로 cross-sell.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>중기 (3년)</strong>: 사시미는 <strong>일본 외 시장 비중 50%+</strong>로 강제 전환. 가츠오부시는 일본 전통 식문화 의존이 절대적이라 신라교역 본사 사업으로는 적합도 낮음 — 현지 파트너십(니노미야 가츠오부시 등)으로 자본 노출 최소화.
              </li>
              <li>
                <strong>장기 (5~10년)</strong>: 사시미 인접 신시장 개척 — <strong>HMR 사시미동·델리 스시·컵 사시미</strong>로 카테고리 자체 재정의. Z세대 시장은 전통 외식 사시미가 아닌 편의형·이동형 사시미 형태로만 회복 가능.
              </li>
            </ol>
          </div>
        ),
        source: 'Kawamoto T (2026) Fig 5',
      }}
    />
  );
}

// ───────────────────────────────────────────────────────────────────────────
// ④ 일본 2022 공급 구조 분해
// ───────────────────────────────────────────────────────────────────────────

export function InsightSupplyStructure2022() {
  return (
    <WidgetCard
      title="일본 2022 공급 구조 — 연승·원어수입이 절반"
      icon={GitFork}
      iconColor="#0e7490"
      pillar="S1"
      cardDesc="일본 참치 시장 642k 톤(LWE) 공급원 분해. 국내 어법 4종 + 수입 3종. 한국 원양 연승선단 경쟁 영역 식별."
      telemetry={{ status: 'STATIC', syncDate: '2026-04-30' }}
      termTooltip={{
        term: '어법',
        description: '선망(purse seine, 띠그물로 가다랑어·황다랑어 다량 어획), 연승(longline, 긴 줄에 미끼·바늘로 참다랑어·눈다랑어), 채낚기(pole-and-line, 한 마리씩 낚시), 양식(완전양식 PBF — 시즈오카·통영).',
      }}
      kpiPanel={[
        {
          label: '연승 + 원어수입',
          value: '324 천 톤',
          sub: '전체 공급의 50.5%',
          trendColor: '#0e7490',
        },
        {
          label: '참다랑어 양식',
          value: '24 천 톤',
          sub: '신규 진입 검토 대상',
          trendColor: '#fbbf24',
        },
      ]}
      chartHeight={300}
      chart={
        <BarChart data={supplyStructureData} margin={{ top: 20, right: 30, left: 80, bottom: 5 }} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(140,170,255,0.12)" />
          <XAxis type="number" stroke="var(--w-slate-400)" unit=" 천 톤" />
          <YAxis dataKey="항목" type="category" stroke="var(--w-slate-400)" width={100} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.95)', border: 'none', borderRadius: '8px', color: 'var(--w-slate-50)' }} />
          <Bar dataKey="value" name="공급량 (천 톤, LWE)" radius={[0, 4, 4, 0]}>
            {supplyStructureData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      }
      takeaway={{
        situation: (
          <div>
            <p>
              2022년 일본 참치 시장 <strong>총 642천 톤(LWE)</strong>은 7개 공급원으로 분해됩니다. 국내 어획 <strong>352천 톤(55%)</strong>: 선망 158, 연승 107, 채낚기 63, 양식 24. 원어 수입 <strong>217천 톤(34%)</strong>, 캔·가츠오부시 수입 96천 톤(15%).
            </p>
            <p>
              사시미 공급의 핵심 채널은 <strong>연승(107) + 원어 수입(217) = 324천 톤</strong>으로 전체 공급의 절반. 한국 원양 연승선단(동원산업·사조산업·신라교역)이 직접 경쟁하는 영역.
            </p>
            <p>
              <strong>참다랑어(PBF) 양식 24천 톤</strong>은 시즈오카·통영 등 동북아 한정 시장이지만 사시미 프리미엄 티어(JPY 1,500~4,200/kg)의 거의 절반을 차지. 신라교역 부산 양식 진출 검토 대상.
            </p>
          </div>
        ),
        actionPlan: (
          <div>
            <p>
              <strong>재정의</strong>: 일본 연승 공급 채널은 <strong>국내 어선과 한국 원양선단이 같은 풀에서 경쟁</strong>하는 구조. 한국 점유율 확대는 일본 국내 어선의 노후·은퇴 가속과 직결 — <strong>일본 어선 인수·라이센스 매수</strong>가 가장 빠른 경로.
            </p>
            <ol style={{ margin: '4px 0 0 18px', padding: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <strong>단기 (12개월)</strong>: 한국 연승선단의 일본행 출하 점유율을 <strong>분기 KPI로 모니터링</strong>. 일본 도매시장(쓰키지 후속 도요스) 경유 비중과 직거래 비중을 분리 측정.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>중기 (3년)</strong>: 일본 노후 연승선 인수 — <strong>5~10척 / 척당 $3~5M</strong>으로 일본 깃발 유지하면서 한국 사업자 운영. 일본 자체 쿼터(WCPFC·IOTC) 보존하며 어획 권리만 흡수.
              </li>
              <li>
                <strong>장기 (5~10년)</strong>: PBF 양식 시장 24천 톤 진입 — 통영·욕지 기존 양식 인프라 인수 후 일본 시즈오카 양식사와 <strong>합작 R&amp;D 컨소시엄</strong>. 양식 기술(완전양식 종묘·먹이) 이전을 조건으로 사시미 직판 채널 확보.
              </li>
            </ol>
          </div>
        ),
        source: 'Kawamoto T (2026) Fig 6',
      }}
    />
  );
}

// ───────────────────────────────────────────────────────────────────────────
// ⑤ 사시미 3-Tier 가격 매트릭스
// ───────────────────────────────────────────────────────────────────────────

export function InsightPriceTier() {
  return (
    <WidgetCard
      title="사시미 3단계 가격 매트릭스 — 14배 격차"
      icon={DollarSign}
      iconColor="#fbbf24"
      pillar="S4"
      cardDesc="일본 도매가 어종·등급별 비교. 14배 = 프리미엄 PBF 상한가(JPY 4,200/kg) ÷ 저가 SKJ 하한가(JPY 300/kg). Kawamoto(2017) 인용 추정치. 단위 (JPY/kg)."
      telemetry={{ status: 'STATIC', syncDate: '2026-04-30' }}
      termTooltip={{
        term: '3단계 가격대',
        description: '프리미엄(참다랑어 — PBF 태평양참다랑어, SBF 남방참다랑어), 중급(눈다랑어 BET, 황다랑어 YFT), 저가(가다랑어 SKJ, 날개다랑어 ALB).',
      }}
      kpiPanel={[
        {
          label: '최상-최하 단가비',
          value: '14배',
          sub: '4,200 vs 300 JPY/kg',
          trendColor: '#ef4444',
        },
        {
          label: '중급 티어 범위',
          value: '600-1,500',
          sub: '가장 넓은 가격대',
          trendColor: '#fbbf24',
        },
      ]}
      chartHeight={300}
      chart={
        <BarChart data={priceTierData} margin={{ top: 20, right: 30, left: 60, bottom: 5 }} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(140,170,255,0.12)" />
          <XAxis type="number" stroke="var(--w-slate-400)" unit=" JPY" />
          <YAxis dataKey="티어" type="category" stroke="var(--w-slate-400)" width={100} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.95)', border: 'none', borderRadius: '8px', color: 'var(--w-slate-50)' }} />
          <Legend />
          <Bar dataKey="최저가" name="가격 하한 (JPY/kg)" fill="#7dd3fc" radius={[0, 0, 0, 0]} />
          <Bar dataKey="평균" name="평균가 (JPY/kg)" fill="var(--w-amber-400)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="최고가" name="가격 상한 (JPY/kg)" fill="var(--w-red-500)" radius={[0, 4, 4, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: (
          <div>
            <p>
              일본 사시미 시장은 어종별로 단가가 <strong>3개 티어</strong>로 분기. 프리미엄(PBF·SBF) <strong>JPY 1,500~4,200/kg</strong>, 중급(BET·YFT) JPY 600~1,500, 저가(SKJ·ALB) <strong>JPY 150~300</strong>. 최상-최하 단가비 약 <strong>14배</strong>.
            </p>
            <p>
              어법 매핑: 프리미엄은 채낚기·연승·완전양식 중심, 중급은 연승·선망 혼재, 저가는 선망·채낚기. <strong>일본 수요 감소 시 하위 티어부터 잠식</strong>되는 트레이드다운(소비자가 저가로 옮겨가는) 패턴이 관측됨.
            </p>
            <p>
              현재 가다랑어(SKJ) 방콕 FOB는 2026-Q2 약 $2,008/MT(약 JPY 300/kg, 8엔/$140 환산) — <strong>일본 도매가 저가 티어 상한</strong>에 근접. SKJ 캔 가공 마진 압박 가속 신호.
            </p>
          </div>
        ),
        actionPlan: (
          <div>
            <p>
              <strong>재정의</strong>: 14배 단가 격차는 <strong>"품종별 사업 = 완전히 다른 사업"</strong>을 의미. SKJ 캔 사업과 PBF 사시미 사업을 한 P&amp;L로 평가하는 것은 자본 의사결정 왜곡.
            </p>
            <ol style={{ margin: '4px 0 0 18px', padding: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <strong>단기 (12개월)</strong>: <strong>SKJ/YFT/BET/PBF 티어별 분리 P&amp;L</strong>. 각 티어에 다른 hurdle rate·ROIC 목표 적용. SKJ 캔은 <strong>volume 사업(IRR 10~12% 충분)</strong>, PBF 사시미는 <strong>margin 사업(IRR 18%+ 요구)</strong>.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>중기 (3년)</strong>: 가다랑어(SKJ) 사업장은 <strong>$1,800/MT 이하 매입 락인</strong>을 take-or-pay로 확보 + 비효율 노후 캔 라인 정리. PBF·SBF 사업장은 <strong>고급 외식·럭셔리 호텔 직거래 채널</strong> 확장.
              </li>
              <li>
                <strong>장기 (5~10년)</strong>: 중급 티어(BET·YFT)는 <strong>완제품(스시·동·HMR) 부가가치화</strong>로 가격 인플레이션 흡수. 가격 인플레이션이 어려운 SKJ는 펫푸드·자숙액·바이오 업사이클링으로 옆으로 빼는 카테고리 확장.
              </li>
            </ol>
          </div>
        ),
        source: 'Kawamoto T (2017) Japan\'s tuna market and consumption trends; (2026) Discussion',
      }}
    />
  );
}

// ───────────────────────────────────────────────────────────────────────────
// ⑥ 코호트 효과 × 인구 더블 쇼크
// ───────────────────────────────────────────────────────────────────────────

export function InsightCohortDoubleShock() {
  return (
    <WidgetCard
      title="코호트 × 인구 더블 쇼크 — 자연 회복 불가"
      icon={Users}
      iconColor="#a855f7"
      pillar="S5"
      cardDesc="1인당 소비(좌축, kg/인/년) × 일본 인구(우축, 백만 명) 동시 감소의 곱셈 효과 시각화. UN DESA 2024 + Kawamoto 감마 모델."
      telemetry={{ status: 'STATIC', syncDate: '2026-04-30' }}
      termTooltip={{
        term: '코호트 효과',
        description: '특정 세대(코호트)가 평생 유지하는 소비 성향. 일본 젊은 세대의 낮은 어류 소비는 나이가 들어도 회복되지 않고 평생 유지 — 세대교체로 하향 압력 가중.',
      }}
      kpiPanel={[
        {
          label: '2050 인구',
          value: '104.7 백만',
          sub: '▼ 2022 대비 -16%',
          trendColor: '#ef4444',
        },
        {
          label: '총수요 감소율',
          value: '-77%',
          sub: '1인당 × 인구 이중 충격',
          trendColor: '#ef4444',
        },
      ]}
      chartHeight={300}
      chart={
        <ComposedChart data={cohortShockData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
          <XAxis dataKey="연도" stroke="var(--w-slate-400)" />
          <YAxis yAxisId="left" stroke="#a855f7" unit=" kg" />
          <YAxis yAxisId="right" orientation="right" stroke="var(--w-amber-400)" unit=" 백만" />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.95)', border: 'none', borderRadius: '8px', color: 'var(--w-slate-50)' }} />
          <Legend />
          <Bar yAxisId="left" dataKey="일인당" name="1인당 소비 (kg/인/년)" fill="#a855f7" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="인구" name="일본 인구 (백만 명)" stroke="var(--w-amber-400)" strokeWidth={3} dot={{ r: 5 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: (
          <div>
            <p>
              <strong>코호트 효과</strong>란 특정 세대(예: 1980년대생)가 형성한 식습관이 평생 유지된다는 식품경제학 개념입니다. Kawamoto는 일본 사시미 수요 감소가 <strong>"고령화로 회복되는 일시적 현상"</strong>이 아닌 <strong>"세대교체로 더 악화되는 구조적 변화"</strong>임을 입증.
            </p>
            <p>
              1인당 소비량(자주색 막대): 2000년 5.5kg → 2050년 0.775kg <strong>(-86%)</strong>. 일본 총인구(노란 선): 2000년 1.268억 → 2050년 1.047억 <strong>(-17%)</strong>. <strong>두 축의 곱셈 효과</strong>: 총수요 2000년 698천 톤 → 2050년 81천 톤(국내 기준) — <strong>-88% 축소</strong>.
            </p>
            <p>
              일반 통념: "고령자가 생선을 더 먹으니 고령화는 수요 회복 요인". <strong>Kawamoto 검증 결과 기각</strong>. 젊은 세대 생선 소비 성향이 평생 유지되며 세대교체로 평균 소비량이 계속 하락. Mori &amp; Saegusa(2010), Birch(1999) 등 식품경제학 cohort 연구와 일치.
            </p>
          </div>
        ),
        actionPlan: (
          <div>
            <p>
              <strong>재정의</strong>: "일본 고령화로 사시미 수요 회복" 가설은 <strong>전사 사업계획에서 즉시 삭제</strong>. 이 가정에 기댄 일본 시장 회복 시나리오·투자 계획·M&amp;A 가격 평가는 모두 재검토.
            </p>
            <ol style={{ margin: '4px 0 0 18px', padding: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <strong>단기 (12개월)</strong>: <strong>일본 시장 회복 시나리오 폐기 감사</strong>. 사업계획·중기경영계획·이사회 보고서에서 "고령화 회복" 가정을 grep하여 제거. 신라교역 일본 자회사 valuation도 회복 가정 제외하고 재산정.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>중기 (3년)</strong>: Z세대 타깃 신제품 라인업 — <strong>컵 사시미동·델리 스시·HMR 회덮밥</strong>. 도쿄 도심 편의점·세븐&amp;아이 PB 채널 직진출. "사시미 = 전통 외식" 카테고리를 "사시미 = 편의 단백질"로 재정의.
              </li>
              <li>
                <strong>장기 (5~10년)</strong>: 일본 외 사시미 시장 <strong>"코호트 부상 단계"</strong> 국가 선점. 미국(밀레니얼·Z세대 일식 수용도 8~10%), 동남아 신중산층(태국·베트남·인도네시아), 중남미(브라질·멕시코 사시미 외식 부상기) — 이들의 1인당 소비가 현재 일본의 1990년대 진입 지점인 국가 우선 진출.
              </li>
            </ol>
          </div>
        ),
        source: 'Kawamoto T (2026) Discussion; Mori H, Saegusa Y (2010) Cohort effects in food consumption; UN DESA 2024 인구추계',
      }}
    />
  );
}
