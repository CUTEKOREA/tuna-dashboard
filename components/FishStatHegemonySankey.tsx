import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { AlertTriangle } from 'lucide-react';
import TermTooltip from './TermTooltip';

const data = [
  { year: '2019', norway: 280, iceland: 80, uk: 90, faroe: 60 },
  { year: '2020', norway: 270, iceland: 90, uk: 100, faroe: 70 },
  { year: '2021', norway: 260, iceland: 105, uk: 110, faroe: 85 },
  { year: '2022', norway: 220, iceland: 130, uk: 140, faroe: 110 },
  { year: '2023', norway: 160, iceland: 160, uk: 170, faroe: 140 },
  { year: '2024', norway: 140, iceland: 180, uk: 190, faroe: 160 }
];

export default function FishStatHegemonySankey() {
  return (
    <div style={{ background: 'rgba(0, 20, 40, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '24px', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>글로벌 패권 이동 (Hegemony Shift)</h3>
        <TermTooltip term="어획 쿼터 이동" description="노르웨이의 해상 보호 명목 50% TAC 삭감으로 인해, 이탈된 물량이 파로스/아이슬란드로 분산 이동되는 현상" />
      </div>
      
      <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--w-red-500)', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <AlertTriangle size={20} color="var(--color-danger)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
          <strong style={{ color: 'var(--color-danger)' }}>Situation:</strong> 노르웨이의 시장 독점 지위가 붕괴 중. 북대서양 패권이 4국 체제로 전환.<br/>
          <strong style={{ color: 'var(--color-danger)' }}>Takeaway:</strong> 영국/스코틀랜드 산지 직수입 TF 가동 필수.
        </div>
      </div>

      <div style={{ height: '240px', width: '100%' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNorway" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorIceland" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorUk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <RechartsTooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)', border: 'none', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Area type="monotone" dataKey="norway" name="노르웨이" stackId="1" stroke="var(--color-danger)" fill="url(#colorNorway)" />
            <Area type="monotone" dataKey="iceland" name="아이슬란드" stackId="1" stroke="var(--color-success)" fill="url(#colorIceland)" />
            <Area type="monotone" dataKey="uk" name="영국/파로스" stackId="1" stroke="var(--color-info)" fill="url(#colorUk)" />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );
}
