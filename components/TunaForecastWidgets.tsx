/**
 * Forecast 3개 위젯 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 183줄 → After 135줄 (-26%, 3개 위젯 동시)
 */

'use client';
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity, Thermometer } from 'lucide-react';
import WidgetCard from './WidgetCard';

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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '8px' }}>
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
        situation: 'Atuna 방콕 가다랑어 산지가격 실측은 2025-10 $1,700 → 2025-12 $1,500 저점 → 2026-04 $2,100 위기 정점 → 2026-05 $1,975로 진정 국면. 동시 충격 요인: (1) 2026-02말 호르무즈 봉쇄 위기로 MGO 톤당 $2,000 돌파, 어획 비용의 약 68% 잠식. (2) 슈퍼 엘니뇨로 1Q26 WCPO -22%(-39,000톤) 급감. 태국 가공업체들이 $2,000 저항선에서 관망세로 돌아서며 추가 상승 차단.',
        actionPlan: '(a) 인도양(IOTC) 대체 공급선(몰디브·세이셸·인도·필리핀) 비중 확대로 WCPO 단일 의존도 낮춤. (b) 호르무즈 리스크 해소 전까지 단기 매입은 2~4주 단위로 분할해 $2,000+ 호가 회피. 가공업체 관망세 유지 시 1,950~2,050 박스권이 6~8주 지속 가능 — 박스 하단 분할 매입이 안전.',
        source: 'Atuna 가격 데이터(skjbkk 2025-10~2026-05) · Atuna May 2026 News 6 sources · WCPFC 2024-25 어획량 통계',
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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="phase" tick={{ fill: '#94a3b8', fontSize: 9 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
          <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
          <Bar dataKey="skipjack" fill="#FCD535" name="가다랑어" radius={[4, 4, 0, 0]} />
          <Bar dataKey="yellowfin" fill="#06b6d4" name="황다랑어" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: '2025 후반 약 La Niña → 2026 초 Neutral로 ENSO가 이미 전환 완료(NOAA 기준). 과거 10년 데이터에서 La Niña→Neutral 전환기에 서태평양 가다랑어 -5~-8% 감소 + 산지가격 +10~12% 상승 패턴 반복. 다만 2026-Q2 현재 가격 변동성의 1차 변수는 ENSO가 아닌 호르무즈 봉쇄 외생 MGO 충격.',
        actionPlan: 'WCPO 단일 의존을 낮추는 방향은 유효하나, 단기(2~4주) 매입 의사결정의 1차 시그널은 호르무즈 정상화 여부. ICCAT(대서양) 쿼터 추가 + 인도양(IOTC) 대체 공급선 확대 병행. 지중해 참다랑어 축양 투자는 5~7년 중장기 분리 트랙으로 운영.',
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
        situation: '미국 301 관세 시나리오 시 착지매입원가 +20% 급등. 원화 약세(₩1,450/USD) 시나리오에서는 추가 마진 5.1%p 압축. 현재 기준환율(₩1,385) 대비 ₩65 추가 절하 시 kg당 약 ₩420의 매입원가 상승 불가피.',
        actionPlan: '3중 방어 전략: ① 환율 헷지(3개월 선물환 계약으로 ₩1,400 이하 락인), ② FTA 우회(한-ASEAN FTA로 태국 경유 관세 0%), ③ ECOS/KCS API 실시간 모니터링으로 변동 즉시 대응 프로토콜.',
        source: '한국은행 ECOS API · 관세청 KCS API · FTA 관세양허표',
      }}
    />
  );
}

export default SkipjackForecastWidget;
