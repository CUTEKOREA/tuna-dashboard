import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Globe, Anchor, TrendingUp, DollarSign, Layers, Factory, Target, Ship, Zap, AlertCircle, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TakeawayBox from './TakeawayBox';
import { ChartPatternDefs } from './ChartPatterns';

const DATA_URL = '/data/shrimp_real_data_v2.json';
const COLORS = ['var(--color-success)', 'var(--color-info)', 'var(--color-warning)', 'var(--color-danger)', '#8b5cf6', '#ec4899', '#14b8a6', '#0ea5e9'];

const formatNum = (v: number) => new Intl.NumberFormat('en-US').format(v);

// --- Custom Tooltip Hook ---
export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#0F172A', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}>
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

// --- Widget Wrapper Component ---
export const WidgetWrapper = ({ title, icon: Icon, term, desc, source, situation, takeaway, methodology, children }: any) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '8px' }}>
            <Icon size={18} color="var(--color-info)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>{title}</h3>
              <div 
                style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <AlertCircle size={14} color="#94a3b8" />
                <AnimatePresence>
                  {showTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: '100%',
                        transform: 'translateX(-50%)',
                        marginBottom: '8px',
                        background: '#0F172A',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '12px',
                        borderRadius: '8px',
                        width: '280px',
                        zIndex: 50,
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                        pointerEvents: 'none'
                      }}
                    >
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>작동 원리 및 계산 방식</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                        {methodology}
                      </p>
                      <div style={{ position: 'absolute', bottom: '-5px', left: '50%', marginLeft: '-5px', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid rgba(255,255,255,0.1)' }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{term} • {desc}</div>
          </div>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#64748b', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px' }}>
          {source}
        </div>
      </div>
      <div style={{ padding: '1rem', height: '420px', width: '100%' }}>
        {children}
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          situation={situation}
          actionPlan={takeaway}
        />
      </div>
    </div>
  );
};

export default function ShrimpInsightWidgets() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(DATA_URL).then(res => res.json()).then(setData);
  }, []);

  if (!data || !data.widgets) {
    return <div style={{ color: '#94a3b8', padding: '2rem', textAlign: 'center' }}>새우 인텔리전스 데이터 마이닝 중...</div>;
  }

  const wMap = data.widgets.reduce((acc: any, w: any) => ({...acc, [w.id]: w}), {});

  const renderWidget = (id: string, Icon: any) => {
    const w = wMap[id];
    if (!w) return null;
    
    let ChartComponent = <div />;
    
    if (w.chartType === 'area') {
      ChartComponent = (
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={w.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey={w.xAxis} stroke="#94a3b8" fontSize={11} tickMargin={8} />
            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            {w.series.map((s: any, idx: number) => (
               <Area key={idx} type="monotone" dataKey={s.dataKey} stroke={s.color} fill={s.color} fillOpacity={0.3} />
            ))}
          </AreaChart>
        </SafeResponsiveContainer>
      );
    } else if (w.chartType === 'line') {
      ChartComponent = (
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={w.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey={w.xAxis} stroke="#94a3b8" fontSize={11} tickMargin={8} />
            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            {w.series.map((s: any, idx: number) => (
               <Line key={idx} type="monotone" dataKey={s.dataKey} stroke={s.color} strokeWidth={3} dot={false} />
            ))}
          </LineChart>
        </SafeResponsiveContainer>
      );
    } else if (w.chartType === 'bar') {
      ChartComponent = (
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={w.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
            <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'} />
            <YAxis dataKey={w.xAxis} type="category" stroke="#f8fafc" fontSize={10} width={120} tick={{fill: '#e2e8f0'}} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            {w.series.map((s: any, idx: number) => (
               <Bar key={idx} dataKey={s.dataKey} fill={s.color} radius={[0, 4, 4, 0]} />
            ))}
          </BarChart>
        </SafeResponsiveContainer>
      );
    }

    return (
      <WidgetWrapper 
        key={w.id}
        title={w.title}
        icon={Icon}
        term={w.situation.split(' ')[0]} 
        desc={w.takeaway.split(' ')[0]}
        source="FAO FishStatJ 2024"
        situation={w.situation}
        takeaway={w.takeaway}
        methodology={w.methodology}
      >
        {ChartComponent}
      </WidgetWrapper>
    );
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        {renderWidget('w01_paradigm_shift', Globe)}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
        {renderWidget('w02_aqua_value', DollarSign)}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        {renderWidget('w03_processing', Factory)}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }}>
        {renderWidget('w04_top10_aqua', Layers)}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
        {renderWidget('w05_top10_catch', Anchor)}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.35 }}>
        {renderWidget('w06_top10_revenue', TrendingUp)}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
        {renderWidget('w07_trade_scaleup', Ship)}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.45 }}>
        {renderWidget('w08_top_exporter', Target)}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.5 }}>
        {renderWidget('w09_top_importer', ShoppingCart)}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.55 }}>
        {renderWidget('w10_kr_import', AlertCircle)}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.6 }}>
        {renderWidget('w11_kr_deficit', Zap)}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.65 }}>
        {renderWidget('w12_unit_price', TrendingUp)}
      </motion.div>
    </>
  );
}
