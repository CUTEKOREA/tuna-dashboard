/**
 * KMI FTA 참다랑어 수입 인사이트 (3 widgets)
 *
 * 데이터 출처: 한국해양수산개발원(KMI) "FTA 체결국 수산물 수입동향" 분기보고서
 * 추출 기간: 2021 Q1 ~ 2026 Q1 (21개 분기)
 * 원본 raw: data/tuna/processed_data/kmi_fta_bluefin_2021_2026.json (3,266 lines)
 * 추출일: 2026-05-27
 *
 * 위젯:
 *  ① 연도별 수입량·단가 V자 반등 (2021~2026 YTD)
 *  ② 공급국 지각변동 — EU → 튀르키예·모로코 (2024 vs 2025)
 *  ③ 2026 Q1 신호: 프랑스 +240%, 국내 양식 +667%
 */

'use client';
import React from 'react';
import {
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { TrendingDown, Globe2, Zap } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

// ───────────────────────────────────────────────────────────────────────────
// ① 연도별 수입량·단가 — V자 붕괴와 반등
// ───────────────────────────────────────────────────────────────────────────

const yearlyData = [
  { 연도: '2021', 수입량: 6122, 단가: 23.8, 수입액: 145.6 },
  { 연도: '2022', 수입량: 7879, 단가: 27.2, 수입액: 214.1 },
  { 연도: '2023', 수입량: 7447, 단가: 34.1, 수입액: 254.2 }, // 단가 정점
  { 연도: '2024', 수입량: 5510, 단가: 20.2, 수입액: 111.3 }, // -26% 붕괴
  { 연도: '2025', 수입량: 7281, 단가: 21.2, 수입액: 154.0 }, // +32% V자 반등
  { 연도: '2026E', 수입량: 9848, 단가: 25.5, 수입액: 251.1 }, // 2026 Q1 ×4 단순 연환산
];

export function InsightKmiBluefinYearly() {
  return (
    <WidgetCard
      title="참다랑어 수입 V자 반등 (FTA 5년)"
      icon={TrendingDown}
      iconColor="#38bdf8"
      pillar="S4"
      cardDesc="KMI FTA 체결국 수산물 수입동향 분기보고서 — 참다랑어 연도별 수입량(좌, 톤) + 단가(우, USD/kg). 2026E는 Q1 실적 연환산."
      telemetry={{ status: 'STATIC', syncDate: '2026 Q1 기준' }}
      termTooltip={{
        term: 'V자 반등',
        description: '2023년 단가 정점($34.1/kg) → 2024년 물량·단가 동시 붕괴(-26%) → 2025년 +32% 반등의 사이클 패턴. 지중해 TAC 확대 + 축양(ranching) 출하 본격화가 회복 동인.',
      }}
      kpiPanel={[
        {
          label: '2023 단가 정점',
          value: '$34.1/kg',
          sub: '대서양 참다랑어 부족 충격',
          trendColor: '#ef4444',
        },
        {
          label: '2024 물량 붕괴',
          value: '-26%',
          sub: '재고 누적·수요 위축',
          trendColor: '#ef4444',
        },
        {
          label: '2025 V자 반등',
          value: '+32%',
          sub: '튀르키예·모로코 견인',
          trendColor: '#10b981',
        },
      ]}
      chartHeight={300}
      chart={
        <ComposedChart data={yearlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="연도" stroke="#94a3b8" />
          <YAxis yAxisId="left" stroke="#38bdf8" />
          <YAxis yAxisId="right" orientation="right" stroke="#fbbf24" unit="$" />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
          <Legend />
          <Bar yAxisId="left" dataKey="수입량" name="수입량 (톤)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="단가" name="단가 (USD/kg)" stroke="#fbbf24" strokeWidth={3} dot={{ r: 5 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: (
          <div>
            <p>
              <strong>참다랑어(Bluefin Tuna)</strong>는 사시미용 최고급 어종으로, 한국은 거의 100%를 수입에 의존합니다. KMI는 FTA 체결국으로부터의 분기별 수입 흐름을 5년간 추적해왔습니다.
            </p>
            <p>
              5년 흐름은 <strong>전형적인 commodity 사이클</strong>입니다. 2021~2022년 코로나 회복기 수요 증가로 물량 +29%(6,122 → 7,879톤). 2023년 대서양 참다랑어(ABF) CCSBT/ICCAT 쿼터 부족 + 일본 수요 회복으로 단가 <strong>$34.1/kg 정점</strong> 도달. 이 가격에 한국 수입상이 재고 누적 → 2024년 <strong>물량 -26%(5,510톤) + 단가 -41%($20.2/kg) 동시 붕괴</strong>.
            </p>
            <p>
              2025년 V자 반등(+32%, 7,281톤) 동인: ① 지중해 ICCAT TAC 확대(36,000톤 → 40,570톤, +12.7%), ② 튀르키예·모로코 축양(ranching) 출하 본격화, ③ 단가 안정($21.2/kg)으로 한국 수입상 매입 재개. <strong>2026 Q1 누적 2,462톤(+7.6% YoY) 연환산 9,848톤</strong>으로 사상 최고치 경신 시나리오 진입.
            </p>
          </div>
        ),
        actionPlan: (
          <div>
            <p>
              <strong>재정의</strong>: 참다랑어 수입은 사이클 변동성이 큰 commodity 사업이 아니라, <strong>"한국 사시미 외식 산업의 정점기 가격 흡수 능력"</strong>이 결정하는 시장. $34/kg에서 매출 보전한 수입상과 못한 수입상의 5년 누적 ROIC는 ±10%p 격차.
            </p>
            <ol style={{ margin: '4px 0 0 18px', padding: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <strong>단기 (90일)</strong>: 2026년 단가 $25.5/kg는 V자 반등 후 상승 진입 — 지금이 <strong>2026~2027 물량 락인 시점</strong>. 튀르키예·모로코 산 우선, 3분기 물량을 take-or-pay 계약.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>중기 (12~24개월)</strong>: 단가 변동성 헤지로 <strong>국내 최초 참다랑어 선물·옵션 OTC 데스크</strong> 신라교역 내 신설. Bangkok skipjack benchmark처럼 KMI 분기 데이터를 자체 price index로 발행해 시장 기준점 선점.
              </li>
              <li>
                <strong>장기 (3~5년)</strong>: 통영·욕지 PBF 양식 capacity 확장 — 2026 Q1 국내 생산이 <strong>+667%(15→114톤)</strong> 폭증 신호. 한국이 일본·호주 의존도를 줄이고 자체 공급 25%까지 끌어올리면 마진 +800bp 흡수.
              </li>
            </ol>
          </div>
        ),
        source: 'KMI 한국해양수산개발원 — FTA 체결국 수산물 수입동향 (2021 Q1~2026 Q1)',
      }}
    />
  );
}

// ───────────────────────────────────────────────────────────────────────────
// ② 공급국 지각변동 — EU → 튀르키예·모로코
// ───────────────────────────────────────────────────────────────────────────

const supplyShiftData = [
  { 국가: '튀르키예', '2024': 19.0, '2025': 33.9, 변화: '+14.9%p' },
  { 국가: '모로코', '2024': 12.2, '2025': 18.7, 변화: '+6.5%p' },
  { 국가: '이탈리아', '2024': 17.8, '2025': 13.2, 변화: '-4.6%p' },
  { 국가: '프랑스', '2024': 12.8, '2025': 8.5, 변화: '-4.3%p' },
  { 국가: '스페인', '2024': 12.2, '2025': 7.4, 변화: '-4.8%p' },
];

export function InsightKmiBluefinSupplyShift() {
  return (
    <WidgetCard
      title="공급국 지각변동 — EU → 튀르키예·모로코"
      icon={Globe2}
      iconColor="#0e7490"
      pillar="S4"
      cardDesc="참다랑어 수입 점유율 2024 vs 2025 비교 — 단위 (%, 수입량 기준). EU 3국이 잃은 13.7%p를 튀르키예·모로코가 21.4%p 흡수."
      telemetry={{ status: 'STATIC', syncDate: '2025 Q4 누적' }}
      termTooltip={{
        term: '지각변동',
        description: '2021년 EU(스페인·프랑스·이탈리아) 합산 ~55% 지배 구조였으나, 2025년 튀르키예·모로코 합산 52.6%로 역전. 양국 모두 지중해 ICCAT 쿼터 신규 배정 + 축양 시설 확대로 부상.',
      }}
      kpiPanel={[
        {
          label: '튀르키예 점유',
          value: '33.9%',
          sub: '▲ 2024 대비 +14.9%p (+135%)',
          trendColor: '#10b981',
        },
        {
          label: 'EU 3국 합산',
          value: '29.1%',
          sub: '▼ 2024 대비 -13.7%p',
          trendColor: '#ef4444',
        },
      ]}
      chartHeight={300}
      chart={
        <BarChart data={supplyShiftData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="국가" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" unit="%" />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
          <Legend />
          <Bar dataKey="2024" name="2024년 점유율 (%)" fill="#64748b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="2025" name="2025년 점유율 (%)" radius={[4, 4, 0, 0]}>
            {supplyShiftData.map((entry, i) => (
              <Cell key={i} fill={['튀르키예', '모로코'].includes(entry.국가) ? '#10b981' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      }
      takeaway={{
        situation: (
          <div>
            <p>
              한국 참다랑어 수입의 <strong>공급국 구조가 1년 만에 재편</strong>됐습니다. 2024년까지 EU(스페인·프랑스·이탈리아 합산 42.8%)가 주력 공급원이었으나, 2025년 <strong>튀르키예 33.9% + 모로코 18.7% = 52.6%</strong>로 두 신흥국이 EU를 추월.
            </p>
            <p>
              증가율은 더 극적: <strong>튀르키예 +135.5% / 모로코 +102.7%</strong> (전년 대비 물량). 동시에 EU 3국은 합산 -32%. <strong>대체가 아닌 가격 우위 잠식</strong>입니다 — 튀르키예 산 냉동 피레트 단가 $21.2/kg vs EU 산 $23.3/kg로 EU 산이 10%+ 비싸짐.
            </p>
            <p>
              구조적 배경: ① ICCAT 동지중해 TAC 배정에서 튀르키예 쿼터 신규 확대(2024년 1,022톤 → 2025년 2,470톤), ② 모로코는 축양(ranching) 설비 신증설로 출하 사이클 확보, ③ EU 산은 자국 사시미 내수(스페인·프랑스 외식) 우선 공급으로 한국향 가용량 축소.
            </p>
          </div>
        ),
        actionPlan: (
          <div>
            <p>
              <strong>재정의</strong>: 튀르키예·모로코의 부상은 일회성이 아닌 <strong>"동지중해 축양 산업의 한국향 직배송 인프라 구축 완료"</strong> 신호. 향후 3년 EU 비중은 25% 이하로 추가 하락 가능.
            </p>
            <ol style={{ margin: '4px 0 0 18px', padding: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <strong>단기 (6개월)</strong>: 튀르키예 Sinop·İzmir 축양사 mid-tier 2~3곳과 <strong>직거래 라인 개설</strong> + EU 도매업자 마진 흡수. 현재 EU 경유 시 +12% 중간 마진 절감 가능.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>중기 (12~24개월)</strong>: <strong>모로코 Tanger 축양사 minority equity 5~10% 인수</strong> ($3~6M). 2026~2027 출하 capacity 가시화 시점에서 자본 게이트 통과 우선권 확보.
              </li>
              <li>
                <strong>장기 (3~5년)</strong>: 한국이 일본·호주 의존(전통) → 지중해 신흥(현재) → <strong>한국 자체 양식(2030+)</strong> 3단계 전환. 2026 Q1 국내 생산 +667% 폭증 신호 활용해 부산·통영 PBF 양식 산업 합작 진출.
              </li>
            </ol>
          </div>
        ),
        source: 'KMI 한국해양수산개발원 — FTA 체결국 수산물 수입동향 (2024 Q4, 2025 Q4 누적)',
      }}
    />
  );
}

// ───────────────────────────────────────────────────────────────────────────
// ③ 2026 Q1 신호 — 프랑스 +240%, 국내 양식 +667%
// ───────────────────────────────────────────────────────────────────────────

const q1SignalData = [
  { 항목: '프랑스 수입', 변화율: 239.9, 절대치: '236 → 815톤', 색: '#ef4444' },
  { 항목: '국내 양식 생산', 변화율: 667.7, 절대치: '15 → 114톤', 색: '#10b981' },
  { 항목: '튀르키예 수입', 변화율: 19.4, 절대치: '점유율 33.9 → 19.4%', 색: '#fbbf24' },
  { 항목: '전체 수입량', 변화율: 7.6, 절대치: '2,288 → 2,462톤', 색: '#38bdf8' },
];

export function InsightKmiBluefin2026Signal() {
  return (
    <WidgetCard
      title="2026 Q1 시그널 — 프랑스 폭증·국내 양식 발진"
      icon={Zap}
      iconColor="#ef4444"
      pillar="S4"
      cardDesc="2026년 1~3월 누적 vs 2025년 동기간 변화율. 단위 (%, YoY). 프랑스 +240% 폭증과 국내 양식 +667%가 가장 큰 시그널."
      telemetry={{ status: 'STATIC', syncDate: '2026 Q1 (1~3월)' }}
      termTooltip={{
        term: 'Q1 시그널',
        description: '한 분기 변화가 직전 연도 트렌드를 깨는 비정상 신호. 2026 Q1은 (1) 프랑스 +240% — 1Q EU 비중 회복 가능성, (2) 국내 양식 +667% — 한국 PBF 양식 산업 발진, 두 가지가 동시 발생.',
      }}
      kpiPanel={[
        {
          label: '프랑스 수입 폭증',
          value: '+240%',
          sub: '236 → 815톤',
          trendColor: '#ef4444',
        },
        {
          label: '국내 양식 폭증',
          value: '+667%',
          sub: '15 → 114톤',
          trendColor: '#10b981',
        },
      ]}
      chartHeight={300}
      chart={
        <BarChart data={q1SignalData} margin={{ top: 20, right: 30, left: 80, bottom: 5 }} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis type="number" stroke="#94a3b8" unit="%" />
          <YAxis dataKey="항목" type="category" stroke="#94a3b8" width={120} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
          <Bar dataKey="변화율" name="2026 Q1 변화율 (%, YoY)" radius={[0, 4, 4, 0]}>
            {q1SignalData.map((entry, i) => (
              <Cell key={i} fill={entry.색} />
            ))}
          </Bar>
        </BarChart>
      }
      takeaway={{
        situation: (
          <div>
            <p>
              2026 Q1(1~3월) 누적 데이터에서 두 가지 <strong>비정상 시그널</strong>이 동시 포착됐습니다. 첫째 <strong>프랑스 수입 +239.9%</strong>(236톤 → 815톤): 2025년 점유 8.5%였던 프랑스가 2026 Q1에 <strong>점유율 34.2%로 1위 점프</strong>. 둘째 <strong>국내 양식 생산 +667.7%</strong>(15톤 → 114톤): 한국 부산·통영 PBF 양식 산업 본격 출하 진입.
            </p>
            <p>
              프랑스 폭증의 원인 가설: ① 2025년 EU 산이 한국향 가용량 부족이었던 게 2026 ICCAT 쿼터 재배정으로 해소, ② 튀르키예·모로코 산이 일본·중국향으로 수출 전환 가능성, ③ EU 산 단가 인하($23.3 → 약 $20대 추정).
            </p>
            <p>
              국내 양식 폭증은 더 구조적 함의가 큼: 통영·욕지 PBF 종묘·치어 기술이 일본 의존을 벗어나 자체 cycle에 진입한 가시적 신호. 절대 규모는 작지만(114톤은 전체 수입 4.6% 수준), <strong>YoY +667%는 산업 발진(takeoff) 단계</strong>를 시사.
            </p>
          </div>
        ),
        actionPlan: (
          <div>
            <p>
              <strong>재정의</strong>: 2026 Q1은 단순 분기 데이터가 아니라 <strong>"한국 참다랑어 시장이 수입 100% 의존에서 양식 자급 단계로 진입한 분기"</strong>로 기록될 가능성. 향후 12개월 데이터로 검증 필수.
            </p>
            <ol style={{ margin: '4px 0 0 18px', padding: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <strong>단기 (즉시)</strong>: 프랑스 +240% 폭증이 1회성 vs 트렌드인지 <strong>2026 Q2 데이터까지 60일 모니터링 KPI 설정</strong>. 1회성이면 EU 도매가 인하 베팅, 트렌드면 EU 직거래 라인 재가동.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>중기 (6~12개월)</strong>: 국내 양식 +667% 검증 — 통영·욕지 PBF 양식 본격 출하 시 <strong>신라교역의 "국내산 사시미용 참다랑어" 프리미엄 채널 신설</strong>. 일본산 의존 호텔·고급 외식(롯데호텔·신라호텔 등)에 단독 직거래 제안.
              </li>
              <li>
                <strong>장기 (3년)</strong>: 한국이 2030년 PBF 양식 자급률 25% 도달 시 <strong>일본·호주·튀르키예·모로코 4국 의존 구조 → 자급 + 1국(튀르키예) 단일 의존으로 단순화</strong>. 신라교역은 통영·욕지 양식사 인수 후 일본 사시미 시장 역수출 (Kawamoto 2026 1인당 0.78kg 시나리오 활용).
              </li>
            </ol>
          </div>
        ),
        source: 'KMI 한국해양수산개발원 — FTA 체결국 수산물 수입동향 (2026 Q1)',
      }}
    />
  );
}
