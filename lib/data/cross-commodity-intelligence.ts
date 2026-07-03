export type RiskLevel = '낮음' | '보통' | '높음' | '긴급';

export interface SubstitutionSignal {
  from: string;
  to: string;
  elasticity: number;
  priceGapPct: number;
  demandShiftPct: number;
  confidence: number;
  trigger: string;
  action: string;
  pressureScore: number;
}

export interface RiskFactorSignal {
  factor: string;
  impacts: Record<string, number>;
  averageImpact: number;
  highestCommodity: string;
  level: RiskLevel;
  action: string;
}

export interface PortfolioCandidate {
  commodity: string;
  marginScore: number;
  demandMomentum: number;
  supplyRisk: number;
  hedgeFit: number;
  portfolioScore: number;
  decision: '증액' | '유지' | '축소';
  reason: string;
}

export type AlertSeverity = '주의' | '경계' | '긴급';
export type AlertSourceKind = 'substitution' | 'risk';

export interface AnomalyAlert {
  sourceKind: AlertSourceKind;
  sourceKey: string;
  title: string;
  commodity: string;
  metric: string;
  watchRoute: string;
  currentValue: number;
  threshold: number;
  unit: string;
  severity: AlertSeverity;
  breached: boolean;
  urgencyScore: number;
  action: string;
}

export interface CrossCommodityIntelligence {
  meta: {
    status: 'STATIC';
    syncDate: string;
    source: string;
    method: string;
  };
  substitutionSignals: SubstitutionSignal[];
  riskFactors: RiskFactorSignal[];
  portfolioCandidates: PortfolioCandidate[];
  anomalyAlerts: AnomalyAlert[];
  headline: {
    primaryRotation: string;
    topRisk: string;
    topAllocation: string;
    topAlert: string;
  };
}

const SUBSTITUTION_INPUTS = [
  {
    from: '참치 원어',
    to: '고등어',
    elasticity: 0.42,
    priceGapPct: 18,
    demandShiftPct: 7,
    confidence: 82,
    trigger: '방콕 SKJ 반등 또는 캔 원가 상승',
    action: '저가 단백질 채널은 고등어·정어리 소싱으로 판촉 공백을 메운다.',
  },
  {
    from: '연어',
    to: '참치 사시미',
    elasticity: 0.34,
    priceGapPct: 24,
    demandShiftPct: 6,
    confidence: 78,
    trigger: '노르웨이 현물가·항공 운임 동반 상승',
    action: '외식 채널에는 냉동 사쿠 규격을 묶어 연어 대체 메뉴를 제안한다.',
  },
  {
    from: '오징어',
    to: '대왕오징어',
    elasticity: 0.71,
    priceGapPct: 41,
    demandShiftPct: 13,
    confidence: 88,
    trigger: '살오징어 어획 부진과 내수 가격 스파이크',
    action: '가공용은 대왕오징어 혼합 규격을 선제 승인해 원가 상단을 막는다.',
  },
  {
    from: '돼지고기',
    to: '닭고기',
    elasticity: 0.29,
    priceGapPct: 12,
    demandShiftPct: 4,
    confidence: 74,
    trigger: '수입 돈육 검역 지연 또는 환율 상승',
    action: 'HMR·급식 채널은 닭 부분육 대체 메뉴를 먼저 제안한다.',
  },
] as const;

const RISK_INPUTS = [
  {
    factor: '달러 강세',
    impacts: { 참치: 74, 연어: 82, 새우: 78, 닭고기: 62, 돼지고기: 58, 마늘: 45 },
    action: '달러 매입 원재료는 분기 단위 환헤지 비율을 상향하고 원화 판매가는 밴드형으로 재협상한다.',
  },
  {
    factor: '유가·운임',
    impacts: { 참치: 86, 연어: 64, 새우: 70, 닭고기: 42, 돼지고기: 46, 마늘: 51 },
    action: '원양·냉동 컨테이너 의존도가 큰 참치와 새우는 선복을 장기 락인한다.',
  },
  {
    factor: '기후·어황',
    impacts: { 참치: 81, 연어: 76, 새우: 68, 닭고기: 36, 돼지고기: 34, 마늘: 72 },
    action: '어황 민감 품목은 2개 산지 이상으로 분산하고 농산물은 작황 보험성 재고를 확보한다.',
  },
  {
    factor: '통관·검역',
    impacts: { 참치: 54, 연어: 67, 새우: 84, 닭고기: 73, 돼지고기: 79, 마늘: 57 },
    action: '검역 리스크가 높은 축산·새우는 공급사별 부적합 이력과 대체국 승인 현황을 함께 본다.',
  },
  {
    factor: '관세·정책',
    impacts: { 참치: 69, 연어: 48, 새우: 63, 닭고기: 52, 돼지고기: 61, 마늘: 66 },
    action: '관세 민감 품목은 FTA 쿼터 잔량과 원산지 전환 가능성을 월 단위로 갱신한다.',
  },
] as const;

