'use client';
// trigger reload

import React from 'react';
import styles from './TunaOperationalInsights.module.css';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  AreaChart, Area, ComposedChart, Cell
} from 'recharts';
import { 
  Target, Anchor, ShieldCheck, TrendingUp, AlertCircle, Thermometer, Box, Zap, FileWarning, 
  Ship, Brain, Leaf, DollarSign, Briefcase, Cpu, Network, Scale, MapPin, Crown, Diamond, Sprout, Flag, Magnet, ArrowRightLeft, CloudRain, Navigation
} from 'lucide-react';
import TermTooltip from './TermTooltip';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { ChartPatternDefs } from './ChartPatterns';
import { ReeferCompetitorInflowWidget, ReeferPortCongestionWidget, ReeferSupplyPriceOverlayWidget, ReeferCarrierEfficiencyWidget } from './TunaReeferLogisticsWidgets';
import { truncateXAxis } from '../lib/chart-standards';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#1a2442',
        border: '1px solid #334155',
        padding: '12px',
        borderRadius: '6px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <p style={{ margin: '0 0 8px 0', color: '#f8fafc', fontWeight: 600, fontSize: '0.9rem' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: '4px 0 0 0', color: entry.color, fontSize: '0.85rem' }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Helper components mapping directly into styles
const CardHeader = ({ title, icon: Icon, term, desc }: any) => (
  <div className={styles.cardHeader}>
    <h3 className={styles.cardTitle}>
      <Icon size={18} className={styles.cardIcon} /> {title}
    </h3>
    <TermTooltip term={term} description={desc} />
  </div>
);

