'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ShieldAlert } from 'lucide-react';
import data from '../data/pollock_korea_crisis.json';
import WidgetCard from './WidgetCard';

export default function PollockKoreaCrisis() {
  const chartData = (data as any[]).map((d: any) => ({
    ...d,
    catch_k: d.catch_t / 1000,
    import_k: d.import_t / 1000,
  }));

  return (
    <WidgetCard
      title="대한민국의 국민 생선 모순 — 식량 안보 붕괴와 극단적 편중"
      icon={ShieldAlert}
      iconColor="#ef4444"
      pillar="S1"
      cardDesc="한국 명태 자체 어획량(1980s 30만톤+ → 2010s 1~2만톤) vs 수입량(20~30만톤)의 절대 의존 경제 추적"
      telemetry={{ status: 'STATIC', syncDate: 'MOF 어업생산통계 2024' }}
      chartHeight={260}
      chart={
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCatch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorImport" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}k`} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} formatter={(value: any) => [`${value.toFixed(1)}k tons`, '']} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
          <Area type="monotone" dataKey="catch_k" name="한국 자체 어획량 (Catch)" stroke="var(--color-success)" fillOpacity={1} fill="url(#colorCatch)" />
          <Area type="monotone" dataKey="import_k" name="한국 절대 수입량 (Import)" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorImport)" />
        </AreaChart>
      }
      takeaway={{
        situation: '1980년대 연 30만 톤 이상 어획되던 자체 생산량은 기후 변화·치어 남획으로 2010년대 후반 1~2만 톤으로 붕괴. 그 빈자리를 한 해 약 20~30만 톤 수입이 장악하며 극단적 의존 경제 형성.',
        actionPlan: '러시아 제재·환율 변동 시 국내 물가 직접 충격(명태 품귀). 알래스카(미국) 및 글로벌 우회루트 다변화 + HSK 10단위 세분화 관리(필레·연육·명란) 및 식약처 방사능 검사에 선제 대비할 규제 민첩성 강화.',
        source: 'MOF 어업생산통계 · 관세청 KCS HS 030367 (1980-2024)',
      }}
    />
  );
}
