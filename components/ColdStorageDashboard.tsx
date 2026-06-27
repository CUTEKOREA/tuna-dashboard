"use client";

import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Anchor, DollarSign, Activity, AlertTriangle, ShieldCheck, Zap, Factory, Snowflake, ShieldAlert, BarChart2, Globe, TrendingUp
} from 'lucide-react';

import WidgetCard from './WidgetCard';
import { TelemetryBadge } from './TelemetryBadge';
import styles from './MackerelStrategy.module.css'; // 재사용
import { ChartPatternDefs } from './ChartPatterns';

// Number formatting only — unit attachment happens once in CustomTooltip
// (keyword-based unit synthesis caused double/false units, e.g. w03 12,120(10억원) shown as '12,120억원')
const formatNumber = (v: any): string | any => {
  if (Array.isArray(v)) {
    return v.map(val => formatNumber(val)).join(' ~ ');
  }
  if (typeof v !== 'number') return v;
  return v % 1 === 0 ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 3 });
};

const CustomTooltip = ({ active, payload, label, unit, unitMap }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry: any, index: any) => {
          // Per-series unit (unitMap) wins over widget-level unit; attach exactly once
          const u = unitMap && entry.dataKey in unitMap ? unitMap[entry.dataKey] : (unit || '');
          return (
            <div key={index} className={styles.tooltipValue}>
              <span style={{ color: entry.color }}>■ {entry.name}</span>
              <strong>{formatNumber(entry.value)}{u ? ` ${u}` : ''}</strong>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const WIDGET_ICONS: Record<string, any> = {
  w01: Activity, w02: Globe, w03: Factory, w04: Zap,
  w05: Globe, w06: ShieldAlert,
  w07: Zap, w08: ShieldCheck, w09: TrendingUp,
  n01: TrendingUp, n02: DollarSign, n03: Globe,
  k01: Snowflake, k02: BarChart2, k03: ShieldCheck, k04: ShieldAlert,
  k05: Zap, k06: Factory, k07: Activity, k08: Anchor,
  us01: Snowflake, us02: Factory, us03: ShieldCheck,
};

/* ─── 밸류체인 네비게이터 섹션 정의 ─── */
const SECTIONS = [
  { id: 's1', label: '입고·수급', icon: Activity, color: '#38bdf8', desc: '구역 수익성·기업 재무·베트남 시장 성장' },
  { id: 's2', label: '보관·가동률', icon: ShieldAlert, color: '#ef4444', desc: '냉동설비 무역수지·재고 담보인정비율' },
  { id: 's3', label: '물류·통관', icon: Globe, color: '#f59e0b', desc: '태국·베트남 운영비·쿨링 리스크' },
  { id: 's4', label: '수익성·투자', icon: TrendingUp, color: '#8b5cf6', desc: '빙축열·냉매규제·부동산 수익률' },
  { id: 's5', label: '품질과학', icon: Snowflake, color: '#06b6d4', desc: 'KFAS 논문 8편 선도·품질 실증' },
  { id: 'us', label: '미국 ULT', icon: Anchor, color: '#10b981', desc: '동·서부 -60°C 사시미급 보관 거점' },
];

export default function ColdStorageDashboard() {
  const [data, setData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('s1');

  useEffect(() => {
    const mockData = {
      kpis: {
        kpi1: { title: "일반 상온 창고 입주율", value: "88% ↘", desc: "공급 과잉 상태 직면 (Trap)", trend: "위험", icon: "TrendingDown" },
        kpi2: { title: "초저온 맞춤형(BTS) 점유율", value: "98% ↗", desc: "고수익 하이엔드 인프라 품귀", trend: "S급", icon: "TrendingUp" },
        kpi3: { title: "태국 Category II 인증자", value: "420명", desc: "첨단 자동화 고장 시 치명적 리스크", trend: "경고", icon: "AlertTriangle" },
        kpi4: { title: "태국 BOI 면세 조건 달성", value: "기술 이전", desc: "매년 감사 미달 시 세금 소급 추징", trend: "주의", icon: "ShieldAlert" },
        kpi5: { title: "IoT 실시간 무결성 인증", value: "LTV 극대화", desc: "은행 담보 70% 이상 초저금리 확보", trend: "기회", icon: "DollarSign" },
        kpi6: { title: "투 트랙(Bi-Node) 거점", value: "태국-베트남 연계", desc: "베트남(가공/수출) - 태국(RDC 허브)", trend: "전략", icon: "Globe" },
      },
      widgets: [
        {
          id: 'w01',
          title: '냉동창고 구역별 수익성 지수 및 입주율 전망',
          subtitle: '자체추정 — 구역별 수익성·입주율 시나리오 비교 (일반/냉장/냉동/BTS 4구역)',
          chartType: 'Composed',
          xKey: 'zone',
          bars: [{key: '수익성_지수', color: '#38bdf8'}],
          lines: [{key: '예상_입주율', color: 'var(--color-warning)', yAxisId: 'right'}],
          dualAxis: true,
          data: [{"zone":"일반 창고","수익성_지수":100,"예상_입주율":85},{"zone":"냉장 존","수익성_지수":180,"예상_입주율":90},{"zone":"냉동 존(-18°C)","수익성_지수":250,"예상_입주율":95},{"zone":"BTS 초저온","수익성_지수":450,"예상_입주율":98}],
          sit: <>일반 상온 창고(Dry/Ready-built)는 극단적 공급 과잉으로 2027년까지 입주율 85% 하락 및 레이스 투 더 바텀(Race-to-the-bottom)의 단가 경쟁 리스크에 직면. 반면, A급 맞춤형 초저온 인프라(BTS, -50°C 이하)는 수익성이 4배 이상 높으며 구조적 품귀 현상이 지속 중임.</>,
          strat: <>맹목적인 볼륨 확보 위주의 일반 상온 창고 투자는 전면 숏(Short) 포지션 구축. 향후 자본 배분은 메자닌 층을 활용한 수직적 공간 최적화(Vertical Optimization) 및 다양한 정밀 온도 구역(Multi-temp Zone)을 제공하는 하이엔드 냉동 인프라에 집중하여, 임대 프리미엄 및 장기 수익성을 창출할 것.</>,
          source: '업계추정 — 아세안 냉동창고 구역별 수익성 시나리오 (2026)',
          unit: '지수 / %',
          unitMap: { '수익성_지수': '', '예상_입주율': '%' }
        },
        {
          id: 'w02',
          title: 'HS 841869 산업용 냉동설비 무역수지 비교',
          subtitle: 'OEC BACI 2024 · 한국/태국/베트남 3국 수출입 비교',
          chartType: 'Bar',
          xKey: 'country',
          bars: [{key: '수출액', color: '#38bdf8'}, {key: '수입액', color: '#c026d3'}],
          data: [{"country":"대한민국","수출액":294,"수입액":146},{"country":"태국","수출액":120,"수입액":187},{"country":"베트남","수출액":45,"수입액":157}],
          sit: <>한국은 산업용 냉동 장비(HS 841869) 수출에서 흑자 기조를 유지 중이나, 인프라 확장이 급격한 베트남(-$112M)과 태국(-$67M)은 원천 기술 부재로 만성적 수입 적자(Trade Deficit) 상태에 놓여 있음. 이는 아세안 시장의 심각한 해외 기술 의존도를 시사함.</>,
          strat: <>한국산 선진 냉동 장비 벤더 풀과 당사의 인프라 운영 노하우를 결합한 패키지형(Turn-key) 조달 전략을 실행할 것. 단순 공간 임대업을 넘어선 고효율 콜드체인 설계 및 기술 지원을 통해, 로컬 경쟁사 대비 진입 장벽(Economic Moat)을 구축하고 B2B 점유율을 공격적으로 확대.</>,
          source: 'OEC 무역 통계 (HS 841869 데이터)',
          unit: '$M'
        },
        {
          id: 'w03',
          title: '국내 주요 콜드체인 기업 재무 현황 비교',
          subtitle: 'DART 2024 연결재무제표 · CJ대한통운/HMM/동방 3사',
          chartType: 'Bar',
          xKey: 'company',
          bars: [{key: '매출', color: '#38bdf8'}, {key: '영업이익', color: 'var(--color-success)'}],
          data: [{"company":"CJ대한통운","매출":12120,"영업이익":480},{"company":"HMM","매출":11700,"영업이익":580},{"company":"동방","매출":871,"영업이익":35},{"company":"한국초저온","매출":29,"영업이익":-31}],
          sit: <>국내 콜드체인 시장은 매수자 우위(Buyer\'s Market)의 극단적 오버서플라이 환경으로, LNG 냉열 등 핵심 기술을 보유한 기업조차 유동성 위기 및 영업 적자를 면치 못하고 있음. 반면, 아세안 콜드체인 사업자들은 극심한 인프라 숏티지를 기반으로 견고한 마진율을 방어 중임.</>,
          strat: <>국내 시장의 밸류에이션 붕괴 및 유동성 위기를 역이용하여, 기술력(LNG 냉열 쿨링 등)을 보유한 국내 한계 기업을 대상으로 Distressed M&A 및 핵심 자산 스핀오프(Spinoff) 딜소싱을 적극 타진할 것. 이를 아세안 확장 시 기술적 해자로 활용하여 밸류업(Value-up)을 도모.</>,
          source: 'DART 2024년 사업보고서 및 연결재무제표',
          unit: '십억원'
        },
        {
          id: 'w04',
          title: '현지 금융권 재고 품목별 담보인정비율 비교',
          subtitle: '자체추정 — 태국 금융권 품목별 담보인정비율 시나리오 (참치/육계/수산가공품 3품목)',
          chartType: 'Bar',
          xKey: 'scenario',
          bars: [{key: '일반_담보가치', color: '#64748b'}, {key: 'IoT_증명_담보가치', color: 'var(--color-success)'}],
          data: [{"scenario":"참치 재고","일반_담보가치":60,"IoT_증명_담보가치":90},{"scenario":"육계 재고","일반_담보가치":55,"IoT_증명_담보가치":85},{"scenario":"수산 가공품","일반_담보가치":50,"IoT_증명_담보가치":80}],
          sit: <>태국 BOI 면세 혜택 이면에는 까다로운 기술 이전 의무와 연간 감사라는 롱테일 리스크가 잠재. 또한 현지 금융권은 수산물(참치 등) 재고 담보 대출 시, 극심한 가격 변동성과 부패 위험을 이유로 20~40%에 달하는 페널티 성격의 헤어컷(Haircut)을 부과하고 있음.</>,
          strat: <>화물 보관을 넘어, 블록체인 기반 실시간 온습도 추적 시스템(IoT)으로 현지 은행에 강한 재고 무결성(Inventory Integrity)을 증명할 것. 이를 통해 담보인정비율(LTV)을 최대 90%까지 끌어올려, 원가 하락 시 즉각적인 전략적 비축(Inventory Financing)에 나서는 금융 레버리지를 극대화.</>,
          source: '업계추정 — 태국 금융권 재고 담보 관행 시나리오 (2026)',
          unit: '%'
        },
        {
          id: 'w05',
          title: '태국 대비 베트남 운영비용 비교',
          subtitle: 'PEA/EVN 실측치 · 전력료/인건비/물류비/부지 4항목',
          chartType: 'Composed',
          xKey: '국가',
          bars: [{key: '전력료', color: '#38bdf8'}],
          lines: [{key: '인건비지수', color: 'var(--color-warning)', yAxisId: 'right'}],
          dualAxis: true,
          data: [{"국가":"태국 (RDC)","전력료":0.126,"인건비지수":100},{"국가":"베트남 (가공)","전력료":0.087,"인건비지수":38}],
          sit: <>베트남은 태국 대비 전력료와 인건비(지수 38 vs 100)가 모두 저렴하나 통관 지연 및 전력망 불안정 리스크에 노출. 반면 태국은 운영비(OPEX)는 높지만 아세안 물류 허브로서의 통제력과 전문 인프라를 보유, 구조적 프리미엄을 향유 중임.</>,
          strat: <>단일 국가 집중 리스크를 분산하기 위해, 태국을 고부가가치 참치 재고의 컨트롤 타워(RDC)로 지정하고, 베트남은 저비용 1차 가공 및 단기 B2B 수출 기지로 이원화하는 투 트랙(Bi-Node) 운영 시나리오를 가동할 것. 이를 통해 지정학적 리스크를 헷징하고 공급망 유연성을 확보.</>,
          source: '태국 PEA / 베트남 EVN 실측 데이터 분석',
          unit: '$/kWh / 지수',
          unitMap: { '전력료': '$/kWh', '인건비지수': '' }
        },
        {
          id: 'w06',
          title: '자동화 대비 패시브 쿨링 리스크 노출도',
          subtitle: '자체추정 — 자동화·패시브 쿨링 시스템 리스크 축 비교 (4개 리스크 유형)',
          chartType: 'Radar',
          xKey: '리스크_유형',
          radars: [{name: '자동화', key: '자동화', color: '#f43f5e'}, {name: '패시브', key: '패시브', color: '#38bdf8'}],
          data: [{"리스크_유형":"기술자 구인난","자동화":95,"패시브":30},{"리스크_유형":"전력망 장애","자동화":90,"패시브":20},{"리스크_유형":"SW 결함","자동화":85,"패시브":15},{"리스크_유형":"사일런트 부패","자동화":80,"패시브":10}],
          sit: <>태국 내 Category II 암모니아 냉매 인증 기술자는 420명에 불과하며, 막대한 자본을 투입한 AS/RS 무인 스마트 창고도 전력망 마비 시 재고 전량 부패라는 극단적 테일 리스크(Tail Risk)에 노출되어 있음. \'420명의 저주\'로 인한 수복 지연 병목이 실재함.</>,
          strat: <>맹목적인 첨단 제어 시스템(100% Active) 의존도를 탈피하고, 정전 시에도 자체 온도를 -20°C 이하로 유지하는 상변화물질(PCM) 기반 패시브 쿨링(Passive Cooling) 기술을 로우테크(Low-tech) 헷징 장치로 설계에 필수 편입할 것. 이는 보험료(Premium) 인하 및 재무 건전성 방어의 핵심.</>,
          source: '업계추정 — 냉동창고 설비 자동화 vs 패시브 쿨링 리스크 시나리오 (2026)',
          unit: '점 (0~100)',
          unitMap: { '자동화': '점', '패시브': '점' }
        },
        {
          id: 'w07',
          title: '전통 냉각 대비 빙축열 시스템 비용 비교',
          subtitle: 'PEA TOU 모델링 · 10년 누적 운영비 시뮬레이션',
          chartType: 'Composed',
          xKey: 'year',
          bars: [{key: '전통적_냉각_비용', color: '#64748b'}, {key: '빙축열_냉각_비용', color: '#38bdf8'}],
          lines: [{key: '절감액_비율', color: 'var(--color-success)', yAxisId: 'right'}],
          dualAxis: true,
          data: [{"year":"1년차","전통적_냉각_비용":120,"빙축열_냉각_비용":75,"절감액_비율":37.5},{"year":"3년차","전통적_냉각_비용":380,"빙축열_냉각_비용":220,"절감액_비율":42.1},{"year":"5년차","전통적_냉각_비용":660,"빙축열_냉각_비용":370,"절감액_비율":43.9},{"year":"10년차","전통적_냉각_비용":1450,"빙축열_냉각_비용":780,"절감액_비율":46.2}],
          sit: <>태국 등 아세안의 산업용 시간대별 요금제(TOU Rate) 하에서 주간(Peak) 전력료는 심야 대비 1.8배에 달함. 기존 냉각 시스템을 주간에 최대 부하로 가동할 경우, 극심한 전력비용 상승으로 인해 영업이익률(OP Margin)이 훼손되는 구조적 한계에 직면함.</>,
          strat: <>심야 저비용 전력을 활용해 냉기를 비축하고 주간에 방출하는 빙축열 시스템(Ice Thermal Storage)을 전면 도입할 것. 이를 통해 연간 냉각 전력 비용(OPEX)을 40% 이상 선제적으로 삭감하고, 장기 인플레이션 및 유가 변동성 리스크를 원천 헷징(Hedging)해야 함.</>,
          source: '태국 전력청(PEA) TOU 요금 체계 모델링',
          unit: '만 바트 / %',
          unitMap: { '전통적_냉각_비용': '만 바트', '빙축열_냉각_비용': '만 바트', '절감액_비율': '%' }
        },
        {
          id: 'w08',
          title: '냉매 규제에 따른 재무 리스크 예측',
          subtitle: '키갈리 개정안 기반 · GWP 단계별 전환 비용 추정',
          chartType: 'Composed',
          xKey: 'year',
          bars: [{key: '전환_CapEx', color: '#c026d3'}],
          lines: [{key: '누적_환경부담금', color: '#f43f5e'}],
          dualAxis: true,
          data: [{"year":"2025","전환_CapEx":0,"누적_환경부담금":0.5},{"year":"2027","전환_CapEx":4.2,"누적_환경부담금":2.8},{"year":"2030","전환_CapEx":3.5,"누적_환경부담금":6.5},{"year":"2035","전환_CapEx":2.8,"누적_환경부담금":14.0}],
          sit: <>지구온난화지수(GWP)가 높은 구형 프레온계(HFCs) 냉매에 대한 글로벌 규제(키갈리 개정안)가 본격화됨. 노후 인프라 인수 시 수년 내 막대한 환경 부담금 및 CapEx 전면 교체라는 재무적 폭탄(Toxic Asset Risk)에 직면할 가능성이 농후함.</>,
          strat: <>실사(Due Diligence) 과정에서 냉매 유형을 최우선 검증하고, 자연 냉매(암모니아/CO2 2원 냉동기)로 전환 완료된 친환경 인프라에 한해 타겟 프리미엄을 부여할 것. 중장기적으로 탄소배출권(Carbon Credit) 판매 모델과 연계하여 ESG 프리미엄 및 추가 캐시플로우를 창출.</>,
          source: '키갈리 개정안(Kigali Amendment) 페이즈다운 일정',
          unit: '$M'
        },
        {
          id: 'w09',
          title: '아세안 산업용 부동산 용도별 수익률 비교',
          subtitle: '기관 리포트 기반 · 드라이/냉장/냉동/초저온 4유형',
          chartType: 'Bar',
          xKey: 'propertyType',
          bars: [{key: 'Cap_Rate', name: '자본환원율', color: 'var(--color-success)'}],
          data: [{"propertyType":"노후 상온","Cap_Rate":7.5},{"propertyType":"A급 상온","Cap_Rate":6.0},{"propertyType":"일반 냉동","Cap_Rate":5.2},{"propertyType":"BTS 초저온","Cap_Rate":4.0}],
          sit: <>아세안 물류 부동산 시장 내 일반 상온 창고(Dry)의 Cap Rate는 상승(가치 하락) 중이나, 우량 화주와 장기 임대차(Master Lease)가 체결된 초저온 창고는 Cap Rate 4%대까지 하락하며 글로벌 기관 투자자(LP)들의 매수 1순위 자산으로 부상 중임.</>,
          strat: <>단순 물류 운영 수익(OpEx)에 안주하지 말고, 완공 후 5년 내 우량 화주(당사 등)와의 10년 장기 임대차 계약을 기반으로 싱가포르 등 글로벌 리츠(REITs)에 최고가로 매각하는 자본 차익(Capital Gain) 중심의 엑시트(Exit) 플랜을 병행 추진할 것.</>,
          source: '업계추정 — 아세안 산업용 부동산 Cap Rate 시나리오 (JLL·CBRE 등 복수 기관 추정 기반, 2025)',
          unit: '%'
        },
        {
          id: 'n01',
          title: '베트남 콜드체인 시장 성장 타임라인',
          subtitle: 'GCCA/Ken Research/Trade.gov · 팔레트 용량 추이',
          chartType: 'Composed',
          xKey: '연도',
          bars: [{key: '팔레트_용량', color: '#38bdf8'}],
          lines: [{key: '미충족률', color: '#f43f5e', yAxisId: 'right'}],
          dualAxis: true,
          data: [{"연도":"2020","팔레트_용량":850,"미충족률":85},{"연도":"2021","팔레트_용량":950,"미충족률":83},{"연도":"2022","팔레트_용량":1100,"미충족률":82},{"연도":"2023","팔레트_용량":1200,"미충족률":81},{"연도":"2024","팔레트_용량":1300,"미충족률":80},{"연도":"2025(E)","팔레트_용량":1400,"미충족률":77},{"연도":"2026(E)","팔레트_용량":1500,"미충족률":73},{"연도":"2028(E)","팔레트_용량":1700,"미충족률":65}],
          sit: '베트남 콜드체인 시장은 CAGR 12.4% 성장 중(2024년 1.3M → 2028년 1.7M 팔레트 전망, Ken Research 추정)이나, 인프라 미충족률이 80%에 육박함. 현 공급 부족 구조가 유지되는 향후 3~5년이 초과 수익 창출을 위한 유효한 진입 구간으로 판단됨.',
          strat: '베트남 남부 핵심 물류 노드(HCMC·Long An)에 IQF 수산 특화 시설(5,000~15,000 팔레트) 중심의 그린필드(Greenfield) 투자를 공격적으로 집행. 외국인 100% 지분 구조와 우량 앵커 임차(Hung Vuong 등) 확보를 통해 36~48개월 내 BEP 달성 및 ROIC 20~30% 타겟팅.',
          source: 'GCCA Global Report + Ken Research Vietnam 2025 + Trade.gov',
          unit: '천 팔레트 / %',
          unitMap: { '팔레트_용량': '천 팔레트', '미충족률': '%' }
        },
        {
          id: 'n02',
          title: '콜드체인 부가서비스별 추가 수익 시뮬레이터',
          subtitle: 'KFAS 논문 기반 · MAP/TGase/AI선도/안전성 인증 4서비스',
          chartType: 'Bar',
          xKey: '서비스',
          bars: [{key: '톤당_추가수익', color: '#10b981'}, {key: '도입비용', color: '#64748b'}],
          data: [{"서비스":"MAP 가스치환 포장","톤당_추가수익":80000,"도입비용":15000},{"서비스":"TGase 해동품질 보증","톤당_추가수익":50000,"도입비용":8000},{"서비스":"초분광AI 선도판별","톤당_추가수익":65000,"도입비용":25000},{"서비스":"위해요소 안전성 인증","톤당_추가수익":40000,"도입비용":5000}],
          sit: 'KFAS 실증에 따르면 MAP 가스치환 포장은 유통기한을 3배(3일→14일) 연장하고, 초분광 AI 선도판별은 93.2%의 정확도를 입증. 이러한 부가 서비스(Value-add) 장착 시 일반 보관 대비 톤당 ₩40,000~₩80,000의 구조적 추가 마진 창출이 가능함.',
          strat: '입출고 라인에 MAP 포장 및 AI 선도 판별 시스템을 선제 도입하여 화주 락인 효과를 극대화할 것. 단순 보관료 경쟁에서 벗어나 품질 보증형(Quality Assurance) 서비스 모델로 퀀텀 점프하여, 업계 평균 대비 30~50%의 보관료 프리미엄(Price Premium)을 수취.',
          source: 'KFAS 한국수산과학회지 논문 8편 종합 분석',
          unit: '₩/톤'
        },
        {
          id: 'n03',
          title: '단일 거점 대비 이원화 시나리오 수익성 비교',
          subtitle: '자체추정 시나리오 — 단일/태국/베트남/Bi-Node 4시나리오 (수치는 예시적 추정)',
          chartType: 'Composed',
          xKey: '시나리오',
          bars: [{key: '5년_NPV', color: '#38bdf8'}, {key: '투자액', color: '#64748b'}],
          lines: [{key: 'ROIC', color: '#f43f5e', yAxisId: 'right'}],
          dualAxis: true,
          data: [{"시나리오":"태국 단일","5년_NPV":850,"투자액":800,"ROIC":15},{"시나리오":"베트남 단일","5년_NPV":1200,"투자액":500,"ROIC":25},{"시나리오":"Bi-Node 이원화","5년_NPV":2100,"투자액":1300,"ROIC":22},{"시나리오":"3국 통합","5년_NPV":3500,"투자액":2000,"ROIC":18}],
          sit: '태국(RDC 허브)과 베트남(가공·수출 기지)을 연계한 Bi-Node 이원화 전략은 시나리오 가정상 단일 거점 대비 5년 NPV 추정치가 약 75% 높게 산출됨(자체 추정, 실제 수치는 입지·임차 조건에 따라 변동). 태국의 전력망 안정성·BOI 인센티브, 베트남의 원가 경쟁력이 상호 보완 관계로 작용함.',
          strat: '총 가용 자본 1,300억 원 상회 시 Bi-Node 전략을 최우선 가동. 자본 500억 원 하회 시 단기 ROIC(추정 25%)가 우수한 베트남 그린필드 투자로 집중. 장기적으로 3국 통합 운영(2,000억 원 규모)으로 스케일업하여 아세안 수산 물류 핵심 사업자로 포지셔닝할 것.',
          source: '자체추정 — 투자 시나리오 분석 (NPV·ROIC 수치는 예시적 추정, 2026)',
          unit: '억원 / %',
          unitMap: { '5년_NPV': '억원', '투자액': '억원', 'ROIC': '%' }
        },
        {
          id: 'k01',
          title: '보냉팩 상온유통 중 어종별 선도 변화',
          subtitle: 'KFAS 한국수산과학회지 · K값 기반 4어종 시계열',
          chartType: 'Composed',
          xKey: '시간',
          lines: [{key: '넙치K값', color: '#38bdf8'}, {key: '고등어K값', color: '#f43f5e'}],
          data: [{"시간":"0h","넙치K값":5,"고등어K값":8},{"시간":"6h","넙치K값":12,"고등어K값":22},{"시간":"12h","넙치K값":28,"고등어K값":45},{"시간":"18h","넙치K값":48,"고등어K값":68},{"시간":"24h","넙치K값":65,"고등어K값":82}],
          sit: '보냉팩 3개 이상 적용 시 냉동 넙치·고등어 필렛은 12시간까지 선도 안전 구간(K값 30% 미만) 방어가 가능(KFAS 실증). 단, 고등어는 K값 상승 속도가 1.6배 빨라, 지방 산화가 선도 열화를 촉발하는 핵심 리스크 요인으로 판명됨.',
          strat: '라스트마일 콜드체인 표준으로 보냉팩 3개+스티로폼 이중포장을 벤치마크화하여 12시간 안전 구간을 강제. 고지방 어종(고등어, 연어 등)은 보냉팩 4개+진공포장(Vacuum Packing)을 의무화하여, 유통 과정 내 C/S 클레임 및 반품 손실(Shrinkage)을 50% 이상 원천 차단할 것.',
          source: 'KFAS 한국수산과학회지 — 시판 보냉팩 개수별 냉동 수산물 선도유지능 비교평가',
          unit: '% (K값)',
          unitMap: { '넙치K값': '%', '고등어K값': '%' }
        },
        {
          id: 'k02',
          title: '어종별 4대 선도지표 민감도 스코어링',
          subtitle: 'KFAS 논문 기반 · K값/TMA/VBN/pH 4축 레이더',
          chartType: 'Radar',
          xKey: '지표',
          radars: [{name: '넙치', key: '넙치', color: '#38bdf8'}, {name: '고등어', key: '고등어', color: '#f43f5e'}],
          data: [{"지표":"K값","넙치":92,"고등어":88},{"지표":"VBN","넙치":75,"고등어":95},{"지표":"히스타민","넙치":40,"고등어":90},{"지표":"pH","넙치":65,"고등어":70}],
          sit: '어종별 선도 민감도 팩터 분석 결과, 백색육(넙치)은 K값(스코어 92점)이, 적색육(고등어)은 VBN(95점) 및 히스타민(90점)이 절대적 신호 지표로 확인됨. 획일적인 품질 검사 프로토콜은 리소스 낭비이자 판별 오류의 주범임.',
          strat: '냉동창고 QC 프로토콜을 어종별로 즉각 파편화(Segmentation). 넙치류는 신속 K값 키트로, 고등어·참치류는 VBN+히스타민 듀얼 검사로 표준화하여 불필요한 검사 비용(OPEX)을 30% 절감하고 타겟 판별 정확도를 95% 이상으로 상향 평준화.',
          source: 'KFAS 한국수산과학회지 — 시판 보냉팩 및 스티로폼 박스 상온유통 시 수산물 선도지표 설정',
          unit: '민감도 (점)',
          unitMap: { '넙치': '점', '고등어': '점' }
        },
        {
          id: 'k03',
          title: '가스치환 포장 적용 생굴의 미생물 총균수 변화',
          subtitle: 'KFAS 논문 기반 · MAP+레몬 추출물 복합 처리',
          chartType: 'Composed',
          xKey: '저장일',
          lines: [{key: 'MAP_레몬', name: 'MAP+레몬 처리', color: '#10b981'}, {key: '대조군', color: '#64748b'}],
          data: [{"저장일":"0일","MAP_레몬":3.2,"대조군":3.2},{"저장일":"3일","MAP_레몬":3.5,"대조군":5.1},{"저장일":"7일","MAP_레몬":4.2,"대조군":7.8},{"저장일":"10일","MAP_레몬":5.0,"대조군":8.5},{"저장일":"14일","MAP_레몬":5.8,"대조군":9.2}],
          sit: '생굴에 MAP(CO₂ 50%/N₂ 50%) 및 레몬 추출물을 복합 처리 시, 7일 차 총균수가 99.99% 억제(4.2 log)되며 기존 유통기한(3~5일)을 14일로 무려 3배 연장하는 파괴적 혁신을 입증(KFAS 데이터).',
          strat: 'MAP 포장 기술을 하이엔드 횟감(생굴, 생참치 등)에 즉각 적용. 창고 내 가스치환포장 설비(In-house MAP Line)를 구축해 부가 서비스를 제공함으로써, 타사로의 이탈을 막는 절대적 해자(Moat)를 형성하고 톤당 수수료 마진을 극대화할 것.',
          source: 'KFAS 한국수산과학회지 — MAP+레몬 추출물 생굴 품질 특성',
          unit: 'log CFU/g'
        },
        {
          id: 'k04',
          title: '냉동 전복 위해요소 검출 수준 및 안전성',
          subtitle: 'KFAS 논문 기반 · 중금속 3종(납·카드뮴·수은, mg/kg)·일반세균(log CFU/g) 검출값 vs 기준치',
          chartType: 'Bar',
          xKey: '항목',
          bars: [{key: '기준치', color: '#64748b'}, {key: '검출값', color: '#38bdf8'}],
          data: [{"항목":"납 (mg/kg)","검출값":0.02,"기준치":2.0},{"항목":"카드뮴 (mg/kg)","검출값":0.15,"기준치":2.0},{"항목":"수은 (mg/kg)","검출값":0.01,"기준치":0.5},{"항목":"일반세균 (log CFU/g)","검출값":2.8,"기준치":5.0}],
          sit: '유통 냉동 전복 실사 결과 중금속 및 미생물 등 위해요소는 식품공전 기준을 100% 하회하여 적합. 그러나 해동 후 재냉동 시 발생하는 드립(Drip) 증가 및 텍스처(Texture) 열화 현상이 상품성을 훼손하는 최대 밸류 디스트로이어(Value Destroyer)임.',
          strat: '해당 무결성 데이터를 기반으로 당사 보관 수산물에 대한 \'안전성 프리미엄 인증서\' 발급 비즈니스를 신설. 특히 대(對) 일본·EU 수출 물량에 대해 건당 프리미엄 수수료를 과금(Monetization)하여 단순 임대업을 초월한 인증 비즈니스로 수익 파이프라인을 다각화.',
          source: 'KFAS 한국수산과학회지 57(3), 2024 — 냉동전복 위해요소분석 및 안전성 평가',
          unit: '' // 항목별 단위 상이(mg/kg · log CFU/g) — cardDesc에 명기
        },
        {
          id: 'k05',
          title: '초분광 모델 대비 관능검사 신선도 판별 정확도',
          subtitle: 'KFAS 논문 기반 · 딥러닝 초분광 vs 기존 관능',
          chartType: 'Bar',
          xKey: '등급',
          bars: [{key: '정확도', color: '#38bdf8'}, {key: '기존방식', color: '#64748b'}],
          data: [{"등급":"신선 (A)","정확도":96,"기존방식":78},{"등급":"보통 (B)","정확도":91,"기존방식":65},{"등급":"저하 (C)","정확도":93,"기존방식":72}],
          sit: '초분광 영상(400~1000nm) 및 딥러닝 기반 선도 판별 모델은 평균 정확도 93.2%를 기록, 숙련 검사원의 관능검사(71.7%)를 압도함. 비파괴 방식으로 초당 5마리 이상 실시간 팩터링이 가능한 처리량(Throughput)을 입증.',
          strat: '물류센터 게이트(Gate)에 AI 초분광 선도 스캐너를 전면 도입. 입고 시 불량 원물을 시스템 단위에서 100% 컷오프(Cut-off)하고, 출고 시 선도 등급별 오토 프라이싱(Auto-pricing)을 연동. 이를 통해 \'AI 퀄리티 개런티\' 명목으로 타사 대비 20~30% 프리미엄 단가를 징수할 것.',
          source: 'KFAS 한국수산과학회지 — 초분광 영상 기반 고등어 신선도 등급 분류 및 판정',
          unit: '% (정확도)',
          unitMap: { '정확도': '%', '기존방식': '%' }
        },
        {
          id: 'k06',
          title: '온도별 동결건조 블록 유통기한 및 지방산화',
          subtitle: 'KFAS 논문 기반 · -20°C~35°C 5구간 비교',
          chartType: 'Composed',
          xKey: '저장온도',
          bars: [{key: '유통기한', color: '#38bdf8'}],
          lines: [{key: 'TBA값', color: '#f43f5e', yAxisId: 'right'}],
          dualAxis: true,
          data: [{"저장온도":"-20°C","유통기한":36,"TBA값":0.1},{"저장온도":"5°C","유통기한":24,"TBA값":0.3},{"저장온도":"15°C","유통기한":18,"TBA값":0.8},{"저장온도":"25°C","유통기한":14,"TBA값":1.5},{"저장온도":"35°C","유통기한":8,"TBA값":3.2}],
          sit: '동결건조(HMR) 수산 블록은 -20°C에서 36개월, 25°C 상온에서도 14개월의 장기 유통이 가능(KFAS 실증). 고온 노출 시 TBA(지방산화) 급증 리스크만 통제하면 냉동창고 운영 비중을 대폭 줄일 수 있어 콜드체인 비용 구조 개선에 유효한 수단임.',
          strat: '동결건조 HMR 포트폴리오를 대폭 확대하여 비싼 냉동창고 캡을 비우고 상온 창고로 재고를 이전(Shift). 이를 화주들에게 \'콜드체인 비용 절감 컨설팅\'으로 패키징하여 제공함으로써 물류 효율(Efficiency)의 한계를 돌파하고 마진 스프레드를 확대할 것.',
          source: 'KFAS 한국수산과학회지 55(4), 2022 — 동결건조 블록 품질 변화 및 유통기한 추정',
          unit: '개월 / mg·kg⁻¹',
          unitMap: { '유통기한': '개월', 'TBA값': 'mg/kg' }
        },
        {
          id: 'k07',
          title: '카라기난 첨가 수리미의 냉장 저장 중 겔 강도 변화',
          subtitle: 'KFAS 논문 기반 · 이오타-카라기난 1% 첨가 효과',
          chartType: 'Composed',
          xKey: '저장일',
          lines: [{key: '카라기난', color: '#8b5cf6'}, {key: '대조군', color: '#64748b'}],
          data: [{"저장일":"0일","카라기난":850,"대조군":850},{"저장일":"3일","카라기난":830,"대조군":720},{"저장일":"7일","카라기난":790,"대조군":580},{"저장일":"10일","카라기난":760,"대조군":450},{"저장일":"14일","카라기난":720,"대조군":320}],
          sit: '수리미(Surimi) 원료에 이오타-카라기난 1% 처리 시 14일 냉장 보관 후에도 겔 강도가 초기 대비 85% 유지됨(대조군은 37.6%로 붕괴). 이는 냉장 유통 어육 가공품의 쉘프라이프(Shelf-life)를 2배(7일→14일) 연장시키는 핵심 팩터임.',
          strat: '화주들에게 \'해동 후 14일 품질 개런티(Guarantee)\' 밸류-애드(Value-add) 서비스를 제안. 수리미 가공 파트너사들의 재고 회전(Inventory Turnover) 압박을 해소해주며 당사 물류 센터로의 종속성을 강화, 장기 임대차 계약의 지렛대로 적극 활용할 것.',
          source: 'KFAS 한국수산과학회지 — 카라기난 첨가 수리미의 냉장 저장 중 특성 변화',
          unit: 'gf (겔강도)',
          unitMap: { '카라기난': 'gf', '대조군': 'gf' }
        },
        {
          id: 'k08',
          title: '효소 복합 처리 무지개송어육의 해동 드립률 및 겔 강도',
          subtitle: 'KFAS 논문 기반 · TGase 처리 전/후 비교',
          chartType: 'Composed',
          xKey: '처리군',
          bars: [{key: '겔강도', color: '#38bdf8'}],
          lines: [{key: '드립률', color: '#f43f5e', yAxisId: 'right'}],
          dualAxis: true,
          data: [{"처리군":"무처리","드립률":8.5,"겔강도":100},{"처리군":"TGase 단독","드립률":5.8,"겔강도":165},{"처리군":"카라기난 단독","드립률":6.2,"겔강도":140},{"처리군":"TGase+카라기난","드립률":4.7,"겔강도":210}],
          sit: '동결 송어육에 TGase 및 카파-카라기난 복합 처리 시, 해동 드립률이 45% 억제(8.5%→4.7%)되고 겔 강도가 2.1배 상승. 이는 냉동 수산물의 고질적 아킬레스건인 \'해동 후 품질 폭락\' 리스크를 펀더멘털 단위에서 방어하는 기술적 우위임.',
          strat: '냉동 입고 전 전처리(Pre-treatment) 서비스를 핵심 수익 모델화. 드립 1%p 발생 시 킬로당 ₩100~200의 원가 손실이 발생하는 화주들에게, 품질 방어를 미끼로 프리미엄 전처리 과금을 청구하여 엑스트라 알파(Extra Alpha) 수익을 지속 창출할 것.',
          source: 'KFAS 한국수산과학회지 — TGase+다당류 활용 동결 무지개송어 물성개선 및 저장성 향상',
          unit: '% / 지수',
          unitMap: { '드립률': '%', '겔강도': '' }
        },
        {
          id: 'us01',
          title: '미국 주요 냉동창고 실측 최저온도 비교',
          subtitle: '멀티에이전트 조사 · 사시미급 -60°C 적합성 판별',
          chartType: 'Bar',
          xKey: '시설',
          bars: [{key: '최저온도', color: '#38bdf8'}],
          data: [{"시설":"퍼스앰보이","최저온도":-62},{"시설":"라콜드","최저온도":-60},{"시설":"프리즈팩","최저온도":-60},{"시설":"우오리키","최저온도":-60},{"시설":"뮤추얼","최저온도":-60},{"시설":"KPAC","최저온도":-51},{"시설":"버논","최저온도":-34},{"시설":"포트뉴왁","최저온도":-18},{"시설":"뉴잉글랜드","최저온도":-12},{"시설":"이스트코스트","최저온도":4}],
          sit: <>미국 전역에서 사시미급 -60°C를 실제 구현하는 냉동창고는 극소수다. 80개 후보 중 44개가 -18~-30°C 일반 냉동으로 반박됐고, 검색 상위의 포트뉴왁(-18°C)·뉴잉글랜드(-12°C)·이스트코스트(냉장 4°C)는 사시미 보관에 부적합하다. 실측 -60°C는 퍼스앰보이(-62°C)·라콜드·프리즈팩·우오리키·뮤추얼 등 손에 꼽힌다.</>,
          strat: <>"cold storage" 간판만 보고 계약하지 말 것. 입고 전 실측 -60°C 유지 능력을 온도 로그·USDC 검사 이력으로 서면 검증하고, -51°C에 그치는 KPAC나 표준냉동 버논(-34°C)을 서부 ULT로 오인하는 리스크를 원천 차단하라.</>,
          source: '미국 ULT 사시미급 냉동창고 멀티에이전트 조사 (2026-06-02)',
          unit: '°C',
          syncDate: '2026.06.02'
        },
        {
          id: 'us02',
          title: '백업용 초저온 컨테이너 임대 온도 스펙트럼',
          subtitle: '3PL 팔레트 품귀 대비 · 자가 ULT 구축 장비 비교',
          chartType: 'Bar',
          xKey: '제공사',
          bars: [{key: '최저온도', color: '#8b5cf6'}],
          data: [{"제공사":"KTI","최저온도":-110},{"제공사":"타이탄","최저온도":-75},{"제공사":"써모킹","최저온도":-70},{"제공사":"아틱스토어","최저온도":-65},{"제공사":"클린지","최저온도":-60}],
          sit: <>임대 가능한 public 3PL ULT 팔레트가 희소해 성수기 공간 부족 리스크가 크다. 이를 대비한 이동·고정식 슈퍼프리저 컨테이너는 클린지 -60°C부터 타이탄 -75°C까지 사시미 기준을 충분히 충족하며, KTI -110°C는 참치엔 과사양이다.</>,
          strat: <>3PL 앵커 2곳 타진과 동시에 타이탄·아틱스토어 컨테이너 견적을 병행 확보해, 팔레트 품귀 시 자가 ULT로 즉시 전환하는 이중화 전략을 구축하라. 과사양 KTI는 비용만 키우므로 -60~-75°C 구간에서 선택할 것.</>,
          source: '미국 ULT 사시미급 냉동창고 멀티에이전트 조사 (2026-06-02)',
          unit: '°C',
          syncDate: '2026.06.02'
        },
        {
          id: 'us03',
          title: '미국 ULT 후보 검증 깔때기',
          subtitle: '80개 후보 → 적대적 검증 → 임대가능 사시미 앵커',
          chartType: 'Bar',
          xKey: '단계',
          bars: [{key: '시설수', color: '#10b981'}],
          data: [{"단계":"초기후보","시설수":80},{"단계":"ULT확정유력","시설수":36},{"단계":"임대앵커","시설수":2}],
          sit: <>8각도 웹 스윕으로 80개 후보를 수집해 -18~-30°C 일반 냉동 44개를 반박하고, -60°C ULT 확정 18 + 유력 18 = 36개로 압축했다. 그중 제3자 임대가 실제 가능한 사시미급 public 3PL 앵커는 동·서부 단 2곳(퍼스앰보이·라콜드)뿐이다(public 3PL 자체는 48개).</>,
          strat: <>임대 가능한 -60°C는 구조적으로 희소하므로 2개 앵커에만 의존하지 말 것. 수입업체 자가창고 제휴(우오리키·뮤추얼)와 자가 컨테이너를 동시 추진하는 3중 백업으로 공급 안정성을 확보하라.</>,
          source: '미국 ULT 사시미급 냉동창고 멀티에이전트 조사 (2026-06-02)',
          unit: '개',
          syncDate: '2026.06.02'
        },
        {
          id: 'us04',
          title: 'ULT 보관 단가 구조 (월 팔레트당)',
          subtitle: '일반 냉동 실측 벤치마크 + 사시미급 -60°C 프리미엄 추정',
          chartType: 'Bar',
          xKey: '보관유형',
          bars: [{key: '월단가', color: '#f59e0b'}],
          data: [{"보관유형":"일반냉동(-18°C)","월단가":12},{"보관유형":"냉장(2~5°C)","월단가":25},{"보관유형":"심냉동(-35°C)","월단가":30},{"보관유형":"ULT(-60°C)","월단가":50}],
          sit: <>미국 일반 냉동 보관료는 팔레트당 월 $8~25(평균 ~$12), climate-controlled는 $22~30이다. 사시미급 -60°C ULT는 deep-freeze 에너지·설비 프리미엄으로 통상 일반 냉동의 2~3배인 월 $40~60대로 추정되며, 블라스트 동결 핸들링 수수료가 별도 가산된다. 단, -60°C 전용 공개 요율표는 없어 실계약은 직접 견적이 필수다.</>,
          strat: <>ULT 보관료가 일반 냉동의 약 3배이므로, 회전율 낮은 장기 비축은 ULT 비용이 마진을 잠식한다. 고회전 사시미급만 ULT에 두고 가공·통조림용 저등급은 -18°C 일반 냉동으로 분리하는 '온도 티어링'으로 보관원가를 30~40% 절감하라.</>,
          source: '미국 콜드스토리지 팔레트 보관료 벤치마크(2025-26) + ULT 프리미엄 추정',
          unit: '$/월',
          syncDate: '2026.06'
        },
        {
          id: 'us05',
          title: '앵커 시설 항만 근접성',
          subtitle: '입항지~ULT 창고 거리 — 사시미 드레이지 원가 좌우',
          chartType: 'Bar',
          xKey: '시설',
          bars: [{key: '항만거리', color: '#38bdf8'}],
          data: [{"시설":"퍼스앰보이","항만거리":13},{"시설":"라콜드","항만거리":32},{"시설":"바인랜드","항만거리":60}],
          sit: <>사시미는 항공(생물)·해상(냉동 로인) 이원 유입이라 입항지 근접성이 드레이지·리드타임을 좌우한다. 동부 퍼스앰보이는 미 동부 최대 컨테이너항 Port NY/NJ에 약 13km(JFK·뉴어크 공항 인접), 서부 라콜드는 Port of LA/롱비치에 약 32km(LAX 약 22km)로 둘 다 입항지 근접 우위가 크다. 보강 후보 바인랜드(Americold)는 필라델피아항 약 60km다.</>,
          strat: <>앵커 2곳 모두 항만 10~30km 권역이라 드레이지가 짧아 콜드체인 단절 리스크가 낮다. 생물 사시미는 공항 인접 퍼스앰보이·라콜드로 항공 직결하고, 냉동 로인 대량분은 항만 근접 ULT에서 통관·재포장 후 내륙 배송하는 '온도·물류 이원 라우팅'을 설계하라.</>,
          source: '시설 주소 기반 입항지·공항 직선거리 근사(2026) · Port NY-NJ / LA-Long Beach',
          unit: 'km',
          syncDate: '2026.06'
        },
        {
          id: 'us06',
          title: '저장온도별 사시미급 보관 한계',
          subtitle: '-18°C 수주 vs -60°C 2년 — 미쓰비시 비축의 과학적 근거',
          chartType: 'Bar',
          xKey: '저장온도',
          bars: [{key: '사시미보관한계', color: '#06b6d4'}],
          data: [{"저장온도":"-18°C","사시미보관한계":0.5},{"저장온도":"-35°C","사시미보관한계":6},{"저장온도":"-50°C","사시미보관한계":12},{"저장온도":"-60°C","사시미보관한계":24}],
          sit: <>표준 냉동(-18°C)에서 참치 적색육은 미오글로빈 산화로 수주 내 갈변해 사시미 가치를 잃는다. 반면 -50~-60°C 초저온에서는 12~24개월간 선홍색·식감이 유지된다. 미쓰비시(자회사 도요레이조)가 참다랑어를 -60°C에서 최대 2년 비축하는 것이 이 과학의 상업적 증거다.</>,
          strat: <>보관 한계가 온도에 따라 48배(0.5→24개월) 벌어지므로 -60°C ULT는 비용이 아니라 '시간을 사는' 투자다. 어획 성수기 저가 매입분을 -60°C에 비축했다가 비수기 고가에 출하하는 캘린더 스프레드(시간차 차익)로 ULT 프리미엄을 상쇄하라.</>,
          source: '수산 콜드체인 학술·업계 컨센서스 + 미쓰비시 -60°C 2년 비축 사례(2026)',
          unit: '개월',
          syncDate: '2026.06'
        }
      ]
    };

    const fetchAllData = async () => {
      try {
        const updatedWidgets = await Promise.all(
          mockData.widgets.map(async (widget) => {
            try {
              const res = await fetch(`/api/cold-storage/widget?id=${widget.id}`);
              if (res.ok) {
                const json = await res.json();
                // json이 배열이면 바로 할당, 객체이고 data 필드가 있으면 data 할당, 그 외엔 통째로 할당
                const fetchedData = Array.isArray(json) ? json : (json.data || json);
                
                // widget 데이터를 보존하기 위해 title, chartType 등이 없을 경우 덮어쓰지 않게 주의
                return { 
                  ...widget, 
                  data: fetchedData,
                  title: widget.title || json.title,
                  chartType: widget.chartType || json.chartType 
                };
              }
            } catch (err) {
              console.error('Fetch error:', err);
            }
            return widget;
          })
        );
        setData({
          ...mockData,
          widgets: updatedWidgets
        });
      } catch (error) {
        console.error('Failed to load API data:', error);
        setData(mockData as any);
      }
    };

    fetchAllData();
  }, []);

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <Activity size={32} style={{ color: '#38bdf8', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: '1rem' }}>아세안 콜드체인 전략 인텔리전스 로딩 중...</p>
    </div>
  );

  const { kpis, widgets } = data;
  const kpiKeys = Object.keys(kpis);
  
  const KPI_THEMES = [
    { text: '#38bdf8', icon: Activity },
    { text: 'var(--color-success)', icon: DollarSign },
    { text: 'var(--color-warning)', icon: Zap },
    { text: 'var(--color-success)', icon: ShieldCheck },
    { text: 'var(--color-danger)', icon: AlertTriangle },
    { text: '#8b5cf6', icon: Snowflake },
  ];

  const renderChart = (widget: any) => {
    // API 엣지케이스 방어: 데이터가 객체 안에 중첩되어 있거나 배열이 아닌 경우 대비
    let d = widget.data;
    if (d && typeof d === 'object' && !Array.isArray(d) && d.data) {
      d = d.data;
    }
    
    if (!d || !Array.isArray(d) || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>데이터 없음</div>;

    const formatVal = (v: any) => {
      if (typeof v !== 'number') return v;
      return v % 1 === 0 ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 3 });
    };

    const formatXAxis = (tickItem: any) => {
      if (typeof tickItem === 'string') {
        const cleaned = tickItem.replace(/\([^)]*\)/g, '').trim();
        return cleaned.length > 6 ? cleaned.slice(0, 6) + '..' : cleaned;
      }
      return tickItem;
    };

    const cType = (widget.chartType || '').toLowerCase();

    switch(cType) {
      case "bar":
        return (
          <BarChart data={d}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatXAxis} minTickGap={20} />
            <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} unitMap={widget.unitMap} />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize:'11px'}} />
            {widget.bars?.map((b: any, i: number) => (
              <Bar key={i} dataKey={b.key} name={b.name || String(b.key).replace(/_/g, ' ')} fill={b.color} radius={[6,6,0,0]} fillOpacity={0.85} />
            ))}
          </BarChart>
        );
      case "composed":
        return (
          <ComposedChart data={d}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatXAxis} minTickGap={20} />
            <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            {widget.dualAxis && (
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            )}
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} unitMap={widget.unitMap} />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize:'11px'}} />
            {widget.bars?.map((b: any, i: number) => (
              <Bar key={i} yAxisId={b.yAxisId || "left"} dataKey={b.key} name={b.name || String(b.key).replace(/_/g, ' ')} fill={b.color} radius={[6,6,0,0]} fillOpacity={0.85} />
            ))}
            {widget.lines?.map((l: any, i: number) => (
              <Line key={i} yAxisId={l.yAxisId || "left"} type="monotone" dataKey={l.key} name={l.name || String(l.key).replace(/_/g, ' ')} stroke={l.color} strokeWidth={2.5} dot={{r:4}} activeDot={{r:6}} />
            ))}
          </ComposedChart>
        );
      case "radar":
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={d}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey={widget.xKey} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatXAxis} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} unitMap={widget.unitMap} />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize:'11px'}} />
            {widget.radars?.map((r: any, i: number) => (
              <Radar key={i} name={r.name} dataKey={r.key} stroke={r.color} fill={r.color} fillOpacity={0.4} />
            ))}
          </RadarChart>
        );
      default:
        return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>지원되지 않는 차트 형식: {widget.chartType}</div>;
    }
  };

  const renderWidgetCard = (w: any, pillar: 'S1'|'S2'|'S3'|'S4'|'S5' = 'S3') => {
    const IconComp = WIDGET_ICONS[w.id] || Factory;
    const accentColor = '#38bdf8';
    const liveStatus: 'LIVE'|'SYNCED'|'STATIC' = w.telemetry === 'live' || w.isLiveApi ? 'LIVE' : (w.telemetry === 'synced' ? 'SYNCED' : 'STATIC');

    return (
      <WidgetCard key={w.id}
        title={w.title || '데이터 위젯'}
        icon={IconComp}
        iconColor={accentColor}
        pillar={pillar}
        cardDesc={w.subtitle || ''}
        unit={w.unit || undefined}
        telemetry={{ status: liveStatus, syncDate: w.syncDate }}
        chartHeight={375}
        chart={renderChart(w)}
        takeaway={{
          situation: w.sit || '',
          actionPlan: w.strat || '',
          source: w.source || '아세안 콜드체인 인텔리전스 네트워크',
        }}
      />
    );
  };

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif", backgroundColor: 'var(--bg-color)' }}>
      
      {/* Header */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', 
              background: '#38bdf8', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <Snowflake size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                아세안 콜드체인 (투자 시나리오 보드)
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>전략 투자 및 운영 커맨드 센터 — {widgets.length}개 위젯 · {kpiKeys.length}개 핵심지표 · <span style={{ color: '#38bdf8' }}>KFAS 실증 연구 통합</span></p>
            </div>
          </div>
        </div>
      </header>

      {/* 6 KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {kpiKeys.map((key, idx) => {
          const kpi = kpis[key];
          const theme = KPI_THEMES[idx % KPI_THEMES.length];
          const IconComp = theme.icon;
          return (
            <div key={key} className="ds-card" style={{background: 'rgba(24, 24, 24, 0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.2rem',
              display: 'flex', flexDirection: 'column', gap: '6px',
              transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px',
              position: 'relative', overflow: 'hidden'}}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#181818'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{kpi.title}</span>
                {kpi.telemetry ? <TelemetryBadge status={kpi.telemetry} syncDate={kpi.syncDate} /> : <IconComp size={16} style={{ color: theme.text }} />}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {kpi.value.startsWith('฿') && '฿'}
                {kpi.value.startsWith('$') && '$'}
                {kpi.value.startsWith('+') && '+'}
                {kpi.value.startsWith('₩') && '₩'}
                <CountUp end={parseFloat(kpi.value.replace(/[^0-9.]/g, ''))} duration={2} separator="," decimals={kpi.value.includes('.') ? 1 : 0} />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '3px' }}>
                  {kpi.value.replace(/^[+$₩฿0-9.,%]+/, '').trim()}
                  {kpi.value.includes('%') ? '%' : ''}
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', color: theme.text, fontWeight: 600 }}>
                <span style={{ background: `${theme.text}20`, padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>{kpi.trend}</span>
                {kpi.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ 밸류체인 네비게이터 ═══ */}
      <div style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', padding: '6px', marginBottom: '2rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '4px 0 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '6px',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            콜드체인 밸류체인 네비게이터 — {SECTIONS.length}개 섹션을 클릭하여 탐색하세요
          </span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: `repeat(${SECTIONS.length}, 1fr)`, gap: '4px' }}>
          {SECTIONS.map((s) => {
            const isActive = activeSection === s.id;
            const SectionIcon = s.icon;
            return (
              <div
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveSection(s.id)}
                style={{
                  position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '4px', padding: '12px 4px 14px',
                  background: isActive ? `${s.color}12` : 'transparent',
                  border: `1.5px solid ${isActive ? s.color : 'transparent'}`,
                  borderRadius: '12px', cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? `0 0 20px ${s.color}25, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
                  overflow: 'hidden',
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px',
                    background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
                    borderRadius: '3px 3px 0 0',
                  }} />
                )}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? s.color : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#0f172a' : 'rgba(148,163,184,0.6)',
                  transition: 'all 0.25s',
                  boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none',
                }}>
                  <SectionIcon size={14} />
                </div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: isActive ? 700 : 500,
                  color: isActive ? s.color : 'var(--text-secondary)',
                  transition: 'all 0.25s', whiteSpace: 'nowrap',
                }}>
                  {s.label}
                </span>
                {isActive && (
                  <span style={{
                    fontSize: '0.55rem', color: 'rgba(148,163,184,0.7)', textAlign: 'center',
                    lineHeight: 1.3, maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                  }}>
                    {s.desc}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Widgets Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

        {activeSection === 's1' && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Activity size={24} color="#38bdf8" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>1. 입고 및 수급</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets.filter((w: any) => ['w01', 'w03', 'n01'].includes(w.id)).map((w: any) => renderWidgetCard(w, 'S1'))}
          </div>
        </section>
        )}

        {activeSection === 's2' && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <ShieldAlert size={24} color="var(--color-danger)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>2. 보관 및 가동률</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets.filter((w: any) => ['w02', 'w04'].includes(w.id)).map((w: any) => renderWidgetCard(w, 'S2'))}
          </div>
        </section>
        )}

        {activeSection === 's3' && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Globe size={24} color="var(--color-warning)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>3. 물류 및 통관 인프라</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets.filter((w: any) => ['w05', 'w06', 'n03'].includes(w.id)).map((w: any) => renderWidgetCard(w, 'S3'))}
          </div>
        </section>
        )}

        {activeSection === 's4' && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <TrendingUp size={24} color="#8b5cf6" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>4. 수익성 및 투자 전략</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets.filter((w: any) => ['w07', 'w08', 'w09', 'n02'].includes(w.id)).map((w: any) => renderWidgetCard(w, 'S4'))}
          </div>
        </section>
        )}

        {activeSection === 's5' && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Snowflake size={24} color="#06b6d4" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>5. 에너지 최적화 및 품질과학</h2>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(6, 182, 212, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>한국수산과학회지 KFAS 논문 8편 기반</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets.filter((w: any) => ['k01', 'k02', 'k03', 'k04', 'k05', 'k06', 'k07', 'k08'].includes(w.id)).map((w: any) => renderWidgetCard(w, 'S5'))}
          </div>
        </section>
        )}

        {activeSection === 'us' && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Anchor size={24} color="#38bdf8" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>6. 미국 초저온(ULT) 사시미급 보관 인프라</h2>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>멀티에이전트 조사 2026.06.02 · 동·서부 ULT</span>
          </div>

          {/* 미국 ULT 핵심 지표 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { t: '임대가능 -60°C 앵커', v: '2곳', d: '동부 퍼스앰보이 · 서부 라콜드', c: '#38bdf8' },
              { t: '후보 검증', v: '80 → 36', d: 'ULT 확정 18 + 유력 18', c: 'var(--color-success)' },
              { t: '동부 최우선', v: '-62°C', d: 'Lineage 퍼스앰보이 · 600팔레트', c: '#38bdf8' },
              { t: '서부 최우선', v: '-60°C', d: 'LaCold · 현장 USDC 검사관', c: '#f43f5e' },
            ].map((k, i) => (
              <div key={i} style={{ background: 'rgba(24, 24, 24, 0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.t}</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: k.c }}>{k.v}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{k.d}</span>
              </div>
            ))}
          </div>

          {/* 임대가능 앵커 상세 카드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {[
              { region: '미국 동부', rc: '#38bdf8', name: 'Lineage Logistics — 퍼스앰보이', sub: '구 Preferred Freezer Services', temp: '-60 ~ -62°C', spec: 'ULT 약 600팔레트 · 사시미급 명시', addr: '536 Fayette St, Perth Amboy, NJ', contact: '(732) 324-2000', grade: '확정~유력 · 신뢰도 高' },
              { region: '미국 서부', rc: '#f43f5e', name: 'LaCold — LA 콜드스토리지', sub: 'Los Angeles Cold Storage Co.', temp: '-60°C / -76°F', spec: '현장 USDC 수산검사관 · 사시미급 참치 명시', addr: '440 S Central Ave, LA 90013', contact: '213.624.1831', grade: '확정 · 신뢰도 高' },
            ].map((f, i) => (
              <div key={i} className="ds-card" style={{ background: 'rgba(24,24,24,0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid ${f.rc}33`, borderLeft: `3px solid ${f.rc}`, borderRadius: '8px', padding: '1.2rem', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: f.rc, background: `${f.rc}1f`, padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>{f.region}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{f.grade}</span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{f.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>{f.sub}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <Snowflake size={16} color={f.rc} />
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: f.rc }}>{f.temp}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '10px' }}>{f.spec}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>📍 {f.addr}</span>
                  <span>☎ {f.contact}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 보조·참고 시설 노트 */}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary)' }}>보조·참고</strong> — FreezPak(서부 -60°C 표방·수산 특화 미확인·검증 中, ☎213-737-5900) · KPAC(서부 -51°C 비공개) · 우오리키/뮤추얼(-60°C 자가창고 → 수입업체 제휴 대상, 직접 임대 불가)<br />
            <strong style={{ color: 'var(--text-primary)' }}>확장 후보</strong> — Americold 바인랜드 NJ(필라델피아·NY/NJ항 지원, 동부 최대급 · 사시미급 -60°C 여부 실사 필요) · 도요레이조(미쓰비시 냉동 자회사 · 글로벌 ULT 운영사)
          </div>

          {/* 전략 인텔리전스: 관세 이연 + 경쟁 비축 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <DollarSign size={18} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>전략 인텔리전스 — 관세 이연 & 공급 통제</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {[
              { rc: '#10b981', badge: '관세 전략', title: '보세창고·FTZ 관세 이연', body: '보세창고(Bonded) 최대 5년 · FTZ(자유무역지대) 무기한 관세 이연. 보세 상태로 재라벨·품질검사·재포장·재수출이 무관세로 가능하며, 보세↔FTZ 이전도 듀티를 트리거하지 않는다.', foot: 'ULT 재고를 보세·FTZ에 두면 듀티 납부를 출고 시점까지 이연해 현금흐름을 개선하고, 재수출분(일본·EU 재판매)은 미국 관세를 영구 회피한다.' },
              { rc: '#f43f5e', badge: '경쟁 인텔', title: 'ULT 비축 = 공급 통제 무기', body: '미쓰비시(냉동 자회사 도요레이조)는 참다랑어를 -60°C 초저온에서 최대 2년 비축해 어종을 선점하고 공급·가격을 통제한다. ULT는 단순 비용이 아니라 시간을 사는 차익 자산이다.', foot: '신라교역도 성수기 저가 매입 → -60°C 비축 → 비수기 고가 출하의 캘린더 스프레드로 ULT 프리미엄을 상쇄하고 공급 협상력을 확보할 수 있다.' },
            ].map((c, i) => (
              <div key={i} className="ds-card" style={{ background: 'rgba(24,24,24,0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid ${c.rc}33`, borderLeft: `3px solid ${c.rc}`, borderRadius: '8px', padding: '1.2rem', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: c.rc, background: `${c.rc}1f`, padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>{c.badge}</span>
                  <span style={{ fontSize: '1.0rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.title}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '10px' }}>{c.body}</div>
                <div style={{ fontSize: '0.78rem', color: c.rc, lineHeight: 1.55, background: `${c.rc}12`, borderRadius: '6px', padding: '8px 10px' }}>💡 {c.foot}</div>
              </div>
            ))}
          </div>

          {/* US 위젯 차트 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets.filter((w: any) => ['us01', 'us02', 'us03', 'us04', 'us05', 'us06'].includes(w.id)).map((w: any) => renderWidgetCard(w, 'S3'))}
          </div>
        </section>
        )}

      </div>
    </div>
  );
}

