'use client';
import React, { useState } from 'react';
import s from './VdsStrategyMatrix.module.css';
import { Target, Activity, Zap, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { nationalVds } from '@/lib/fleet-operations-2026-08-23';
import { getVdsBurnCell, getVdsCompanyBurn } from '@/lib/data/vds-company-burn';

// ─── Data ───
const companies = ['동원산업', '사조산업', '사조씨푸드', '사조오양', '신라교역'];
const zones = ['PNG', 'Solomon', 'Kiribati', 'Tuvalu', 'Nauru', 'FSM'];
const years = ['2023', '2024', '2025', '2026'];

// [Year][Company][Zone] - 미경실 조업일수 대장 (scripts/sync_vds_burn.py 산출)
const vdsBurn = getVdsCompanyBurn();
const heatmapData: Record<string, Record<string, Record<string, { remaining: number; rate: number }>>> = {};
for (const y of years) {
  heatmapData[y] = {};
  for (const c of companies) {
    heatmapData[y][c] = {};
    for (const z of zones) {
      const cell = getVdsBurnCell(y, c, z);
      heatmapData[y][c][z] = { remaining: cell?.remaining ?? 0, rate: cell?.ratePct ?? 0 };
    }
  }
}

const companyColors: Record<string, string> = {
  '동원산업': '#3b82f6', // blue
  '사조산업': '#f59e0b', // amber
  '사조씨푸드': '#f97316', // orange
  '사조오양': '#ef4444', // red
  '신라교역': '#10b981'  // emerald
};

const nationalZoneNames: Record<string, string> = {
  PNG: '파푸아뉴기니',
  Solomon: '솔로몬제도',
  Kiribati: '키리바시',
  Tuvalu: '투발루',
  Nauru: '나우루',
  FSM: '미크로네시아',
};

const currentSillaZone = (zone: string) => {
  const current = nationalVds.areas.find((item) => item.area === nationalZoneNames[zone]);
  const total = current?.totals.allocated ?? 0;
  const consumed = current?.totals.consumed ?? 0;
  return {
    total,
    consumed,
    remaining: current?.totals.remaining ?? 0,
    rate: total > 0 ? Math.round(consumed / total * 100) : 0,
  };
};

const sillaData = zones.map((zone) => ({ zone, ...currentSillaZone(zone) }));

const intelFeed = vdsBurn.recentEvents;

export default function VdsStrategyMatrix() {
  const [activeYear, setActiveYear] = useState('2026');
  const [activeZone, setActiveZone] = useState('Solomon');

  const getCellClass = (remaining: number) => {
    if (remaining < -10) return s.cellCritical;
    if (remaining < 0) return s.cellDanger;
    if (remaining < 5) return s.cellWarning;
    return s.cellSafe;
  };

  // V3 라이트: 흰 배경 가독용 진한 톤 (라이트 --w-red/amber/emerald-500 계열)
  const getBarColor = (remaining: number) => {
    if (remaining < 0) return '#e3595e';
    if (remaining < 2) return '#d97706';
    return '#689735';
  };

  // Generate chart data based on activeZone
  const chartData = years.map(y => {
    const dataObj: any = { year: y };
    companies.forEach(c => {
      dataObj[c] = heatmapData[y][c][activeZone].remaining;
    });
    return dataObj;
  });

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div>
          <h2 className={s.title}><Target size={22} className={s.titleIcon} /> VDS Strategy Matrix</h2>
          <div className={s.subtitle}>2023~2026 수역별 조업일수(VDS) 시계열 트렌드 및 경쟁사 전략 분석 · 미경실 대장 {vdsBurn.asOf} 기준</div>
        </div>
        <div className={s.yearTabs}>
          {years.map(y => (
            <button 
              key={y} 
              className={`${s.yearTab} ${activeYear === y ? s.activeYear : ''}`}
              onClick={() => setActiveYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* TOP SECTION: Heatmap + Current Assets/Intel */}
      <div className={s.grid}>
        {/* Left: Competitor Heatmap */}
        <div className={s.panel}>
          <div className={s.panelTitle}>
            <span><Activity size={16} style={{display:'inline', marginRight:6, verticalAlign:'-3px'}}/>{activeYear}년 VDS 소진율 히트맵</span>
          </div>
          <table className={s.heatmapTable}>
            <thead>
              <tr>
                <th></th>
                {zones.map(z => <th key={z} className={s.heatmapTh}>{z}</th>)}
              </tr>
            </thead>
            <tbody>
              {companies.map(company => (
                <tr key={company}>
                  <td className={s.heatmapCompany}>{company}</td>
                  {zones.map(zone => {
                    const data = activeYear === '2026' && company === '신라교역'
                      ? currentSillaZone(zone)
                      : heatmapData[activeYear][company][zone];
                    return (
                      <td key={zone}>
                        <div className={`${s.heatmapCell} ${getCellClass(data.remaining)}`}>
                          <span className={s.cellValue}>{data.remaining > 0 ? '+' : ''}{data.remaining.toFixed(1)}</span>
                          <span className={s.cellRate}>{data.rate}%</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Silla Assets & Intel Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className={s.panel} style={{ flex: 1 }}>
            <div className={s.panelTitle}>
              <span>신라교역 VDS 자산 현황 (2026 기준)</span>
            </div>
            <div className={s.subtitle}>{nationalVds.source} · {nationalVds.asOf} 기준</div>
            <div className={s.assetList}>
              {sillaData.map(item => (
                <div key={item.zone} className={s.assetRow}>
                  <div className={s.assetHeader}>
                    <span className={s.assetZone}>{item.zone}</span>
                    <span className={s.assetStats}>가용 {item.total} / 소진 {item.consumed}</span>
                    <span className={s.assetRemaining} style={{ color: getBarColor(item.remaining) }}>
                      {item.remaining > 0 ? '+' : ''}{item.remaining.toFixed(2)}일
                    </span>
                  </div>
                  <div className={s.barTrack}>
                    <div 
                      className={s.barFill} 
                      style={{ 
                        transform: `scaleX(${Math.min(1, item.consumed / item.total)})`,
                        background: getBarColor(item.remaining)
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={s.panel} style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
            <div className={s.panelTitle} style={{ padding: 'var(--space-4) var(--space-5) 0' }}>
              <span><Zap size={16} style={{display:'inline', marginRight:6, verticalAlign:'-3px', color:'var(--w-amber-500)'}}/>최신 VDS 트레이딩 인텔리전스</span>
            </div>
            <div className={s.feedContainer}>
              {intelFeed.map((feed, idx) => (
                <div key={idx} className={s.feedItem}>
                  <span className={s.feedDate}>[{feed.date}]</span>
                  <span className={s.feedMsg}>{feed.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Line Chart Trend Analyzer */}
      <div className={s.panel} style={{ marginTop: 'var(--space-6)' }}>
        <div className={s.panelTitle} style={{ marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span><TrendingUp size={16} style={{display:'inline', marginRight:6, verticalAlign:'-3px'}}/>수역별 조업일수(VDS) 잔여일수 4개년 트렌드</span>
            <select 
              value={activeZone} 
              onChange={(e) => setActiveZone(e.target.value)}
              className={s.zoneSelect}
            >
              {zones.map(z => <option key={z} value={z}>{z} 수역</option>)}
            </select>
          </div>
        </div>
        <div style={{ height: 300, width: '100%', marginTop: 24 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="year" stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-400)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-400)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.9)', border: '1px solid var(--w-navy-900)', borderRadius: 8, fontSize: 13 }}
                itemStyle={{ fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
              {companies.map(c => (
                <Line 
                  key={c}
                  type="monotone" 
                  dataKey={c} 
                  stroke={companyColors[c]} 
                  strokeWidth={3}
                  activeDot={{ r: 6 }} 
                  dot={{ r: 4, fill: 'var(--dsc-surface)', strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </SafeResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
