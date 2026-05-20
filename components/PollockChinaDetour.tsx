'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Target } from 'lucide-react';
import data from '../data/pollock_china_detour.json';
import TakeawayBox from './TakeawayBox';

export default function PollockChinaDetour() {
  const chartData = data.map((d: any) => ({
    ...d,
    r_to_c: d.russia_to_china_t / 1000,
    c_to_w: d.china_to_west_t / 1000,
  }));

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
        <Target size={20} color="var(--color-warning)" />
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
          더블 프로즌(Double-Frozen) '우회 무역' 블랙홀 추적
        </h3>
      </div>
      
      <div style={{ height: '260px', width: '100%', flexShrink: 0 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRussia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorChina" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}k`} />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
              formatter={(value: any) => [`${value.toFixed(1)}k tons`, '']}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
            <Area type="monotone" dataKey="r_to_c" name="러시아 발(發) 중국 수입량 (H&G)" stroke="var(--color-danger)" fillOpacity={1} fill="url(#colorRussia)" />
            <Area type="monotone" dataKey="c_to_w" name="중국 발(發) 서방 수출량 (필렛)" stroke="var(--color-warning)" fillOpacity={1} fill="url(#colorChina)" />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>

      <TakeawayBox
        situation="미국/유럽의 러시아산 수산물 직수입 제재(Tariff/Ban) 이후, 러시아의 거대한 명태 원물(H&G)이 중국으로 집중 유입되고 있습니다. 실제로 중국은 자체 어획량이 '0'임에도 불구하고 23년 한 해에만 무려 약 13만 7천 톤의 명태(대부분 냉동 필레)를 서방으로 역대급 규모 가공 수출하며 거대한 '세탁 공장' 역할을 수행 중임이 실데이터로 증명되었습니다."
        actionPlan="**[Actionable Insight]** 중국 내 가공 공장을 통한 우회 물량은 서방의 '원산지 추적 법규(Traceability)'가 강화될 경우 치명적인 컴플라이언스 리스크를 안게 됩니다. 당사는 중국발 우회 명태 대신 순수 알래스카산(미국) 직반입 비중을 높이거나, 컴플라이언스가 증명된 한국/베트남 내 가공 라인 확보를 통해 서방 바이어들의 ESG 요구에 선제 대응 가능한 공급망 프리미엄을 구축해야 합니다. (Conviction Buy)"
      />
    </div>
  );
}
