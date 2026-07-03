'use client';

import React, { useRef, useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';
import { Trophy } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import { getSquidData } from '@/lib/data/squid';

const data = getSquidData('tunaBenchmark');

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const m = () => { const v = el.getBoundingClientRect().width; if (v > 0) setW(Math.floor(v)); };
    m(); const t = setTimeout(m, 200);
    const ro = new ResizeObserver(m); ro.observe(el);
    window.addEventListener('resize', m);
    return () => { clearTimeout(t); ro.disconnect(); window.removeEventListener('resize', m); };
  }, [ref]);
  return w;
}

const BenchmarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const squid = payload.find((p: any) => p.dataKey === 'SquidIndex');
  const tuna = payload.find((p: any) => p.dataKey === 'TunaIndex');
  const squidRaw = payload[0]?.payload?.SquidRaw || 0;
  const tunaRaw = payload[0]?.payload?.TunaRaw || 0;
  
  return (
    <div style={{ background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(168,85,247,0.4)', padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', minWidth: '220px' }}>
      <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#c084fc' }}>{label}년 (성장 지수 1990=100)</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: '#f97316' }}>🦑 변동성 (위험자산)</span>
        <span style={{ fontWeight: 600 }}>{squid?.value?.toFixed(1)} <span style={{fontSize: '0.8rem', color: '#a1a1aa'}}>({squidRaw.toLocaleString()}t)</span></span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#06b6d4' }}>🐟 안정성 (안전자산)</span>
        <span style={{ fontWeight: 600 }}>{tuna?.value?.toFixed(1)} <span style={{fontSize: '0.8rem', color: '#a1a1aa'}}>({tunaRaw.toLocaleString()}t)</span></span>
      </div>
      {squid?.value && tuna?.value && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', paddingTop: '6px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>
          자산 괴리율: {(squid.value - tuna.value).toFixed(1)}p
        </div>
      )}
    </div>
  );
};

export default function Insight9TunaVsSquidCombo() {
  const ref = useRef<HTMLDivElement>(null);
  const w = useContainerWidth(ref);
  const mobile = w > 0 && w < 500;

  const latest = data[data.length - 1] as any;

  return (
    <div className={styles.glassCard} style={{ marginTop: '2rem' }}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Trophy size={20} />
          안전자산(참치) vs 위험자산(오징어)
          
        </h3>
        <p className={styles.cardSubtitle}>
          연중 가격이 안정적이고 장기계약 위주인 참치의 완만한 곡선과 널뛰기형 투기장인 오징어 시장의 극단적 대조. 성숙도와 변동성의 차이는 M&A 및 원양 선단 투자 방향성을 결정하는 핵심 거시 지표입니다.
        </p>
      </div>

      <div ref={ref} style={{ width: '100%', height: mobile ? 320 : 380, overflow: 'hidden' }}>
        {w > 0 && (
          <SafeResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: mobile ? 5 : 20, left: mobile ? -5 : 10, bottom: 5 }}>
              <defs>
                <linearGradient id="squidBench" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
              <XAxis dataKey="Year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: mobile ? 10 : 11 }} minTickGap={mobile ? 30 : 15} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} width={mobile ? 35 : 45} />
              <Tooltip content={<BenchmarkTooltip />} />
              <Legend wrapperStyle={{ fontSize: mobile ? '11px' : '12px', paddingTop: '8px' }} iconType="plainline" />
              <ReferenceLine y={100} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" label={{ value: '기준(100)', fill: 'rgba(255,255,255,0.3)', fontSize: 10, position: 'right' }} />
              
              <Line type="monotone" dataKey="TunaIndex" name="🐟 참치 트렌드 지수 (안전자산)" stroke="#06b6d4" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#22d3ee', stroke: '#06b6d4', strokeWidth: 2 }} />
              <Line type="step" dataKey="SquidIndex" name="🦑 오징어 트렌드 지수 (위험자산)" stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#fb923c', stroke: '#f97316', strokeWidth: 2 }} />
            </LineChart>
          </SafeResponsiveContainer>
        )}
      </div>

      <TakeawayBox
        situation={<>참치 트렌드 지수(청색, {latest?.TunaIndex?.toFixed(0)}p)는 RFMO 쿼터·장기계약에 의해 변동성이 억제된 '안전자산'으로 완만한 곡선을 그립니다. 반면 오징어 트렌드 지수(주황, {latest?.SquidIndex?.toFixed(0)}p)는 기후·현물 시장에 극도로 민감한 '위험자산'으로 계단식 널뛰기를 반복합니다. 두 자산의 괴리율은 {latest ? (latest.SquidIndex - latest.TunaIndex).toFixed(0) : '-'}포인트로, 포트폴리오 분산의 필요성을 수치로 입증합니다.</>}
        actionPlan="원양 선단 투자 방향을 단일 어종에 집중하지 마십시오. 참치(안정적 현금흐름)와 오징어(높은 시세차익 기회)를 6:4 비율로 포트폴리오를 구성하면, 참치의 안정성이 오징어 시세 급락기의 손실을 헤지하고, 오징어의 고수익이 참치 마진 정체기를 보완합니다. 분기별 리밸런싱 시 ENSO 전망과 RFMO 쿼터 발표를 기준으로 비중을 조정."
      />
    </div>
  );
}
