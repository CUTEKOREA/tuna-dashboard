'use client';

import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { Anchor, Fish, Globe } from 'lucide-react';

import WidgetCard from './WidgetCard';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { truncateXAxis } from '@/lib/chart-standards';
import {
  OFIS_LL_MONTH_T,
  OFIS_MONTH_TOTAL_T,
  OFIS_PRIOR_YTD_T,
  OFIS_PS_MONTH_T,
  OFIS_YTD_TOTAL_T,
  ofisHeadline,
  ofisMeta,
  ofisOceans,
  ofisTuna,
  ofisYtdYoyPct,
  oceanCompareRows,
  tunaPriceCompareRows,
  tunaPriceRows,
  volumeCompareRows,
} from '@/lib/data/ofis-monthly';

const fmt = (value: number) => value.toLocaleString('ko-KR');
const fmtPct = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

/** 2026-08-17 소유자 채택: 상승 빨강 · 하락 파랑. 테마 토큰을 그대로 쓴다. */
function deltaColor(pct: number): string {
  if (pct > 0) return 'var(--delta-up)';
  if (pct < 0) return 'var(--delta-down)';
  return 'var(--delta-flat)';
}

const AXIS_TICK = { fill: 'var(--chart-axis)', fontSize: 12 };
const AXIS_TICK_Y = { fill: 'var(--chart-axis)', fontSize: 11 };

function OfisTip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--chart-tooltip-bg)',
      border: '1px solid var(--chart-tooltip-border)',
      borderRadius: '10px',
      padding: '10px 12px',
      fontSize: '12.5px',
    }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 700 }}>{label}</div>
      {payload.map((entry) => (
        <div key={String(entry.name)} style={{ color: 'var(--text-primary)' }}>
          {entry.name} : {typeof entry.value === 'number' ? fmt(entry.value) : entry.value} {unit}
        </div>
      ))}
    </div>
  );
}