const PORTFOLIO_INPUTS = [
  {
    commodity: '참치 사시미',
    marginScore: 86,
    demandMomentum: 74,
    supplyRisk: 55,
    hedgeFit: 72,
    decision: '증액',
    reason: '원물 가격 하락 구간에서 초저온·가공 프리미엄을 붙일 수 있어 스프레드 방어력이 높다.',
  },
  {
    commodity: '대왕오징어',
    marginScore: 79,
    demandMomentum: 81,
    supplyRisk: 43,
    hedgeFit: 68,
    decision: '증액',
    reason: '살오징어 가격 급등 시 가공용 대체재로 전환 속도가 빠르고 단가 격차가 크다.',
  },
  {
    commodity: '연어',
    marginScore: 68,
    demandMomentum: 77,
    supplyRisk: 69,
    hedgeFit: 58,
    decision: '유지',
    reason: '수요는 견조하지만 항공 운임과 노르웨이 현물가 노출이 커서 판가 전가 확인이 필요하다.',
  },
  {
    commodity: '새우',
    marginScore: 64,
    demandMomentum: 66,
    supplyRisk: 72,
    hedgeFit: 61,
    decision: '유지',
    reason: '가격 매력은 있으나 검역·수입국 다변화 리스크가 높아 공급사별 선별 매입이 맞다.',
  },
  {
    commodity: '마늘 가공품',
    marginScore: 73,
    demandMomentum: 69,
    supplyRisk: 52,
    hedgeFit: 64,
    decision: '증액',
    reason: 'HORECA 전처리 수요와 인건비 회피 수요가 겹쳐 신선보다 가공품 마진이 방어된다.',
  },
] as const;

const SUBSTITUTION_ALERT_THRESHOLD = 70;
const RISK_ALERT_THRESHOLD = 75;

const COMMODITY_WATCH_ROUTES: Record<string, string> = {
  '참치 원어': '/api/tuna/ticker',
  '참치': '/api/tuna/ticker',
  '연어': '/api/salmon/kamis',
  '오징어': '/api/squid/squid-forecast',
  '새우': '/api/shrimp/compliance',
  '닭고기': '/api/chicken/parts',
  '돼지고기': '/api/beef/hanwoo-price',
  '마늘': '/api/garlic/widget',
};

const RISK_WATCH_ROUTES: Record<string, string> = {
  '달러 강세': '/api/exchange',
  '유가·운임': '/api/mgo',
  '기후·어황': '/api/typhoon',
  '통관·검역': '/api/shrimp/compliance',
  '관세·정책': '/api/tariffs',
};

