"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TermTooltip from './TermTooltip';

const canneryData = [
  { location: 'BANGKOK', name: 'THAI UNION', prodMax: 1300, prodCurrent: 600, storeMax: 62000, storeCurrent: 69000 },
  { location: 'BANGKOK', name: 'SEA VALUE', prodMax: 1000, prodCurrent: 400, storeMax: 55000, storeCurrent: 51000 },
  { location: 'BANGKOK', name: 'GOLDEN PRIZE', prodMax: 350, prodCurrent: 200, storeMax: 25000, storeCurrent: 7300 },
  { location: 'BANGKOK', name: 'PATAYA FOOD', prodMax: 250, prodCurrent: 100, storeMax: 15000, storeCurrent: 3000 },
  { location: 'BANGKOK', name: 'SPA', prodMax: 200, prodCurrent: 120, storeMax: 4000, storeCurrent: 4700 },
  { location: 'BANGKOK', name: 'MMP', prodMax: 200, prodCurrent: 100, storeMax: 5000, storeCurrent: 5100 },
  { location: 'BANGKOK', name: 'AAI', prodMax: 180, prodCurrent: 80, storeMax: 7000, storeCurrent: 1000 },
  { location: 'BANGKOK', name: 'DIAMOND', prodMax: 100, prodCurrent: 30, storeMax: 1500, storeCurrent: 1100 },
  { location: 'BANGKOK', name: 'R.MONKHON', prodMax: 90, prodCurrent: 30, storeMax: 2000, storeCurrent: 600 },
  { location: 'BANGKOK', name: 'R.S CANNERY', prodMax: 100, prodCurrent: 40, storeMax: 4000, storeCurrent: 900 },
  { location: 'BANGKOK', name: 'SK FOODS', prodMax: 120, prodCurrent: 60, storeMax: 7000, storeCurrent: 1100 },
  { location: 'BANGKOK', name: 'KINGFISHER', prodMax: 200, prodCurrent: 20, storeMax: 15000, storeCurrent: 200 },
  { location: 'BANGKOK', name: 'GLOBAL FROZEN', prodMax: 50, prodCurrent: 40, storeMax: 5000, storeCurrent: 1700 },
  { location: 'SONGKHLA', name: 'CMC', prodMax: 300, prodCurrent: 100, storeMax: 10000, storeCurrent: 2900 },
  { location: 'SONGKHLA', name: 'SCC', prodMax: 250, prodCurrent: 50, storeMax: 7000, storeCurrent: 700 },
  { location: 'SONGKHLA', name: 'SIAM', prodMax: 200, prodCurrent: 60, storeMax: 5000, storeCurrent: 1100 },
  { location: 'SONGKHLA', name: 'TRP', prodMax: 150, prodCurrent: 70, storeMax: 5000, storeCurrent: 1600 }
];

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px #10b981' }}></span>
            <span style={{ color: 'var(--color-success)', fontSize: '13px', fontWeight: 'bold' }}>{liveData.status} ({liveData.source})</span>
          </div>
        </div>
      )}

      {liveData && liveData.marginIndex && (
        <div style={{ background: 'var(--panel-bg)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', color: '#8b5cf6' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>Value Chain 마진율 인덱스 (실시간 예측)</h3>
              <span style={{ fontSize: '12px', padding: '2px 8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>E2E Net Margin: {liveData.marginIndex.netMargin}</span>
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

      <div style={{ display: 'flex', gap: '24px', width: '100%', flexDirection: 'row', flexWrap: 'wrap' }}>
      {/* Left Chart: Daily Production */}
      <div style={{
        flex: '1 1 45%',
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
              <TermTooltip term="CANNERY별 일일 생산량" description="[그래프 설명] 각 가공 공장(Cannery)이 하루에 생산할 수 있는 전체 라인 CAPA(최대 가능 생산량) 대비 실제 오늘 가동된 일 생산량(실적)을 보여줍니다. 실적이 낮으면 고장, 노사문제 혹은 원어 부족을 의미할 수 있습니다." />
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              태국 방콕 및 송클라 지역 캔 공장 일일 <TermTooltip term="CAPA" description="Capacity의 약자로 공장의 최대 가용 생산/보관 능력을 의미합니다." /> 대비 실적 (Metric Tons)
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
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="var(--text-muted)" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" stroke="var(--text-main)" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} width={80} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid var(--panel-border)', borderRadius: '8px', color: 'var(--text-main)' }}
                itemStyle={{ fontSize: '13px' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}
                formatter={(value: any) => [`${Number(value).toLocaleString()} 톤`, undefined]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="prodMax" name="최대 가능 생산량" fill="rgba(255,255,255,0.1)" radius={[0, 4, 4, 0]} barSize={8} />
              <Bar dataKey="prodCurrent" name="일 생산량" fill="var(--color-success)" radius={[0, 4, 4, 0]} barSize={8} />
            </BarChart>
          </SafeResponsiveContainer>
        </div>
      </div>

      {/* Right Chart: Raw Material Storage */}
      <div style={{
        flex: '1 1 45%',
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
              <TermTooltip term="CANNERY별 원어 보관량" description="[그래프 설명] 각 가공 공장이 보유한 냉동창고의 최대 보관 능력(CAPA) 대비 현재 냉동 참치(원어)를 얼만큼 재고로 확보하고 있는지 보여줍니다. 보관량이 높다면 당분간 참치를 사지 않을 가능성이 큽니다." />
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              태국 거점별 캔 공장 보관창고 CAPACITY 대비 확보 현황 (Metric Tons)
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
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                type="number" 
                stroke="var(--text-muted)" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11 }} 
                tickFormatter={(val) => `${(val/1000).toLocaleString()}k`} 
              />
              <YAxis dataKey="name" type="category" stroke="var(--text-main)" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} width={80} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid var(--panel-border)', borderRadius: '8px', color: 'var(--text-main)' }}
                itemStyle={{ fontSize: '13px' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}
                formatter={(value: any) => [`${Number(value).toLocaleString()} 톤`, undefined]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="storeMax" name="최대 가능 보관량" fill="rgba(255,255,255,0.1)" radius={[0, 4, 4, 0]} barSize={8} />
              <Bar dataKey="storeCurrent" name="현 보관량" fill="var(--color-info)" radius={[0, 4, 4, 0]} barSize={8} />
            </BarChart>
          </SafeResponsiveContainer>
        </div>
      </div>

    </div>
    </div>
  );
}
