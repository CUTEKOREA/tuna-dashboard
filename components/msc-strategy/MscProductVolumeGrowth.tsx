'use client';

import React from 'react';
import { LineChart as LineIcon } from 'lucide-react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import WidgetCard from '../WidgetCard';

/* ── Data: MSC 라벨 소비자 제품 판매량 (전 세계, 천 MT) ──────────────────────
   출처: MSC Annual Report 2024-25 Supplementary Data (liveproductvolume 시트)
   2009-10 → 2024-25, 전체 7.5배 성장. 펫푸드는 1만배 이상 폭증.               */

const volData = [
  { fy: '2009', total: 185, frozen: 98, canned: 24, chilled: 51, petfood: 0 },
  { fy: '2010', total: 289, frozen: 150, canned: 47, chilled: 75, petfood: 1 },
  { fy: '2011', total: 409, frozen: 173, canned: 69, chilled: 132, petfood: 4 },
  { fy: '2012', total: 475, frozen: 212, canned: 80, chilled: 126, petfood: 7 },
  { fy: '2013', total: 529, frozen: 242, canned: 68, chilled: 136, petfood: 17 },
  { fy: '2014', total: 612, frozen: 293, canned: 66, chilled: 152, petfood: 24 },
  { fy: '2015', total: 656, frozen: 305, canned: 73, chilled: 162, petfood: 32 },
  { fy: '2016', total: 746, frozen: 322, canned: 93, chilled: 202, petfood: 30 },
  { fy: '2017', total: 894, frozen: 373, canned: 127, chilled: 229, petfood: 36 },
  { fy: '2018', total: 1028, frozen: 423, canned: 152, chilled: 248, petfood: 49 },
  { fy: '2019', total: 1154, frozen: 456, canned: 176, chilled: 264, petfood: 74 },
  { fy: '2020', total: 1260, frozen: 543, canned: 189, chilled: 273, petfood: 63 },
  { fy: '2021', total: 1276, frozen: 528, canned: 199, chilled: 240, petfood: 91 },
  { fy: '2022', total: 1251, frozen: 505, canned: 246, chilled: 186, petfood: 88 },
  { fy: '2023', total: 1278, frozen: 510, canned: 269, chilled: 188, petfood: 93 },
  { fy: '2024', total: 1385, frozen: 507, canned: 335, chilled: 191, petfood: 120 },
];

const tooltipStyle = {
  backgroundColor: 'rgba(20, 28, 52, 0.95)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: '0.78rem',
  padding: '8px 12px',
};

const labels: Record<string, string> = {
  total: '전체',
  frozen: '냉동',
  canned: '캔/통조림',
  chilled: '냉장',
  petfood: '펫푸드',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}-{String(Number(label) + 1).slice(2)} 회계연도</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
          <span style={{ color: p.color }}>{labels[p.dataKey] || p.dataKey}</span>
          <span style={{ fontWeight: 600 }}>{p.value.toLocaleString()} 천MT</span>
        </div>
      ))}
    </div>
  );
};

const legendFormatter = (v: string) => labels[v] || v;

export default function MscProductVolumeGrowth() {
  return (
    <WidgetCard
      id="W-MSC28"
      title="MSC 라벨 제품 판매량 성장"
      icon={LineIcon}
      iconColor="#f59e0b"
      pillar="S4"
      cardDesc="전 세계 MSC 라벨 소비자 제품 판매량(천 MT) 16년 추이 — 카테고리별 분해"
      unit="천 MT"
      telemetry={{ status: 'STATIC', syncDate: '2024-25' }}
      chartHeight={320}
      chart={
        <ComposedChart data={volData} margin={{ top: 10, right: 16, left: 6, bottom: 0 }}>
          <defs>
            <linearGradient id="gTotalVol" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
          <XAxis
            dataKey="fy"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(148,163,184,0.15)' }}
            tickLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={legendFormatter} wrapperStyle={{ fontSize: '0.74rem', color: '#94a3b8', paddingTop: 8 }} />
          <Area type="monotone" dataKey="total" stroke="#f59e0b" fill="url(#gTotalVol)" strokeWidth={2.4} isAnimationActive={false} />
          <Line type="monotone" dataKey="frozen" stroke="#38bdf8" strokeWidth={1.6} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="canned" stroke="#10b981" strokeWidth={1.6} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="chilled" stroke="#a78bfa" strokeWidth={1.6} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="petfood" stroke="#ef4444" strokeWidth={1.6} dot={false} isAnimationActive={false} />
        </ComposedChart>
      }
      takeaway={{
        situation: '전 세계 MSC 라벨 제품 판매량은 2009-10년 18.5만 톤에서 2024-25년 138.5만 톤으로 7.5배 성장했습니다. 냉동(50.7만 톤)이 최대 카테고리이나, 캔/통조림은 최근 3년 24.2만→33.5만 톤으로 재가속했고, 펫푸드는 사실상 0에서 12.0만 톤으로 가장 빠르게 팽창했습니다.',
        actionPlan: 'MSC 라벨은 더 이상 틈새가 아니라 주류 소매 표준입니다. 한국 참치 가공사는 캔 재가속·펫푸드 폭증 두 축을 동시에 노려, 인증 원물을 캔과 프리미엄 펫푸드 라인에 함께 투입하면 단일 인증 비용으로 두 성장 시장을 동시에 공략할 수 있습니다.',
        source: 'MSC Annual Report 2024-25 Supplementary Data (liveproductvolume)',
      }}
    />
  );
}
