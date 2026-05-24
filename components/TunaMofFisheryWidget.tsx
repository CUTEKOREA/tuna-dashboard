/**
 * MOF Fishery 3개 위젯 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 181줄 → After 140줄 (-23%)
 */

'use client';
import React, { useState, useEffect } from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Line, Legend, ComposedChart } from 'recharts';
import { Ship, Globe, Building2 } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

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
      .then((r) => r.json()).then((d) => { if (d.fishMarket) { setData(d.fishMarket); setLive(true); } }).catch(() => {});
  }, []);

  return (
    <WidgetCard
      title="냉동 눈다랑어(Bigeye) 위탁판매 현황 (2026)"
      icon={Building2}
      iconColor="#0ea5e9"
      pillar="S3"
      cardDesc="해양수산부 수산정보포털(FIS) API에서 국내 5대 위판장 냉동 눈다랑어 위탁판매 데이터를 수집해 시장별 거래량·평균 단가 비교"
      unit="(단위: MT / ₩/kg)"
      telemetry={{ status: live ? 'LIVE' : 'STATIC', syncDate: live ? 'Real-time' : '2026년 기준' }}
      chartHeight={280}
      chart={
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="market" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} />
          <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
          <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} tickFormatter={(v) => `₩${v.toLocaleString()}`} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
          <Legend />
          <Bar yAxisId="left" dataKey="volume" fill="url(#a11y-stripe-h)" color="#0ea5e9" name="거래량(MT)" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="avgPrice" stroke="#f59e0b" strokeWidth={3} name="평균 단가(₩/kg)" dot={{ r: 4 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: '2026 1분기 기준 국내 냉동 눈다랑어 물량의 43%가 부산공동어시장(12,450MT)에 집중되며 물류 병목 발생. 반면 제주 한림은 거래량은 적으나(3,200MT) 선도 프리미엄이 반영되어 전국 최고가 ₩9,100/kg을 기록하며 하이엔드 횟감 시장 주도.',
        actionPlan: '부산에 집중된 범용 물량은 B2B 가공용 고정 단가 계약으로 가격 변동 헷지. 제주 한림 위판장의 고단가 프리미엄 눈다랑어는 일본 수출 + 국내 오마카세 직거래 채널로 전량 스위칭하여 마진 극대화.',
        source: '해양수산부 수산정보포털(FIS) 위판장 위탁판매 데이터 (2026)',
      }}
    />
  );
}

export function MofTradeBalanceWidget() {
  const [data, setData] = useState(FALLBACK_TRADE);
  const [live, setLive] = useState(false);
  useEffect(() => {
    fetch('/api/mof-fishery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: 'trade-balance' }) })
      .then((r) => r.json()).then((d) => { if (d.tradeBalance) { setData(d.tradeBalance); setLive(true); } }).catch(() => {});
  }, []);

  return (
    <WidgetCard
      title="참치 수출입 무역수지 추이"
      icon={Globe}
      iconColor="#10b981"
      pillar="S3"
      cardDesc="관세청 KCS API + 해양수산부 통계 연동. 참치 HS 코드 기준 월별 수출액·수입액·무역수지 추이 — 구조적 적자 해소 전략 시사점"
      unit="(단위: USD Million)"
      telemetry={{ status: live ? 'LIVE' : 'STATIC', syncDate: live ? 'Real-time' : '2024년 기준' }}
      chartHeight={280}
      chart={
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} />
          <YAxis stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} tickFormatter={(v) => `$${v}M`} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="export" fill="url(#a11y-stripe-h)" color="#10b981" name="수출($M)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="import" fill="url(#a11y-diag)" color="#ef4444" name="수입($M)" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="balance" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" name="무역수지($M)" dot={{ r: 4 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: '참치 무역수지 월평균 -$147M 적자 지속. 12월 수입 $210M으로 연중 최대(연말 재고 확보), 수출은 $42~55M 수준으로 원어 수입 의존도 가속.',
        actionPlan: '① 가공 참치캔 자체 브랜드(프리미엄 라인) 수출 전환으로 톤당 부가가치 +$800. ② 중동·아프리카 신시장 수출 확대로 수출액 $80M 목표. ③ 원양산 원어 직수출 비중 확대 병행.',
        source: '관세청 수출입 무역통계 · 해양수산부',
      }}
    />
  );
}

export function MofShippingCostWidget() {
  const [data, setData] = useState(FALLBACK_SHIPPING);
  const [live, setLive] = useState(false);
  useEffect(() => {
    fetch('/api/mof-fishery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: 'shipping-cost' }) })
      .then((r) => r.json()).then((d) => { if (d.shippingCost) { setData(d.shippingCost); setLive(true); } }).catch(() => {});
  }, []);

  return (
    <WidgetCard
      title="해상운임 물류비 트래커"
      icon={Ship}
      iconColor="#8b5cf6"
      pillar="S3"
      cardDesc="KMI 해운지수 + 해운조합 컨테이너 운임으로 주요 수출입 노선(부산→방콕·LA·로테르담 등)의 20ft/40ft 운임 동향 추적"
      unit="(단위: USD/컨테이너)"
      telemetry={{ status: live ? 'LIVE' : 'STATIC', syncDate: live ? 'Real-time' : '2026년 기준' }}
      customBody={
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
      }
      takeaway={{
        situation: '부산→LA 노선 $2,200/20ft(+15% YoY)로 홍해 분쟁 여파 지속. 부산→오사카 $620/20ft(+1%)로 아시아 노선은 상대적으로 안정. 부산→로테르담 $1,900(-3%)으로 소폭 하락 추세.',
        actionPlan: '① 방콕 직항 물류에 물량 집중하여 단위당 운임 절감. ② LA행 장기계약(TAC) 체결로 운임 $1,800 이하 락인. ③ 로테르담 하락 추세를 활용해 EU 수출 확대.',
        source: 'KMI 해운지수 부산항 · 해운조합 컨테이너 운임 (SCFI는 상하이 출발이라 부산 출발 운임은 KMI/KOBC가 정확)',
      }}
    />
  );
}
