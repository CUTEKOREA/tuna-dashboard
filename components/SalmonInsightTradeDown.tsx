import React, { useState, useEffect } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShoppingCart, RefreshCcw } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';
import rawData from '../data/salmon_insight_trade_down.json';

const euData = rawData.euData;

export default function SalmonInsightTradeDown() {
  const [activeTab, setActiveTab] = useState<'eu' | 'kr'>('kr');
  const [kamisData, setKamisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/salmon/kamis')
      .then(res => res.json())
      .then(d => {
        setKamisData(d.historicalSpread);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const takeaway = activeTab === 'eu'
    ? {
        situation: "러-우 전쟁발 거시 인플레이션으로 EU 주요국의 가정용 신선 연어 소비 '물량(Volume)'은 급감했습니다. 그러나 소비자들이 소포장, PB 상품, 훈제 가공품 등으로 하향 구매(Trade-Down)를 단행하면서 전체 '지출액(Value)'은 오히려 최고치를 경신하는 디커플링 현상이 발생했습니다.",
        actionPlan: "인플레이션 국면에서는 프리미엄 통연어 유통을 과감히 축소하고, 가격 방어력이 소포장(Convenience) 및 PB 가공 포트폴리오를 즉각 런칭하여 판매량(Volume) 하락을 Bottom-line(순이익)률(Margin)로 상쇄하는 전략이 필수적입니다. (Execution Recommended)",
        source: "EUMOFA 소비 패널(정적 스냅샷, 2019–2024E) · 자체 정리",
      }
    : {
        situation: "2024년 고수온 폐사로 국내 양식 광어 도매가 역시 20,000원/kg 선을 돌파하며 연어와의 가격 스프레드가 무의미해졌습니다. 저가 대체 어종이 사라짐에 따라 소비자는 연어를 포기하는 대신 소포장/HMR 가공품으로 구매 단위를 축소(Trade-Down)하고 있습니다.",
        actionPlan: "단가 상승을 방어하기 위한 단순 B2B 도매 경쟁은 한계에 달했습니다. EU의 사례처럼 B2C 소포장(Convenience) 및 초밥/샐러드용 필렛(Fillet)으로 제품군을 파편화하여, 물량(Volume) 감소를 마진(Margin) 확대로 상쇄하는 가치 창출 전환이 시급합니다. (Immediate Action Required)",
        source: "KAMIS 수산물 도매가(연어·광어·닭, 키 미설정 시 검증 캐시 폴백)",
      };

  const tabs = (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
      <button
        onClick={() => setActiveTab('kr')}
        style={{
          background: activeTab === 'kr' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${activeTab === 'kr' ? '#38bdf8' : 'transparent'}`,
          color: activeTab === 'kr' ? '#38bdf8' : '#94a3b8',
          padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        🇰🇷 KAMIS (도매가)
      </button>
      <button
        onClick={() => setActiveTab('eu')}
        style={{
          background: activeTab === 'eu' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${activeTab === 'eu' ? '#38bdf8' : 'transparent'}`,
          color: activeTab === 'eu' ? '#38bdf8' : '#94a3b8',
          padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        🇪🇺 EUMOFA (히스토릭)
      </button>
    </div>
  );

  const chartArea = (
    <div style={{ height: 250, width: '100%', marginBottom: '1rem' }}>
      {activeTab === 'eu' && (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={euData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="var(--color-info)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}k t`} />
            <YAxis yAxisId="right" orientation="right" stroke="#f97316" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}M`} />
            <Tooltip contentStyle={{ background: '#181818', border: 'none', borderRadius: '8px' }} itemStyle={{ fontSize: '0.85rem' }} />
            <Legend wrapperStyle={{ fontSize: '0.8rem' }} />

            <Bar yAxisId="left" dataKey="frVol" name="🇫🇷 프랑스 소비량 (천톤)" fill={A11Y_PALETTE[0]} radius={[4, 4, 0, 0]} barSize={14} />
            <Bar yAxisId="left" dataKey="esVol" name="🇪🇸 스페인 소비량 (천톤)" fill={A11Y_PALETTE[3]} radius={[4, 4, 0, 0]} barSize={14} />
            <Line yAxisId="right" type="monotone" dataKey="frVal" name="🇫🇷 프랑스 지출액 (EUR M)" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line yAxisId="right" type="monotone" dataKey="esVal" name="🇪🇸 스페인 지출액 (EUR M)" stroke="var(--color-danger)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} strokeDasharray="5 3" />
          </ComposedChart>
        </ResponsiveContainer>
      )}
      {activeTab === 'kr' && (
        loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <RefreshCcw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={kamisData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-warning)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k₩`} />
              <Tooltip contentStyle={{ background: '#181818', border: 'none', borderRadius: '8px' }} itemStyle={{ fontSize: '0.85rem' }} />
              <Legend wrapperStyle={{ fontSize: '0.8rem' }} />

              <Line type="monotone" dataKey="salmon_fresh" name="🇳🇴 생연어 수입 (노량진/KAMIS)" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="halibut" name="🇰🇷 양식 광어 (노량진/KAMIS)" stroke="var(--color-info)" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="chicken" name="🇰🇷 생닭 (가락/KAMIS)" stroke="var(--color-success)" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 4" />
            </ComposedChart>
          </ResponsiveContainer>
        )
      )}
    </div>
  );

  const telemetry = activeTab === 'kr'
    ? {
        status: (kamisData as any)?.isLive ? 'LIVE' : (kamisData ? 'SYNCED' : 'STATIC'),
        syncDate: (kamisData as any)?.timestamp
          ? (kamisData as any).timestamp.slice(0, 10)
          : '2026-05-29',
      } as const
    : { status: 'STATIC' as const, syncDate: '2026-05-29' };

  return (
    <WidgetCard
      title="[판매] 인플레이션 대체 단백질 가격 (Trade-Down)"
      icon={ShoppingCart}
      iconColor="#f97316"
      pillar="S4"
      cardDesc={activeTab === 'kr'
        ? 'KAMIS 수산물 도매 단가(연어·광어·닭) 추적 — API 키 미설정 시 검증 캐시 폴백'
        : 'EU 주요국 가정용 신선 연어 소비량(톤) vs 지출액 디커플링 추적(정적 스냅샷)'}
      telemetry={telemetry}
      customBody={<>{tabs}{chartArea}</>}
      takeaway={takeaway}
    />
  );
}
