import React from 'react';
import styles from './TunaInsightsDashboard.module.css';
import { ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, BarChart, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Timer, ShoppingCart, Warehouse } from 'lucide-react';
import TakeawayBox from './TakeawayBox';

/* ═══ DATA ═══ */
const arbitrageData = [
  { month: '1월', domestic: 1950, brazil: 1750, thai: 2500, spread: 200 },
  { month: '3월', domestic: 2050, brazil: 1800, thai: 2600, spread: 250 },
  { month: '5월(HPAI)', domestic: 2300, brazil: 0, thai: 2750, spread: 2300 },
  { month: '7월(복날)', domestic: 2650, brazil: 0, thai: 2850, spread: 2650 },
  { month: '9월', domestic: 2200, brazil: 1850, thai: 2700, spread: 350 },
  { month: '11월', domestic: 2403, brazil: 2000, thai: 2650, spread: 403 },
];

const channelData = [
  { channel: '프랜차이즈 B2B', margin: 28, volume: 85, difficulty: 60 },
  { channel: '편의점 HMR', margin: 35, volume: 55, difficulty: 80 },
  { channel: '대형마트 냉동', margin: 18, volume: 70, difficulty: 50 },
  { channel: '식자재마트', margin: 12, volume: 90, difficulty: 30 },
];

const vmiLockData = [
  { stage: '초기 도입', retention: 45, margin: 8 },
  { stage: '3개월', retention: 62, margin: 12 },
  { stage: '6개월', retention: 78, margin: 18 },
  { stage: '12개월', retention: 88, margin: 22 },
  { stage: '24개월+', retention: 95, margin: 28 },
];

/* ═══ Insight A: 타임갭 차익거래 ═══ */
export function InsightTimeGapArbitrage() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Timer size={20} color="#ef4444"/> Insight A. 타임갭 차익거래 — 브라질 HPAI 전환 윈도우
        </h3>
        <p className={styles.cardDesc}>브라질 HPAI 수입금지(5~7월) 기간 국내 도매가 +10% 폭등. 이 6~12개월 타임갭이 태국산 전환의 핵심 차익거래 윈도우입니다.</p>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chartContainer}>
          <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={arbitrageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis yAxisId="left" stroke="#94a3b8" unit="원" />
              <RTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="domestic" name="🇰🇷 국내 도매가" stroke="#f87171" fill="url(#spreadGrad)" />
              <Line yAxisId="left" type="monotone" dataKey="brazil" name="🇧🇷 브라질산 CIF" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              <Line yAxisId="left" type="monotone" dataKey="thai" name="🇹🇭 태국산 CIF" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.kpiPanel}>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#ef4444' }}>
            <div className={styles.kpiLabel}>HPAI 기간 스프레드</div>
            <div className={styles.kpiValue} style={{ color: '#ef4444' }}>+2,650원</div>
            <div className={styles.kpiSub} style={{ color: '#ef4444' }}>▲ 복날 시 최대 마진</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation="브라질 HPAI 수입금지(5~7월)로 국내 도매가가 KAMIS 기준 1,950→2,650원/kg으로 +36% 폭등합니다. 태국산 CIF 2,750원은 얼핏 비싸 보이나, 순살 수율(잔뼈 제로)과 주방 인건비 절감을 감안한 TCU는 사실상 동등합니다. CBOT 옥수수 $4.15 저점은 태국 생산매입원가 역대 최저를 의미합니다."
          actionPlan="[Temporal Arbitrage] ①GFPT/Betagro와 고정가 LTA 선도계약 즉시 체결 ②TRQ 0% 무관세 쿼터 Q1 선점 ③복날 3개월 전 냉동창고 비축 → 숏티지 시 B2B 방출로 20~30% 마진 실현. 핵심: 'kg당 단가'가 아닌 '1인분당 TCU'로 바이어를 설득해야 합니다."
          source="KAMIS 육계 도매가(2025.11) & KCS HS 0207 수입단가. ⚠️ 브라질산 0=수입금지(가격 아님). 태국산은 CIF+관세+마진 포함 추정치"
        />
      </div>
    </div>
  );
}

