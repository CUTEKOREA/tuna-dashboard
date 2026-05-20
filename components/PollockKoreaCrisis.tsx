'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { ShieldAlert } from 'lucide-react';
import data from '../data/pollock_korea_crisis.json';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';

export default function PollockKoreaCrisis() {
  const chartData = data.map((d: any) => ({
    ...d,
    catch_k: d.catch_t / 1000,
    import_k: d.import_t / 1000
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
        <ShieldAlert size={20} color="var(--color-danger)" />
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
          대한민국의 국민 생선 모순: '식량 안보' 붕괴와 극단적 편중
        </h3>
      </div>
      
      <div style={{ height: '260px', width: '100%', flexShrink: 0 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorCatch" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorImport" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
            <Area type="monotone" dataKey="catch_k" name="한국 자체 어획량 (Catch)" stroke="var(--color-success)" fillOpacity={1} fill="url(#colorCatch)" />
            <Area type="monotone" dataKey="import_k" name="한국 절대 수입량 (Import)" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorImport)" />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>

      <TakeawayBox
        situation="1980년대 연 30만 톤 이상 어획되던 자체 생산량(녹색선)은 기후 변화와 치어 남획으로 완전 붕괴되어, 2010년대 후반 이후 1~2만 톤 규모로 쪼그라들었습니다. 그 빈자리를 거대한 수입 물량(보라색선, 한 해 약 20만~30만 톤 수입)이 완벽히 장악한 극단적 '의존 경제' 상태입니다."
        actionPlan="러시아 제재나 환율 변동 시 국내 물가는 직격탄(명태 연쇄 품귀 현상)을 맞습니다. 알래스카(미국) 및 글로벌 우회루트 다변화를 추진함과 동시에, 조만간 도입될 HSK 10단위 세분화 관리(필레, 연육, 명란 엄격 구분) 및 식약처 방사능 검사에 선제 대비할 규제(Compliance) 민첩성 강화가 필수입니다."
      />
    </div>
  );
}
