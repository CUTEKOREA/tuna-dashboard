'use client';
import React from 'react';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, PieChart, Pie, Cell,
} from 'recharts';
import { Anchor, Globe, Shield, Compass, Fish, Ship } from 'lucide-react';
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

const COMMA = (n: number) => Number(n).toLocaleString();

function buildChart(w: Widget): React.ReactElement {
  const type = (w.chartType || '').toLowerCase();
  const data = w.data || [];

  if (type === 'pie') {
    const pieKey = w.pieDataKey || 'share';
    return (
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
          contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0' }}
          formatter={(v: any) => [`${v}${w.unit}`, '비중']}
        />
      </PieChart>
    );
  }

  if (type === 'bar') {
    return (
      <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey={w.xKey} stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
        <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} tickFormatter={(v: number) => COMMA(v)} />
        <Tooltip
          contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0' }}
          formatter={(v: any) => COMMA(Number(v))}
        />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
        {(w.bars || []).map((b) => (
          <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} />
        ))}
      </BarChart>
    );
  }

  // Composed (default - stacked bar)
  return (
    <ComposedChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
      <XAxis dataKey={w.xKey} stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
      <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} tickFormatter={(v: number) => COMMA(v)} />
      <Tooltip
        contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0' }}
        formatter={(v: any) => COMMA(Number(v))}
      />
      <Legend wrapperStyle={{ fontSize: '11px' }} />
      {(w.bars || []).map((b) => (
        <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} stackId="a" />
      ))}
    </ComposedChart>
  );
}

const ICONS: Record<string, any> = {
  w_wcpfc_species_5y: Fish,
  w_wcpfc_country_2024: Globe,
  w_china_dwf_fleet: Ship,
  w_iattc_stock_status: Shield,
  w_iotc_gear_mix: Compass,
  w_wcpfc_billfish_5y: Anchor,
};

/**
 * Pillar별 RFMO 위젯 렌더링.
 *
 * - filterPillar 미지정: 5개 전체 (이전 standalone 페이지 호환)
 * - filterPillar='S1': WCPFC 어종 5년 + WCPFC 어업국 + IOTC 어업유형 (3건)
 * - filterPillar='S5': IATTC 자원상태 + WCPFC 빌피쉬 혼획 (2건)
 *
 * TunaDashboard의 5-Pillar section grid 내에서 Fragment로 들어감.
 */
export default function TunaRFMOLibrarian({ filterPillar }: { filterPillar?: 'S1' | 'S5' } = {}) {
  const widgets = (rawData as any).widgets as Widget[];
  const filtered = filterPillar
    ? widgets.filter((w) => w.pillar === filterPillar)
    : widgets;

  return (
    <>
      {filtered.map((w) => {
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
            chart={buildChart(w)}
            chartHeight={260}
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
