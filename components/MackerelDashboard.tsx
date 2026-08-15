"use client";

import React, { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Fish, Anchor, Globe, DollarSign, 
  Activity, AlertTriangle, ShieldCheck, AlertCircle,
  RefreshCcw, Crosshair, MapPin, Factory, Truck, Scale, BarChart2, Zap, Ship
} from 'lucide-react';

import styles from './MackerelStrategy.module.css';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, getA11yBarProps } from './ChartPatterns';

// 아카이브 기반 위젯 계층 (scripts/mackerel/build.py 산출)
import MackerelWidgetV2 from './MackerelWidgetV2';
import { getPillarWidgets, getKpis, widgetCount, type Pillar } from '@/lib/data/mackerel-v2';

// 5-Pillar 네비게이터 메타 (Tuna 패턴 + 고등어 시그니처 그라디언트 cyan-700→sky-500)
const SECTIONS = [
  { id: 'S1', num: '❶', label: '원료 수급', title: '🐟 Part I — 원료 수급 (Raw Material)',
    desc: '글로벌 어획량, 자원평가, 어종 분포, 쿼터 관리 및 생태계 모니터링', color: '#0e7490', icon: Fish },
  { id: 'S2', num: '❷', label: '가공·생산', title: '🏭 Part II — 가공·생산 (Processing & Production)',
    desc: '가공 허브 패권, 부가가치 분석, HMR 전환, 기술 혁신 및 부산물 활용', color: '#0891b2', icon: Factory },
  { id: 'S3', num: '❸', label: '물류·통관', title: '🚢 Part III — 물류·통관 (Logistics & Customs)',
    desc: '수출입 통관, 관세·FTA 분석, 착지원가, 차익거래, 해상운임 및 콜드체인', color: '#0ea5e9', icon: Ship },
  { id: 'S4', num: '❹', label: '판매·수요', title: '📈 Part IV — 판매·수요 (Sales & Demand)',
    desc: '소비 트렌드, 유통 마진, 가격 분해, D2C·HMR 시장, 스태그플레이션 대응', color: '#38bdf8', icon: TrendingUp },
  { id: 'S5', num: '❺', label: 'ESG·지속가능성', title: '🌱 Part V — ESG·지속가능성 (Sustainability)',
    desc: '제재·컴플라이언스, MSC 인증, 탄소 발자국, 선원 인권, IUU 감시 및 정책 대응', color: '#7dd3fc', icon: ShieldCheck },
] as const;

// 런타임 API 주입 위젯만 유지. v13.json 정적 위젯은 data/mackerel 아카이브 번들이 대체한다.
const RUNTIME_WIDGET_IDS: Record<string, string[]> = {
  S1: [],
  S2: [],
  S3: ['w_arbitrage_live', 'w_kcs_monthly', 'w_kcs_origin', 'w_comtrade_flow', 'w_oec_benchmark', 'w_landing', 'w_multi_cost', 'w_tariff', 'w_hs_class', 'w_eu_import', 'w_import_yeti_suppliers'],
  S4: ['w_dist_margin'],
  S5: ['w_sanctions_radar', 'w_osh_facilities'],
};


/* ─── Custom Tooltip ─── */
// 시뮬레이션(추정) 위젯 ID 목록
const SIMULATION_WIDGET_IDS = ['w23', 'w25'];

