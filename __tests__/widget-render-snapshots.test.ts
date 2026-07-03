import React from 'react';
import { createHash } from 'node:crypto';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  Anchor,
  BarChart3,
  Droplets,
  Factory,
  Fish,
  Globe2,
  Leaf,
  LineChart,
  PackageCheck,
  Radar,
  ShieldCheck,
  Ship,
  ThermometerSun,
  TrendingUp,
  Truck,
  Waves,
  Wheat,
  Zap,
} from 'lucide-react';
import WidgetCard, { Pillar, TelemetryStatus } from '@/components/WidgetCard';
import { TelemetryBadge } from '@/components/TelemetryBadge';

const PILLAR_LABELS: Record<Pillar, string> = {
  S1: '원료 수급',
  S2: '가공 생산',
  S3: '물류 통관',
  S4: '판매 수요',
  S5: '지속가능성',
};

const SCENARIOS = [
  ['tuna-supply', '참치 원어 수급', Fish, 'S1', 'SYNCED', '#22d3ee'],
  ['tuna-processing', '자숙액 수율', Factory, 'S2', 'STATIC', '#f59e0b'],
  ['tuna-logistics', '냉동 운임 방어', Ship, 'S3', 'LIVE', '#38bdf8'],
  ['tuna-demand', '액젓 대체 수요', TrendingUp, 'S4', 'STATIC', '#10b981'],
  ['tuna-esg', '부산물 업사이클링', Leaf, 'S5', 'SYNCED', '#84cc16'],
  ['salmon-supply', '연어 원가 압력', Waves, 'S1', 'LIVE', '#60a5fa'],
  ['salmon-processing', '스몰트 병목', Droplets, 'S2', 'STATIC', '#c084fc'],
  ['salmon-logistics', '콜드체인 리스크', Truck, 'S3', 'SYNCED', '#2dd4bf'],
  ['salmon-demand', '트레이드다운', BarChart3, 'S4', 'STATIC', '#f97316'],
  ['salmon-esg', '인증 프리미엄', ShieldCheck, 'S5', 'SYNCED', '#14b8a6'],
  ['mackerel-supply', '고등어 TAC', Anchor, 'S1', 'LIVE', '#06b6d4'],
  ['mackerel-processing', '필렛 침투율', PackageCheck, 'S2', 'STATIC', '#a78bfa'],
  ['mackerel-logistics', 'TRQ 게이트', Globe2, 'S3', 'SYNCED', '#facc15'],
  ['mackerel-demand', '노르웨이 스프레드', LineChart, 'S4', 'STATIC', '#fb7185'],
  ['mackerel-esg', '기후 북상', ThermometerSun, 'S5', 'STATIC', '#ef4444'],
  ['squid-supply', '오징어 CPUE', Radar, 'S1', 'SYNCED', '#818cf8'],
  ['squid-processing', '임가공 이동', Factory, 'S2', 'STATIC', '#34d399'],
  ['squid-logistics', '블랙홀 항로', Ship, 'S3', 'LIVE', '#0ea5e9'],
  ['squid-demand', '대체재 탄력성', Zap, 'S4', 'STATIC', '#eab308'],
  ['agri-supply', '농산물 TRQ', Wheat, 'S1', 'SYNCED', '#4ade80'],
] as const;

function digest(markup: string) {
  return createHash('sha256').update(markup).digest('hex');
}

function count(markup: string, pattern: RegExp) {
  return Array.from(markup.matchAll(pattern)).length;
}

function summarizeTelemetryMarkup(markup: string) {
  return {
    hash: digest(markup),
    statuses: {
      LIVE: count(markup, />LIVE</g),
      SYNCED: count(markup, />SYNCED</g),
      STATIC: count(markup, />STATIC</g),
    },
    showsLiveSyncDate: markup.includes('ignored'),
    showsSyncedSyncDate: markup.includes('2026-Q2'),
    showsStaticSyncDate: markup.includes('2026-H1'),
  };
}

function summarizeWidgetMarkup(markup: string) {
  return {
    hash: digest(markup),
    cardIds: Array.from(markup.matchAll(/data-widget-id="([^"]+)"/g)).map((match) => match[1]),
    pillars: Array.from(markup.matchAll(/data-pillar="([^"]+)"/g)).map((match) => match[1]),
    statusCounts: {
      LIVE: count(markup, />LIVE</g),
      SYNCED: count(markup, />SYNCED</g),
      STATIC: count(markup, />STATIC</g),
    },
    structureCounts: {
      cards: count(markup, /data-widget-id="/g),
      bodySlots: count(markup, /data-testid="[^"]+-body"/g),
      kpiBoxes: count(markup, />지수</g) + count(markup, />리스크</g),
      situationBlocks: count(markup, />현황 분석</g),
      actionBlocks: count(markup, />실행 전략</g),
      sourceBlocks: count(markup, />출처:/g),
    },
    sampleText: {
      firstTitle: markup.includes('참치 원어 수급'),
      lastTitle: markup.includes('농산물 TRQ'),
      takeawaySentence: markup.includes('카드 헤더, 텔레메트리, KPI, SIT/TAK 구조'),
    },
  };
}

describe('widget render snapshots', () => {
  it('keeps telemetry badge status markup stable', () => {
    const markup = renderToStaticMarkup(
      React.createElement('div', { 'data-testid': 'telemetry-strip' },
        React.createElement(TelemetryBadge, { status: 'LIVE', syncDate: 'ignored' }),
        React.createElement(TelemetryBadge, { status: 'SYNCED', syncDate: '2026-Q2' }),
        React.createElement(TelemetryBadge, { status: 'STATIC', syncDate: '2026-H1' }),
      )
    );

    expect(summarizeTelemetryMarkup(markup)).toMatchSnapshot();
  });

  it('keeps 20 representative WidgetCard shells stable', () => {
    const cards = SCENARIOS.map(([id, title, icon, pillar, status, color], index) => (
      React.createElement(WidgetCard, {
        key: id,
        id,
        title,
        icon,
        iconColor: color,
        pillar: pillar as Pillar,
        cardDesc: `${PILLAR_LABELS[pillar as Pillar]} 대표 지표 — 스냅샷 렌더 회귀 확인용`,
        telemetry: { status: status as TelemetryStatus, syncDate: status === 'LIVE' ? '실시간' : '2026-Q2' },
        kpiPanel: [
          { label: '지수', value: 70 + index, sub: '전월 대비 +2p', trendColor: color },
          { label: '리스크', value: `${12 + index}%`, sub: '관찰 구간' },
        ],
        customBody: React.createElement('div', { 'data-testid': `${id}-body` },
          React.createElement('span', null, `${title} 렌더 바디`),
        ),
        takeaway: {
          situation: `${title}는 ${PILLAR_LABELS[pillar as Pillar]} 축의 대표 감시 지표다.`,
          actionPlan: '카드 헤더, 텔레메트리, KPI, SIT/TAK 구조가 변하면 스냅샷으로 포착한다.',
          source: '렌더 회귀 테스트 fixture',
        },
      })
    ));

    const markup = renderToStaticMarkup(
      React.createElement('section', { 'data-testid': 'representative-widget-cards' }, cards)
    );

    expect(summarizeWidgetMarkup(markup)).toMatchSnapshot();
  });
});
