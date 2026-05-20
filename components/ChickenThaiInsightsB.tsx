import React from 'react';
import styles from './TunaInsightsDashboard.module.css';
import { ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Factory, AlertTriangle, Building2 } from 'lucide-react';
import TakeawayBox from './TakeawayBox';

/* ═══ DATA ═══ */
const koreaSpecialData = [
  { spec: '일본향(1.8kg)', yield: 62, margin: 15, fcr: 1.58 },
  { spec: '표준(2.2kg)', yield: 68, margin: 18, fcr: 1.65 },
  { spec: 'Korea Special(2.5kg+)', yield: 74, margin: 25, fcr: 1.72 },
  { spec: '브라질 장닭(3kg+)', yield: 78, margin: 10, fcr: 1.85 },
];

const riskRadarData = [
  { risk: '환율(KRW/THB)', thai: 65, brazil: 70 },
  { risk: '사료비(CBOT)', thai: 60, brazil: 55 },
  { risk: '해상운임', thai: 30, brazil: 85 },
  { risk: 'HPAI 리스크', thai: 10, brazil: 90 },
  { risk: '중국 덤핑', thai: 50, brazil: 20 },
  { risk: 'TRQ/관세', thai: 45, brazil: 40 },
];

const partnerData = [
  { company: 'CP Foods', capacity: 95, quality: 80, flexibility: 60, price: 90, esg: 75 },
  { company: 'Betagro', capacity: 70, quality: 95, flexibility: 80, price: 65, esg: 95 },
  { company: 'GFPT', capacity: 85, quality: 90, flexibility: 95, price: 75, esg: 80 },
];

const partnerRadarData = [
  { axis: '생산능력', CP: 95, Betagro: 70, GFPT: 85 },
  { axis: '품질/위생', CP: 80, Betagro: 95, GFPT: 90 },
  { axis: '맞춤 유연성', CP: 60, Betagro: 80, GFPT: 95 },
  { axis: '가격경쟁력', CP: 90, Betagro: 65, GFPT: 75 },
  { axis: 'ESG/트레이스', CP: 75, Betagro: 95, GFPT: 80 },
];

/* ═══ Insight D: Korea Special Line ═══ */
export function InsightKoreaSpecialLine() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Factory size={20} color="#f59e0b"/> Insight D. Korea Special Line — 맞춤형 대형 정육 라인
        </h3>
        <p className={styles.cardDesc}>태국 일본향 1.8kg 소형닭으로는 한국 프랜차이즈 스펙 불충족. 사육기간 연장형 2.5kg+ &quot;Korea Special&quot; 듀얼 라인 신설이 관건.</p>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chartContainer}>
          <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={koreaSpecialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="spec" stroke="#94a3b8" />
              <YAxis yAxisId="left" stroke="#94a3b8" unit="%" />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
              <RTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="yield" name="순살 수율(%)" radius={[4, 4, 0, 0]}>
                {koreaSpecialData.map((entry, idx) => (
                  <Cell key={idx} fill={idx === 2 ? '#f59e0b' : idx === 3 ? '#ef4444' : '#3b82f6'} />
                ))}
              </Bar>
              <Bar yAxisId="left" dataKey="margin" name="예상 마진(%)" fill="#10b981" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
              <Line yAxisId="right" type="monotone" dataKey="fcr" name="FCR(사료요구율)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
            </ComposedChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.kpiPanel}>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#f59e0b' }}>
            <div className={styles.kpiLabel}>Korea Special 마진</div>
            <div className={styles.kpiValue} style={{ color: '#f59e0b' }}>25%</div>
            <div className={styles.kpiSub}>수율 74% · FCR 1.72</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation="태국은 일본 수출 특화로 1.8~2.3kg 소형닭 위주 생산. 한국 프랜차이즈는 브라질 장닭(3kg+)의 큰 다리살에 익숙하여 사이즈 갭 존재. 그러나 Korea Special(2.5kg+)은 브라질보다 수율 74% vs 78%로 비슷하면서 FCR 1.72로 생산효율 우위."
          actionPlan="[Dual Line Strategy] GFPT/Betagro에 사육기간 연장형 2.5kg+ 라인 신설 제안. 일본향 소형 + 한국향 대형의 듀얼 라인으로 양 시장 동시 공략. Korea Special의 순살 수율 74% + 잔뼈 제로 = '1인분당 TCU' 기준으로 브라질산 대비 우위 입증."
          source="GFPT Annual Report 2023 (일 도계 15→30만 마리 증설) & Thai DLD 2023 가공수율 보고서. FCR은 업계 평균 추정치"
        />
      </div>
    </div>
  );
}