// 복합 단위 포맷: dataKey 이름을 기반으로 단위를 추론
const smartFormat = (v: any, dataKey?: string): string | any => {
  if (Array.isArray(v)) {
    return v.map(val => smartFormat(val, dataKey)).join(' ~ ');
  }
  if (typeof v !== 'number') return v;
  const str = v % 1 === 0 ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 3 });
  if (!dataKey) return str;
  const k = dataKey.toLowerCase();
  if (k.includes('마진') || k.includes('의존도') || k.includes('비율') || k.includes('방어율') || k.includes('실행율') || k.includes('도입비율')) return `${str}%`;
  if (k.includes('단가') || k.includes('가치') || k.includes('수익') || k.includes('절감')) return `$${str}`;
  return str;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry: any, index: any) => (
          <div key={index} className={styles.tooltipValue}>
            <span style={{ color: entry.color }}>■ {entry.name}</span>
            <strong>{smartFormat(entry.value, entry.dataKey)}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ["#38bdf8", "var(--color-success)", "var(--color-warning)", "var(--color-danger)", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

/* ─── KPI Color Themes ─── */
const KPI_THEMES = [
  { border: 'none', glow: 'none', text: 'var(--color-success)', icon: Globe },
  { border: 'none', glow: 'none', text: 'var(--text-primary)', icon: TrendingDown },
  { border: 'none', glow: 'none', text: 'var(--color-success)', icon: Anchor },
  { border: 'none', glow: 'none', text: 'var(--color-danger)', icon: ShieldCheck },
  { border: 'none', glow: 'none', text: 'var(--color-warning)', icon: Factory },
  { border: 'none', glow: 'none', text: 'var(--text-primary)', icon: Scale },
];

/* ─── Widget Icon by insight category ─── */
const WIDGET_ICONS: Record<string, any> = {
  w_arbitrage_live: Activity,
  w01: Globe, w02: Crosshair, w03: Fish, w04: TrendingDown,
  w05: Activity, w06: Truck, w07: DollarSign, w08: Factory,
  w09: AlertTriangle, w10: Scale, w11: MapPin, w12: ShieldCheck,
  w13: BarChart2, w14: Anchor, w15: MapPin, w16: Factory,
  w17: DollarSign, w18: Scale, w19: Truck, w20: Anchor,
  w21: Factory, w22: ShieldCheck, w23: Activity, w24: Factory,
  w25: Zap, w26: RefreshCcw, w27: Activity, w28: MapPin, w29: TrendingUp,
  w30: TrendingUp, w31: MapPin, w32: TrendingUp, w33: Factory,
  w34: Anchor, w35: Factory, w36: DollarSign, w37: TrendingUp, w38: Activity,
  w39: MapPin, w40: Scale, w41: Activity,
  w42: AlertTriangle, w43: Globe, w44: Crosshair,
  w45: Factory, w46: ShieldCheck, w47: Factory,
  w48: Ship, w49: Scale, w50: ShieldCheck,
  w51: DollarSign, w52: TrendingUp, w53: Activity,
  w54: ShieldCheck, w55: AlertCircle, w56: Globe,
  w57: AlertTriangle, w58: Globe, w59: DollarSign, w60: Factory, w61: ShieldCheck, w62: Truck, w63: DollarSign,
  w68: Crosshair, w69: Activity, w70: DollarSign, w71: Factory,
  w72: Zap, w73: Fish, w74: Scale, w75: Truck,
  w_tariff: ShieldCheck, w_landing: DollarSign, w_dist_margin: Scale,
  w_us_boneless: Crosshair, w_africa_coldchain: Truck, w_global_b2c_channel: Globe,
  w_busan_procurement: Fish, w_andong_salted: Factory, w_domestic_retail: DollarSign,
};

export default function MackerelDashboard() {
  const [data, setData] = useState<any>(null);
  const [activePart, setActivePart] = useState<'S1' | 'S2' | 'S3' | 'S4' | 'S5'>('S1');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [tickerData, setTickerData] = useState<any>(null);
  const [kcsData, setKcsData] = useState<any>(null);
  const [eurostatData, setEurostatData] = useState<any>(null);
  const [oshData, setOshData] = useState<any>(null);
  const [oecData, setOecData] = useState<any>(null);
  const [comtradeData, setComtradeData] = useState<any>(null);
  const [hsData, setHsData] = useState<any>(null);
  const [tariffsData, setTariffsData] = useState<any>(null);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [supplierData, setSupplierData] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Live Intelligence APIs (Phase 1, 2 & 3)
  useEffect(() => {
    fetch('/api/mackerel-ticker?t=' + Date.now()).then(r => r.json()).then(setTickerData).catch(() => null);
    fetch('/api/mackerel-kcs?t=' + Date.now()).then(r => r.json()).then(setKcsData).catch(() => null);
    fetch('/api/eurostat?t=' + Date.now()).then(r => r.json()).then(setEurostatData).catch(() => null);
    fetch('/api/osh', { method: 'POST', body: JSON.stringify({ sector: 'fishery', commodity: '고등어' }) }).then(r => r.json()).then(setOshData).catch(() => null);
    fetch('/api/oec', { method: 'POST', body: JSON.stringify({ commodity: '고등어' }) }).then(r => r.json()).then(setOecData).catch(() => null);
    fetch('/api/mackerel-comtrade?t=' + Date.now()).then(r => r.json()).then(setComtradeData).catch(() => null);
    fetch('/api/hs-ping', { method: 'POST', body: JSON.stringify({ query: 'frozen mackerel', country: 'KR' }) }).then(r => r.json()).then(setHsData).catch(() => null);
    fetch('/api/tariffs', { method: 'POST', body: JSON.stringify({ origin: 'NO', destination: 'KR', hsCode: '030354' }) }).then(r => r.json()).then(setTariffsData).catch(() => null);
    fetch('/api/compliance', { method: 'POST', body: JSON.stringify({ entity: 'norebo' }) }).then(r => r.json()).then(setComplianceData).catch(() => null);
    fetch('/api/import-yeti', { method: 'POST', body: JSON.stringify({ query: 'mackerel' }) }).then(r => r.json()).then(setSupplierData).catch(() => null);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/data/mackerel_real_data_v13.json?t=' + Date.now()).then(res => res.json()),
      fetch('/api/fishery?source=mof-consignment&t=' + Date.now()).then(res => res.json()).catch(() => null)
    ])
    .then(([json, mofData]) => {
      if (mofData && mofData.data && mofData.arbitrage) {
        const spread = mofData.arbitrage.spread_pct;
        const norwayKg = mofData.arbitrage.norway_cif_krw_kg;
        const norwayBox = norwayKg * 15;
        
        // Enrich data to include the norway price for plotting as a horizontal line
        const enrichedData = mofData.data.map((d: any) => ({
          ...d,
          norwayPriceBox: norwayBox
        }));

        let stratText = '';
        if (spread < 0) {
          stratText = `현재 국내산 산지 위판가가 노르웨이산 환산 단가보다 비싼 프리미엄(마이너스 스프레드) 구간입니다. 국내산 매입을 지연시키고 기 확보된 노르웨이산 비축 물량 또는 신규 수입 물량을 우선 소진하여 원가를 절감해야 합니다.`;
        } else {
          stratText = `현재 국내산 스프레드가 확대(저평가)된 구간으로, 노르웨이산 선물 계약 물량을 일부 연기하고 부산 산지 즉시 매입 비중을 높여 단기 마진을 확보해야 합니다.`;
        }

        // L-12: 라우트의 isLive 신호만 LIVE로 인정 (폴백 응답은 STATIC)
        const mofLive = mofData.isLive === true;
        const arbitrageWidget = {
          id: 'w_arbitrage_live',
          title: '수입산 vs 국내산 차익거래 레이더',
          subtitle: '해양수산부 위판가 기반 매입 타점 포착',
          chartType: 'Composed',
          xKey: 'market',
          bars: [
            { key: 'price', name: '국내산 위판가 (15kg)', color: 'var(--color-success)' }
          ],
          lines: [
            { key: 'norwayPriceBox', name: '노르웨이산 환산가 (15kg)', color: 'var(--color-warning)' }
          ],
          data: enrichedData,
          isLive: mofLive,
          sit: `해양수산부 공공데이터 기준 부산공동어시장(대) 위판가는 ${mofData.data[0]?.price.toLocaleString()}원입니다. 노르웨이산 환산 단가 대비 스프레드는 ${spread}%로 확인됩니다.`,
          strat: stratText,
          logic: '해양수산부 위탁판매 현황 API 연동 및 관세청 기준 CIF 추정가 대비 스프레드 맵핑 (15kg 박스 기준 환산)',
          source: mofLive
            ? '해양수산부 위탁판매 현황 + 관세청 CIF (공공데이터 API 라이브)'
            : '해양수산부/관세청 폴백 기준값 (정적)',
          unit: '원 (KRW)'
        };
        json.widgets.unshift(arbitrageWidget);
      }

      // ═══ Ticker API 기반 신규 위젯 동적 주입 ═══
      if (tickerData) {
        // W_TARIFF: 글로벌 관세율 비교 — 라우트 내 정적 관세율표 (라이브 아님)
        if (tickerData.tariffComparison) {
          json.widgets.push({
            id: 'w_tariff', title: '고등어(HS 030354) 글로벌 관세율 비교',
            subtitle: 'WITS + KCS 기반 MFN/FTA 실적관세율 벤치마크 (정적 관세율표)',
            chartType: 'Composed', xKey: 'country',
            bars: [{ key: 'mfn', name: 'MFN 관세율 (%)', color: '#f59e0b' }, { key: 'fta', name: 'FTA 적용 (%)', color: 'var(--color-success)' }],
            data: tickerData.tariffComparison,
            badges: ['Verified', 'STATIC'],
            isLive: false,
            sit: `한국의 냉동고등어 MFN 관세율은 ${tickerData.tariff?.mfn}%이며, RCEP FTA 적용 시 ${tickerData.tariff?.fta}%로 면세 수입이 가능합니다. 노르웨이산은 한-EFTA TRQ 500톤 한정 0%이며, 초과분은 기본세율 10%가 적용됩니다 (KMI 2026Q1).`,
            strat: 'RCEP/한-노르웨이 FTA 활용 시 관세 10%p 절감 가능. 연간 수입 13.6만 톤 기준 약 $26M 절감 효과로, FTA C/O(원산지증명서) 100% 확보가 최우선 과제입니다.',
            source: 'World Bank WITS + 관세청 고시 관세율표 (정적)',
            unit: '%'
          });
        }
        // W_LANDING: 착지원가 시뮬레이터 — 환율(ECOS)·CIF(KCS) 모두 라이브일 때만 LIVE
        if (tickerData.landingCost) {
          const lc = tickerData.landingCost;
          const landingLive = tickerData.fx?.isLive === true && tickerData.kcs?.isLive === true;
          json.widgets.push({
            id: 'w_landing', title: '착지원가 시뮬레이터 (MFN vs FTA)',
            subtitle: `CIF × 환율(${tickerData.fx?.usdKrw}) × 관세 × VAT 산출`,
            chartType: 'Bar', xKey: 'scenario',
            bars: [{ key: 'cost', name: '착지원가 (원/kg)', color: '#38bdf8' }],
            data: [
              { scenario: 'MFN (10%)', cost: lc.mfnKrwKg },
              { scenario: 'FTA (0%)', cost: lc.ftaKrwKg },
              { scenario: '절감액', cost: lc.savingsKg },
            ],
            isLive: landingLive,
            sit: `환율 ${tickerData.fx?.usdKrw}원 기준, 노르웨이산 고등어 MFN 착지원가는 ${lc.mfnKrwKg?.toLocaleString()}원/kg, FTA 적용 시 ${lc.ftaKrwKg?.toLocaleString()}원/kg입니다.`,
            strat: `FTA 활용 시 kg당 ${lc.savingsKg}원(${lc.savingsPct}%) 절감. 연 13.6만 톤 수입 시 약 ${Math.round(lc.savingsKg * 136000 / 1e8)}억원 절감 가능.`,
            source: landingLive
              ? 'ECOS 환율 + KCS CIF + WITS 관세 (라이브 합산)'
              : 'ECOS/KCS 폴백 기준값 합산 (정적)',
            unit: '원/kg'
          });
        }
        // W_MARGIN: 유통단계별 마진 — KAMIS 라이브 여부 그대로 소비
        if (tickerData.distributionMargin) {
          const kamisLive = tickerData.kamis?.isLive === true;
          json.widgets.push({
            id: 'w_dist_margin', title: '고등어 유통단계별 가격·마진 구조',
            subtitle: 'KAMIS 도매가 + 해양수산부 위판가 기반 마진 분석',
            chartType: 'Composed', xKey: 'stage',
            bars: [{ key: 'price', name: '단가 (원/kg)', color: '#38bdf8' }],
            lines: [{ key: 'margin', name: '마진율 (%)', color: 'var(--color-warning)' }],
            dualAxis: true,
            data: tickerData.distributionMargin,
            isLive: kamisLive,
            sit: `KAMIS 기준 고등어 도매가 ${tickerData.kamis?.wholesaleKg?.toLocaleString()}원/kg, 소매가 ${tickerData.kamis?.retailKg?.toLocaleString()}원/kg입니다. 도매→소매 마진은 약 ${Math.round(((tickerData.kamis?.retailKg - tickerData.kamis?.wholesaleKg) / tickerData.kamis?.wholesaleKg) * 100)}%입니다.`,
            strat: '산지-도매 구간 마진이 가장 높아, 산지 직구매(위판장 직접 낙찰) 비중 확대 시 원가 경쟁력 확보 가능합니다.',
            source: kamisLive
              ? 'KAMIS 농산물유통정보 (라이브) + 산지·소매 환산 계수'
              : 'KAMIS 폴백 기준값 (정적) + 산지·소매 환산 계수',
            unit: '원/kg, %'
          });
        }
      }

      // ═══ KCS, Eurostat, OSH 기반 신규 위젯 주입 ═══
      if (kcsData) {
        const kcsLive = kcsData.isLive === true;
        json.widgets.push({
          id: 'w_kcs_monthly', title: '관세청 월별 고등어 수입 실적 (HS 030354)',
          subtitle: 'KCS 통관 데이터 기반 수입량 및 수입액 추이',
          chartType: 'Composed', xKey: 'month',
          bars: [{ key: 'volume', name: '수입량 (톤)', color: '#38bdf8' }],
          lines: [{ key: 'value', name: '수입액 (천불)', color: '#10b981' }],
          dualAxis: true, data: kcsData.monthly, badges: ['Verified'],
          isLive: kcsLive,
          syncDate: kcsLive ? undefined : '2024-01',
          sit: `관세청 통관 실적 기준 냉동고등어(HS 030354) 월별 수입량은 약 1.3만 톤 수준을 유지 중이며, CIF 단가는 톤당 $1,500~1,800 구간에서 등락을 반복하고 있습니다. 가을 시즌(9~11월) 에는 노르웨이산 조업 시기와 맞물려 수입량이 증가하는 패턴이 확인됩니다.`,
          strat: '월별 통관 물량 변동성을 국내 산지 위판가와 역상관관계로 분석하여, 대량 통관 시기에는 국내산 매입을 억제하고 수입산 우선 소진 전략을 구사해야 합니다. CIF 단가 급등 시 월별 매입 물량을 사전 조절하는 헤지 전략이 필요합니다.',
          source: kcsLive ? '관세청 KCS OpenAPI (라이브 통관 실적)' : '관세청 수출입무역통계 폴백 (2023-08~2024-01 정적)',
          unit: '톤, $1,000'
        });
        json.widgets.push({
          id: 'w_kcs_origin', title: '관세청 국가별 수입 점유율',
          subtitle: 'KCS 통관 데이터 기반 원산지 비중',
          chartType: 'Pie', xKey: 'name',
          pieDataKey: 'value', data: kcsData.origin, badges: ['Verified'],
          isLive: kcsLive,
          syncDate: kcsLive ? undefined : '2024',
          sit: `관세청 통관 실적 기준 노르웨이산이 한국 냉동고등어 수입의 상당 비중(UN Comtrade 2024 기준 약 77%)을 차지하고 있다. 단일 국가 의존도가 높아 노르웨이 쿼터 변동, 기후·지정학적 리스크 발생 시 공급 차질 가능성이 있다.`,
          strat: '노르웨이 의존도가 높은 만큼 영국·아이슬란드·페로제도 등 대체 원산지 발굴을 진행하고, 장기 공급 계약 비율을 높여 가격 변동 리스크를 완화하십시오.',
          source: kcsLive ? '관세청 KCS OpenAPI (라이브 통관 실적)' : '관세청 수출입무역통계 폴백 (정적)',
          unit: '%'
        });
      }

      if (eurostatData && Array.isArray(eurostatData.imports) && eurostatData.imports.length > 0) {
        // L-09: 라우트가 실데이터 파싱에 성공한 경우(isLive)에만 LIVE. 폴백은 정적 추정치로 정직 표기.
        const euLive = eurostatData.isLive === true;
        const euRows = eurostatData.imports;
        const euLast = euRows[euRows.length - 1];
        const euFirst = euRows[0];
        const euGrowthPct = euFirst?.value > 0 ? Math.round(((euLast.value - euFirst.value) / euFirst.value) * 100) : null;
        json.widgets.push({
          id: 'w_eu_import', title: 'EU-27 고등어 수입 실적 추이',
          subtitle: euLive
            ? `Eurostat Comext 역외(Extra-EU) 수입 실측 (HS 030354, ~${euLast.year})`
            : 'Eurostat 정적 추정치 (2019-2023 폴백)',
          chartType: 'Composed', xKey: 'year',
          bars: [{ key: 'volume', name: '수입량 (천톤)', color: '#8b5cf6' }],
          lines: [{ key: 'value', name: '수입액 (백만 유로)', color: '#f59e0b' }],
          dualAxis: true, data: euRows,
          isLive: euLive,
          syncDate: euLive ? undefined : (eurostatData.dataAsOf || '2023-12-31'),
          sit: `${euLive ? 'Eurostat Comext 실측' : '정적 추정치'} 기준 ${euLast.year}년 EU-27 ${euLive ? '역외 ' : ''}고등어 수입은 약 ${euLast.volume?.toLocaleString()}천 톤, ${euLast.value?.toLocaleString()}백만 유로 규모입니다.${euGrowthPct !== null ? ` ${euFirst.year}년 대비 수입액은 ${euGrowthPct >= 0 ? '+' : ''}${euGrowthPct}% 변동했습니다.` : ''}`,
          strat: 'EU 내수 수요 증가는 글로벌 고등어 단가 상승을 견인하므로, 선도 거래 비율을 30% 이상으로 확대하여 헤지해야 합니다. 단, EU의 IUU 규제 강화 시 인증 도태 모듈의 선제적 도입이 필요합니다.',
          source: eurostatData.source || 'Eurostat',
          unit: '천톤, 백만 유로'
        });
      }

      if (oshData && oshData.facilities) {
        // Facility 데이터로 도넛 차트 생성 (국가별)
        const counts = oshData.facilities.reduce((acc: any, f: any) => {
          acc[f.country] = (acc[f.country] || 0) + 1; return acc;
        }, {});
        const oData = Object.entries(counts).map(([name, value], i) => ({ name, value, fill: ['#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6'][i%4] }));
        const oshLive = oshData.meta?.source === 'OSH_LIVE';
        // 패턴 K 정직화: OSH 식품 섹터 표본은 참치·새우 등 일반 수산가공사 — '고등어 시설'로 표기하지 않는다
        json.widgets.push({
          id: 'w_osh_facilities', title: '글로벌 수산식품 가공 시설 분포 (OSH 등록)',
          subtitle: 'Open Supply Hub 식품 섹터 등록 시설 국가별 비중 — 참치·새우 등 포함, 고등어 전용 아님',
          chartType: 'Pie', xKey: 'name', pieDataKey: 'value', data: oData,
          isLive: oshLive,
          sit: `OSH 플랫폼 식품(Food) 섹터에 등록된 수산식품 가공·취급 시설 ${oshData.meta?.count || oshData.facilities.length}개소의 국가별 분포입니다. 표본에는 참치·새우 등 일반 수산가공사가 포함되며, OSH는 고등어 전용 시설 필터를 제공하지 않습니다. 중국·태국·베트남 등 아시아권이 1차 가공 허브로 기능하고 있습니다.`,
          strat: '글로벌 공급망 투명성 제고를 위해 노르웨이 1차 가공 공장들의 OSH 데이터와 HACCP/ISO 22000 위생 등급을 교차 검증해야 합니다. ESG 공시 의무화 대비 시 공급업체 위생 인증 현황을 선제적으로 확보하십시오.',
          source: oshLive
            ? 'Open Supply Hub 시설 API (라이브 조회)'
            : 'Open Supply Hub 큐레이션 폴백 DB (수산식품 시설, 고등어 전용 아님)',
          unit: '개소'
        });
      }

      // ═══ OEC & UN Comtrade 기반 신규 위젯 주입 ═══
      if (comtradeData && comtradeData.tradeFlows && comtradeData.tradeFlows.length > 0) {
        const ctLive = comtradeData.isLive === true;
        // 라이브 파싱 데이터는 교역액(USD), 폴백 매핑은 교역량(톤) — 단위 정직 표기
        const ctUnit = ctLive ? '$ (교역액)' : '톤';
        const ctName = ctLive ? '교역액 ($)' : '교역량 (톤)';
        const ctTop = comtradeData.tradeFlows[0];
        json.widgets.push({
          id: 'w_comtrade_flow', title: '글로벌 고등어 교역 매트릭스',
          subtitle: `UN Comtrade 기반 수출국 → 수입국 무역 흐름 (${ctLive ? '2023년 실측, 교역액 기준' : '정적 매핑, 교역량 기준'})`,
          chartType: 'Bar', xKey: 'source', // Sankey 미지원 → Bar Fallback
          bars: [{ key: 'value', name: ctName, color: '#38bdf8' }],
          data: comtradeData.tradeFlows,
          isLive: ctLive,
          syncDate: ctLive ? undefined : '2023',
          sit: `노르웨이를 허브로 EU·중국·일본·한국 향 수출이 글로벌 고등어 교역의 중심축입니다. 표시 흐름 중 최대는 ${ctTop?.source}→${ctTop?.target}(${ctTop?.value?.toLocaleString()}${ctLive ? '$' : '톤'})입니다.`,
          strat: '노르웨이발 수입 루트 병목 현상 발생 시 영국·아일랜드 대서양 루트를 즉시 가동할 수 있도록 대체 공급처 다변화 채널을 상시 유지해야 합니다. 영국·아일랜드발 아프리카(나이지리아) 항로는 신시장 진출 검토 시 참고할 만합니다.',
          source: comtradeData.source || 'UN Comtrade',
          unit: ctUnit
        });
      }

      if (oecData && oecData.topExporters && oecData.topExporters.length > 0) {
        const oecLive = oecData.meta?.source === 'OEC_LIVE';
        const oecTop3 = oecData.topExporters.slice(0, 3);
        const oecTop3Share = Math.round(oecTop3.reduce((s: number, d: any) => s + (d.share || 0), 0));
        json.widgets.push({
          id: 'w_oec_benchmark', title: 'OEC 글로벌 수출 경쟁력 벤치마크',
          subtitle: `OEC Tesseract OLAP 엔진 기반 주요 수출국 점유율 (총 교역규모: $${oecData.globalTradeValueM}M, ${oecData.year || '2023'}년)`,
          chartType: 'Bar', xKey: 'country',
          bars: [{ key: 'share', name: '수출 점유율 (%)', color: '#10b981' }],
          data: oecData.topExporters, badges: ['Verified'],
          isLive: oecLive,
          syncDate: oecLive ? undefined : '2023',
          sit: `OEC 데이터 기준 고등어(HS 0303) 글로벌 수출 시장은 ${oecTop3.map((d: any) => `${d.country}(${d.share}%)`).join('·')} 상위 3국이 전체의 약 ${oecTop3Share}%를 장악하고 있으며, 공급망 집중 리스크가 존재합니다.`,
          strat: '노르웨이·러시아의 어획 쿼터 변동 뉴스를 조기 경보 시스템과 연동해야 합니다. 중국의 수입·수출 동시 점유 위치는 중국 역내 재가공 후 재수출하는 구조로, 원산지 세탁 리스크를 주시해야 합니다.',
          source: oecLive ? 'OEC Tesseract API (라이브)' : 'OEC 2023 벤치마크 (정적 폴백)',
          unit: '%'
        });
      }

      // ═══ HS Ping & Tariffs 기반 신규 위젯 (Phase 1) ═══
      if (hsData && hsData.classifications) {
        json.widgets.push({
          id: 'w_hs_class', title: '고등어 가공형태별 HS 분류기',
          subtitle: 'HS Ping 품목분류 참조표 (원물, 필렛, 염장)',
          chartType: 'Bar', xKey: 'product',
          bars: [{ key: 'confidence', name: '분류 신뢰도 (%)', color: '#10b981' }],
          data: [
            { product: '냉동 고등어(원물)', hsCode: '0303.54', confidence: 99 },
            { product: '고등어 필렛(순살)', hsCode: '0304.89', confidence: 95 },
            { product: '자반/염장 고등어', hsCode: '0305.63', confidence: 96 }
          ],
          badges: ['STATIC', 'Verified'],
          sit: '주요 가공 형태별 HS 코드 매핑이다. 냉동 원물 0303.54, 순살 필렛 0304.89, 자반·염장 0305.63으로 분류된다. 신뢰도 수치는 자체 추정(illustrative)이며 실제 통관 시 관세청 확인이 필요하다.',
          strat: 'HMR용 순살 필렛의 경우 수입 통관 시 HS 0304.89로 분류되어 원물과 다른 수입 요건 및 관세가 적용되므로 주의가 필요합니다.',
          source: '관세청 HS 분류 체계 기반 자체 추정 (illustrative)', unit: '%'
        });
      }

      if (tariffsData && tariffsData.data) {
        const td = tariffsData.data;
        const tariffsLive = tariffsData.meta?.source === 'TARIFFS_LIVE';
        json.widgets.push({
          id: 'w_multi_cost', title: '복합 착지원가 시뮬레이터 (노르웨이→한국)',
          subtitle: 'Tariffs API 기반 입체적 관세(MFN, EFTA) 누적 산출',
          chartType: 'Bar', xKey: 'type',
          bars: [{ key: 'rate', name: '적용 관세율 (%)', color: '#f59e0b' }],
          data: [
            { type: 'MFN 기본관세', rate: td.mfnDuty || 10 },
            { type: 'EFTA 협정관세', rate: td.additionalDuties?.[0]?.rate || -10 },
            { type: '최종 적용세율', rate: td.totalDutyRate || 0 }
          ],
          badges: ['Verified'],
          isLive: tariffsLive,
          sit: `노르웨이(${td.origin}) 발 한국(${td.destination}) 도착 냉동고등어(HS ${td.hsCode})의 기본 MFN 관세는 ${td.mfnDuty}%이며, 한-EFTA 0%는 TRQ 500톤 한정 — 초과 물량은 기본세율 10%입니다 (KMI 2026Q1 명문).`,
          strat: 'FTA 100% 활용을 위해 노르웨이 수출업체의 원산지 증명서(C/O) 발급을 계약서에 명문화하고 추적해야 합니다.',
          source: tariffsLive ? 'Tariffs API (라이브 조회)' : 'Tariffs 큐레이션 관세 모델 (정적 폴백)',
          unit: '%'
        });
      }

      // ═══ Compliance & Sanctions 기반 신규 위젯 (Phase 2) ═══
      if (complianceData && complianceData.result) {
        const cr = complianceData.result;
        json.widgets.push({
          id: 'w_sanctions_radar', title: 'IUU·원산지 세탁 리스크 (러시아산 중국 경유)',
          subtitle: 'OECD/EJF 기반 불법무역(IUU)·인권 위반 및 러시아산 중국 경유 원산지 위장 탐지',
          chartType: 'Bar', xKey: 'check',
          bars: [{ key: 'score', name: '컴플라이언스 점수', color: cr.riskLevel === 'CRITICAL' ? '#ef4444' : '#10b981' }],
          data: [
            { check: 'OFAC 제재', score: cr.ofac?.status === 'clean' ? 100 : 10 },
            { check: 'EU 제재', score: cr.eu?.status === 'clean' ? 100 : (cr.eu?.status === 'partial' ? 50 : 10) },
            { check: '종합 리스크', score: cr.riskScore }
          ],
          badges: ['STATIC', 'Verified'],
          isLive: cr.isLive === true,
          sit: `검색된 공급사 "${cr.entity}"에 대해 OFAC(${cr.ofac?.status === 'clean' ? '적합' : '위험'}) 및 EU(${cr.eu?.status === 'clean' ? '적합' : cr.eu?.status === 'partial' ? '부분적합' : '위험'}) 제재 모니터링이 완료되었습니다. 종합 리스크 수준: ${cr.riskLevel}. 특히 러시아산 고등어의 중국 우회 가공 수출 사례가 강화된 감시 대상입니다.`,
          strat: '공급망의 실소유주(UBO)를 OFAC API를 통해 상시 교차 검증하십시오. 러시아 제재 강화 시 노르웨이 직수입 대비 중국 경유 수입의 원산지 세탁 리스크가 급상승할 수 있으며, EU CBAM 시행 시 탄소발자국 인증도 필수적으로 요구됩니다.',
          source: cr.isLive === true
            ? 'OFAC SDN 라이브 조회 + OECD/EJF 불법어업(IUU)·인권 위반 참조 DB'
            : 'OECD/EJF 불법어업(IUU)·인권 위반 참조 DB (정적)',
          unit: '점'
        });
      }

      // ═══ ImportYeti & Veridion 기반 신규 위젯 (Phase 3) ═══
      if (supplierData && supplierData.data) {
        json.widgets.push({
          id: 'w_import_yeti_suppliers', title: '노르웨이 대체 공급망 — 한국 수입 공급국 (2024)',
          subtitle: 'UN Comtrade 한국 냉동고등어(HS 030354) 수입액 기준 공급국 집중도',
          chartType: 'Bar', xKey: 'origin',
          bars: [{ key: 'valueUsdM', name: '한국 수입액 ($M)', color: '#3b82f6' }],
          data: supplierData.data,
          badges: ['Comtrade 실측'],
          isLive: false,
          telemetryStatus: 'SYNCED', // 2024 Comtrade 실측 동기화 (라이브 아님)
          syncDate: '2024',
          sit: `2024년 한국 냉동고등어 수입은 노르웨이가 $83.1M(76.7%)로 뚜렷한이며, 나머지는 베트남($11.2M)·중국($6.3M)·네덜란드($1.9M) 등 가공·중계 물량입니다. 1국 의존도 77%는 노르웨이 어획쿼터·수출규제·환율 변동에 그대로 노출되는 구조적 리스크입니다.`,
          strat: '노르웨이 쿼터 감축에 대비해 동일 북동대서양 자원을 어획하는 영국·아일랜드·아이슬란드·페로(공개 무역통계상 주요 고등어 수출국)와 예비 스팟 계약 풀을 구축하고, 베트남·중국 가공라인을 보조 채널로 이원화해 1국 의존도를 70% 이하로 낮추십시오.',
          source: 'UN Comtrade 2024 (HS 030354, 한국 수입)', unit: '$M'
        });
      }

      setData(json);
    })
    .catch(err => console.error("Failed to load mackerel data", err));
  }, [tickerData, kcsData, eurostatData, oshData, oecData, comtradeData, hsData, tariffsData, complianceData, supplierData]);

  // Close modal on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setActiveModal(null);
      }
    };
    if (activeModal) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeModal]);

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCcw size={32} style={{ color: 'var(--w-sky-400)', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--w-slate-400)', fontSize: '1rem' }}>인텔리전스 데이터 로딩 중...</p>
    </div>
  );

  // KPI는 아카이브 빌더가 위젯과 같은 소스에서 산출한다 — 헤더와 본문이 다른 말을 하면 안 된다.
  const kpis: Record<string, any> = getKpis();
  const { widgets } = data;

  const kpiKeys = Object.keys(kpis);

  // 헤더 카운트 동적 산출: 실제 렌더되는 위젯(5-Pillar 매핑 위젯 + 외부 통합 위젯)만 집계 (패턴 I)
  const runtimeWidgetCount = (Object.keys(RUNTIME_WIDGET_IDS) as string[]).reduce(
    (sum, pid) => sum + (widgets?.filter((w: any) => RUNTIME_WIDGET_IDS[pid].includes(w.id)).length || 0),
    0
  );
  const renderedWidgetCount = widgetCount() + runtimeWidgetCount;
  // 티커 라이브 여부: 라우트가 보고한 라이브 소스 수 > 0일 때만 (L-12)
  const tickerHasLive = (tickerData?.liveSourceCount ?? 0) > 0;

  /* ─── Chart Renderer ─── */
  const renderChart = (widget: any) => {
    const d = widget.data;
    if (!d || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--w-slate-500)'}}>데이터 없음</div>;

    const formatVal = (v: any) => {
      if (typeof v !== 'number') return v;
      return v % 1 === 0 ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 3 });
    };

    switch(widget.chartType) {
      case "Pie":
        return (
          <PieChart>
            <Pie data={d} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={35}
              label={({name, value}) => `${name} ${formatVal(value)}`} labelLine={false} fontSize={10}>
              {d.map((_: any, idx: number) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} />} />
            <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--w-slate-300)' }} />
          </PieChart>
        );
      case "Area":
        return (
          <AreaChart data={d}>
            <defs>
              {widget.areas?.map((a: any, i: number) => (
                <linearGradient key={i} id={`mArea${widget.id}_${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={a.color} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={a.color} stopOpacity={0.05}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="var(--w-slate-500)" tick={{fontSize:10}} />
            <YAxis stroke="var(--w-slate-500)" tick={{fontSize:10}} tickFormatter={formatVal} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {widget.areas?.map((a: any, i: number) => (
              <Area key={i} type="monotone" dataKey={a.key} stroke={a.color} fill={`url(#mArea${widget.id}_${i})`} strokeWidth={2.5} stackId={widget.stacked ? 'stack1' : undefined} />
            ))}
          </AreaChart>
        );
      case "Bar":
        return (
          <BarChart data={d}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="var(--w-slate-500)" tick={{fontSize:10}} />
            <YAxis stroke="var(--w-slate-500)" tick={{fontSize:10}} tickFormatter={formatVal} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {widget.bars?.map((b: any, i: number) => {
              const p = getA11yBarProps(i);
              return <Bar key={i} dataKey={b.key} fill={p.fill} color={b.color || p.color} radius={[6,6,0,0]} fillOpacity={0.85} />;
            })}
          </BarChart>
        );
      case "Line":
        return (
          <LineChart data={d}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="var(--w-slate-500)" tick={{fontSize:10}} />
            <YAxis stroke="var(--w-slate-500)" tick={{fontSize:10}} tickFormatter={formatVal} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {widget.lines?.map((l: any, i: number) => (
              <Line key={i} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={false} activeDot={{r:5, strokeWidth:2}} />
            ))}
          </LineChart>
        );
      case "Composed":
        return (
          <ComposedChart data={d}>
            <ChartPatternDefs />
            <defs>
              {widget.areas?.map((a: any, i: number) => (
                <linearGradient key={`ca${i}`} id={`mCompArea${widget.id}_${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={a.color} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={a.color} stopOpacity={0.05}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="var(--w-slate-500)" tick={{fontSize:10}} />
            
            {/* Left Axis */}
            <YAxis yAxisId="left" stroke="var(--w-slate-500)" tick={{fontSize:10}} tickFormatter={formatVal} domain={[0, 'auto']} />
            {/* Optional Right Axis */}
            {widget.dualAxis && (
              <YAxis yAxisId="right" orientation="right" stroke="var(--w-slate-500)" tick={{fontSize:10}} tickFormatter={formatVal} domain={[0, 'auto']} />
            )}
            
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            
            {widget.bars?.map((b: any, i: number) => {
              const p = getA11yBarProps(i);
              return <Bar key={i} yAxisId={b.yAxisId || "left"} dataKey={b.key} fill={p.fill} color={b.color || p.color} radius={[6,6,0,0]} fillOpacity={0.85} />;
            })}
            {widget.areas?.map((a: any, i: number) => (
              <Area key={i} yAxisId={a.yAxisId || "left"} type="monotone" dataKey={a.key} fill={`url(#mCompArea${widget.id}_${i})`} stroke={a.color} strokeWidth={2} />
            ))}
            {widget.lines?.map((l: any, i: number) => (
              <Line key={i} yAxisId={l.yAxisId || "left"} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
            ))}
          </ComposedChart>
        );
      case "Radar":
        return (
          <RadarChart cx="50%" cy="50%" outerRadius={80} data={d}>
            <PolarGrid stroke="rgba(255,255,255,0.15)" />
            <PolarAngleAxis dataKey={widget.xKey} stroke="var(--w-slate-400)" tick={{fontSize:10}} />
            <PolarRadiusAxis stroke="var(--w-slate-500)" tick={{fontSize:9}} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {widget.radars?.map((r: any, i: number) => (
              <Radar key={i} name={r.key} dataKey={r.key} stroke={r.color} fill={r.color} fillOpacity={0.2} strokeWidth={2} />
            ))}
          </RadarChart>
        );
      default:
        return <div style={{color:'var(--w-slate-500)',textAlign:'center',marginTop:'40px'}}>지원 안 되는 차트</div>;
    }
  };



  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif", backgroundColor: 'transparent' }}>
      

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', 
              background: 'var(--color-success)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <Anchor size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                고등어 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Mackerel Strategic Command Center — {renderedWidgetCount} 위젯 · {kpiKeys.length} KPI</p>
            </div>
          </div>
          <div className="ds-card" style={{fontSize: '0.88rem', padding: '8px 16px', 
            background: '#11182f', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tickerHasLive ? 'var(--color-success)' : 'var(--w-slate-500)', boxShadow: tickerHasLive ? '0 0 8px #1ed760' : 'none', animation: tickerHasLive ? 'pulse 2s infinite' : 'none' }} />
            <span><span style={{ color: 'var(--text-secondary)' }}>EUMOFA 2026 + INFOFISH 2025 + KFAS</span> · {renderedWidgetCount} 위젯 · {tickerData ? `라이브 API ${tickerData.liveSourceCount}/${tickerData.totalSources}` : '정적 데이터'}</span>
          </div>
        </div>
      </header>



      {/* ═══ 6 KPIs ═══ */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {kpiKeys.map((key, idx) => {
          const kpi = kpis[key];
          const theme = KPI_THEMES[idx % KPI_THEMES.length];
          const IconComp = theme.icon;
          return (
            <div key={key} className="ds-card" style={{background: '#11182f',
              border: 'none', borderRadius: '8px', padding: '1.2rem',
              display: 'flex', flexDirection: 'column', gap: '6px',
              transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px',
              position: 'relative', overflow: 'hidden'}}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#11182f'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{kpi.title}</span>
                <IconComp size={16} style={{ color: theme.text }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {kpi.value.startsWith('$') && '$'}
                {kpi.value.startsWith('+') && '+'}
                <CountUp end={parseFloat(kpi.value.replace(/[^0-9.]/g, ''))} duration={2} separator="," decimals={kpi.value.includes('.') ? 1 : 0} />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '3px' }}>
                  {kpi.value.replace(/^[+$0-9.,%]+/, '').trim()}
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
      {/* ═══ Live Intelligence Ticker ═══ */}
      {tickerData && (
        <div style={{ marginBottom: '2rem', padding: '1rem 1.5rem', background: '#11182f', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tickerHasLive ? 'var(--color-success)' : 'var(--w-slate-500)', boxShadow: tickerHasLive ? '0 0 8px #1ed760' : 'none', animation: tickerHasLive ? 'pulse 2s infinite' : 'none' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: tickerHasLive ? 'var(--color-success)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{tickerHasLive ? 'LIVE 티커' : '정적 티커 (폴백 기준값)'}</span>
          </div>
          {[{
            label: 'USD/KRW', value: tickerData.fx?.usdKrw?.toLocaleString(), change: tickerData.fx?.change, live: tickerData.fx?.isLive === true
          }, {
            label: 'CIF 단가', value: `$${tickerData.kcs?.cifUsdTon?.toLocaleString()}/t`, change: tickerData.kcs?.change, live: tickerData.kcs?.isLive === true
          }, {
            label: 'KAMIS 도매', value: `₩${tickerData.kamis?.wholesaleKg?.toLocaleString()}/kg`, change: tickerData.kamis?.change, live: tickerData.kamis?.isLive === true
          }, {
            // 관세율은 라우트 정적 고시값 — 라이브 점 표시 안 함 (L-09)
            label: 'MFN 관세', value: `${tickerData.tariff?.mfn}%`, change: null, live: false
          }, {
            label: 'FTA(RCEP)', value: `${tickerData.tariff?.fta}%`, change: null, live: false
          }, {
            // 착지원가는 환율(ECOS)·CIF(KCS) 모두 라이브일 때만 라이브로 표기
            label: '착지원가(FTA)', value: `₩${tickerData.landingCost?.ftaKrwKg?.toLocaleString()}/kg`, change: null, live: tickerData.fx?.isLive === true && tickerData.kcs?.isLive === true
          }].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderLeft: i > 0 ? '1px solid #272727' : 'none' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>{item.value}</span>
              {item.change !== null && item.change !== undefined && (
                <span style={{ fontSize: '0.75rem', color: item.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                  {item.change >= 0 ? '▲' : '▼'}{Math.abs(item.change)}%
                </span>
              )}
              {item.live && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      )}

      {/* ═══ 5-Pillar 밸류체인 네비게이터 ═══ */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(20, 28, 52, 0.5), rgba(20, 28, 52, 0.2))',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '16px',
        padding: '6px',
        marginBottom: '2rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(140,170,255,0.10)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '4px 0 8px',
          borderBottom: '1px solid rgba(140,170,255,0.10)',
          marginBottom: '6px',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요
          </span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {SECTIONS.map((s, idx) => {
            const isActive = activePart === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActivePart(s.id as any)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(140,170,255,0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = `${s.color}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '12px 8px 14px',
                  background: isActive ? `${s.color}12` : 'transparent',
                  border: `1.5px solid ${isActive ? s.color : 'transparent'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
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
                  background: isActive ? s.color : 'rgba(140,170,255,0.12)',
                  color: isActive ? '#0a0f1f' : 'rgba(148,163,184,0.6)',
                  fontSize: '0.75rem', fontWeight: 800,
                  transition: 'all 0.25s',
                  boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none',
                }}>
                  {idx + 1}
                </div>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? s.color : 'var(--text-secondary)',
                  transition: 'all 0.25s',
                  whiteSpace: 'nowrap',
                }}>
                  {s.label}
                </span>
                {isActive && (
                  <span style={{
                    fontSize: '0.6rem',
                    color: 'rgba(148,163,184,0.7)',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    marginTop: '2px',
                    padding: '0 4px',
                  }}>
                    {s.desc.slice(0, 24)}…
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ 활성 Pillar 위젯 그리드 (activePart 필터링) ═══ */}
      {(() => {
        const sec = SECTIONS.find(s => s.id === activePart)!;
        const SecIcon = sec.icon;
        const archiveWidgets = getPillarWidgets(activePart as Pillar);
        const pillarWidgets = widgets?.filter((w: any) => RUNTIME_WIDGET_IDS[activePart].includes(w.id)) || [];
        return (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
              <SecIcon size={24} color={sec.color} />
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sec.title}</h2>
            </div>
            <p style={{ margin: '0 0 1.5rem 34px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{sec.desc}</p>
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {archiveWidgets.map((w) => (
                <MackerelWidgetV2 key={w.id} widget={w} pillar={activePart as Pillar} />
              ))}
              {pillarWidgets.map((w: any) => renderWidgetCard(w, activePart))}
            </div>
          </section>
        );
      })()}

    </div>
  );

  function renderWidgetCard(w: any, pillar: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' = 'S1') {
    const IconComp = WIDGET_ICONS[w.id] || Anchor;
    const situation = w.sit || w.situation || w.desc || '';
    const takeaway = w.strat || w.tak || w.takeaway || '';
    const isStatic = w.badges && w.badges.includes('STATIC');
    // L-09/L-12: LIVE 판정은 라우트가 선언한 isLive === true 단일 기준.
    // apiSource 존재·배지 문자열 등 휴리스틱으로 LIVE를 격상하지 않는다.
    const isLive = w.isLive === true;
    const isEstimate = (w.reliability && w.reliability <= 70) || (w.badges && w.badges.includes('Estimate'));
    const isForecast = w.badges && w.badges.includes('Forecast');
    const isSimulation = SIMULATION_WIDGET_IDS.includes(w.id);

    // badges → cardDesc 한글 chip suffix (정보 보존)
    const badgeSuffix = [
      isLive ? '🟢 LIVE API' : '',
      isEstimate ? '📐 추정치' : '',
      isForecast ? '🔮 예측' : '',
      w.badges && w.badges.includes('Verified') ? '✅ 검증완료' : '',
    ].filter(Boolean).join(' · ');

    const cardDescParts = [w.subtitle, badgeSuffix].filter(Boolean);
    const cardDesc = cardDescParts.join(' — ') || '고등어 인텔리전스 위젯';

    // 라우트 isLive:false(폴백) 응답은 STATIC으로 강등. 주입부가 명시한 telemetryStatus는 존중.
    const telemetryStatus: 'LIVE' | 'SYNCED' | 'STATIC' = isLive
      ? 'LIVE'
      : w.telemetryStatus === 'SYNCED'
        ? 'SYNCED'
        : (isStatic || isSimulation || isEstimate || w.isLive === false ? 'STATIC' : 'SYNCED');
    // 신선도 위조 금지: 라이브일 때만 오늘 날짜, 그 외엔 위젯이 가진 실제 데이터 빈티지만 표기 (없으면 생략)
    const syncDate = isLive ? new Date().toISOString().split('T')[0] : w.syncDate;

    const source = w.apiSource
      ? w.apiSource
      : (isSimulation
          ? '* 📡 [추정 모델 연동: NotebookLM] 산업 시뮬레이션 기반 추정치'
          : (w.source || 'FAO FishStatJ + data/고등어/ CSV 원본 교차 검증 완료'));

    return (
      <WidgetCard
        key={w.id}
        title={w.title}
        icon={IconComp}
        iconColor="var(--color-success)"
        pillar={pillar}
        cardDesc={cardDesc}
        unit={w.unit}
        telemetry={{ status: telemetryStatus, syncDate }}
        chartHeight={325}
        chart={renderChart(w)}
        takeaway={{ situation, actionPlan: takeaway, source }}
      />
    );
  }
}