export default function OfisMonthlyPanel() {
  const skipjack = tunaPriceRows.find((row) => row.id === 'skipjack');
  const bigeye = tunaPriceRows.find((row) => row.id === 'bigeye');
  const yellowfin = tunaPriceRows.find((row) => row.id === 'yellowfin');
  const pacific = ofisOceans.find((row) => row.id === 'pacific');
  const atlantic = ofisOceans.find((row) => row.id === 'atlantic');
  const indian = ofisOceans.find((row) => row.id === 'indian');
  const southern = ofisOceans.find((row) => row.id === 'southern');

  return (
    <section aria-labelledby="ofis-monthly-title" style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h3 id="ofis-monthly-title" style={{ margin: '0 0 6px', color: 'var(--text-primary)', fontSize: '1.35rem', fontWeight: 700 }}>
            OFIS 전국 원양 생산 — {ofisMeta.periodLabel}
          </h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
            {ofisMeta.ytdLabel} 누계 · 잠정 · 회사 칸 없음 · 2025 회사표·2024 연보와 잇지 않음
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <WidgetCard
          id="W-OFIS01"
          title="전국 원양 물량"
          description={`${ofisMeta.periodLabel} 당월 · ${ofisMeta.ytdLabel} 누계`}
          icon={Anchor}
          iconColor="var(--accent-primary)"
          pillar="S1"
          unit="(톤)"
          cardDesc={`${ofisMeta.file} 당월·누계(잠정). 초판 월보를 이어 붙이지 않음. 상반기를 연환산하지 않음.`}
          telemetry={{ status: 'STATIC', syncDate: ofisMeta.published, label: 'OFIS 월보' }}
          kpiPanel={[
            { label: '6월 합계', value: `${fmt(OFIS_MONTH_TOTAL_T)} 톤`, sub: `전년 동월 ${fmtPct(ofisHeadline.monthYoyPct)}`, trendColor: deltaColor(ofisHeadline.monthYoyPct) },
            { label: '1~6월 누계', value: `${fmt(OFIS_YTD_TOTAL_T)} 톤`, sub: `전년 상반기 ${fmt(OFIS_PRIOR_YTD_T)} · ${fmtPct(ofisYtdYoyPct)}`, trendColor: deltaColor(ofisYtdYoyPct) },
            { label: '6월 선망', value: `${fmt(OFIS_PS_MONTH_T)} 톤`, sub: `전년 동월 ${fmtPct(ofisTuna.purseSeine.monthYoyPct)}`, trendColor: deltaColor(ofisTuna.purseSeine.monthYoyPct) },
            { label: '6월 연승', value: `${fmt(OFIS_LL_MONTH_T)} 톤`, sub: `전년 동월 ${fmtPct(ofisTuna.longline.monthYoyPct)}`, trendColor: deltaColor(ofisTuna.longline.monthYoyPct) },
          ]}
          chartHeight={260}
          chart={(
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeCompareRows} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="구분" tickFormatter={truncateXAxis} tick={AXIS_TICK} />
                <YAxis tick={AXIS_TICK_Y} />
                <Tooltip content={<OfisTip unit="톤" />} />
                <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
                <Bar dataKey="평년" name="평년 5년" fill="var(--chart-s8)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="전년" name="2025년 6월" fill="var(--chart-s4)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="올해" name="2026년 6월" fill="var(--chart-s1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </SafeResponsiveContainer>
          )}
          takeaway={{
            source: `${ofisMeta.title} ${ofisMeta.periodLabel}호 (${ofisMeta.published} · 잠정)`,
            situation: `2026년 6월 원양 생산은 ${fmt(OFIS_MONTH_TOTAL_T)}톤으로 전년 동월 ${fmt(ofisHeadline.priorMonth)}톤보다 21.2% 적다. 1~6월 누계는 ${fmt(OFIS_YTD_TOTAL_T)}톤으로, 같은 호가 다시 쓴 2025 상반기 ${fmt(OFIS_PRIOR_YTD_T)}톤보다 ${fmtPct(ofisYtdYoyPct)}다. 집계는 잠정이며 이후 호에서 정정될 수 있다.`,
            actionPlan: '2026 상반기를 연간으로 읽지 마라. 회사 점유율은 이 표에 없다. 신라 선망 편중은 2025 회사표와 칸을 나눠 봐라.',
          }}
        />

        <WidgetCard
          id="W-OFIS02"
          title="선망·연승과 참치 단가"
          description="당월 물량(톤)과 어가(원/kg)를 같은 호에서만 본다"
          icon={Fish}
          iconColor="var(--chart-s3)"
          pillar="S1"
          unit="(원/kg)"
          cardDesc={`${ofisMeta.file} 어가. 6월 꽁치는 실적 없음 — 단가 0 행을 만들지 않음.`}
          telemetry={{ status: 'STATIC', syncDate: ofisMeta.published, label: 'OFIS 월보' }}
          kpiPanel={[
            { label: '가다랑어', value: `${fmt(skipjack?.current ?? 0)} 원/kg`, sub: `전년 6월 ${fmtPct(skipjack?.yoyPct ?? 0)}`, trendColor: deltaColor(skipjack?.yoyPct ?? 0) },
            { label: '눈다랑어', value: `${fmt(bigeye?.current ?? 0)} 원/kg`, sub: `전년 6월 ${fmtPct(bigeye?.yoyPct ?? 0)}`, trendColor: deltaColor(bigeye?.yoyPct ?? 0) },
            { label: '황다랑어', value: `${fmt(yellowfin?.current ?? 0)} 원/kg`, sub: `전년 6월 ${fmtPct(yellowfin?.yoyPct ?? 0)}`, trendColor: deltaColor(yellowfin?.yoyPct ?? 0) },
          ]}
          chartHeight={260}
          chart={(
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={tunaPriceCompareRows} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="어종" tickFormatter={truncateXAxis} tick={AXIS_TICK} />
                <YAxis tick={AXIS_TICK_Y} />
                <Tooltip content={<OfisTip unit="원/kg" />} />
                <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
                <Bar dataKey="전년" name="2025년 6월" fill="var(--chart-s8)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="올해" name="2026년 6월" fill="var(--chart-s3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </SafeResponsiveContainer>
          )}
          takeaway={{
            source: `${ofisMeta.title} ${ofisMeta.periodLabel}호 어가 (${ofisMeta.published} · 잠정)`,
            situation: `6월 선망은 ${fmt(OFIS_PS_MONTH_T)}톤(${fmtPct(ofisTuna.purseSeine.monthYoyPct)}), 연승은 ${fmt(OFIS_LL_MONTH_T)}톤(${fmtPct(ofisTuna.longline.monthYoyPct)})이다. 가다랑어는 ${fmt(skipjack?.current ?? 0)}원/kg으로 전년 6월과 같다. 눈다랑어는 ${fmt(bigeye?.current ?? 0)}원(${fmtPct(bigeye?.yoyPct ?? 0)}), 황다랑어는 ${fmt(yellowfin?.current ?? 0)}원(${fmtPct(yellowfin?.yoyPct ?? 0)}).`,
            actionPlan: '캐닝 원물 물량 쇼크이지 횟감 단가 쇼크가 아니다. 선망 의존 선단은 물량·조업일수를 보고, 연승은 눈다랑어 단가를 따로 봐라.',
          }}
        />

        <WidgetCard
          id="W-OFIS03"
          title="해역 회전"
          description="태평양·대서양·인도양·남빙양 당월 (톤)"
          icon={Globe}
          iconColor="var(--chart-s4)"
          pillar="S1"
          unit="(톤)"
          cardDesc={`${ofisMeta.file} 해역 당월. 2025 연간 해역 누계와 잇지 않음. 해역 합 33,046톤은 합계 33,045톤과 1톤 차이(원문).`}
          telemetry={{ status: 'STATIC', syncDate: ofisMeta.published, label: 'OFIS 월보' }}
          kpiPanel={[
            { label: '태평양', value: `${fmt(pacific?.month ?? 0)} 톤`, sub: `전년 동월 ${fmtPct(pacific?.monthYoyPct ?? 0)}`, trendColor: deltaColor(pacific?.monthYoyPct ?? 0) },
            { label: '대서양', value: `${fmt(atlantic?.month ?? 0)} 톤`, sub: `전년 동월 ${fmtPct(atlantic?.monthYoyPct ?? 0)}`, trendColor: deltaColor(atlantic?.monthYoyPct ?? 0) },
            { label: '인도양', value: `${fmt(indian?.month ?? 0)} 톤`, sub: `전년 동월 ${fmtPct(indian?.monthYoyPct ?? 0)}`, trendColor: deltaColor(indian?.monthYoyPct ?? 0) },
            { label: '남빙양', value: `${fmt(southern?.month ?? 0)} 톤`, sub: `전년 동월 ${fmtPct(southern?.monthYoyPct ?? 0)}`, trendColor: deltaColor(southern?.monthYoyPct ?? 0) },
          ]}
          chartHeight={260}
          chart={(
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={oceanCompareRows} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="해역" tickFormatter={truncateXAxis} tick={AXIS_TICK} />
                <YAxis tick={AXIS_TICK_Y} />
                <Tooltip content={<OfisTip unit="톤" />} />
                <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
                <Bar dataKey="전년" name="2025년 6월" fill="var(--chart-s8)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="올해" name="2026년 6월" fill="var(--chart-s4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </SafeResponsiveContainer>
          )}
          takeaway={{
            source: `${ofisMeta.title} ${ofisMeta.periodLabel}호 해역 (${ofisMeta.published} · 잠정)`,
            situation: `6월 태평양 ${fmt(pacific?.month ?? 0)}톤(${fmtPct(pacific?.monthYoyPct ?? 0)}), 대서양 ${fmt(atlantic?.month ?? 0)}톤(${fmtPct(atlantic?.monthYoyPct ?? 0)}), 인도양 ${fmt(indian?.month ?? 0)}톤(${fmtPct(indian?.monthYoyPct ?? 0)}), 남빙양 ${fmt(southern?.month ?? 0)}톤(${fmtPct(southern?.monthYoyPct ?? 0)}). 남빙양 당월은 트롤(크릴)이다.`,
            actionPlan: '인도양 증분이 어느 선사인지 월보로는 알 수 없다. 자사 항차·2025 회사표와만 대조하라.',
          }}
        />
      </div>
    </section>
  );
}
