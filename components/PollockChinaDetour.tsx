'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Target } from 'lucide-react';
import data from '../data/pollock_china_detour.json';
import WidgetCard from './WidgetCard';

export default function PollockChinaDetour() {
  const chartData = (data as any[]).map((d: any) => ({
    ...d,
    r_to_c: d.russia_to_china_t / 1000,
    c_to_w: d.china_to_west_t / 1000,
  }));

  return (
    <WidgetCard
      title="더블 프로즌(Double-Frozen) 우회 무역 블랙홀 추적"
      icon={Target}
      iconColor="#f59e0b"
      pillar="S3"
      cardDesc="러시아 → 중국 명태 원물(H&G) 수입량 vs 중국 → 서방 명태 필레 수출량의 연도별 추적 — 우회 가공 경로 가시화"
      telemetry={{ status: 'STATIC', syncDate: '2024 기준' }}
      chartHeight={260}
      chart={
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorRussia" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorChina" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}k`} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} formatter={(value: any) => [`${value.toFixed(1)}k tons`, '']} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
          <Area type="monotone" dataKey="r_to_c" name="러시아 발(發) 중국 수입량 (H&G)" stroke="var(--color-danger)" fillOpacity={1} fill="url(#colorRussia)" />
          <Area type="monotone" dataKey="c_to_w" name="중국 발(發) 서방 수출량 (필렛)" stroke="var(--color-warning)" fillOpacity={1} fill="url(#colorChina)" />
        </AreaChart>
      }
      takeaway={{
        situation: '미국/유럽의 러시아산 수산물 직수입 제재(Tariff/Ban) 이후 러시아 명태 원물(H&G)이 중국으로 집중 유입. 중국은 자체 어획량이 0임에도 2023년 약 13만 7천 톤의 명태(대부분 냉동 필레)를 서방으로 가공 수출하며 우회 가공 허브 역할 수행.',
        actionPlan: '중국 내 가공 공장을 통한 우회 물량은 서방 \'원산지 추적 법규(Traceability)\' 강화 시 컴플라이언스 리스크. 순수 알래스카산(미국) 직반입 비중 확대 또는 한국/베트남 내 가공 라인 확보로 서방 바이어 ESG 요구에 선제 대응.',
        source: 'OEC HS 0303 무역 흐름 · UN Comtrade (2018-2024)',
      }}
    />
  );
}
