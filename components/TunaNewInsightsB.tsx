import React from 'react';
import styles from './TunaInsightsDashboard.module.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, LineChart, Line, ComposedChart, Area, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { FlaskConical, Landmark, Factory } from 'lucide-react';
import TermTooltip from './TermTooltip';
import TakeawayBox from './TakeawayBox';

const tunaExtractData = [
  { name: '동원F&B', share: 32, color: '#10b981' },
  { name: '한라식품', share: 25, color: '#ef4444' },
  { name: '사조대림', share: 22, color: '#3b82f6' },
  { name: 'CJ제일제당', share: 8, color: '#f59e0b' },
  { name: 'PB/기타', share: 13, color: '#64748b' },
];

const coinBrothData = [
  { year: '2022', 액상_시장: 520, 분말_코인: 80, 마진율_분말: 35 },
  { year: '2023', 액상_시장: 580, 분말_코인: 120, 마진율_분말: 38 },
  { year: '2024', 액상_시장: 630, 분말_코인: 180, 마진율_분말: 40 },
  { year: '2025', 액상_시장: 700, 분말_코인: 260, 마진율_분말: 42 },
  { year: '2026E', 액상_시장: 750, 분말_코인: 380, 마진율_분말: 45 },
];

const pillarTwoData = [
  { company: 'Thai Union', before: 7.2, after: 13.5 },
  { company: 'Dongwon', before: 8.1, after: 12.8 },
  { company: 'Bolton', before: 6.5, after: 14.2 },
  { company: 'FCF Fishery', before: 5.8, after: 11.5 },
];

// Source: ILO Global Wage Report 2024 (Vietnam/Thailand mfg. wages)
// + VASEP Annual Report 2024 (processing lead times)
// + 관세청 KCS VKFTA 양허세율 조회 HS 160414 (2025)
const vietnamData = [
  { metric: '월 임금($)', Vietnam: 342, Thailand: 431, source: 'ILO 2024' },
  { metric: '리드타임(일)', Vietnam: 6.35, Thailand: 7.13, source: 'VASEP 2024' },
  { metric: '인증 수(개)', Vietnam: 10, Thailand: 8, source: 'BRC/IFS Registry' },
  { metric: 'VKFTA 관세(%)', Vietnam: 0, Thailand: 8, source: '관세청 KCS 2025' },
];

export function InsightTunaExtract() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <FlaskConical size={20} color="#10b981"/> 가다랑어(Skipjack) 액젓 분말화 혁명 (2026)
          <TermTooltip term="" description="가다랑어(Skipjack) 추출액은 액젓이 아니라 700억 원 '코인 육수' 시장을 지배할 B2B 분말 소재입니다. 분무건조 기술로 물류비 50% 절감." />
        </h3>
        <p className={styles.cardDesc}>국내 참치액 시장 700억 원. 코인 육수 시장 +20% YoY 성장 중. 분말화로 냉동→건화물 전환 시 물류비 획기적 절감 (2026년 기준).</p>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chartContainer}>
          <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={coinBrothData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis yAxisId="left" stroke="#94a3b8" unit="억" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" unit="%" />
              <RTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="액상_시장" name="액상 시장(억원)" fill="#64748b" radius={[4,4,0,0]} />
              <Bar yAxisId="left" dataKey="분말_코인" name="분말/코인 시장(억원)" fill="#10b981" radius={[4,4,0,0]} />
              <Line yAxisId="right" type="monotone" dataKey="마진율_분말" name="분말 B2B 마진율(%)" stroke="#fbbf24" strokeWidth={3} />
            </ComposedChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.kpiPanel}>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#10b981' }}>
            <div className={styles.kpiLabel}>코인 육수 시장 성장률</div>
            <div className={styles.kpiValue} style={{ color: '#10b981' }}>+20% YoY</div>
            <div className={styles.kpiSub}>가다랑어 분말 소재 수요 폭발</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          source="KMI 식품산업통계정보 (2026) & 자체 추정치"
          situation="[가다랑어 부산물의 가치 재발견] 한국 참치액 시장(700억 원)은 과포화된 액상 경쟁에서 벗어나 '코인 육수' 분말 시장(+20% YoY)으로 급속 확장 중입니다. 가다랑어 추출액의 분무건조 설비를 결합하면, 냉동 컨테이너를 건화물로 전환하여 통관/물류비를 50% 이상 절감할 수 있습니다."
          actionPlan="참치액의 미래는 액상이 아닌 '분말'에 있습니다. 베트남 현지 가다랑어(Skipjack) 전용 분무건조 파일럿을 즉시 가동하고, CJ/대상 등 코인 육수 제조사에 B2B 핵심 원료 납품 계약을 선제적으로 체결하십시오. TN 지수 1.5% 이상 고농축 스펙으로 차별화하여 프리미엄 시장을 장악해야 합니다."
        />
      </div>
    </div>
  );
}

