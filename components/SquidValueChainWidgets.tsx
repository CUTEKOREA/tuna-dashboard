import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ZAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, AreaChart, Area, ComposedChart, Line, Cell, LabelList } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Anchor, Factory, ShoppingCart, Truck, DollarSign } from 'lucide-react';
import { WidgetCard, tooltipStyle, COLORS } from './ShrimpWidgetCommon';

const formatNum = (v: number) => new Intl.NumberFormat('en-US').format(v);

// Custom label renderer for scatter points - shows species name next to each dot
const renderScatterLabel = (props: any) => {
  const { x, y, value } = props;
  // Shorten label for display
  const short = value?.replace(/\s*\(.*?\)\s*/g, '') || '';
  return (
    <text x={x} y={y - 15} textAnchor="middle" fill="#e2e8f0" fontSize={11} fontWeight={600}>
      {short}
    </text>
  );
};

// 1. 조업 및 해역 (Fishing & Sourcing)
const fishingData = [
  { name: '일렉스 (아르헨티나)', size: 40, lifespan: 1, volume: 400, fill: COLORS[0] },
  { name: '훔볼트 (페루)', size: 150, lifespan: 1.5, volume: 800, fill: COLORS[3] },
  { name: '롤리고 (포클랜드)', size: 15, lifespan: 1, volume: 200, fill: COLORS[5] }
];

export const SquidVCFishing = () => (
  <WidgetCard
    title="조업 및 어장 특성 (Fishing)"
    icon={Anchor}
    term="어종별 생물학적 스펙트럼"
    desc="일렉스/롤리고(남서대서양) vs 훔볼트(동태평양) 조업 특성"
    source="FAO FishStatJ + SPRFMO Species Profiles + INIDEP·IMARPE·FIG"
    situation="훔볼트 오징어는 외투막 최대 1.5m, 체중 최대 50kg에 달하는 대형 어종으로 대량 어획이 가능하나 동태평양 기후(엘니뇨)에 민감. 반면 일렉스와 롤리고는 남서대서양에서 조업되며 크기가 상대적으로 작음."
    actionPlan="해역별(남서대서양 vs 동태평양) 어획 쿼터 및 기후 리스크를 분산시키는 투트랙 소싱 전략 구사 필수."
    telemetry={{ status: 'STATIC', syncDate: '2026-06-05' }}
  >
    <div style={{ height: 340, width: '100%' }}>
      <SafeResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 40, right: 30, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis type="number" dataKey="size" name="크기 (cm)" stroke="#94a3b8" tickFormatter={(v) => v + 'cm'} />
        <YAxis type="number" dataKey="lifespan" name="수명 (년)" stroke="#94a3b8" tickFormatter={(v) => v + '년'} domain={[0, 1.8]} />
        <ZAxis type="number" dataKey="volume" range={[200, 1500]} name="조업 규모" />
        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} itemStyle={{ color: '#fff' }} />
        <Scatter name="어종" data={fishingData}>
          {fishingData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
          <LabelList dataKey="name" content={renderScatterLabel} />
        </Scatter>
      </ScatterChart>
      </SafeResponsiveContainer>
    </div>
  </WidgetCard>
);

// 2. 가공 및 전처리 (Processing)
const processingData = [
  { metric: '전처리 필요성', 일렉스: 40, 훔볼트: 100, 롤리고: 20 },
  { metric: '가공 수율', 일렉스: 70, 훔볼트: 50, 롤리고: 85 },
  { metric: '자동화 적합성', 일렉스: 80, 훔볼트: 40, 롤리고: 90 },
  { metric: '부가가치 창출력', 일렉스: 50, 훔볼트: 90, 롤리고: 70 },
  { metric: '선도 보존 중요성', 일렉스: 60, 훔볼트: 30, 롤리고: 100 }
];

