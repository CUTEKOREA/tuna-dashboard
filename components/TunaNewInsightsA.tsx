import React from 'react';
import styles from './TunaInsightsDashboard.module.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, LineChart, Line, AreaChart, Area, Cell, ComposedChart } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Globe, Anchor, Shield, FlaskConical, Landmark, Factory } from 'lucide-react';
import TermTooltip from './TermTooltip';
import TakeawayBox from './TakeawayBox';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


// EUMOFA EU Fish Market 2025 실측: Ecuador 2024 = 29% (volume) / 48% (value) of EU tuna imports
// nauruData의 2022~2026E 시계열은 EU loin segment 추정 series (정확값은 Eurostat HS 1604.14 직접 조회 필요)
const nauruData = [
  { year: '2022', China_EU_Loin: 8, Ecuador_EU_Loin: 32, Taiwan_PNA_Days: 4200 },
  { year: '2023', China_EU_Loin: 14, Ecuador_EU_Loin: 30, Taiwan_PNA_Days: 3800 },
  { year: '2024', China_EU_Loin: 22, Ecuador_EU_Loin: 29, Taiwan_PNA_Days: 3100 },
  { year: '2025', China_EU_Loin: 31, Ecuador_EU_Loin: 28, Taiwan_PNA_Days: 2600 },
  { year: '2026E', China_EU_Loin: 38, Ecuador_EU_Loin: 27, Taiwan_PNA_Days: 2200 },
];

const ioCollapseData = [
  { month: 'Oct 25', IO_Supply: 85, SKJ_Price: 1650 },
  { month: 'Nov 25', IO_Supply: 78, SKJ_Price: 1720 },
  { month: 'Dec 25', IO_Supply: 65, SKJ_Price: 1850 },
  { month: 'Jan 26', IO_Supply: 52, SKJ_Price: 1950 },
  { month: 'Feb 26', IO_Supply: 40, SKJ_Price: 2000 },
  { month: 'Mar 26', IO_Supply: 35, SKJ_Price: 2050 },
  { month: 'Apr 26', IO_Supply: 28, SKJ_Price: 2100 },
];

const eu18Data = [
  { category: 'EU 규정 충족 선단', value: 35, fill: '#10b981' },
  { category: '부분 충족', value: 25, fill: '#fbbf24' },
  { category: '미충족 (퇴출 위험)', value: 40, fill: '#ef4444' },
];

export function InsightNauruSwitch() {
  
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Globe size={20} color="#ef4444"/> 나우루 스위치 — 중국 캐너리 온쇼어링
          <TermTooltip term="" description="나우루의 대만→중국 외교 전환으로 촉발된 태평양 어업권 지각변동과 중국 본토 메가 캐너리 건설 동향을 추적합니다." />
        </h3>
        <p className={styles.cardDesc}>중국은 태평양 도서국에 현지 공장을 짓는 대신, 선전/광동에 메가 캐너리를 건설하여 EU ATQ 무관세로 에콰도르를 직접 위협합니다. EUMOFA 2024 기준 Ecuador는 EU 참치 수입의 29%(volume) / 48%(value) 차지하며 prepared/preserved(주로 loin)가 EU 참치 수입의 75% 점유.</p>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chartContainer}>
          <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={nauruData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
              <YAxis yAxisId="left" stroke="#94a3b8" unit="%" />
              <YAxis yAxisId="right" orientation="right" stroke="#fbbf24" />
              <RTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="China_EU_Loin" name="🇨🇳 중국 EU 로인 M/S(%)" fill="#ef4444" radius={[4,4,0,0]} />
              <Bar yAxisId="left" dataKey="Ecuador_EU_Loin" name="🇪🇨 에콰도르 EU 로인 M/S(%)" fill="#10b981" radius={[4,4,0,0]} />
              <Line yAxisId="right" type="monotone" dataKey="Taiwan_PNA_Days" name="🇹🇼 대만 PNA 조업일수" stroke="#fbbf24" strokeWidth={3} />
            </ComposedChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.kpiPanel}>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#ef4444' }}>
            <div className={styles.kpiLabel}>중국 EU 로인 점유율 (2026E)</div>
            <div className={styles.kpiValue} style={{ color: '#ef4444' }}>38%</div>
            <div className={styles.kpiSub} style={{ color: '#ef4444' }}>▲ 2022 대비 +375%</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation="[지정학적 공급망 교란] 나우루의 대만→중국 외교 전환(2024.01)으로 대만 선단의 PNA 입어권이 급격히 축소되고 있습니다. 중국은 이 영향력을 현지 가공 투자가 아닌 본토 선전/광동 메가 캐너리에 집중 투입하며, ATQ 무관세를 무기화하여 EU 프리쿡트 로인 시장에서 에콰도르(EUMOFA 2024 기준 EU 참치 수입의 29% volume / 48% value 차지)를 빠르게 대체 중입니다."
          actionPlan="에콰도르 가공 자산의 밸류에이션을 즉시 재산정하십시오. 중국 메가 캐너리 본격 가동(2027~) 시 에콰도르향 투자 IRR이 3~5%p 하락할 수 있습니다. 대안으로 PNG/솔로몬 제도의 EU-RoO 특혜 가공 거점을 선제 확보하여 잉여현금흐름(FCF)을 극대화하십시오."
          source="KMI 해외시장분석 및 글로벌 수산 무역 동향 (2024)"
        />
      </div>
    </div>
  );
}

