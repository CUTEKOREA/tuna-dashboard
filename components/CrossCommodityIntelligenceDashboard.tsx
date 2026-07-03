'use client';

import React from 'react';
import { AlertTriangle, ArrowRight, BarChart3, Gauge, ShieldAlert, TrendingUp } from 'lucide-react';
import {
  CrossCommodityIntelligence,
  getCrossCommodityIntelligence,
} from '../lib/data/cross-commodity-intelligence';

type ApiPayload = CrossCommodityIntelligence & {
  _metadata?: {
    syncDate?: string;
    status?: string;
  };
};

const INITIAL_DATA = getCrossCommodityIntelligence();

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  paddingBottom: 40,
};

const headerStyle: React.CSSProperties = {
  border: '1px solid rgba(148, 163, 184, 0.22)',
  background: 'rgba(15, 23, 42, 0.76)',
  borderRadius: 8,
  padding: '22px',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 14,
};

const panelStyle: React.CSSProperties = {
  border: '1px solid rgba(148, 163, 184, 0.2)',
  background: 'rgba(15, 23, 42, 0.64)',
  borderRadius: 8,
  padding: 16,
  minHeight: 0,
};

const mutedStyle: React.CSSProperties = {
  color: 'rgba(226, 232, 240, 0.62)',
  fontSize: 12,
  lineHeight: 1.55,
};

const labelStyle: React.CSSProperties = {
  color: 'rgba(226, 232, 240, 0.56)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0,
};

function scoreColor(score: number) {
  if (score >= 85) return '#ef4444';
  if (score >= 75) return '#f59e0b';
  if (score >= 65) return '#38bdf8';
  return '#10b981';
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div style={{ height: 7, borderRadius: 999, background: 'rgba(148, 163, 184, 0.16)', overflow: 'hidden' }}>
      <div style={{ width: `${score}%`, height: '100%', background: scoreColor(score), borderRadius: 999 }} />
    </div>
  );
}

function MetricTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={panelStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={{ marginTop: 8, color: 'var(--text-main)', fontSize: 18, fontWeight: 800, lineHeight: 1.25 }}>
        {value}
      </div>
      <div style={{ ...mutedStyle, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

export default function CrossCommodityIntelligenceDashboard() {
  const [data, setData] = React.useState<CrossCommodityIntelligence>(INITIAL_DATA);
  const [syncDate, setSyncDate] = React.useState(INITIAL_DATA.meta.syncDate);

  React.useEffect(() => {
    let mounted = true;

    fetch('/api/cross-commodity-intelligence', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: ApiPayload | null) => {
        if (!mounted || !payload) return;
        setData(payload);
        setSyncDate(payload._metadata?.syncDate || payload.meta.syncDate);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const heatmapCommodities = Array.from(new Set(data.riskFactors.flatMap((factor) => Object.keys(factor.impacts))));

  return (
    <div style={pageStyle}>
      <section style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ ...labelStyle, color: '#38bdf8' }}>CROSS-COMMODITY</div>
            <h1 style={{ margin: '6px 0 0', fontSize: 26, lineHeight: 1.2, color: 'var(--text-main)' }}>
              통합 인텔리전스
            </h1>
            <p style={{ ...mutedStyle, maxWidth: 760, marginTop: 8 }}>
              {data.meta.method}
            </p>
          </div>
          <div style={{ ...mutedStyle, textAlign: 'right' }}>
            <div>{data.meta.status}</div>
            <div>{syncDate}</div>
          </div>
        </div>
      </section>

      <section style={gridStyle}>
        <MetricTile label="대체 회전" value={data.headline.primaryRotation} sub="가장 높은 대체 압력" />
        <MetricTile label="최대 리스크" value={data.headline.topRisk} sub="평균 충격 점수 기준" />
        <MetricTile label="증액 후보" value={data.headline.topAllocation} sub="마진·수요·헤지 적합도 합성" />
        <MetricTile label="최상위 경보" value={data.headline.topAlert} sub={`${data.anomalyAlerts.length}개 breached alert`} />
      </section>

      <section style={gridStyle}>
        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TrendingUp size={18} color="#38bdf8" />
            <h2 style={{ margin: 0, fontSize: 16, color: 'var(--text-main)' }}>대체재 압력</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.substitutionSignals.map((signal) => (
              <div key={`${signal.from}-${signal.to}`} style={{ borderTop: '1px solid rgba(148, 163, 184, 0.14)', paddingTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)', fontWeight: 800 }}>
                  <span>{signal.from}</span>
                  <ArrowRight size={14} color="rgba(226,232,240,0.5)" />
                  <span>{signal.to}</span>
                  <span style={{ marginLeft: 'auto', color: scoreColor(signal.pressureScore) }}>{signal.pressureScore}</span>
                </div>
                <div style={{ marginTop: 8 }}><ScoreBar score={signal.pressureScore} /></div>
                <div style={{ ...mutedStyle, marginTop: 7 }}>{signal.trigger}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <BarChart3 size={18} color="#f59e0b" />
            <h2 style={{ margin: 0, fontSize: 16, color: 'var(--text-main)' }}>리스크 히트맵</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 520, display: 'grid', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${heatmapCommodities.length}, minmax(48px, 1fr))`, gap: 6 }}>
                <div />
                {heatmapCommodities.map((commodity) => (
                  <div key={commodity} style={{ ...labelStyle, textAlign: 'center' }}>{commodity}</div>
                ))}
              </div>
              {data.riskFactors.map((factor) => (
                <div key={factor.factor} style={{ display: 'grid', gridTemplateColumns: `120px repeat(${heatmapCommodities.length}, minmax(48px, 1fr))`, gap: 6, alignItems: 'center' }}>
                  <div style={{ color: 'var(--text-main)', fontSize: 12, fontWeight: 800 }}>{factor.factor}</div>
                  {heatmapCommodities.map((commodity) => {
                    const score = factor.impacts[commodity] ?? 0;
                    return (
                      <div key={`${factor.factor}-${commodity}`} style={{ borderRadius: 6, padding: '7px 6px', textAlign: 'center', color: '#fff', fontSize: 12, fontWeight: 800, background: `${scoreColor(score)}${score >= 80 ? '55' : '33'}` }}>
                        {score}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Gauge size={18} color="#10b981" />
            <h2 style={{ margin: 0, fontSize: 16, color: 'var(--text-main)' }}>포트폴리오 후보</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.portfolioCandidates.map((candidate, index) => (
              <div key={candidate.commodity} style={{ borderTop: '1px solid rgba(148, 163, 184, 0.14)', paddingTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'rgba(226,232,240,0.5)', fontSize: 12 }}>#{index + 1}</span>
                  <strong style={{ color: 'var(--text-main)' }}>{candidate.commodity}</strong>
                  <span style={{ marginLeft: 'auto', color: scoreColor(candidate.portfolioScore), fontWeight: 900 }}>{candidate.portfolioScore}</span>
                </div>
                <div style={{ marginTop: 8 }}><ScoreBar score={candidate.portfolioScore} /></div>
                <div style={{ ...mutedStyle, marginTop: 7 }}>{candidate.reason}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <ShieldAlert size={18} color="#ef4444" />
          <h2 style={{ margin: 0, fontSize: 16, color: 'var(--text-main)' }}>이상 경보</h2>
        </div>
        <div style={gridStyle}>
          {data.anomalyAlerts.slice(0, 6).map((alert) => (
            <a
              key={`${alert.sourceKind}-${alert.sourceKey}-${alert.metric}`}
              href={alert.watchRoute}
              style={{
                ...panelStyle,
                display: 'block',
                textDecoration: 'none',
                borderColor: alert.severity === '긴급' ? 'rgba(239, 68, 68, 0.42)' : 'rgba(245, 158, 11, 0.34)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} color={scoreColor(alert.urgencyScore)} />
                <strong style={{ color: 'var(--text-main)' }}>{alert.title}</strong>
                <span style={{ marginLeft: 'auto', color: scoreColor(alert.urgencyScore), fontWeight: 900 }}>{alert.urgencyScore}</span>
              </div>
              <div style={{ ...mutedStyle, marginTop: 8 }}>
                {alert.metric} {alert.currentValue}{alert.unit} / 기준 {alert.threshold}{alert.unit}
              </div>
              <div style={{ ...mutedStyle, marginTop: 8 }}>{alert.action}</div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
