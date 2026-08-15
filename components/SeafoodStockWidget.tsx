'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, RefreshCw } from 'lucide-react';

type StockData = {
  name: string;
  symbol: string;
  price?: number;
  change?: number;
  changePercent?: number;
  currency?: string;
  error?: string;
};

export default function SeafoodStockWidget() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchStocks = async () => {
    try {
      const res = await fetch('/api/stocks');
      const json = await res.json();
      if (json.success && json.data) {
        setStocks(json.data);
        const now = new Date();
        setLastUpdated(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
      }
    } catch (e) {
      console.error('Failed to fetch stock data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 60000); // 1 minute refresh
    return () => clearInterval(interval);
  }, []);

  if (loading && stocks.length === 0) {
    return (
      <div style={{
        display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px',
        marginBottom: '24px', msOverflowStyle: 'none', scrollbarWidth: 'none'
      }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{
            flex: '0 0 auto', width: '160px', height: '80px',
            background: 'rgba(30, 41, 59, 0.4)', borderRadius: '12px',
            border: '1px solid rgba(140,170,255,0.10)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--w-slate-400)', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.05em' }}>
          <Activity size={14} color="#3b82f6" />
          주요 수산업 주가 시세 <span style={{fontSize: '0.7rem', opacity: 0.6}}>(실시간)</span>
        </h3>
        {lastUpdated && (
          <span style={{ fontSize: '0.7rem', color: 'var(--w-slate-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={10} style={{ opacity: 0.7 }} /> {lastUpdated} 업데이트
          </span>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '8px',
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          ::-webkit-scrollbar { display: none; }
        `}} />
        {stocks.map((stock, i) => {
          const isUp = stock.change && stock.change > 0;
          const isDown = stock.change && stock.change < 0;
          const color = isUp ? '#ef4444' : isDown ? '#3b82f6' : '#94a3b8'; // Korean stock market colors: Red for up, Blue for down
          const bgGlow = isUp ? 'rgba(239, 68, 68, 0.05)' : isDown ? 'rgba(59, 130, 246, 0.05)' : 'transparent';
          const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Activity;

          const currencySymbols: Record<string, string> = {
            'KRW': '₩', 'USD': '$', 'THB': '฿', 'NOK': 'kr ', 'JPY': '¥', 'GBP': '£'
          };
          const sym = currencySymbols[stock.currency || 'KRW'] || (stock.currency ? stock.currency + ' ' : '');

          return (
            <div key={i} style={{
              flex: '0 0 auto',
              minWidth: '150px',
              background: '#0a0f1f',
              borderRadius: '12px',
              border: `1px solid ${isUp ? 'rgba(239, 68, 68, 0.2)' : isDown ? 'rgba(59, 130, 246, 0.2)' : 'rgba(140,170,255,0.10)'}`,
              padding: '12px 16px',
              boxShadow: `0 4px 12px ${bgGlow}, inset 0 1px 0 rgba(140,170,255,0.10)`,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Top Row: Name and Icon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--w-slate-200)' }}>{stock.name}</span>
                {stock.error ? <AlertTriangle size={14} color="#f59e0b" /> : <Icon size={14} color={color} />}
              </div>
              
              {/* Bottom Row: Price and Change */}
              {stock.error ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-500)', marginTop: '4px' }}>조회 불가</div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: color, fontFamily: 'monospace' }}>
                    {sym}{stock.price?.toLocaleString()}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.65rem', color: color, fontWeight: 600, fontFamily: 'monospace' }}>
                      {isUp ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