const TakeawayBox = ({ id }: { id: string }) => {
  const takeawaysMap: Record<string, any> = {
    "enso": {
      "source": "NOAA Climate Data & ISSF CPUE Report / WCPFC SC21 Summary",
      "situation": "ENSO(엘니뇨·라니냐)는 어군 이동의 최대 변수입니다. 엘니뇨 시 Warm Pool이 동쪽으로 이동하면서 중태평양(키리바시·마샬 해역) CPUE는 상승하지만, 전통 서태평양(PNG·솔로몬 해역) CPUE는 하락합니다. 차트의 CPUE는 서태평양 전통 어장 기준이며, 2024년 엘니뇨(+1.2°C)로 서태평양 CPUE가 85로 하락한 반면 중태평양은 호조였습니다. 2026년 라니냐 전환(-1.0°C) 예보 시 서태평양 CPUE는 110으로 반등 전망이나, 중태평양은 역으로 위축됩니다.",
      "short": "엘니뇨 예보 시 중태평양(키리바시·마샬) 조업 허가권 선제 확보, 라니냐 전환 시 서태평양(PNG·솔로몬) 복귀 전략 병행해야 합니다.",
      "long": "표층 수온(SST) AI 모델을 도입하여 ENSO 국면별 최적 해역 자동 추천 및 선단 연료 소모율 15% 감축 극대화해야 합니다.",
      "risk": "엘니뇨/라니냐 전환 타이밍 예측 실패 시 빈 해역 조업으로 수익 손실 발생. 태풍 빈도 상승 시 대피 매뉴얼 점검 및 해상 통신 인프라(스타링크) 확보해야 합니다."
    },
    "fad": {
      "source": "WCPFC Technical Report on Eco-FADs",
      "situation": "일반 FAD 대비 스마트 FAD(Eco)를 사용할 경우, 주요 타겟 어종(스킵잭)의 어획 비율이 60%에서 85%로 대폭 상승하고, 부수어획(혼획)은 10%에서 3%로 감소합니다. 이는 EU·미주 유통망이 요구하는 '지속가능 조업 인증' 기준을 충족시키며, 생분해성 소재 전환이 곧 시장 접근권의 핵심 무기가 됩니다.",
      "short": "생분해성 FAD 우선 도입으로 유럽/미주 리테일 바이어 계약 연장해야 합니다.",
      "long": "에코사운더 결합 분석으로 타겟 초정밀 탐색 시스템 내재화.",
      "risk": "FAD 유실률(Loss rate) 통제로 해양 오염 부과금 페널티 방어해야 합니다."
    },
    "port": {
      "source": "Global Port Demurrage DB & WCPO Unloading Log & Drewry Reefer Index",
      "situation": "7~9월 금어기(FAD Closure) 시즌은 하역 대기일(최대 14일)과 초저온 운반선 운임(최대 $7,200/FEU)이 동시에 폭증하는 '이중 병목' 구간입니다. 이 기간 대기 손실만 8월 최고 $850K에 이르며, 비수기(4월: 대기 3일, $4,800/FEU) 대비 총비용이 3~4배 팽창합니다. 금어기 직전 물량 집중과 콜드체인 수요 폭증이 겹치면서 체선료(Demurrage)가 하루 $10K 이상 발생하는 리스크 구간입니다.",
      "short": "금어기 2개월 전 셔틀 선박 용선 완료 및 양륙 터미널·냉동 플러그 장기 임대 조기 조기 락인해야 합니다.",
      "long": "마주로·방콕 등 주요 허브의 냉동 창고 지분 투자 + 직행 콜드 셔틀(안데스 ↔ 아시아) 통합 하역 인프라 내재화.",
      "risk": "체선료 폭등 + 운임 스파이크 동시 발생 시 대체 하역항(필리핀 등) 사전 발굴 및 하루 $10K 페널티 시뮬레이션 모델 즉시 가동해야 합니다."
    },
    "em_reg": {
      "source": "WCPFC EM Coverage Analysis & Compliance Records",
      "situation": "EM(전자 모니터링) 탑재율을 5%(2021)에서 80%(2027E)까지 올리면, 규제 적발 페널티가 $450K에서 $10K으로 급감합니다. 커버리지 15%를 넘기는 순간부터 페널티 감소 속도가 가팔라지며, 이는 AI 카메라 도입이 단순 비용이 아닌 ROI 극대화 투자임을 보여줍니다.",
      "short": "IUU 리스크 해역부터 카메라/전자 모니터링 시범 탑재 우선 지시해야 합니다.",
      "long": "불법 어획 적발 방어를 넘어 추적성(Traceability) 상품 라인업 확대로 프리미엄 마진 획득.",
      "risk": "불시 항만국 통제(PSC) 시 무결점 방어망으로 벌금 및 수출 차단 완전 완전 회피해야 합니다."
    },
    "msc": {
      "source": "MSC Market Update & Global Retailer Seafood Standards",
      "situation": "MSC 인증 물량의 체결가가 일반 스킵잭 기준가 대비 연도별로 꾸준히 프리미엄을 형성하며, 2027년에는 격차가 $550/톤(일반 $1,600 vs MSC $2,150)까지 벌어질 전망입니다. 이 프리미엄 갭($550)은 인증 유지 비용을 감안해도 5배 이상의 수익률을 보장하는 안정 마진 구간입니다.",
      "short": "MSC 연계 물량을 글로벌 메이저(코스트코 등) 납품 시 협상 무기로 활용.",
      "long": "관할 해역 내 FIP(어업개선프로젝트) 펀딩 주도권 확보로 향후 MSC 독점 가속화.",
      "risk": "인증 유지비 대비 프리미엄 수익이 5배 이상 상회하므로 관련 예산 삭감 엄금."
    },
    "pouch": {
      "source": "NielsenIQ Retail Seafood Trends & Internal Margin DB",
      "situation": "전통 물/오일 캔은 성장이 정체(-2.5%)된 반면, 프리미엄 파우치(+14.5%)와 RTE 샐러드 팩(+22.0%)은 폭발적 성장 중입니다. 마진율로 보면 전통 캔(8%) 대비 RTE 팩(35%)은 4배 이상의 매출총Bottom-line(순이익)을 달성하고 있어, 생산 라인 전환의 시급성이 데이터로 확인됩니다.",
      "short": "고마진 프리미엄 파우치 팩(갈릭/올리브 튜나) 생산 라인 용량 2배 즉각 즉각 증설해야 합니다.",
      "long": "헬스/단백질 소비 문화 트렌드를 타고 피트니스 레벨의 B2C 구독망 침투 계획을 수립해야 합니다.",
      "risk": "플라스틱 사용 규제(환경 부담금) 시뮬레이션으로 포장재 전환점 사전 사전 조율해야 합니다."
    },
    "blackhole": {
      "source": "CFR Bangkok Price Index & EU/US Cold Storage Data",
      "situation": "24-Q1 '패닉' 구간에서 스킵잭 방콕 시세가 $1,400에서 $1,900으로 35% 급등한 반면, EU·US 창고 재고지수는 40~45까지 급감했습니다. 이후 Q3에서 재고가 85~90으로 회복되자 가격은 $1,600으로 다시 하락하여, '패닉 바잉 → 과잉 재고 → 가격 폭락' 사이클이 뚜렷하게 나타납니다.",
      "short": "어가 반등 뉴스 캐치 시 즉시 2개월치 물량 창고 락인(Wait & Hold) 즉각 실행해야 합니다.",
      "long": "미국/EU 메이저 수입상의 재고 소진 시기(수요 공백기)를 계산하여 저점 매수 고점 고점 방출해야 합니다.",
      "risk": "수입상 재고 조기 포화 시 데드캣 바운스 전 빠르게 덤핑/투매하는 역학 밸런스 통제해야 합니다."
    },
    "rival": {
      "source": "Global Seafood Major 3 Annual Reports (Maruha, Thai Union, Dongwon)",
      "situation": "글로벌 메이저 3사의 포트폴리오를 보면, Maruha는 이미 양식업(45%) 중심으로 전환 완료했고, Thai Union은 가치 부가(45%) 비중이 입니다. 반면 Dongwon은 참치 비중이 55%로 단일 어종 의존도(Exposure)가 여전히 높아, 어가 폭락 사이클에 가장 취약한 구조임을 보여줍니다.",
      "short": "Maruha, Thai Union 등 메이저사의 비참치(Non-tuna)/양식업 지분 매입 흐름 추적해야 합니다.",
      "long": "순수 조업/가공 밸류체인을 넘어선 수직계열화(CVC 투자 병행)로 캐시카우 다변화해야 합니다.",
      "risk": "어가 폭락 사이클 진입 시, 단일 어종 의존도(Exposure)가 높은 기업은 흑자 부도로 직행할 수 있음을 경계해야 합니다."
    },
    "quota": {
      "source": "ICCAT, WCPFC, IATTC Annual Quota Allocations",
      "situation": "ICCAT 관할 해역의 쿼터가 -22%로 가장 큰 폭의 삭감이 예상되며, 초과 시 페널티 배율은 300%에 달합니다. WCPFC도 -15% 삭감/200% 페널티, IATTC은 -10%/150% 수준으로, 사전에 대체 해역 조업권을 확보하지 못하면 한 차례의 쿼터 초과만으로도 연간 수익이 소멸될 수 있습니다.",
      "short": "빅아이/옐로핀 차년도 삭감 가능성 대비 선제적 대체 해역 조업권 매집 시뮬레이션 즉시 가동해야 합니다.",
      "long": "할당량 기반 매매(Trading) 시장에서 장기 계약 기반의 쿼터 락인 옵션 조기 조기 매수해야 합니다.",
      "risk": "쿼터 초과 시 징수되는 페널티 모델과 잉여 Bottom-line(순이익) 간의 최적화 손익 분기점 확보해야 합니다."
    },
    "labour": {
      "source": "CBP Withhold Release Order(WRO) Data & NGO Reports",
      "situation": "2022년 노동 이슈 12건, 항만 입항 거부 3건이었던 상황이 추적 인증 구비율을 45%→98%로 끌어올리자 2026년에는 이슈 1건, 거부 0건으로 극적으로 개선되었습니다. 블록체인 기반 추적 인증서가 '보험' 역할을 하며, CBP(미 세관) 강제 노동 억류를 사전 방어하는 핵심 무기임을 보여줍니다.",
      "short": "미 세관(CBP) 강제 노동 관련 억류를 피할 추적 가능 인증서 블록체인 체계 연동해야 합니다.",
      "long": "벤더사 및 인력 송출국 대상 분기별 자체 감사(Audit) 조직 신설로 리스크 내재화 방지해야 합니다.",
      "risk": "표적 캠페인에 의한 글로벌 NGO의 어선 블랙리스트 지정 가능성 원천 원천 차단해야 합니다."
    },
    "ai_bep": {
      "source": "Internal Fleet Operations R&D & Starlink Cost Index",
      "situation": "2025년을 기점으로 인간 옵서버 인건비($62K)를 AI 감시망 시스템 유지비용($45K)이 역전장(Cross-over)하며 골든크로스를 달성합니다. 이후 AI 시스템 감가상각으로 비용은 $35K까지 수직 하락하는 반면 인건비는 $67K까지 상승합니다. 2026년 기준 대인 대비 AI가 선박당 $32K(약 4천만원) 절감되므로, 20척 기준 연 $640K 순익 증대가 확정됩니다.",
      "short": "2025년 크로스오버 기점에서 전 선대에 스타링크 해상망 연동 AI 카메라 설치 설치 돌입해야 합니다.",
      "long": "인공지능 어구 투척 최적화 알고리즘 기반 수확량 증대 딥러닝 고도화 달성해야 합니다.",
      "risk": "인간 옵서버 단절 시 비상 사태 대처가 즉각적이지 못하므로 육상 대기조 통신망 확보 강화해야 합니다."
    },
    "margin": {
      "source": "초저온 프리미엄 지수 & Fleet Fuel Cost Analytics & FAO/FFA Fleet Economics",
      "situation": "차트는 글로별 상위권 연승 업체(일본·대만 초저온 선단)의 사시미급 프리미엄 마진 추세를 보여줍니다. 단, 신라교역의 연승 사업이 적자인 것은 이 추세와 모순되지 않습니다. 핵심 괴리는 (1) 노후화된 선단의 연료 비효율(Inefficiency), (2) -60°C 초저온 콜드체인 미비로 사시미 프리미엄 단가를 몇 수용하지 못하는 점, (3) 시장 직거래 대신 중간 중개상 납품으로 단가가 20~30% 할인되는 구조입니다. 즉, 마진 역전의 수혜는 초저온 시설+사시미 직거래망을 갖춤 업체에만 해당되며, 그렇지 못한 연승은 오히려 선망보다 나쁜 마진 구조에 갇힐니다.",
      "short": "우리 연승 선단의 초저온(-60°C) 콜드체인 능력 긴급 진단: 사시미 프리미엄 단가 획득이 불가하면 연승 철수/축소 결단 병행해야 합니다.",
      "long": "연승 유지 시: 초저온 냉동 설비 투자 + 일본 초소거 경매 시장 직거래망 구축으로 마진 역전 구간 진입. 철수 시: 선망 전용 스킵잭 증산에 외력 집중해야 합니다.",
      "risk": "현 연승 적자 지속 시 매년 손실이 누적되는 구조: 철수 vs 초저온 냉동 투자의 손익분기점 시뮬레이션 즉각 수행 수행 필수입니다."
    },
    "finance": {
      "source": "Global Green Finance / Sustainability-Linked Loan Benchmarks",
      "situation": "표준 금리(6.5%)에서 녹색 채권(4.8%), 탄소 배출권 스왑(3.2%)으로 전환할수록 조달 비용이 절반까지 감소합니다. 기존 대출 대비 SLL(지속가능성 대출)은 연간 3.3%포인트의 금리 차익을 제공하며, 이는 선박 1척당 연간 $165K(대출 $5M 기준)의 순금융비용 절감과 직결됩니다.",
      "short": "선박 하이브리드 추진 모델 전환 시 즉각 SLL(지속가능성 대출) 저금리 기금 차익.",
      "long": "해양 크레딧 배출권 시장 진출 시뮬레이션을 통해 유럽 택스 스왑 헤지 선제 적용해야 합니다.",
      "risk": "향후 탄소 발자국 증빙 추적 실패 시 유럽 CBAM(탄소 국경세)으로 인한 수출 진입장벽 폭발 방어해야 합니다."
    },
    "gsp": {
      "source": "EU GSP+ Tariff Exemptions & Global Logistics Rate Index",
      "situation": "태국 경유 시 EU 수입 관세 24% + 물류비 5%가 발생하지만, 에콰도르(관세 0%, 물류 8%) 또는 파푸아뉴기니(관세 0%, 물류 7%)로 가공 경로를 전환하면 순 비용이 21~17%포인트 감소합니다. 물류비가 3%p 증가하더라도 관세 24%를 완전 회피하므로 21%p의 순마진 차익이 확보되는 구조입니다.",
      "short": "아프리카, 태평양 도서국 등 0% 관세 혜택 국가로의 1차 가공(Loin) 아웃소싱 테스트 테스트 오더를 진행해야 합니다.",
      "long": "태국(24% 관세) 대비 물류비(3%) 증가에도 불구하고 21% 마진 차익 확보를 위한 허브 재배치.",
      "risk": "정치적 이슈로 GSP+ 혜택 강제 박탈 시 즉각 대체 가능한 허브(필리핀 등) 투트랙 투트랙 유지해야 합니다."
    },
    "byproduct": {
      "source": "Global Pet Food Margin Report & Fishmeal Byproduct Valorization DB",
      "situation": "참치캔 본품의 영업Bottom-line(순이익)률(8%)은 매입원가 한계에 부딪힌 반면, 펫푸드(25%)와 오메가-3 오일(55%)은 동일 원재료(잔여 뼈/내장)에서 3~7배의 마진을 창출합니다. 현재 15%에 달하는 잔여물을 100% 활용할 경우 폐기비용 제로화와 함께 연간 신규 매출원이 발생하는 이중효과를 기대할 수 있습니다.",
      "short": "잔여 뼈/내장의 15%를 직접 펫푸드(Pet Care) 라인으로 이동시켜 폐기비용 즉각 0원 달성해야 합니다.",
      "long": "어분에 특화된 라인을 넘어 초프리미엄 펫푸드 자회사 인수합병(M&A) 전략 검토해야 합니다.",
      "risk": "원물 마진(8%) 한계를 뷰티/펫(30%~50%)로 방어하여 어상폭락 사이클 완충 파이프라인 파이프라인을 생성해야 합니다."
    },

    "albacore": {
      "source": "North American Canned Tuna Retail Insights & FAO Production Data & WCPFC Stock Assessment",
      "situation": "스킵잭 점유율이 2021년 80%에서 2027년 50%까지 하락하는 반면, 알바코어(화이트 미트)는 20%에서 50%로 동등 수준까지 치고 올라옵니다. 신라교역처럼 선망으로 스킵잭을 주력 조업하는 기업에게 이 교차 곡선은 직접적 위협입니다. 알바코어 어획의 90% 이상이 연승+트롤링이며 선망으로는 타겟 조업이 사실상 불가능하므로, 스킵잭 자체의 브랜드 가치 방어와 가공품 다변화가 핵심 생존 전략입니다.",
      "short": "스킵잭의 '건강한 단백질' 브랜딩 강화: 알바코어 대비 가격경쟁력+단백질 함량 우위 마케팅으로 북미 시장 방어해야 합니다.",
      "long": "스킵잭 원물의 RTE(즉석섭취) 파우치/샐러드 등 고부가가치 가공품 전환으로 단순 캔 vs 알바코어 직접 경쟁을 회피하고 신시장 시장 개척을 가속화해야 합니다.",
      "risk": "선망으로 알바코어 타겟 조업 사실상 불가 → 원물 조달(OEM 매입) 또는 남태평양 연승·트롤 협력사 파트너십으로 라인업 확보 검토해야 합니다."
    },
    "foodservice": {
      "source": "Global Foodservice vs Retail Seafood Consumption Trends",
      "situation": "24-1Q에는 외식(Foodservice) 수요가 120으로 소매 80을 압도했으나, 고금리 장기화로 25-1Q에는 외식이 80으로 급감하고 소매(통조림 B2C)가 140으로 역전되었습니다. 이 '수요 스위칭'은 경기침체기마다 반복되는 패턴으로, 외식 채널 의존도(Exposure)가 높은 기업은 즉각적인 채널 전환 없이 매출 40% 감소를 맞이하게 됩니다.",
      "short": "물가고로 외식(레스토랑) 수요가 끊길 때, 소매(통조림) B2C 판촉 예산 150% 선제 선제 투입해야 합니다.",
      "long": "외식망 냉동 필릿 등 블록형 원물 계약을 취소하고 가공 파우치로 즉시 우회 돌릴 수 있는 가변 계약화해야 합니다.",
      "risk": "소매가 동결 시 Bottom-line(순이익) 압박을 막기 위해 슈링크플레이션(무게 미세 감소) 적용 테스트 발동."
    },
    "hub": {
      "source": "Southeast Asia & LatAm Tuna Processing Hub Shift Report",
      "situation": "태국 방콕의 가공 허브 점유율이 2020년 55%에서 2025년 35%로 20%p 하락하는 반면, 에콰도르 만타(15%→28%)와 베트남 호치민(10%→18%)이 공격적으로 점유율을 확대하고 있습니다. 태국의 최저임금 상승(+40%)과 바트화 강세가 비용 경쟁력을 잠식하면서, 글로벌 가공 패권이 중남미·동남아로 분산되는 중입니다.",
      "short": "바트화 전면 강세 및 인력난 대처를 위해 베트남/에콰도르 하역 턴어라운드 허브 우선 선제 선제 적용해야 합니다.",
      "long": "동남태평양 원물 직행 코스(에콰도르 만타 포트) 다이렉트 OEM 활성화 구축해야 합니다.",
      "risk": "안데스/신규 허브 초기 수율 문제(클레임) 통제를 위해 자사 품질 감리관 상주 조직 체계 확보해야 합니다."
    },
    "altseafood": {
      "source": "Good Food Institute (GFI) Alternative Seafood Market Forecast",
      "situation": "대체 해산물(식물성/배양 참치) 시장 점유율이 2022년 0.5%에서 2030년 22%까지 폭발적 성장이 예상됩니다. 현재는 미미하지만, 2026년(5.8%) → 2030년(22%) 구간의 가속도가 핵심이며, 이 시기에 전통 조업 기업이 방어 포트폴리오 없이는 감가상각 가치 훼손이 불가피한 곡선 구조를 보여줍니다.",
      "short": "배양 등 비건 참치 샌드위치가 북미 시장을 잠식하는 투입 속도 시장 척도 B2C 스킨십 파일럿 도입해야 합니다.",
      "long": "자생적 개발 10년 투입보다, 시장 리더형 스타트업 지분참여(CVC Buy-out)로 생존형 포트폴리오 편입해야 합니다.",
      "risk": "식물성 참치 시장 20% 점유 사이클(2030) 도달 시 폭발하는 전통 조업 감가상각 가치 훼손 헤지 전술을 구사해야 합니다."
    },
    "species_dom": {
      "source": "FAO Global Fisheries Origin Database (1950-2024)",
      "situation": "1950년부터 2024년까지 75년간 어종별 생산 추이를 보면, 가다랑어(Skipjack)가 전체 생산의 약 60%(357만 톤)를 독점적으로 차지하며, 눈다랑어(Bigeye)는 33만 톤으로 정체·감소세에 진입했습니다. 황다랑어(Yellowfin)는 171만 톤으로 안정적 2위를 유지하고 있으나, 가다랑어 대비 수익 마진이 2배 이상 높아 어종 비중 재편이 수익성의 핵심 레버입니다.",
      "short": "눈다랑어 쿼터가 줄어드는 구간에서 황다랑어 연승(Longline) 비중을 30% 이상 확대하여 톤당 마진을 극대화해야 합니다.",
      "long": "가다랑어 의존 포트폴리오에서 탈피하여 프리미엄 어종(황다랑어·알바코어) 비중을 40%로 올리는 5개년 선대 재편 로드맵 마스터플랜 수립해야 합니다.",
      "risk": "눈다랑어 자원량 지속 감소 시 RFMO 쿼터 전면 삭감 가능성을 대비한 대체 어종 전환 파이프라인 확보해야 합니다."
    },
    "area_exhaust": {
      "source": "FAO Catch Area Density & CPUE Long-term Trends",
      "situation": "9개 FAO 주요 해역의 75년간 어획량 변동에서, 서중태평양이 358만 톤으로 전체의 약 50%를 차지하는 절대 강자입니다. 그러나 동태평양(58만 톤), 동인도양(58만 톤)이 빠르게 성장하고 있으며, 대서양 중서부는 2.6만 톤으로 사실상 고갈 해역입니다. 해역별 CPUE 밀도 포화도가 향후 입어권 전략의 핵심 변수입니다.",
      "short": "WCPO 포화 해역 의존도(Exposure)를 60%에서 45%로 감축하고, 동인도양·동태평양 입어권 조기 매입 교섭 교섭 착수해야 합니다.",
      "long": "FAO 해역별 CPUE 트렌드 데이터를 분기별 업데이트하여, 해역 분산 최적화 알고리즘 기반의 선단 배치 자동화 시스템 구축해야 합니다.",
      "risk": "대서양 중서부 수준의 자원 고갈이 인도양으로 전이될 가능성에 대한 조기 경보 체계 마스터플랜 수립해야 합니다."
    },
    "hegemony": {
      "source": "Global Top 6 Tuna Producer National Fleet Statistics",
      "situation": "6대 참치 생산국의 75년 생산 점유율 변동에서, 일본은 1970년대 40%에서 현재 5% 미만으로 극적 쇠퇴를 기록했고, 인도네시아가 126만 톤으로 세계 1위에 올랐습니다. 한국은 34만 톤으로 세계 3~4위를 유지하나, 대만(30만 톤)과의 격차가 좁혀지고 있어 위상 방어가 필요합니다.",
      "short": "인도네시아 어선 오너와의 합작 JV(조인트벤처) 형태로 WCPO 내 조업 거점을 확보하여 매입원가 경쟁력 확보해야 합니다.",
      "long": "한국 수산업의 글로벌 3위권 유지를 위해 필리핀·파푸아뉴기니와의 어업협정 갱신 우선 교섭 리스트 관리 체계화.",
      "risk": "대만과의 생산 격차 역전 시 RFMO 내 투표권 및 쿼터 배분에서 불리해질 수 있는 외교적 리스크 선제 선제 대응해야 합니다."
    },
    "premium_cross": {
      "source": "Japan Tsukiji/Toyosu Market SBT vs Bigeye Auction Index",
      "situation": "눈다랑어(Bigeye)는 33만 톤으로 감소 추세인 반면, 참다랑어(Bluefin)는 양식 확대에 힘입어 7.1만 톤까지 회복했습니다. '프리미엄 어종의 교차점'—즉, 양식 블루핀의 공급 증가로 kg당 가격이 하락하면서 자연산 눈다랑어와의 가격 역전이 특정 시장(일본)에서 발생 중이며, 이 교차점을 수익 전략에 반영해야 합니다.",
      "short": "양식 블루핀 가격 하락기에 일본향 자연산 눈다랑어의 '야생(Wild-Caught) 프리미엄' 마케팅 강화로 가격 방어해야 합니다.",
      "long": "참다랑어 양식 5대국(일본·호주·멕시코·몰타·스페인)의 생산량 모니터링 체계를 구축하여 가격 교차점 예측 모델링.",
      "risk": "양식 블루핀 가격이 자연산 눈다랑어 이하로 떨어질 경우, 사시미 시장 전체의 마진 압축을 방어할 헤지 포지션 확보해야 합니다."
    },
    "aqua_disrupt": {
      "source": "Global SBT & Bluefin Aquaculture Production Yearbook",
      "situation": "참치 양식 산업은 1990년 358톤에서 2024년 6.8만 톤으로 35년간 190배 성장했으며, 생산액은 9.3억 달러 규모입니다. 호주 SBT 양식(7,261톤), 일본 참다랑어 양식(18,700톤), 몰타 지중해 양식(15,394톤)이 3대 축이며, 양식 참치의 kg당 단가($13.5)가 자연산($4.5~$8)을 2~3배 상회하여 고급 시장을 잠식하고 있습니다.",
      "short": "양식 참치가 침투하지 못하는 '초프리미엄 자연산' 세그먼트를 식별하고, 해당 채널에 물량을 집중 배치.",
      "long": "자사 양식 R&D 또는 양식 기업 지분 투자를 통해 '조업+양식' 하이브리드 포트폴리오를 구성하는 중기 전략 마스터플랜 수립해야 합니다.",
      "risk": "양식 참치 단가 $10 이하 돌파 시나리오에서 자연산 프리미엄 시장 50% 잠식 가능성에 대한 방어 방안 선행 연구."
    },
    "korea_radar": {
      "source": "Korea Customs Service Tuna Import Database",
      "situation": "한국의 참다랑어 수입은 2019년 1,511톤(200억 원)에서 2023년 618톤(90억 원)으로 59% 급감했습니다. 원산지별로는 스페인(207톤)이 1위, 기타(185톤), 튀르키예(113톤), 일본(92톤), 호주(21톤) 순이며, 호주산이 2022년 190톤에서 2023년 21톤으로 89% 폭락한 점이 특이합니다.",
      "short": "호주산 급감의 원인(SBT 수출 정책, 가격 경쟁력 변동)을 긴급 분석하고, 대체 공급원(몰타, 크로아티아)을 사전 확보해야 합니다.",
      "long": "한국 수입 시장의 단가 추이(2019년 $13.3/kg → 2023년 $14.6/kg)에 맞춘 가격대별 최적 원산지 매칭 알고리즘 구축해야 합니다.",
      "risk": "튀르키예·스페인 양대 공급원에 과도하게 의존하는 구조를 개선하여 지정학 리스크(EU-터키 관계) 방어해야 합니다."
    },
    "import_bh": {
      "source": "Japan & US Top Global Importer Tracking Matrix",
      "situation": "글로벌 참다랑어 수입 블랙홀 TOP 3는 일본(51,458톤), 미국(17,447톤), 포르투갈(10,942톤)으로, 일본 단독으로 전체 거래량의 약 50%를 흡수합니다. 한국(4,342톤)은 6위이며, 중국(3,704톤)이 빠르게 추격 중입니다. 일본의 소비 감소 → 수입 블랙홀 축소 시 글로벌 가격 급락 연쇄 효과가 예상됩니다.",
      "short": "일본 수입량 동향을 월별 추적하여, 감소 신호 포착 시 미국·중국향 물량 전환 계약을 선제 체결.",
      "long": "일본 의존도(Exposure) 50% 이상인 수출사의 리스크를 분산하기 위해 미국 프리미엄 시장(포케/스시바) 진출 로드맵 마스터플랜 수립해야 합니다.",
      "risk": "일본 경기 침체기에 수입 블랙홀이 갑자기 수축할 때 발생하는 가격 급락 리스크을 선물 헤지로 방어해야 합니다."
    },
    "export_risk": {
      "source": "Australia, Malta, Turkey Export Reliance Analytics",
      "situation": "주요 참다랑어 수출국 5개국의 수출 목적지를 분석하면, 호주·몰타·튀르키예 모두 일본 시장 비중이 60~85%에 달하는 극단적 편중 구조입니다. 호주는 일본향 39,644톤 vs 미국향 905톤으로 일본 의존도(Exposure) 96%이며, 이는 일본 수요 1% 감소가 호주 수출 전체를 흔드는 '단일 고객 집중 리스크'입니다.",
      "short": "자사 수출 포트폴리오가 일본 편중 60% 이상인지 즉시 진단하고, 미국·EU·중국 3개 시장 분산 목표치 설정.",
      "long": "호주·몰타의 일본 편중 사례를 타산지석으로, 미국 소매(Costco·Whole Foods) 직납 채널 개척 가속화.",
      "risk": "일본 엔저(¥150+) 장기화 시 엔화 기준 구매력 저하로 인한 물량 축소를 대비한 환율 헤지 포지션 확보해야 합니다."
    },
    "enso_skipjack": {
      "source": "MGWR-BME Framework (Wang et al.) & WCPO Catch Spatial Data",
      "situation": "MGWR-BME 프레임워크 기반 연구(Wang et al.)에 따르면, 엘니뇨 시 가다랑어 조업 분포가 서태평양에서 중태평양으로 동쪽 이동하며, 라니냐 시 서태평양으로 회귀합니다. WCPO 선망어선의 어획 효율은 라니냐 시 15~20% 상승, 엘니뇨 시 10~25% 하락하는 패턴이 75년간 반복되었습니다.",
      "short": "기상청 ENSO 전망 발표 즉시, 라니냐 예보 시 WCPO 서부 선단 집중 배치, 엘니뇨 시 중부 이동 프로토콜 즉시 가동해야 합니다.",
      "long": "ISSF 세계 참치어업 보고서와 NOAA ENSO 예보를 결합한 자체 '기후-어장 AI 모델'을 년 2회 업데이트 체계 구축해야 합니다.",
      "risk": "예보 실패(엘니뇨 전환이 예상보다 빠를 때)에 대비한 2개 해역 이상 동시 운영 체제 확보해야 합니다."
    },
    "alba_habitat": {
      "source": "SPC South Pacific Albacore Assessment (2024) & Mondal et al.",
      "situation": "Mondal et al. 연구 및 SPC 남태평양 알바코어 자원평가(2024)에 따르면, 기후변화로 인도양 알바코어 미성어의 서식 적합 해역이 남위 15~25°에서 남위 25~35°로 고위도 이동하고 있습니다. 이는 기존 조업 거점의 CPUE 하락과 새로운 해역 개척 필요성을 동시에 의미하며, 연승어선의 조업 전략 전면 재검토가 필요합니다.",
      "short": "인도양 남위 25~35° 해역의 시험 조업 데이터를 축적하여, 새로운 알바코어 어장 후보지를 연내 확정.",
      "long": "기후 모델(RCP 4.5/8.5)별 알바코어 서식지 이동 시뮬레이션을 연간 업데이트하여 10년 단위 선대 재배치 마스터플랜 마스터플랜 수립해야 합니다.",
      "risk": "고위도 이동으로 새로운 연안국(남아공·호주)의 EEZ 진입 시 필요한 입어권 교섭을 사전 교섭 착수해야 합니다."
    }} as any;
  const data = takeawaysMap[id];
  if (!data) return null;

return (
    <div className={styles.takeaway} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
      {/* 📊 Chart Situation Description */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>📊</span>
        <div>
          <strong style={{ color: '#7dd3fc', fontSize: '0.85rem' }}>현황 분석 (Situation):</strong>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.65 }}>{data.situation}</p>
          {data.source && (
            <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
              * 출처/근거: {data.source}
            </p>
          )}
        </div>
      </div>
      {/* Divider */}
      <div style={{ width: '100%', height: '1px', background: 'rgba(56, 189, 248, 0.1)' }} />
      {/* ⚡ Executive Takeaway */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <AlertCircle size={16} className={styles.takeawayIcon} style={{ flexShrink: 0 }} />
        <strong style={{ color: '#bae6fd', fontSize: '0.85rem' }}>실행 전략 (Executive Takeaway):</strong>
      </div>
      <p style={{ margin: 0, fontSize: '0.83rem', color: '#e2e8f0', lineHeight: 1.65 }}>
        {data.short} {data.long} {data.risk}
      </p>
    </div>
  );
};