const RISK_METRICS: Record<string, string> = {
  '달러 강세': '달러 민감도',
  '유가·운임': '유가·운임 민감도',
  '기후·어황': '기후·어황 민감도',
  '통관·검역': '통관 민감도',
  '관세·정책': '정책 민감도',
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function riskLevel(score: number): RiskLevel {
  if (score >= 80) return '긴급';
  if (score >= 65) return '높음';
  if (score >= 45) return '보통';
  return '낮음';
}

function scoreSubstitution(input: (typeof SUBSTITUTION_INPUTS)[number]): SubstitutionSignal {
  return {
    ...input,
    pressureScore: clampScore(input.elasticity * 58 + input.priceGapPct * 0.72 + input.demandShiftPct * 1.7),
  };
}

function scoreRisk(input: (typeof RISK_INPUTS)[number]): RiskFactorSignal {
  const entries = Object.entries(input.impacts);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const averageImpact = clampScore(total / entries.length);
  const [highestCommodity] = entries.reduce(
    (best, current) => (current[1] > best[1] ? current : best),
    entries[0],
  );

  return {
    ...input,
    averageImpact,
    highestCommodity,
    level: riskLevel(averageImpact),
  };
}

function scorePortfolio(input: (typeof PORTFOLIO_INPUTS)[number]): PortfolioCandidate {
  const portfolioScore = clampScore(
    input.marginScore * 0.42 +
      input.demandMomentum * 0.28 +
      input.hedgeFit * 0.14 -
      input.supplyRisk * 0.16 +
      20,
  );

  return {
    ...input,
    decision: input.decision as PortfolioCandidate['decision'],
    portfolioScore,
  };
}

function severityWeight(severity: AlertSeverity): number {
  if (severity === '긴급') return 18;
  if (severity === '경계') return 10;
  return 4;
}

function alertSeverity(currentValue: number, threshold: number): AlertSeverity {
  const excess = currentValue - threshold;

  if (currentValue >= 90 || excess >= 15) return '긴급';
  if (currentValue >= 80 || excess >= 8) return '경계';
  return '주의';
}

function scoreAlertUrgency(currentValue: number, threshold: number, severity: AlertSeverity): number {
  const thresholdPressure = ((currentValue - threshold) / threshold) * 100;

  return clampScore(currentValue * 0.74 + Math.max(0, thresholdPressure) * 0.7 + severityWeight(severity));
}

function watchRouteForCommodity(commodity: string): string {
  return COMMODITY_WATCH_ROUTES[commodity] ?? '/api/cross-commodity-intelligence';
}

function watchRouteForRisk(factor: string, commodity: string): string {
  return RISK_WATCH_ROUTES[factor] ?? watchRouteForCommodity(commodity);
}

function directive(action: string, suffix: string): string {
  return `${action.replace(/\.$/, '')}. ${suffix}`;
}

function createSubstitutionAlert(signal: SubstitutionSignal): AnomalyAlert | null {
  const threshold = SUBSTITUTION_ALERT_THRESHOLD;

  if (signal.pressureScore < threshold) return null;

  const severity = alertSeverity(signal.pressureScore, threshold);

  return {
    sourceKind: 'substitution',
    sourceKey: `${signal.from}->${signal.to}`,
    title: `${signal.from} 대체 압력 급등`,
    commodity: signal.from,
    metric: '대체 압력',
    watchRoute: watchRouteForCommodity(signal.from),
    currentValue: signal.pressureScore,
    threshold,
    unit: '점',
    severity,
    breached: true,
    urgencyScore: scoreAlertUrgency(signal.pressureScore, threshold, severity),
    action: directive(signal.action, `${signal.to} 견적·규격 승인 상태를 즉시 재점검하십시오.`),
  };
}

function createRiskAlert(factor: RiskFactorSignal): AnomalyAlert | null {
  const [commodity, currentValue] = Object.entries(factor.impacts).sort((a, b) => b[1] - a[1])[0];
  const threshold = RISK_ALERT_THRESHOLD;

  if (currentValue < threshold) return null;

  const severity = alertSeverity(currentValue, threshold);

  return {
    sourceKind: 'risk',
    sourceKey: factor.factor,
    title: `${commodity} ${factor.factor} 리스크`,
    commodity,
    metric: RISK_METRICS[factor.factor] ?? `${factor.factor} 민감도`,
    watchRoute: watchRouteForRisk(factor.factor, commodity),
    currentValue,
    threshold,
    unit: '점',
    severity,
    breached: true,
    urgencyScore: scoreAlertUrgency(currentValue, threshold, severity),
    action: directive(factor.action, `${commodity} 담당자 기준값과 대체 공급 옵션을 재확인하십시오.`),
  };
}

export function getCrossCommodityIntelligence(): CrossCommodityIntelligence {
  const substitutionSignals = SUBSTITUTION_INPUTS.map(scoreSubstitution)
    .sort((a, b) => b.pressureScore - a.pressureScore);
  const riskFactors = RISK_INPUTS.map(scoreRisk)
    .sort((a, b) => b.averageImpact - a.averageImpact);
  const portfolioCandidates = PORTFOLIO_INPUTS.map(scorePortfolio)
    .sort((a, b) => b.portfolioScore - a.portfolioScore);
  const anomalyAlerts = [
    ...substitutionSignals.map(createSubstitutionAlert),
    ...riskFactors.map(createRiskAlert),
  ]
    .filter((alert): alert is AnomalyAlert => Boolean(alert))
    .sort((a, b) => b.urgencyScore - a.urgencyScore);

  return {
    meta: {
      status: 'STATIC',
      syncDate: '2026.07.03',
      source: 'Atuna·KCS·KAMIS·USDA FAS·FAOSTAT 계열 위젯 종합',
      method: '대체재 탄력성, 리스크 히트맵, 마진·수요·조달 리스크 합성 점수',
    },
    substitutionSignals,
    riskFactors,
    portfolioCandidates,
    anomalyAlerts,
    headline: {
      primaryRotation: `${substitutionSignals[0].from} → ${substitutionSignals[0].to}`,
      topRisk: `${riskFactors[0].factor} / ${riskFactors[0].highestCommodity}`,
      topAllocation: portfolioCandidates[0].commodity,
      topAlert: anomalyAlerts[0].title,
    },
  };
}
