'use client';
import React, { useRef, useState, useEffect } from 'react';
import { TrendingDown } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { getSquidData } from '@/lib/data/squid';

const data = getSquidData('winnersLosers');

const SHORT_NAMES: Record<string, string> = {
  'China': '중국', 'Peru': '페루', 'Japan': '일본', 'Republic of Korea': '한국',
  'Taiwan Province of China': '대만', 'India': '인도', 'Argentina': '아르헨티나',
  'Indonesia': '인도네시아', 'Thailand': '태국', 'Falkland Islands (Malvinas)': '포클랜드',
  'Spain': '스페인', 'Viet Nam': '베트남', 'United States of America': '미국',
  'Morocco': '모로코', 'Philippines': '필리핀',
};

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

export default function SquidWinnersLosers() {
  const ref = useRef<HTMLDivElement>(null);
  const w = useContainerWidth(ref);
  const mobile = w > 0 && w < 500;

  const sorted = [...(data as any[])].sort((a, b) => b.ChangePct - a.ChangePct);
  const maxCatch = Math.max(...sorted.map(d => Math.max(d.y2014, d.y2024)));

  const body = (
    <div ref={ref} style={{ width: '100%' }}>
      {w > 0 && (
        <svg width={w} height={sorted.length * 50 + 60} style={{ overflow: 'visible' }}>
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
                <text x={mobile ? 5 : 10} y={y + 5} fill="rgba(255,255,255,0.7)" fontSize={mobile ? 10 : 12} fontWeight={600}>
                  {name}
                </text>
                <circle cx={leftX + leftW} cy={y} r={5} fill="#64748b" stroke="#94a3b8" strokeWidth={1} />
                <circle cx={rightX - (barWidth * 0.4 - rightW)} cy={y} r={5} fill={color} stroke={isGain ? '#34d399' : '#fca5a5'} strokeWidth={1} />
                <line
                  x1={leftX + leftW} y1={y}
                  x2={rightX - (barWidth * 0.4 - rightW)} y2={y}
                  stroke={color} strokeWidth={2} strokeOpacity={0.6}
                  markerEnd={`url(#arrow-${isGain ? 'up' : 'down'})`}
                />
                <text x={leftX + leftW} y={y - 10} fill="#94a3b8" fontSize={9} textAnchor="middle">
                  {(d.y2014 / 1000).toFixed(0)}k
                </text>
                <text x={rightX - (barWidth * 0.4 - rightW)} y={y - 10} fill={color} fontSize={9} textAnchor="middle">
                  {(d.y2024 / 1000).toFixed(0)}k
                </text>
                <text x={w - 5} y={y + 5} fill={color} fontSize={mobile ? 10 : 11} fontWeight={700} textAnchor="end">
                  {d.ChangePct > 0 ? '+' : ''}{d.ChangePct.toFixed(0)}%
                </text>
              </g>
            );
          })}

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
  );

  return (
    <WidgetCard
      title="최근 10년의 승자와 패자 (2014 vs 2024)"
      icon={TrendingDown}
      iconColor="#10b981"
      pillar="S1"
      cardDesc="2014년 대비 2024년 어획량 변화. 선의 기울기가 급할수록 극적인 변화를 의미합니다."
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      customBody={body}
      takeaway={{
        situation: `<div>
<p>"승자가 없는(No Winners)" 시나리오란 모든 주요 어업국이 동반 감소하는 산업 위기.</p>
<p>10년 변화(2014→2024): <strong>일본 -75.8% · 한국 -71.7% · 페루 -69.7% 어획량 급감</strong>. 중국·아르헨티나도 감소세. 자원 고갈 압력 현실화.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 전통 조업 모델 붕괴. <strong>"양식 + 대체 어종 portfolio 다변화"</strong>가 본질.</p>
<p><strong>3단계</strong>: ① 연근해·남대서양·포클랜드 조업 의존도 대폭 축소 ② Off-take 선도 거래로 수입 물량 안정 확보 ③ 양식 기술 투자 + 펠라직 대체 어종(고등어·갈치) 포트폴리오 다변화.</p>
</div>`,
        source: "FAO FishStatJ 오징어 어획 통계 (2014-2024, 정적 데이터)",
      }}
    />
  );
}