/* ═══ Insight B: 유통채널별 수익 매트릭스 ═══ */
export function InsightChannelMatrix() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <ShoppingCart size={20} color="#10b981"/> Insight B. 유통채널별 수익 매트릭스 — 4대 채널 공략 서열
        </h3>
        <p className={styles.cardDesc}>편의점 HMR이 최고 수익성 캐시카우, 프랜차이즈 B2B가 1순위 볼륨 타깃. 대형마트 신선 코너는 국내산이 장악하여 진입 불가.</p>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chartContainer}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={channelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#94a3b8" unit="%" />
              <YAxis dataKey="channel" type="category" stroke="#94a3b8" width={120} />
              <RTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="margin" name="마진율(%)" fill="#10b981" radius={[0, 4, 4, 0]}>
                {channelData.map((_, idx) => (
                  <Cell key={idx} fill={['#8b5cf6', '#10b981', '#3b82f6', '#64748b'][idx]} />
                ))}
              </Bar>
              <Bar dataKey="difficulty" name="진입난이도(%)" fill="#f87171" radius={[0, 4, 4, 0]} fillOpacity={0.5} />
            </BarChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.kpiPanel}>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#10b981' }}>
            <div className={styles.kpiLabel}>최고 수익 채널</div>
            <div className={styles.kpiValue} style={{ color: '#10b981' }}>HMR 35%</div>
            <div className={styles.kpiSub}>편의점 가공육 캐시카우</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation="①프랜차이즈 B2B(맘스터치·BHC·교촌): 순살 다리살 수요 폭발, 브라질 의존도(Exposure) 전환 임계점 진입. ②편의점 HMR: 샐러드치킨·꼬치 최고 마진(35%), 태국 수작업발골+자동화가 핵심 무기. ③대형마트: 생닭은 국내산 독점, 냉동가공 코너만 가능. ④식자재마트: 중국산 13~14% 저가 덤핑 경쟁으로 마진 박."
          actionPlan="[Channel Priority] 1순위=프랜차이즈 B2B 순살 LTA, 캐시카우=편의점 HMR 가공육 납품, 볼륨백본=식자재마트(마진 낮으나 물량 확보). 핵심: 태국산의 '정밀 가공 역량'과 '결품 없는 공급 안정성'을 동시 판매하는 2-Track 영업."
          source="NotebookLM '닭' 479소스 교차분석. KAMIS, KCS HS0207, Thai DLD, CP Foods IR 2023"
        />
      </div>
    </div>
  );
}

/* ═══ Insight C: VMI 락인 전략 ═══ */
export function InsightVMILockin() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Warehouse size={20} color="#3b82f6"/> Insight C. VMI 락인 — 공급 안정성 판매 전략
        </h3>
        <p className={styles.cardDesc}>닭고기가 아니라 &quot;결품 없는 공급 안정성&quot;을 판다. VMI(벤더재고관리) 도입 24개월 후 바이어 재계약률 95%+ 달성.</p>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chartContainer}>
          <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={vmiLockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="stage" stroke="#94a3b8" />
              <YAxis yAxisId="left" stroke="#94a3b8" unit="%" domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" unit="%" />
              <RTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="retention" name="바이어 재계약률(%)" stroke="#3b82f6" fill="url(#retGrad)" />
              <Line yAxisId="right" type="monotone" dataKey="margin" name="평균 마진율(%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.kpiPanel}>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#3b82f6' }}>
            <div className={styles.kpiLabel}>VMI 24개월 재계약률</div>
            <div className={styles.kpiValue} style={{ color: '#3b82f6' }}>95%</div>
            <div className={styles.kpiSub}>Lock-in 마진 28%</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation="한국 프랜차이즈 본사는 결품 리스크를 극도로 기피합니다. 태국산 가공육을 국내 냉동 Repo 창고에 선비축하고, 바이어가 사용한 만큼만 매월 정산하는 VMI 방식은 초기 45%→24개월 95%로 재계약률이 극적으로 상승합니다."
          actionPlan="[VMI Lock-in] ①냉동창고 자본 투자 → '가공육 Repo(환매조건부)' 금융 모델 구축 ②프랜차이즈 본사에 '주방 로스 절감 + 인건비 절감 수치'를 제안 ③24개월 Lock-in 후 마진율 8%→28%로 3.5배 개선. 핵심: 고기를 파는 게 아니라 공급 안정성을 판다."
          source="NotebookLM '닭' 소스 기반 VMI 유통 모델링. Thai DLD & CP Foods 2023 Value Chain Analysis"
        />
      </div>
    </div>
  );
}
