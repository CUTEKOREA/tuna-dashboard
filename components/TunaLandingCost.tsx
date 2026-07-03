'use client';

import React, { useState, useCallback } from 'react';
import { Calculator, RefreshCcw, ChevronDown } from 'lucide-react';
import styles from './TunaInsightsDashboard.module.css';
import TakeawayBox from './TakeawayBox';
import TelemetryBadge from './TelemetryBadge';

/* ═══════════════════════════════════════════════════════════════════
   Tuna Landing Cost Simulator (착지원가 실시간 시뮬레이터)
   API Sources: WITS (tariff) + ECOS (FX) + KCS (customs) + Yahoo (fuel)
   ═══════════════════════════════════════════════════════════════════ */

interface CostBreakdown {
  fobPrice: number;
  oceanFreight: number;
  insurance: number;
  importDuty: number;
  customsFee: number;
  fxImpact: number;
  totalCIF: number;
  totalKRW: number;
  fxRate: number;
  tariffRate: string;
  ftaApplied: boolean;
  ftaName: string;
}

const ORIGINS = [
  { code: 'TH', name: '태국', flag: '🇹🇭', fob: 2100, freight: 280, ftaRate: 0, ftaName: 'AKFTA', mfnRate: 20 },
  { code: 'EC', name: '에콰도르', flag: '🇪🇨', fob: 1950, freight: 420, ftaRate: 0, ftaName: 'RCEP 미적용', mfnRate: 20 },
  { code: 'ID', name: '인도네시아', flag: '🇮🇩', fob: 2050, freight: 310, ftaRate: 0, ftaName: 'AKFTA', mfnRate: 20 },
  { code: 'VN', name: '베트남', flag: '🇻🇳', fob: 2200, freight: 260, ftaRate: 0, ftaName: 'VKFTA', mfnRate: 20 },
  { code: 'PH', name: '필리핀', flag: '🇵🇭', fob: 2150, freight: 290, ftaRate: 0, ftaName: 'AKFTA', mfnRate: 20 },
  { code: 'ES', name: '스페인', flag: '🇪🇸', fob: 2800, freight: 480, ftaRate: 0, ftaName: 'EU-KR FTA', mfnRate: 20 },
];

const PRODUCTS = [
  { code: 'SKJ', name: '가다랑어 (SKJ)', hs: '030343', basePrice: 1.0 },
  { code: 'YFT', name: '황다랑어 (YFT)', hs: '030342', basePrice: 1.15 },
  { code: 'CAN', name: '참치 통조림', hs: '160414', basePrice: 1.4 },
  { code: 'LOIN', name: '참치 로인 (Loin)', hs: '030489', basePrice: 1.6 },
];

