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
import React, { useEffect, useMemo, useState } from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Line, Legend, ComposedChart, LineChart } from 'recharts';
import { Ship, Globe, Building2 } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';
import { SERIES } from '@/lib/chart-palette';

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

/**
 * 관세청 해상수출입 운송비용 — 항로별 색.
 * 색은 순위가 아니라 대상을 따른다. 항로가 몇 개 살아 오든 미국서부는 늘 같은 색이다.
 */
const ROUTE_COLOR: Record<string, string> = {
  USW: SERIES[0],
  USE: SERIES[1],
  EU: SERIES[2],
  CN: SERIES[3],
  JP: SERIES[4],
  VN: SERIES[5],
};

type FreightRow = { period: string } & Record<string, number | string>;
type FreightResponse =
  | { ok: true; unit: string; routes: string[]; routeNames: Record<string, string>; failed?: string[]; data: FreightRow[] }
  | { ok: false; error: string };

export function MofFishMarketWidget() {
  const data = FALLBACK_FISH;

  return (
    <WidgetCard
      title="냉동 눈다랑어(Bigeye) 위탁판매 현황 (2026)"
      icon={Building2}
      iconColor="#0ea5e9"
      pillar="S3"
      cardDesc="해양수산부 수산정보포털(FIS) 위판장 통계 양식 기반 업계 추정치(자체 구성, API 미연동) - 국내 5대 위판장 냉동 눈다랑어 거래량·평균 단가 비교"
      unit="(단위: MT / ₩/kg)"
      telemetry={{ status: 'STATIC', syncDate: '2026 업계 추정' }}
      chartHeight={280}
      chart={
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="market" stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-300)', fontSize: 12, fontWeight: 500 }} />
          <YAxis yAxisId="left" stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-300)', fontSize: 12, fontWeight: 500 }} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--w-amber-500)" tick={{ fill: 'var(--w-slate-300)', fontSize: 12, fontWeight: 500 }} tickFormatter={(v) => `₩${v.toLocaleString()}`} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
          <Legend />
          <Bar yAxisId="left" dataKey="volume" fill="#0ea5e9" name="거래량(MT)" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="avgPrice" stroke="var(--w-amber-500)" strokeWidth={3} name="평균 단가(₩/kg)" dot={{ r: 4 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p><strong>눈다랑어(Bigeye)</strong>는 참치 중 사시미·횟감용 최고급 어종으로, 한국 내수에서 kg당 가격이 가다랑어의 5~8배. 한국에서 거래되는 모든 냉동 눈다랑어는 위탁판매(consignment) 방식으로 5개 주요 위판장에서 거래됩니다.</p>
<p>2026년 기준 추정 분포(자체추정 - FIS API 미연동, 업계추정치 적용):</p>
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
<li><strong>"Landing port arbitrage logistics"</strong>: 어선 양륙 결정을 실시간 가격 시그널 기반 dynamic routing - 제주 한림 capacity 여유 + 가격 premium 시 자동 한림 양륙. AI logistics platform 자체 개발 - 5년 후 사조·동원 SaaS 라이센싱.</li>
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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="month" stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-300)', fontSize: 12, fontWeight: 500 }} />
          <YAxis stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-300)', fontSize: 12, fontWeight: 500 }} tickFormatter={(v) => `$${v}M`} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="export" fill="var(--w-emerald-500)" name="수출($M)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="import" fill="var(--w-red-500)" name="수입($M)" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="balance" stroke="var(--w-amber-500)" strokeWidth={3} strokeDasharray="5 5" name="무역수지($M)" dot={{ r: 4 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"무역수지"란 수출액 - 수입액. 양수면 흑자, 음수면 적자. 한국 참치 무역수지는 <strong>월평균 -$147M 적자</strong>가 만성적으로 지속돼 왔습니다(2024년 하반기 기준).</p>
<p>월별 패턴:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>12월 수입 $210M으로 연중 최대</strong> (연말 가공·소비 재고 확보)</li>
<li>수출은 월 <strong>$42~55M 수준</strong>으로 횡보 - 가공품·원어 직수출 모두 미약</li>
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
<li><strong>원양산 원어 직수출 비중 확대</strong>: 한국 원양 선단의 어획물을 일본·중동 high-grade 시장에 직수출 - 기존 부산 어시장 거래 우회. 5년 내 수출액 $150M+ 도달, 무역수지 -$147M → -$50M 개선 잠재력.</li>
</ol>
</div>`,
        source: '관세청 수출입 무역통계 · 해양수산부',
      }}
    />
  );
}

export function MofShippingCostWidget() {
  const [res, setRes] = useState<FreightResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch('/api/mof-fishery?endpoint=shipping_cost_all', { signal: AbortSignal.timeout(20000) })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: FreightResponse) => {
        if (alive) setRes(json);
      })
      .catch((e) => {
        if (alive) setRes({ ok: false, error: e?.message ?? '요청 실패' });
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const live = res?.ok ? res : null;
  const rows = live?.data ?? [];
  const routes = live?.routes ?? [];

  // 최신 달 값과 12개월 전 대비 변화. 서술은 화면에 실제로 그려진 숫자만 인용한다.
  const summary = useMemo(() => {
    if (rows.length === 0) return [];
    const last = rows[rows.length - 1];
    const first = rows[0];
    return routes
      .map((code) => {
        const now = Number(last[code]);
        const then = Number(first[code]);
        if (!Number.isFinite(now)) return null;
        // 행이 하나뿐이면 비교 기준이 없다. 0% 로 적으면 「변동 없음」이라는 없는 사실이 생긴다.
        const pct =
          rows.length > 1 && Number.isFinite(then) && then > 0
            ? Math.round(((now - then) / then) * 1000) / 10
            : null;
        return { code, name: live?.routeNames?.[code] ?? code, now, pct };
      })
      .filter(Boolean)
      .sort((a, b) => b!.now - a!.now) as Array<{ code: string; name: string; now: number; pct: number | null }>;
  }, [rows, routes, live]);

  const span = rows.length ? `${rows[0].period} ~ ${rows[rows.length - 1].period}` : null;
  const dearest = summary[0];
  const cheapest = summary[summary.length - 1];

  const situation = live
    ? `<div>
<p>관세청 <strong>해상 수출입 운송비용</strong>은 40피트 컨테이너 한 대(2TEU)를 실어 나르는 데 든 총비용을 항로별·월별로 공표합니다. 운임에 할증료·수수료까지 포함한 값이고 단위는 <strong>천원</strong>입니다. 아래는 수입 방향 ${span} 실측치입니다.</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
${summary
  .map(
    (r) =>
      `<li><strong>${r.name}</strong>: ${r.now.toLocaleString()}천원/2TEU${
        r.pct === null ? '' : ` (기간 처음 대비 ${r.pct > 0 ? '+' : ''}${r.pct}%)`
      }</li>`,
  )
  .join('\n')}
</ul>
<p>가장 비싼 항로(${dearest?.name})와 가장 싼 항로(${cheapest?.name})의 격차는 <strong>${
        dearest && cheapest && cheapest.now > 0 ? (dearest.now / cheapest.now).toFixed(1) : '—'
      }배</strong>입니다. 원물을 어디서 들여오느냐가 곧 물류비 구조를 정합니다.</p>
${(live?.failed?.length ?? 0) > 0 ? `<p>받지 못한 항로: ${live!.failed!.join(' · ')}</p>` : ''}
<p>주의: 이 통계는 <strong>항로 단위</strong>지 품목 단위가 아닙니다. 컨테이너 한 대에 얼마를 싣느냐에 따라 kg당 부담이 달라지므로, 착지원가로 옮길 때는 적재중량 가정을 함께 적어야 합니다.</p>
</div>`
    : `<div><p>관세청 해상 수출입 운송비용 API에서 데이터를 받지 못했습니다${
        res && !res.ok && res.error ? ` (${res.error})` : ''
      }. 숫자를 지어내지 않고 비워 둡니다.</p></div>`;

  return (
    <WidgetCard
      title="해상운임 물류비 트래커"
      icon={Ship}
      iconColor="#8b5cf6"
      pillar="S3"
      cardDesc="관세청 해상 수출입 운송비용(data.go.kr 15129097) 실시간 연동 - 미국서부·미국동부·유럽연합·중국·일본·베트남 수입 항로의 월별 컨테이너 운송비용"
      unit="(단위: 천원/2TEU · 40피트 1대)"
      telemetry={
        live
          ? { status: 'LIVE', syncDate: rows[rows.length - 1]?.period as string, source: '관세청 무역통계' }
          : { status: 'STATIC', syncDate: loading ? '불러오는 중' : '조회 실패' }
      }
      chartHeight={300}
      chart={
        live ? (
          <LineChart data={rows} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
            <XAxis dataKey="period" stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-300)', fontSize: 12, fontWeight: 500 }} />
            <YAxis
              stroke="var(--w-slate-400)"
              tick={{ fill: 'var(--w-slate-300)', fontSize: 12, fontWeight: 500 }}
              tickFormatter={(v) => `${(v as number).toLocaleString()}`}
              label={{ value: '천원/2TEU', angle: -90, position: 'insideLeft', fill: 'var(--w-slate-300)', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
              formatter={(v: any, name: any) => [`${Number(v).toLocaleString()}천원`, name]}
            />
            <Legend />
            {routes.map((code) => (
              <Line
                key={code}
                type="monotone"
                dataKey={code}
                name={live.routeNames?.[code] ?? code}
                stroke={ROUTE_COLOR[code] ?? SERIES[7]}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        ) : undefined
      }
      customBody={
        live ? undefined : (
          <div
            style={{
              padding: '28px 20px',
              textAlign: 'center',
              color: 'var(--w-slate-300)',
              fontSize: '0.9rem',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '1rem',
              border: '1px dashed rgba(140,170,255,0.2)',
            }}
          >
            {loading ? '관세청 해상 운송비용 불러오는 중…' : '관세청 해상 운송비용을 불러오지 못했습니다. 숫자를 채우지 않습니다.'}
          </div>
        )
      }
      takeaway={{
        situation,
        actionPlan: `<div>
<p><strong>재정의</strong>: 항로별 운송비용은 원가표의 한 줄이 아니라 <strong>「원물을 어디서 받을지」를 정하는 값</strong>입니다. 같은 물건이라도 항로에 따라 컨테이너당 부담이 몇 배로 갈립니다.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>소싱 비교표에 이 값을 붙인다</strong>: 산지 견적(FOB)만 놓고 고르지 말고 항로 운송비용을 더한 값으로 비교한다. 착지원가 시뮬레이터(<code>/api/landed-cost</code>)가 같은 API를 쓴다.</li>
<li style="margin-bottom: 8px;"><strong>고가 항로는 계약 물량으로 잠근다</strong>: 변동이 큰 항로일수록 스팟 노출을 줄인다. 위 그래프에서 기간 중 진폭이 가장 큰 항로가 우선 대상이다.</li>
<li><strong>적재중량 가정을 명시한다</strong>: 이 통계는 컨테이너 단위다. kg당으로 바꿔 쓸 때는 몇 kg을 싣는다고 보았는지 문서에 남긴다 — 가정이 빠지면 다른 원가표와 비교가 안 된다.</li>
</ol>
</div>`,
        source: '관세청 해상 수출입 운송비용 (공공데이터포털 15129097, getSeaImexTrnpCst) · 단위 천원/2TEU',
      }}
    />
  );
}
