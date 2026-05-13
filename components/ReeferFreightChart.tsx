import React, { useEffect, useState } from 'react';
import { Network, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './ReeferFreightChart.module.css';
import TermTooltip from './TermTooltip';

const COLORS = {
  THA: 'var(--color-info)', // Bangkok, Thailand (Blue)
  PHL: 'var(--color-warning)', // Philippines (Orange)
  ESP: 'var(--color-danger)', // Spain (Red)
  JPN: 'var(--text-primary)', // Japan (White)
  MEX: '#8b5cf6', // Mexico (Purple)
  VNM: 'var(--color-success)', // Vietnam (Emerald)
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
        fontSize: '13px'
      }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', borderBottom: '1px solid #334155', paddingBottom: '6px', marginBottom: '8px' }}>
          {label} Snapshot
        </div>
        <div style={{ display: 'grid', gap: '6px' }}>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <span style={{ color: entry.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, background: entry.color, borderRadius: '50%' }}></span>
                {entry.name}
              </span>
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                ${entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default function ReeferFreightChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/logistics/freight');
        if (!res.ok) throw new Error('Failed to fetch freight data');
        const json = await res.json();
        setData(json.data);
        setMeta(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <RefreshCw className="animate-spin" size={24} color="var(--text-muted)" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--color-danger)', gap: 8 }}>
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <h2 className={styles.header} style={{ marginBottom: 0 }}>
          <Network size={24} style={{ color: 'var(--text-main)' }}/>
          <TermTooltip term="GLOBAL REEFER FREIGHT TRENDS" description="[그래프 설명] 전 세계 주요 항구로 향하는 냉동 컨테이너(Reefer)의 해상 운임 변화 추세입니다. 운임이 오르면 물류 비용이 증가하여 최종 참치캔 제조 원가에 타격을 줍니다." /> (USD / 40' HC)
        </h2>
        
        {meta && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '11px', 
            fontWeight: 600,
            background: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--color-success)',
            padding: '4px 10px',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px #10b981' }}></div>
            Live API: {meta.source}
          </div>
        )}
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
        한국발 6개 핵심 수출입 교역항(방콕, 재너럴산토스, 바르셀로나, 도쿄, 만사니요, 호치민)에 대한 <TermTooltip term="40피트(HC) 냉동 컨테이너" description="40-foot High Cube Reefer: 약 25~28톤의 냉동 참치를 영하 20도 이하로 유지하며 운반할 수 있는 특수 컨테이너입니다." /> 해상 운임 변화 실시간 텔레메트리입니다.
        {meta?.grade === 'A-Grade (Proxy Anchored)' && (
          <span style={{ opacity: 0.7, marginLeft: 4 }}>
            * FRED 글로벌 물류 TSI 지수 기반 노선별 변동성 앵커링 분석.
          </span>
        )}
      </div>
      
      <div className={styles.legendBox}>
        <div className={styles.legendItem}><div className={styles.legendColor} style={{background: COLORS.JPN}}></div>도쿄 (Japan)</div>
        <div className={styles.legendItem}><div className={styles.legendColor} style={{background: COLORS.PHL}}></div>재너럴산토스 (Philippines)</div>
        <div className={styles.legendItem}><div className={styles.legendColor} style={{background: COLORS.VNM}}></div>호치민 (Vietnam)</div>
        <div className={styles.legendItem}><div className={styles.legendColor} style={{background: COLORS.THA}}></div>방콕 (Thailand)</div>
        <div className={styles.legendItem}><div className={styles.legendColor} style={{background: COLORS.ESP}}></div>바르셀로나 (Spain)</div>
        <div className={styles.legendItem}><div className={styles.legendColor} style={{background: COLORS.MEX}}></div>만사니요 (Mexico)</div>
      </div>

      <div className={styles.chartWrapper}>
        <SafeResponsiveContainer width="100%" height={380}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis 
              stroke="var(--text-muted)" 
              fontSize={11} 
              tickFormatter={(val) => `$${Number(val).toLocaleString()}`}
              tickLine={false} 
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" name="Japan" dataKey="JPN" stroke={COLORS.JPN} strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 6 }} />
            <Line type="monotone" name="Philippines" dataKey="PHL" stroke={COLORS.PHL} strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 6 }} />
            <Line type="monotone" name="Vietnam" dataKey="VNM" stroke={COLORS.VNM} strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 6 }} />
            <Line type="monotone" name="Thailand" dataKey="THA" stroke={COLORS.THA} strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 6 }} />
            <Line type="monotone" name="Spain" dataKey="ESP" stroke={COLORS.ESP} strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 6 }} />
            <Line type="monotone" name="Mexico" dataKey="MEX" stroke={COLORS.MEX} strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp size={14} />
          <span>Harness 4-Axis Reliability Protocol: {meta?.grade || 'S-Grade'}</span>
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
          Last Synced: {new Date(meta?.timestamp).toLocaleString() || 'N/A'}
        </div>
      </div>
    </div>
  );
}