export function InsightPillarTwo() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Landmark size={20} color="#fbbf24"/> OECD Pillar Two 세금 쇼크 (황다랑어 밸류체인)
          <TermTooltip term="" description="2026년 글로벌 최저한세 15% 적용. 조세 피난처를 경유하는 다국적 황다랑어/눈다랑어 유통 기업의 실효세율이 7%→14%로 급등." />
        </h3>
        <p className={styles.cardDesc}>조세 피난처와 이전가격 조작에 의존하던 다국적 수산기업의 실효세율이 OECD Pillar Two(2026 시행)로 2배 폭등합니다.</p>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chartContainer}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={pillarTwoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="company" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" unit="%" domain={[0, 18]} />
              <RTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="before" name="기존 실효세율(%)" fill="#64748b" radius={[4,4,0,0]} />
              <Bar dataKey="after" name="Pillar Two 적용 후(%) (2026E)" fill="#fbbf24" radius={[4,4,0,0]} />
            </BarChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.kpiPanel}>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#fbbf24' }}>
            <div className={styles.kpiLabel}>Avg. Tax Rate Impact</div>
            <div className={styles.kpiValue} style={{ color: '#fbbf24' }}>7% → 14%</div>
            <div className={styles.kpiSub} style={{ color: '#ef4444' }}>▲ ROE 근본적 훼손 (2026)</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          source="KIEP 국제조세 동향 (2025) & EU 집행위 발표자료"
          situation="[글로벌 최저한세 전면 도입] 2026년 OECD Pillar Two 도입으로 조세 피난처 유령법인을 활용하던 다국적 수산기업(Thai Union, Bolton 등)의 실효 법인세율이 7%에서 14%로 거의 2배 폭등합니다. 고단가 황다랑어(Yellowfin)의 이전가격(Transfer Pricing) 조작 구조가 붕괴됩니다."
          actionPlan="Pillar Two는 글로벌 수산업계의 '디지털세'입니다. 포트폴리오 내 유령법인 구조 의존 기업의 밸류에이션을 즉시 15~20% 디스카운트하십시오. 세무 구조 리스크가 낮고 유럽 내 실질 가공 거점을 보유한 스페인(Frinsa 등) 지역 벤더를 대체 파트너로 재선별해야 합니다."
        />
      </div>
    </div>
  );
}

export function InsightVietnamOEM() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Factory size={20} color="#06b6d4"/> 베트남 OEM 역전 — 황다랑어 가공 생태계 장악
          <TermTooltip term="" description="미국 MMPA 규제와 원물 부족 이중고 속에서 베트남 가공업체의 약세가 오히려 원양 선단 보유 기업에게 최적의 지분 투자 윈도우를 제공합니다." />
        </h3>
        <p className={styles.cardDesc}>2026년 베트남 임금 $342(태국 대비 -20%), VKFTA 무관세. MMPA 규제로 원물 부족 → 한국 원양 선단에 절대적 교섭력 집중.</p>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chartContainer}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={vietnamData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="metric" type="category" stroke="#94a3b8" width={100} />
              <RTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="Vietnam" name="🇻🇳 베트남 (2026)" fill="#06b6d4" radius={[0,4,4,0]} />
              <Bar dataKey="Thailand" name="🇹🇭 태국 (2026)" fill="#64748b" radius={[0,4,4,0]} />
            </BarChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.kpiPanel}>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#06b6d4' }}>
            <div className={styles.kpiLabel}>PE 지분 투자 타겟</div>
            <div className={styles.kpiValue} style={{ color: '#06b6d4' }}>Tan Phat Foods</div>
            <div className={styles.kpiSub}>BRC/IFS/Halal 10개 인증 보유</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          source="ILO Global Wage Report (2025) & 관세청 KCS VKFTA"
          situation="[황다랑어 Buyer's Market] 미국 MMPA(2026 시행)로 베트남 어업 수입 금지 및 황다랑어(Yellowfin) 어획 제한으로 현지 가공 공장의 원물 가뭄이 극심합니다. 이 규제 이중고가 역설적으로 안정적 원양 선단을 보유한 기업에게 베트남 OEM 공장을 장악할 교섭력(Leverage)을 제공합니다."
          actionPlan="베트남의 원물 부족 위기는 한국 조업사에게 최상의 '지분 인수 스위트 스팟'입니다. Tan Phat Foods 등 국제 인증(BRC/IFS)을 보유한 현지 최상위 벤더의 소수 지분(15~25%)을 원물(황다랑어) 장기 공급권과 스왑(Swap)하여 선제적으로 확보하십시오."
        />
      </div>
    </div>
  );
}
