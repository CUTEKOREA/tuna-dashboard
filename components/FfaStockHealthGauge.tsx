'use client';

import React from 'react';
import { HeartPulse } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';
import SafeResponsiveContainer from './SafeResponsiveContainer';

// ─── 어종별 자원 건강도 데이터 (FFA/SPC 2024 검증) ─────────────────────────
interface StockHealth {
  species: string;
  abbr: string;
  ratio: number;       // SBrecent/SBF=0
  lrp: number;         // Limit Reference Point
  safetyMargin: number; // ratio / lrp
  status: string;       // 판정
  color: string;
}

const STOCK_DATA: StockHealth[] = [
  { species: '가다랑어', abbr: 'SKJ', ratio: 0.51, lrp: 0.20, safetyMargin: 2.55, status: '건강', color: '#22d3ee' },
  { species: '황다랑어', abbr: 'YFT', ratio: 0.45, lrp: 0.20, safetyMargin: 2.25, status: '건강', color: '#f59e0b' },
  { species: '눈다랑어', abbr: 'BET', ratio: 0.42, lrp: 0.20, safetyMargin: 2.10, status: '건강', color: '#ef4444' },
  { species: '날개다랑어', abbr: 'ALB', ratio: 0.48, lrp: 0.20, safetyMargin: 2.40, status: '건강', color: '#8b5cf6' },
];

// ─── 게이지 색상 결정 함수 ───────────────────────────────────────────────────
function getGaugeColor(ratio: number): string {
  if (ratio >= 0.4) return '#34d399'; // 녹색 (안전)
  if (ratio >= 0.3) return '#fbbf24'; // 황색 (주의)
  return '#f87171';                    // 적색 (위험)
}

