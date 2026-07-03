'use client';

import React from 'react';
import {
  ArrowRightLeft,
  BellRing,
  Radar,
  ShieldAlert,
  Target,
  WalletCards,
} from 'lucide-react';
import WidgetCard from './WidgetCard';
import {
  AlertSeverity,
  AnomalyAlert,
  getCrossCommodityIntelligence,
  PortfolioCandidate,
  RiskFactorSignal,
  RiskLevel,
  SubstitutionSignal,
} from '../lib/data/cross-commodity-intelligence';
import styles from './CrossCommodityIntelligence.module.css';

const COMMODITY_COLUMNS = ['참치', '연어', '새우', '닭고기', '돼지고기', '마늘'] as const;

const LEVEL_COLORS: Record<RiskLevel, string> = {
  낮음: '#38bdf8',
  보통: '#f59e0b',
  높음: '#fb7185',
  긴급: '#ef4444',
};

const ALERT_COLORS: Record<AlertSeverity, string> = {
  주의: '#38bdf8',
  경계: '#f59e0b',
  긴급: '#ef4444',
};

function heatColor(value: number): string {
  if (value >= 80) return 'rgba(239, 68, 68, 0.78)';
  if (value >= 65) return 'rgba(245, 158, 11, 0.76)';
  if (value >= 45) return 'rgba(59, 130, 246, 0.68)';
  return 'rgba(16, 185, 129, 0.62)';
}

function HeadlineTile({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={styles.headlineTile}>
      <div className={styles.headlineLabel}>
        <Icon size={13} color={color} />
        {label}
      </div>
      <div className={styles.headlineValue}>{value}</div>
    </div>
  );
}

function SubstitutionMatrix({ signals }: { signals: SubstitutionSignal[] }) {
  return (
    <div className={styles.bodyStack}>
      {signals.map((signal) => (
        <div key={`${signal.from}-${signal.to}`} className={styles.signalRow}>
          <div>
            <div className={styles.pair}>
              {signal.from} → {signal.to}
            </div>
            <div className={styles.trigger}>탄력성 {signal.elasticity.toFixed(2)} · 신뢰 {signal.confidence}%</div>
          </div>
          <div>
            <div className={styles.trigger}>{signal.trigger}</div>
            <div className={styles.barShell} aria-hidden="true">
              <div className={styles.barFill} style={{ width: `${signal.pressureScore}%` }} />
            </div>
          </div>
          <div className={styles.score}>{signal.pressureScore}</div>
        </div>
      ))}
      <div className={styles.note}>{signals[0].action}</div>
    </div>
  );
}