export const SquidVCProcessing = () => (
  <WidgetCard
    title="가공 난이도 및 수율 (Processing)"
    icon={Factory}
    term="어종별 전처리/가공 맵"
    desc="암모니아 제거(훔볼트) vs 원물 보존(롤리고)"
    source="KMI 해양수산개발원 가공 보고서 + ANFACO-CECOPESCA(스페인) + EUMOFA Cephalopods"
    situation="훔볼트 오징어는 특유의 암모니아 향 제거를 위한 전처리와 해체 공정(다루마 가공)이 필수적이나 가공 후 부가가치(진미채 등)가 상대적으로 높음. 롤리고는 선도 유지가 핵심."
    actionPlan="훔볼트 원물 수입 후 국내 가공 대신, 페루 현지 1차 가공 공장(Packer) 직접 투자를 통한 전처리 내재화 및 수율 방어."
    telemetry={{ status: 'STATIC', syncDate: '2026-06-05' }}
  >
    <div style={{ height: 280, width: '100%' }}>
      <SafeResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={processingData}>
        <PolarGrid stroke="rgba(255,255,255,0.2)" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name="훔볼트" dataKey="훔볼트" stroke={COLORS[3]} fill={COLORS[3]} fillOpacity={0.4} />
        <Radar name="일렉스" dataKey="일렉스" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.4} />
        <Radar name="롤리고" dataKey="롤리고" stroke={COLORS[5]} fill={COLORS[5]} fillOpacity={0.4} />
        <RechartsTooltip contentStyle={tooltipStyle} />
      </RadarChart>
      </SafeResponsiveContainer>
    </div>
  </WidgetCard>
);

// 3. 제품 및 용도 (Product End-use)
const productData = [
  { name: '냉동 식자재 (볶음/탕)', 일렉스: 80, 훔볼트: 20, 롤리고: 10 },
  { name: '가공식품 (진미채/튀김)', 일렉스: 20, 훔볼트: 90, 롤리고: 5 },
  { name: '고급 외식 (칼라마리)', 일렉스: 10, 훔볼트: 5, 롤리고: 95 }
];