// Data declarations
const data_enso = [
  { year: '2023', sstAnomaly: -0.8, catchRate: 105, fuelCost: 95 },
  { year: '2024', sstAnomaly: 1.2, catchRate: 85, fuelCost: 115 },
  { year: '2025(E)', sstAnomaly: 0.5, catchRate: 98, fuelCost: 102 },
  { year: '2026(E)', sstAnomaly: -1.0, catchRate: 110, fuelCost: 90 },
];
const data_fad = [
  { target: '스킵잭', normalFAD: 60, smartFAD: 85 },
  { target: '황다랑어', normalFAD: 30, smartFAD: 12 },
  { target: '부수어획(혼획)', normalFAD: 10, smartFAD: 3 },
];
const data_port = [
  { month: '1월', unloadDays: 2, reeferRate: 4500, loss: 0 },
  { month: '4월', unloadDays: 3, reeferRate: 4800, loss: 0 },
  { month: '6월', unloadDays: 5, reeferRate: 5200, loss: 120 },
  { month: '7월 (폭증)', unloadDays: 7, reeferRate: 6500, loss: 420 },
  { month: '8월 (금어기)', unloadDays: 14, reeferRate: 7000, loss: 850 },
  { month: '9월 (병목정점)', unloadDays: 9, reeferRate: 7200, loss: 580 },
  { month: '10월', unloadDays: 4, reeferRate: 5800, loss: 40 },
  { month: '11월', unloadDays: 3, reeferRate: 5000, loss: 0 },
];
const data_em = [
  { year: '2021', coverage: 5, fines: 450 },
  { year: '2023', coverage: 15, fines: 210 },
  { year: '2025(E)', coverage: 35, fines: 80 },
  { year: '2027(E)', coverage: 80, fines: 10 },
];
const data_msc = [
  { year: '2021', standardPrice: 1200, mscPrice: 1350 },
  { year: '2023', standardPrice: 1500, mscPrice: 1800 },
  { year: '2025', standardPrice: 1450, mscPrice: 1850 },
  { year: '2027', standardPrice: 1600, mscPrice: 2150 },
];
const data_pouch = [
  { category: '물/오일 캔', yoyGrowth: -2.5, gpMargin: 8 },
  { category: '조미/야채 캔', yoyGrowth: 1.2, gpMargin: 12 },
  { category: '프리미엄 파우치', yoyGrowth: 14.5, gpMargin: 26 },
  { category: 'RTE 샐러드 팩', yoyGrowth: 22.0, gpMargin: 35 },
];
const data_blackhole = [
  { month: '23-Q1', price: 1400, euInv: 85, usInv: 70 },
  { month: '23-Q3', price: 1350, euInv: 60, usInv: 55 },
  { month: '24-Q1 (패닉)', price: 1900, euInv: 40, usInv: 45 },
  { month: '24-Q3', price: 1600, euInv: 90, usInv: 85 },
];
const data_rival = [
  { company: 'Maruha', tunaPct: 25, aquaPct: 45, valueAddedPct: 30 },
  { company: 'Thai Union', tunaPct: 35, aquaPct: 20, valueAddedPct: 45 },
  { company: 'Dongwon', tunaPct: 55, aquaPct: 15, valueAddedPct: 30 },
];
const data_quota = [
  { rfmo: 'WCPFC', cur: 100, cut27: -15, penaltyRate: 200 },
  { rfmo: 'IATTC', cur: 100, cut27: -10, penaltyRate: 150 },
  { rfmo: 'ICCAT', cur: 100, cut27: -22, penaltyRate: 300 },
];
const data_labour = [
  { year: '2022', issues: 12, portDenials: 3, traceDocs: 45 },
  { year: '2024', issues: 5, portDenials: 0, traceDocs: 85 },
  { year: '2026', issues: 1, portDenials: 0, traceDocs: 98 },
];
const data_aibep = [
  { year: '2023', manualCost: 55000, aiCost: 85000 },
  { year: '2024', manualCost: 58000, aiCost: 65000 },
  { year: '2025', manualCost: 62000, aiCost: 45000 },
  { year: '2026', manualCost: 67000, aiCost: 35000 },
];
const data_margin = [
  { year: '2022', seineMargin: 22, longlineMargin: 15 },
  { year: '2024', seineMargin: 14, longlineMargin: 24 },
  { year: '2026', seineMargin: 8, longlineMargin: 32 },
];
const data_finance = [
  { category: '기본 금리(Standard)', rate: 6.5 },
  { category: '녹색 채권(Green Bond)', rate: 4.8 },
  { category: '탄소 배출권 스왑', rate: 3.2 },
];
const data_gsp = [
  { country: '태국 (공정)', duty: 24, logistics: 5 },
  { country: '에콰도르', duty: 0, logistics: 8 },
  { country: '파푸아뉴기니', duty: 0, logistics: 7 },
];
const data_byproduct = [
  { item: '참치캔 본품', rev: 100, margin: 8 },
  { item: '펫푸드', rev: 30, margin: 25 },
  { item: '오메가-3 오일', rev: 10, margin: 55 },
];
const data_albacore = [
  { year: '2021', skipjack: 80, albacore: 20 },
  { year: '2024', skipjack: 66, albacore: 34 },
  { year: '2027', skipjack: 50, albacore: 50 },
];
const data_foodservice = [
  { quarter: '24-1Q', foodservice: 120, retail: 80 },
  { quarter: '24-3Q', foodservice: 100, retail: 110 },
  { quarter: '25-1Q', foodservice: 80, retail: 140 },
];
const data_hub = [
  { hub: '태국 방콕', share2020: 55, share2025: 35 },
  { hub: '에콰도르 만타', share2020: 15, share2025: 28 },
  { hub: '베트남 호치민', share2020: 10, share2025: 18 },
];
const data_altseafood = [
  { year: '2022', marketShare: 0.5 },
  { year: '2026', marketShare: 5.8 },
  { year: '2030', marketShare: 22.0 },
];

