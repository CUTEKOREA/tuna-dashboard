'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ShieldAlert, TrendingUp, TrendingDown, Info, Activity, Shield, AlertTriangle, AlertCircle, RefreshCw, BarChart2, Globe2 } from 'lucide-react';
import SafeResponsiveContainer from '../../components/SafeResponsiveContainer';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

// Color Palette — Dark Mode Premium Silla Co.
const theme = {
  navyDark: '#0A1118',
  navy: '#0F1A2E',
  navyLight: '#1A2436',
  gold: '#C9A050',
  goldLight: '#E8D5A3',
  cream: '#F7F5F0',
  white: '#FFFFFF',
  muted: '#64748b',
  border: 'rgba(255, 255, 255, 0.1)',
  borderGold: 'rgba(201, 160, 80, 0.3)',
  danger: '#ff4d4f', // Neon Red for risks
  dangerLight: 'rgba(255, 77, 79, 0.1)',
  success: '#22c55e', // Neon Green
  successLight: 'rgba(34, 197, 94, 0.1)',
};

export default function FinancialRiskDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globeData, setGlobeData] = useState<any[]>([]);
  const globeRef = useRef<any>(null);

  // Use dummy trend data for charts since yfinance API doesn't give historical timeseries in our script easily yet
  const mockTrendData = Array.from({ length: 14 }).map((_, i) => ({
    day: `D-${13-i}`,
    wti: 80 + Math.random() * 5,
    risk: 60 + Math.random() * 30
  }));

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/financial-risk');
      const result = await res.json();
      setData(result);
      
      // Setup Globe Data
      if (result.geopolitical_events) {
        const mappedData = result.geopolitical_events.map((event: any) => ({
          lat: event.lat,
          lng: event.lng,
          maxR: event.intensity * 10,
          propagationSpeed: 1,
          repeatPeriod: 1000,
          color: event.intensity > 0.8 ? theme.danger : theme.gold,
          name: event.location,
          description: event.description,
          intensity: event.intensity
        }));
        setGlobeData(mappedData);
      }
    } catch (error) {
      console.error('Failed to fetch financial risk data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Force dark mode background
    document.body.style.background = theme.navyDark;
    document.body.style.color = theme.white;
    fetchData();

    return () => {
      document.body.style.background = '';
      document.body.style.color = '';
    };
  }, []);

  useEffect(() => {
    // Focus globe on Middle East region slightly on load
    if (globeRef.current && !isLoading) {
      setTimeout(() => {
        globeRef.current.pointOfView({ lat: 25, lng: 55, altitude: 2.0 }, 2000);
      }, 500);
    }
  }, [globeRef, isLoading]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.navyDark }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: `3px solid ${theme.borderGold}`, borderTopColor: theme.gold, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ color: theme.gold, fontFamily: 'serif', letterSpacing: '0.1em' }}>INITIALIZING AI RISK ENGINE...</div>
        </div>
      </div>
    );
  }

  const { market, ai_analysis } = data || {};

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-inter), "Pretendard", -apple-system, sans-serif' }}>
      
      {/* Premium Header */}
      <div style={{ padding: '24px 40px', background: 'rgba(15, 26, 46, 0.8)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(201,160,80,0.1)', border: `1px solid ${theme.borderGold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe2 size={24} color={theme.gold} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: theme.white, fontFamily: 'serif', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Financial Risk Intelligence
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: theme.dangerLight, color: theme.danger, border: `1px solid ${theme.danger}`, fontWeight: 700, letterSpacing: '0.05em', fontFamily: 'sans-serif' }}>
                LIVE
              </span>
            </h1>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px', letterSpacing: '0.05em' }}>3D Geopolitical Analysis Dashboard</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchData} style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.white, padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = theme.gold; e.currentTarget.style.color = theme.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.white; }}>
            <RefreshCw size={14} /> 실시간 데이터 동기화
          </button>
          <Link href="/management" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.border}`, color: theme.white, padding: '8px 16px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
            Exit to Management
          </Link>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
        
        {/* 3D Globe Background */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.8 }}>
          <Globe
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            ringsData={globeData}
            ringColor={(t: any) => t.color}
            ringMaxRadius="maxR"
            ringPropagationSpeed="propagationSpeed"
            ringRepeatPeriod="repeatPeriod"
            htmlElementsData={globeData}
            htmlElement={(d: any) => {
              const el = document.createElement('div');
              el.innerHTML = `
                <div style="background: rgba(10, 17, 24, 0.8); border: 1px solid ${d.color}; padding: 8px 12px; border-radius: 6px; color: #fff; font-size: 12px; backdrop-filter: blur(4px); pointer-events: none; width: 160px; transform: translate(-50%, -50%);">
                  <div style="color: ${d.color}; font-weight: bold; margin-bottom: 4px;">${d.name}</div>
                  <div style="font-size: 11px; opacity: 0.8; line-height: 1.3;">${d.description}</div>
                </div>
              `;
              return el;
            }}
          />
        </div>

        {/* Left Panel: Market Data */}
        <div style={{ width: '380px', padding: '24px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(90deg, rgba(10,17,24,0.95) 0%, rgba(10,17,24,0.8) 100%)', borderRight: `1px solid ${theme.border}`, backdropFilter: 'blur(8px)' }}>
          <h2 style={{ fontSize: '13px', color: theme.gold, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16}/> Real-time Market
          </h2>
          
          {market && Object.entries(market).map(([ticker, data]: [string, any]) => {
            const isUp = data.change > 0;
            const color = isUp ? theme.success : theme.danger;
            const Icon = isUp ? TrendingUp : TrendingDown;
            const displayName = ticker === 'CL=F' ? 'WTI 원유 (USD/bbl)' : 
                               ticker === 'BZ=F' ? '브렌트유 (USD/bbl)' : 
                               ticker === 'KRW=X' ? 'USD/KRW 환율' : 
                               ticker === '043360.KS' ? '신라교역 주가 (KRW)' : ticker;

            return (
              <div key={ticker} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '20px', backdropFilter: 'blur(10px)' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px' }}>{displayName}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'serif' }}>{data.price?.toLocaleString() || 'N/A'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color, fontSize: '14px', fontWeight: 600, background: isUp ? theme.successLight : theme.dangerLight, padding: '4px 8px', borderRadius: '4px' }}>
                    <Icon size={14} />
                    {data.change > 0 ? '+' : ''}{data.change} ({data.change_pct}%)
                  </div>
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 'auto', background: 'rgba(201,160,80,0.05)', border: `1px solid ${theme.borderGold}`, borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '13px', color: theme.gold, margin: '0 0 16px 0', fontFamily: 'serif' }}>WTI Price Trend (14D)</h3>
            <SafeResponsiveContainer width="100%" height={120}>
              <AreaChart data={mockTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWti" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.gold} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.gold} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                <Tooltip contentStyle={{ background: theme.navy, border: `1px solid ${theme.border}` }} itemStyle={{ color: theme.gold }} />
                <Area type="monotone" dataKey="wti" stroke={theme.gold} fillOpacity={1} fill="url(#colorWti)" />
              </AreaChart>
            </SafeResponsiveContainer>
          </div>
        </div>

        {/* Right Panel: AI Intelligence */}
        <div style={{ width: '420px', marginLeft: 'auto', padding: '24px', position: 'relative', zIndex: 1, background: 'linear-gradient(270deg, rgba(10,17,24,0.95) 0%, rgba(10,17,24,0.8) 100%)', borderLeft: `1px solid ${theme.border}`, backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.danger, boxShadow: `0 0 12px ${theme.danger}`, animation: 'pulse 2s infinite' }} />
            <h2 style={{ fontSize: '13px', color: theme.white, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Executive Intelligence
            </h2>
          </div>

          {/* Risk Score */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Global Risk Score</div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: ai_analysis?.risk_score > 70 ? theme.danger : theme.gold, fontFamily: 'serif' }}>{ai_analysis?.risk_score}</div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${ai_analysis?.risk_score}%`, background: ai_analysis?.risk_score > 70 ? theme.danger : theme.gold }} />
              </div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Status</div>
               <div style={{ fontSize: '20px', fontWeight: 700, color: ai_analysis?.risk_level === 'High' ? theme.danger : theme.gold, marginTop: '8px' }}>
                 {ai_analysis?.risk_level === 'High' ? 'CRITICAL' : 'ELEVATED'}
               </div>
            </div>
          </div>

          {/* Investment Memo from Gemini */}
          <div style={{ flex: 1, background: 'rgba(201,160,80,0.05)', border: `1px solid ${theme.borderGold}`, borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.borderGold}`, background: 'rgba(201,160,80,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} color={theme.gold} />
              <span style={{ fontSize: '13px', color: theme.gold, fontWeight: 600, letterSpacing: '0.05em' }}>GEMINI 3 PRO ANALYSIS</span>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', fontSize: '14px', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
              {ai_analysis?.investment_memorandum?.split('\n').map((line: string, i: number) => {
                if (line.includes('**')) {
                  return <div key={i} style={{ color: theme.white, fontWeight: 700, marginTop: i > 0 ? '16px' : 0, marginBottom: '8px' }}>{line.replace(/\*\*/g, '')}</div>
                }
                return <div key={i} style={{ marginBottom: '8px' }}>{line}</div>
              })}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