// ─── 반원형 게이지 컴포넌트 ─────────────────────────────────────────────────
function SemiGauge({ ratio, lrp, species, abbr, safetyMargin, speciesColor }: {
  ratio: number;
  lrp: number;
  species: string;
  abbr: string;
  safetyMargin: number;
  speciesColor: string;
}) {
  // 게이지는 0~1 범위, 반원형 (180도→0도)
  const maxVal = 1.0;
  const filledValue = Math.min(ratio, maxVal);
  const emptyValue = maxVal - filledValue;
  const gaugeColor = getGaugeColor(ratio);

  const gaugeData = [
    { name: '현재', value: filledValue },
    { name: '여유', value: emptyValue },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px',
    }}>
      {/* 어종 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '4px',
      }}>
        <span style={{ color: speciesColor, fontWeight: 700, fontSize: '0.85rem' }}>
          {species}
        </span>
        <span style={{ color: 'var(--w-slate-500)', fontSize: '0.7rem' }}>({abbr})</span>
      </div>

      {/* 반원형 게이지 */}
      <div style={{ width: 160, height: 90, position: 'relative' }}>
        <SafeResponsiveContainer width={160} height={90}>
          <PieChart>
            <ChartPatternDefs />
            {/* 배경 트랙 (회색) */}
            <Pie
              data={[{ value: 1 }]}
              dataKey="value"
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={50}
              outerRadius={70}
              stroke="none"
            >
              <Cell fill="rgba(140,170,255,0.12)" />
            </Pie>
            {/* 실제 값 게이지 */}
            <Pie
              data={gaugeData}
              dataKey="value"
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={50}
              outerRadius={70}
              stroke="none"
            >
              <Cell fill={gaugeColor} />
              <Cell fill="transparent" />
            </Pie>
            {/* LRP 마커 위치 표시 */}
            <Pie
              data={[
                { value: lrp },
                { value: 0.005 },
                { value: maxVal - lrp - 0.005 },
              ]}
              dataKey="value"
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={46}
              outerRadius={74}
              stroke="none"
            >
              <Cell fill="transparent" />
              <Cell fill="#f87171" />
              <Cell fill="transparent" />
            </Pie>
          </PieChart>
        </SafeResponsiveContainer>

        {/* 중앙 수치 */}
        <div style={{
          position: 'absolute',
          bottom: '2px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            color: gaugeColor,
            lineHeight: 1,
          }}>
            {ratio.toFixed(2)}
          </div>
          <div style={{
            fontSize: '0.6rem',
            color: 'var(--w-slate-500)',
            marginTop: '2px',
          }}>
            SB/SBF=0
          </div>
        </div>
      </div>

      {/* 하단 지표 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '4px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--w-slate-500)' }}>LRP</div>
          <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600 }}>
            {lrp.toFixed(2)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--w-slate-500)' }}>안전배수</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--w-emerald-400)', fontWeight: 700 }}>
            {safetyMargin.toFixed(2)}×
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── KPI 패널 데이터 ─────────────────────────────────────────────────────────
const KPI_ITEMS = [
  { label: '전체 판정', value: '4종 모두 건강', sub: '남획 없음 / 과잉어획 없음', trendColor: '#34d399' },
  { label: 'SKJ 안전배수', value: '2.55×', sub: 'SBrecent/SBF=0 = 0.51' },
  { label: 'LRP 초과 확률', value: '0%', sub: '4종 모두 LRP 이하 확률 0%', trendColor: '#34d399' },
  { label: 'BET MSY', value: '~164,640 MT', sub: '현재 어획 MSY 미만' },
];

// ─── 컴포넌트 본체 ──────────────────────────────────────────────────────────
export default function FfaStockHealthGauge() {
  const customBody = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 8px' }}>
      {/* 게이지 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
      }}>
        {STOCK_DATA.map((s) => (
          <div
            key={s.abbr}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(140,170,255,0.12)',
              borderRadius: 12,
              padding: '8px 4px',
            }}
          >
            <SemiGauge
              ratio={s.ratio}
              lrp={s.lrp}
              species={s.species}
              abbr={s.abbr}
              safetyMargin={s.safetyMargin}
              speciesColor={s.color}
            />
          </div>
        ))}
      </div>

      {/* 색상 범례 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        padding: '8px 0',
      }}>
        {[
          { color: '#34d399', label: '안전 (≥0.40)' },
          { color: '#fbbf24', label: '주의 (0.30-0.40)' },
          { color: '#f87171', label: '위험 (<0.30)' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: item.color,
            }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--w-slate-400)' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* LRP 기준선 설명 */}
      <div style={{
        background: 'rgba(248, 113, 113, 0.05)',
        border: '1px solid rgba(248, 113, 113, 0.15)',
        borderRadius: 10,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
      }}>
        <span style={{ fontSize: '1rem', marginTop: '1px' }}>⚠️</span>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', marginBottom: '4px' }}>
            LRP (Limit Reference Point) = 0.20
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--w-slate-400)', lineHeight: 1.5 }}>
            SBrecent/SBF=0 비율이 LRP(0.20) 미만으로 떨어지면 남획(overfished) 판정.
            게이지의 적색 마커가 LRP 위치를 표시. 현재 4종 모두 LRP 대비 2배 이상의 안전 마진 확보.
          </div>
        </div>
      </div>

      {/* 어종별 상세 상태 테이블 */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 10,
        border: '1px solid rgba(140,170,255,0.12)',
        overflow: 'hidden',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.78rem',
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['어종', 'SB/SBF=0', 'LRP', '안전배수', '판정'].map((h) => (
                <th key={h} style={{
                  padding: '10px 12px',
                  textAlign: 'left',
                  color: 'var(--w-slate-500)',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STOCK_DATA.map((s) => (
              <tr key={s.abbr} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '8px 12px', color: s.color, fontWeight: 600 }}>
                  {s.species} <span style={{ color: 'var(--w-slate-500)', fontWeight: 400 }}>({s.abbr})</span>
                </td>
                <td style={{ padding: '8px 12px', color: getGaugeColor(s.ratio), fontWeight: 700 }}>
                  {s.ratio.toFixed(2)}
                </td>
                <td style={{ padding: '8px 12px', color: '#f87171' }}>
                  {s.lrp.toFixed(2)}
                </td>
                <td style={{ padding: '8px 12px', color: 'var(--w-emerald-400)', fontWeight: 600 }}>
                  {s.safetyMargin.toFixed(2)}×
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{
                    background: 'rgba(var(--w-emerald-400-rgb), 0.1)',
                    color: 'var(--w-emerald-400)',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                  }}>
                    ✅ {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="자원 건강도 게이지"
      icon={HeartPulse}
      iconColor="#34d399"
      pillar="S1"
      cardDesc="FFA/SPC 최신 자원평가 기반 WCPO 4대 참치 어종 SBrecent/SBF=0 비율 및 LRP 대비 안전 마진"
      telemetry={{ status: 'STATIC', syncDate: '2024 FFA/SPC' }}
      termTooltip={{
        term: 'SBF=0',
        description: 'SBF=0(Spawning Biomass at F=0)은 어획이 전혀 없을 때의 산란 자원량. SBrecent/SBF=0은 현재 자원량이 미어획 상태 대비 몇 %인지 나타내는 자원 건강도 지표. LRP(0.20) 미만이면 남획 판정.',
      }}
      kpiPanel={KPI_ITEMS}
      customBody={customBody}
      takeaway={{
        situation: `<div>
<p>2024년 WCPO 4대 참치 자원 평가 결과, <strong>4종 모두 "남획 없음·과잉어획 없음(not overfished, not overfishing)"</strong> 판정. 가다랑어(SKJ) SBrecent/SBF=0 = 0.51로 LRP(0.20) 대비 <strong>2.55배 안전 마진</strong>.</p>
<p>황다랑어(YFT)·눈다랑어(BET)·날개다랑어(ALB) 모두 LRP 이하 확률 0%. BET의 MSY는 ~164,640 MT으로 현재 어획량(151,611 MT)이 MSY 미만 수준 유지.</p>
<p>다만, 2024년 SKJ 어획량이 역대 최고(+24%)를 기록한 만큼, 지속적인 고강도 어획 시 자원량 하락 가능성 모니터링 필요. 특히 ENSO 사이클에 따른 SKJ 자원 변동성 주시 필요.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 현재 4종 모두 안전하나, "안전 마진 축소 속도"가 핵심 모니터링 지표. 절대 수준보다 트렌드 방향이 중요.</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>SKJ 자원 모니터링 강화</strong>: 안전배수 2.55×이지만, 역대 최고 어획량이 지속되면 2-3년 내 0.4 이하로 하락 가능. 분기별 SB/SBF=0 추적.</li>
<li style="margin-bottom: 8px;"><strong>BET MSY 근접 경고 시스템</strong>: 현재 어획(151,611 MT) vs MSY(164,640 MT) 격차 겨우 8%. 어획량이 MSY 초과 시 즉시 소싱 다변화 가동.</li>
<li><strong>WCPFC CMM 선제 대응</strong>: 자원 상태 악화 시 WCPFC 보존관리조치(CMM) 강화 가능성. 쿼터 축소 시나리오별 조달 비용 영향 사전 분석.</li>
</ol>
</div>`,
        source: 'FFA/SPC Stock Assessment Reports 2024, WCPFC Scientific Committee SC20',
      }}
    />
  );
}