// ===== 3차 연구자료 기반 인사이트 데이터 =====
const data_species = [
  { year: '1960', skipjack: 294, bigeye: 55, yellowfin: 203 },
  { year: '1980', skipjack: 774, bigeye: 138, yellowfin: 495 },
  { year: '2000', skipjack: 2003, bigeye: 401, yellowfin: 1225 },
  { year: '2010', skipjack: 2596, bigeye: 401, yellowfin: 1268 },
  { year: '2020', skipjack: 2820, bigeye: 368, yellowfin: 1492 },
  { year: '2024', skipjack: 3575, bigeye: 329, yellowfin: 1710 },
];
const data_area = [
  { area: '중서부태평양', vol2000: 2240, vol2024: 3583 },
  { area: '서인도양', vol2000: 685, vol2024: 1066 },
  { area: '동인도양', vol2000: 370, vol2024: 578 },
  { area: '동중부태평양', vol2000: 429, vol2024: 584 },
  { area: '남동태평양', vol2000: 143, vol2024: 657 },
  { area: '동중부대서양', vol2000: 301, vol2024: 369 },
  { area: '북서태평양', vol2000: 282, vol2024: 203 },
  { area: '서중부대서양', vol2000: 49, vol2024: 26 },
];
const data_hegemon = [
  { year: '1970', indonesia: 150, japan: 655, korea: 60, philippines: 78, taiwan: 145, usa: 183 },
  { year: '1990', indonesia: 295, japan: 652, korea: 235, philippines: 158, taiwan: 340, usa: 148 },
  { year: '2010', indonesia: 886, japan: 348, korea: 259, philippines: 256, taiwan: 300, usa: 128 },
  { year: '2024', indonesia: 1256, japan: 335, korea: 344, philippines: 282, taiwan: 300, usa: 106 },
];
const data_premium = [
  { year: '1960', bigeye: 55, bluefin: 70 },
  { year: '1980', bigeye: 138, bluefin: 87 },
  { year: '2000', bigeye: 401, bluefin: 47 },
  { year: '2010', bigeye: 401, bluefin: 43 },
  { year: '2020', bigeye: 368, bluefin: 60 },
  { year: '2024', bigeye: 329, bluefin: 71 },
];
const data_aqua = [
  { year: '1995', aquaVol: 1942, aquaVal: 28363 },
  { year: '2005', aquaVol: 21259, aquaVal: 262888 },
  { year: '2010', aquaVol: 20456, aquaVal: 390116 },
  { year: '2015', aquaVol: 48285, aquaVal: 774688 },
  { year: '2020', aquaVol: 60432, aquaVal: 1095264 },
  { year: '2024', aquaVol: 68443, aquaVal: 925370 },
];
const data_korea_orig = [
  { year: '2019', turkey: 701, spain: 123, australia: 292, japan: 167, others: 228 },
  { year: '2020', turkey: 72, spain: 102, australia: 84, japan: 91, others: 212 },
  { year: '2021', turkey: 120, spain: 250, australia: 92, japan: 186, others: 203 },
  { year: '2022', turkey: 137, spain: 240, australia: 190, japan: 89, others: 146 },
  { year: '2023', turkey: 113, spain: 207, australia: 21, japan: 92, others: 185 },
];
const data_import_bh = [
  { country: '일본', vol: 51458 },
  { country: '미국', vol: 17447 },
  { country: '포르투갈', vol: 10942 },
  { country: '몰타', vol: 6604 },
  { country: '한국', vol: 4342 },
  { country: '중국', vol: 3704 },
  { country: '스페인', vol: 1796 },
  { country: '이탈리아', vol: 1705 },
];
const data_export_risk = [
  { exporter: '호주', japan: 39644, usa: 905, korea: 308, others: 570 },
  { exporter: '튀르키예', japan: 25311, korea: 669, usa: 279, others: 98 },
  { exporter: '멕시코', japan: 11544, usa: 11191, canada: 506, others: 560 },
  { exporter: '몰타', japan: 21108, korea: 1790, tunisia: 372, others: 288 },
  { exporter: '스페인', japan: 6570, usa: 4283, italy: 2011, others: 5961 },
];
const data_enso_skj = [
  { scenario: '강한 라니냐', cpueChange: 20, areaDrift: -15, fuelSave: 12 },
  { scenario: '약한 라니냐', cpueChange: 10, areaDrift: -5, fuelSave: 5 },
  { scenario: '중립', cpueChange: 0, areaDrift: 0, fuelSave: 0 },
  { scenario: '약한 엘니뇨', cpueChange: -10, areaDrift: 8, fuelSave: -8 },
  { scenario: '강한 엘니뇨', cpueChange: -25, areaDrift: 20, fuelSave: -18 },
];
const data_alba_shift = [
  { decade: '1990s', optZone: 18, cpue: 4.2 },
  { decade: '2000s', optZone: 22, cpue: 3.8 },
  { decade: '2010s', optZone: 27, cpue: 3.1 },
  { decade: '2020s', optZone: 32, cpue: 2.6 },
];
// --- Operational Widgets Grouped by S1~S5 ---