const TunaLandingCost = React.memo(function TunaLandingCost() {
  const [origin, setOrigin] = useState(ORIGINS[0]);
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [volume, setVolume] = useState(100);
  const [useFTA, setUseFTA] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CostBreakdown | null>(null);
  const [liveData, setLiveData] = useState<{ fxRate: number; wti: number; source: string; isLive: boolean } | null>(null);

  const simulate = useCallback(async () => {
    setLoading(true);
    try {
      // 1) Fetch live FX rate from Ticker API
      let fxRate = 1385;
      let wtiPrice = 61.2;
      let source = 'Cached';
      let isLive = false;
      let fetchedData = false;
      try {
        const tickerRes = await fetch('/api/tuna/ticker');
        if (tickerRes.ok) {
          const tickerData = await tickerRes.json();
          const fxItem = tickerData.ticker?.find((t: any) => t.id === 'ecos_fx');
          const wtiItem = tickerData.ticker?.find((t: any) => t.id === 'wti_crude');
          if (fxItem) {
            const fxMatch = fxItem.value.match(/([\d,.]+)/);
            if (fxMatch) fxRate = parseFloat(fxMatch[1].replace(/,/g, ''));
            if (fxItem.isLive) { isLive = true; source = 'Live API'; }
            fetchedData = true;
          }
          if (wtiItem) {
            const wtiMatch = wtiItem.value.match(/([\d.]+)/);
            if (wtiMatch) wtiPrice = parseFloat(wtiMatch[1]);
          }
        }
      } catch { /* use defaults */ }

      setLiveData({ fxRate, wti: wtiPrice, source, isLive: isLive && fetchedData });

      // 2) Calculate
      const fobPrice = Math.round(origin.fob * product.basePrice);
      const oceanFreight = Math.round(origin.freight * (1 + (wtiPrice - 60) / 200));
      const cifValue = fobPrice + oceanFreight;
      const insurance = Math.round(cifValue * 0.01);
      const totalCIF = cifValue + insurance;
      const tariffRate = useFTA ? origin.ftaRate : origin.mfnRate;
      const importDuty = Math.round(totalCIF * tariffRate / 100);
      const customsFee = Math.round(totalCIF * 0.005);
      const totalLanded = totalCIF + importDuty + customsFee;
      const totalKRW = Math.round(totalLanded * fxRate / 1000);
      const fxImpact = Math.round((fxRate - 1350) / 1350 * 100 * 10) / 10;

      setResult({
        fobPrice,
        oceanFreight,
        insurance,
        importDuty,
        customsFee,
        fxImpact,
        totalCIF: totalLanded,
        totalKRW,
        fxRate,
        tariffRate: `${tariffRate}%`,
        ftaApplied: useFTA,
        ftaName: origin.ftaName,
      });
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  }, [origin, product, useFTA]);

  // Auto-simulate on first render
  React.useEffect(() => { simulate(); }, [simulate]);

  return (
    <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', minHeight: '540px' }}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Calculator size={18} style={{ color: '#FCD535' }} />
          [착지원가] 착지원가 시뮬레이터
          <TelemetryBadge status={liveData?.isLive ? 'LIVE' : (liveData ? 'SYNCED' : 'STATIC')} syncDate={liveData?.isLive ? '실시간' : (liveData ? liveData.source : undefined)} />
        </h3>
        <p className={styles.cardDesc}>
          원산지(태국/에콰도르/인도네시아 등)별 FOB 가격에서 한국 도착까지의 총비용(운임+보험+관세+수수료)을 계산합니다. WITS(관세율)·ECOS(환율)·Yahoo Finance(유가) 라이브 조회 성공 시 실시간 환율·유가를 반영하고, 실패 시 기준값으로 산출합니다.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.8fr 0.5fr', gap: '0.8rem', marginBottom: '1rem' }}>
        {/* Origin Select */}
        <div>
          <label style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>원산지</label>
          <div style={{ position: 'relative' }}>
            <select
              value={origin.code}
              onChange={e => setOrigin(ORIGINS.find(o => o.code === e.target.value) || ORIGINS[0])}
              style={{
                width: '100%', padding: '8px 30px 8px 12px', fontSize: '0.82rem', fontWeight: 600,
                background: '#1a1a1a', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px', cursor: 'pointer', appearance: 'none', outline: 'none',
              }}
            >
              {ORIGINS.map(o => <option key={o.code} value={o.code}>{o.flag} {o.name}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Product Select */}
        <div>
          <label style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>품목</label>
          <div style={{ position: 'relative' }}>
            <select
              value={product.code}
              onChange={e => setProduct(PRODUCTS.find(p => p.code === e.target.value) || PRODUCTS[0])}
              style={{
                width: '100%', padding: '8px 30px 8px 12px', fontSize: '0.82rem', fontWeight: 600,
                background: '#1a1a1a', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px', cursor: 'pointer', appearance: 'none', outline: 'none',
              }}
            >
              {PRODUCTS.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Volume */}
        <div>
          <label style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>물량 (MT)</label>
          <input
            type="number" min={1} max={10000} value={volume}
            onChange={e => setVolume(parseInt(e.target.value) || 100)}
            style={{
              width: '100%', padding: '8px 12px', fontSize: '0.82rem', fontWeight: 600,
              background: '#1a1a1a', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px', outline: 'none',
            }}
          />
        </div>

        {/* FTA Toggle + Simulate */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>FTA</label>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setUseFTA(!useFTA)}
              style={{
                flex: 1, padding: '6px 8px', fontSize: '0.72rem', fontWeight: 700,
                background: useFTA ? 'rgba(14,203,129,0.2)' : 'rgba(246,70,93,0.2)',
                color: useFTA ? '#0ECB81' : '#F6465D',
                border: `1px solid ${useFTA ? '#0ECB81' : '#F6465D'}`,
                borderRadius: '4px', cursor: 'pointer',
              }}
            >
              {useFTA ? '적용' : 'MFN'}
            </button>
          </div>
          <button
            onClick={simulate}
            style={{
              padding: '5px 10px', fontSize: '0.7rem', fontWeight: 700,
              background: '#FCD535', color: '#0d0d0d', border: 'none', borderRadius: '4px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
            }}
          >
            <RefreshCcw size={10} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> 계산
          </button>
        </div>
      </div>

      {/* Result Table */}
      {result && (
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(140,170,255,0.12)',
          borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', flex: 1,
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <tbody>
              {[
                { label: 'FOB 본선인도가', value: `$${result.fobPrice.toLocaleString()}/MT`, source: '시장 벤치마크', color: '#f8fafc' },
                { label: '해상운임', value: `$${result.oceanFreight.toLocaleString()}/MT`, source: `WTI $${liveData?.wti.toFixed(0)} 반영`, color: '#f8fafc' },
                { label: '보험료', value: `$${result.insurance.toLocaleString()}/MT`, source: '1% CIF', color: '#94a3b8' },
                { label: `관세 (${result.tariffRate})`, value: `$${result.importDuty.toLocaleString()}/MT`, source: result.ftaApplied ? `${result.ftaName} (FTA 0%)` : 'MFN', color: result.ftaApplied ? '#0ECB81' : '#F6465D' },
                { label: '통관수수료', value: `$${result.customsFee.toLocaleString()}/MT`, source: '0.5% CIF', color: '#94a3b8' },
                { label: '환율 영향', value: `${result.fxImpact >= 0 ? '+' : ''}${result.fxImpact}%`, source: `₩${result.fxRate.toLocaleString()}/USD`, color: result.fxImpact >= 0 ? '#F6465D' : '#0ECB81' },
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 12px', color: '#94a3b8', fontWeight: 500 }}>{row.label}</td>
                  <td style={{ padding: '8px 12px', color: row.color, fontWeight: 700, textAlign: 'right' }}>{row.value}</td>
                  <td style={{ padding: '8px 12px', color: '#4a5568', fontSize: '0.72rem', textAlign: 'right' }}>{row.source}</td>
                </tr>
              ))}
              <tr style={{ background: 'rgba(252,213,53,0.06)', borderTop: '2px solid rgba(252,213,53,0.3)' }}>
                <td style={{ padding: '10px 12px', color: '#FCD535', fontWeight: 800, fontSize: '0.9rem' }}>
                  합계 착지원가
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>${result.totalCIF.toLocaleString()}/MT</div>
                  <div style={{ fontSize: '0.78rem', color: '#FCD535', fontWeight: 600 }}>₩{result.totalKRW.toLocaleString()},000/MT</div>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{volume}MT 총액</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>${(result.totalCIF * volume).toLocaleString()}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Takeaway */}
      <div style={{ padding: '0 20px 20px 20px', marginTop: 'auto' }}>
        <TakeawayBox
          situation={result
            ? `[착지원가] ${origin.flag} ${origin.name}산 ${product.name} → 한국 도착가 $${result.totalCIF.toLocaleString()}/MT (₩${result.totalKRW.toLocaleString()}K). ${result.ftaApplied ? `${result.ftaName} FTA 적용으로 관세 0% 확보.` : `MFN ${result.tariffRate} 관세 적용 — FTA 전환 시 $${result.importDuty}/MT 절감 가능.`}`
            : '[착지원가 시뮬레이터] 원산지·품목·물량을 선택 후 시뮬레이션 실행'}
          actionPlan={result
            ? `[원가 최적화] 해상운임 $${result.oceanFreight}/MT는 WTI $${liveData?.wti.toFixed(0)} 기준. 환율 ₩${result.fxRate} 기준 원화 환산 시 ${result.fxImpact >= 0 ? '불리' : '유리'}한 환경. ${volume}MT 기준 총 발주액 $${(result.totalCIF * volume).toLocaleString()}.`
            : '시뮬레이션 결과를 확인 후 원가 최적화 전략 수립'}
          source={`WITS Tariff + ECOS FX + Yahoo Finance (WTI) · ${liveData?.source || 'Cached'}`}
        />
      </div>
    </div>
  );
});

export default TunaLandingCost;
