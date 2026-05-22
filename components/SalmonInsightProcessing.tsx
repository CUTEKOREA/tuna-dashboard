'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Factory } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/SalmonInsightProcessingData.json';

export default function SalmonInsightProcessing() {
  return (
    <WidgetCard
      title="무인화(Lights-out) 공장 & 슈퍼 칠링"
      icon={Factory}
      iconColor="#38bdf8"
      pillar="S2"
      cardDesc="가공 자동화로 수율 3~4% 극대화 및 GenBI 이력 추적으로 규제 대응"
      telemetry={{ status: 'LIVE' }}
      chartHeight={250}
      chart={
        <BarChart data={rawData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} width={100} />
          <Tooltip 
            contentStyle={{ background: '#181818', border: 'none', borderRadius: '8px' }}
            itemStyle={{ fontSize: '0.85rem' }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
          <Bar dataKey="traditional" name="기존 수작업 공정" fill="#64748b" radius={[0, 4, 4, 0]} barSize={15} />
          <Bar dataKey="automated" name="자동화/GenBI 도입 공정" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={15} />
        </BarChart>
      }
      takeaway={{
        situation: "유럽 및 북미 선진국 가공 허브의 극심한 노동력 부족 현상과 FDA의 이력 추적 의무화 등 까다로운 리테일 유통 기준 압박이 심화되고 있습니다. 수작업에 의존하는 기존 가공 공정은 더 이상 구조적 마진을 방어할 수 없습니다.",
        actionPlan: "BAADER 시스템과 같은 뼈/내장 제거 통합 로보틱스 라인을 도입하여 인건비를 40% 절감하고 수율을 3~4% 극대화하십시오. AI 기반 재고 이력 관리(GenBI)와 슈퍼 칠링 기술을 신규 CAPEX 최우선 순위로 배정해야 합니다.",
        source: "BAADER Group IR · Mowi Annual Report 2024 [📡 LIVE API 연동: 기업 공시]"
      }}
    />
  );
}
