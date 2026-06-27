/**
 * MOF Fishery 3개 위젯 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 181줄 → After 140줄 (-23%)
 *
 * 2026-06-11 정직화: /api/mof-fishery 연동은 구조적으로 사망 상태였음
 * (POST endpoint 명칭 'fish-market' 등이 라우트 키 'consignment_sales' 등과 불일치,
 *  응답 키 fishMarket/tradeBalance/shippingCost는 라우트가 반환한 적 없음 → live 분기 도달 불가).
 * 죽은 fetch 제거 + STATIC/실데이터 기준일로 정직 표기. 재연동 시 isLive 분기 복원할 것.
 */

'use client';
import React from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Line, Legend, ComposedChart } from 'recharts';
import { Ship, Globe, Building2 } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

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
  const data = FALLBACK_FISH;

  return (
    <WidgetCard
      title="냉동 눈다랑어(Bigeye) 위탁판매 현황 (2026)"
      icon={Building2}
      iconColor="#0ea5e9"
      pillar="S3"
      cardDesc="해양수산부 수산정보포털(FIS) 위판장 통계 양식 기반 업계 추정치(자체 구성, API 미연동) — 국내 5대 위판장 냉동 눈다랑어 거래량·평균 단가 비교"
      unit="(단위: MT / ₩/kg)"
      telemetry={{ status: 'STATIC', syncDate: '2026 업계 추정' }}
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
          <Bar yAxisId="left" dataKey="volume" fill="#0ea5e9" name="거래량(MT)" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="avgPrice" stroke="#f59e0b" strokeWidth={3} name="평균 단가(₩/kg)" dot={{ r: 4 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p><strong>눈다랑어(Bigeye)</strong>는 참치 중 사시미·횟감용 최고급 어종으로, 한국 내수에서 kg당 가격이 가다랑어의 5~8배. 한국에서 거래되는 모든 냉동 눈다랑어는 위탁판매(consignment) 방식으로 5개 주요 위판장에서 거래됩니다.</p>
<p>2026년 기준 추정 분포(자체추정 — FIS API 미연동, 업계추정치 적용):</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>부산공동어시장</strong>: 12,450 MT (43% 집중, 평균가 ₩8,200/kg)</li>
<li><strong>제주 한림</strong>: 3,200 MT (11%, 평균가 <strong>₩9,100/kg 전국 최고가</strong>)</li>
<li>통영·여수·속초 기타: 12,800 MT (46%, 평균가 ₩7,600~8,500/kg)</li>
</ul>
<p>핵심 패턴: 부산은 물량 많고 가공용 범용 단가, 제주 한림은 물량 적고 <strong>선도 프리미엄</strong>으로 약 +11% 추가 단가. 같은 어종도 양륙 위치에 따라 채널이 갈리고 가격이 갈립니다.</p>
<p>의미: 부산 집중은 물류 병목 + 범용 매대 가격 압박. 제주 한림은 한정 capacity로 일본·오마카세 채널 선호 위판장.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 위판장 채널은 단순 물류가 아닌 <strong>"가격 결정 채널 선택의 strategic optionality"</strong>. 같은 원물도 어느 위판장에 양륙하느냐로 ASP ±35% 차이.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>부산 범용 물량 B2B 가공용 고정 단가 계약</strong>: 동원·사조 가공 라인과 3~5년 fixed price supply, 가격 변동 완전 헷지.</li>
<li style="margin-bottom: 8px;"><strong>제주 한림 프리미엄 눈다랑어 100% 직거래 전환</strong>: 일본 도쿄 토요스 + 한국 오마카세(미쉐린 가야·정식당·강민철레스토랑) 직거래 채널. 중간 마진 200~400bp 회수.</li>
<li><strong>"Landing port arbitrage logistics"</strong>: 어선 양륙 결정을 실시간 가격 시그널 기반 dynamic routing — 제주 한림 capacity 여유 + 가격 premium 시 자동 한림 양륙. AI logistics platform 자체 개발 — 5년 후 사조·동원 SaaS 라이센싱.</li>
</ol>
</div>`,
        source: '해양수산부 수산정보포털(FIS) 위판장 통계 양식 기반 업계 추정치 (2026, 자체 구성)',
      }}
    />
  );
}

export function MofTradeBalanceWidget() {
  const data = FALLBACK_TRADE;

  return (
    <WidgetCard
      title="참치 수출입 무역수지 추이"
      icon={Globe}
      iconColor="#10b981"
      pillar="S3"
      cardDesc="관세청 수출입 무역통계·해양수산부 통계 기반 자체 구성(2024-07~12, API 미연동). 참치 HS 코드 기준 월별 수출액·수입액·무역수지 추이"
      unit="(단위: USD Million)"
      telemetry={{ status: 'STATIC', syncDate: '2024-12 기준' }}
      chartHeight={280}
      chart={
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} />
          <YAxis stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} tickFormatter={(v) => `$${v}M`} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="export" fill="#10b981" name="수출($M)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="import" fill="#ef4444" name="수입($M)" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="balance" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" name="무역수지($M)" dot={{ r: 4 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"무역수지"란 수출액 - 수입액. 양수면 흑자, 음수면 적자. 한국 참치 무역수지는 <strong>월평균 -$147M 적자</strong>가 만성적으로 지속돼 왔습니다(2024년 하반기 기준).</p>
<p>월별 패턴:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>12월 수입 $210M으로 연중 최대</strong> (연말 가공·소비 재고 확보)</li>
<li>수출은 월 <strong>$42~55M 수준</strong>으로 횡보 — 가공품·원어 직수출 모두 미약</li>
<li>적자 폭은 -$147M으로 연 약 -$1.8B (약 -2.4조원) 무역적자 누적</li>
</ul>
<p>왜 이런 구조? ① 한국 어획 capacity가 국내 소비량 충당 불가 (자급률 약 25%) ② 수출 측은 단순 원어 직수출에 머물며 가공·브랜드 부가가치 부재 ③ 통조림 수출은 글로벌 경쟁(태국·에콰도르)에서 가격 열위.</p>
<p>의미: 한국은 글로벌 참치 가치사슬에서 <strong>"수입소비국"</strong> 위치에 묶여 있음. 산업 부가가치를 자국 내 잡지 못하고 외국 가공사·브랜드에 넘기는 구조. 향후 5~10년 이 구조를 깨지 못하면 무역수지 추가 악화 + 자국 산업 위축 가속.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 무역수지 적자는 단순 통계가 아닌 <strong>"한국 참치 산업의 부가가치 누수 시그널"</strong>. 가공·브랜드·수출 3개 축에서 미국·EU·중동 시장 직접 진출만이 구조적 해결책.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>가공 참치캔 자체 브랜드(프리미엄 라인) 수출</strong>: 단순 OEM이 아닌 <strong>"K-Tuna Premium"</strong> brand로 미국 Whole Foods·일본 이세탄·중동 Carrefour 동시 launch. 톤당 부가가치 +$800.</li>
<li style="margin-bottom: 8px;"><strong>중동·아프리카 신시장 수출 확대</strong>: 두바이·리야드·라고스 신흥시장에 connected logistics network 구축. 수출액 현재 $50M → <strong>$80M 목표</strong> (3년 +60%).</li>
<li><strong>원양산 원어 직수출 비중 확대</strong>: 한국 원양 선단의 어획물을 일본·중동 high-grade 시장에 직수출 — 기존 부산 어시장 거래 우회. 5년 내 수출액 $150M+ 도달, 무역수지 -$147M → -$50M 개선 잠재력.</li>
</ol>
</div>`,
        source: '관세청 수출입 무역통계 · 해양수산부',
      }}
    />
  );
}

