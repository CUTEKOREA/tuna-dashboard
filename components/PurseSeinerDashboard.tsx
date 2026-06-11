'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Treemap, Legend
} from 'recharts';
import { Ship, Globe, Flag, Building2, Link2, Search, Download, ChevronUp, ChevronDown, X, Filter, Database, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  vessels, RFMO_COLORS, TOTAL_VESSELS, MULTI_RFMO_COUNT,
  TOTAL_FLAGS, TOTAL_OPERATORS, TOTAL_RFMOS,
  getRfmoStats, getFlagStats, getOperatorStats, getContinentStats,
  FLAG_EMOJI, type PurseSeinerVessel
} from '../data/purseSeinerData';
import TelemetryBadge from './TelemetryBadge';

/* ───────── 데이터 기준일 (data/purseSeinerData.ts 최종 검증일) ───────── */
const DATA_DATE = '2026-05-27';

/* ───────── L-01 한글 매핑 (데이터 키는 영문 유지, 렌더링만 한글) ───────── */
const RFMO_NAMES_KO: Record<string, string> = {
  WCPFC: '중서부태평양수산위원회',
  IOTC: '인도양참치위원회',
  IATTC: '전미열대참치위원회',
  ICCAT: '대서양참치보존위원회',
};

const FLAG_KO: Record<string, string> = {
  'South Korea': '한국', 'Chinese Taipei': '대만', 'China': '중국', 'Japan': '일본',
  'Spain': '스페인', 'France': '프랑스', 'Ecuador': '에콰도르', 'Mexico': '멕시코',
  'Seychelles': '세이셸', 'Mauritius': '모리셔스', 'Iran': '이란', 'Indonesia': '인도네시아',
  'Philippines': '필리핀', 'Thailand': '태국', 'Ghana': '가나', 'Colombia': '콜롬비아',
  'Panama': '파나마', 'Italy': '이탈리아', 'Oman': '오만', 'Kenya': '케냐',
  'Tanzania': '탄자니아', 'Venezuela': '베네수엘라', 'Turkey': '튀르키예', 'Senegal': '세네갈',
  'Brazil': '브라질', "Côte d'Ivoire": '코트디부아르', 'FSM (Micronesia)': '미크로네시아',
  'Marshall Islands': '마셜제도',
};

const CONTINENT_KO: Record<string, string> = {
  'Asia': '아시아', 'Europe': '유럽', 'Americas': '아메리카', 'Africa': '아프리카',
  'Indian Ocean Islands': '인도양 도서국', 'Middle East': '중동',
  'Pacific Islands': '태평양 도서국', 'Other': '기타',
};

const flagKo = (f: string) => FLAG_KO[f] || f;

/* ───────── Styles ───────── */
const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '20px 24px',
  ...extra,
});

const sectionTitle: React.CSSProperties = {
  fontSize: 18, fontWeight: 700, color: '#e2e8f0',
  marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
};

const badge = (color: string): React.CSSProperties => ({
  display: 'inline-block', padding: '2px 10px', borderRadius: 12,
  fontSize: 11, fontWeight: 600, color: '#fff',
  background: color, lineHeight: '18px',
});