export const OperationalS1Widgets = () => (
  <>
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className={styles.grid}>
        <div className={styles.card}>
        
                      <CardHeader title="기후 변동성과 어군 이동 역학" icon={Thermometer} term="수온 아노말리" desc="표층 수온 아노말리와 단위 노력당 어획량(CPUE) 및 연료비 변동 상관관계 예측 모델링." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data_enso} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis yAxisId="left" />
                              <YAxis yAxisId="right" orientation="right" />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar yAxisId="left" dataKey="sstAnomaly" name="SST 아노말리(°C)" fill="var(--color-danger)" />
                              <Line yAxisId="right" type="monotone" dataKey="catchRate" name="어획률(CPUE 지수)" stroke="var(--color-info)" strokeWidth={3} />
                              <Line yAxisId="right" type="monotone" dataKey="fuelCost" name="연료 소모 지수" stroke="var(--color-warning)" strokeDasharray="5 5" />
                            </ComposedChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="enso" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="스마트 FAD 어획 및 부수어획" icon={Target} term="스마트 집어장치" desc="음향 탐지기를 장착한 생분해성(Biodegradable) 스마트 FAD와 기존 FAD의 혼획/어획 목표 달성도 비교." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <BarChart data={data_fad} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                              <XAxis type="number" unit="%" domain={[0, 100]}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis dataKey="target" type="category" width={90} />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar dataKey="normalFAD" name="일반 FAD" fill="#64748b" radius={[0, 4, 4, 0]} />
                              <Bar dataKey="smartFAD" name="스마트 FAD (Eco)" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="fad" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="조업 해역 고갈 및 이동 동향" icon={MapPin} term="어장 고갈" desc="FAO 주요 해역별 2000년 대비 2024년 생산량 비교 밀도 변화." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <BarChart data={data_area} layout="vertical" margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" tickFormatter={(val) => `${val}k`} angle={0} textAnchor="middle" height={60} />
                              <YAxis dataKey="area" type="category" width={130} />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar dataKey="vol2000" name="2000년 (k tons)" fill="var(--text-secondary)" radius={[0, 4, 4, 0]} />
                              <Bar dataKey="vol2024" name="2024년 (k tons)" fill="var(--color-info)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="area_exhaust" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="ENSO 시나리오별 선단 최적 배치" icon={CloudRain} term="엘니뇨·라니냐" desc="MGWR-BME 연구모델 기반 엘니뇨/라니냐 발생 시 어군 중심축 동/서 표류 및 효율 변화." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data_enso_skj} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="scenario"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis unit="%" />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar dataKey="cpueChange" name="CPUE 변동률(%)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                              <Line type="monotone" dataKey="areaDrift" name="서태평양 이탈률(%)" stroke="var(--color-danger)" strokeWidth={3} />
                            </ComposedChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="enso_skipjack" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="알바코어 서식지의 남하 압력" icon={Navigation} term="서식지 이동" desc="연대별 해수 온도 상승으로 알바코어 미성어의 조업 적정 위도가 변경되는 기후 압박." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data_alba_shift} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="decade"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis yAxisId="left" reversed domain={[0, 40]} label={{ value: '남위(°S)', angle: -90, position: 'insideLeft' }} />
                              <YAxis yAxisId="right" orientation="right" />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Area yAxisId="left" type="monotone" dataKey="optZone" name="최적 조업 남위(°S)" stroke="#8b5cf6" fill="#c4b5fd" />
                              <Line yAxisId="right" type="step" dataKey="cpue" name="추정 CPUE 밀도" stroke="var(--color-danger)" strokeWidth={3} />
                            </AreaChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="alba_habitat" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="어종별 생산량 지각변동 (75년 추이)" icon={Leaf} term="어종 점유율" desc="1950년부터 2024년까지 가다랑어, 눈다랑어, 황다랑어 생산량의 구조적 변동을 추적." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data_species} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis tickFormatter={(val) => `${val}k`} />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Area type="monotone" dataKey="skipjack" name="가다랑어 (k tons)" stackId="1" stroke="var(--color-info)" fill="#bfdbfe" />
                              <Area type="monotone" dataKey="yellowfin" name="황다랑어 (k tons)" stackId="1" stroke="var(--color-warning)" fill="#fde68a" />
                              <Area type="monotone" dataKey="bigeye" name="눈다랑어 (k tons)" stackId="1" stroke="var(--color-danger)" fill="#fecaca" />
                            </AreaChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="species_dom" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="참치 헤게모니 역사적 이동" icon={Crown} term="패권 이동" desc="주요 6개 국가의 참치 생산량 지배력의 1970~2024 변화 경로." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <LineChart data={data_hegemon} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis tickFormatter={(val) => `${val}k`} />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Line type="monotone" dataKey="indonesia" name="인도네시아" stroke="var(--color-danger)" strokeWidth={3} />
                              <Line type="monotone" dataKey="korea" name="대한민국" stroke="var(--color-info)" strokeWidth={3} />
                              <Line type="monotone" dataKey="japan" name="일본" stroke="var(--text-secondary)" strokeWidth={2} strokeDasharray="4 4" />
                              <Line type="monotone" dataKey="taiwan" name="대만" stroke="var(--color-warning)" strokeWidth={2} />
                              <Line type="monotone" dataKey="philippines" name="필리핀" stroke="var(--color-success)" strokeWidth={2} />
                            </LineChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="hegemony" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="프리미엄 어종 물량 교차점" icon={Diamond} term="프리미엄 교차점" desc="감소하는 야생 눈다랑어와 양식 확대로 증가하는 참다랑어의 생산 추이 교차 구간." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data_premium} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis yAxisId="left" tickFormatter={(val) => `${val}k`} />
                              <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `${val}k`} />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar yAxisId="left" dataKey="bigeye" name="눈다랑어 물량 (k tons)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                              <Line yAxisId="right" type="monotone" dataKey="bluefin" name="참다랑어 물량 (k tons)" stroke="var(--color-danger)" strokeWidth={3} />
                            </ComposedChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="premium_cross" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="참치 양식업의 성규모 단가 잠식" icon={Sprout} term="양식업 파괴" desc="양식 참치 생산량과 생산금액(Value)의 폭발적 성장에 따른 야생 참치 위협 파동." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data_aqua} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis yAxisId="left" tickFormatter={(val) => `${val}k`} />
                              <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `$${val/1000}M`} />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar yAxisId="left" dataKey="aquaVol" name="양식 생산량 (k tons)" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                              <Line yAxisId="right" type="monotone" dataKey="aquaVal" name="생산액 (1k USD)" stroke="#8b5cf6" strokeWidth={3} />
                            </ComposedChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="aqua_disrupt" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="선망 vs 연승 마진 역전 (글로벌 vs 우리 현실)" icon={Scale} term="수익 패러다임" desc="글로벌 프리미엄 연승(사시미급)의 마진 상승 추세 vs 신라교역 연승 적자의 구조적 괴리 분석." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <LineChart data={data_margin} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis unit="%" />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Line type="monotone" dataKey="longlineMargin" name="연승 마진" stroke="#c084fc" strokeWidth={3} />
                              <Line type="monotone" dataKey="seineMargin" name="선망 마진" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} />
                            </LineChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="margin" />
                      </div>
                    </div>
      </div>
    </div>
  </>
);

