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
        situation: '나우루의 대만→중국 외교 전환(2024.01)으로 대만 선단의 PNA 입어권이 급격히 축소. 중국은 현지 가공 투자 대신 본토 선전·광동 메가 캐너리에 집중 투입, ATQ 무관세를 무기화해 EU 프리쿡트 로인 시장에서 에콰도르(EUMOFA 2024 기준 EU 참치 수입 29% volume / 48% value)를 빠르게 대체.',
        actionPlan: '에콰도르 가공 자산의 밸류에이션 재산정 필요. 중국 메가 캐너리 본격 가동(2027~) 시 에콰도르향 투자 IRR이 3~5%p 하락 가능. 대안으로 PNG·솔로몬 제도의 EU-RoO 특혜 가공 거점을 선제 확보.',
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
        situation: 'WCPO 공급 부족분의 최후 보루인 IO 선단이 MGO $2,100/t 폭등과 어획 급감으로 자체 붕괴 직전. 프랑스 Sapmer €18.3M 순손실, 복수 선단이 조업 중단 검토 중. 태국의 IO 긴급 수입은 Q1 2026 +106% YoY 급증.',
        actionPlan: '인도양 공급 붕괴는 \'블랙스완\'이 아닌 \'그레이 코뿔소\'. 6개월 선물 계약 체결로 매입원가 $1,800/t 이하 락인. 서아프리카(가나 Tema 허브) 대체 소싱 파이프라인을 가동해 IO 의존도(Exposure) 30% 이하로 분산.',
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
        situation: 'EU -18℃ 냉동 규제는 실제 식중독 사례가 미미함에도 시행된 경제적 무기. €200M 시장 사기 차단 + -18℃ 설비 미보유 제3국 선단(글로벌 40%)의 EU 시장 접근 원천 차단. 스페인·프랑스 선단은 이미 완비.',
        actionPlan: 'EU -18℃ 규제는 위생이 아닌 경제 무기. 규정 충족 선단(스페인 Balfegó, 프랑스 CFTO 등) 지분을 선제 확보해 마진 프리미엄 독점. 비준수 선단의 EU 퇴출로 발생하는 공급 공백이 2027년까지 톤당 €300~500의 구조적 프리미엄을 창출.',
        source: 'EU 집행위(EC) 규정 · OPAGAC(유럽 참치선주협회) 동향 (2024)',
      }}
    />
  );
}
