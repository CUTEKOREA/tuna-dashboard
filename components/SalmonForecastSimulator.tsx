"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { Calculator, RefreshCcw, Zap } from 'lucide-react';
import WidgetCard from './WidgetCard';

interface CostBreakdown {
  fobPerKg: number;
  freightPerKg: number;
  cifPerKg: number;
  dutyRate: number;
  dutyPerKg: number;
  vatPerKg: number;
  totalPerKgUSD: number;
  totalPerKgKRW: number;
  exchangeRate: number;
  sources: Record<string, string>;
}

const origins = [
  { label: '칠레 (냉동)', value: '칠레', hs: '030314', flag: '🇨🇱', fobDefault: 5.80 },
  { label: '노르웨이 (신선)', value: '노르웨이', hs: '030214', flag: '🇳🇴', fobDefault: 9.50 },
  { label: '호주 (신선)', value: '호주', hs: '030214', flag: '🇦🇺', fobDefault: 11.20 },
  { label: '캐나다 (냉동)', value: '캐나다', hs: '030314', flag: '🇨🇦', fobDefault: 7.30 },
  { label: '영국 (신선)', value: '영국', hs: '030214', flag: '🇬🇧', fobDefault: 10.80 },
];

export default function SalmonForecastSimulator() {
  const [origin, setOrigin] = useState<string>('칠레');
  const [quantity] = useState<number>(1000);
  const [breakdown, setBreakdown] = useState<CostBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<any>(null);

  const calculateLandedCost = useCallback(async () => {
    const selected = origins.find(o => o.value === origin) || origins[0];

    try {
      const res = await fetch('/api/landed-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hsCode: selected.hs,
          originCountry: origin,
          fobPriceUSD: selected.fobDefault,
          quantityKg: quantity,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const b = data.breakdown;
        setBreakdown({
          fobPerKg: selected.fobDefault,
          freightPerKg: b.freight.totalUSD / quantity,
          cifPerKg: b.cif.totalUSD / quantity,
          dutyRate: parseFloat(b.duty.rate),
          dutyPerKg: b.duty.totalUSD / quantity,
          vatPerKg: b.vat.totalUSD / quantity,
          totalPerKgUSD: b.total.totalUSD / quantity,
          totalPerKgKRW: b.total.perKgKRW,
          exchangeRate: b.total.exchangeRate,
          sources: data._meta.dataSources,
        });
      }
    } catch {
      const fob = selected.fobDefault;
      const freight = 0.45;
      const cif = fob + freight;
      const dutyRate = origin === '칠레' || origin === '노르웨이' ? 0 : 10;
      const duty = cif * dutyRate / 100;
      const sub = cif + duty;
      const vat = sub * 0.1;
      const total = sub + vat;
      const exRate = 1380;

      setBreakdown({
        fobPerKg: fob, freightPerKg: freight, cifPerKg: cif,
        dutyRate, dutyPerKg: duty, vatPerKg: vat,
        totalPerKgUSD: total, totalPerKgKRW: Math.round(total * exRate),
        exchangeRate: exRate,
        sources: { exchangeRate: 'ESTIMATE', freight: 'ESTIMATE', tariff: 'ESTIMATE' },
      });
    }

    setForecast({
      direction: 'up',
      pctChange: '+3.2%',
      horizon: '3개월',
      confidence: '72%',
      factors: [
        '칠레 SRS 감염률 상승 → 공급 축소 예상',
        'NOK 강세 지속 → 노르웨이산 가격 상승 압력',
        '한국 연어 소비 증가 추세',
      ],
      basis: '자체 추정 시나리오(illustrative) - 실측 모델 산출 아님',
    });

    setLoading(false);
  }, [origin, quantity]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void calculateLandedCost();
    }, 0);
    return () => window.clearTimeout(id);
  }, [calculateLandedCost]);

  const handleOriginSelect = (nextOrigin: string) => {
    if (nextOrigin === origin) return;
    setLoading(true);
    setOrigin(nextOrigin);
  };

  const handleRefresh = () => {
    setLoading(true);
    void calculateLandedCost();
  };

  const body = (
    <div style={{ padding: '0 0 0.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
        <button onClick={handleRefresh} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--w-slate-500)', padding: '4px',
        }}>
          <RefreshCcw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {origins.map(o => (
              <button key={o.value} onClick={() => handleOriginSelect(o.value)} style={{
                padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                background: origin === o.value ? 'rgba(var(--w-emerald-500-rgb), 0.2)' : 'rgba(255,255,255,0.03)',
                border: origin === o.value ? '1px solid rgba(var(--w-emerald-500-rgb), 0.5)' : '1px solid rgba(255,255,255,0.1)',
                color: origin === o.value ? 'var(--w-emerald-500)' : 'var(--w-slate-400)',
              }}>
                {o.flag} {o.label}
              </button>
            ))}
          </div>

          {breakdown && (
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden' }}>
              {[
                { label: 'FOB 가격', value: `$${breakdown.fobPerKg.toFixed(2)}/kg`, color: '#94a3b8' },
                { label: '해상운임', value: `$${breakdown.freightPerKg.toFixed(2)}/kg`, color: '#94a3b8', src: breakdown.sources.freight },
                { label: 'CIF 가격', value: `$${breakdown.cifPerKg.toFixed(2)}/kg`, color: '#3b82f6', bold: true },
                { label: `관세 (${breakdown.dutyRate}%)`, value: `$${breakdown.dutyPerKg.toFixed(2)}/kg`, color: '#f59e0b', src: breakdown.sources.tariff },
                { label: 'VAT (10%)', value: `$${breakdown.vatPerKg.toFixed(2)}/kg`, color: '#94a3b8' },
              ].map((row: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.6rem 0.9rem',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: row.color, fontWeight: row.bold ? 700 : 500 }}>{row.label}</span>
                    {row.src && (
                      <span style={{ fontSize: '0.55rem', color: '#475569', marginLeft: '6px' }}>({row.src})</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--w-slate-50)' }}>{row.value}</span>
                </div>
              ))}

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.8rem 0.9rem',
                background: 'rgba(var(--w-emerald-500-rgb), 0.1)',
                borderTop: '2px solid rgba(var(--w-emerald-500-rgb), 0.3)',
              }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--w-emerald-500)' }}>총 착지원가</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--w-slate-500)', marginLeft: '8px' }}>환율 ₩{breakdown.exchangeRate.toLocaleString()}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--w-emerald-500)' }}>
                    ₩{breakdown.totalPerKgKRW.toLocaleString()}/kg
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--w-slate-400)' }}>
                    (${breakdown.totalPerKgUSD.toFixed(2)}/kg)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          {forecast && (
            <div style={{
              background: 'rgba(var(--w-violet-500-rgb), 0.05)', border: '1px solid rgba(var(--w-violet-500-rgb), 0.2)',
              borderRadius: '8px', padding: '1rem',
            }}>
              <h4 style={{ color: 'var(--w-violet-500)', fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} /> 수급 전망 ({forecast.horizon})
              </h4>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem',
                padding: '0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px',
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: forecast.direction === 'up' ? 'var(--w-red-500)' : 'var(--w-emerald-500)' }}>
                  {forecast.pctChange}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-400)' }}>가격 변동 전망</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--w-slate-500)' }}>신뢰도: {forecast.confidence}</div>
                </div>
              </div>

              <div style={{ marginBottom: '0.8rem' }}>
                <h5 style={{ fontSize: '0.75rem', color: 'var(--w-slate-400)', fontWeight: 600, margin: '0 0 0.5rem 0' }}>주요 변동 요인:</h5>
                {forecast.factors.map((f: string, i: number) => (
                  <div key={i} style={{
                    fontSize: '0.72rem', color: 'var(--w-slate-300)', lineHeight: 1.5,
                    padding: '0.3rem 0', paddingLeft: '0.8rem',
                    borderLeft: '2px solid rgba(var(--w-violet-500-rgb), 0.3)',
                    marginBottom: '0.3rem',
                  }}>
                    {f}
                  </div>
                ))}
              </div>

              <div style={{
                fontSize: '0.6rem', color: '#475569', fontStyle: 'italic',
                borderTop: '1px solid rgba(140,170,255,0.10)',
                paddingTop: '0.5rem',
              }}>
                📚 {forecast.basis}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const selected = origins.find(o => o.value === origin) || origins[0];
  const totalKRW = breakdown ? `₩${breakdown.totalPerKgKRW.toLocaleString()}/kg` : '계산 중';
  const fc = forecast ? ` 3개월 전망 ${forecast.pctChange} (신뢰도 ${forecast.confidence})` : '';

  return (
    <WidgetCard
      title="수급 전망 & 착지원가 시뮬레이터"
      icon={Calculator}
      iconColor="#10b981"
      pillar="S4"
      cardDesc="착지원가는 운임·관세·환율 API 결합 산출 / 3개월 가격 전망은 자체 추정 시나리오(illustrative)"
      telemetry={{ status: breakdown ? 'SYNCED' : 'STATIC', syncDate: '착지원가: 관세·환율 API · 전망: 자체 추정' }}
      customBody={body}
      takeaway={{
        situation: `<div>
<p>착지원가 시뮬레이터는 산지·환율·운임·관세 4개 변수를 결합해 최종 매입원가를 산출하는 도구입니다.</p>
<p>국가별 비교: <strong>${selected.flag} ${selected.label} - FOB $${selected.fobDefault}/kg, 총 착지원가 ${totalKRW}</strong>.${fc} <strong>칠레·노르웨이 FTA 양허 0% 관세 면제 vs 호주·캐나다·영국 10% 관세 누적</strong>. 3개월 전망 수치는 자체 추정 시나리오(illustrative)입니다.</p>
</div>`,
        actionPlan: `<div>
<p><strong>활용</strong>: 시뮬레이터는 산지·환율·관세 변화에 따른 매입 시점 의사결정 보조 도구.</p>
<p><strong>3단계</strong>: ① 환율·운임·FOB 변수 ±2% 흔들림 시 헤지 검토 ② 가격 상승 시나리오 발생 시 선구매 비중 확대 검토 ③ 전망 가정은 자체 추정 시나리오(illustrative)이므로 실측 무역 데이터로 주기적 보정 필요.</p>
</div>`,
        source: "착지원가: UN Comtrade · 관세청(KCS) · 환율 API / 3개월 전망: 자체 추정 시나리오(illustrative)",
      }}
    />
  );
}