function RiskRadar({ factors }: { factors: RiskFactorSignal[] }) {
  return (
    <div className={styles.bodyStack}>
      <table className={styles.riskTable}>
        <thead>
          <tr>
            <th>충격</th>
            {COMMODITY_COLUMNS.map((commodity) => (
              <th key={commodity}>{commodity}</th>
            ))}
            <th>수준</th>
          </tr>
        </thead>
        <tbody>
          {factors.map((factor) => (
            <tr key={factor.factor}>
              <td className={styles.riskFactor}>{factor.factor}</td>
              {COMMODITY_COLUMNS.map((commodity) => (
                <td key={commodity}>
                  <div
                    className={styles.heatCell}
                    style={{ background: heatColor(factor.impacts[commodity]) }}
                    title={`${commodity} ${factor.impacts[commodity]}점`}
                  >
                    {factor.impacts[commodity]}
                  </div>
                </td>
              ))}
              <td>
                <span className={styles.level} style={{ color: LEVEL_COLORS[factor.level] }}>
                  {factor.level}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.note}>{factors[0].action}</div>
    </div>
  );
}

function PortfolioBoard({ candidates }: { candidates: PortfolioCandidate[] }) {
  return (
    <div className={styles.bodyStack}>
      {candidates.map((candidate) => (
        <div key={candidate.commodity} className={styles.portfolioRow}>
          <div className={styles.commodity}>{candidate.commodity}</div>
          <div>
            <span className={styles.metricLabel}>종합</span>
            <span className={styles.metricValue}>{candidate.portfolioScore}</span>
          </div>
          <div>
            <span className={styles.metricLabel}>마진</span>
            <span className={styles.metricValue}>{candidate.marginScore}</span>
          </div>
          <span className={`${styles.decision} ${candidate.decision === '증액' ? styles.decisionBuy : ''}`}>
            {candidate.decision}
          </span>
        </div>
      ))}
      <div className={styles.note}>{candidates[0].reason}</div>
    </div>
  );
}

function AlertQueue({ alerts }: { alerts: AnomalyAlert[] }) {
  return (
    <div className={styles.bodyStack}>
      {alerts.map((alert) => (
        <div key={alert.title} className={styles.alertRow}>
          <div className={styles.alertHeader}>
            <div>
              <div className={styles.alertTitle}>{alert.title}</div>
              <div className={styles.alertRoute}>{alert.watchRoute}</div>
            </div>
            <span className={styles.alertSeverity} style={{ color: ALERT_COLORS[alert.severity] }}>
              {alert.severity}
            </span>
          </div>
          <div className={styles.alertMetrics}>
            <span>
              현재 {alert.currentValue}
              {alert.unit}
            </span>
            <span>
              임계 {alert.threshold}
              {alert.unit}
            </span>
            <strong>{alert.urgencyScore}</strong>
          </div>
          <div className={styles.note}>{alert.action}</div>
        </div>
      ))}
    </div>
  );
}

export default function CrossCommodityIntelligence() {
  const intelligence = getCrossCommodityIntelligence();
  const telemetry = {
    status: intelligence.meta.status,
    syncDate: `${intelligence.meta.syncDate} 정적 종합`,
    source: intelligence.meta.source,
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>
            <Radar size={14} />
            교차 품목 인텔리전스
          </div>
          <h3 className={styles.title}>가격·수요·리스크를 한 번에 묶은 포트폴리오 판단판</h3>
          <p className={styles.deck}>
            {intelligence.meta.method}. 품목별 위젯에서 분리된 신호를 묶어 대체재 이동, 공통 충격,
            마진 배분을 같은 점수 체계로 비교합니다.
          </p>
        </div>
        <div className={styles.headlineGrid}>
          <HeadlineTile icon={ArrowRightLeft} label="대체 흐름" value={intelligence.headline.primaryRotation} color="#38bdf8" />
          <HeadlineTile icon={ShieldAlert} label="상단 리스크" value={intelligence.headline.topRisk} color="#fb7185" />
          <HeadlineTile icon={Target} label="우선 배분" value={intelligence.headline.topAllocation} color="#34d399" />
          <HeadlineTile icon={BellRing} label="최상위 알림" value={intelligence.headline.topAlert} color="#f59e0b" />
        </div>
      </div>

      <div className={styles.grid}>
        <WidgetCard
          title="대체재 탄력성 매트릭스"
          icon={ArrowRightLeft}
          iconColor="#38bdf8"
          pillar="S4"
          cardDesc="가격 격차·수요 이동률·탄력성으로 품목 간 전환 압력을 0~100점화"
          telemetry={telemetry}
          customBody={<SubstitutionMatrix signals={intelligence.substitutionSignals} />}
          takeaway={{
            situation: `대체 압력 1위는 ${intelligence.headline.primaryRotation}이며, 가격 격차와 전환 속도가 동시에 높습니다. 참치·연어·오징어처럼 외식과 가공 채널이 겹치는 품목은 단일 가격 지표보다 대체 흐름을 같이 봐야 합니다.`,
            actionPlan: '상위 대체 흐름은 판촉·원료 구매·메뉴 제안이 같은 주기로 움직이게 묶습니다. 가격 스파이크가 확인되기 전부터 대체 규격 승인과 공급사 견적을 선행하십시오.',
            source: intelligence.meta.source,
          }}
        />

        <WidgetCard
          title="통합 리스크 레이더"
          icon={Radar}
          iconColor="#fb7185"
          pillar="S3"
          cardDesc="환율·유가·기후·통관·관세 충격을 주요 품목별 민감도 히트맵으로 비교"
          telemetry={telemetry}
          customBody={<RiskRadar factors={intelligence.riskFactors} />}
          takeaway={{
            situation: `${intelligence.riskFactors[0].factor} 충격의 평균 민감도가 ${intelligence.riskFactors[0].averageImpact}점으로 가장 높고, 최대 노출 품목은 ${intelligence.riskFactors[0].highestCommodity}입니다. 수산물은 유가·운임과 기후 리스크가 겹치고, 축산물은 통관·검역 충격이 상대적으로 큽니다.`,
            actionPlan: '상단 리스크가 같은 품목끼리는 헤지와 재고 의사결정을 묶어 운영합니다. 반대로 리스크 원인이 다른 품목은 분산 효과가 있으므로 구매 한도를 별도로 둡니다.',
            source: intelligence.meta.source,
          }}
        />

        <WidgetCard
          title="이상 탐지·알림 큐"
          icon={BellRing}
          iconColor="#f59e0b"
          pillar="S3"
          cardDesc="임계치 초과 신호만 선별해 watchRoute·현재값·조치 우선순위를 표시"
          telemetry={telemetry}
          customBody={<AlertQueue alerts={intelligence.anomalyAlerts} />}
          takeaway={{
            situation: `현재 임계치 초과 알림은 ${intelligence.anomalyAlerts.length}건이며, 최상위 알림은 ${intelligence.headline.topAlert}입니다. 알림은 실제 API 라우트에 연결할 감시 경로를 함께 보관하므로 다음 단계에서 자동 갱신으로 확장할 수 있습니다.`,
            actionPlan: '긴급 알림은 구매·영업·물류 담당자가 같은 기준값을 보고 움직이게 묶으십시오. 경계 알림은 다음 가격 고시 또는 통관 업데이트 전에 담당자 확인을 배정하십시오.',
            source: intelligence.meta.source,
          }}
        />

        <WidgetCard
          title="포트폴리오 마진 보드"
          icon={WalletCards}
          iconColor="#34d399"
          pillar="S4"
          cardDesc="마진·수요 모멘텀·조달 리스크·헤지 적합도를 합산해 증액/유지/축소 판단"
          telemetry={telemetry}
          customBody={<PortfolioBoard candidates={intelligence.portfolioCandidates} />}
          takeaway={{
            situation: `${intelligence.headline.topAllocation}가 종합 점수 ${intelligence.portfolioCandidates[0].portfolioScore}점으로 가장 앞섭니다. 마진이 높아도 조달 리스크가 크면 점수가 깎이므로, 단순 수익률보다 실제 배분 가능성을 우선합니다.`,
            actionPlan: '증액 품목은 물량 확대와 판가 전가를 동시에 검증하고, 유지 품목은 공급사별 리스크 차이를 반영해 한도를 쪼갭니다. 축소 판단은 다음 단계에서 LIVE 임계치 알림과 연결합니다.',
            source: intelligence.meta.source,
          }}
        />
      </div>
    </section>
  );
}
