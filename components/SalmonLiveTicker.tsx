// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCcw, DollarSign, Ship, Activity, BarChart2 } from 'lucide-react';
import WidgetCard from './WidgetCard';

const ICONS: any = { DollarSign, Activity, Ship, BarChart2, TrendingUp };

export default function SalmonLiveTicker() {
  const [tickers, setTickers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [sources, setSources] = useState<string[]>([]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 300000);
    return () => clearInterval(interval);
  }, []);

  async function fetchAllData() {
    setLoading(true);
    const items: any[] = [];
    const srcSet = new Set<string>();

    try {
      const res = await fetch('/api/macro-environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: '노르웨이' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.exchangeRate?.currentRate) {
          const trend = data.exchangeRate.trend || [];
          const prev = trend.length > 1 ? trend[trend.length - 2]?.rate : null;
          const pctChange = prev ? ((data.exchangeRate.currentRate - prev) / prev * 100).toFixed(2) : null;
          items.push({
            label: 'NOK/KRW',
            value: `₩${data.exchangeRate.currentRate.toFixed(1)}`,
            change: pctChange ? `${parseFloat(pctChange) >= 0 ? '+' : ''}${pctChange}%` : undefined,
            changeDirection: pctChange ? (parseFloat(pctChange) >= 0 ? 'up' : 'down') : 'flat',
            iconName: 'DollarSign',
            source: 'ECOS',
            color: '#3b82f6',
          });
          srcSet.add('ECOS');
        }
        if (data.fedRate?.latest?.value) {
          items.push({
            label: 'Fed Rate',
            value: `${data.fedRate.latest.value.toFixed(2)}%`,
            change: undefined,
            changeDirection: 'flat',
            iconName: 'Activity',
            source: 'FRED',
            color: '#8b5cf6',
          });
          srcSet.add('FRED');
        }
      }
    } catch (e) { console.warn('[Ticker] ECOS error:', e); }

    try {
      const res = await fetch('/api/salmon/kcs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'timeseries' }),
      });
      if (res.ok) {
        const data = await res.json();
        const ts = data.data;
        if (Array.isArray(ts) && ts.length > 0) {
          const latest = ts[ts.length - 1];
          const prev = ts.length > 1 ? ts[ts.length - 2] : null;
          const qtyChange = prev ? ((latest.qty_tonnes - prev.qty_tonnes) / prev.qty_tonnes * 100).toFixed(1) : null;
          items.push({
            label: `KCS 수입 (${latest.year})`,
            value: `${(latest.qty_tonnes / 1000).toFixed(0)}K MT`,
            change: qtyChange ? `${parseFloat(qtyChange) >= 0 ? '+' : ''}${qtyChange}%` : undefined,
            changeDirection: qtyChange ? (parseFloat(qtyChange) >= 0 ? 'up' : 'down') : 'flat',
            iconName: 'Ship',
            source: data.status === 'live' ? 'KCS_LIVE' : 'KCS_CACHE',
            color: '#10b981',
          });
          items.push({
            label: `단가 (${latest.year})`,
            value: `$${(latest.unit_price / 1000).toFixed(2)}/kg`,
            change: undefined,
            changeDirection: 'flat',
            iconName: 'BarChart2',
            source: 'KCS',
            color: '#f59e0b',
          });
          srcSet.add(data.status === 'live' ? 'KCS_LIVE' : 'KCS_CACHE');
        }
      }
    } catch (e) { console.warn('[Ticker] KCS error:', e); }

    try {
      const res = await fetch('/api/salmon/kamis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemCode: '연어' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.price) {
          items.push({
            label: 'KAMIS 소매가',
            value: `₩${parseInt(data.data.price).toLocaleString()}/kg`,
            change: data.data.changeRate ? `${data.data.changeRate}` : undefined,
            changeDirection: data.data.changeRate?.includes('-') ? 'down' : 'up',
            iconName: 'TrendingUp',
            source: data.status === 'live' ? 'KAMIS_LIVE' : 'KAMIS_CACHE',
            color: '#ec4899',
          });
          srcSet.add('KAMIS');
        }
      }
    } catch (e) { console.warn('[Ticker] KAMIS error:', e); }

    if (items.length === 0) {
      items.push(
        { label: 'NOK/KRW', value: '₩154.2', change: '+0.3%', changeDirection: 'up', iconName: 'DollarSign', source: 'OFFLINE', color: '#3b82f6' },
        { label: 'Fed Rate', value: '5.33%', iconName: 'Activity', source: 'OFFLINE', color: '#8b5cf6', changeDirection: 'flat' },
        { label: 'KCS 수입 (2023)', value: '74K MT', change: '-2.6%', changeDirection: 'down', iconName: 'Ship', source: 'OFFLINE', color: '#10b981' },
        { label: '단가 (2023)', value: '$6.89/kg', iconName: 'BarChart2', source: 'OFFLINE', color: '#f59e0b', changeDirection: 'flat' },
      );
    }

    setTickers(items);
    setSources(Array.from(srcSet));
    setLastUpdate(new Date().toLocaleTimeString('ko-KR'));
    setLoading(false);
  }

  const body = (
    <div style={{ padding: '0 0 0.5rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {sources.map(s => (
            <span key={s} style={{
              fontSize: '0.6rem', padding: '1px 5px', borderRadius: '3px',
              background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 600,
            }}>🟢 {s}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={fetchAllData} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: loading ? '#ec4899' : '#64748b',
          }}>
            <RefreshCcw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <span style={{ fontSize: '0.65rem', color: '#475569' }}>{lastUpdate}</span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${tickers.length || 4}, 1fr)`,
        gap: '0',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.5), rgba(30,15,50,0.5))',
        borderRadius: '8px',
        border: '1px solid rgba(236, 72, 153, 0.2)',
        overflow: 'hidden',
      }}>
        {tickers.map((t, i) => {
          const IconComp = ICONS[t.iconName] || Activity;
          return (
            <div key={i} style={{
              padding: '0.9rem 1rem',
              borderRight: i < tickers.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <IconComp size={13} color={t.color} />
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{t.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>{t.value}</span>
                {t.change && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700,
                    color: t.changeDirection === 'up' ? '#ef4444' : '#10b981',
                    display: 'flex', alignItems: 'center', gap: '2px',
                  }}>
                    {t.changeDirection === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {t.change}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: '4px' }}>
                {t.source}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const upCount = tickers.filter(t => t.changeDirection === 'up').length;
  const downCount = tickers.filter(t => t.changeDirection === 'down').length;

  return (
    <WidgetCard
      title="실시간 연어 무역 인텔리전스"
      icon={Activity}
      iconColor="#ec4899"
      pillar="S4"
      cardDesc="ECOS(환율)·FRED(금리)·KCS(수입실적)·KAMIS(소매가) 5분 갱신 매크로 티커"
      telemetry={{ status: 'LIVE', syncDate: lastUpdate || '2026-05-21' }}
      customBody={body}
      takeaway={{
        situation: `총 ${tickers.length}개 매크로·무역 인디케이터 5분 갱신 중. 직전 갱신 시점 ${lastUpdate || '대기 중'} — 상승 ${upCount}건, 하락 ${downCount}건. NOK/KRW 환율과 Fed Rate가 단기 착지원가 결정 변수로 작용하며, KCS·KAMIS 단가는 도매·소매 마진 압력을 실시간 반영합니다.`,
        actionPlan: "NOK/KRW 환율 변동이 ±2% 초과 시 자동 헤지 알림을 트레이딩 데스크에 연결하고, KAMIS 소매가가 KCS 단가 대비 격차를 2주 연속 25% 이상 벌릴 경우 PB 단가 재협상 트리거를 가동합니다.",
        source: "ECOS · FRED · KCS · KAMIS — 한기욱(KMI 2024) 단기 전망모형",
      }}
    />
  );
}
