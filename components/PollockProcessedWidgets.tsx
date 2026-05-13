'use client';

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Anchor, AlertTriangle } from 'lucide-react';
import TakeawayBox from './TakeawayBox';

export function WidgetRussiaHegemony() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/pollock_russia_hegemony.json').then(r => r.json()).then(setData);
  }, []);

  if (!data.length) return null;

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      height: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
        <Anchor size={20} color="#f87171" className="neon-pulse" />
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
          명태 가공 패권의 러시아 절대 독점
        </h3>
      </div>
      
      <div style={{ height: '260px', width: '100%', flexShrink: 0 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRussiaPol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRowPol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
              formatter={(value: any, name: any) => [`${(Number(value)/1000).toFixed(1)}k tons`, name]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
            <Area type="monotone" dataKey="row" name="전세계 기타 (Rest of World)" stroke="#94a3b8" fillOpacity={1} fill="url(#colorRowPol)" stackId="1" />
            <Area type="monotone" dataKey="russia" name="러시아 명태 가공 (천 톤)" stroke="var(--color-danger)" fillOpacity={1} fill="url(#colorRussiaPol)" stackId="1" />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>

      <TakeawayBox
        situation="서방의 러시아산 제재에도 불구하고, 전체 글로벌 명태 가공 물량(111만 톤) 중 75만 톤(약 67%)을 러시아 단일 국가가 독점 생산하며 생태계를 완벽히 장악하고 있습니다."
        actionPlan="서방의 Boycott이 무의미할 정도로 러시아 공장 선단(Factory trawlers)이 밸류체인 최상단을 지배하고 있습니다. 무리한 탈(脫)러시아화는 매입 원가 상승 폭탄으로 돌아오므로, 우회로(중국 필레 가공)를 통한 전략적 락인(Lock-in)이 여전히 불가피합니다."
      />
    </div>
  );
}

export function WidgetEaCollapse() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/pollock_ea_collapse.json').then(r => r.json()).then(setData);
  }, []);

  if (!data.length) return null;

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      height: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
        <AlertTriangle size={20} color="#eab308" />
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
          한·일 가공업의 몰락과 식탁 종속
        </h3>
      </div>
      
      <div style={{ height: '260px', width: '100%', flexShrink: 0 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
              formatter={(value: any, name: any) => [`${(Number(value)/1000).toFixed(1)}k tons`, name]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
            <Line type="monotone" dataKey="japan" name="일본 (Japan)" stroke="#eab308" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="korea" name="대한민국 (Korea)" stroke="var(--color-info)" strokeWidth={3} dot={false} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>

      <TakeawayBox
        situation="1980년대 각 49만 톤, 37만 톤 수준의 막대한 원물을 자체 가공하던 일본과 한국 명태 산업은 2023년 나란히 4만 톤 규모로 대침몰(Collapse)하며 가공 펀더멘털이 소멸했습니다."
        actionPlan="오징어와 동일한 디스토피아 패턴입니다. 자국 내 기초 가공 능력을 완전히 상실하였기에, 향후 중국·러시아에서 가공된 필레와 반제품을 '부르는 게 값'인 셀러즈 마켓(Seller's Market) 구조에서 비싸게 사와야만 하는 수입 종속국으로 완전히 전락했습니다."
      />
    </div>
  );
}
