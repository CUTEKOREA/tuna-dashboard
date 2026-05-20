'use client';

import React, { useRef, useState, useEffect } from 'react';
import styles from './MackerelStrategy.module.css';
import { TrendingDown } from 'lucide-react';
import data from '../data/squid_winners_losers.json';
import TakeawayBox from './TakeawayBox';

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

const SHORT_NAMES: Record<string, string> = {
  'China': '중국', 'Peru': '페루', 'Japan': '일본', 'Republic of Korea': '한국',
  'Taiwan Province of China': '대만', 'India': '인도', 'Argentina': '아르헨티나',
  'Indonesia': '인도네시아', 'Thailand': '태국', 'Falkland Islands (Malvinas)': '포클랜드',
  'Spain': '스페인', 'Viet Nam': '베트남', 'United States of America': '미국',
  'Morocco': '모로코', 'Philippines': '필리핀'
};

export default function SquidWinnersLosers() {
  const ref = useRef<HTMLDivElement>(null);
  const w = useContainerWidth(ref);
  const mobile = w > 0 && w < 500;

  const sorted = [...(data as any[])].sort((a, b) => b.ChangePct - a.ChangePct);
  const maxCatch = Math.max(...sorted.map(d => Math.max(d.y2014, d.y2024)));

  return (
    <div className={styles.glassCard} style={{ padding: '1.5rem', borderColor: 'rgba(16,185,129,0.3)', marginTop: '2rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', marginBottom: '6px', fontWeight: 700, fontSize: '1.1rem' }}>
        <TrendingDown size={20} /> 최근 10년의 승자와 패자 (2014 vs 2024)
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginBottom: '1.2rem' }}>
        2014년 대비 2024년 어획량 변화. 선의 기울기가 급할수록 극적인 변화를 의미합니다.
      </p>

      <div ref={ref} style={{ width: '100%' }}>
        {w > 0 && (
          <svg width={w} height={sorted.length * 50 + 60} style={{ overflow: 'visible' }}>
            {/* Header */}
            <text x={mobile ? 80 : 120} y={20} fill="rgba(255,255,255,0.4)" fontSize={11} textAnchor="middle">2014</text>
            <text x={w - (mobile ? 80 : 120)} y={20} fill="rgba(255,255,255,0.4)" fontSize={11} textAnchor="middle">2024</text>

            {sorted.map((d: any, i: number) => {
              const y = 45 + i * 50;
              const leftX = mobile ? 80 : 120;
              const rightX = w - (mobile ? 80 : 120);
              const barWidth = rightX - leftX;
              const leftW = (d.y2014 / maxCatch) * barWidth * 0.4;
              const rightW = (d.y2024 / maxCatch) * barWidth * 0.4;
              const isGain = d.y2024 >= d.y2014;
              const color = isGain ? 'var(--color-success)' : 'var(--color-danger)';
              const name = SHORT_NAMES[d.Country] || d.Country;

              return (
                <g key={d.Country}>
                  {/* Country name */}
                  <text x={mobile ? 5 : 10} y={y + 5} fill="rgba(255,255,255,0.7)" fontSize={mobile ? 10 : 12} fontWeight={600}>
                    {name}
                  </text>
                  {/* 2014 dot */}
                  <circle cx={leftX + leftW} cy={y} r={5} fill="#64748b" stroke="#94a3b8" strokeWidth={1} />
                  {/* 2024 dot */}
                  <circle cx={rightX - (barWidth * 0.4 - rightW)} cy={y} r={5} fill={color} stroke={isGain ? '#34d399' : '#fca5a5'} strokeWidth={1} />
                  {/* Connecting line */}
                  <line
                    x1={leftX + leftW} y1={y}
                    x2={rightX - (barWidth * 0.4 - rightW)} y2={y}
                    stroke={color} strokeWidth={2} strokeOpacity={0.6}
                    markerEnd={`url(#arrow-${isGain ? 'up' : 'down'})`}
                  />
                  {/* Value labels */}
                  <text x={leftX + leftW} y={y - 10} fill="#94a3b8" fontSize={9} textAnchor="middle">
                    {(d.y2014 / 1000).toFixed(0)}k
                  </text>
                  <text x={rightX - (barWidth * 0.4 - rightW)} y={y - 10} fill={color} fontSize={9} textAnchor="middle">
                    {(d.y2024 / 1000).toFixed(0)}k
                  </text>
                  {/* Change % */}
                  <text x={w - 5} y={y + 5} fill={color} fontSize={mobile ? 10 : 11} fontWeight={700} textAnchor="end">
                    {d.ChangePct > 0 ? '+' : ''}{d.ChangePct.toFixed(0)}%
                  </text>
                </g>
              );
            })}

            {/* Arrow markers */}
            <defs>
              <marker id="arrow-up" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6" fill="var(--color-success)" />
              </marker>
              <marker id="arrow-down" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6" fill="var(--color-danger)" />
              </marker>
            </defs>
          </svg>
        )}
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          source="FAO FishStatJ Squid Catch Data (2014-2023)"
          situation="지난 10년간(2014-2023) 글로벌 오징어 어획량은 전례 없는 기후 위기(수온 상승)와 남획으로 인해 전 세계적인 동반 몰락을 겪고 있습니다. 일본(-75.8%), 한국(-71.7%), 페루(-69.7%) 등 주요국 어획량이 기하급수적으로 증발하며 '승자가 없는(No Winners)' 극단적인 자원 고갈 사태가 현실화되었습니다. 조업 강국이었던 중국과 아르헨티나 역시 감소세를 피하지 못했습니다."
          actionPlan="**[Actionable Insight]** 자체 선단의 어획량 증가에 베팅하는 전통적 조업 모델은 붕괴했습니다. 즉시 국내 연근해 및 남대서양/포클랜드 조업 의존도(Exposure)를 대폭 축소하고, 오프테이크(Off-take) 선도 거래를 통해 수입 물량을 안정 확보해야 합니다. 장기적으로는 양식 기술 투자 또는 오징어를 대체할 수 있는 타 펠라직 어종으로의 선단 포트폴리오 다변화가 필수 생존 전략입니다."
        />
      </div>
    </div>
  );
}
