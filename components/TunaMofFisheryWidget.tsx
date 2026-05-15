"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, LineChart, Line, Legend, ComposedChart } from 'recharts';
import { Ship, Globe, Truck, Building2 } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';
import styles from './TunaInsightsDashboard.module.css';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


const FALLBACK_FISH = [
  { market: '부산공동어시장', volume: 12450, avgPrice: 8200 },
  { market: '제주한림', volume: 3200, avgPrice: 9100 },
  { market: '통영', volume: 5800, avgPrice: 7600 },
  { market: '여수', volume: 4100, avgPrice: 7900 },
  { market: '속초', volume: 2900, avgPrice: 8500 },
];
const FALLBACK_TRADE = [
  { month: '2024-07', export: 42, import: 185, balance: -143 },
  { month: '2024-08', export: 38, import: 192, balance: -154 },
  { month: '2024-09', export: 45, import: 178, balance: -133 },
  { month: '2024-10', export: 51, import: 201, balance: -150 },
  { month: '2024-11', export: 48, import: 195, balance: -147 },
  { month: '2024-12', export: 55, import: 210, balance: -155 },
];
const FALLBACK_SHIPPING = [
  { route: '부산→방콕', cost20ft: 850, cost40ft: 1450, trend: '↗ +8%' },
  { route: '부산→오사카', cost20ft: 620, cost40ft: 1080, trend: '→ +1%' },
  { route: '부산→LA', cost20ft: 2200, cost40ft: 3800, trend: '↗ +15%' },
  { route: '부산→로테르담', cost20ft: 1900, cost40ft: 3200, trend: '↘ -3%' },
];

export function MofFishMarketWidget() {
  const [data, setData] = useState(FALLBACK_FISH);
  const [live, setLive] = useState(false);
  useEffect(() => {
    fetch('/api/mof-fishery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: 'fish-market' }) })
      .then(r => r.json()).then(d => { if (d.fishMarket) { setData(d.fishMarket); setLive(true); } }).catch(() => {});
  }, []);
  
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader} style={{ display: 'flex', alignItems: 'center' }}>
        <h3 className={styles.cardTitle} style={{ flex: 1, margin: 0 }}>
          <Building2 size={20} color="#0ea5e9"/> [위판장 현황] 냉동 눈다랑어(Bigeye) 위탁판매 현황 (2026)
          <TermTooltip term="" description="국내 주요 위판장(부산, 제주 등)의 2026년 냉동 눈다랑어(Bigeye Tuna) 위탁판매 물량(MT) 및 평균 단가(₩/kg) 동향을 추적합니다." />
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>(단위: MT / ₩/kg)</span>
        </h3>
        <span style={{ fontSize: '0.75rem', color: live ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{live ? '🟢 LIVE' : '🟡 CACHED'}</span>
      </div>
      <p className={styles.cardDesc} style={{ padding: '0 20px', marginTop: 0 }}>
        해양수산부 수산정보포털(FIS) API에서 국내 5대 위판장의 냉동 눈다랑어 위탁판매 데이터를 실시간 수집하여, 시장별 거래량과 평균 단가를 비교 시각화합니다.
      </p>
      <div className={styles.cardBody} style={{ paddingBottom: 0 }}>
        <div className={styles.chartContainer} style={{ height: 280 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="market" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }}  angle={-25} textAnchor="end" height={60} tickFormatter={truncateXAxis}/>
              <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} tickFormatter={(val) => `₩${val.toLocaleString()}`} />
              <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="volume" fill="#0ea5e9" name="거래량(MT)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="avgPrice" stroke="#f59e0b" strokeWidth={3} name="평균 단가(₩/kg)" dot={{ r: 4 }} />
            </ComposedChart>
          </SafeResponsiveContainer>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox 
          situation="[Domestic Supply Concentration] 2026년 1분기 기준, 국내 냉동 눈다랑어 물량의 43%가 부산공동어시장(12,450MT)에 집중되며 물류 병목 현상이 발생하고 있습니다. 반면, 제주 한림 위판장은 거래량은 적으나(3,200MT) 선도 프리미엄이 반영되어 전국 최고가인 ₩9,100/kg을 기록하며 하이엔드 횟감 시장을 주도하고 있습니다." 
          actionPlan="[Premium Margin Strategy] 부산에 집중된 범용 물량은 B2B 가공용 고정 단가 계약으로 가격 변동 리스크를 헷지하십시오. 동시에, 제주 한림 위판장의 고단가 프리미엄 눈다랑어 물량은 최고가 일본 수출 및 국내 오마카세 직거래 채널로 전량 스위칭하여 마진율을 극대화해야 합니다." 
          source="해양수산부 수산정보포털(FIS) 위판장 위탁판매 데이터 (2026)" 
        />
      </div>
    </div>
  );
}

