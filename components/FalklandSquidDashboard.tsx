"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart
} from 'recharts';
import { 
  Ship, Anchor, TrendingUp, AlertCircle, CheckCircle2, FileText, Search, Filter, Box
} from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import WidgetCard from './WidgetCard';

const vesselData = [
  {
    "rank": 1,
    "name": "601다가호",
    "company": "㈜피에이아이",
    "totalKg": 1021600,
    "totalPan": 51074,
    "m12": 2862,
    "m1": 3833,
    "m2": 5330,
    "m3": 12754,
    "m4": 20465,
    "m5": 5830,
    "tonnage": "-",
    "launch": "-",
    "age": "-",
    "status": "-"
  },
  {
    "rank": 2,
    "name": "7동일",
    "company": "경태",
    "totalKg": 945500,
    "totalPan": 47275,
    "m12": 7905,
    "m1": 5642,
    "m2": 5229,
    "m3": 12969,
    "m4": 12842,
    "m5": 2688,
    "tonnage": "-",
    "launch": "-",
    "age": "-",
    "status": "-"
  },
  {
    "rank": 3,
    "name": "세인9호",
    "company": "정일산업",
    "totalKg": 932100,
    "totalPan": 47423,
    "m12": 7212,
    "m1": 5079,
    "m2": 3429,
    "m3": 16225,
    "m4": 11625,
    "m5": 3853,
    "tonnage": "661톤",
    "launch": "1988-10-15",
    "age": "38년",
    "status": "교체시급"
  },
  {
    "rank": 4,
    "name": "110AG",
    "company": "AG선단",
    "totalKg": 921420,
    "totalPan": 46071,
    "m12": 0,
    "m1": 10000,
    "m2": 21354,
    "m3": 1844,
    "m4": 10326,
    "m5": 2547,
    "tonnage": "499톤",
    "launch": "2020-07-17",
    "age": "6년",
    "status": "건전"
  },
  {
    "rank": 5,
    "name": "세인3호",
    "company": "정일산업",
    "totalKg": 905440,
    "totalPan": 45189,
    "m12": 5802,
    "m1": 4446,
    "m2": 4056,
    "m3": 11342,
    "m4": 15520,
    "m5": 4023,
    "tonnage": "-",
    "launch": "-",
    "age": "-",
    "status": "-"
  },
  {
    "rank": 6,
    "name": "801승진호",
    "company": "승진수산",
    "totalKg": 842320,
    "totalPan": 41886,
    "m12": 6722,
    "m1": 4528,
    "m2": 5213,
    "m3": 10854,
    "m4": 11096,
    "m5": 3473,
    "tonnage": "499톤",
    "launch": "2020-08-15",
    "age": "6년",
    "status": "건전"
  },
  {
    "rank": 7,
    "name": "씨엠파크",
    "company": "홍진실업",
    "totalKg": 837620,
    "totalPan": 41891,
    "m12": 6870,
    "m1": 2692,
    "m2": 3683,
    "m3": 14264,
    "m4": 11245,
    "m5": 3137,
    "tonnage": "-",
    "launch": "-",
    "age": "-",
    "status": "-"
  },
  {
    "rank": 8,
    "name": "드림파크",
    "company": "홍진실업",
    "totalKg": 828040,
    "totalPan": 41392,
    "m12": 8146,
    "m1": 3752,
    "m2": 5495,
    "m3": 10821,
    "m4": 9133,
    "m5": 4045,
    "tonnage": "-",
    "launch": "-",
    "age": "-",
    "status": "-"
  },
  {
    "rank": 9,
    "name": "27해인",
    "company": "해인수산",
    "totalKg": 797740,
    "totalPan": 39973,
    "m12": 3577,
    "m1": 5847,
    "m2": 5503,
    "m3": 10752,
    "m4": 11151,
    "m5": 3143,
    "tonnage": "361톤",
    "launch": "1987-08-01",
    "age": "39년",
    "status": "교체시급"
  },
  {
    "rank": 10,
    "name": "808통영호",
    "company": "동원해사랑",
    "totalKg": 793060,
    "totalPan": 40273,
    "m12": 956,
    "m1": 5023,
    "m2": 5584,
    "m3": 14067,
    "m4": 11236,
    "m5": 3407,
    "tonnage": "316톤",
    "launch": "1986-10-15",
    "age": "40년",
    "status": "교체시급"
  },
  {
    "rank": 11,
    "name": "101스카이맥스",
    "company": "씨맥스피셔리",
    "totalKg": 770800,
    "totalPan": 38430,
    "m12": 0,
    "m1": 5010,
    "m2": 5024,
    "m3": 13832,
    "m4": 11944,
    "m5": 2620,
    "tonnage": "-",
    "launch": "-",
    "age": "-",
    "status": "-"
  },
  {
    "rank": 12,
    "name": "세인1호",
    "company": "정일산업",
    "totalKg": 762500,
    "totalPan": 38127,
    "m12": 4017,
    "m1": 3272,
    "m2": 3978,
    "m3": 15021,
    "m4": 10126,
    "m5": 1713,
    "tonnage": "-",
    "launch": "-",
    "age": "-",
    "status": "-"
  },
  {
    "rank": 13,
    "name": "5동일",
    "company": "경태",
    "totalKg": 759660,
    "totalPan": 37983,
    "m12": 4895,
    "m1": 3002,
    "m2": 3746,
    "m3": 9432,
    "m4": 13026,
    "m5": 3882,
    "tonnage": "338톤",
    "launch": "1991-11-05",
    "age": "35년",
    "status": "교체시급"
  },
  {
    "rank": 14,
    "name": "103금양",
    "company": "가나마린",
    "totalKg": 758260,
    "totalPan": 37913,
    "m12": 2018,
    "m1": 3415,
    "m2": 4131,
    "m3": 10972,
    "m4": 14078,
    "m5": 3299,
    "tonnage": "-",
    "launch": "-",
    "age": "-",
    "status": "-"
  },
  {
    "rank": 15,
    "name": "805통영호",
    "company": "동원해사랑",
    "totalKg": 746020,
    "totalPan": 37401,
    "m12": 1014,
    "m1": 4758,
    "m2": 3794,
    "m3": 11191,
    "m4": 12347,
    "m5": 4297,
    "tonnage": "-",
    "launch": "-",
    "age": "-",
    "status": "-"
  },
  {
    "rank": 16,
    "name": "세인7호",
    "company": "정일산업",
    "totalKg": 707140,
    "totalPan": 36248,
    "m12": 4723,
    "m1": 4041,
    "m2": 3544,
    "m3": 8538,
    "m4": 11131,
    "m5": 4271,
    "tonnage": "539톤",
    "launch": "1990-11-22",
    "age": "36년",
    "status": "교체시급"
  },
  {
    "rank": 17,
    "name": "108은해",
    "company": "선민수산",
    "totalKg": 704520,
    "totalPan": 35226,
    "m12": 1086,
    "m1": 3980,
    "m2": 3221,
    "m3": 13196,
    "m4": 11311,
    "m5": 2432,
    "tonnage": "361톤",
    "launch": "1987-08-01",
    "age": "39년",
    "status": "교체시급"
  },
  {
    "rank": 18,
    "name": "109은해",
    "company": "선민수산",
    "totalKg": 697360,
    "totalPan": 34868,
    "m12": 1028,
    "m1": 2822,
    "m2": 3128,
    "m3": 13356,
    "m4": 10300,
    "m5": 4234,
    "tonnage": "313톤",
    "launch": "1986-09-28",
    "age": "40년",
    "status": "교체시급"
  },
  {
    "rank": 19,
    "name": "세인5호",
    "company": "정일산업",
    "totalKg": 685643,
    "totalPan": 35099,
    "m12": 4941,
    "m1": 4087,
    "m2": 3225,
    "m3": 7938,
    "m4": 12324,
    "m5": 2584,
    "tonnage": "359톤",
    "launch": "1987-11-01",
    "age": "39년",
    "status": "교체시급"
  },
  {
    "rank": 20,
    "name": "103바다호",
    "company": "동원해사랑",
    "totalKg": 678960,
    "totalPan": 33941,
    "m12": 2992,
    "m1": 3432,
    "m2": 4203,
    "m3": 10730,
    "m4": 10007,
    "m5": 2577,
    "tonnage": "-",
    "launch": "-",
    "age": "-",
    "status": "-"
  },
  {
    "rank": 21,
    "name": "101AG",
    "company": "AG선단",
    "totalKg": 667880,
    "totalPan": 33394,
    "m12": 0,
    "m1": 9000,
    "m2": 10630,
    "m3": 2032,
    "m4": 9677,
    "m5": 2055,
    "tonnage": "338톤",
    "launch": "1991-06-01",
    "age": "35년",
    "status": "교체시급"
  },
  {
    "rank": 22,
    "name": "대양7호",
    "company": "신해피셔리",
    "totalKg": 666100,
    "totalPan": 33425,
    "m12": 4202,
    "m1": 2468,
    "m2": 2818,
    "m3": 9133,
    "m4": 13862,
    "m5": 942,
    "tonnage": "490톤",
    "launch": "1974-07-15",
    "age": "52년",
    "status": "교체시급"
  },
  {
    "rank": 23,
    "name": "103AG",
    "company": "AG선단",
    "totalKg": 646400,
    "totalPan": 32320,
    "m12": 0,
    "m1": 6000,
    "m2": 10462,
    "m3": 1308,
    "m4": 12256,
    "m5": 2294,
    "tonnage": "498.59톤",
    "launch": "1974-02-15",
    "age": "52년",
    "status": "교체시급"
  },
  {
    "rank": 24,
    "name": "101해랑",
    "company": "동신어업",
    "totalKg": 636360,
    "totalPan": 35157,
    "m12": 4516,
    "m1": 2360,
    "m2": 3676,
    "m3": 10631,
    "m4": 11762,
    "m5": 2212,
    "tonnage": "454톤",
    "launch": "1987-10-01",
    "age": "39년",
    "status": "교체시급"
  },
  {
    "rank": 25,
    "name": "107은해",
    "company": "선민수산",
    "totalKg": 612920,
    "totalPan": 30645,
    "m12": 611,
    "m1": 3379,
    "m2": 3180,
    "m3": 11344,
    "m4": 10499,
    "m5": 1632,
    "tonnage": "362톤",
    "launch": "1987-08-12",
    "age": "39년",
    "status": "교체시급"
  },
  {
    "rank": 26,
    "name": "107AG",
    "company": "AG선단",
    "totalKg": 586500,
    "totalPan": 29325,
    "m12": 0,
    "m1": 6000,
    "m2": 13521,
    "m3": 550,
    "m4": 6789,
    "m5": 2465,
    "tonnage": "485톤",
    "launch": "1984-06-16",
    "age": "42년",
    "status": "교체시급"
  },
  {
    "rank": 27,
    "name": "101은해",
    "company": "선민수산",
    "totalKg": 555720,
    "totalPan": 27786,
    "m12": 591,
    "m1": 4679,
    "m2": 3949,
    "m3": 10247,
    "m4": 5563,
    "m5": 2757,
    "tonnage": "499톤",
    "launch": "1979-06-13",
    "age": "47년",
    "status": "교체시급"
  },
  {
    "rank": 28,
    "name": "102AG",
    "company": "AG선단",
    "totalKg": 515820,
    "totalPan": 25791,
    "m12": 0,
    "m1": 5000,
    "m2": 7603,
    "m3": 1512,
    "m4": 8795,
    "m5": 2881,
    "tonnage": "499.37톤",
    "launch": "1974-11-15",
    "age": "52년",
    "status": "교체시급"
  },
  {
    "rank": 29,
    "name": "108AG",
    "company": "AG선단",
    "totalKg": 485740,
    "totalPan": 24287,
    "m12": 0,
    "m1": 6000,
    "m2": 11336,
    "m3": 1615,
    "m4": 3952,
    "m5": 1384,
    "tonnage": "485톤",
    "launch": "1984-09-24",
    "age": "42년",
    "status": "교체시급"
  },
  {
    "rank": 30,
    "name": "108은해",
    "company": "현원수산",
    "totalKg": 0,
    "totalPan": 0,
    "m12": 0,
    "m1": 0,
    "m2": 0,
    "m3": 0,
    "m4": 0,
    "m5": 0,
    "tonnage": "361톤",
    "launch": "1987-08-01",
    "age": "39년",
    "status": "교체시급"
  }
];

