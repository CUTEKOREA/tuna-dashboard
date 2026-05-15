import React, { useState, useEffect } from 'react';
import { RefreshCcw, DollarSign, Activity } from 'lucide-react';

interface ExchangeSimulatorProps {
  onSimulationChange: (factors: { nok: number, eur: number, mgo: number }) => void;
}

export default function ExchangeSimulator({ onSimulationChange }: ExchangeSimulatorProps) {
  const [liveRates, setLiveRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nokFactor, setNokFactor] = useState(0); // -100 to 100 percentage
  const [eurFactor, setEurFactor] = useState(0); 
  const [mgoFactor, setMgoFactor] = useState(0);

  useEffect(() => {
    fetch('/api/exchange')
      .then(res => res.json())
      .then(data => {
        setLiveRates(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Update parent when factors change
  useEffect(() => {
    onSimulationChange({ nok: nokFactor, eur: eurFactor, mgo: mgoFactor });
  }, [nokFactor, eurFactor, mgoFactor, onSimulationChange]);

  const resetSimulation = () => {
    setNokFactor(0);
    setEurFactor(0);
    setMgoFactor(0);
  };

  if (loading) return (
    <div style={{ padding: '1rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <p style={{ color: '#94a3b8', margin: 0 }}>Loading Live Exchange Rates...</p>
    </div>
  );

  return (
    <div style={{
      marginBottom: '2.5rem',
      background: 'linear-gradient(145deg, rgba(0, 0, 0, 0.2), rgba(2, 6, 23, 0.9))',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 0 20px rgba(245, 158, 11, 0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warning)', fontSize: '1.2rem', fontWeight: 700 }}>
            <Activity size={20} /> Macro Impact Simulator (매크로 스트레스 테스트 엔진)
            <span style={{ display:'inline-flex', alignItems:'center', background:'rgba(16, 185, 129, 0.2)', color:'var(--color-success)', fontSize:'0.7rem', padding:'2px 6px', borderRadius:'4px', border:'1px solid #10b981' }}>🟢 Live API 연동됨</span>
          </h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
            실시간 환율/유가 데이터에 충격을 가하여 전체 밸류체인 마진을 자동 재계산합니다. (기준일: {liveRates?.date || 'Today'})
          </p>
        </div>
        <button onClick={resetSimulation} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', transition: 'all 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <RefreshCcw size={14} /> 초기화
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        {/* NOK Simulator */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.9rem' }}>🇳🇴 NOK/KRW (노르웨이 크로네)</span>
            <span style={{ color: nokFactor > 0 ? 'var(--color-danger)' : nokFactor < 0 ? 'var(--color-success)' : '#94a3b8', fontWeight: 700 }}>
              {(liveRates?.nok_krw * (1 + nokFactor / 100)).toFixed(2)} 원 ({nokFactor > 0 ? '+' : ''}{nokFactor}%)
            </span>
          </div>
          <input 
            type="range" min="-20" max="20" step="1" value={nokFactor} 
            onChange={e => setNokFactor(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-warning)' }} 
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
            <span>-20% (강달러/원화강세)</span>
            <span>+20% (원화약세/NOK강세)</span>
          </div>
        </div>

        {/* EUR Simulator */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.9rem' }}>🇪🇺 EUR/KRW (유로)</span>
            <span style={{ color: eurFactor > 0 ? 'var(--color-danger)' : eurFactor < 0 ? 'var(--color-success)' : '#94a3b8', fontWeight: 700 }}>
              {(liveRates?.eur_krw * (1 + eurFactor / 100)).toFixed(2)} 원 ({eurFactor > 0 ? '+' : ''}{eurFactor}%)
            </span>
          </div>
          <input 
            type="range" min="-20" max="20" step="1" value={eurFactor} 
            onChange={e => setEurFactor(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-info)' }} 
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
            <span>-20%</span>
            <span>+20%</span>
          </div>
        </div>

        {/* MGO (Fuel) Simulator */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.9rem' }}>🛢️ MGO (글로벌 해운연료, $/mt)</span>
            <span style={{ color: mgoFactor > 0 ? 'var(--color-danger)' : mgoFactor < 0 ? 'var(--color-success)' : '#94a3b8', fontWeight: 700 }}>
              {(750 * (1 + mgoFactor / 100)).toFixed(0)} $ ({mgoFactor > 0 ? '+' : ''}{mgoFactor}%)
            </span>
          </div>
          <input 
            type="range" min="-50" max="50" step="5" value={mgoFactor} 
            onChange={e => setMgoFactor(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#ec4899' }} 
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
            <span>-50% (유가 급락)</span>
            <span>+50% (오일 쇼크)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
