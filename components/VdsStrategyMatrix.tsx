'use client';
import React, { useState } from 'react';
import s from './VdsStrategyMatrix.module.css';
import { Target, Activity, Zap, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';

// ─── Data ───
const companies = ['동원산업', '사조산업', '사조씨푸드', '사조오양', '신라교역'];
const zones = ['PNG', 'Solomon', 'Kiribati', 'Tuvalu', 'Nauru', 'FSM'];
const years = ['2023', '2024', '2025', '2026'];

// Combined Data [Year][Company][Zone]
const heatmapData: Record<string, Record<string, Record<string, { remaining: number; rate: number }>>> = {
  '2023': {
    '동원산업': { 'PNG': { remaining: 7.79, rate: 99 }, 'Solomon': { remaining: 9.09, rate: 76 }, 'Kiribati': { remaining: 87.22, rate: 94 }, 'Tuvalu': { remaining: 2.04, rate: 97 }, 'Nauru': { remaining: 10.06, rate: 83 }, 'FSM': { remaining: 5.28, rate: 96 } },
    '사조산업': { 'PNG': { remaining: -44.31, rate: 111 }, 'Solomon': { remaining: -7.41, rate: 112 }, 'Kiribati': { remaining: -30.53, rate: 105 }, 'Tuvalu': { remaining: -48.82, rate: 134 }, 'Nauru': { remaining: -4.70, rate: 116 }, 'FSM': { remaining: -15.51, rate: 119 } },
    '사조씨푸드': { 'PNG': { remaining: 9.08, rate: 90 }, 'Solomon': { remaining: 5.24, rate: 69 }, 'Kiribati': { remaining: 27.54, rate: 78 }, 'Tuvalu': { remaining: 22.05, rate: 24 }, 'Nauru': { remaining: 3.03, rate: 68 }, 'FSM': { remaining: 3.92, rate: 81 } },
    '사조오양': { 'PNG': { remaining: 36.71, rate: 58 }, 'Solomon': { remaining: 3.02, rate: 82 }, 'Kiribati': { remaining: -1.75, rate: 101 }, 'Tuvalu': { remaining: 26.32, rate: 9 }, 'Nauru': { remaining: -1.63, rate: 117 }, 'FSM': { remaining: 11.88, rate: 43 } },
    '신라교역': { 'PNG': { remaining: 0.10, rate: 100 }, 'Solomon': { remaining: 0.16, rate: 100 }, 'Kiribati': { remaining: 99.40, rate: 91 }, 'Tuvalu': { remaining: -56.30, rate: 271 }, 'Nauru': { remaining: 1.34, rate: 95 }, 'FSM': { remaining: 0.36, rate: 99 } }
  },
  '2024': {
    '동원산업': { 'PNG': { remaining: 0.27, rate: 100 }, 'Solomon': { remaining: 3.17, rate: 99 }, 'Kiribati': { remaining: 80.00, rate: 90 }, 'Tuvalu': { remaining: 0.88, rate: 100 }, 'Nauru': { remaining: 0.28, rate: 98 }, 'FSM': { remaining: 0.09, rate: 100 } },
    '사조산업': { 'PNG': { remaining: 26.76, rate: 95 }, 'Solomon': { remaining: 34.46, rate: 88 }, 'Kiribati': { remaining: 35.00, rate: 95 }, 'Tuvalu': { remaining: 26.22, rate: 79 }, 'Nauru': { remaining: -12.29, rate: 156 }, 'FSM': { remaining: -9.85, rate: 107 } },
    '사조씨푸드': { 'PNG': { remaining: -9.80, rate: 109 }, 'Solomon': { remaining: -23.88, rate: 168 }, 'Kiribati': { remaining: -10.0, rate: 110 }, 'Tuvalu': { remaining: -20.44, rate: 246 }, 'Nauru': { remaining: 7.94, rate: 12 }, 'FSM': { remaining: 4.71, rate: 78 } },
    '사조오양': { 'PNG': { remaining: -5.55, rate: 104 }, 'Solomon': { remaining: -9.10, rate: 126 }, 'Kiribati': { remaining: -5.0, rate: 105 }, 'Tuvalu': { remaining: -3.79, rate: 127 }, 'Nauru': { remaining: 4.90, rate: 46 }, 'FSM': { remaining: 5.37, rate: 74 } },
    '신라교역': { 'PNG': { remaining: 3.52, rate: 100 }, 'Solomon': { remaining: 0.53, rate: 100 }, 'Kiribati': { remaining: 20.00, rate: 95 }, 'Tuvalu': { remaining: 0.72, rate: 99 }, 'Nauru': { remaining: -0.19, rate: 102 }, 'FSM': { remaining: 0.38, rate: 100 } }
  },
  '2025': {
    '동원산업': { 'PNG': { remaining: 24.24, rate: 98 }, 'Solomon': { remaining: 11.84, rate: 97 }, 'Kiribati': { remaining: 30.28, rate: 81 }, 'Tuvalu': { remaining: 0.31, rate: 99 }, 'Nauru': { remaining: 0.00, rate: 100 }, 'FSM': { remaining: 0.19, rate: 100 } },
    '사조산업': { 'PNG': { remaining: 17.70, rate: 97 }, 'Solomon': { remaining: -34.00, rate: 116 }, 'Kiribati': { remaining: 36.05, rate: 83 }, 'Tuvalu': { remaining: 18.40, rate: 76 }, 'Nauru': { remaining: -4.65, rate: 116 }, 'FSM': { remaining: -14.98, rate: 112 } },
    '사조씨푸드': { 'PNG': { remaining: 11.67, rate: 87 }, 'Solomon': { remaining: -12.34, rate: 129 }, 'Kiribati': { remaining: 4.61, rate: 89 }, 'Tuvalu': { remaining: -33.67, rate: 260 }, 'Nauru': { remaining: -1.52, rate: 130 }, 'FSM': { remaining: 4.58, rate: 70 } },
    '사조오양': { 'PNG': { remaining: 1.44, rate: 98 }, 'Solomon': { remaining: -3.55, rate: 108 }, 'Kiribati': { remaining: -12.41, rate: 130 }, 'Tuvalu': { remaining: 14.60, rate: 30 }, 'Nauru': { remaining: 9.90, rate: 38 }, 'FSM': { remaining: 10.42, rate: 50 } },
    '신라교역': { 'PNG': { remaining: 6.49, rate: 99 }, 'Solomon': { remaining: -7.39, rate: 102 }, 'Kiribati': { remaining: 35.85, rate: 87 }, 'Tuvalu': { remaining: 0.90, rate: 99 }, 'Nauru': { remaining: 1.56, rate: 97 }, 'FSM': { remaining: 0.07, rate: 100 } }
  },
  '2026': {
    '동원산업': { 'PNG': { remaining: 387.80, rate: 14 }, 'Solomon': { remaining: 1.09, rate: 99 }, 'Kiribati': { remaining: 80.95, rate: 84 }, 'Tuvalu': { remaining: 59.97, rate: 64 }, 'Nauru': { remaining: 28.81, rate: 86 }, 'FSM': { remaining: 21.57, rate: 85 } },
    '사조산업': { 'PNG': { remaining: 271.80, rate: 5 }, 'Solomon': { remaining: 42.08, rate: 57 }, 'Kiribati': { remaining: 10.64, rate: 95 }, 'Tuvalu': { remaining: -2.48, rate: 103 }, 'Nauru': { remaining: 19.60, rate: 78 }, 'FSM': { remaining: 26.38, rate: 59 } },
    '사조씨푸드': { 'PNG': { remaining: 58.00, rate: 0 }, 'Solomon': { remaining: -2.40, rate: 113 }, 'Kiribati': { remaining: 5.04, rate: 88 }, 'Tuvalu': { remaining: 4.50, rate: 76 }, 'Nauru': { remaining: -0.30, rate: 102 }, 'FSM': { remaining: 12.00, rate: 0 } },
    '사조오양': { 'PNG': { remaining: 52.80, rate: 9 }, 'Solomon': { remaining: -25.50, rate: 206 }, 'Kiribati': { remaining: 16.66, rate: 61 }, 'Tuvalu': { remaining: 3.70, rate: 81 }, 'Nauru': { remaining: -1.70, rate: 111 }, 'FSM': { remaining: 4.00, rate: 67 } },
    '신라교역': { 'PNG': { remaining: 314.70, rate: 5 }, 'Solomon': { remaining: 20.20, rate: 54 }, 'Kiribati': { remaining: 34.10, rate: 95 }, 'Tuvalu': { remaining: 7.80, rate: 92 }, 'Nauru': { remaining: 19.50, rate: 86 }, 'FSM': { remaining: 32.20, rate: 34 } }
  }
};

const companyColors: Record<string, string> = {
  '동원산업': '#3b82f6', // blue
  '사조산업': '#f59e0b', // amber
  '사조씨푸드': '#f97316', // orange
  '사조오양': '#ef4444', // red
  '신라교역': '#10b981'  // emerald
};

// ... other constants (sillaData, intelFeed) stay same as 2026 ...
const sillaData = [
  { zone: 'PNG', total: 331.00, consumed: 16.30, remaining: 314.70, rate: 5 },
  { zone: 'Kiribati', total: 654.00, consumed: 619.80, remaining: 34.10, rate: 95 },
  { zone: 'Solomon', total: 44.00, consumed: 23.80, remaining: 20.20, rate: 54 },
  { zone: 'Tuvalu', total: 102.00, consumed: 94.20, remaining: 7.80, rate: 92 },
  { zone: 'Nauru', total: 142.00, consumed: 122.50, remaining: 19.50, rate: 86 },
  { zone: 'FSM', total: 49.00, consumed: 16.80, remaining: 32.20, rate: 34 },
];

const intelFeed = [
  { date: '05/31', msg: 'SVL to 사조 (Solomon 전배)' },
  { date: '05/19', msg: 'SVL to 사조 (Kiribati 전배)' },
  { date: '05/12', msg: 'SVL, TUSA to 사조 (Solomon)' },
  { date: '04/20', msg: 'PNG to 투발루 (PNG 전배)' },
  { date: '04/17', msg: 'KIRIKORE to 신라 (Tuvalu 전배) 및 PNG to 나우루' }
];

export default function VdsStrategyMatrix() {
  const [activeYear, setActiveYear] = useState('2026');
  const [activeZone, setActiveZone] = useState('Solomon');

  const getCellClass = (remaining: number) => {
    if (remaining < -10) return s.cellCritical;
    if (remaining < 0) return s.cellDanger;
    if (remaining < 5) return s.cellWarning;
    return s.cellSafe;
  };

  const getBarColor = (remaining: number) => {
    if (remaining < 0) return '#ef4444';
    if (remaining < 2) return '#fbbf24';
    return '#34d399';
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
          <div className={s.subtitle}>2023~2026 수역별 조업일수(VDS) 시계열 트렌드 및 경쟁사 전략 분석</div>
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
                    const data = heatmapData[activeYear][company][zone];
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
                        width: `${Math.min(100, (item.consumed / item.total) * 100)}%`,
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
              <span><Zap size={16} style={{display:'inline', marginRight:6, verticalAlign:'-3px', color:'#f59e0b'}}/>최신 VDS 트레이딩 인텔리전스</span>
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.9)', border: '1px solid #1a2442', borderRadius: 8, fontSize: 13 }}
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
                  dot={{ r: 4, fill: '#0a0f1f', strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </SafeResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
