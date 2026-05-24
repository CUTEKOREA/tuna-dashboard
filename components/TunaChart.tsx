'use client';

import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { useResponsiveChart } from '../lib/useResponsiveChart';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const uniquePayload = payload.filter((v: any, i: number, a: any[]) => 
      a.findIndex(t => t.name === v.name) === i
    );

    
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
return (
      <div style={{ 
        backgroundColor: 'var(--chart-tooltip-bg)', 
        border: '1px solid var(--chart-tooltip-border)', 
        borderRadius: '10px',
        color: 'var(--text-main)',
        padding: '8px 10px',
        fontSize: '0.78rem',
        maxWidth: '220px',
      }}>
        <p style={{ margin: '0 0 6px 0', fontWeight: 'bold' }}>{label}</p>
        {uniquePayload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color, margin: '3px 0' }}>
            {entry.name} : {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const renderCustomDot = (props: any) => {
  const { cx, cy, payload, index, value } = props;
  
  if (value == null) return null;

  // Check if we're on mobile to reduce annotation clutter
  const isMobileView = typeof window !== 'undefined' && window.innerWidth <= 480;

  if (payload.note) {
    return (
      <g key={`dot-${index}`}>
        <circle cx={cx} cy={cy} r={isMobileView ? 4 : 6} stroke="var(--bg-color)" strokeWidth={2} fill="var(--color-danger)" />
        {!isMobileView && (
          <text 
            x={cx} 
            y={cy - 12} 
            textAnchor="middle" 
            fill="var(--color-danger)" 
            fontSize={10} 
            fontWeight="bold"
            style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9), -1px -1px 3px rgba(0,0,0,0.9)' }}
          >
            {payload.note}
          </text>
        )}
      </g>
    );
  }
  
  return <circle key={`dot-${index}`} cx={cx} cy={cy} r={isMobileView ? 2 : 4} strokeWidth={2} stroke="var(--accent-warning)" fill="var(--bg-color)" />;
};

export default function TunaChart({ data }: { data: any[] }) {
  const [isClient, setIsClient] = useState(false);
  const rc = useResponsiveChart();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div style={{ width: '100%', height: '100%', minHeight: rc.isMobile ? '250px' : '400px' }} />;
  }

  return (
    <div style={{ width: '100%', height: rc.isMobile ? '280px' : rc.isTablet ? '350px' : '100%', position: 'relative' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart
          data={data}
          margin={rc.mainChartMargin}
        >
            <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
        <XAxis 
          dataKey="month" 
          stroke="var(--chart-axis)" 
          tickLine={false} 
          axisLine={false}
          dy={rc.isMobile ? 5 : 10}
          tick={{ fontSize: rc.tickFontSize }}
          interval={rc.isMobile ? 3 : rc.isTablet ? 2 : 1}
          angle={rc.isMobile ? -45 : 0}
        />
        <YAxis 
          yAxisId="left" 
          stroke="var(--chart-axis)" 
          domain={[0, 100000]} 
          tickFormatter={(value) => value === 0 ? '0k' : `${value / 1000}k`}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: rc.tickFontSize }}
          dx={rc.isMobile ? 0 : -10}
          width={rc.isMobile ? 30 : 45}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          stroke="var(--chart-axis)" 
          domain={[500, 2500]}
          ticks={[500, 1000, 1500, 2000, 2500]}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: rc.tickFontSize }}
          width={rc.isMobile ? 35 : 60}
          dx={0}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {!rc.isMobile && (
          <ReferenceLine 
            y={1593} 
            yAxisId="right" 
            stroke="rgba(255, 255, 255, 0.4)" 
            strokeDasharray="4 4" 
            label={{ position: 'insideTopRight', value: '5-Year Avg: $1,593', fill: 'rgba(255,255,255,0.6)', fontSize: rc.isTablet ? 9 : 11, dx: -10, dy: 10 }} 
          />
        )}
        <Legend 
          wrapperStyle={{ paddingTop: rc.isMobile ? '8px' : '20px', fontSize: rc.legendFontSize }} 
          iconType="square"
          iconSize={rc.isMobile ? 8 : 14}
        />
        
        {/* Estimated Data (Shown without 'Est.' labels) */}
        <Bar yAxisId="left" dataKey="importEst" name="Import Volume" fill="url(#a11y-stripe-h)" color="var(--accent-secondary)" fillOpacity={0.2} stroke="var(--accent-secondary)" strokeDasharray="4 4" strokeWidth={2} radius={[4, 4, 0, 0]} legendType="none" />
        <Bar yAxisId="left" dataKey="exportEst" name="Export Volume" fill="url(#a11y-diag)" color="var(--accent-primary)" fillOpacity={0.2} stroke="var(--accent-primary)" strokeDasharray="4 4" strokeWidth={2} radius={[4, 4, 0, 0]} legendType="none" />
        
        {/* Historical Data */}
        <Line yAxisId="right" type="monotone" dataKey="priceEst" name="SKJ CFR Price" stroke="var(--accent-warning)" strokeWidth={rc.isMobile ? 2 : 3} strokeDasharray="4 4" dot={renderCustomDot} activeDot={{ r: rc.isMobile ? 4 : 6 }} legendType="none" />
        <Line yAxisId="right" type="monotone" dataKey="brentPriceEst" name="Singapore MGO Price" stroke="#22c55e" strokeWidth={rc.isMobile ? 2 : 3} strokeDasharray="4 4" dot={{ r: rc.isMobile ? 2 : 4, strokeWidth: 2, fill: "var(--bg-color)" }} activeDot={{ r: rc.isMobile ? 4 : 6 }} legendType="none" />
        
        <Bar yAxisId="left" dataKey="import" name="Import Volume" fill="url(#a11y-dots)" color="var(--accent-secondary)" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="left" dataKey="export" name="Export Volume" fill="url(#a11y-stripe-v)" color="var(--accent-primary)" radius={[4, 4, 0, 0]} />
        
        <Line yAxisId="right" type="monotone" dataKey="priceHist" name="SKJ CFR Price" stroke="var(--accent-warning)" strokeWidth={rc.isMobile ? 2 : 3} dot={renderCustomDot} activeDot={{ r: rc.isMobile ? 4 : 6 }} />
        <Line yAxisId="right" type="monotone" dataKey="brentPriceHist" name="Singapore MGO Price" stroke="#22c55e" strokeWidth={rc.isMobile ? 2 : 3} dot={{ r: rc.isMobile ? 2 : 4, strokeWidth: 2, fill: "var(--bg-color)" }} activeDot={{ r: rc.isMobile ? 4 : 6 }} />

      </ComposedChart>
        </SafeResponsiveContainer>
    </div>
  );
}