export const OperationalS2Widgets = () => (
  <>
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className={styles.grid}>
        <div className={styles.card}>
        
                      <CardHeader title="전통 통조림 허브 패권 분산" icon={Network} term="가공 허브 분산" desc="태국의 임금 및 환율 상승으로 인해 가공 주문 물량이 중남미/인도네시아 등으로 찢어지는 현상." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <BarChart data={data_hub} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                              <XAxis type="number" unit="%"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis dataKey="hub" type="category" width={100} />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar dataKey="share2020" name="2020년 점유" fill="#475569" radius={[0, 4, 4, 0]} />
                              <Bar dataKey="share2025" name="2025년 점유" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="hub" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="프리미엄 RTE/파우치 성장성" icon={TrendingUp} term="즉석조리 식품" desc="MZ 단백질 소비층을 겨냥한 부가가치 파우치(파우치 팩)의 마진율 및 연 성장성 비교." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data_pouch} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                              <XAxis type="number"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis dataKey="category" type="category" width={100} />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar dataKey="yoyGrowth" name="전년비 성장률(%)" fill="var(--color-info)" radius={[0, 4, 4, 0]} />
                              <Line dataKey="gpMargin" name="매출총이익률(%)" stroke="#f43f5e" strokeWidth={3} />
                            </ComposedChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="pouch" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="참치캔 부산물 고마진 수익화" icon={Cpu} term="부산물 활용" desc="통조림 공정 중 버려지는 내장/뼈(15%)를 활용한 펫케어 및 피쉬밀 사업의 퀀텀 립." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <BarChart data={data_byproduct} layout="vertical" margin={{ top: 20, right: 30, left: 70, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                              <XAxis type="number"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis dataKey="item" type="category" width={100} />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Bar dataKey="margin" name="영업이익률(%)" fill="var(--color-warning)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="byproduct" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="글로벌 메이저 헷징 포트폴리오" icon={Briefcase} term="포트폴리오 다각화" desc="Thai Union, Maruha Nichiro 등 메이저 참치 선단들이 캐시카우를 양식 및 부가가치 통조림으로 전환하는 동향." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <BarChart data={data_rival} layout="vertical" margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                              <XAxis type="number" domain={[0, 100]} unit="%"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis dataKey="company" type="category" width={100} />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar dataKey="tunaPct" name="참치(조업/통조림)" stackId="a" fill="#1e40af" />
                              <Bar dataKey="valueAddedPct" name="가치 부가(부가가치/펫푸드)" stackId="a" fill="#8b5cf6" />
                              <Bar dataKey="aquaPct" name="기타 양식/수산" stackId="a" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="rival" />
                      </div>
                    </div>
      </div>
    </div>
  </>
);

export const OperationalS3Widgets = () => (
  <>
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className={styles.grid}>
        <div className={styles.card}>
        
                      <CardHeader title="금어기 물류 병목 & 콜드체인 대란" icon={Anchor} term="물류 병목" desc="RFMO 관할 금어기(FAD Closure) 전후 하역 대기일, 리퍼 운임, 대기 손실의 이중 병목 구조 분석." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data_port} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis yAxisId="left" tickFormatter={(v) => `$${(v).toLocaleString('en-US')}`} />
                              <YAxis yAxisId="right" orientation="right" />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar yAxisId="left" dataKey="reeferRate" name="리퍼 운임($/FEU)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                              <Line yAxisId="right" type="monotone" dataKey="unloadDays" name="하역 대기일(Days)" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
                              <Line yAxisId="right" type="monotone" dataKey="loss" name="대기 손실($k)" stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="5 5" />
                            </ComposedChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="port" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="0% 특혜관세(GSP+) 차익" icon={DollarSign} term="관세 차익" desc="EU 수출을 위한 하역 및 가공 경로에서 태국(관세 24%) 대비 0% 특혜 관세국의 순마진 비교" />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <BarChart data={data_gsp} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="country"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis unit="%" />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar dataKey="duty" name="EU 수입 관세율(%)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="logistics" name="경로 전환 배송비(%)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="gsp" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="수출 시장의 목적지 집중도 리스크" icon={ArrowRightLeft} term="수출 집중도 리스크" desc="일본 등 단일 고객사에 대한 극단적 의존도가 야기하는 외상·물량 리스크 수준." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <BarChart data={data_export_risk} layout="vertical" stackOffset="expand" margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`} angle={0} textAnchor="middle" height={60} />
                              <YAxis dataKey="exporter" type="category" width={80} />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar dataKey="japan" name="일본행" stackId="a" fill="var(--color-danger)" />
                              <Bar dataKey="usa" name="미국행" stackId="a" fill="var(--color-info)" />
                              <Bar dataKey="korea" name="한국행" stackId="a" fill="var(--color-success)" />
                              <Bar dataKey="others" name="기타 지역" stackId="a" fill="#cbd5e1" />
                            </BarChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="export_risk" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="한국 참다랑어 수입 다변화 체제" icon={Flag} term="한국 수입 레이더" desc="최근 5년간 한국으로 들어오는 프리미엄 참치의 국가별 물량 의존도(톤)." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <LineChart data={data_korea_orig} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Line type="monotone" dataKey="spain" name="스페인" stroke="var(--color-danger)" strokeWidth={2} />
                              <Line type="monotone" dataKey="turkey" name="튀르키예" stroke="var(--color-warning)" strokeWidth={2} />
                              <Line type="monotone" dataKey="japan" name="일본" stroke="var(--color-info)" strokeWidth={2} />
                              <Line type="monotone" dataKey="australia" name="호주" stroke="var(--color-success)" strokeWidth={2} />
                              <Line type="monotone" dataKey="others" name="기타원산지" stroke="var(--text-secondary)" strokeWidth={2} strokeDasharray="3 3" />
                            </LineChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="korea_radar" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="글로벌 수입 수요 블랙홀 지수" icon={Magnet} term="수입 블랙홀" desc="세계 최대 소비시장이 참치를 흡수하는 물량 비대칭도 시뮬레이션." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <BarChart data={data_import_bh} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="country"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis tickFormatter={(val) => `${val/1000}k`} />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar dataKey="vol" name="순 수입량 (tons)" fill="var(--color-warning)" radius={[4, 4, 0, 0]}>
                                {data_import_bh.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-danger)' : 'var(--color-warning)'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="import_bh" />
                      </div>
                    </div>
        <ReeferCompetitorInflowWidget />
        <ReeferPortCongestionWidget />
        <ReeferSupplyPriceOverlayWidget />
        <ReeferCarrierEfficiencyWidget />
      </div>
    </div>
  </>
);

export const OperationalS4Widgets = () => (
  <>
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className={styles.grid}>
        <div className={styles.card}>
        
                      <CardHeader title="수입 블랙홀: 패닉 바잉 스프레드" icon={Box} term="패닉 매입" desc="지정학 이슈 및 쿼터 제한 뉴스 발생 시 EU/US 메이저의 물량 비축 속도와 도매 어가 곡선 상관도." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data_blackhole} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis yAxisId="left" tickFormatter={(val) => `$${val}`} />
                              <YAxis yAxisId="right" orientation="right" />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar yAxisId="right" dataKey="euInv" name="EU 창고 재고지수" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                              <Line yAxisId="left" type="monotone" dataKey="price" name="스킵잭 방콕 시세($)" stroke="var(--color-danger)" strokeWidth={3} />
                            </ComposedChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="blackhole" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="외식 vs 소매 스위칭" icon={TrendingUp} term="경기 전환" desc="고금리, 인플레이션 장기화에 따른 B2B 레스토랑 수요 부진과 B2C 마트용 소매 수요 상승 교차 곡선." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data_foodservice} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="quarter"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Line type="monotone" dataKey="foodservice" name="외식(Foodservice) 수요" stroke="var(--color-danger)" strokeWidth={3} />
                              <Bar dataKey="retail" name="슈퍼마켓 B2C 참치캔 수요" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </ComposedChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="foodservice" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="화이트 미트 북미 제패" icon={Ship} term="알바코어 부상" desc="스킵잭 남획 이슈 대체품으로 급부상 중인 알바코어 참치의 점유율 침식 투입 모델." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data_albacore} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis unit="%" />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Area type="monotone" dataKey="albacore" name="알바코어 점유율" stackId="1" stroke="#f472b6" fill="#f472b6" />
                              <Area type="monotone" dataKey="skipjack" name="스킵잭 점유율" stackId="1" stroke="#475569" fill="#475569" />
                            </AreaChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="albacore" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="대체 해산물(Alt-Seafood) 위협" icon={Leaf} term="대체 참치 침투" desc="배양육/식물성 식물 단백질로 만든 비건 참치의 향후 시장 잠식률 모의 침투 곡선." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <LineChart data={data_altseafood} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis unit="%" />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Line type="monotone" dataKey="marketShare" name="가짜 참치 시장 점유율" stroke="var(--color-success)" strokeWidth={3} />
                            </LineChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="altseafood" />
                      </div>
                    </div>
      </div>
    </div>
  </>
);

export const OperationalS5Widgets = () => (
  <>
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className={styles.grid}>
        <div className={styles.card}>
        
                      <CardHeader title="전자 모니터링(EM) 방어선" icon={ShieldCheck} term="전자 모니터링" desc="인공지능 카메라(AI EM)와 VMS 시스템 결합을 통한 실시간 감독율 향상 및 페널티 방어 상관관계." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data_em} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis yAxisId="left" unit="%" />
                              <YAxis yAxisId="right" orientation="right" />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar yAxisId="left" dataKey="coverage" name="EM 탑재율(%)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                              <Line yAxisId="right" type="monotone" dataKey="fines" name="규제 적발 페널티($k)" stroke="var(--color-danger)" strokeWidth={3} />
                            </ComposedChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="em_reg" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="노동/인권 규제 블랙리스트" icon={Zap} term="인권 추적" desc="미국 관세국경보호청(CBP)의 화물 보류 조치(WRO) 빈도와 블록체인 발급 추적 등급 증가." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data_labour} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis yAxisId="left" />
                              <YAxis yAxisId="right" orientation="right" />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar yAxisId="left" dataKey="issues" name="노동 이슈 발생(건)" fill="#f97316" radius={[4, 4, 0, 0]} />
                              <Line yAxisId="right" type="monotone" dataKey="traceDocs" name="추적 인증 구비율(%)" stroke="#059669" strokeWidth={3} />
                            </ComposedChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="labour" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="어종별 쿼터 삭감 방어 모델" icon={FileWarning} term="쿼터 초과 페널티" desc="유예없는 2027 빅아이/황다랑어 할당량 대거 삭감 예보와 초과 페널티 손익 시뮬레이션." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <BarChart data={data_quota} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="rfmo"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar dataKey="cut27" name="쿼터 삭감률(%)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="penaltyRate" name="초과 페널티 배율(%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="quota" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="MSC 획득 프리미엄 갭" icon={Briefcase} term="MSC 프리미엄" desc="MSC 인증 확보 물량과 일반 물량의 도매 시장(태국, 스페인) 평균 거래가 차익 누적액 분기별 스팬." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <BarChart data={data_msc} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="year"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis tickFormatter={(val) => `$${val}`} />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar dataKey="standardPrice" name="일반 스킵잭 기준가" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="mscPrice" name="MSC 확보 물량 체결가" fill="#059669" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="msc" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="AI 승선 모니터링 손익분기 역전" icon={Brain} term="손익분기 교차" desc="거대해지는 인간 옵서버 인건비와 AI 카메라 비용의 크로스오버 지점 타게팅." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <LineChart data={data_aibep} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis tickFormatter={(val) => `$${(val/1000).toLocaleString('en-US')}k`} />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend />
                              <Line type="monotone" dataKey="manualCost" name="대인 옵서버 인건비" stroke="var(--color-danger)" strokeWidth={3} />
                              <Line type="monotone" dataKey="aiCost" name="AI 감시망 설치 비용" stroke="var(--color-info)" strokeWidth={3} />
                            </LineChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="ai_bep" />
                      </div>
                    </div>
        <div className={styles.card}>
        
                      <CardHeader title="블루 카본 우대 파이낸스 스왑" icon={Leaf} term="녹색 채권" desc="친환경 하이브리드 엔진 개조 또는 바이오 냉매 적용으로 인정받은 해양 탄소 감축 활동에 적용되는 대출 금리 갭." />
                      <div className={styles.cardBody}>
                        <div className={styles.chartContainer}>
                          <SafeResponsiveContainer width="100%" height="100%">
                            <BarChart data={data_finance} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <ChartPatternDefs />
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="category"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                              <YAxis unit="%" />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Bar dataKey="rate" name="조달 이자율(%)" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </SafeResponsiveContainer>
                        </div>
                        <TakeawayBox id="finance" />
                      </div>
                    </div>
      </div>
    </div>
  </>
);
