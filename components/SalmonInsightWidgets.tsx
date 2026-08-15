import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Globe, Anchor, TrendingUp, DollarSign, Layers, Factory, Target, Ship, Zap, AlertCircle, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import WidgetCard, { Pillar } from './WidgetCard';
import { ChartPatternDefs, getA11yBarProps } from './ChartPatterns';

const DATA_URL = '/data/salmon_real_data_v2.json';
const COLORS = ['#f97316', '#0ea5e9', 'var(--color-success)', '#8b5cf6', '#f43f5e', 'var(--color-warning)', '#eab308', '#38bdf8'];

const PILLAR_BY_ID: Record<string, Pillar> = {
  w01_paradigm: 'S1',
  w02_aqua_value: 'S2',
  w03_aqua_pie: 'S1',
  w04_proc: 'S2',
  w05_cash: 'S2',
  w06_trade_vol: 'S3',
  w07_export: 'S4',
  w08_import: 'S4',
  w09_kr_import: 'S4',
  w10_kr_deficit: 'S4',
  w11_kr_price: 'S4',
  w12_margin: 'S4',
};

const formatNum = (v: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v);

// Scale-aware compact axis formatter: avoids "10657653k" by stepping B/M/k.
const compactAxis = (v: number) => {
  if (v == null || isNaN(v)) return '';
  const abs = Math.abs(v);
  if (abs >= 1e9) return (v / 1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return (v / 1e3).toFixed(0) + 'k';
  return String(v);
};

// Render-time Korean mapping for chart name/pie labels (L-01: no English residuals).
const KO_NAME: Record<string, string> = {
  'United Kingdom of Great Britain and Northern Ireland': '영국',
  'Netherlands (Kingdom of the)': '네덜란드',
  'China, Hong Kong SAR': '홍콩',
  'Taiwan Province of China': '대만',
  'Colombia': '콜롬비아',
  'Kazakhstan': '카자흐스탄',
  'Thailand': '태국',
  'Myanmar': '미얀마',
};
const koName = (n: string) => KO_NAME[n] || n;

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#0F172A', padding: '12px', border: 'none', borderRadius: '8px', color: 'var(--w-slate-50)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--w-slate-400)', fontWeight: 600 }}>{label}</p>
        {payload.map((entry: any, index: number) => {
          let valLabel = typeof entry.value === 'number' ? formatNum(entry.value) : entry.value;
          if (typeof entry.value === 'number' && entry.name.includes('$') || entry.name.includes('USD') || entry.name.includes('단가')) {
            valLabel = '$' + formatNum(entry.value);
          }
          if (isNaN(entry.value)) valLabel = "데이터 없음";
          return (
            <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '0.9rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
              <span style={{ color: entry.color, fontWeight: 500 }}>{entry.name}:</span>
              <span style={{ fontWeight: 700 }}>{valLabel}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function SalmonInsightWidgets() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(DATA_URL).then(res => res.json()).then(setData);
  }, []);

  if (!data || !data.widgets) {
    return <div style={{ color: 'var(--w-slate-400)', padding: '2rem', textAlign: 'center' }}>대서양 연어 인텔리전스 데이터 마이닝 중...</div>;
  }

  const wMap = data.widgets.reduce((acc: any, w: any) => ({...acc, [w.id]: w}), {});

  const renderWidget = (id: string, Icon: any) => {
    const w = wMap[id];
    if (!w) return null;

    let ChartComponent: React.ReactNode = <div />;

    if (w.chartType === 'area') {
      ChartComponent = (
        <AreaChart data={w.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {(w.series || w.lines || w.bars || []).map((s: any, idx: number) => (
              <linearGradient key={`color-${idx}`} id={`color-${w.id}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color || s.fill} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={s.color || s.fill} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey={w.xAxis} stroke="var(--w-slate-400)" fontSize={11} tickMargin={8} />
          <YAxis stroke="var(--w-slate-400)" fontSize={11} tickFormatter={compactAxis} />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          {(w.series || w.lines || w.bars || []).map((s: any, idx: number) => (
            <Area key={idx} type="monotone" dataKey={s.dataKey} stroke={s.color || s.stroke} strokeWidth={3} fill={`url(#color-${w.id}-${idx})`} />
          ))}
        </AreaChart>
      );
    } else if (w.chartType === 'line') {
      ChartComponent = (
        <LineChart data={w.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey={w.xAxis} stroke="var(--w-slate-400)" fontSize={11} tickMargin={8} />
          <YAxis stroke="var(--w-slate-400)" fontSize={11} tickFormatter={compactAxis} />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          {(w.series || w.lines || w.bars || []).map((s: any, idx: number) => (
            <Line key={idx} type="monotone" dataKey={s.dataKey} stroke={s.color || s.stroke} strokeWidth={3} dot={false} />
          ))}
        </LineChart>
      );
    } else if (w.chartType === 'bar') {
      ChartComponent = w.xAxis === 'name' ? (
        <BarChart data={w.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
          <XAxis type="number" stroke="var(--w-slate-400)" fontSize={11} tickFormatter={compactAxis} />
          <YAxis dataKey={w.xAxis} type="category" stroke="var(--w-slate-50)" fontSize={10} width={120} tick={{fill: 'var(--w-slate-200)'}} tickFormatter={koName} />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          {(w.series || w.lines || w.bars || []).map((s: any, idx: number) => {
            const p = getA11yBarProps(idx);
            return <Bar key={idx} dataKey={s.dataKey} fill={p.fill} color={(s.color || s.fill) || p.color} radius={[0, 4, 4, 0]} />;
          })}
        </BarChart>
      ) : (
        <BarChart data={w.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey={w.xAxis} stroke="var(--w-slate-400)" fontSize={11} tickMargin={8} />
          <YAxis stroke="var(--w-slate-400)" fontSize={11} tickFormatter={compactAxis} />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          {(w.series || w.lines || w.bars || []).map((s: any, idx: number) => {
            const p = getA11yBarProps(idx);
            return <Bar key={idx} dataKey={s.dataKey} fill={p.fill} color={(s.color || s.fill) || p.color} radius={[4, 4, 0, 0]} />;
          })}
        </BarChart>
      );
    } else if (w.chartType === 'pie') {
      ChartComponent = (
        <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <Pie
            data={w.data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }: any) => `${koName(name)} ${((percent || 0) * 100).toFixed(1)}%`}
          >
            {w.data.map((_entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
        </PieChart>
      );
    }

    return (
      <WidgetCard
        key={w.id}
        title={w.title}
        icon={Icon}
        iconColor="var(--color-info)"
        pillar={PILLAR_BY_ID[w.id] || 'S1'}
        cardDesc={w.cardDesc || w.methodology || 'FAOSTAT 정적 데이터셋 기반 (최신 관측 2022년)'}
        telemetry={{ status: 'STATIC', syncDate: w.syncDate || '2022 (FAOSTAT)' }}
        chart={ChartComponent as React.ReactElement}
        chartHeight={360}
        takeaway={{
          situation: w.situation,
          actionPlan: w.takeaway,
          source: w.source || 'FAOSTAT (FishStatJ) — 최신 관측연도 2022',
        }}
      />
    );
  };

  const widgetList: Array<[string, any]> = [
    ['w01_paradigm', Globe],
    ['w02_aqua_value', DollarSign],
    ['w03_aqua_pie', Factory],
    ['w04_proc', Layers],
    ['w05_cash', TrendingUp],
    ['w06_trade_vol', Ship],
    ['w07_export', Target],
    ['w08_import', ShoppingCart],
    ['w09_kr_import', AlertCircle],
    ['w10_kr_deficit', Zap],
    ['w11_kr_price', TrendingUp],
    ['w12_margin', Anchor],
  ];

  return (
    <>
      {widgetList.map(([id, Icon], idx) => (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
        >
          {renderWidget(id, Icon)}
        </motion.div>
      ))}
    </>
  );
}
