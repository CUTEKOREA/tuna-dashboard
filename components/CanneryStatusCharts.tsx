"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TermTooltip from './TermTooltip';
import { ChartPatternDefs } from './ChartPatterns';
import { logisticsWeeklyReport } from '@/lib/logistics-weekly-report';

const canneryData = logisticsWeeklyReport.canneries.bangkok.map((cannery) => ({
  location: cannery.location,
  name: cannery.name,
  prodMax: cannery.maxProduction,
  prodCurrent: cannery.currentProduction,
  storeMax: cannery.storageCapacity,
  storeCurrent: cannery.currentStock,
  procDays: cannery.processingDays,
}));

export default function CanneryStatusCharts() {
  const [liveData, setLiveData] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('/api/tuna-live')
      .then(res => res.json())
      .then(data => setLiveData(data.logistics))
      .catch(err => console.error("Failed to fetch live data", err));
  }, []);

  const totalProd = canneryData.reduce((acc, curr) => acc + curr.prodCurrent, 0);
  const totalStore = canneryData.reduce((acc, curr) => acc + curr.storeCurrent, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {liveData && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(var(--w-slate-400-rgb), 0.1)', border: '1px solid rgba(var(--w-slate-400-rgb), 0.25)', borderRadius: '20px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold' }}>정적{liveData.syncDate ? ` · ${liveData.syncDate} 기준` : ''} ({liveData.source})</span>
          </div>
        </div>
      )}

      {liveData && liveData.marginIndex && (
        <div style={{ background: 'var(--panel-bg)', border: '1px solid rgba(var(--w-violet-500-rgb), 0.3)', borderRadius: '8px', padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ padding: '12px', background: 'rgba(var(--w-violet-500-rgb), 0.1)', borderRadius: '8px', color: 'var(--w-violet-500)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>밸류체인 마진율 인덱스 (시나리오 추정{liveData.syncDate ? `, ${liveData.syncDate} 기준` : ''})</h3>
              <span style={{ fontSize: '12px', padding: '2px 8px', background: 'rgba(var(--w-slate-400-rgb), 0.1)', color: 'var(--text-muted)', borderRadius: '12px', border: '1px solid rgba(var(--w-slate-400-rgb), 0.25)' }}>전구간 순마진(추정): {liveData.marginIndex.netMargin}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>원어 원가: <strong style={{color: 'var(--text-main)'}}>${liveData.marginIndex.rawCost}</strong></span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>물류비: <strong style={{color: 'var(--text-main)'}}>${liveData.marginIndex.freight}</strong></span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>가공비: <strong style={{color: 'var(--text-main)'}}>${liveData.marginIndex.processing}</strong></span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>최종 판매가: <strong style={{color: 'var(--accent-info)'}}>${liveData.marginIndex.retailPrice}</strong></span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', opacity: 0.8, fontStyle: 'italic' }}>
              * {liveData.marginIndex.analysis}
            </p>
          </div>
        </div>
      )}

      {/* 좌우 2열 배치 — 좁은 화면(컨테이너 < 864px)에서는 1열 폴백 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(420px, 100%), 1fr))', gap: '24px', width: '100%' }}>
      {/* Left Chart: Daily Production */}
      <div style={{
        minWidth: 0,
        backgroundColor: 'var(--panel-bg)',
        border: '1px solid var(--panel-border)',
        borderRadius: '8px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text-main)' }}>
              <TermTooltip term="공장별 일일 생산량" description="[그래프 설명] 각 가공 공장이 하루에 생산할 수 있는 최대 가능 생산량 대비 보고 시점에 가동된 일 생산량 실적을 보여줍니다. 실적이 낮으면 고장, 노사문제 혹은 원어 부족을 의미할 수 있습니다." />
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              태국 방콕 지역 캔 공장 최대 생산능력 대비 실적 (미터톤)
            </p>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>총 일일 생산량 합계</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-success)' }}>{totalProd.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-muted)' }}>톤</span></span>
          </div>
        </div>
        
        <div style={{ flex: 1, minHeight: 0 }}>
          <SafeResponsiveContainer width="100%" height={480}>
            <BarChart
              data={canneryData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
              barGap={1}
            >
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--panel-border)" />
              <XAxis type="number" stroke="var(--text-muted)" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis dataKey="name" type="category" stroke="var(--text-main)" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: 'var(--text-muted)' }} width={80} />
              <Tooltip
                cursor={{ fill: 'rgba(34,36,43,0.04)' }}
                contentStyle={{ background: '#303c46', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#ffffff', boxShadow: '0 8px 24px rgba(16,24,40,0.35)' }}
                itemStyle={{ fontSize: '13px', color: '#e2e8f0' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', color: '#c6c9d2' }}
                formatter={(value: any) => [`${Number(value).toLocaleString()} 톤`, undefined]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} formatter={(value) => <span style={{ color: 'var(--text-muted)' }}>{value}</span>} />
              <defs><linearGradient id="gradProdC" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="var(--w-emerald-500)" stopOpacity={0.95} /><stop offset="100%" stopColor="var(--w-emerald-400)" stopOpacity={0.65} /></linearGradient></defs>
              <Bar dataKey="prodMax" name="최대 가능 생산량" fill="rgba(34,36,43,0.08)" radius={[0, 5, 5, 0]} barSize={8} />
              <Bar dataKey="prodCurrent" name="일 생산량" fill="url(#gradProdC)" radius={[0, 5, 5, 0]} barSize={8} />
            </BarChart>
          </SafeResponsiveContainer>
        </div>
      </div>

      {/* Right Chart: Raw Material Storage */}
      <div style={{
        minWidth: 0,
        backgroundColor: 'var(--panel-bg)',
        border: '1px solid var(--panel-border)',
        borderRadius: '8px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text-main)' }}>
              <TermTooltip term="공장별 원어 보관량" description="[그래프 설명] 각 가공 공장이 보유한 냉동창고의 최대 보관 능력 대비 현재 냉동 참치(원어)를 얼마나 재고로 확보하고 있는지 보여줍니다. 보관량이 높다면 당분간 참치를 사지 않을 가능성이 큽니다." />
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              태국 방콕 지역 캔 공장 최대 보관능력 대비 확보 현황 (미터톤)
            </p>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>총 현재 보관량 합계</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-info)' }}>{totalStore.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-muted)' }}>톤</span></span>
          </div>
        </div>
        
        <div style={{ flex: 1, minHeight: 0 }}>
          <SafeResponsiveContainer width="100%" height={480}>
            <BarChart
              data={canneryData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
              barGap={1}
            >
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--panel-border)" />
              <XAxis
                type="number"
                stroke="var(--text-muted)"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                tickFormatter={(val) => `${(val/1000).toLocaleString()}k`}
              />
              <YAxis dataKey="name" type="category" stroke="var(--text-main)" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: 'var(--text-muted)' }} width={80} />
              <Tooltip
                cursor={{ fill: 'rgba(34,36,43,0.04)' }}
                contentStyle={{ background: '#303c46', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#ffffff', boxShadow: '0 8px 24px rgba(16,24,40,0.35)' }}
                itemStyle={{ fontSize: '13px', color: '#e2e8f0' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', color: '#c6c9d2' }}
                formatter={(value: any) => [`${Number(value).toLocaleString()} 톤`, undefined]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} formatter={(value) => <span style={{ color: 'var(--text-muted)' }}>{value}</span>} />
              <defs><linearGradient id="gradStoreC" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="var(--w-sky-400)" stopOpacity={0.95} /><stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.6} /></linearGradient></defs>
              <Bar dataKey="storeMax" name="최대 가능 보관량" fill="rgba(34,36,43,0.08)" radius={[0, 5, 5, 0]} barSize={8} />
              <Bar dataKey="storeCurrent" name="현 보관량" fill="url(#gradStoreC)" radius={[0, 5, 5, 0]} barSize={8} />
            </BarChart>
          </SafeResponsiveContainer>
        </div>
      </div>

    </div>
    </div>
  );
}
