'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TermTooltip from './TermTooltip';
import { useResponsiveChart } from '../lib/useResponsiveChart';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const volumeData = [
  { year: '2019', Total: 171219 },
  { year: '2020', Total: 154978 },
  { year: '2021', Total: 154059 },
  { year: '2022', Total: 149351 },
  { year: '2023', Total: 123566 },
  { year: '2024', Total: 145311 },
  { year: '2025', Total: 112986 },
  { year: '2026 (YTD)', Total: 33704 }
];

const monthly2026Data = [
  { month: 'Jan', Volume: 4920 },
  { month: 'Feb', Volume: 11968 },
  { month: 'Mar', Volume: 8757 },
  { month: 'Apr', Volume: 8059 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#0F172A',
        border: '1px solid var(--panel-border)',
        borderRadius: '8px',
        padding: '12px 16px',
        color: 'var(--text-main)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <h4 style={{ margin: '0 0 12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>{label}년 젠산 반입량</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', width: '150px' }}>
          <span style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#8b5cf6', borderRadius: '50%' }}></div>
            Total
          </span>
          <span style={{ fontWeight: 'bold' }}>{payload[0].value.toLocaleString()} 톤</span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomTooltipMonthly = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#0F172A',
        border: '1px solid var(--panel-border)',
        borderRadius: '8px',
        padding: '12px 16px',
        color: 'var(--text-main)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <h4 style={{ margin: '0 0 12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>2026년 {label}월 젠산 반입량</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', width: '150px' }}>
          <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-success)', borderRadius: '50%' }}></div>
            Volume
          </span>
          <span style={{ fontWeight: 'bold' }}>{payload[0].value.toLocaleString()} 톤</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function GensanImportChart() {
  const rc = useResponsiveChart();

  return (
    <div style={{
      backgroundColor: 'var(--panel-bg)',
      border: '1px solid var(--panel-border)',
      borderRadius: rc.isMobile ? '12px' : '16px',
      padding: rc.isMobile ? '16px 12px' : '24px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ marginBottom: rc.isMobile ? '12px' : '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: rc.isMobile ? '14px' : '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            <TermTooltip term="Tuna Volume Brought into Gensan" description="필리핀 제너럴 산토스(Gensan) 항구로 유입된 참치 물량 연도별/월별 추이입니다. (Fresh Tuna 제외)" /> <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 'normal' }}>| 연간 및 2026 월별 반입량</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            단위: Metric Tons / Historical Data (2019-2025) & 2026 YTD
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: rc.isMobile ? '12px' : '24px', width: '100%', height: rc.isMobile ? 'auto' : '350px', flexDirection: rc.isTablet ? 'column' : 'row' }}>
        {/* Left Side: Historical Data */}
        <div style={{ flex: rc.isTablet ? 'none' : '3', minWidth: 0, position: 'relative', height: rc.isTablet ? '280px' : '100%' }}>
          <SafeResponsiveContainer width="100%" height={300}>
            <BarChart
              data={volumeData}
              margin={{ top: 25, right: 10, left: 10, bottom: 5 }}
              barSize={rc.isMobile ? 18 : 40}
            >
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="year" 
                stroke="var(--text-muted)" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: rc.tickFontSize }}
                dy={10}
              />
              <YAxis 
                stroke="var(--text-muted)" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: rc.tickFontSize }}
                width={rc.isMobile ? 30 : 45}
                tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: rc.legendFontSize }} />
              <Bar dataKey="Total" name="연간 총 반입량" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                <LabelList content={(props: any) => {
                  const { x, y, width, height, value } = props;
                  if (!value || height < 15) return null;
                  return <text x={x + width / 2} y={y - 10} fill="#8b5cf6" textAnchor="middle" fontSize={10} fontWeight="bold">{(Number(value) / 1000).toFixed(1)}k</text>;
                }} />
              </Bar>
            </BarChart>
          </SafeResponsiveContainer>
        </div>

        {/* Right Side: 2026 Monthly */}
        <div style={{ flex: rc.isTablet ? 'none' : '1', minWidth: rc.isTablet ? 'auto' : '220px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '16px 12px 16px 0', display: 'flex', flexDirection: 'column', height: rc.isTablet ? '200px' : 'auto' }}>
          <h3 style={{ fontSize: '13px', margin: '0 0 16px 20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', background: 'var(--color-success)', borderRadius: '50%', boxShadow: '0 0 6px #10b981' }} />
            2026 Monthly Trend Breakdown
          </h3>
          <div style={{ flex: 1 }}>
            <SafeResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly2026Data} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <ChartPatternDefs />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="month" axisLine={false} tickLine={false} stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltipMonthly />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="Volume" fill="var(--color-success)" barSize={24} radius={[0, 4, 4, 0]}>
                   <LabelList content={(props: any) => {
                     const { x, y, width, height, value } = props;
                     if (!value) return null;
                     return <text x={x + width + 5} y={y + height / 2} fill="var(--color-success)" textAnchor="start" dominantBaseline="central" fontSize={10} fontWeight="bold">{(Number(value) / 1000).toFixed(1)}k</text>;
                   }} />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
            YTD Total: <strong style={{ color: 'var(--text-main)' }}>33,704 톤</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