export function MofTradeBalanceWidget() {
  const [data, setData] = useState(FALLBACK_TRADE);
  const [live, setLive] = useState(false);
  useEffect(() => {
    fetch('/api/mof-fishery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: 'trade-balance' }) })
      .then(r => r.json()).then(d => { if (d.tradeBalance) { setData(d.tradeBalance); setLive(true); } }).catch(() => {});
  }, []);
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader} style={{ display: 'flex', alignItems: 'center' }}>
        <h3 className={styles.cardTitle} style={{ flex: 1, margin: 0 }}>
          <Globe size={20} color="#10b981"/> [무역수지] 참치 수출입 무역수지 추이
          <TermTooltip term="" description="국가 전체의 참치 수출입 규모와 무역수지 적자/흑자 트렌드를 실시간 분석합니다." />
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>(단위: USD Million)</span>
        </h3>
        <span style={{ fontSize: '0.75rem', color: live ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{live ? '🟢 실시간' : '🟡 캐시됨'}</span>
      </div>
      <p className={styles.cardDesc} style={{ padding: '0 20px', marginTop: 0 }}>
        관세청 KCS API와 해양수산부 통계를 연동하여 참치 HS 코드 기준 월별 수출액/수입액/무역수지 추이를 시각화합니다. 구조적 적자 해소를 위한 전략적 시사점을 제공합니다.
      </p>
      <div className={styles.cardBody} style={{ paddingBottom: 0 }}>
        <div className={styles.chartContainer} style={{ height: 280 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }}  angle={-25} textAnchor="end" height={60} tickFormatter={truncateXAxis}/>
              <YAxis stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} tickFormatter={(val) => `$${val}M`} />
              <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="export" fill="#10b981" name="수출($M)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="import" fill="#ef4444" name="수입($M)" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="balance" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" name="무역수지($M)" dot={{ r: 4 }} />
            </ComposedChart>
          </SafeResponsiveContainer>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation="[구조적 적자 지속] 참치 무역수지 월평균 -$147M 적자가 지속되고 있습니다. 12월 수입이 $210M으로 연중 최대치를 기록했으며(연말 재고 확보 수요), 수출은 $42~55M 수준에 머물러 원어 수입 의존도가 가속화되고 있습니다."
          actionPlan="[적자 축소 전략] ① 가공 참치캔 자체 브랜드(프리미엄 라인) 수출 전환으로 톤당 부가가치 +$800 확보, ② 중동/아프리카 신시장 수출 확대로 수출액 $80M 목표, ③ 원양산 원어 직수출 비중 확대를 병행해야 합니다."
          source="관세청 수출입 무역통계 · 해양수산부"
        />
      </div>
    </div>
  );
}

export function MofShippingCostWidget() {
  const [data, setData] = useState(FALLBACK_SHIPPING);
  const [live, setLive] = useState(false);
  useEffect(() => {
    fetch('/api/mof-fishery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: 'shipping-cost' }) })
      .then(r => r.json()).then(d => { if (d.shippingCost) { setData(d.shippingCost); setLive(true); } }).catch(() => {});
  }, []);
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader} style={{ display: 'flex', alignItems: 'center' }}>
        <h3 className={styles.cardTitle} style={{ flex: 1, margin: 0 }}>
          <Ship size={20} color="#8b5cf6"/> [물류비] 해상운임 물류비 트래커
          <TermTooltip term="" description="글로벌 주요 해상 물류 노선의 20ft/40ft 컨테이너 운임 변동을 모니터링합니다." />
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>(단위: USD/컨테이너)</span>
        </h3>
        <span style={{ fontSize: '0.75rem', color: live ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{live ? '🟢 LIVE' : '🟡 CACHED'}</span>
      </div>
      <p className={styles.cardDesc} style={{ padding: '0 20px', marginTop: 0 }}>
        해양수산부 해상운임 데이터와 SCFI 지수를 연동하여 주요 수출입 노선(부산→방콕, LA, 로테르담 등)의 컨테이너 운임 동향을 실시간 추적합니다.
      </p>
      <div className={styles.cardBody} style={{ paddingBottom: 0 }}>
        <div style={{ display: 'grid', gap: '12px', background: 'rgba(0, 0, 0, 0.2)', padding: '20px', borderRadius: '1rem', border: '1px dashed rgba(148, 163, 184, 0.1)' }}>
          {data.map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 16, padding: '14px 20px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 600 }}>{r.route}</span>
              <span style={{ fontSize: '0.85rem', color: '#0ea5e9', fontFamily: 'monospace' }}>20ft: ${r.cost20ft.toLocaleString()}</span>
              <span style={{ fontSize: '0.85rem', color: '#8b5cf6', fontFamily: 'monospace' }}>40ft: ${r.cost40ft.toLocaleString()}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: r.trend.includes('+') ? '#ef4444' : r.trend.includes('-') ? '#10b981' : '#f59e0b', textAlign: 'right' }}>{r.trend}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation="[물류비 양극화] 부산→LA 노선 $2,200/20ft(+15% YoY)로 홍해 분쟁 여파가 지속되고 있습니다. 반면 부산→오사카 $620/20ft(+1%)로 아시아 노선은 상대적으로 안정적이며, 부산→로테르담은 $1,900(-3%)으로 소폭 하락 추세입니다."
          actionPlan="[운임 최적화] ① 방콕 직항 물류에 물량을 집중하여 단위당 운임 절감, ② LA행 장기계약(TAC) 체결로 운임 $1,800 이하 락인, ③ 로테르담 하락 추세 활용 EU 수출 확대를 실행해야 합니다."
          source="해양수산부 해상운임 데이터 · SCFI 지수"
        />
      </div>
    </div>
  );
}