export const SquidVCProduct = () => (
  <WidgetCard
    title="B2B/B2C 제품 포지셔닝 (Product)"
    icon={ShoppingCart}
    term="어종별 타겟 소비 시장"
    desc="식자재(일렉스) vs 가공원료(훔볼트) vs 고급(롤리고)"
    source="EUMOFA EU Cephalopod Market + KAMIS 한국 농수산식품유통공사"
    situation="각 어종의 물리적 특성(크기, 식감)으로 인해 주요 용도가 뚜렷이 구분됨. 롤리고는 프리미엄 다이닝, 일렉스는 대중 식당의 볶음용 범용 식자재, 훔볼트는 HMR 및 스낵류 가공 원료로 주로 소비됨."
    actionPlan="단일 어종 의존도를 낮추고 B2B(일렉스) - HMR(훔볼트) - 프리미엄(롤리고)을 잇는 통합 프로덕트 라인업(포트폴리오) 구축."
    telemetry={{ status: 'STATIC', syncDate: '2026-06-05' }}
  >
    <div style={{ height: 280, width: '100%' }}>
      <SafeResponsiveContainer width="100%" height="100%">
      <BarChart data={productData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" />
        <YAxis type="category" dataKey="name" stroke="#94a3b8" width={100} fontSize={11} />
        <RechartsTooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar dataKey="일렉스" stackId="a" fill={COLORS[0]} name="일렉스" />
        <Bar dataKey="훔볼트" stackId="a" fill={COLORS[3]} name="훔볼트" />
        <Bar dataKey="롤리고" stackId="a" fill={COLORS[5]} name="롤리고" />
      </BarChart>
      </SafeResponsiveContainer>
    </div>
  </WidgetCard>
);

// 4. 물류 및 유통 (Logistics)
const logisticsData = [
  { stage: '현지 항구', 일렉스: 100, 훔볼트: 150, 롤리고: 30 },
  { stage: '해상 운송', 일렉스: 95, 훔볼트: 120, 롤리고: 28 },
  { stage: '1차 보관(냉동창고)', 일렉스: 90, 훔볼트: 90, 롤리고: 25 },
  { stage: '국내 유통', 일렉스: 80, 훔볼트: 70, 롤리고: 20 },
];

export const SquidVCLogistics = () => (
  <WidgetCard
    title="글로벌 콜드체인 볼륨 (Logistics)"
    icon={Truck}
    term="유통 단계별 물동량"
    desc="통마리(벌크) vs 다루마(필렛) 물류 구조 비교 — 자체추정"
    source="UN Comtrade + OEC + KCS 관세청 + Vigo(ES) Port Statistics"
    situation="대형 훔볼트 오징어는 원물 이동 시 물류비 부담이 커 산지에서 1차 가공(수율 감소) 후 다루마 형태로 해상 운송됨. 반면 일렉스는 어획 직후 통마리 냉동되어 벌크 물동량을 견인함."
    actionPlan="B2B 범용망(일렉스 냉동 블록)과 가공공장 직납망(훔볼트 다루마)을 이원화 설계하여 냉동창고 회전율 향상."
    telemetry={{ status: 'STATIC', syncDate: '2026-06-05' }}
  >
    <div style={{ height: 280, width: '100%' }}>
      <SafeResponsiveContainer width="100%" height="100%">
      <AreaChart data={logisticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIllex" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.6}/><stop offset="95%" stopColor={COLORS[0]} stopOpacity={0}/></linearGradient>
          <linearGradient id="colorHumboldt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS[3]} stopOpacity={0.6}/><stop offset="95%" stopColor={COLORS[3]} stopOpacity={0}/></linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} />
        <RechartsTooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="훔볼트" stroke={COLORS[3]} fill="url(#colorHumboldt)" />
        <Area type="monotone" dataKey="일렉스" stroke={COLORS[0]} fill="url(#colorIllex)" />
      </AreaChart>
      </SafeResponsiveContainer>
    </div>
  </WidgetCard>
);

// 5. 가격 및 시장 전략 (Price Strategy)
const marketData = [
  { item: '원물 매입단가', 롤리고: 6.5, 일렉스: 3.5, 훔볼트: 1.8 },
  { item: '관세 및 물류', 롤리고: 7.5, 일렉스: 4.5, 훔볼트: 2.5 },
  { item: '도매 출하가', 롤리고: 10.5, 일렉스: 6.0, 훔볼트: 3.8 },
  { item: '최종 가공가', 롤리고: 12.0, 일렉스: 7.5, 훔볼트: 9.5 } // 훔볼트는 부가가치가 큼
];

export const SquidVCMarket = () => (
  <WidgetCard
    title="가격 구조 및 전략 마진 (Market Strategy)"
    icon={DollarSign}
    term="가치사슬별 단가 (USD/kg)"
    desc="가치사슬 단계별 단가 구조 비교 (USD/kg) — illustrative, 업계추정 기반"
    source="KCS 관세청 수입 단가 + KAMIS 소매가 + EUMOFA First Sales (단가 구조는 업계추정)"
    situation="원물 매입 단가는 훔볼트가 가장 저렴하나, 진미채 등 다단계 가공을 거치며 최종 소매 가치는 상당히 뜀. 롤리고는 원물 자체가 고가 프리미엄 시장을 형성하며, 일렉스는 중간 가격대를 유지하는 경향이 있음."
    actionPlan="롤리고는 프리미엄 브랜딩으로 객단가를 방어하고, 훔볼트는 높은 가공 마진을 노리는 '저원가 고차가공' 모델로 이익 구조를 개선."
    telemetry={{ status: 'STATIC', syncDate: '2026-06-05' }}
  >
    <div style={{ height: 280, width: '100%' }}>
      <SafeResponsiveContainer width="100%" height="100%">
      <ComposedChart data={marketData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis dataKey="item" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => '$'+v} />
        <RechartsTooltip contentStyle={tooltipStyle} formatter={(v: number) => '$' + v.toFixed(2)} />
        <Bar dataKey="롤리고" fill={COLORS[5]} radius={[4,4,0,0]} barSize={20} />
        <Bar dataKey="일렉스" fill={COLORS[0]} radius={[4,4,0,0]} barSize={20} />
        <Line type="monotone" dataKey="훔볼트" stroke={COLORS[3]} strokeWidth={3} dot={{ r: 4 }} />
      </ComposedChart>
      </SafeResponsiveContainer>
    </div>
  </WidgetCard>
);