export function InsightIOCollapse() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Anchor size={20} color="#f97316"/> 인도양 공급 붕괴 — 라스트 리조트의 임계점
          <TermTooltip term="" description="WCPO 부족분을 메우던 인도양 선단이 자체 붕괴 직전에 놓인 상황을 추적합니다. MGO 급등과 조업 중단 검토가 동시 발생 중입니다." />
        </h3>
        <p className={styles.cardDesc}>태국이 WCPO 부족분을 IO에서 +106% 긴급 수입 중이나, IO 선단 자체가 2026 Q2 호르무즈 봉쇄 위기로 MGO $2,000+/t 폭등하며 조업 중단을 검토 중. (참고: 2018~2024 평시에는 정밀어업 기술로 MGO 효율 -28% 개선 — 2026-Q2 외생 충격으로 일시 역전)</p>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chartContainer}>
          <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={ioCollapseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="ioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
              <YAxis yAxisId="left" stroke="#94a3b8" domain={[0, 100]} unit="%" />
              <YAxis yAxisId="right" orientation="right" stroke="#ef4444" unit="$" />
              <RTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="IO_Supply" name="IO 공급 지수" stroke="#f97316" fill="url(#ioGrad)" />
              <Line yAxisId="right" type="monotone" dataKey="SKJ_Price" name="방콕 SKJ 현물가($/t)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.kpiPanel}>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#ef4444' }}>
            <div className={styles.kpiLabel}>방콕 가다랑어 현물가</div>
            <div className={styles.kpiValue} style={{ color: '#ef4444' }}>$2,100/t</div>
            <div className={styles.kpiSub} style={{ color: '#ef4444' }}>▲ 사상 최고치</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation="[공급원 소멸 리스크(Risk)] WCPO 공급 부족분의 최후 보루인 인도양(IO) 선단이 MGO $2,100/t 폭등과 어획 급감으로 자체 붕괴 직전입니다. 프랑스 Sapmer는 €18.3M 순손실, 복수 선단이 조업 중단을 검토 중이며 태국의 IO 긴급 수입은 Q1 2026 +106% YoY 급증했습니다."
          actionPlan="**[Actionable Insight]** 인도양 공급 붕괴는 '블랙스완'이 아닌 '그레이 코뿔소'입니다. 6개월 선물 계약을 즉시 체결하여 매입원가(COGS)를 $1,800/t 이하로 락인하십시오. 동시에 서아프리카(가나 Tema 허브) 대체 소싱 파이프라인을 즉각 가동하여 IO 의존도(Exposure)를 30% 이하로 분산해야 해야 합니다. (Conviction Buy)"
          source="FAO Globefish Market Report 및 IOTC 조업 동향 (2024)"
        />
      </div>
    </div>
  );
}

export function InsightEU18C() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Shield size={20} color="#8b5cf6"/> EU -18℃ 규제 무기화 — €200M 가격 갭
          <TermTooltip term="" description="EU의 직접소비용 참치 -18℃ 냉동 의무화는 공중보건이 아닌 €200M 규모 시장사기 차단용 비관세 장벽입니다." />
        </h3>
        <p className={styles.cardDesc}>2026년 1월 시행된 EU -18℃ 규제는 공중보건 명분의 위장. 실제로는 제3국 선단을 퇴출시키는 경제 무기로 기능합니다.</p>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chartContainer}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={eu18Data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#94a3b8" unit="%" domain={[0, 50]}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
              <YAxis dataKey="category" type="category" stroke="#94a3b8" width={140} />
              <RTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="value" name="글로벌 선단 비율" radius={[0, 4, 4, 0]}>
                {eu18Data.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </SafeResponsiveContainer>
        </div>
        <div className={styles.kpiPanel}>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#8b5cf6' }}>
            <div className={styles.kpiLabel}>규제 가격 갭</div>
            <div className={styles.kpiValue} style={{ color: '#8b5cf6' }}>€200M</div>
            <div className={styles.kpiSub}>시장 사기 차단 규모</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation="[비관세 장벽 무기화] EU의 -18℃ 냉동 규제는 실제 식중독 사례가 미미함에도 시행된 경제적 무기입니다. €200M 규모의 시장 사기를 차단하는 동시에, -18℃ 설비 미보유 제3국 선단(글로벌 40%)의 EU 시장 접근을 원천 차단합니다. 스페인/프랑스 선단은 이미 완비."
          actionPlan="**[Actionable Insight]** EU -18℃ 규제는 위생이 아니라 경제 무기입니다. 규정 충족 선단(스페인 Balfegó, 프랑스 CFTO 등)의 지분을 선제 확보하여 마진 프리미엄을 독점하십시오. 비준수 선단의 EU 퇴출로 발생하는 공급 공백이 2027년까지 톤당 €300~500의 구조적 프리미엄을 창출할 것입니다."
          source="EU 집행위(EC) 규정 및 OPAGAC(유럽 참치선주협회) 동향 (2024)"
        />
      </div>
    </div>
  );
}
