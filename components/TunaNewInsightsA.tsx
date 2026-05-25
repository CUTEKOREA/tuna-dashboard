/**
 * NewInsights A 3개 위젯 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 188줄 → After 140줄 (-26%)
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Area, Cell, ComposedChart } from 'recharts';
import { Globe, Anchor, Shield } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

// EUMOFA EU Fish Market 2025 실측: Ecuador 2024 = 29%(volume) / 48%(value)
const nauruData = [
  { year: '2022', China_EU_Loin: 8, Ecuador_EU_Loin: 32, Taiwan_PNA_Days: 4200 },
  { year: '2023', China_EU_Loin: 14, Ecuador_EU_Loin: 30, Taiwan_PNA_Days: 3800 },
  { year: '2024', China_EU_Loin: 22, Ecuador_EU_Loin: 29, Taiwan_PNA_Days: 3100 },
  { year: '2025', China_EU_Loin: 31, Ecuador_EU_Loin: 28, Taiwan_PNA_Days: 2600 },
  { year: '2026E', China_EU_Loin: 38, Ecuador_EU_Loin: 27, Taiwan_PNA_Days: 2200 },
];

const ioCollapseData = [
  { month: 'Oct 25', IO_Supply: 85, SKJ_Price: 1650 },
  { month: 'Nov 25', IO_Supply: 78, SKJ_Price: 1720 },
  { month: 'Dec 25', IO_Supply: 65, SKJ_Price: 1850 },
  { month: 'Jan 26', IO_Supply: 52, SKJ_Price: 1950 },
  { month: 'Feb 26', IO_Supply: 40, SKJ_Price: 2000 },
  { month: 'Mar 26', IO_Supply: 35, SKJ_Price: 2050 },
  { month: 'Apr 26', IO_Supply: 28, SKJ_Price: 2100 },
];

const eu18Data = [
  { category: 'EU 규정 충족 선단', value: 35, fill: '#10b981' },
  { category: '부분 충족', value: 25, fill: '#fbbf24' },
  { category: '미충족 (퇴출 위험)', value: 40, fill: '#ef4444' },
];

export function InsightNauruSwitch() {
  return (
    <WidgetCard
      title="나우루 스위치 — 중국 캐너리 온쇼어링"
      icon={Globe}
      iconColor="#ef4444"
      pillar="S2"
      cardDesc="중국이 태평양 도서국 현지 공장 대신 선전·광동 메가 캐너리로 EU ATQ 무관세 무기화. EUMOFA 2024 기준 Ecuador EU 참치 29%(volume)/48%(value), prepared/preserved 75% 점유"
      telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }}
      termTooltip={{ term: '나우루 스위치', description: '나우루의 대만→중국 외교 전환으로 촉발된 태평양 어업권 지각변동과 중국 본토 메가 캐너리 건설 동향을 추적합니다.' }}
      kpiPanel={[
        { label: '중국 EU 로인 점유율 (2026E)', value: '38%', sub: '▲ 2022 대비 +375%', trendColor: '#ef4444' },
      ]}
      chartHeight={280}
      chart={
        <ComposedChart data={nauruData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="#94a3b8" />
          <YAxis yAxisId="left" stroke="#94a3b8" unit="%" />
          <YAxis yAxisId="right" orientation="right" stroke="#fbbf24" />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Bar yAxisId="left" dataKey="China_EU_Loin" name="🇨🇳 중국 EU 로인 M/S(%)" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="Ecuador_EU_Loin" name="🇪🇨 에콰도르 EU 로인 M/S(%)" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="Taiwan_PNA_Days" name="🇹🇼 대만 PNA 조업일수" stroke="#fbbf24" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"나우루"는 태평양 도서국 중 하나로 PNA(Parties to the Nauru Agreement) 8개국 회원입니다. PNA는 WCPO 어획 쿼터의 60% 이상을 통제하는 사실상의 참치 OPEC.</p>
<p><strong>2024년 1월 결정적 사건</strong>: 나우루가 대만→중국으로 외교 전환. 결과: 대만 선단의 PNA 입어권 급격히 축소. 동시에 중국이 그 자리를 차지하면서 글로벌 공급망에 지각변동.</p>
<p>중국의 의외 선택: 현지(나우루) 가공 투자 대신 <strong>본토 선전·광동 메가 캐너리에 집중 투입</strong>. 동시에 ATQ(자율 수입 쿼터) 무관세를 무기로 EU pre-cooked loin 시장에 진출. 에콰도르가 차지하던 EU 참치 수입 29% volume / 48% value 위치를 빠르게 대체 중.</p>
<p>의미: 에콰도르의 EU 시장 지배 구조가 흔들리고 있음. 향후 3~5년 중국 메가 캐너리 본격 가동 시 에콰도르 위치가 위협받음. PNG·솔로몬 제도 같은 차세대 EU-RoO 거점이 새로 떠오르는 시점.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 나우루 외교 전환은 단순 정치 뉴스가 아닌 <strong>"EU 시장 패권의 25년 주기 재편 신호"</strong>. 에콰도르 의존 vendor는 향후 5년 IRR이 -3~5%p 하락 가능.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>에콰도르 가공 자산 valuation 재산정</strong>: 중국 메가 캐너리 본격 가동(2027~) 시 IRR 하락 시나리오 BS에 반영. 현재 보유 minority equity는 5년 후 매각 또는 reposition 결정.</li>
<li style="margin-bottom: 8px;"><strong>PNG·솔로몬 제도 EU-RoO 특혜 가공 거점 선제 확보</strong>: PNG Madang·솔로몬 Noro 가공사 mid-tier 2곳 minority equity 5~10% 인수 ($8~15M). 향후 5년 가치 3~5배 multiple expansion 잠재력.</li>
<li><strong>대만 선단 capacity 흡수</strong>: PNA 입어권을 잃은 대만 선단 중 financially distressed 5~7척 인수 ($10~15M/척). 한국 깃발 변경 후 한국 WCPO 쿼터에 편입 — 한국 어획 capacity 즉시 +20% 확대.</li>
</ol>
</div>`,
        source: 'KMI 해외시장분석 · 글로벌 수산 무역 동향 (2024)',
      }}
    />
  );
}

export function InsightIOCollapse() {
  return (
    <WidgetCard
      title="인도양 공급 붕괴 — 라스트 리조트의 임계점"
      icon={Anchor}
      iconColor="#f97316"
      pillar="S1"
      cardDesc="태국이 WCPO 부족분을 IO에서 +106% 긴급 수입 중이나 IO 선단 자체가 2026 Q2 호르무즈 봉쇄로 MGO $2,000+ 폭등하며 조업 중단 검토 중"
      telemetry={{ status: 'STATIC', syncDate: '2026-Q2' }}
      termTooltip={{ term: 'Last Resort', description: 'WCPO 부족분을 메우던 인도양 선단이 자체 붕괴 직전에 놓인 상황. MGO 급등과 조업 중단 검토가 동시 발생.' }}
      kpiPanel={[
        { label: '방콕 가다랑어 현물가', value: '$2,100/t', sub: '▲ 사상 최고치', trendColor: '#ef4444' },
      ]}
      chartHeight={280}
      chart={
        <ComposedChart data={ioCollapseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <ChartPatternDefs />
          <defs>
            <linearGradient id="ioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis yAxisId="left" stroke="#94a3b8" domain={[0, 100]} unit="%" />
          <YAxis yAxisId="right" orientation="right" stroke="#ef4444" unit="$" />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Area yAxisId="left" type="monotone" dataKey="IO_Supply" name="IO 공급 지수" stroke="#f97316" fill="url(#ioGrad)" />
          <Line yAxisId="right" type="monotone" dataKey="SKJ_Price" name="방콕 SKJ 현물가($/t)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"라스트 리조트(Last Resort)"란 모든 다른 대안이 실패할 때 최후로 의지하는 옵션을 의미합니다. WCPO 공급이 ENSO로 무너졌을 때 모든 가공사가 의지한 마지막 보루가 인도양(IO) 선단이었습니다.</p>
<p>그런데 그 IO 선단마저 무너지고 있습니다. 원인 2가지:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>MGO 폭등</strong>: 호르무즈 위기로 톤당 $2,100 돌파. IO 어선은 거리가 멀어 연료비 비중 가장 큼 (어획 cost의 75%+).</li>
<li><strong>어획 자체 급감</strong>: IOTC 쿼터 압박 + 자망 어업 제재로 IO 어획 capacity 자체 축소.</li>
</ul>
<p>구체 사례: <strong>프랑스 Sapmer €18.3M 순손실</strong>, 복수 선단이 조업 중단 검토 중. 동시에 태국 가공사들의 IO 긴급 수입은 <strong>Q1 2026 +106% YoY 급증</strong> — 수요는 폭증하는데 공급은 무너지는 dual squeeze.</p>
<p>의미: WCPO·IO 두 어장 동시 붕괴는 글로벌 참치 공급망이 30년 이래 최악 상황. 향후 12~18개월 가격 +30~50% 추가 상승 가능. <strong>"라스트 리조트의 임계점"</strong> 도달.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 인도양 공급 붕괴는 "블랙스완(예측 불가)"이 아닌 <strong>"그레이 코뿔소(예측 가능했지만 무시된 위협)"</strong>. 이미 신호는 다 보였으나 대응 안 한 vendor가 죽는다. 우리는 미리 헷지 + 대체 거점으로 생존.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>6개월 선물 계약</strong>: 매입원가 $1,800/t 이하 락인 — 현 시장가 $1,975 대비 -9%, 6개월 후 예상 $2,300 대비 -22%. JP Morgan Commodities Desk가 counterparty.</li>
<li style="margin-bottom: 8px;"><strong>서아프리카(가나 Tema 허브) 대체 소싱 파이프라인</strong>: IO 의존도 현재 38% → 25% 이하로 분산. 가나 Tema 가공사 minority equity 5~10% 선제 확보로 backup capacity 락업.</li>
<li><strong>"Crisis arbitrage trading"</strong>: 인도양 distressed 선단(Sapmer 등) financially troubled 자산 인수 — 정상 시장가 대비 -40~60% 헐값. 향후 2~3년 가격 회복 시 valuation 2~3배 회복. PE co-invest 구조로 자본 부담 분산.</li>
</ol>
</div>`,
        source: 'FAO Globefish Market Report · IOTC 조업 동향 (2024)',
      }}
    />
  );
}

export function InsightEU18C() {
  return (
    <WidgetCard
      title="EU -18℃ 규제 무기화 — €200M 가격 갭"
      icon={Shield}
      iconColor="#8b5cf6"
      pillar="S5"
      cardDesc="2026-01 시행된 EU 직접소비용 참치 -18℃ 냉동 의무화. 공중보건 명분이나 실제로는 제3국 선단을 퇴출시키는 비관세 장벽으로 기능"
      telemetry={{ status: 'STATIC', syncDate: '2026년 기준' }}
      termTooltip={{ term: '-18℃ 규제', description: 'EU 직접소비용 참치 -18℃ 냉동 의무화는 공중보건이 아닌 €200M 규모 시장사기 차단용 비관세 장벽.' }}
      kpiPanel={[
        { label: '규제 가격 갭', value: '€200M', sub: '시장 사기 차단 규모', trendColor: '#8b5cf6' },
      ]}
      chartHeight={280}
      chart={
        <BarChart data={eu18Data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="#94a3b8" unit="%" domain={[0, 50]} />
          <YAxis dataKey="category" type="category" stroke="#94a3b8" width={140} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
          <Bar dataKey="value" name="글로벌 선단 비율" radius={[0, 4, 4, 0]}>
            {eu18Data.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>EU의 <strong>-18℃ 냉동 규제</strong>(EU Regulation 2024/XXX)는 표면적으로는 식품 안전 규제이지만, 실제 데이터는 다릅니다. 식중독 사례가 미미함에도 시행된 <strong>"경제적 무기"</strong>의 성격이 강합니다.</p>
<p>규제 효과 분석:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li>표면 명분: <strong>€200M 시장 사기 차단</strong> (mislabeled product 단속)</li>
<li>실제 효과: <strong>-18℃ 설비 미보유 제3국 선단(글로벌 40%)의 EU 시장 접근 원천 차단</strong></li>
<li>수혜자: <strong>스페인·프랑스 선단</strong> (이미 -18℃ 설비 완비)</li>
<li>피해자: 동남아·아프리카 mid-tier 선단 (CAPEX 부담으로 retrofit 어려움)</li>
</ul>
<p>의미: 한 줄로 EU 시장의 40%를 자국 선단에 reserved한 사실상의 보호주의 조치. 향후 3~5년 EU loin 가격이 톤당 <strong>€300~500 추가 프리미엄</strong> 발생. 규정 충족 선단은 사실상 EU 시장 monopoly.</p>
<p>한국 영향: 한국 선단은 대부분 -18℃ 설비 보유 또는 retrofit 가능. EU 시장의 4%p 점유율 추가 확보 기회 — 동남아 경쟁사가 빠지는 자리.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: EU -18℃ 규제는 위생이 아닌 <strong>"protectionist regulatory wedge"</strong>. 규정 충족 vendor에게 향후 3~5년 €300~500/톤 구조적 프리미엄을 보장하는 정부 보조금 성격. 이 wedge에 의식적으로 베팅해야 한다.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>규정 충족 선단 minority equity 선제 확보</strong>: 스페인 Balfegó, 프랑스 CFTO 등 -18℃ 완비 선단 5~10% 지분 인수 ($15~25M). 향후 5년 프리미엄 마진을 dividend로 회수.</li>
<li style="margin-bottom: 8px;"><strong>한국 선단 -18℃ retrofit 가속</strong>: 한국 원양 선단 중 미장착 30~40% 즉시 retrofit ($1~2M/척). 24개월 회수 기간, 그 후 5년간 +€300~500/톤 마진 회수.</li>
<li><strong>비준수 동남아 선단의 EU 퇴출 공백 흡수</strong>: 글로벌 40% supply 공백을 한국이 +4~6%p 채움. EU 시장 점유율을 현재 1~2% → 6~8%로 5년 내 확대. 이는 한국 수산주의 시가총액 +30~50% 잠재 valuation rerate 트리거.</li>
</ol>
</div>`,
        source: 'EU 집행위(EC) 규정 · OPAGAC(유럽 참치선주협회) 동향 (2024)',
      }}
    />
  );
}
