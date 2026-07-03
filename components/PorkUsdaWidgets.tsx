'use client';
import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart,
} from 'recharts';
import { Globe, MapPin, AlertTriangle, Activity } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { getUsdaWidgetData } from '@/lib/data/usda-widgets';

const rawData = getUsdaWidgetData('pork');

type Widget = {
  id: string; title: string; subtitle: string; cardDesc: string; chartType: string;
  pillar: string; xKey: string;
  bars?: { key: string; name: string; color: string }[];
  lines?: { key: string; name: string; color: string }[];
  data: any[]; unit: string; sit: string; strat: string; source: string;
  telemetry: 'LIVE' | 'SYNCED' | 'STATIC'; syncDate: string;
};

const COMMA = (n: number) => Number(n).toLocaleString();

function buildChart(w: Widget): React.ReactElement {
  const type = (w.chartType || '').toLowerCase();
  const data = w.data || [];

  if (type === 'bar') {
    return (
      <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
        <XAxis dataKey={w.xKey} stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
        <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} tickFormatter={(v: number) => COMMA(v)} />
        <Tooltip
          contentStyle={{ background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0' }}
          formatter={(v: any) => COMMA(Number(v))}
        />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
        {(w.bars || []).map((b) => (<Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} />))}
      </BarChart>
    );
  }

  return (
    <ComposedChart data={data} margin={{ top: 10, right: 30, left: -10, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
      <XAxis dataKey={w.xKey} stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
      <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} tickFormatter={(v: number) => COMMA(v)} />
      <YAxis yAxisId="right" orientation="right" stroke="rgba(220,38,38,0.5)" tick={{ fill: 'rgba(220,38,38,0.7)', fontSize: 10 }} tickFormatter={(v: number) => COMMA(v)} />
      <Tooltip
        contentStyle={{ background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0' }}
        formatter={(v: any) => COMMA(Number(v))}
      />
      <Legend wrapperStyle={{ fontSize: '11px' }} />
      {(w.bars || []).map((b) => (<Bar key={b.key} yAxisId="left" dataKey={b.key} name={b.name} fill={b.color} />))}
      {(w.lines || []).map((l) => (<Line key={l.key} yAxisId="right" type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2} dot={{ fill: l.color, r: 3 }} />))}
    </ComposedChart>
  );
}

const ICONS: Record<string, any> = {
  w_china_pork_dominance: Globe,
  w_spain_pork_eu_leader: MapPin,
  w_asf_global_spread: AlertTriangle,
  w_us_korea_pork_timeline: Activity,
  w_us_pork_top_importers: Globe,
};

export default function PorkUsdaWidgets({ filterPillar }: { filterPillar?: 'S1' | 'S3' | 'S4' } = {}) {
  const widgets = (rawData as any).widgets as Widget[];
  const filtered = filterPillar
    ? widgets.filter((w) => w.pillar === filterPillar)
    : widgets;

  return (
    <>
      {filtered.map((w) => {
        const Icon = ICONS[w.id] || Globe;
        return (
          <WidgetCard
            key={w.id}
            title={w.title}
            icon={Icon}
            iconColor="#f97316"
            pillar={w.pillar as any}
            cardDesc={w.cardDesc}
            telemetry={{ status: w.telemetry, syncDate: w.syncDate }}
            chart={buildChart(w)}
            chartHeight={280}
            takeaway={{
              situation: w.sit,
              actionPlan: w.strat,
              source: w.source,
            }}
          />
        );
      })}
    </>
  );
}
