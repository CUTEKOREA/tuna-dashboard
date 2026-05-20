"use client";

import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Anchor, DollarSign, Activity, AlertTriangle, ShieldCheck, Zap, Factory, Snowflake, ShieldAlert, BarChart2, Globe, TrendingUp,
  BookOpen, ChevronUp, ChevronDown, MessageSquare
} from 'lucide-react';

import SafeResponsiveContainer from './SafeResponsiveContainer';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';
import styles from './MackerelStrategy.module.css'; // 재사용

const smartFormat = (v: any, dataKey?: string): string | any => {
  if (Array.isArray(v)) {
    return v.map(val => smartFormat(val, dataKey)).join(' ~ ');
  }
  if (typeof v !== 'number') return v;
  const str = v % 1 === 0 ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 3 });
  if (!dataKey) return str;
  const k = dataKey.toLowerCase();
  if (k.includes('비율') || k.includes('가동률') || k.includes('점유율') || k.includes('roic') || k.includes('성장률')) return `${str}%`;
  if (k.includes('보관료') || k.includes('비용')) return `฿${str}`;
  if (k.includes('자본') || k.includes('매출') || k.includes('영업이익')) return `${str}억원`;
  if (k.includes('수출액') || k.includes('수입액')) return `$${str}M`;
  return str;
};

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry: any, index: any) => (
          <div key={index} className={styles.tooltipValue}>
            <span style={{ color: entry.color }}>■ {entry.name}</span>
            <strong>{smartFormat(entry.value, entry.dataKey)} {unit && !entry.dataKey?.toLowerCase().includes('비율') && !entry.dataKey?.toLowerCase().includes('roic') ? unit : ''}</strong>
          </div>
        ))}
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
};

const TelemetryBadge = ({ status, syncDate }: { status: 'live' | 'synced' | 'static' | undefined; syncDate?: string }) => {
  if (!status) return null;
  const config = {
    live: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#10b981', label: 'LIVE API' },
    synced: { bg: 'rgba(56, 189, 248, 0.15)', border: '#c026d3', text: '#c026d3', label: 'SYNCED' },
    static: { bg: 'rgba(148, 163, 184, 0.15)', border: '#64748b', text: '#94a3b8', label: 'STATIC' }
  }[status];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ 
        background: config.bg, border: `1px solid ${config.border}`, color: config.text, 
        padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.5px' 
      }}>
        {config.label}
      </span>
      {syncDate && <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{syncDate}</span>}
    </div>
  );
};

