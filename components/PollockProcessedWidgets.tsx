'use client';

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Anchor, AlertTriangle } from 'lucide-react';
import WidgetCard from './WidgetCard';

export function WidgetRussiaHegemony() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/pollock_russia_hegemony.json').then(r => r.json()).then(setData);
  }, []);

  if (!data.length) return null;

  return (
    <WidgetCard
      title="명태 가공 패권의 러시아 절대 독점"
      icon={Anchor}
      iconColor="#f87171"
      pillar="S2"
      cardDesc="러시아 명태 가공 vs 전세계 기타 국가 가공량 — 러시아 단일 67% 점유의 글로벌 가공 패권 추적"
      telemetry={{ status: 'STATIC', syncDate: '글로벌 가공 통계 2024' }}
      chartHeight={260}
      chart={
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorRussiaPol" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRowPol" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} formatter={(value: any, name: any) => [`${(Number(value) / 1000).toFixed(1)}k tons`, name]} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
          <Area type="monotone" dataKey="row" name="전세계 기타 (Rest of World)" stroke="#94a3b8" fillOpacity={1} fill="url(#colorRowPol)" stackId="1" />
          <Area type="monotone" dataKey="russia" name="러시아 명태 가공 (천 톤)" stroke="var(--color-danger)" fillOpacity={1} fill="url(#colorRussiaPol)" stackId="1" />
        </AreaChart>
      }
      takeaway={{
        situation: '서방의 러시아산 제재에도 불구하고, 전체 글로벌 명태 가공 물량(111만 톤) 중 75만 톤(약 67%)을 러시아 단일 국가가 독점 생산하며 생태계 장악.',
        actionPlan: '서방 Boycott 무력화 — 러시아 공장 선단(Factory trawlers)이 밸류체인 최상단 지배. 무리한 탈러시아화는 매입원가 상승을 유발, 우회로(중국 필레 가공)를 통한 전략적 락인이 불가피.',
        source: 'FAO FishStat · UN Comtrade 가공 통계 (2024)',
      }}
    />
  );
}

export function WidgetEaCollapse() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/pollock_ea_collapse.json').then(r => r.json()).then(setData);
  }, []);

  if (!data.length) return null;

  return (
    <WidgetCard
      title="한·일 가공업의 몰락과 식탁 종속"
      icon={AlertTriangle}
      iconColor="#eab308"
      pillar="S2"
      cardDesc="1980s 각 49/37만 톤이던 일본·한국 명태 가공량의 2023년 4만 톤 동반 붕괴 추적"
      telemetry={{ status: 'STATIC', syncDate: 'MOF·JFA 가공 통계 2024' }}
      chartHeight={260}
      chart={
        <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} formatter={(value: any, name: any) => [`${(Number(value) / 1000).toFixed(1)}k tons`, name]} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
          <Line type="monotone" dataKey="japan" name="일본 (Japan)" stroke="#eab308" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="korea" name="대한민국 (Korea)" stroke="var(--color-info)" strokeWidth={3} dot={false} />
        </LineChart>
      }
      takeaway={{
        situation: '1980년대 각 49만 톤·37만 톤 수준의 자체 가공량을 가졌던 일본과 한국 명태 산업은 2023년 나란히 4만 톤 규모로 대침몰(Collapse), 가공 펀더멘털 소멸.',
        actionPlan: '오징어와 동일한 디스토피아 패턴. 자국 내 기초 가공 능력 완전 상실로 중국·러시아 가공 필레/반제품을 셀러즈 마켓 구조에서 수입 종속해야 하는 위치로 전락.',
        source: 'MOF 가공통계 · JFA 일본 가공 통계 (1980-2023)',
      }}
    />
  );
}