export function MofShippingCostWidget() {
  const data = FALLBACK_SHIPPING;

  return (
    <WidgetCard
      title="해상운임 물류비 트래커"
      icon={Ship}
      iconColor="#8b5cf6"
      pillar="S3"
      cardDesc="KMI 해운지수·해운조합 컨테이너 운임 참고 자체 추정치(2026 초, API 미연동) — 주요 수출입 노선(부산→방콕·LA·로테르담 등) 20ft/40ft 운임 비교"
      unit="(단위: USD/컨테이너)"
      telemetry={{ status: 'STATIC', syncDate: '2026 초 추정' }}
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
        situation: `<div>
<p>해상운임은 글로벌 수산 무역 cost의 8~15%를 차지하는 핵심 변수. 노선별 추이를 보면 향후 6~12개월 우리 채널 전략이 결정됩니다.</p>
<p>2026년 초 기준 노선별 운임 (20ft 컨테이너, 자체 추정):</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>부산→LA</strong>: <strong>$2,200 (+15% YoY)</strong> — 홍해 분쟁 여파로 지속 상승</li>
<li><strong>부산→오사카</strong>: $620 (+1%) — 아시아 노선 상대적 안정</li>
<li><strong>부산→로테르담</strong>: <strong>$1,900 (-3%)</strong> — 소폭 하락 추세</li>
</ul>
<p>패턴 해석:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li>북미 노선(LA·NY): 홍해·수에즈 우회로 운임 상승 — 미국 수출 가격 경쟁력 약화</li>
<li>아시아 노선(오사카·홍콩): 단거리 안정 — 일본·동남아 채널이 sweet spot</li>
<li>EU 노선(로테르담·함부르크): 운임 하락 추세 — EU 수출 확대 윈도우 열림</li>
</ul>
<p>의미: 단기 채널 우선순위가 미국 → EU + 일본 + 동남아로 자동 재배치 필요. 운임 시그널이 곧 마진 시그널.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 해상운임 추이는 단순 cost 변수가 아닌 <strong>"채널 우선순위 dynamic rebalancing signal"</strong>. 본사 trade desk가 분기마다 노선별 운임을 마진 매트릭스에 reflect.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>방콕 직항 물류 집중</strong>: 부산→방콕 노선에 물량 집중하여 단위당 운임 -15~20% 절감 (volume discount). 태국 가공 OEM 비중 확대와 시너지.</li>
<li style="margin-bottom: 8px;"><strong>LA행 장기계약(TAC) 체결</strong>: Maersk·MSC·CMA CGM 3사와 <strong>$1,800/20ft 이하 락인</strong>하는 5년 TAC. 현재 spot $2,200 대비 -18% 마진 확보.</li>
<li><strong>EU 수출 확대 윈도우 활용</strong>: 로테르담 운임 하락 추세를 활용해 EU 통조림·loin 수출 30% 확대. 동시에 EU 무관세 혜택(에콰도르 가공 거점 활용) 결합 시 통합 가격 경쟁력 +25%p 회수.</li>
</ol>
</div>`,
        source: 'KMI 해운지수 부산항 · 해운조합 컨테이너 운임 (SCFI는 상하이 출발이라 부산 출발 운임은 KMI/KOBC가 정확)',
      }}
    />
  );
}
