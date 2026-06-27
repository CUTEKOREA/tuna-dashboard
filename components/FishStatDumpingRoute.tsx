import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Workflow } from 'lucide-react';
import TermTooltip from './TermTooltip';
import { ChartPatternDefs } from './ChartPatterns';

const data = [
  { year: '2020', asiaDiscard: 40, africaImport: 45, scfi: 1000 },
  { year: '2021', asiaDiscard: 65, africaImport: 70, scfi: 2800 },
  { year: '2022', asiaDiscard: 80, africaImport: 95, scfi: 4500 },
  { year: '2023', asiaDiscard: 120, africaImport: 140, scfi: 1500 },
  { year: '2024', asiaDiscard: 160, africaImport: 190, scfi: 2200 }
];

export default function FishStatDumpingRoute() {
  return (
    <div style={{ background: 'rgba(0, 20, 40, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '24px', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>서아프리카 덤핑 무역망 (Dumping Route)</h3>
        <TermTooltip term="덤핑/차익거래 루트" description="아시아에서 상품성을 잃은 소형어(치어)가 낮은 해운 운임지수를 타고 가나, 나이지리아 훈제용으로 수출되는 현상" />
      </div>
      
      <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <Workflow size={20} color="var(--color-info)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
          <strong style={{ color: 'var(--color-info)' }}>Situation:</strong> 동아프리카/서아프리카향 미성어 해운 물동량이 운임지수(SCFI) 급락과 맞물려 폭발 중.<br/>
          <strong style={{ color: 'var(--color-info)' }}>Takeaway:</strong> 국내 내수용 저가 창고 보관료 소모 대비 즉각적인 아프리카 수출 Push 영업 모멘텀 타겟팅.
        </div>
      </div>

      <div style={{ height: '240px', width: '100%' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis yAxisId="left" tickFormatter={(val) => `${val}k`} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `$${val}`} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: 'none', borderRadius: '8px' }} formatter={(value: any, name: any) => { return name === 'SCFI' ? [`$${value}`, name] : [`${value}k Tons`, name]; }} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar yAxisId="left" dataKey="asiaDiscard" name="아시아 미성어 방출" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="left" dataKey="africaImport" name="서아프리카 수입고" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="scfi" name="해운운임지수(SCFI)" stroke="var(--color-danger)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-danger)' }} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );
}
