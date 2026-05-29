'use client';
import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, PieChart, Pie, Cell,
} from 'recharts';
import { Anchor, Globe, Shield, Compass, Fish } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/tuna_librarian_v1.json';

type Widget = {
  id: string;
  title: string;
  subtitle: string;
  cardDesc: string;
  chartType: string;
  pillar: string;
  xKey: string;
  bars?: { key: string; name: string; color: string }[];
  pieDataKey?: string;
  data: any[];
  unit: string;
  sit: string;
  strat: string;
  source: string;
  telemetry: 'LIVE' | 'SYNCED' | 'STATIC';
  syncDate: string;
};

const COMMA = (n: number) => n.toLocaleString();

function renderChart(w: Widget) {
  const type = (w.chartType || '').toLowerCase();
  const data = w.data || [];

  if (type === 'pie') {
    const pieKey = w.pieDataKey || 'share';
    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey={pieKey}
            nameKey={w.xKey}
            cx="50%" cy="50%"
            innerRadius={45}
            outerRadius={80}
            paddingAngle={2}
            label={(e: any) => `${e[w.xKey]} ${e[pieKey]}%`}
          >
            {data.map((d: any, i: number) => (
              <Cell key={i} fill={d.fill || '#0ea5e9'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)' }}
            formatter={(v: any) => [`${v}${w.unit}`, '비중']}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey={w.xKey} stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10 }} tickFormatter={(v: number) => COMMA(v)} />
          <Tooltip
            contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)' }}
            formatter={(v: any) => COMMA(Number(v))}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          {(w.bars || []).map((b) => (
            <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Composed (default)
  return (
    <ResponsiveContainer width="100%" height={250}>
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey={w.xKey} stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} />
        <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10 }} tickFormatter={(v: number) => COMMA(v)} />
        <Tooltip
          contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)' }}
          formatter={(v: any) => COMMA(Number(v))}
        />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
        {(w.bars || []).map((b) => (
          <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} stackId="a" />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

const ICONS: Record<string, any> = {
  w_wcpfc_species_5y: Fish,
  w_wcpfc_country_2024: Globe,
  w_iattc_stock_status: Shield,
  w_iotc_gear_mix: Compass,
  w_wcpfc_billfish_5y: Anchor,
};

export default function TunaRFMOLibrarian() {
  const widgets = (rawData as any).widgets as Widget[];
  const meta = (rawData as any)._meta;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '1.75rem', fontWeight: 700,
          background: 'linear-gradient(135deg, #e2e8f0, #38bdf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem',
        }}>
          참치 RFMO 인텔리전스 (Librarian)
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          {meta.source} — 4대 RFMO 1차 자료에서 추출한 정량 데이터
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {meta.reports.map((r: string, i: number) => (
            <span key={i} style={{
              padding: '0.3rem 0.6rem',
              background: 'rgba(14,165,233,0.1)',
              border: '1px solid rgba(14,165,233,0.3)',
              borderRadius: '4px',
              fontSize: '0.78rem',
              color: '#7dd3fc',
            }}>{r}</span>
          ))}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        {widgets.map((w) => {
          const Icon = ICONS[w.id] || Fish;
          return (
            <WidgetCard
              key={w.id}
              title={w.title}
              icon={Icon}
              iconColor="#0ea5e9"
              pillar={w.pillar as any}
              cardDesc={w.cardDesc}
              telemetry={{ status: w.telemetry, syncDate: w.syncDate }}
              customBody={renderChart(w)}
              takeaway={{
                situation: `<p>${w.sit}</p>`,
                actionPlan: `<p>${w.strat}</p>`,
                source: w.source,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
