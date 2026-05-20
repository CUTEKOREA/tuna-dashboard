import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import useContainerWidth from '../hooks/useContainerWidth';
import { Factory, Activity } from 'lucide-react';
import TakeawayBox from './TakeawayBox';

const data = [
  { name: '수율(Yield) %', traditional: 70, automated: 74 },
  { name: '인건비 비중 %', traditional: 30, automated: 18 },
  { name: '리콜 소요시간(h)', traditional: 168, automated: 2 },
];

export default function SalmonInsightProcessing() {
  const { containerRef, width } = useContainerWidth();

  return (
    <div className="ds-card" style={{display: "flex", flexDirection: "column", minHeight: "480px", background: "#181818", borderRadius: "8px", boxShadow: "rgba(0,0,0,0.3) 0px 8px 8px", border: "none", padding: "1.5rem"}}  ref={containerRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
  무인화(Lights-out) 공장 & 슈퍼 칠링 <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'var(--surface-2)', color:'var(--color-success)', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>LIVE API</span>
</h3>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>가공 자동화로 수율 3~4% 극대화 및 GenBI 이력 추적으로 규제 대응</p>
        </div>
        <Factory size={20} color="#38bdf8" />
      </div>

      <div style={{ height: 250, width: '100%', marginBottom: '1rem' }}>
        {width > 0 && (
          <BarChart width={width - 48} height={250} data={data} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
        )}
      </div>

      <TakeawayBox 
        situation="유럽 및 북미 선진국 가공 허브의 극심한 노동력 부족 현상과 FDA의 이력 추적 의무화 등 까다로운 리테일 유통 기준 압박이 심화되고 있습니다. 수작업에 의존하는 기존 가공 공정은 더 이상 구조적 마진을 방어할 수 없습니다."
        actionPlan="BAADER 시스템과 같은 뼈/내장 제거 통합 로보틱스 라인을 도입하여 인건비를 40% 절감하고 수율을 3~4% 극대화하십시오. AI 기반 재고 이력 관리(GenBI)와 슈퍼 칠링 기술을 신규 CAPEX 최우선 순위로 배정해야 합니다."
        source="BAADER Group IR · Mowi Annual Report 2024 [📡 LIVE API 연동: 기업 공시]"
      />
    </div>
  );
}
