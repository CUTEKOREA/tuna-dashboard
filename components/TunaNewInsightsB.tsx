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

const vietnamData = [
  { metric: '월 임금($)', Vietnam: 342, Thailand: 431 },
  { metric: '리드타임(일)', Vietnam: 6.35, Thailand: 7.13 },
  { metric: '인증 수(개)', Vietnam: 10, Thailand: 8 },
  { metric: 'VKFTA 관세(%)', Vietnam: 0, Thailand: 8 },
];

export function InsightTunaExtract() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <FlaskConical size={20} color="#10b981"/> Insight D. 참치액젓 분말화 혁명
          <TermTooltip term="" description="참치액은 액젓이 아니라 700억 원 '코인 육수' 시장을 지배할 B2B 분말 소재입니다. 분무건조 기술로 물류비 50% 절감." />
        </h3>
        <p className={styles.cardDesc}>참치액 시장 700억 원. 코인 육수 시장 +20% YoY 성장 중. 분말화로 냉동→건화물 전환 시 물류비 획기적 절감.</p>
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
            <div className={styles.kpiSub}>분말 소재 수요 폭발</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation="[Hidden Cash-Cow: Powder Revolution] 한국 참치액 시장(700억 원)은 과포화된 액상 경쟁에서 벗어나 '코인 육수' 분말 시장(+20% YoY)으로 급속 확장 중입니다. VKFTA 0% 관세와 베트남 분무건조 설비를 결합하면, 냉동 컨테이너를 건화물로 전환하여 물류비 50% 이상 절감이 가능합니다."
          actionPlan="참치액의 미래는 '병'이 아니라 '분말'에 있습니다. 베트남 현지 분무건조 파일럿을 즉시 가동하고, CJ/대상 등 코인 육수 제조사에 독점 B2B 핵심 원료 납품 계약을 선제적으로 체결하십시오. TN 지수 1.5% 이상 고농축 스펙으로 차별화하면 기존 대기업 대비 프리미엄 포지션 확보가 가능합니다."
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
          <Landmark size={20} color="#fbbf24"/> Insight E. OECD Pillar Two 세금 폭탄
          <TermTooltip term="" description="OECD 글로벌 최저한세 도입으로 다국적 수산기업의 실효세율이 7%→14%로 거의 2배 폭등. ROE 근본적 훼손." />
        </h3>
        <p className={styles.cardDesc}>조세 피난처와 이전가격 조작에 의존하던 다국적 수산기업의 실효세율이 OECD Pillar Two로 거의 2배 폭등합니다.</p>
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
              <Bar dataKey="after" name="Pillar Two 적용 후(%)" fill="#fbbf24" radius={[4,4,0,0]} />
            </BarChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.kpiPanel}>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#fbbf24' }}>
            <div className={styles.kpiLabel}>Avg. Tax Rate Impact</div>
            <div className={styles.kpiValue} style={{ color: '#fbbf24' }}>7% → 14%</div>
            <div className={styles.kpiSub} style={{ color: '#ef4444' }}>▲ ROE 근본적 훼손</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation="[Structural Tax Shock] OECD 글로벌 최저한세(Pillar Two) 전면 도입으로 조세 피난처 유령법인을 활용하던 다국적 수산기업(Thai Union, Bolton, FCF 등)의 실효 법인세율이 7~8%에서 11~14%로 거의 2배 폭등합니다. 이전가격(Transfer Pricing) 조작 구조가 붕괴되며 순이익률이 3~5%p 압축됩니다."
          actionPlan="Pillar Two는 수산업계의 '디지털세'입니다. 포트폴리오 내 유령법인 구조 의존 기업의 밸류에이션을 즉시 15~20% 디스카운트하십시오. 세무 구조 리스크가 낮고 실질 가공 거점을 보유한 Frinsa(스페인, EBITDA 10.4%) 등을 대체 투자 대상으로 재선별해야 합니다."
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
          <Factory size={20} color="#06b6d4"/> Insight F. 베트남 OEM 역전 — PE 스위트 스팟
          <TermTooltip term="" description="MMPA·원물 이중고 속 베트남 가공업체의 약세가 오히려 원양 선단 보유 PE에게 최적의 지분 투자 윈도우를 제공합니다." />
        </h3>
        <p className={styles.cardDesc}>베트남 임금 $342(태국 $431 대비 -20%), VKFTA 0% 관세. MMPA 규제로 원물 부족 → 원양 선단 보유 기업에 바이어스 마켓.</p>
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
              <Bar dataKey="Vietnam" name="🇻🇳 베트남" fill="#06b6d4" radius={[0,4,4,0]} />
              <Bar dataKey="Thailand" name="🇹🇭 태국" fill="#64748b" radius={[0,4,4,0]} />
            </BarChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.kpiPanel}>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#06b6d4' }}>
            <div className={styles.kpiLabel}>PE Sweet Spot Target</div>
            <div className={styles.kpiValue} style={{ color: '#06b6d4' }}>Tan Phat</div>
            <div className={styles.kpiSub}>BRC/IFS/Halal 10개 인증 보유</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation="[Buyer's Market Window] 미국 MMPA(2026.01) 시행으로 베트남 12개 어업방식 수입 금지 + 가다랑어 500mm 포획 제한으로 현지 원물 부족이 심화되었습니다. 이 규제 이중고가 역설적으로 대규모 원양 선단 보유 기업에게 베트남 OEM 공장의 사실상 레버리지를 장악할 기회를 제공합니다."
          actionPlan="베트남의 규제 이중고는 원양 선단 보유 기업에게 최상의 '바이어스 마켓'을 만들었습니다. Tan Phat Foods(BRC/IFS/Halal 10개 인증)의 소수 지분(15~25%)을 선제적으로 확보하고, 한국 QC 파견을 통한 통제권을 내재화하십시오. Highland Dragon은 프리미엄 파우치 RTE 특화 라인으로 병행 활용하십시오."
        />
      </div>
    </div>
  );
}
