import { describe, expect, it } from 'vitest';
import { getCrossCommodityIntelligence } from '../lib/data/cross-commodity-intelligence';

function expectScore(value: number) {
  expect(Number.isInteger(value)).toBe(true);
  expect(value).toBeGreaterThanOrEqual(0);
  expect(value).toBeLessThanOrEqual(100);
}

describe('cross commodity intelligence model', () => {
  it('keeps the model explicitly static and source-attributed', () => {
    const intelligence = getCrossCommodityIntelligence();

    expect(intelligence.meta.status).toBe('STATIC');
    expect(intelligence.meta.syncDate).toBe('2026.07.03');
    expect(intelligence.meta.source).toContain('KCS');
    expect(intelligence.meta.method).toContain('대체재 탄력성');
  });

  it('sorts substitution pressure, risk, and portfolio scores descending', () => {
    const intelligence = getCrossCommodityIntelligence();

    const substitutionScores = intelligence.substitutionSignals.map((signal) => signal.pressureScore);
    const riskScores = intelligence.riskFactors.map((factor) => factor.averageImpact);
    const portfolioScores = intelligence.portfolioCandidates.map((candidate) => candidate.portfolioScore);

    expect(substitutionScores).toEqual([...substitutionScores].sort((a, b) => b - a));
    expect(riskScores).toEqual([...riskScores].sort((a, b) => b - a));
    expect(portfolioScores).toEqual([...portfolioScores].sort((a, b) => b - a));
  });

  it('bounds every displayed decision score to 0-100', () => {
    const intelligence = getCrossCommodityIntelligence();

    for (const signal of intelligence.substitutionSignals) {
      expectScore(signal.pressureScore);
      expectScore(signal.confidence);
    }

    for (const factor of intelligence.riskFactors) {
      expectScore(factor.averageImpact);
      for (const score of Object.values(factor.impacts)) {
        expectScore(score);
      }
    }

    for (const candidate of intelligence.portfolioCandidates) {
      expectScore(candidate.marginScore);
      expectScore(candidate.demandMomentum);
      expectScore(candidate.supplyRisk);
      expectScore(candidate.hedgeFit);
      expectScore(candidate.portfolioScore);
    }
  });

  it('derives headline decisions from the highest-ranked rows', () => {
    const intelligence = getCrossCommodityIntelligence();

    expect(intelligence.headline.primaryRotation).toBe(
      `${intelligence.substitutionSignals[0].from} → ${intelligence.substitutionSignals[0].to}`,
    );
    expect(intelligence.headline.topRisk).toBe(
      `${intelligence.riskFactors[0].factor} / ${intelligence.riskFactors[0].highestCommodity}`,
    );
    expect(intelligence.headline.topAllocation).toBe(intelligence.portfolioCandidates[0].commodity);
  });

  it('surfaces only breached anomaly alerts sorted by urgency', () => {
    const intelligence = getCrossCommodityIntelligence();

    expect(intelligence.anomalyAlerts.length).toBeGreaterThanOrEqual(3);
    expect(intelligence.anomalyAlerts.every((alert) => alert.breached)).toBe(true);

    const urgencyScores = intelligence.anomalyAlerts.map((alert) => alert.urgencyScore);
    expect(urgencyScores).toEqual([...urgencyScores].sort((a, b) => b - a));

    for (const alert of intelligence.anomalyAlerts) {
      expectScore(alert.urgencyScore);
      expect(alert.currentValue).toBeGreaterThanOrEqual(alert.threshold);
      expect(alert.watchRoute).toMatch(/^\/api\//);
      expect(alert.action).toContain('하십시오');
    }

    expect(intelligence.headline.topAlert).toBe(intelligence.anomalyAlerts[0].title);
  });
});