/* ───────── W-04 위젯 헤더 (제목 + cardDesc + TelemetryBadge) ───────── */
function WidgetHead({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ ...sectionTitle, marginBottom: 4, justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{icon} {title}</span>
        <TelemetryBadge status="STATIC" syncDate={DATA_DATE} />
      </div>
      <p style={{ margin: 0, fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

/* ───────── KPI Card ───────── */
function KpiCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: number; sub?: string; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{
        ...card(),
        flex: '1 1 160px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 6, textAlign: 'center', minWidth: 140,
        borderTop: `3px solid ${color}`,
      }}
    >
      <div style={{ color, opacity: 0.9 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>
        <CountUp end={value} duration={1.6} separator="," />
      </div>
      <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#64748b' }}>{sub}</div>}
    </motion.div>
  );
}

/* ───────── RFMO Donut ───────── */
function RfmoDonut() {
  const rfmoStats = useMemo(() => getRfmoStats(), []);
  const data = Object.entries(rfmoStats)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, s]) => ({ name, value: s.count, color: RFMO_COLORS[name] || '#6b7280' }));

  const renderLabel = ({ name, percent }: any) =>
    `${name} ${(percent * 100).toFixed(0)}%`;

  return (
    <div style={{ ...card(), flex: '1 1 340px' }}>
      <WidgetHead
        icon={<Globe size={18} style={{ color: '#3b82f6' }} />}
        title="RFMO별 분포"
        desc="출처: 4개 RFMO(지역수산관리기구) 공개 선박 레지스트리 — IMO 검증 통과 선박의 RFMO 등록 수 집계 (다중 등록 선박은 기구별 중복 집계)"
      />
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={110}
            paddingAngle={3} dataKey="value" label={renderLabel}
            labelLine={{ stroke: '#475569', strokeWidth: 1 }}>
            {data.map((d, i) => <Cell key={i} fill={d.color} stroke="transparent" />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 13 }}
            formatter={(v: number, name: string) => [`${v}척`, RFMO_NAMES_KO[name] || name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
        {data.map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
            {d.name}: <strong style={{ color: '#e2e8f0' }}>{d.value}</strong>척
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── RFMO Detail Cards ───────── */
function RfmoCards({ onFilter }: { onFilter: (rfmo: string) => void }) {
  const rfmoStats = useMemo(() => getRfmoStats(), []);

  return (
    <div style={{ ...card(), flex: '1 1 340px' }}>
      <WidgetHead
        icon={<Database size={18} style={{ color: '#10b981' }} />}
        title="RFMO 상세"
        desc="RFMO별 선박 수·상위 선적국·주요 운영사 집계 — 카드 클릭 시 하단 명부 필터 적용"
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(rfmoStats)
          .sort((a, b) => b[1].count - a[1].count)
          .map(([rfmo, s]) => {
            const topFlags = Object.entries(s.flags).sort((a, b) => b[1] - a[1]).slice(0, 3);
            const topOps = Object.entries(s.operators).sort((a, b) => b[1] - a[1]).slice(0, 2);
            return (
              <motion.div key={rfmo}
                whileHover={{ scale: 1.02 }}
                onClick={() => onFilter(rfmo)}
                style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: 12,
                  padding: '12px 16px', cursor: 'pointer',
                  border: `1px solid ${RFMO_COLORS[rfmo]}33`,
                  transition: 'all .2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={badge(RFMO_COLORS[rfmo])}>{rfmo}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{RFMO_NAMES_KO[rfmo] || rfmo}</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>{s.count}척</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span>🏳 {topFlags.map(([f, c]) => `${FLAG_EMOJI[f] || ''} ${flagKo(f)} ${c}`).join(', ')}</span>
                </div>
                {topOps.length > 0 && (
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    🏢 {topOps.map(([o, c]) => `${o} (${c})`).join(', ')}
                  </div>
                )}
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}

/* ───────── Country Bar Chart ───────── */
function CountryBarChart({ onFilter }: { onFilter: (flag: string) => void }) {
  const flagStats = useMemo(() => getFlagStats().slice(0, 15), []);

  const data = flagStats.map(s => ({
    name: `${FLAG_EMOJI[s.flag] || ''} ${flagKo(s.flag)}`,
    flag: s.flag,
    count: s.count,
  }));

  return (
    <div style={{ ...card(), flex: '1 1 420px' }}>
      <WidgetHead
        icon={<Flag size={18} style={{ color: '#f59e0b' }} />}
        title="국가별 선박 수 (상위 15개국)"
        desc="선적국(Flag State) 기준 보유 선박 수 상위 15개국 집계 — 막대 클릭 시 하단 명부 필터 적용"
      />
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical" margin={{ left: 130, right: 20, top: 5, bottom: 5 }}
          onClick={(e: any) => { if (e?.activePayload?.[0]) onFilter(e.activePayload[0].payload.flag); }}>
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={120} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 13 }}
            formatter={(v: number) => [`${v}척`, '선박 수']}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} cursor="pointer">
            {data.map((_, i) => (
              <Cell key={i} fill={`hsl(${200 + i * 8}, 70%, ${55 - i * 1.5}%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ───────── Continent Treemap ───────── */
function ContinentTreemap() {
  const continentStats = useMemo(() => getContinentStats(), []);
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
  const data = continentStats.map((s, i) => ({
    name: CONTINENT_KO[s.continent] || s.continent,
    size: s.count,
    fill: colors[i % colors.length],
  }));

  const CustomContent = (props: any) => {
    const { x, y, width, height, name, size, fill } = props;
    if (width < 40 || height < 30) return null;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} rx={6}
          style={{ fill, stroke: '#0f172a', strokeWidth: 2, opacity: 0.85 }} />
        <text x={x + width / 2} y={y + height / 2 - 8} textAnchor="middle"
          style={{ fill: '#fff', fontSize: 13, fontWeight: 700 }}>{name}</text>
        <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle"
          style={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{size}척</text>
      </g>
    );
  };

  return (
    <div style={{ ...card(), flex: '1 1 340px' }}>
      <WidgetHead
        icon={<Globe size={18} style={{ color: '#8b5cf6' }} />}
        title="대륙·권역별 분포"
        desc="선적국의 대륙·권역 매핑 기준 선박 수 집계 (인도양·태평양 도서국은 별도 권역 분류)"
      />
      <ResponsiveContainer width="100%" height={280}>
        <Treemap data={data} dataKey="size" nameKey="name"
          content={<CustomContent />} animationDuration={800} />
      </ResponsiveContainer>
    </div>
  );
}

/* ───────── Operator Chart ───────── */
function OperatorChart({ onFilter }: { onFilter: (op: string) => void }) {
  const opStats = useMemo(() => getOperatorStats().slice(0, 15), []);

  const data = opStats.map(s => ({
    name: s.operator.length > 25 ? s.operator.substring(0, 22) + '…' : s.operator,
    fullName: s.operator,
    count: s.count,
    rfmos: s.rfmos.join(', '),
  }));

  const naCount = vessels.filter(v => v.operator === 'N/A').length;

  return (
    <div style={{ ...card(), flex: '1 1 420px' }}>
      <WidgetHead
        icon={<Building2 size={18} style={{ color: '#ec4899' }} />}
        title="주요 운영사 (상위 15개사)"
        desc="운영사 식별 선박만 집계(미식별 제외) — 운영사명은 레지스트리 원문 표기, 막대 클릭 시 하단 명부 필터 적용"
      />
      {naCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', marginBottom: 12, borderRadius: 8,
          background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)',
          fontSize: 12, color: '#f59e0b',
        }}>
          <AlertTriangle size={14} />
          운영사 미식별: {naCount}척 ({(naCount / TOTAL_VESSELS * 100).toFixed(1)}%)
        </div>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical" margin={{ left: 180, right: 20, top: 5, bottom: 5 }}
          onClick={(e: any) => { if (e?.activePayload?.[0]) onFilter(e.activePayload[0].payload.fullName); }}>
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={170} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 13 }}
            formatter={(v: number, _: any, props: any) => [
              `${v}척 | RFMO: ${props.payload.rfmos}`, '선박 수'
            ]}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} cursor="pointer">
            {data.map((_, i) => (
              <Cell key={i} fill={`hsl(${320 + i * 6}, 65%, ${55 - i * 1.2}%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ───────── Operator × RFMO Heatmap ───────── */
function OperatorRfmoMatrix() {
  const opStats = useMemo(() => getOperatorStats().slice(0, 12), []);
  const rfmos = ['WCPFC', 'IOTC', 'IATTC', 'ICCAT'];

  const matrix = useMemo(() => {
    return opStats.map(op => {
      const row: any = { operator: op.operator.length > 20 ? op.operator.substring(0, 18) + '…' : op.operator };
      rfmos.forEach(r => {
        row[r] = vessels.filter(v => v.operator === op.operator && v.rfmos.includes(r)).length;
      });
      return row;
    });
  }, [opStats]);

  const maxVal = Math.max(...matrix.flatMap(r => rfmos.map(rfmo => r[rfmo])));

  return (
    <div style={{ ...card(), flex: '1 1 340px' }}>
      <WidgetHead
        icon={<Link2 size={18} style={{ color: '#06b6d4' }} />}
        title="운영사 × RFMO 매트릭스"
        desc="상위 12개 운영사의 RFMO별 등록 선박 수 교차 집계 — 다중 해역 조업 운영사 식별용"
      />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 3, fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', color: '#94a3b8', padding: '6px 8px', fontWeight: 600 }}>운영사</th>
              {rfmos.map(r => (
                <th key={r} style={{ textAlign: 'center', padding: '6px 8px' }}>
                  <span style={badge(RFMO_COLORS[r])}>{r}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td style={{ color: '#cbd5e1', padding: '4px 8px', whiteSpace: 'nowrap' }}>{row.operator}</td>
                {rfmos.map(r => {
                  const val = row[r];
                  const intensity = maxVal > 0 ? val / maxVal : 0;
                  return (
                    <td key={r} style={{
                      textAlign: 'center', padding: '4px 8px', borderRadius: 6,
                      background: val > 0 ? `rgba(59, 130, 246, ${0.1 + intensity * 0.6})` : 'transparent',
                      color: val > 0 ? '#e2e8f0' : '#475569',
                      fontWeight: val > 0 ? 600 : 400,
                    }}>
                      {val || '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────── Vessel Search Table ───────── */
function VesselTable({ initialRfmo, initialFlag, initialOperator }: {
  initialRfmo?: string; initialFlag?: string; initialOperator?: string;
}) {
  const [search, setSearch] = useState('');
  const [rfmoFilter, setRfmoFilter] = useState(initialRfmo || '');
  const [flagFilter, setFlagFilter] = useState(initialFlag || '');
  const [opFilter, setOpFilter] = useState(initialOperator || '');
  const [sortKey, setSortKey] = useState<keyof PurseSeinerVessel | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 30;

  // Reset page when filters change
  const filtered = useMemo(() => {
    let result = [...vessels];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        v.name.toLowerCase().includes(q) || v.imo.includes(q) || v.operator.toLowerCase().includes(q)
      );
    }
    if (rfmoFilter) result = result.filter(v => v.rfmos.includes(rfmoFilter));
    if (flagFilter) result = result.filter(v => v.flag === flagFilter);
    if (opFilter) result = result.filter(v => v.operator === opFilter);

    if (sortKey) {
      result.sort((a, b) => {
        let av = a[sortKey as keyof PurseSeinerVessel];
        let bv = b[sortKey as keyof PurseSeinerVessel];
        if (av === null) av = '';
        if (bv === null) bv = '';
        if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
        return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
      });
    }
    return result;
  }, [search, rfmoFilter, flagFilter, opFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key as any);
      setSortDir('asc');
    }
  };

  const resetFilters = () => {
    setSearch(''); setRfmoFilter(''); setFlagFilter(''); setOpFilter('');
    setSortKey(''); setPage(1);
  };

  // Update from parent props
  React.useEffect(() => { if (initialRfmo) { setRfmoFilter(initialRfmo); setPage(1); } }, [initialRfmo]);
  React.useEffect(() => { if (initialFlag) { setFlagFilter(initialFlag); setPage(1); } }, [initialFlag]);
  React.useEffect(() => { if (initialOperator) { setOpFilter(initialOperator); setPage(1); } }, [initialOperator]);

  const exportCSV = () => {
    const headers = ['Vessel Name', 'IMO Number', 'Owner/Operator', 'GT', 'Flag State', 'RFMO'];
    const rows = filtered.map(v => [v.name, v.imo, v.operator, v.gt || 'N/A', v.flag, v.rfmos.join('/')]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'purse_seiner_verified.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const allFlags = [...new Set(vessels.map(v => v.flag))].sort((a, b) => flagKo(a).localeCompare(flagKo(b), 'ko'));
  const allOps = [...new Set(vessels.map(v => v.operator).filter(o => o !== 'N/A'))].sort();

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const hasFilters = search || rfmoFilter || flagFilter || opFilter;

  return (
    <div style={card()} id="vessel-table-section">
      <WidgetHead
        icon={<Search size={18} style={{ color: '#06b6d4' }} />}
        title="전체 선박 검색"
        desc="IMO 체크디짓 검증 통과 선박 전수 명부 — 선박명·IMO·운영사 검색, RFMO·선적국·운영사 필터, CSV 내려받기 지원"
      />

      {/* Filter Bar */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12,
        padding: '12px 16px', background: 'rgba(255,255,255,0.02)',
        borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: '#64748b' }} />
          <input
            type="text" placeholder="선박명 / IMO / 운영사 검색..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{
              width: '100%', padding: '7px 10px 7px 30px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: '#e2e8f0', fontSize: 13, outline: 'none',
            }}
          />
        </div>
        <select value={rfmoFilter} onChange={e => { setRfmoFilter(e.target.value); setPage(1); }}
          style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#e2e8f0', fontSize: 12, cursor: 'pointer' }}>
          <option value="">전체 RFMO</option>
          {['WCPFC', 'IOTC', 'IATTC', 'ICCAT'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={flagFilter} onChange={e => { setFlagFilter(e.target.value); setPage(1); }}
          style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#e2e8f0', fontSize: 12, cursor: 'pointer', maxWidth: 150 }}>
          <option value="">전체 국가</option>
          {allFlags.map(f => <option key={f} value={f}>{FLAG_EMOJI[f] || ''} {flagKo(f)}</option>)}
        </select>
        <select value={opFilter} onChange={e => { setOpFilter(e.target.value); setPage(1); }}
          style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#e2e8f0', fontSize: 12, cursor: 'pointer', maxWidth: 180 }}>
          <option value="">전체 운영사</option>
          {allOps.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {hasFilters && (
          <button onClick={resetFilters}
            style={{
              padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
            <X size={12} /> 초기화
          </button>
        )}
        <button onClick={exportCSV}
          style={{
            padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)',
            background: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
          <Download size={12} /> CSV
        </button>
      </div>

      {/* Result Count */}
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Filter size={12} />
        검색 결과: <strong style={{ color: '#e2e8f0' }}>{filtered.length}척</strong> / 전체 {TOTAL_VESSELS}척
        {hasFilters && <span style={{ color: '#f59e0b' }}> (필터 적용 중)</span>}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '10px 8px', color: '#64748b', textAlign: 'left', fontSize: 11, fontWeight: 600 }}>#</th>
              {[
                { key: 'name', label: '선박명', w: 200 },
                { key: 'imo', label: 'IMO 번호', w: 90 },
                { key: 'operator', label: '선주/운영사', w: 200 },
                { key: 'gt', label: '총톤수(GT)', w: 70 },
                { key: 'flag', label: '선적국', w: 130 },
              ].map(col => (
                <th key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{
                    padding: '10px 8px', color: '#94a3b8', textAlign: 'left',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer', userSelect: 'none',
                    minWidth: col.w,
                  }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {col.label} <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
              <th style={{ padding: '10px 8px', color: '#94a3b8', textAlign: 'left', fontSize: 11, fontWeight: 600 }}>RFMO</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((v, i) => (
              <motion.tr key={v.imo + v.name}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.015 }}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'background .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '8px', color: '#475569', fontSize: 11 }}>{(page - 1) * pageSize + i + 1}</td>
                <td style={{ padding: '8px', color: '#e2e8f0', fontWeight: 500 }}>{v.name}</td>
                <td style={{ padding: '8px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>{v.imo}</td>
                <td style={{ padding: '8px', color: v.operator === 'N/A' ? '#475569' : '#cbd5e1', fontStyle: v.operator === 'N/A' ? 'italic' : 'normal' }}>
                  {v.operator === 'N/A' ? '미식별' : v.operator}
                </td>
                <td style={{ padding: '8px', color: v.gt ? '#e2e8f0' : '#475569', textAlign: 'right' }}>
                  {v.gt ? v.gt.toLocaleString() : '—'}
                </td>
                <td style={{ padding: '8px', color: '#cbd5e1', fontSize: 12 }}>
                  {FLAG_EMOJI[v.flag] || ''} {flagKo(v.flag)}
                </td>
                <td style={{ padding: '8px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {v.rfmos.map(r => (
                      <span key={r} style={badge(RFMO_COLORS[r] || '#6b7280')}>{r}</span>
                    ))}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
          marginTop: 16, fontSize: 13, color: '#94a3b8',
        }}>
          <button onClick={() => setPage(1)} disabled={page === 1}
            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: page === 1 ? '#334155' : '#94a3b8', cursor: page === 1 ? 'default' : 'pointer' }}>
            ≪
          </button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: page === 1 ? '#334155' : '#94a3b8', cursor: page === 1 ? 'default' : 'pointer' }}>
            ‹
          </button>
          <span style={{ minWidth: 80, textAlign: 'center' }}>
            <strong style={{ color: '#e2e8f0' }}>{page}</strong> / {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: page === totalPages ? '#334155' : '#94a3b8', cursor: page === totalPages ? 'default' : 'pointer' }}>
            ›
          </button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: page === totalPages ? '#334155' : '#94a3b8', cursor: page === totalPages ? 'default' : 'pointer' }}>
            ≫
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ MAIN DASHBOARD ═══════════════════════ */
export default function PurseSeinerDashboard() {
  const [tableRfmo, setTableRfmo] = useState('');
  const [tableFlag, setTableFlag] = useState('');
  const [tableOp, setTableOp] = useState('');

  const scrollToTable = () => {
    document.getElementById('vessel-table-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const filterByRfmo = useCallback((rfmo: string) => {
    setTableRfmo(rfmo); setTableFlag(''); setTableOp('');
    setTimeout(scrollToTable, 100);
  }, []);

  const filterByFlag = useCallback((flag: string) => {
    setTableFlag(flag); setTableRfmo(''); setTableOp('');
    setTimeout(scrollToTable, 100);
  }, []);

  const filterByOp = useCallback((op: string) => {
    setTableOp(op); setTableRfmo(''); setTableFlag('');
    setTimeout(scrollToTable, 100);
  }, []);

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Ship size={28} style={{ color: '#3b82f6' }} />
          글로벌 참치 선망선 DB
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            IMO 체크디짓 검증 완료 · {TOTAL_VESSELS}척 · 최종 검증: {DATA_DATE}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
            background: 'rgba(16, 185, 129, 0.15)', color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            <CheckCircle2 size={12} /> IMO 검증 통과
          </span>
        </div>
      </motion.div>

      {/* Section 1: KPI Cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <KpiCard icon={<Ship size={24} />} label="총 선박" value={TOTAL_VESSELS} sub="IMO 검증 완료" color="#3b82f6" />
        <KpiCard icon={<Globe size={24} />} label="RFMO" value={TOTAL_RFMOS} sub="해역 관리 기구" color="#10b981" />
        <KpiCard icon={<Flag size={24} />} label="선적국" value={TOTAL_FLAGS} sub="국가" color="#f59e0b" />
        <KpiCard icon={<Building2 size={24} />} label="운영사" value={TOTAL_OPERATORS} sub="식별 완료" color="#ec4899" />
        <KpiCard icon={<Link2 size={24} />} label="다중 RFMO" value={MULTI_RFMO_COUNT} sub="2+ 해역 등록" color="#8b5cf6" />
      </div>

      {/* Section 2: RFMO Analysis */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <RfmoDonut />
        <RfmoCards onFilter={filterByRfmo} />
      </div>

      {/* Section 3: Country Analysis */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <CountryBarChart onFilter={filterByFlag} />
        <ContinentTreemap />
      </div>

      {/* Section 4: Operator Analysis */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <OperatorChart onFilter={filterByOp} />
        <OperatorRfmoMatrix />
      </div>

      {/* Section 5: Search Table */}
      <VesselTable initialRfmo={tableRfmo} initialFlag={tableFlag} initialOperator={tableOp} />

      {/* Footer */}
      <div style={{
        marginTop: 24, padding: '12px 16px', borderRadius: 12,
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        fontSize: 11, color: '#475569', textAlign: 'center',
      }}>
        데이터 출처: RFMO 공개 레지스트리 기반 수집 · IMO 체크디짓 검증 + 등차수열 패턴 탐지 적용 ·
        검증 통과율: 22.9% (155/678) · 일부 선박의 실존 여부는 추가 교차 검증 필요
      </div>
    </div>
  );
}
