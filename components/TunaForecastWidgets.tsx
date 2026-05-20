'use client';
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity, Thermometer } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './TunaInsightsDashboard.module.css';
import TakeawayBox from './TakeawayBox';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


export function SkipjackForecastWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tuna-forecast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ species: 'skipjack' }) })
      .then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const sk = data?.skipjack;
  const chartData = [
    ...(sk?.historical || []).map((h: any) => ({ period: h.period, actual: h.actual, predicted: h.predicted })),
    ...(sk?.forecast || []).map((f: any) => ({ period: f.period, predicted: f.predicted, upper: f.upper_95, lower: f.lower_95 })),
  ];

  
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <TrendingUp size={18} style={{ color: '#FCD535' }} />
          가다랑어 방콕 산지가격 실측 + 단기 시나리오
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>(단위: USD/MT)</span>
        </h3>
      </div>
      <div className={styles.cardBody} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
      {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading forecast...</div> : (
        <>
          <SafeResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="period" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} domain={['dataMin-200', 'dataMax+200']} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.75rem' }} />
              <Area type="monotone" dataKey="upper" stroke="none" fill="#FCD535" fillOpacity={0.1} />
              <Area type="monotone" dataKey="lower" stroke="none" fill="#FCD535" fillOpacity={0.05} />
              <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="실제가격" />
              <Line type="monotone" dataKey="predicted" stroke="#FCD535" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="예측가격" />
            </AreaChart>
          </SafeResponsiveContainer>
          {sk?.forecast && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '8px' }}>
              {sk.forecast.map((f: any, i: number) => (
                <div key={i} style={{ background: 'rgba(252,213,53,0.06)', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{f.period}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FCD535' }}>${f.predicted}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>{f.driver?.slice(0, 15)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <TakeawayBox
        situation="Atuna 방콕 가다랑어 산지가격 실측은 2025-10 $1,700 → 2025-12 $1,500 저점 → 2026-04 $2,100 위기 정점 → 2026-05 $1,975로 진정 국면입니다. 동시 충격 요인 두 가지: (1) 2026-02말 호르무즈 해협 봉쇄 위기로 MGO(해상 경유)가 톤당 $2,000을 돌파, 어획 비용의 약 68%를 잠식. (2) 슈퍼 엘니뇨로 1Q26 WCPO 어획량이 전년 동기 대비 -22%(-39,000톤) 급감. 태국 가공업체들이 $2,000 저항선에서 관망세로 돌아서며 가격 추가 상승을 차단 중입니다."
        actionPlan="(a) 인도양(IOTC) 대체 공급선(몰디브·세이셸·인도·필리핀) 비중을 확대해 WCPO 단일 의존도를 낮추고, (b) 호르무즈 리스크가 해소되지 않는 동안 단기 매입은 2~4주 단위로 분할해 $2,000+ 호가 노출을 회피합니다. 가공업체 관망세가 유지되는 한 1,950~2,050 박스권이 6~8주 지속될 가능성이 높으며, 박스 하단에서 분할 매입이 안전합니다."
        source="Atuna 가격 데이터(skjbkk 2025-10~2026-05) · 노트북 'Atuna May 2026 News' 6 sources · WCPFC 2024-25 어획량 통계"
      />
      </div>
    </div>
  );
}

export function EnsoCorrelationWidget() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/tuna-forecast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ species: 'all', include_enso: true }) })
      .then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const enso = data?.enso_correlation;
  const chartData = enso?.historical_impact?.map((h: any) => ({
    phase: h.enso_phase.split('(')[0].trim(),
    skipjack: h.skipjack_catch_change,
    yellowfin: h.yellowfin_catch_change,
  })) || [];

  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Thermometer size={18} style={{ color: '#06b6d4' }} />
          [기후 분석] ENSO-어획량 상관관계 분석기
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>(단위: 어획량 변동 %)</span>
        </h3>
      </div>
      <div className={styles.cardBody} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <div style={{ background: 'rgba(6,182,212,0.1)', borderRadius: '8px', padding: '10px 16px', textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '0.65rem', color: '#67e8f9' }}>현재 ENSO</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#06b6d4' }}>{enso?.current_enso?.phase || 'Loading...'}</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Index: {enso?.current_enso?.index || 'N/A'}</div>
        </div>
        <div style={{ background: 'rgba(252,213,53,0.1)', borderRadius: '8px', padding: '10px 16px', textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '0.65rem', color: '#fde68a' }}>전망</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#FCD535' }}>{enso?.forecast?.slice(0, 30) || '...'}</div>
        </div>
      </div>
      <SafeResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="phase" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
          <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} unit="%" />
          <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
          <Bar dataKey="skipjack" fill="#FCD535" name="가다랑어" radius={[4, 4, 0, 0]} />
          <Bar dataKey="yellowfin" fill="#06b6d4" name="황다랑어" radius={[4, 4, 0, 0]} />
        </BarChart>
      </SafeResponsiveContainer>
      <TakeawayBox
        situation="현재 La Niña(약) 위상이 2025 하반기 Neutral로 전환될 전망입니다. 과거 10년 데이터 분석 결과, 이 전환기에 서태평양 가다랑어 어획량이 -5~-8% 감소하고, 산지가격은 +12% 상승하는 패턴이 반복되었습니다. 황다랑어는 상대적으로 영향이 적으나(-2~3%), 인도양 해역에서는 반대 패턴을 보여 지역별 차별화 전략이 필요합니다."
        actionPlan="[기후 헷지 포트폴리오] ① WCPO 의존도(Exposure)를 낮추기 위해 대서양(ICCAT) 쿼터 추가 확보, ② 가격 상승기 대비 Q2 선제 재고 확보(3개월분), ③ 중장기적으로 지중해 참다랑어 축양 투자를 통한 기후 독립적 공급원 구축을 병행 추진해야 합니다."
        source="NOAA ENSO Index · FAOSTAT FishStatJ · WCPFC/IOTC 조업통계 상관분석"
      />
      </div>
    </div>
  );
}

