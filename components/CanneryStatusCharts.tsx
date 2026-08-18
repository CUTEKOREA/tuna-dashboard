"use client";

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
import { CHART_RANK, HUB_ID } from '@/lib/chart-palette';
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
  const totalProd = canneryData.reduce((acc, curr) => acc + curr.prodCurrent, 0);
  const totalStore = canneryData.reduce((acc, curr) => acc + curr.storeCurrent, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
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
              <Bar dataKey="prodMax" name="최대 가능 생산량" fill="rgba(34,36,43,0.08)" radius={[0, 5, 5, 0]} barSize={8} />
              <Bar dataKey="prodCurrent" name="일 생산량" fill={CHART_RANK} radius={[0, 5, 5, 0]} barSize={8} />
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
              <Bar dataKey="storeMax" name="최대 가능 보관량" fill="rgba(34,36,43,0.08)" radius={[0, 5, 5, 0]} barSize={8} />
              <Bar dataKey="storeCurrent" name="현 보관량" fill={HUB_ID.bkk} radius={[0, 5, 5, 0]} barSize={8} />
            </BarChart>
          </SafeResponsiveContainer>
        </div>
      </div>

    </div>
    </div>
  );
}
