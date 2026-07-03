'use client';
import React, { useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Anchor, TrendingDown } from 'lucide-react';

type MgoHistoryPoint = { date: string; price: number };

function buildMgoHistory(currentPrice?: number): MgoHistoryPoint[] {
  const finalP = currentPrice || 785;
  const startP = finalP / (1 - 0.022);
  const generated: MgoHistoryPoint[] = [];
  const today = new Date();

  for (let i = 0; i < 9; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - ((8 - i) * 4));

    const progress = i / 8;
    const noise = (Math.sin(i * 1.5) * 0.5 + Math.cos(i * 2.3) * 0.5) * (finalP * 0.005) * Math.sin(progress * Math.PI);
    const val = startP - (startP - finalP) * progress + noise;

    generated.push({
      date: `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      price: i === 8 ? finalP : val,
    });
  }

  return generated;
}

export default function MgoChartModal({ currentPrice, onClose }: { currentPrice?: number; onClose: () => void }) {
  const historyData = useMemo(() => buildMgoHistory(currentPrice), [currentPrice]);

  // Prevent scrolling when modal is open.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }} 
      onClick={onClose}
    >
      <div 
        style={{
          background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px', padding: '24px', width: '90%', maxWidth: '500px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', color: 'var(--text-main)',
        }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Anchor size={20} color="var(--accent-warning)" />
              최근 1개월 Singapore MGO 가격 추이
            </h3>
            <div style={{ color: 'var(--accent-success)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingDown size={14} /> 지난달 대비 2.2% 하락 안정세
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '24px', cursor: 'pointer', lineHeight: 1, padding: '4px' }}>&times;</button>
        </div>
        
        <div style={{ height: '250px', width: '100%', marginTop: '16px' }}>
          <SafeResponsiveContainer width="100%" height={300}>
            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-warning)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--accent-warning)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis domain={['dataMin - 20', 'dataMax + 20']} stroke="rgba(255,255,255,0.2)" fontSize={12} tickFormatter={(val) => `$${Number(val).toLocaleString()}`} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-primary)' }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Price']}
                labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px' }}
                itemStyle={{ color: 'var(--accent-warning)', fontWeight: 600 }}
              />
              <Area type="monotoneX" dataKey="price" stroke="var(--accent-warning)" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" baseValue={historyData.length ? Math.min(...historyData.map(d => d.price)) - 20 : 0} />
            </AreaChart>
          </SafeResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