export function LandingCostSensitivity() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/tuna-forecast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ include_sensitivity: true }) })
      .then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const scenarios = data?.landing_cost_sensitivity?.scenarios || [];

  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Activity size={18} style={{ color: '#a78bfa' }} />
          [원가 시뮬레이션] 환율-착지원가 민감도 분석
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>(단위: ₩/kg)</span>
        </h3>
      </div>
      <div className={styles.cardBody} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
      <div style={{ display: 'grid', gap: '6px' }}>
        {scenarios.map((s: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: s.change_pct === 0 ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: s.change_pct === 0 ? '1px solid rgba(167,139,250,0.3)' : '1px solid transparent' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: s.change_pct === 0 ? 700 : 400, flex: 1 }}>{s.name}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-primary)' }}>₩{s.landing_cost_won_kg?.toLocaleString()}/kg</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: s.change_pct > 0 ? '#ef4444' : s.change_pct < 0 ? '#22c55e' : '#a78bfa', minWidth: '50px', textAlign: 'right' }}>
              {s.change_pct > 0 ? '+' : ''}{s.change_pct}%
            </span>
          </div>
        ))}
      </div>
      <TakeawayBox
        situation="미국 301 관세 시나리오 적용 시 착지매입원가가 +20% 급등하며, 원화 약세(₩1,450/USD) 시나리오에서는 추가로 마진 5.1%p 압축이 발생합니다. 현재 기준환율(₩1,385) 대비 ₩65 추가 절하 시 kg당 약 ₩420의 매입원가 상승이 불가피합니다."
        actionPlan="[3중 방어 전략] ① 환율 헷지: 3개월 선물환 계약으로 ₩1,400 이하 환율 락인, ② FTA 우회: 한-ASEAN FTA 활용 태국 경유 관세 최적화(0% 적용), ③ ECOS/KCS API 실시간 모니터링 체계 구축으로 환율·관세 변동 즉시 대응 프로토콜을 가동해야 합니다."
        source="한국은행 ECOS API · 관세청 KCS API · FTA 관세양허표"
      />
      </div>
    </div>
  );
}

export default SkipjackForecastWidget;
