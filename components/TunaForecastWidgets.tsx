/**
 * Forecast 3개 위젯 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 183줄 → After 135줄 (-26%, 3개 위젯 동시)
 */

'use client';
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity, Thermometer } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export function SkipjackForecastWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tuna-forecast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ species: 'skipjack' }) })
      .then((r) => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const sk = data?.skipjack;
  const chartData = [
    ...(sk?.historical || []).map((h: any) => ({ period: h.period, actual: h.actual, predicted: h.predicted })),
    ...(sk?.forecast || []).map((f: any) => ({ period: f.period, predicted: f.predicted, upper: f.upper_95, lower: f.lower_95 })),
  ];

  return (
    <WidgetCard
      title="가다랑어 방콕 산지가격 실측 + 단기 시나리오"
      icon={TrendingUp}
      iconColor="#FCD535"
      pillar="S1"
      cardDesc="Atuna skjbkk 분기 평균(실측) + 단기 시나리오 forecast — 호르무즈·WCPO·가공업체 저항 3요인 통합"
      unit="(단위: USD/MT)"
      telemetry={{ status: 'LIVE', syncDate: '/api/tuna-forecast' }}
      customBody={
        loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>예측 데이터 로딩 중...</div>
        ) : (
          <>
            <div style={{ height: 200 }}>
              <AreaChart width={680} height={200} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={['dataMin-200', 'dataMax+200']} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.75rem' }} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="#FCD535" fillOpacity={0.1} />
                <Area type="monotone" dataKey="lower" stroke="none" fill="#FCD535" fillOpacity={0.05} />
                <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="실제가격" />
                <Line type="monotone" dataKey="predicted" stroke="#FCD535" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="예측가격" />
              </AreaChart>
            </div>
            {sk?.forecast && (
              <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '8px' }}>
                {sk.forecast.map((f: any, i: number) => (
                  <div key={i} style={{ background: 'rgba(252,213,53,0.06)', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{f.period}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FCD535' }}>${f.predicted}</div>
                    <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>{f.driver?.slice(0, 15)}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      }
      takeaway={{
        situation: `<div>
<p><strong>Atuna 방콕 가다랑어 산지가격(skjbkk)</strong>은 글로벌 가다랑어 가격의 사실상 benchmark. 모든 가공사의 매입 의사결정 기준점.</p>
<p>최근 6분기 실측(분기 평균 FOB Bangkok):</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li>2025-Q1: <strong>$1,650</strong></li>
<li>2025-Q2: <strong>$1,510</strong> (저점)</li>
<li>2025-Q3: <strong>$1,565</strong></li>
<li>2025-Q4: <strong>$1,609</strong></li>
<li>2026-Q1: <strong>$1,662</strong></li>
<li>2026-Q2: <strong>$2,008</strong> (위기 정점, 저점 대비 <strong>+33%</strong>)</li>
</ul>
<p>3중 충격 (2026-Q2 동시 발생): ① <strong>호르무즈 봉쇄</strong>(2026-02말) MGO $2,000 돌파, 어획 cost 68% 잠식 ② <strong>슈퍼 엘니뇨</strong> 1Q26 WCPO -22%(-39,000톤) ③ <strong>가공업체 저항</strong> 태국 캐너 $2,000 저항선 관망세로 추가 상승 차단.</p>
<p>3분기 forecast 시나리오(차트의 점선): <strong>2026-Q3 $1,950</strong> (호르무즈 봉쇄 부분 정상화) → <strong>2026-Q4 $1,800</strong> (인도양 공급 회복 + WCPO 어획 회복) → <strong>2027-Q1 $1,700</strong> (평시 회귀, 가공업체 매입 재개). 단 95% 신뢰구간 ±$150 변동성.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 산지가격 trading은 reactive cost management가 아닌 <strong>"systematic trading book"</strong>. Atuna 분기 평균 + 호르무즈·WCPO·태국 가공업체 3개 변수의 mathematical model로 매입 의사결정 자동화.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>2026-Q3 박스권 매입 ($1,800~$2,100)</strong>: forecast 중심값 $1,950 기준 ±7.5% 박스 하단 분할 매입. $2,050+ 호가는 회피, $1,850 이하 적극 매수. 평균 매입가 $1,900 타게팅.</li>
<li style="margin-bottom: 8px;"><strong>인도양 대체 공급선 확대</strong>: 2026-Q2 위기 시점 WCPO 비중 65% → 48%로 이미 -17%p 이동 완료. 2026-Q4 인도양 회복 가시화 시 비중을 평시 25%로 점진 복귀, 그러나 인도양 라이센스는 forward 유지로 옵션 가치 보존.</li>
<li><strong>2027-Q1 $1,700 회귀 시 6개월 forward 락업</strong>: forecast 중심값에서 ±5% 박스권 진입 시 12개월 forward 매입 계약 체결. 평시 단가 $1,700 락업으로 다음 사이클 매입원가 visibility 확보. JP Morgan Commodity Desk와 OTC swap으로 paper hedge 결합 — 실물 long + paper short 양방향 운용.</li>
</ol>
</div>`,
        source: 'Atuna 분기 평균 실측(skjbkk 2025-Q1~2026-Q2) + 3분기 시나리오 forecast · /api/tuna-forecast · WCPFC 1Q26 어획량 통계',
      }}
    />
  );
}

export function EnsoCorrelationWidget() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/tuna-forecast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ species: 'all', include_enso: true }) })
      .then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  const enso = data?.enso_correlation;
  const chartData = enso?.historical_impact?.map((h: any) => ({
    phase: h.enso_phase.split('(')[0].trim(),
    skipjack: h.skipjack_catch_change,
    yellowfin: h.yellowfin_catch_change,
  })) || [];

  return (
    <WidgetCard
      title="ENSO-어획량 상관관계 분석기"
      icon={Thermometer}
      iconColor="#06b6d4"
      pillar="S1"
      cardDesc="NOAA ENSO Index와 가다랑어·황다랑어 어획량의 5단계 위상별 상관 — La Niña/El Niño/Neutral 별 가격 영향"
      unit="(단위: 어획량 변동 %)"
      telemetry={{ status: 'LIVE', syncDate: 'NOAA ENSO Index' }}
      kpiPanel={[
        { label: '현재 ENSO', value: enso?.current_enso?.phase || '로딩 중...', sub: `Index: ${enso?.current_enso?.index ?? 'N/A'}`, trendColor: '#06b6d4' },
        { label: '전망', value: enso?.forecast?.slice(0, 24) || '...', trendColor: '#FCD535' },
      ]}
      chartHeight={180}
      chart={
        <BarChart data={chartData}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="phase" tick={{ fill: '#94a3b8', fontSize: 9 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
          <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
          <Bar dataKey="skipjack" fill="#FCD535" name="가다랑어" radius={[4, 4, 0, 0]} />
          <Bar dataKey="yellowfin" fill="#06b6d4" name="황다랑어" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p><strong>ENSO(El Niño-Southern Oscillation)</strong>는 태평양 적도 수온 변화 주기. <strong>엘니뇨(El Niño)</strong>는 평균보다 따뜻해지고 <strong>라니냐(La Niña)</strong>는 차가워지는 현상, 그 중간이 <strong>Neutral</strong>. NOAA가 매월 ONI(Oceanic Niño Index)로 측정·공시.</p>
<p>참치 어획과 ENSO의 관계: 가다랑어는 따뜻한 표층수에 모이는 어종. 라니냐 → Neutral 전환기에 가다랑어가 더 깊은 수심으로 분산되며 어획 효율(CPUE) 일시 하락. 과거 10년 데이터: <strong>La Niña→Neutral 전환기에 WCPO 가다랑어 -5~-8% 감소 + 산지가격 +10~12% 상승</strong> 패턴 반복.</p>
<p>현재 상황: <strong>2025 후반 약 La Niña → 2026 초 Neutral로 이미 전환 완료</strong>(NOAA 기준). 즉 ENSO 충격은 이미 가격에 반영된 상태.</p>
<p>중요한 caveat: <strong>2026 Q2 현재 가격 변동성의 1차 변수는 ENSO가 아닌 호르무즈 봉쇄 외생 MGO 충격</strong>. ENSO 시그널만 보고 매입 결정하면 호르무즈 변수를 놓침 — 두 변수 동시 모니터링 필수.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: ENSO 분석은 중장기(6~24개월) 어장 시그널이며 단기 매입은 호르무즈 변수가 dominant. <strong>"Time-horizon별 변수 분리 trading"</strong>으로 두 신호를 독립적으로 활용.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>단기 (2~4주 매입)</strong>: 호르무즈 정상화 여부가 1차 시그널. ENSO는 무시. 박스권 trading.</li>
<li style="margin-bottom: 8px;"><strong>중기 (6~12개월 capacity 계획)</strong>: <strong>WCPO 단일 의존 → 4-RFMO 분산</strong>. ICCAT(대서양) 쿼터 추가 + 인도양(IOTC) 대체 공급선 확대 병행.</li>
<li><strong>장기 (5~7년 capex)</strong>: <strong>지중해 참다랑어(BFT) 축양 투자</strong>를 ENSO 영향 없는 분리 트랙으로 운영. 호주 SBT 양식도 동시 진입. ENSO와 무관한 양식 capacity 확보로 climate beta 헷지.</li>
</ol>
</div>`,
        source: 'NOAA ENSO Index · FAOSTAT FishStatJ · WCPFC/IOTC 조업통계 · Atuna 2026-Q2 시세',
      }}
    />
  );
}

export function LandingCostSensitivity() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/tuna-forecast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ include_sensitivity: true }) })
      .then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  const scenarios = data?.landing_cost_sensitivity?.scenarios || [];

  return (
    <WidgetCard
      title="환율-착지원가 민감도 분석"
      icon={Activity}
      iconColor="#a78bfa"
      pillar="S3"
      cardDesc="ECOS 환율 + KCS 통관 시나리오로 5가지 변수(원화 약세·강세·유가 급등·관세 인상)별 착지원가 시뮬레이션"
      unit="(단위: ₩/kg)"
      telemetry={{ status: 'LIVE', syncDate: 'ECOS + KCS API' }}
      customBody={
        <div style={{ display: 'grid', gap: '6px' }}>
          {scenarios.map((s: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: s.change_pct === 0 ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: s.change_pct === 0 ? '1px solid rgba(167,139,250,0.3)' : '1px solid transparent' }}>
              <span style={{ fontSize: '0.75rem', color: '#f8fafc', fontWeight: s.change_pct === 0 ? 700 : 400, flex: 1 }}>{s.name}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#f8fafc' }}>₩{s.landing_cost_won_kg?.toLocaleString()}/kg</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: s.change_pct > 0 ? '#ef4444' : s.change_pct < 0 ? '#22c55e' : '#a78bfa', minWidth: '50px', textAlign: 'right' }}>
                {s.change_pct > 0 ? '+' : ''}{s.change_pct}%
              </span>
            </div>
          ))}
        </div>
      }
      takeaway={{
        situation: `<div>
<p>"착지원가(Landed Cost)"란 수입 원물이 한국 항구에 도착했을 때의 최종 원가. 매입가 + 운임 + 보험 + 관세 + 환율 등 모든 변수의 합. 우리 마진의 가장 큰 input variable.</p>
<p>2개 핵심 시나리오 영향:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>미국 301 관세 시나리오</strong>: 미국이 한국 가공품에 301조 관세 부과 시 착지매입원가 <strong>+20% 급등</strong>. 마진 -8~12%p 직접 압박.</li>
<li><strong>원화 약세 시나리오</strong>: USD/KRW 환율 ₩1,385 → ₩1,450(₩65 추가 절하) 시 kg당 약 <strong>₩420 매입원가 상승</strong>, 추가 마진 -5.1%p 압축.</li>
</ul>
<p>의미: 두 시나리오가 동시 발생 시(미국 정치 불확실성 + 한국 경상수지 악화 결합 가능) 마진 -13~17%p의 catastrophic 시나리오. 본사 EBITDA 마진 8%면 사실상 적자 전환.</p>
<p>현재 visibility: ① 미국 USTR이 한국 가공품 301조 검토 중(2026 하반기 결정) ② 한국 경상수지 적자 누적으로 KRW 약세 압력 지속. 두 트리거가 12~18개월 내 동시 발동 가능성 20~30%.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 착지원가는 단순 회계 변수가 아닌 <strong>"3중 외생 충격에 노출된 derivative position"</strong>. 본사 risk desk가 매주 환율·관세·운임을 종합 모니터링해 자동 헷지 발동.</p>
<p><strong>3중 방어 전략</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>환율 헷지</strong>: 3개월 선물환 계약으로 <strong>₩1,400 이하 락인</strong>. 매입 물량의 70% hedge, 30% spot 노출 — 환율 변동성 ±10% 한도 내로 제한.</li>
<li style="margin-bottom: 8px;"><strong>FTA 우회</strong>: 한-ASEAN FTA로 <strong>태국 경유 관세 0%</strong> 활용. 미국 301 관세 시나리오 발동 시 즉시 supply route를 한국 직수출 → 태국→미국으로 자동 우회. 관세 부담 0.</li>
<li><strong>ECOS/KCS API 실시간 모니터링 자동화 프로토콜</strong>: 한국은행 ECOS + 관세청 KCS API로 환율·관세 변동을 실시간 catch. 임계치 돌파 시 본사 risk desk에 자동 alert + 헷지 instrument 자동 발동. JP Morgan FX·관세 desk와 결합해 24/7 monitoring.</li>
</ol>
</div>`,
        source: '한국은행 ECOS API · 관세청 KCS API · FTA 관세양허표',
      }}
    />
  );
}

export default SkipjackForecastWidget;
