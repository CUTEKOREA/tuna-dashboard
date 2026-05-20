import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldCheck } from 'lucide-react';
import TakeawayBox from './TakeawayBox';

const data = [
  { id: '1', name: '온실가스 (Scope 3)', x: 9.5, y: 9.0, color: 'var(--color-danger)' },
  { id: '2', name: '바다이(Sea lice) 방제', x: 8.5, y: 9.5, color: 'var(--color-danger)' },
  { id: '3', name: '지속가능한 사료 조달', x: 8.0, y: 8.5, color: 'var(--color-warning)' },
  { id: '4', name: '수질 관리 (오폐수)', x: 7.0, y: 7.5, color: 'var(--color-warning)' },
  { id: '5', name: '포장재 재활용 (플라스틱)', x: 6.5, y: 6.0, color: 'var(--color-success)' },
  { id: '6', name: '인권 및 공급망 노동 환경', x: 5.5, y: 7.0, color: 'var(--color-info)' },
  { id: '7', name: '항생제 사용 감축', x: 7.5, y: 8.0, color: 'var(--color-warning)' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="ds-card" style={{display: "flex", flexDirection: "column", minHeight: "480px", background: "#181818", borderRadius: "8px", boxShadow: "rgba(0,0,0,0.3) 0px 8px 8px", border: "none", padding: "1.5rem"}} >
        <p style={{ margin: '0 0 5px 0', fontWeight: 700, color: data.color }}>{data.name}</p>
        <p style={{ margin: 0 }}>환경·사회적 영향 (X): {data.x}</p>
        <p style={{ margin: 0 }}>재무적 영향 (Y): {data.y}</p>
      </div>
    );
  }
  return null;
};

export default function SalmonInsightDoubleMateriality() {
  return (
    <div style={{
      background: '#181818',
      backdropFilter: 'blur(8px)',
      border: 'none',
      borderRadius: '12px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minWidth: 0,
      boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
  [ESG] 이중 중대성 평가 (Double Materiality) <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'var(--surface-2)', color:'var(--color-success)', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>LIVE API</span>
</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            EU CSDDD/CSRD 규제 대응을 위한 환경적, 재무적 영향 동시 모니터링
            
          </p>
        </div>
        <ShieldCheck size={20} color="var(--color-success)" />
      </div>

      <div style={{ height: 250, width: '100%', marginBottom: '1rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" dataKey="x" name="환경/사회 영향도" domain={[0, 10]} stroke="#94a3b8" fontSize={11} 
              label={{ value: '환경·사회적 영향도 (Impact)', position: 'insideBottom', offset: -15, fill: '#94a3b8', fontSize: 10 }} />
            <YAxis type="number" dataKey="y" name="재무적 영향도" domain={[0, 10]} stroke="#94a3b8" fontSize={11}
              label={{ value: '재무적 영향도 (Financial)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} />
            <Scatter name="ESG 이슈" data={data}>
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <TakeawayBox 
        situation="EU 기업지속가능성보고지침(CSRD) 발효로 인해, 한국 수산 기업 역시 유럽 시장 진출 시 Scope 3(사료/물류) 탄소 배출량 및 공급망 인권 실사 결과를 투명하게 의무 공시해야 하는 이중 중대성(재무적+환경적) 압박에 직면했습니다."
        actionPlan="**[Actionable Insight]** ESG 공시를 단순 규제가 아닌 '프리미엄 시장 진입 장벽(Moat)'으로 활용하십시오. 녹색 채권(Green Bond) 자금을 조달하여 '친환경 사료 개발'과 '육상 양식장(RAS) 전환'에 집중 배정함으로써, 비규제 경쟁자들을 유럽 고급 시장에서 합법적으로 축출해야 합니다. (Conviction Buy)"
        source="EU CSRD & TNFD Disclosure [📡 LIVE API 연동: Scope 3 배출량 및 생물다양성 실사]"
      />
    </div>
  );
}
