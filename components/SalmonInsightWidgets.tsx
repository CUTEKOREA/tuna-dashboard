import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Globe, Anchor, TrendingUp, DollarSign, Layers, Factory, Target, Ship, Zap, AlertCircle, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import WidgetCard, { Pillar } from './WidgetCard';

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

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#0F172A', padding: '12px', border: 'none', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{label}</p>
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
    return <div style={{ color: '#94a3b8', padding: '2rem', textAlign: 'center' }}>대서양 연어 인텔리전스 데이터 마이닝 중...</div>;
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
          <XAxis dataKey={w.xAxis} stroke="#94a3b8" fontSize={11} tickMargin={8} />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'} />
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
          <XAxis dataKey={w.xAxis} stroke="#94a3b8" fontSize={11} tickMargin={8} />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'} />
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
          <defs>
            {(w.series || w.lines || w.bars || []).map((s: any, idx: number) => (
              <linearGradient key={`color-${idx}`} id={`color-${w.id}-${idx}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={s.color || s.fill} stopOpacity={0.6}/>
                <stop offset="100%" stopColor={s.color || s.fill} stopOpacity={1}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'} />
          <YAxis dataKey={w.xAxis} type="category" stroke="#f8fafc" fontSize={10} width={120} tick={{fill: '#e2e8f0'}} />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          {(w.series || w.lines || w.bars || []).map((s: any, idx: number) => (
            <Bar key={idx} dataKey={s.dataKey} fill={`url(#color-${w.id}-${idx})`} radius={[0, 4, 4, 0]} />
          ))}
        </BarChart>
      ) : (
        <BarChart data={w.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {(w.series || w.lines || w.bars || []).map((s: any, idx: number) => (
              <linearGradient key={`color-${idx}`} id={`color-${w.id}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color || s.fill} stopOpacity={1}/>
                <stop offset="100%" stopColor={s.color || s.fill} stopOpacity={0.6}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey={w.xAxis} stroke="#94a3b8" fontSize={11} tickMargin={8} />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'} />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          {(w.series || w.lines || w.bars || []).map((s: any, idx: number) => (
            <Bar key={idx} dataKey={s.dataKey} fill={`url(#color-${w.id}-${idx})`} radius={[4, 4, 0, 0]} />
          ))}
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
            label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(1)}%`}
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
        cardDesc={w.methodology || '백엔드 스크립트를 통한 데이터 자동 정제'}
        telemetry={{ status: 'SYNCED', syncDate: '2024-Q4' }}
        chart={ChartComponent as React.ReactElement}
        chartHeight={360}
        takeaway={{
          situation: w.situation,
          actionPlan: w.takeaway,
          source: 'FAO FishStatJ 2024',
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
