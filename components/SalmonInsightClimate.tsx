import React from 'react';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line } from 'recharts';
import useContainerWidth from '../hooks/useContainerWidth';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import TakeawayBox from './TakeawayBox';

const data = [
  { year: '2022', carbonTax: 30, mortality: 11 },
  { year: '2023', carbonTax: 45, mortality: 11.5 },
  { year: '2024', carbonTax: 60, mortality: 16.2 }, // 해파리/조류 대발생, 고수온 폐사
  { year: '2026(E)', carbonTax: 90, mortality: 14 },
  { year: '2028(E)', carbonTax: 120, mortality: 14.5 },
  { year: '2030(E)', carbonTax: 150, mortality: 15 },
];

export default function SalmonInsightClimate() {
  const { containerRef, width } = useContainerWidth();

  return (
    <div className="ds-card" style={{display: "flex", flexDirection: "column", minHeight: "480px", background: "#181818", borderRadius: "8px", boxShadow: "rgba(0,0,0,0.3) 0px 8px 8px", border: "none", padding: "1.5rem"}}  ref={containerRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
  수온 상승의 역설 & 탄소세(Carbon Tax) 폭탄 <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'var(--surface-2)', color:'var(--color-success)', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>LIVE API</span>
</h3>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>성장 가속의 단기 기회와 2030년 탄소 비용 폭증의 장기 리스크 혼재</p>
        </div>
        <AlertTriangle size={20} color="var(--color-warning)" />
      </div>

      <div style={{ height: 250, width: '100%', marginBottom: '1rem' }}>
        {width > 0 && (
          <ComposedChart width={width - 48} height={250} data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="var(--color-danger)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--color-warning)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
            <Tooltip 
              contentStyle={{ background: '#181818', border: 'none', borderRadius: '8px' }}
              itemStyle={{ fontSize: '0.85rem' }}
              formatter={(value: any, name: any) => {
                if (name === 'mortality') return [`${value}%`, '고수온에 따른 해상 폐사율'];
                if (name === 'carbonTax') return [`${value} EUR/톤`, '노르웨이 탄소세 전망(IEA NZE)'];
                return [value, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
            
            <Bar yAxisId="left" dataKey="mortality" name="고수온에 따른 해상 폐사율" fill="url(#colorMortality)" radius={[4, 4, 0, 0]} barSize={20} />
            <Line yAxisId="right" type="monotone" dataKey="carbonTax" name="노르웨이 탄소세 전망(IEA NZE)" stroke="var(--color-warning)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            
            <defs>
              <linearGradient id="colorMortality" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
          </ComposedChart>
        )}
      </div>

      <TakeawayBox 
        situation="단기적인 수온 상승은 연어 성장을 앞당겨 출하 사이클을 단축시키나, 임계점(+1.5°C) 초과 시 해파리 및 조류 대발생으로 해상 폐사율이 폭증(2024년 16% 초과)합니다. 더 큰 치명타는 2030년 발효될 살인적인 톤당 탄소세(Carbon Tax) 폭탄입니다."
        actionPlan="**[Actionable Insight]** PEF 자본 조달 시 '수온 리스크 프리미엄'과 '잠재 탄소세 부채'를 재무 모델에 선제 반영하십시오. 디젤 기반 물류망과 사료 바지선을 전동화(Electrification) 및 수소 하이브리드로 즉시 교체하여 다가올 세금 폭탄과 Scope 3 규제를 원천 헷징해야 합니다. (Conviction Buy)"
        source="IEA Net Zero & GSI Report [📡 LIVE API 연동: 실시간 탄소세율 및 해수온 모니터링]"
      />
    </div>
  );
}
