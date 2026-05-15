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
  w07: Zap, w08: ShieldCheck, w09: TrendingUp,
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
          // data is fetched
          data: [],
          sit: <>일반 창고(Ready-built)는 공급 과잉으로 2027년까지 입주율이 85%로 하락하며 심각한 단가 경쟁(Race to the bottom)에 빠질 위험이 큼. 반면 진정한 품귀 현상을 겪고 있는 것은 수익성이 4배 이상 높은 A급 맞춤형 초저온 창고인 <TermTooltip term="BTS" description="Build-to-Suit. 화주의 특수한 요구사항(온도, 설비, 동선)에 맞춰 설계부터 시공까지 전담하여 제공하는 프리미엄 맞춤형 물류센터." />임.</>,
          strat: <>맹목적인 볼륨 확보 위주의 일반 창고 투자는 전면 백지화. 향후 투자는 메자닌 층을 활용한 수직적 공간 최적화(Vertical Optimization)와 다양한 정밀 온도 구역(Multi-temp Zone)을 제공하는 하이엔드 냉동 설비에 자본을 집중하여 압도적 임대 프리미엄을 창출할 것.</>,
          source: 'NotebookLM 아세안 냉동창고 인사이트 (2026)',
          unit: '지수 / %'
        },
        {
          id: 'w02',
          // data is fetched
          data: [],
          sit: <>한국의 산업용 냉동기 수출은 지속적인 무역 흑자를 기록 중인 반면, 급속도로 인프라를 확장 중인 베트남(-$112M)과 태국(-$67M)은 기술 부족으로 인한 만성적 설비 수입 적자 상태임. 특히 <TermTooltip term="HS Code 841869" description="산업용/상업용 냉동·냉장 설비(응축기, 압축기, 증발기 등 콜드체인 핵심 설비)를 분류하는 국제 통일상품분류체계 코드." /> 품목에 대한 아세안의 해외 의존도가 극심함.</>,
          strat: <>한국산 선진 냉동 장비 조달망과 신라교역의 인프라 운영 노하우를 결합한 '패키지형(Turn-key)' 진출 전략 구사. 단순 보관업을 넘어선 고효율 콜드체인 설계 및 기술 지원을 무기로 현지 로컬 보관업체 대비 확고한 진입 장벽 및 차별성을 구축할 것.</>,
          source: 'OEC 무역 통계 (HS 841869 데이터)',
          unit: '$M'
        },
        {
          id: 'w03',
          // data is fetched
          data: [],
          sit: <>국내 시장은 오버서플라이로 인해 LNG 냉열 기술을 보유한 핵심 기업조차 심각한 영업손실을 기록 중인 매수자 우위(Buyer's Market) 환경임. 반면 글로벌 아세안 콜드체인 사업자들은 인프라 부족을 바탕으로 견고한 흑자 구조를 유지하고 있음.</>,
          strat: <>국내의 극단적인 과잉 공급 및 유동성 위기 환경을 역이용하여, 첨단 기술력(LNG 냉열 등)을 보유한 국내 한계 기업을 대상으로 한 <TermTooltip term="Distressed M&A" description="재무적 어려움에 처한 부실 기업이나 자산을 저가에 인수합병하여 가치를 정상화시킨 후 수익을 극대화하는 투자 기법." /> 딜소싱을 적극 타진. 이를 기반으로 아세안 확장 시 기술적 우위를 점할 것.</>,
          source: 'DART 2024년 사업보고서 및 연결재무제표',
          unit: '10억원'
        },
        {
          id: 'w04',
          // data is fetched
          data: [],
          sit: <>태국 정부의 파격적인 <TermTooltip term="BOI" description="태국 투자청(Board of Investment). 외국인 직접투자를 유치하기 위해 최대 8~13년의 법인세 면제, 토지 소유권 허용 등의 파격적인 혜택을 제공하는 기관." /> 면세 혜택 이면에는 까다로운 기술 이전과 연간 감사라는 숨겨진 청구서가 존재함. 또한 현지 금융권은 참치 등 수산물 재고 담보 시 가격 변동성과 부패 위험을 이유로 20~40%의 막대한 가치 할인(Haircut)을 적용하고 있음.</>,
          strat: <>단순 화물 보관을 넘어, 블록체인 및 IoT 기반 실시간 온도/습도 추적 시스템으로 현지 은행에 완벽한 '재고 무결성(Inventory integrity)'을 증명할 것. 이를 통해 은행 담보인정비율(<TermTooltip term="LTV" description="Loan to Value ratio. 자산의 담보 가치 대비 대출 가능 한도 비율. LTV가 높을수록 더 많은 자금을 조달할 수 있음." />)을 최대 90%까지 끌어올려 참치 원가 하락 시 즉각적인 전략적 비축 자금(Inventory Financing)으로 활용하는 금융 레버리지를 구축할 것.</>,
          source: 'NotebookLM 태국 금융 및 규제 환경 분석 (2026)',
          unit: '%'
        },
        {
          id: 'w05',
          // data is fetched
          data: [],
          sit: <>베트남은 태국 대비 전력료와 인건비(지수 38 vs 100)가 압도적으로 저렴하나, 인프라 불안정과 통관 규제 리스크가 존재함. 반면 태국은 운영비는 높으나 카테고리별 전문 인프라와 강력한 물류 통제 역량을 갖춘 글로벌 물류 허브 역할을 수행함.</>,
          strat: <>단일 국가 거점의 리스크를 분산하기 위해, 태국을 고부가가치 참치 재고의 컨트롤 타워 및 아세안 유통 허브(<TermTooltip term="RDC" description="Regional Distribution Center. 특정 권역 내의 물류를 통합적으로 수용, 보관 및 배송하는 권역별 중앙 물류 센터." />)로 지정하고, 베트남은 저비용 1차 가공 및 B2B 수출 기지로 이원화하는 <TermTooltip term="Bi-Node" description="두 개의 상이한 거점(Node)을 상호 보완적으로 운영하여 리스크를 헷징하고 공급망 유연성을 극대화하는 투 트랙 물류 전략." /> 시나리오를 본격 가동할 것.</>,
          source: '태국 PEA / 베트남 EVN 실측 데이터 분석',
          unit: '수치'
        },
        {
          id: 'w06',
          // data is fetched
          data: [],
          sit: <>태국 내 <TermTooltip term="Category II" description="태국 위험 물질 법(Hazardous Substances Act)에 따라 암모니아 등 산업용 냉매를 취급·관리하기 위해 필수적으로 요구되는 국가 공인 특수 안전 면허 등급." /> 암모니아 냉각 시스템 인증 기술자는 단 420명에 불과함. 막대한 자본이 투입된 <TermTooltip term="AS/RS" description="Automated Storage and Retrieval System. 로봇 크레인과 셔틀을 이용해 화물을 자동으로 입출고하는 최첨단 무인 자동화 창고 시스템." /> 스마트 무인 창고가 정전이나 시스템 고장 시 수복 지연으로 수백억 원의 재고가 부패하는 치명적 병목('420명의 저주')이 실재함.</>,
          strat: <>시스템 리스크를 방어하기 위해 첨단 제어 시스템에만 100% 의존하는 설계를 탈피. 정전 시에도 전력 없이 며칠간 창고 내부 온도를 -20°C 이하로 자체 유지하는 상변화물질(<TermTooltip term="PCM" description="Phase Change Material. 특정 온도에서 고체에서 액체로 변하면서 주변의 열을 대량으로 흡수하거나 방출하여 전력 공급 없이도 일정 온도를 유지시키는 첨단 열에너지 저장 물질." />) 기반 '패시브 쿨링' 기술을 로우테크(Low-tech) 헷징 장치로 설계에 필수적으로 반영할 것.</>,
          source: 'NotebookLM 설비 자동화 리스크 분석 (2026)',
          unit: '위험도 (0-100)'
        },
        {
          id: 'w07',
          // data is fetched
          data: [],
          sit: <>태국 등 아세안 국가의 산업용 시간대별 요금제(<TermTooltip term="TOU Rate" description="Time-of-Use Rate. 시간대별로 전력 요금을 다르게 부과하는 제도. 태국의 경우 주간(Peak) 요금이 심야(Off-peak) 요금보다 약 1.8~2배 가량 비쌈." />) 하에서 주간 전력료는 심야 대비 1.8배 비쌈. 일반 냉각 시스템을 주간에 가동하면 영업이익률이 급락함.</>,
          strat: <>전력료가 저렴한 심야 시간에 집중적으로 얼음을 얼려두고 주간에 이 냉기를 방출하는 <TermTooltip term="빙축열 시스템" description="Ice Thermal Storage. 값이 싼 심야 전력을 이용해 얼음을 만들어 저장해 두었다가 전력 소비가 많고 요금이 비싼 낮 시간에 얼음을 녹여 냉방/냉각에 활용하는 시스템." />을 도입할 것. 연간 전력 비용을 40% 이상 구조적으로 절감하여 인플레이션을 방어해야 함.</>,
          source: '태국 전력청(PEA) TOU 요금 체계 모델링',
          unit: '만 바트'
        },
        {
          id: 'w08',
          // data is fetched
          data: [],
          sit: <><TermTooltip term="지구온난화지수(GWP)" description="Global Warming Potential. 이산화탄소 1kg과 비교하여 특정 온실가스가 지구 온난화에 미치는 영향을 나타내는 지수. 프레온계 냉매는 GWP가 수천 배에 달함." />가 높은 기존 프레온계(HFCs) 냉매의 글로벌 규제가 임박함. 기존 구형 창고를 인수할 경우 수년 내 막대한 환경 부담금 및 냉매 교체 비용 폭탄을 맞을 수 있음.</>,
          strat: <>M&A 실사 시 반드시 기존 설비의 냉매 종류를 확인하고, 자연 냉매(암모니아/CO2 2원 냉동기 등)로 선제적 전환을 완료한 친환경 인프라만 프리미엄을 부여하여 인수할 것. 장기적으로 <TermTooltip term="탄소배출권" description="Carbon Credit. 온실가스를 배출할 수 있는 권리. 친환경 설비로 배출량을 줄이면 잉여 배출권을 시장에 판매하여 수익을 창출할 수 있음." /> 수익화와 연계.</>,
          source: '키갈리 개정안(Kigali Amendment) 페이즈다운 일정',
          unit: '$M'
        },
        {
          id: 'w09',
          // data is fetched
          data: [],
          sit: <>아세안 물류 부동산 시장에서 공급이 초과된 일반 상온 창고의 가치는 하락세이나, 장기 임대차(<TermTooltip term="Master Lease" description="건물 전체를 한 임차인(보통 우량 기업)에게 장기간 통째로 임대하는 계약. 현금흐름의 안정성이 매우 높아 자산 매각 시 프리미엄이 붙음." />)가 체결된 초저온 창고는 기관 투자자들의 매수 1순위임. <TermTooltip term="Cap Rate" description="Capitalization Rate(자본환원율). 부동산의 순영업소득(NOI)을 매각 가치로 나눈 비율. Cap Rate가 낮을수록 부동산 가치(매각가)가 높게 평가됨." />가 4%대까지 하락함.</>,
          strat: <>단순 운영 수익(OpEx)에 만족하지 말고, 완공 후 5년 내 우량 화주(신라교역 본사 등)와의 10년 장기 임대 계약을 지렛대로 삼아 싱가포르 등 글로벌 <TermTooltip term="REITs" description="Real Estate Investment Trusts(부동산 투자 회사). 다수의 투자자로부터 자금을 모아 부동산에 투자하고 수익을 배당하는 금융 상품." />에 고가 매각하는 자본 차익(Capital Gain) 엑시트 플랜을 병행할 것.</>,
          source: '아세안 산업용 부동산 기관 리포트 (2025)',
          unit: '%'
        },
        {
          id: 'k01',
          // data is fetched
          data: [],
          sit: 'KFAS 연구에서 시판 보냉팩 개수(0~4개)에 따른 진공포장 냉동 넙치·고등어 필렛의 상온유통 중 K값 변화를 추적한 결과, 보냉팩 3개 이상 시 12시간까지 선도 안전 구간(K값 <30%)을 유지합니다. 고등어는 넙치 대비 K값 상승 속도가 1.6배 빨라 지방 산화가 선도 열화의 핵심 요인입니다.',
          strat: '콜드체인 라스트마일 배송 시 보냉팩 3개+스티로폼 이중포장을 최소 표준으로 설정하면, 12시간 배송 안전 구간을 확보합니다. 특히 지방 함량 높은 고등어·연어류는 보냉팩 4개+진공포장을 필수화하여 반품률을 50% 이상 절감할 수 있습니다.',
          source: 'KFAS 한국수산과학회지 — 시판 보냉팩 개수별 냉동 수산물 선도유지능 비교평가',
          unit: '% (K값)'
        },
        {
          id: 'k02',
          // data is fetched
          data: [],
          sit: 'KFAS 연구에서 보냉팩+스티로폼 상온유통 조건 하에서 넙치와 고등어의 4대 선도지표를 비교한 결과, 넙치는 K값이 가장 민감한 선도지표(92점)이고, 고등어는 VBN(95점)과 히스타민(90점)이 더 효과적인 판별 지표입니다. 이는 어종별로 최적 선도검사 프로토콜이 달라야 함을 실증합니다.',
          strat: '냉동창고 입출고 품질관리(QC) 프로토콜을 어종별로 차별화해야 합니다. 백색육(넙치류)은 K값 신속검사키트, 적색육(고등어·참치)은 VBN+히스타민 듀얼 검사를 표준화하면, 검사 비용 30% 절감과 동시에 판별 정확도를 95% 이상 확보할 수 있습니다.',
          source: 'KFAS 한국수산과학회지 — 시판 보냉팩 및 스티로폼 박스 상온유통 시 수산물 선도지표 설정',
          unit: '민감도 (점)'
        },
        {
          id: 'k03',
          // data is fetched
          data: [],
          sit: 'KFAS 연구에서 생굴에 기체치환포장(MAP: CO₂ 50%/N₂ 50%) + 레몬 추출물을 적용한 결과, 7일째 총균수가 대조군(7.8 log) 대비 4.2 log로 99.99% 억제되었습니다. 관능평가에서도 14일째까지 식용 가능 수준을 유지하여, 기존 3~5일 유통기한을 14일로 3배 연장했습니다.',
          strat: 'MAP 포장 기술은 생굴 외에도 고부가 수산물(회, 초밥용 횟감)의 유통기한을 혁신적으로 연장합니다. 냉동창고 내 MAP 포장 라인을 부가 서비스로 제공하면 화주의 Lock-in을 강화하고, 포장 부가가치 수수료로 톤당 ₩50,000~80,000 추가 수익을 창출할 수 있습니다.',
          source: 'KFAS 한국수산과학회지 — MAP+레몬 추출물 생굴 품질 특성',
          unit: 'log CFU/g'
        },
        {
          id: 'k04',
          // data is fetched
          data: [],
          sit: 'KFAS 2024년 연구에서 유통 중인 양식산 냉동전복 15건을 대상으로 중금속(납·카드뮴·수은) 및 미생물 위해요소를 분석한 결과, 전 항목에서 식품공전 기준을 크게 밑돌아 100% 적합 판정을 받았습니다. 다만 해동 후 재냉동 시 드립 증가 및 조직감 열화가 심각한 것으로 확인되었습니다.',
          strat: '냉동 전복의 안전성 데이터를 활용하여, 냉동창고 보관 수산물의 "안전성 인증서(Certificate of Safety)"를 발급하는 부가 서비스를 도입하면 화주 신뢰도를 높이고 프리미엄 보관료를 정당화할 수 있습니다. 특히 일본·EU 수출용 수산물에 대한 인증 서비스는 건당 ₩100,000+ 수수료가 가능합니다.',
          source: 'KFAS 한국수산과학회지 57(3), 2024 — 냉동전복 위해요소분석 및 안전성 평가',
          unit: 'mg/kg · log'
        },
        {
          id: 'k05',
          // data is fetched
          data: [],
          sit: 'KFAS 연구에서 연속 초분광 영상(400~1000nm) 데이터를 딥러닝 모델에 학습시켜 고등어 선도를 A/B/C 3등급으로 자동 분류한 결과, 평균 93.2% 정확도를 달성했습니다. 기존 숙련 검사원의 관능검사(71.7%) 대비 21.5%p 높은 정확도이며, 비파괴·비접촉 방식으로 초당 5마리 이상 실시간 판별이 가능합니다.',
          strat: '냉동창고 입출고 게이트에 초분광 AI 선도판별 시스템을 설치하면, ① 입고 시 불량 원물 사전 차단, ② 출고 시 선도 등급별 자동 가격 책정이 가능합니다. 이를 통해 "선도 보증형 보관 서비스"라는 새로운 비즈니스 모델을 창출하여 일반 냉동창고 대비 20~30% 보관료 프리미엄을 확보할 수 있습니다.',
          source: 'KFAS 한국수산과학회지 — 초분광 영상 기반 고등어 신선도 등급 분류 및 판정',
          unit: '% (정확도)'
        },
        {
          id: 'k06',
          // data is fetched
          data: [],
          sit: 'KFAS 2022년 연구에서 동결건조 블록형 우럭 미역국의 5단계 저장온도별 품질 변화를 추적한 결과, -20°C에서 36개월 이상 안전하며 25°C 상온에서도 14개월 유통기한이 가능합니다. TBA(지방산화 지표)는 35°C에서 3.2 mg/kg으로 급증하여 고온 저장 시 지방 산화가 품질 열화의 주요 원인입니다.',
          strat: '동결건조 수산 HMR은 냉동창고의 "보관 공간 경쟁" 문제를 해결하는 전략 품목입니다. 상온 14개월 유통이 가능하므로, 냉동 보관 비용 없이 상온 창고에서 관리할 수 있어 콜드체인 비용을 80% 절감합니다. 이를 화주에게 "콜드체인 비용 최적화 컨설팅" 서비스로 제안하면 부가가치를 창출할 수 있습니다.',
          source: 'KFAS 한국수산과학회지 55(4), 2022 — 동결건조 블록 품질 변화 및 유통기한 추정',
          unit: '개월 / mg·kg⁻¹'
        },
        {
          id: 'k07',
          // data is fetched
          data: [],
          sit: 'KFAS 연구에서 수리미 혼합물에 이오타-카라기난 1%를 첨가하고 냉장(4°C) 저장한 결과, 14일 후에도 겔 강도가 초기 대비 85%를 유지한 반면, 무첨가 대조군은 37.6%로 급감했습니다. 이는 냉장 유통 수리미 제품(어묵, 맛살)의 유통기한을 기존 7일에서 14일로 2배 연장할 수 있는 기술입니다.',
          strat: '냉동창고에서 수리미 원료의 냉장 해동 후 품질 유지 기간이 2배 연장되면, 화주의 재고 회전 부담이 크게 감소합니다. "해동 후 품질 보증 14일" 서비스를 제공하면 수리미 가공업체의 냉동창고 이용률을 높이고 장기 계약 유인을 강화할 수 있습니다.',
          source: 'KFAS 한국수산과학회지 — 카라기난 첨가 수리미의 냉장 저장 중 특성 변화',
          unit: 'gf (겔강도)'
        },
        {
          id: 'k08',
          // data is fetched
          data: [],
          sit: 'KFAS 연구에서 동결 무지개송어육에 TGase(트랜스글루타미나아제) + 카파-카라기난을 복합 처리한 결과, 해동 드립률이 8.5%→4.7%로 45% 절감되고 겔 강도가 2.1배 향상되었습니다. 이는 냉동 수산물의 고질적 문제인 "해동 후 품질 저하"를 근본적으로 해결하는 기술로, 냉동창고 보관 기간이 길어져도 출고 시 품질을 보장합니다.',
          strat: '냉동창고에서 "동결 전 전처리(TGase+다당류 코팅) 서비스"를 제공하면, 해동 드립 절감에 따른 화주의 원가 손실(드립 1%p = kg당 ₩100~200 손실)을 방지할 수 있습니다. 이를 "품질 보증형 냉동 보관" 프리미엄 서비스로 브랜딩하여 차별화 가치를 창출할 것.',
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
                return { ...widget, data: json.data };
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
      <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Loading Cold Storage Strategy Intelligence...</p>
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
    const d = widget.data;
    if (!d || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>No Data</div>;

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

    switch(widget.chartType) {
      case "Bar":
        return (
          <BarChart data={d}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatXAxis} />
            <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {widget.bars?.map((b: any, i: number) => (
              <Bar key={i} dataKey={b.key} fill={b.color} radius={[6,6,0,0]} fillOpacity={0.85} />
            ))}
          </BarChart>
        );
      case "Composed":
        return (
          <ComposedChart data={d}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatXAxis} />
            <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            {widget.dualAxis && (
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            )}
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {widget.bars?.map((b: any, i: number) => (
              <Bar key={i} yAxisId={b.yAxisId || "left"} dataKey={b.key} fill={b.color} radius={[6,6,0,0]} fillOpacity={0.85} />
            ))}
            {widget.lines?.map((l: any, i: number) => (
              <Line key={i} yAxisId={l.yAxisId || "left"} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={{r:4}} activeDot={{r:6}} />
            ))}
          </ComposedChart>
        );
      case "Radar":
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={d}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey={widget.xKey} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatXAxis} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {widget.radars?.map((r: any, i: number) => (
              <Radar key={i} name={r.name} dataKey={r.key} stroke={r.color} fill={r.color} fillOpacity={0.4} />
            ))}
          </RadarChart>
        );
      default:
        return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>Unsupported Chart</div>;
    }
  };

  const renderWidgetCard = (w: any) => {
    const IconComp = WIDGET_ICONS[w.id] || Factory;
    const accentColor = '#38bdf8';
    
    return (
      <div key={w.id} className={`${styles.glassCard} ds-card`} style={{display: 'flex', flexDirection: 'column', minHeight: '520px',
        background: 'rgba(24, 24, 24, 0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', border: '1px solid rgba(255,255,255,0.05)',
        padding: '1.5rem'}}>
        
        {/* Card Header */}
        <div style={{ position: 'relative', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
              <IconComp size={20} color={accentColor} />
              {w.title}
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
        <div style={{ height: '280px', width: '100%', marginBottom: '1.5rem', position: 'relative', zIndex: 0 }}>
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
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Strategic Investment & Operation Command — {widgets.length} Widgets · {kpiKeys.length} KPIs · <span style={{ color: '#38bdf8' }}>KFAS 실증 연구 통합</span></p>
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
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem', maxWidth: '80%' }}>
                  아세안 냉동창고 인텔리전스 보고서 및 운영 데이터를 심층 학습했습니다. "베트남 신축 시나리오의 예상 ROIC는?", "태국 Category II 규제 기준은?" 등 구체적인 질문을 해보세요.
                </p>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
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
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>1. 입고 & 수급 (Raw Material & Inbound)</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets.filter((w: any) => ['w01', 'w03'].includes(w.id)).map(renderWidgetCard)}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <ShieldAlert size={24} color="var(--color-danger)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>2. 보관 & 가동률 (Storage & Operations)</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets.filter((w: any) => ['w02', 'w04'].includes(w.id)).map(renderWidgetCard)}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Globe size={24} color="var(--color-warning)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>3. 물류 & 통관 인프라 (Logistics & Infrastructure)</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets.filter((w: any) => ['w05', 'w06'].includes(w.id)).map(renderWidgetCard)}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <TrendingUp size={24} color="#8b5cf6" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>4. 수익성 & 투자 전략 (Profitability & Investment)</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets.filter((w: any) => ['w07', 'w08', 'w09'].includes(w.id)).map(renderWidgetCard)}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Snowflake size={24} color="#06b6d4" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>5. 에너지 최적화 & ESG (Energy & ESG)</h2>
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

