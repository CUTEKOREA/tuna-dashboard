import React from 'react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart
} from 'recharts';
import { TrendingUp, Globe, Factory } from 'lucide-react';
import { getTunaData } from '@/lib/data/tuna';
import TakeawayBox from './TakeawayBox';
import TelemetryBadge from './TelemetryBadge';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { ChartPatternDefs } from './ChartPatterns';

const tradeData = getTunaData('thaiTradeSummary');
const COLORS = ['var(--color-info)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-danger)', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: 'rgba(20, 28, 52, 0.9)', 
        backdropFilter: 'blur(8px)',
        padding: '12px', 
        border: '1px solid rgba(255,255,255,0.1)', 
        borderRadius: '8px', 
        color: 'var(--w-slate-50)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--w-slate-400)', fontWeight: 600 }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '0.9rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
            <span style={{ color: entry.color, fontWeight: 500 }}>{entry.name}:</span>
            <span style={{ fontWeight: 700 }}>{entry.value.toLocaleString()} tons</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default React.memo(function ThaiTunaTradeStats() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        
        {/* 1. Yearly Trade Trend */}
        <div 
          style={{ 
            background: 'rgba(20, 28, 52, 0.4)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(140, 170, 255, 0.10)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <TrendingUp size={20} color="var(--color-info)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--w-slate-50)', margin: 0 }}>태국 참치 무역량 추이 (2019-2023)</h3>
            <div style={{ marginLeft: 'auto' }}><TelemetryBadge status="SYNCED" syncDate="UN Comtrade 2019–23" /></div>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--w-slate-500)', margin: '0 0 1.2rem 0' }}>출처: UN Comtrade — 태국(reporter) 참치 HS1604·0303 연간 수출입 (2019–2023 스냅샷, 단위: 톤)</p>
          
          <div style={{ height: '300px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={tradeData.yearly_totals}>
                <ChartPatternDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
                <XAxis dataKey="year" stroke="var(--w-slate-400)" fontSize={12} tickMargin={10} />
                <YAxis stroke="var(--w-slate-400)" fontSize={12} tickFormatter={(val) => (val / 1000).toFixed(0) + 'k'} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                <Bar name="수입 (Imports)" dataKey="imports" fill="var(--color-info)" radius={[4, 4, 0, 0]} barSize={40} opacity={0.6} isAnimationActive={false} />
                <Line name="수출 (Exports)" type="monotone" dataKey="exports" stroke="var(--color-success)" strokeWidth={3} dot={{ fill: 'var(--color-success)', r: 4 }} isAnimationActive={false} />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <TakeawayBox 
              situation="태국은 전 세계 최대의 참치 가공 허브로, 원료(냉동 가다랑어 등)를 대량 수입하여 가공 제품(통조림, 파우치)으로 재수출하는 구조가 뚜렷합니다. 수입량이 수출량보다 약 5배 이상 높게 유지되고 있습니다."
              actionPlan="원료 수입가 변동에 따른 가공 마진 압박을 모니터링해야 하며, 방콕(Bangkok) 오퍼 가격이 글로벌 참치 가격의 핵심 지표임을 재확인할 수 있습니다."
            />
          </div>
        </div>

        {/* 2. Top Export Commodities */}
        <div 
          style={{ 
            background: 'rgba(20, 28, 52, 0.4)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(140, 170, 255, 0.10)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <Factory size={20} color="var(--color-success)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--w-slate-50)', margin: 0 }}>주요 수출 품목 (2023)</h3>
            <div style={{ marginLeft: 'auto' }}><TelemetryBadge status="SYNCED" syncDate="UN Comtrade 2023" /></div>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--w-slate-500)', margin: '0 0 1.2rem 0' }}>출처: UN Comtrade — 태국 참치 수출 품목(HS)별 2023 스냅샷 (단위: 톤)</p>

          <div style={{ height: '300px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={tradeData.top_commodities_2023} layout="vertical" margin={{ left: 20, right: 30 }}>
                <ChartPatternDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="var(--w-slate-400)"
                  fontSize={10} 
                  width={150}
                  tickFormatter={(val) => val.length > 25 ? val.substring(0, 25) + '...' : val}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="var(--color-success)" radius={[0, 4, 4, 0]} barSize={25} isAnimationActive={false}>
                  {tradeData.top_commodities_2023.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <TakeawayBox 
              situation="수출의 약 70% 이상이 '밀폐 용기에 담긴 가공 참치(통조림)'에 집중되어 있으며, 고부가가치 제품인 황다랑어(Yellowfin) 및 가공 로인(Loins) 비중이 뒤를 잇고 있습니다."
              actionPlan="전통적인 통조림 시장 외에도 반려동물용(Pet Food) 참치 가공 및 RTE(Ready-to-Eat) 파우치 제품으로의 포트폴리오 다변화 전략이 관찰됩니다."
            />
          </div>
        </div>

        {/* 3. Top Export Partners */}
        <div 
          style={{ 
            background: 'rgba(20, 28, 52, 0.4)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(140, 170, 255, 0.10)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <Globe size={20} color="var(--color-warning)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--w-slate-50)', margin: 0 }}>주요 수출 대상국 (2023)</h3>
            <div style={{ marginLeft: 'auto' }}><TelemetryBadge status="SYNCED" syncDate="UN Comtrade 2023" /></div>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--w-slate-500)', margin: '0 0 1.2rem 0' }}>출처: UN Comtrade — 태국 참치 수출 대상국별 2023 스냅샷 (단위: 톤)</p>

          <div style={{ height: '300px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tradeData.top_partners_2023}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={false}
                  label={({ name, percent }: any) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                >
                  {tradeData.top_partners_2023.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </SafeResponsiveContainer>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <TakeawayBox 
              situation="미국과 일본이 태국산 가공 참치의 양대 핵심 시장으로 군림하고 있으며, 최근 베트남과 중동(리비아 등), 호주로의 수출 비중이 고르게 분포되어 있습니다."
              actionPlan="미국 시장의 수요 회복 여부와 엔저 현상에 따른 일본향 수출 단가 변동성을 리스크 관리 항목으로 지정해야 합니다."
            />
          </div>
        </div>

      </div>
    </div>
  );
});
