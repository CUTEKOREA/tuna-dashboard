"use client";

import React, { useState } from 'react';
import {
  companiesFromVessels,
  falklandVessels,
} from '@/lib/data/falkland-squid-vessels';
import { motion } from 'framer-motion';
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ComposedChart, Area, AreaChart
} from 'recharts';
import { 
  Ship, Anchor, TrendingUp, Search
} from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';



const monthlyData = [
  { month: "12월", total: 1733720 },
  { month: "1월", total: 2670940 },
  { month: "2월", total: 3400900 },
  { month: "3월", total: 5569400 },
  { month: "4월", total: 6487760 },
  { month: "5월", total: 1733540 },
];

export default function FalklandSquidDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // 회사 집계는 선박에서 다시 센다. 원본 하드코딩 집계에는 현원수산이 빠져 있어
  // 이 표가 자기 선단을 다 담지 못했다.
  const companyData = companiesFromVessels();

  const filteredVessels = falklandVessels.filter(v => 
    v.name.includes(searchTerm) || v.company.includes(searchTerm)
  );

  const totalAllVessels = falklandVessels.reduce((acc, v) => acc + v.totalKg, 0);

  return (
    <div className="ds-dashboard-container">
      <motion.div 
        className="ds-header-area"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="ds-title">
          <Anchor size={28} className="text-[var(--color-primary)]" />
          2026 포클랜드 오징어채낚기 실적 인텔리전스
        </h1>
        <p className="ds-subtitle">
          일일/월별 누계 어획량 분석 기반 선단 및 개별 선박 퍼포먼스 리뷰 (기준: 2026년 5월 말)
        </p>
      </motion.div>

      <div className="ds-grid-2">
        {/* Widget 1: Monthly Catch Trend */}
        <WidgetCard title="월별 전체 어획량 추이" icon={TrendingUp} iconColor="var(--color-primary)" pillar="S1"
          cardDesc="단위: 톤 (Ton) - 일일·월별 누계 어획량"
          telemetry={{ status: 'STATIC', syncDate: '2026 포클랜드 채낚기' }} chartHeight={300}
          chart={
            <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={(val) => `${Math.round(val/1000)}t`} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
                formatter={(value: any) => [`${value.toLocaleString()} KG`, '어획량']}
              />
              <Area type="monotone" dataKey="total" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          }
          takeaway={{
            situation: <>3월과 4월에 전체 어획량의 <strong>55.8%</strong>가 집중되었으며, 4월에 연중 최고치인 <strong>약 6,487톤</strong>을 기록함.</>,
            actionPlan: <>봄철 성어기(3~4월) 집중 투입 전략 유지 및 이 시기 선박 회전율 극대화 모니터링 필요.</>,
            source: '일일/월별 누계수량 데이터 (자체추정/업계추정)',
          }} />

        {/* Widget 2: Company Performance */}
        <WidgetCard title="업체별 누계 실적 및 보유 선박 수" icon={Ship} iconColor="var(--color-secondary)" pillar="S2"
          cardDesc="단위: 톤 (Ton) - 업체별 어획·선박 효율"
          telemetry={{ status: 'STATIC', syncDate: '2026 포클랜드 채낚기' }} chartHeight={300}
          chart={
            <ComposedChart data={companyData.slice(0, 8)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} angle={0} textAnchor="middle" height={60} />
              <YAxis yAxisId="left" stroke="var(--text-secondary)" fontSize={12} tickFormatter={(val) => `${Math.round(val/1000)}t`} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--color-warning)" fontSize={12} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '8px' }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="totalKg" name="총 어획량(KG)" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="vessels" name="선박 수(척)" stroke="var(--color-warning)" strokeWidth={3} dot={{ r: 5 }} />
            </ComposedChart>
          }
          takeaway={{
            situation: <>규모 면에서 <strong>정일산업(5척, 약 4,041톤)</strong>이 1위이나, 단일 선박 생산성 측면에서는 1척으로 <strong>1,021톤</strong>을 기록한 <strong>㈜피에이아이</strong>의 효율성이 두드러짐.</>,
            actionPlan: <>물량 확보(정일산업 모델)와 고효율(피에이아이 모델) 중 전략적 방향성 설정 시 피에이아이의 조업 노하우 벤치마킹 필요.</>,
            source: '2026년 포클랜드 오징어채낚기 어획현황 (자체추정/업계추정)',
          }} />
      </div>

      <div className="ds-grid-1 mt-6">
        {/* Widget 3: Individual Vessel Rankings */}
        <WidgetCard title={`개별 선박 실적 랭킹 (${falklandVessels.length}척)`} icon={Ship} iconColor="var(--color-primary)" pillar="S1"
          cardDesc="선박명·업체 검색 + 월별 어획량 + 누계·비중·선령·교체 상태"
          telemetry={{ status: 'STATIC', syncDate: '2026 포클랜드 채낚기' }}
          customBody={<>
            <div className="flex justify-end mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                <input
                  type="text"
                  placeholder="선박명 또는 업체 검색..."
                  className="pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/30 w-64 transition-all placeholder:text-slate-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          <div style={{ overflow: 'hidden', borderRadius: '0 0 12px 12px', position: 'relative' }}>
            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '720px' }}>
              <table style={{ width: '100%', minWidth: '1300px', fontSize: '13px', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 30 }}>
                  <tr style={{ background: 'linear-gradient(90deg, #0c1929 0%, #111d2e 50%, #0c1929 100%)', borderBottom: '2px solid rgba(var(--w-sky-400-rgb), 0.3)' }}>
                    <th style={{ padding: '14px 10px', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.15em', width: '50px' }}>#</th>
                    <th style={{ padding: '14px 16px', fontSize: '10px', fontWeight: 700, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.1em', position: 'sticky', left: 0, zIndex: 31, background: 'linear-gradient(90deg, #0c1929, #111d2e)', boxShadow: '4px 0 16px rgba(0,0,0,0.5)', minWidth: '140px' }}>선명 / 업체</th>
                    {['12월','1월','2월','3월','4월','5월'].map(m => (
                      <th key={m} style={{ padding: '14px 10px', textAlign: 'right', fontSize: '10px', fontWeight: 600, color: 'var(--w-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: m === '12월' ? '1px solid rgba(140,170,255,0.10)' : 'none', minWidth: '65px' }}>{m}</th>
                    ))}
                    <th style={{ padding: '14px 14px', textAlign: 'right', fontSize: '10px', fontWeight: 800, color: '#67e8f9', textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: '2px solid rgba(34,211,238,0.25)', background: 'rgba(34,211,238,0.04)', minWidth: '85px' }}>누계(팬)</th>
                    <th style={{ padding: '14px 14px', textAlign: 'right', fontSize: '10px', fontWeight: 800, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: '1px solid rgba(var(--w-emerald-400-rgb), 0.2)', background: 'rgba(var(--w-emerald-400-rgb), 0.04)', minWidth: '95px' }}>누계(KG)</th>
                    <th style={{ padding: '14px 12px', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: '1px solid rgba(140,170,255,0.10)', minWidth: '110px' }}>비중</th>
                    <th style={{ padding: '14px 10px', textAlign: 'center', fontSize: '10px', fontWeight: 600, color: 'var(--w-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: '2px solid rgba(140,170,255,0.12)' }}>톤수</th>
                    <th style={{ padding: '14px 10px', textAlign: 'center', fontSize: '10px', fontWeight: 600, color: 'var(--w-slate-500)', textTransform: 'uppercase' }}>선령</th>
                    <th style={{ padding: '14px 10px', textAlign: 'center', fontSize: '10px', fontWeight: 600, color: 'var(--w-slate-500)', textTransform: 'uppercase' }}>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVessels.map((vessel, index) => {
                    const percent = ((vessel.totalKg / totalAllVessels) * 100).toFixed(1);
                    const maxPan = Math.max(vessel.m12||0, vessel.m1||0, vessel.m2||0, vessel.m3||0, vessel.m4||0, vessel.m5||0);
                    const heatColor = (val: number) => {
                      if (!val || !maxPan) return '#475569';
                      const r = val / maxPan;
                      return r > 0.8 ? '#67e8f9' : r > 0.5 ? '#7dd3fc' : '#64748b';
                    };
                    const heatWeight = (val: number) => {
                      if (!val || !maxPan) return 400;
                      return val / maxPan > 0.8 ? 600 : 400;
                    };
                    const isTop3 = index < 3;
                    const rowBg = isTop3
                      ? `rgba(34,211,238,${0.06 - index * 0.015})`
                      : index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)';

                    const rankBadge = () => {
                      if (vessel.rank === 1) return { bg: 'linear-gradient(135deg, #fbbf24, #d97706)', color: '#78350f', shadow: '0 2px 8px rgba(251,191,36,0.4)' };
                      if (vessel.rank === 2) return { bg: 'linear-gradient(135deg, #cbd5e1, #64748b)', color: '#fff', shadow: '0 2px 8px rgba(100,116,139,0.3)' };
                      if (vessel.rank === 3) return { bg: 'linear-gradient(135deg, #fb923c, #c2410c)', color: '#fff', shadow: '0 2px 8px rgba(251,146,60,0.3)' };
                      return null;
                    };
                    const badge = rankBadge();

                    return (
                      <tr key={`${vessel.name}-${vessel.company}-${index}`} style={{ background: rowBg, transition: 'background 0.15s ease', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = rowBg)}>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          {badge ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, fontWeight: 900, fontSize: 13, background: badge.bg, color: badge.color, boxShadow: badge.shadow }}>{vessel.rank}</div>
                          ) : (
                            <span style={{ color: '#475569', fontFamily: 'monospace', fontSize: 13 }}>{vessel.rank}</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', position: 'sticky', left: 0, zIndex: 20, background: rowBg === 'transparent' ? 'var(--surface-0, #0a0f1f)' : rowBg, boxShadow: '4px 0 16px rgba(0,0,0,0.4)', transition: 'background 0.15s ease' }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--w-slate-50)', lineHeight: 1.3, whiteSpace: 'nowrap' }}>{vessel.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--w-slate-500)', whiteSpace: 'nowrap' }}>{vessel.company}</div>
                        </td>
                        {[vessel.m12, vessel.m1, vessel.m2, vessel.m3, vessel.m4, vessel.m5].map((val, mi) => (
                          <td key={mi} style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace', fontSize: 13, color: heatColor(val || 0), fontWeight: heatWeight(val || 0), whiteSpace: 'nowrap', borderLeft: mi === 0 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                            {(val || 0).toLocaleString()}
                          </td>
                        ))}
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: '#22d3ee', whiteSpace: 'nowrap', borderLeft: '2px solid rgba(34,211,238,0.2)', background: 'rgba(34,211,238,0.03)' }}>
                          {vessel.totalPan.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: 'var(--w-emerald-400)', whiteSpace: 'nowrap', borderLeft: '1px solid rgba(var(--w-emerald-400-rgb), 0.15)', background: 'rgba(var(--w-emerald-400-rgb), 0.03)' }}>
                          {vessel.totalKg.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 12px', borderLeft: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--w-violet-500), var(--w-pink-500))', width: '100%', transform: `scaleX(${(Math.min(100, Number(percent) * 5)) / 100})`, transformOrigin: 'left', transition: 'transform 0.5s ease' }}></div>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#c4b5fd', fontFamily: 'monospace', minWidth: 36, textAlign: 'right' }}>{percent}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 12, color: 'var(--w-slate-400)', fontFamily: 'monospace', borderLeft: '2px solid rgba(140,170,255,0.10)' }}>{vessel.tonnage}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 12 }}>
                          {vessel.age !== "-" ? (
                            <>
                              <div style={{ fontWeight: 700, color: 'var(--w-amber-400)', fontSize: 13 }}>{vessel.age}</div>
                              <div style={{ fontSize: 9, color: '#475569' }}>{vessel.launch}</div>
                            </>
                          ) : <span style={{ color: '#334155' }}>-</span>}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          {vessel.status === "교체시급" ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: 'rgba(var(--w-red-500-rgb), 0.12)', color: '#f87171', border: '1px solid rgba(var(--w-red-500-rgb), 0.25)' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--w-red-500)', animation: 'pulse 2s infinite' }}></span>교체시급
                            </span>
                          ) : vessel.status === "건전" ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: 'rgba(var(--w-emerald-500-rgb), 0.12)', color: 'var(--w-emerald-400)', border: '1px solid rgba(var(--w-emerald-500-rgb), 0.25)' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--w-emerald-500)' }}></span>건전
                            </span>
                          ) : <span style={{ color: '#334155' }}>-</span>}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredVessels.length === 0 && (
                    <tr>
                      <td colSpan={14} style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--w-slate-500)' }}>
                        <Search size={36} style={{ opacity: 0.2, marginBottom: 12 }} />
                        <div style={{ fontSize: 16, fontWeight: 600 }}>검색 결과가 없습니다.</div>
                        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>다른 선박명이나 업체명을 입력해 보세요.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>}
          takeaway={{
            situation: '상위 5개 선박이 전체 어획량의 핵심을 견인. 월별 수치는 원본(팬 단위) 그대로 표기.',
            actionPlan: '환산 누계(KG)는 1팬=20kg 기준 적용. 선령·교체 상태 데이터를 활용해 노후 선박 교체·신조 투자 의사결정에 반영.',
            source: '2026년 포클랜드 오징어채낚기 어획현황 (자체추정/업계추정)',
          }} />
      </div>
    </div>
  );
}
