'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Cell, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const tt = { backgroundColor: 'rgba(0, 0, 0, 0.2)', border: 'none', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' };
const ttLabel = { color: '#f8fafc', fontWeight: 700, fontSize: '0.85rem' };
const ttItem = { color: '#e2e8f0', fontSize: '0.82rem' };

export function MarketGrowthChart({ data }: { data: any[] }) {
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}B`} />
        <Tooltip contentStyle={tt} labelStyle={ttLabel} itemStyle={ttItem} formatter={(v: any) => `$${v}B`} />
        <Legend wrapperStyle={{ paddingTop: 10 }} />
        <Area type="monotone" dataKey="domestic" name="국내 시장" fill="rgba(59,130,246,0.15)" stroke="var(--color-info)" strokeWidth={2} />
        <Bar dataKey="export" name="수출 규모" fill="var(--color-success)" radius={[4,4,0,0]} barSize={20} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

export function MarketShareChart({ data }: { data: any[] }) {
  const colors: Record<string,string> = { '일본차': 'var(--color-danger)', '한국차': 'var(--color-info)', '유럽차': 'var(--color-warning)', '기타': '#64748b' };
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
        <Tooltip contentStyle={tt} labelStyle={ttLabel} itemStyle={ttItem} formatter={(v: any) => `${v}%`} />
        <Legend wrapperStyle={{ paddingTop: 10 }} />
        {Object.keys(colors).map(k => <Bar key={k} dataKey={k} stackId="a" fill={colors[k]} />)}
      </BarChart>
    </SafeResponsiveContainer>
  );
}

export function ShippingCostChart({ data }: { data: any[] }) {
  return (
    <SafeResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
        <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v.toLocaleString()}`} />
        <YAxis type="category" dataKey="route" width={160} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <Tooltip contentStyle={tt} labelStyle={ttLabel} itemStyle={ttItem} formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
        <Legend wrapperStyle={{ paddingTop: 10 }} />
        <Bar dataKey="roro" name="RoRo" fill="var(--color-success)" barSize={14} radius={[0,4,4,0]} />
        <Bar dataKey="container" name="컨테이너" fill="var(--color-warning)" barSize={14} radius={[0,4,4,0]} />
      </BarChart>
    </SafeResponsiveContainer>
  );
}

export function HybridGrowthChart({ data }: { data: any[] }) {
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}B`} />
        <Tooltip contentStyle={tt} labelStyle={ttLabel} itemStyle={ttItem} formatter={(v: any) => `$${v}B`} />
        <Legend wrapperStyle={{ paddingTop: 10 }} />
        <Bar dataKey="내연기관" stackId="a" fill="#64748b" />
        <Bar dataKey="하이브리드" stackId="a" fill="#8b5cf6" />
        <Bar dataKey="전기차" stackId="a" fill="var(--color-success)" radius={[4,4,0,0]} />
      </BarChart>
    </SafeResponsiveContainer>
  );
}

export function FuelPriceChart({ data }: { data: any[] }) {
  return (
    <SafeResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="country" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="$" />
        <Tooltip contentStyle={tt} labelStyle={ttLabel} itemStyle={ttItem} formatter={(v: any) => `$${v}/L`} />
        <Bar dataKey="price" name="연료가격($/L)" radius={[4,4,0,0]} barSize={28}>
          {data.map((e, i) => <Cell key={i} fill={e.price > 1.5 ? 'var(--color-danger)' : 'var(--color-warning)'} />)}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

export function AgePenaltyChart({ data }: { data: any[] }) {
  return (
    <SafeResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="range" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
        <Tooltip contentStyle={tt} labelStyle={ttLabel} itemStyle={ttItem} formatter={(v: any) => `${v}%`} />
        <Bar dataKey="penalty" name="페널티율" radius={[4,4,0,0]} barSize={32}>
          {data.map((e, i) => <Cell key={i} fill={e.penalty >= 50 ? 'var(--color-danger)' : e.penalty >= 20 ? 'var(--color-warning)' : 'var(--color-success)'} />)}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}