export default function ColdStorageDashboard() {
  const [data, setData] = useState<any>(null);
  const [isEduOpen, setIsEduOpen] = useState(false);

  useEffect(() => {
    const mockData = {
      kpis: {
        kpi1: { title: "일반 상온 창고 입주율", value: "88% ↘", desc: "공급 과잉 상태 직면 (Trap)", trend: "위험", icon: "TrendingDown" },
        kpi2: { title: "초저온 맞춤형(BTS) 점유율", value: "98% ↗", desc: "고수익 하이엔드 인프라 품귀", trend: "Grade S", icon: "TrendingUp" },
        kpi3: { title: "태국 Category II 인증자", value: "420명", desc: "첨단 자동화 고장 시 치명적 리스크", trend: "경고", icon: "AlertTriangle" },
        kpi4: { title: "태국 BOI 면세 조건 달성", value: "기술 이전", desc: "매년 감사 미달 시 세금 소급 추징", trend: "주의", icon: "ShieldAlert" },
        kpi5: { title: "IoT 실시간 무결성 인증", value: "LTV 극대화", desc: "은행 담보 70% 이상 초저금리 확보", trend: "기회", icon: "DollarSign" },
        kpi6: { title: "투 트랙(Bi-Node) 거점", value: "TH-VN 연계", desc: "베트남(가공/수출) - 태국(RDC 허브)", trend: "전략", icon: "Globe" },
      },
      widgets: [
        {
          id: 'w01',
          title: '냉동창고 구역별 수익성 지수 및 입주율 전망',
          subtitle: 'NotebookLM 인사이트 기반 · 일반/냉장/냉동/BTS 4구역 비교',
          chartType: 'Composed',
          xKey: 'zone',
          bars: [{key: '수익성_지수', color: '#38bdf8'}],
          lines: [{key: '예상_입주율', color: 'var(--color-warning)', yAxisId: 'right'}],
          dualAxis: true,
          data: [{"zone":"일반 창고","수익성_지수":100,"예상_입주율":85},{"zone":"냉장 존","수익성_지수":180,"예상_입주율":90},{"zone":"냉동 존(-18°C)","수익성_지수":250,"예상_입주율":95},{"zone":"BTS 초저온","수익성_지수":450,"예상_입주율":98}],
          sit: <>일반 상온 창고(Dry/Ready-built)는 극단적 공급 과잉으로 2027년까지 입주율 85% 하락 및 레이스 투 더 바텀(Race-to-the-bottom)의 단가 경쟁 리스크에 직면. 반면, A급 맞춤형 초저온 인프라(BTS, -50°C 이하)는 수익성이 4배 이상 높으며 구조적 품귀 현상이 지속 중임.</>,
          strat: <>맹목적인 볼륨 확보 위주의 일반 상온 창고 투자는 전면 숏(Short) 포지션 구축. 향후 자본 배분은 메자닌 층을 활용한 수직적 공간 최적화(Vertical Optimization) 및 다양한 정밀 온도 구역(Multi-temp Zone)을 제공하는 하이엔드 냉동 인프라에 집중하여, 압도적 임대 프리미엄 및 장기 수익성을 창출할 것.</>,
          source: 'NotebookLM 아세안 냉동창고 인사이트 (2026)',
          unit: '지수 / %'
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
          strat: <>국내 시장의 밸류에이션 붕괴 및 유동성 위기를 역이용하여, 독보적 기술력(LNG 냉열 쿨링 등)을 보유한 국내 한계 기업을 대상으로 Distressed M&A 및 핵심 자산 스핀오프(Spinoff) 딜소싱을 적극 타진할 것. 이를 아세안 확장 시 기술적 해자로 활용하여 밸류업(Value-up)을 도모.</>,
          source: 'DART 2024년 사업보고서 및 연결재무제표',
          unit: '10억원'
        },
        {
          id: 'w04',
          title: '현지 금융권 재고 품목별 담보인정비율 변화',
          subtitle: 'NotebookLM 분석 · 냉동수산물/축산/곡물/과일 4품목',
          chartType: 'Bar',
          xKey: 'scenario',
          bars: [{key: '일반_담보가치', color: '#64748b'}, {key: 'IoT_증명_담보가치', color: 'var(--color-success)'}],
          data: [{"scenario":"참치 재고","일반_담보가치":60,"IoT_증명_담보가치":90},{"scenario":"육계 재고","일반_담보가치":55,"IoT_증명_담보가치":85},{"scenario":"수산 가공품","일반_담보가치":50,"IoT_증명_담보가치":80}],
          sit: <>태국 BOI 면세 혜택 이면에는 까다로운 기술 이전 의무와 연간 감사라는 롱테일 리스크가 잠재. 또한 현지 금융권은 수산물(참치 등) 재고 담보 대출 시, 극심한 가격 변동성과 부패 위험을 이유로 20~40%에 달하는 페널티 성격의 헤어컷(Haircut)을 부과하고 있음.</>,
          strat: <>화물 보관을 넘어, 블록체인 기반 실시간 온습도 추적 시스템(IoT)으로 현지 은행에 완벽한 재고 무결성(Inventory Integrity)을 증명할 것. 이를 통해 담보인정비율(LTV)을 최대 90%까지 끌어올려, 원가 하락 시 즉각적인 전략적 비축(Inventory Financing)에 나서는 금융 레버리지를 극대화.</>,
          source: 'NotebookLM 태국 금융 및 규제 환경 분석 (2026)',
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
          sit: <>베트남은 태국 대비 전력료와 인건비(지수 38 vs 100)가 압도적으로 저렴하나 통관 및 전력망 불안정 리스크에 노출. 반면 태국은 운영비(OPEX)는 높지만 아세안 물류 허브로서의 통제력과 전문 인프라를 보유, 구조적 프리미엄을 향유 중임.</>,
          strat: <>단일 국가 집중 리스크를 분산하기 위해, 태국을 고부가가치 참치 재고의 컨트롤 타워(RDC)로 지정하고, 베트남은 저비용 1차 가공 및 단기 B2B 수출 기지로 이원화하는 투 트랙(Bi-Node) 운영 시나리오를 가동할 것. 이를 통해 지정학적 리스크를 헷징하고 공급망 유연성을 확보.</>,
          source: '태국 PEA / 베트남 EVN 실측 데이터 분석',
          unit: '수치'
        },
        {
          id: 'w06',
          title: '자동화 대비 패시브 쿨링 리스크 노출도',
          subtitle: 'NotebookLM 분석 · 7개 리스크 축 레이더 비교',
          chartType: 'Radar',
          xKey: '리스크_유형',
          radars: [{name: '자동화', key: '자동화', color: '#f43f5e'}, {name: '패시브', key: '패시브', color: '#38bdf8'}],
          data: [{"리스크_유형":"기술자 구인난","자동화":95,"패시브":30},{"리스크_유형":"전력망 장애","자동화":90,"패시브":20},{"리스크_유형":"SW 결함","자동화":85,"패시브":15},{"리스크_유형":"사일런트 부패","자동화":80,"패시브":10}],
          sit: <>태국 내 Category II 암모니아 냉매 인증 기술자는 420명에 불과하며, 막대한 자본을 투입한 AS/RS 무인 스마트 창고도 전력망 마비 시 재고 전량 부패라는 극단적 테일 리스크(Tail Risk)에 노출되어 있음. \'420명의 저주\'로 인한 수복 지연 병목이 실재함.</>,
          strat: <>맹목적인 첨단 제어 시스템(100% Active) 의존도를 탈피하고, 정전 시에도 자체 온도를 -20°C 이하로 유지하는 상변화물질(PCM) 기반 패시브 쿨링(Passive Cooling) 기술을 로우테크(Low-tech) 헷징 장치로 설계에 필수 편입할 것. 이는 보험료(Premium) 인하 및 재무 건전성 방어의 핵심.</>,
          source: 'NotebookLM 설비 자동화 리스크 분석 (2026)',
          unit: '위험도 (0-100)'
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
          unit: '만 바트'
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
          bars: [{key: 'Cap_Rate', color: 'var(--color-success)'}],
          data: [{"propertyType":"노후 상온","Cap_Rate":7.5},{"propertyType":"A급 상온","Cap_Rate":6.0},{"propertyType":"일반 냉동","Cap_Rate":5.2},{"propertyType":"BTS 초저온","Cap_Rate":4.0}],
          sit: <>아세안 물류 부동산 시장 내 일반 상온 창고(Dry)의 Cap Rate는 상승(가치 하락) 중이나, 우량 화주와 장기 임대차(Master Lease)가 체결된 초저온 창고는 Cap Rate 4%대까지 하락하며 글로벌 기관 투자자(LP)들의 매수 1순위 자산으로 부상 중임.</>,
          strat: <>단순 물류 운영 수익(OpEx)에 안주하지 말고, 완공 후 5년 내 우량 화주(당사 등)와의 10년 장기 임대차 계약을 기반으로 싱가포르 등 글로벌 리츠(REITs)에 최고가로 매각하는 자본 차익(Capital Gain) 중심의 엑시트(Exit) 플랜을 병행 추진할 것.</>,
          source: '아세안 산업용 부동산 기관 리포트 (2025)',
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
          sit: '베트남 콜드체인 시장은 글로벌 최고 수준인 CAGR 12.4% 성장 중(2024년 1.3M → 2028년 1.7M 팔레트 전망)이나, 인프라 미충족률이 80%에 육박함. 향후 3~5년이 초과 수익(Alpha)을 창출할 수 있는 진입의 절대적 골든 윈도우임.',
          strat: '베트남 남부 핵심 물류 노드(HCMC·Long An)에 IQF 수산 특화 시설(5,000~15,000 팔레트) 중심의 그린필드(Greenfield) 투자를 공격적으로 집행. 외국인 100% 지분 구조와 우량 앵커 임차(Hung Vuong 등) 확보를 통해 36~48개월 내 BEP 달성 및 ROIC 20~30% 타겟팅.',
          source: 'GCCA Global Report + Ken Research Vietnam 2025 + Trade.gov',
          unit: 'K팔레트 / %'
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
          strat: '입출고 라인에 MAP 포장 및 AI 선도 판별 시스템을 선제 도입하여 화주 락인(Lock-in) 효과를 극대화할 것. 단순 보관료 경쟁에서 벗어나 품질 보증형(Quality Assurance) 서비스 모델로 퀀텀 점프하여, 업계 평균 대비 30~50%의 보관료 프리미엄(Price Premium)을 수취.',
          source: 'KFAS 한국수산과학회지 논문 8편 종합 분석',
          unit: '₩/톤'
        },
        {
          id: 'n03',
          title: '단일 거점 대비 이원화 시나리오 수익성 비교',
          subtitle: 'Phase 3 전략 · 단일/태국/베트남/Bi-Node 4시나리오',
          chartType: 'Composed',
          xKey: '시나리오',
          bars: [{key: '5년_NPV', color: '#38bdf8'}, {key: '투자액', color: '#64748b'}],
          lines: [{key: 'ROIC', color: '#f43f5e', yAxisId: 'right'}],
          dualAxis: true,
          data: [{"시나리오":"태국 단일","5년_NPV":850,"투자액":800,"ROIC":15},{"시나리오":"베트남 단일","5년_NPV":1200,"투자액":500,"ROIC":25},{"시나리오":"Bi-Node 이원화","5년_NPV":2100,"투자액":1300,"ROIC":22},{"시나리오":"3국 통합","5년_NPV":3500,"투자액":2000,"ROIC":18}],
          sit: '태국(RDC 허브)과 베트남(가공·수출 기지)을 연계한 Bi-Node 이원화 전략은 단일 거점 대비 5년 NPV 추정치가 75% 이상 높게 도출됨. 태국의 전력망 안정성 및 BOI 인센티브, 베트남의 원가 경쟁력이 완벽한 상호 보완재(Complementary Goods)로 작용함.',
          strat: '총 가용 자본 1,300억 원 상회 시 Bi-Node 전략을 최우선 가동. 자본 500억 원 하회 시 단기 ROIC(25%)가 우수한 베트남 그린필드 투자로 링펜싱(Ring-fencing). 장기적으로 3국 통합 운영(2,000억 원 규모)으로 스케일업(Scale-up)하여 아세안 수산 물류 헤게모니를 독점할 것.',
          source: 'Phase 3 Entry Strategy 시나리오 분석 (2026)',
          unit: '억원 / %'
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
          unit: '% (K값)'
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
          unit: '민감도 (점)'
        },
        {
          id: 'k03',
          title: '가스치환 포장 적용 생굴의 미생물 총균수 변화',
          subtitle: 'KFAS 논문 기반 · MAP+레몬 추출물 복합 처리',
          chartType: 'Composed',
          xKey: '저장일',
          lines: [{key: 'MAP_레몬', color: '#10b981'}, {key: '대조군', color: '#64748b'}],
          data: [{"저장일":"0일","MAP_레몬":3.2,"대조군":3.2},{"저장일":"3일","MAP_레몬":3.5,"대조군":5.1},{"저장일":"7일","MAP_레몬":4.2,"대조군":7.8},{"저장일":"10일","MAP_레몬":5.0,"대조군":8.5},{"저장일":"14일","MAP_레몬":5.8,"대조군":9.2}],
          sit: '생굴에 MAP(CO₂ 50%/N₂ 50%) 및 레몬 추출물을 복합 처리 시, 7일 차 총균수가 99.99% 억제(4.2 log)되며 기존 유통기한(3~5일)을 14일로 무려 3배 연장하는 파괴적 혁신을 입증(KFAS 데이터).',
          strat: 'MAP 포장 기술을 하이엔드 횟감(생굴, 생참치 등)에 즉각 적용. 창고 내 가스치환포장 설비(In-house MAP Line)를 구축해 독보적 부가 서비스를 제공함으로써, 타사로의 이탈을 막는 절대적 해자(Moat)를 형성하고 톤당 수수료 마진을 극대화할 것.',
          source: 'KFAS 한국수산과학회지 — MAP+레몬 추출물 생굴 품질 특성',
          unit: 'log CFU/g'
        },
        {
          id: 'k04',
          title: '냉동 전복 위해요소 검출 수준 및 안전성',
          subtitle: 'KFAS 논문 기반 · 중금속/미생물/패독 3항목',
          chartType: 'Bar',
          xKey: '항목',
          bars: [{key: '기준치', color: '#64748b'}, {key: '검출값', color: '#38bdf8'}],
          data: [{"항목":"납 (mg/kg)","검출값":0.02,"기준치":2.0},{"항목":"카드미움","검출값":0.15,"기준치":2.0},{"항목":"수은","검출값":0.01,"기준치":0.5},{"항목":"세균 (log)","검출값":2.8,"기준치":5.0}],
          sit: '유통 냉동 전복 실사 결과 중금속 및 미생물 등 위해요소는 식품공전 기준을 100% 하회하여 적합. 그러나 해동 후 재냉동 시 발생하는 드립(Drip) 증가 및 텍스처(Texture) 열화 현상이 상품성을 훼손하는 최대 밸류 디스트로이어(Value Destroyer)임.',
          strat: '해당 무결성 데이터를 기반으로 당사 보관 수산물에 대한 \'안전성 프리미엄 인증서\' 발급 비즈니스를 신설. 특히 대(對) 일본·EU 수출 물량에 대해 건당 프리미엄 수수료를 과금(Monetization)하여 단순 임대업을 초월한 인증 비즈니스로 수익 파이프라인을 다각화.',
          source: 'KFAS 한국수산과학회지 57(3), 2024 — 냉동전복 위해요소분석 및 안전성 평가',
          unit: 'mg/kg · log'
        },
        {
          id: 'k05',
          title: '초분광 모델 대비 관능검사 신선도 판별 정확도',
          subtitle: 'KFAS 논문 기반 · 딥러닝 초분광 vs 기존 관능',
          chartType: 'Bar',
          xKey: '등급',
          bars: [{key: '정확도', color: '#38bdf8'}, {key: '기존방식', color: '#64748b'}],
          data: [{"등급":"신선 (A)","정확도":96,"기존방식":78},{"등급":"보통 (B)","정확도":91,"기존방식":65},{"등급":"저하 (C)","정확도":93,"기존방식":72}],
          sit: '초분광 영상(400~1000nm) 및 딥러닝 기반 선도 판별 모델은 평균 정확도 93.2%를 기록, 숙련 검사원의 관능검사(71.7%)를 압도함. 비파괴 방식으로 초당 5마리 이상 실시간 팩터링이 가능한 압도적 처리량(Throughput)을 입증.',
          strat: '물류센터 게이트(Gate)에 AI 초분광 선도 스캐너를 전면 도입. 입고 시 불량 원물을 시스템 단위에서 100% 컷오프(Cut-off)하고, 출고 시 선도 등급별 오토 프라이싱(Auto-pricing)을 연동. 이를 통해 \'AI 퀄리티 개런티\' 명목으로 타사 대비 20~30% 프리미엄 단가를 징수할 것.',
          source: 'KFAS 한국수산과학회지 — 초분광 영상 기반 고등어 신선도 등급 분류 및 판정',
          unit: '% (정확도)'
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
          sit: '동결건조(HMR) 수산 블록은 -20°C에서 36개월, 25°C 상온에서도 무려 14개월의 장기 유통이 가능(KFAS 실증). 고온 노출 시 TBA(지방산화) 급증 리스크만 통제하면 콜드체인 운영비(OPEX)를 80% 이상 혁신적으로 절감할 수 있는 게임 체인저(Game Changer)임.',
          strat: '동결건조 HMR 포트폴리오를 대폭 확대하여 비싼 냉동창고 캡(Cap)을 비우고 상온 창고로 재고를 이전(Shift). 이를 화주들에게 \'콜드체인 비용 절감 컨설팅\'으로 패키징하여 제공함으로써 물류 효율(Efficiency)의 한계를 돌파하고 마진 스프레드를 확대할 것.',
          source: 'KFAS 한국수산과학회지 55(4), 2022 — 동결건조 블록 품질 변화 및 유통기한 추정',
          unit: '개월 / mg·kg⁻¹'
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
          strat: '화주들에게 \'해동 후 14일 품질 개런티(Guarantee)\' 밸류-애드(Value-add) 서비스를 제안. 수리미 가공 파트너사들의 재고 회전(Inventory Turnover) 압박을 해소해주며 당사 물류 센터로의 종속성(Lock-in)을 강화, 장기 임대차 계약의 지렛대로 적극 활용할 것.',
          source: 'KFAS 한국수산과학회지 — 카라기난 첨가 수리미의 냉장 저장 중 특성 변화',
          unit: 'gf (겔강도)'
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
          unit: '% / 지수'
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
    
    if (!d || !Array.isArray(d) || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>No Data</div>;

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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatXAxis} minTickGap={20} />
            <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize:'11px'}} />
            {widget.bars?.map((b: any, i: number) => (
              <Bar key={i} dataKey={b.key} fill={b.color} radius={[6,6,0,0]} fillOpacity={0.85} />
            ))}
          </BarChart>
        );
      case "composed":
        return (
          <ComposedChart data={d}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatXAxis} minTickGap={20} />
            <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            {widget.dualAxis && (
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            )}
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize:'11px'}} />
            {widget.bars?.map((b: any, i: number) => (
              <Bar key={i} yAxisId={b.yAxisId || "left"} dataKey={b.key} fill={b.color} radius={[6,6,0,0]} fillOpacity={0.85} />
            ))}
            {widget.lines?.map((l: any, i: number) => (
              <Line key={i} yAxisId={l.yAxisId || "left"} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={{r:4}} activeDot={{r:6}} />
            ))}
          </ComposedChart>
        );
      case "radar":
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={d}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey={widget.xKey} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatXAxis} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize:'11px'}} />
            {widget.radars?.map((r: any, i: number) => (
              <Radar key={i} name={r.name} dataKey={r.key} stroke={r.color} fill={r.color} fillOpacity={0.4} />
            ))}
          </RadarChart>
        );
      default:
        return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>Unsupported Chart: {widget.chartType}</div>;
    }
  };

  const renderWidgetCard = (w: any) => {
    const IconComp = WIDGET_ICONS[w.id] || Factory;
    const accentColor = '#38bdf8';
    
    return (
      <div key={w.id} className={`${styles.glassCard} ds-card`} style={{display: 'flex', flexDirection: 'column', minHeight: '600px',
        background: 'rgba(24, 24, 24, 0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', border: '1px solid rgba(255,255,255,0.05)',
        padding: '1.5rem'}}>
        
        {/* Card Header */}
        <div style={{ position: 'relative', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
              <IconComp size={20} color={accentColor} />
              {w.title || 'Data Widget'}
            </h3>
            {w.subtitle && (
              <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {w.subtitle}
              </p>
            )}
          </div>
          <TelemetryBadge status={w.telemetry || (w.isLiveApi ? 'live' : 'static')} syncDate={w.syncDate || '2026.05.15'} />
        </div>

        {/* Chart Area */}
        <div style={{ height: '375px', width: '100%', marginBottom: '1.5rem', position: 'relative', zIndex: 0 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            {renderChart(w)}
          </SafeResponsiveContainer>
        </div>

        {/* Takeaway Box component replaces manually coded HTML */}
        {(w.sit || w.strat) && (
          <TakeawayBox situation={w.sit} actionPlan={w.strat} source={w.source} />
        )}
      </div>
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

      {/* Educational Guide */}
      <div style={{ marginBottom: '2rem', background: '#181818', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div 
          onClick={() => setIsEduOpen(!isEduOpen)}
          style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: isEduOpen ? 'rgba(56, 189, 248, 0.05)' : 'transparent', transition: 'all 0.2s ease' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              background: 'rgba(56, 189, 248, 0.2)', padding: '0.5rem', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BookOpen size={20} color="#38bdf8" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                신입사원 가이드 및 AI 전략 어시스턴트
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                냉동창고 글로벌 인프라 진입 전략 및 핵심 역학 가이드
              </p>
            </div>
          </div>
          <div>
            {isEduOpen ? <ChevronUp size={24} color="#94a3b8" /> : <ChevronDown size={24} color="#94a3b8" />}
          </div>
        </div>

        {isEduOpen && (
          <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
              
              <div style={{ background: 'var(--surface-3)', borderRadius: '10px', padding: '1.2rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Snowflake size={16} color="#38bdf8" /> 냉동창고 시장 핵심 역학
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.8 }}>
                  <li><strong>신흥국 인프라 확충:</strong> 베트남(12.4% 성장) 및 태국(BOI 8년 면세) 중심의 콜드체인 수요 폭증.</li>
                  <li><strong>에너지 최적화:</strong> 심야(Off-peak) 전력 사용 시 태국 기준 최대 40% 비용 절감 (TOU Rate).</li>
                  <li><strong>초저온 고수익성:</strong> 상온 보관 대비 초저온(-25°C) 존의 수익성이 2~3배 높음.</li>
                  <li><strong>규제 준수 리스크:</strong> FDA 승인, Ror.Ngor.4 면허, 암모니아 예지 보전 등 고강도 규제 선결 필요.</li>
                </ul>
              </div>

              <div style={{ background: 'var(--surface-3)', borderRadius: '10px', padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '50px', height: '50px', background: 'var(--bg-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <MessageSquare size={24} color="#38bdf8" />
                </div>
                <h3 style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                  냉동창고 전략 어시스턴트
                </h3>
                <a 
                  href="https://notebooklm.google.com/notebook/bf3298f5-ce9c-4975-ab79-c58ca10ad84a"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'var(--bg-color)',
                    color: '#e2e8f0',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    border: '1px solid #334155'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#38bdf8'; e.currentTarget.style.color = 'var(--bg-color)'; e.currentTarget.style.borderColor = '#38bdf8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-color)'; e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.borderColor = '#334155'; }}
                >
                  <MessageSquare size={16} />
                  NotebookLM AI 챗봇 열기
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

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

      {/* Widgets Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Activity size={24} color="#38bdf8" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>1. 입고 및 수급</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets.filter((w: any) => ['w01', 'w03', 'n01'].includes(w.id)).map(renderWidgetCard)}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <ShieldAlert size={24} color="var(--color-danger)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>2. 보관 및 가동률</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets.filter((w: any) => ['w02', 'w04'].includes(w.id)).map(renderWidgetCard)}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Globe size={24} color="var(--color-warning)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>3. 물류 및 통관 인프라</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets.filter((w: any) => ['w05', 'w06', 'n03'].includes(w.id)).map(renderWidgetCard)}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <TrendingUp size={24} color="#8b5cf6" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>4. 수익성 및 투자 전략</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets.filter((w: any) => ['w07', 'w08', 'w09', 'n02'].includes(w.id)).map(renderWidgetCard)}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Snowflake size={24} color="#06b6d4" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>5. 에너지 최적화 및 품질과학</h2>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(6, 182, 212, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>한국수산과학회지 KFAS 논문 8편 기반</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets.filter((w: any) => ['k01', 'k02', 'k03', 'k04', 'k05', 'k06', 'k07', 'k08'].includes(w.id)).map(renderWidgetCard)}
          </div>
        </section>

      </div>
    </div>
  );
}