/* ═══ Insight E: 리스크 상관관계 레이더 ═══ */
export function InsightRiskNexus() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <AlertTriangle size={20} color="#ef4444"/> Insight E. 리스크 상관관계 넥서스 — 태국 vs 브라질 6축
        </h3>
        <p className={styles.cardDesc}>해상운임(10일 vs 56일)과 HPAI 청정 지위에서 태국이 우위. 중국산 덤핑만이 유일한 경계 대상입니다.</p>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chartContainer}>
          <SafeResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={riskRadarData}>
              <PolarGrid stroke="rgba(255,255,255,0.15)" />
              <PolarAngleAxis dataKey="risk" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
              <RTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Radar name="🇹🇭 태국 리스크" dataKey="thai" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="🇧🇷 브라질 리스크" dataKey="brazil" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
            </RadarChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.kpiPanel}>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#10b981' }}>
            <div className={styles.kpiLabel}>태국 HPAI 청정</div>
            <div className={styles.kpiValue} style={{ color: '#10b981' }}>2007~</div>
            <div className={styles.kpiSub}>19년 연속 무발생</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation="6축 리스크 중 태국이 열위인 것은 '중국산 덤핑(13~14% 저가)'과 '환율(KRW/THB)' 뿐입니다. 반면 해상운임(태국 10~14일 vs 브라질 56일), HPAI(태국 19년 청정 vs 브라질 2025 발발)에서 우위. CBOT $4.15 저점은 태국 사료비(매입원가 60~70%) 역대 최저를 의미합니다."
          actionPlan="[Risk Hedging] ①환율: USD 선물환 분기별 리밸런싱 ②CBOT 저점($4.15): 즉시 고정가 LTA ③중국산 덤핑: GACC 위생 부적격 이슈를 역이용 → '안전한 프리미엄' 브랜딩 ④운임: 태국 램차방→부산 10~14일 직항 최적화 ⑤HPAI: 태국 구획화(Compartmentalization) 시스템 = 공급망 보험."
          source="OIE WAHIS, CBOT 실시간 선물, BDI 해상운임 지수, KCS HS 0207 수입통계. ⚠️ 리스크 스코어(0~100)는 상대 비교용 모델링 수치"
        />
      </div>
    </div>
  );
}

/* ═══ Insight F: 파트너사 전략 매칭 ═══ */
export function InsightPartnerMatch() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Building2 size={20} color="#8b5cf6"/> Insight F. 태국 3대 파트너사 전략 매칭 — CP·Betagro·GFPT
        </h3>
        <p className={styles.cardDesc}>GFPT(스펙 R&D 맞춤) + Betagro(프리미엄 ABF) + CP Foods(볼륨 백본). 유통채널별 최적 파트너 매칭.</p>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chartContainer}>
          <SafeResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={partnerRadarData}>
              <PolarGrid stroke="rgba(255,255,255,0.15)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
              <RTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Radar name="CP Foods" dataKey="CP" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} />
              <Radar name="Betagro" dataKey="Betagro" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
              <Radar name="GFPT" dataKey="GFPT" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
            </RadarChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.kpiPanel}>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#8b5cf6' }}>
            <div className={styles.kpiLabel}>GFPT 도계능력 증설</div>
            <div className={styles.kpiValue} style={{ color: '#8b5cf6' }}>30만/일</div>
            <div className={styles.kpiSub}>15→30만 마리 (2배)</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation="①CP Foods: 세계 최대, 글로벌 스탠다드, 대형마트/글로벌 HMR 최적. ②Betagro: e-Traceability 2시간 이력추적, 무항생제(ABF), 웰빙/프리미엄 채널. ③GFPT: 수직계열화, 도계 15→30만/일 2배 증설, 일본/EU 수출 경험 풍부, 프랜차이즈 맞춤 스펙 R&D에 최적."
          actionPlan="[Partner Portfolio] ①GFPT = 프랜차이즈 맞춤 Korea Special Line R&D 파트너 → 순살 스펙 최적화 ②Betagro = 편의점 HMR 프리미엄 → 무항생제 '윤리적 치킨' 브랜딩 ③CP Foods = 볼륨 백본 → 식자재마트/급식 대량 납품 기반 확보. 3사 분산으로 단일 공급처 리스크 헤지."
          source="GFPT Annual Report 2023, Betagro IR 2023, CP Foods 2023 Value Chain Analysis. NotebookLM '닭' 479소스 교차검증"
        />
      </div>
    </div>
  );
}