const companyData = [
  { name: "정일산업", totalKg: 4041720, vessels: 5 },
  { name: "AG선단", totalKg: 3823760, vessels: 6 },
  { name: "선민수산", totalKg: 2570500, vessels: 4 },
  { name: "동원해사랑", totalKg: 2232300, vessels: 3 },
  { name: "경태", totalKg: 1705160, vessels: 2 },
  { name: "홍진실업", totalKg: 1665660, vessels: 2 },
  { name: "㈜피에이아이", totalKg: 1021480, vessels: 1 },
  { name: "승진수산", totalKg: 837720, vessels: 1 },
  { name: "해인수산", totalKg: 799460, vessels: 1 },
  { name: "씨맥스피셔리", totalKg: 768600, vessels: 1 },
  { name: "가나마린", totalKg: 758260, vessels: 1 },
  { name: "동신어업", totalKg: 703140, vessels: 1 },
  { name: "신해피셔리", totalKg: 668500, vessels: 1 },
];

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
  
  const filteredVessels = vesselData.filter(v => 
    v.name.includes(searchTerm) || v.company.includes(searchTerm)
  );

  const totalAllVessels = vesselData.reduce((acc, v) => acc + v.totalKg, 0);

  return (
    <div className="ds-dashboard-container">
      <motion.div 
        className="ds-header-area"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="ds-title">
          <Anchor size={28} className="text-[var(--color-primary)]" />
          2026 포크랜드 오징어채낚기 실적 인텔리전스
        </h1>
        <p className="ds-subtitle">
          일일/월별 누계 어획량 분석 기반 선단 및 개별 선박 퍼포먼스 리뷰 (기준: 2026년 5월 말)
        </p>
      </motion.div>

      <div className="ds-grid-2">
        {/* Widget 1: Monthly Catch Trend */}
        <WidgetCard title="월별 전체 어획량 추이" icon={TrendingUp} iconColor="var(--color-primary)" pillar="S1"
          cardDesc="단위: 톤 (Ton) — 일일·월별 누계 어획량"
          telemetry={{ status: 'SYNCED', syncDate: '2026 포클랜드 채낚기' }} chartHeight={300}
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
            source: '일일/월별 누계수량 데이터',
          }} />

        {/* Widget 2: Company Performance */}
        <WidgetCard title="업체별 누계 실적 및 보유 선박 수" icon={Ship} iconColor="var(--color-secondary)" pillar="S2"
          cardDesc="단위: 톤 (Ton) — 업체별 어획·선박 효율"
          telemetry={{ status: 'SYNCED', syncDate: '2026 포클랜드 채낚기' }} chartHeight={300}
          chart={
            <ComposedChart data={companyData.slice(0, 8)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            situation: <>규모 면에서 <strong>정일산업(5척, 약 4,041톤)</strong>이 1위이나, 단일 선박 생산성 측면에서는 1척으로 <strong>1,021톤</strong>을 기록한 <strong>㈜피에이아이</strong>의 효율성이 임.</>,
            actionPlan: <>물량 확보(정일산업 모델)와 고효율(피에이아이 모델) 중 전략적 방향성 설정 시 피에이아이의 조업 노하우 벤치마킹 필요.</>,
            source: '2026년 포크 오징어채낚기 어획현황',
          }} />
      </div>

      <div className="ds-grid-1 mt-6">
        {/* Widget 3: Individual Vessel Rankings */}
        <motion.div className="ds-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="ds-card-header flex justify-between items-center flex-wrap gap-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Ship size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                  개별 선박 실적 랭킹
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">{vesselData.length}척</span>
                </h3>
              </div>
            </div>
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
                  <tr style={{ background: 'linear-gradient(90deg, #0c1929 0%, #111d2e 50%, #0c1929 100%)', borderBottom: '2px solid rgba(56,189,248,0.3)' }}>
                    <th style={{ padding: '14px 10px', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.15em', width: '50px' }}>#</th>
                    <th style={{ padding: '14px 16px', fontSize: '10px', fontWeight: 700, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.1em', position: 'sticky', left: 0, zIndex: 31, background: 'linear-gradient(90deg, #0c1929, #111d2e)', boxShadow: '4px 0 16px rgba(0,0,0,0.5)', minWidth: '140px' }}>선명 / 업체</th>
                    {['12월','1월','2월','3월','4월','5월'].map(m => (
                      <th key={m} style={{ padding: '14px 10px', textAlign: 'right', fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: m === '12월' ? '1px solid rgba(255,255,255,0.05)' : 'none', minWidth: '65px' }}>{m}</th>
                    ))}
                    <th style={{ padding: '14px 14px', textAlign: 'right', fontSize: '10px', fontWeight: 800, color: '#67e8f9', textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: '2px solid rgba(34,211,238,0.25)', background: 'rgba(34,211,238,0.04)', minWidth: '85px' }}>누계(팬)</th>
                    <th style={{ padding: '14px 14px', textAlign: 'right', fontSize: '10px', fontWeight: 800, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: '1px solid rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.04)', minWidth: '95px' }}>누계(KG)</th>
                    <th style={{ padding: '14px 12px', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: '1px solid rgba(255,255,255,0.05)', minWidth: '110px' }}>비중</th>
                    <th style={{ padding: '14px 10px', textAlign: 'center', fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: '2px solid rgba(255,255,255,0.06)' }}>톤수</th>
                    <th style={{ padding: '14px 10px', textAlign: 'center', fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>선령</th>
                    <th style={{ padding: '14px 10px', textAlign: 'center', fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>상태</th>
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
                        <td style={{ padding: '12px 16px', position: 'sticky', left: 0, zIndex: 20, background: rowBg === 'transparent' ? 'var(--surface-0, #0f172a)' : rowBg, boxShadow: '4px 0 16px rgba(0,0,0,0.4)', transition: 'background 0.15s ease' }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc', lineHeight: 1.3, whiteSpace: 'nowrap' }}>{vessel.name}</div>
                          <div style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap' }}>{vessel.company}</div>
                        </td>
                        {[vessel.m12, vessel.m1, vessel.m2, vessel.m3, vessel.m4, vessel.m5].map((val, mi) => (
                          <td key={mi} style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace', fontSize: 13, color: heatColor(val || 0), fontWeight: heatWeight(val || 0), whiteSpace: 'nowrap', borderLeft: mi === 0 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                            {(val || 0).toLocaleString()}
                          </td>
                        ))}
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: '#22d3ee', whiteSpace: 'nowrap', borderLeft: '2px solid rgba(34,211,238,0.2)', background: 'rgba(34,211,238,0.03)' }}>
                          {vessel.totalPan.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: '#34d399', whiteSpace: 'nowrap', borderLeft: '1px solid rgba(52,211,153,0.15)', background: 'rgba(52,211,153,0.03)' }}>
                          {vessel.totalKg.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 12px', borderLeft: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', width: `${Math.min(100, Number(percent) * 5)}%`, transition: 'width 0.5s ease' }}></div>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#c4b5fd', fontFamily: 'monospace', minWidth: 36, textAlign: 'right' }}>{percent}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 12, color: '#94a3b8', fontFamily: 'monospace', borderLeft: '2px solid rgba(255,255,255,0.05)' }}>{vessel.tonnage}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: 12 }}>
                          {vessel.age !== "-" ? (
                            <>
                              <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: 13 }}>{vessel.age}</div>
                              <div style={{ fontSize: 9, color: '#475569' }}>{vessel.launch}</div>
                            </>
                          ) : <span style={{ color: '#334155' }}>—</span>}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          {vessel.status === "교체시급" ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }}></span>교체시급
                            </span>
                          ) : vessel.status === "건전" ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>건전
                            </span>
                          ) : <span style={{ color: '#334155' }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredVessels.length === 0 && (
                    <tr>
                      <td colSpan={14} style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
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
          <div className="px-5 py-4 bg-gradient-to-r from-slate-800/50 to-transparent border-t border-white/5 flex items-start gap-3 rounded-b-xl">
            <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle size={14} className="text-amber-400" />
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              <strong className="text-slate-300">분석 노트</strong> — 상위 5개 선박이 전체 어획량의 핵심을 견인. 월별 수치는 원본(팬 단위) 그대로 표기, 환산 누계(KG)는 1팬=20kg 기준 적용.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
