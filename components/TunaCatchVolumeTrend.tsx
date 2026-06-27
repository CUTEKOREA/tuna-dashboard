/**
 * 참치 어획량 추이 (월별, LineChart) — Stage 1 검증 위젯 #1
 *
 * spec: artifacts/spec_stage1.md
 * pillar: S1 (🐟 원료 수급)
 * gradient: cyan → blue (참치 시그니처, ADR-0001 / D-04)
 * ADR-0005 WidgetCard 사용
 */

'use client';
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import WidgetCard from './WidgetCard';

// ─── 정적 mock 데이터 (Stage 1 한정) ─────────────────────────────────────────
// 단위: 천 톤
// 출처: WCPFC 2025 Catch Statistics + IATTC 보고 (Stage 1 mock)
// syncDate: '2026-05-21'
// 한글 라벨 12개 모두 7자 이내 ✓ (D-05 통과)

const data = [
  { month: '1월',  catch: 215 }, { month: '2월',  catch: 198 },
  { month: '3월',  catch: 256 }, { month: '4월',  catch: 284 },
  { month: '5월',  catch: 312 }, { month: '6월',  catch: 345 },
  { month: '7월',  catch: 378 }, { month: '8월',  catch: 401 },
  { month: '9월',  catch: 389 }, { month: '10월', catch: 342 },
  { month: '11월', catch: 287 }, { month: '12월', catch: 234 },
];

// ─── 커스텀 툴팁 (한글 100%, W-02 단위 명기) ─────────────────────────────────

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { month, catch: catchVolume } = payload[0].payload;
  return (
    <div style={{ background: '#0a0f1f', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>
        {month} · {catchVolume.toLocaleString()}천 톤
      </p>
    </div>
  );
};

// ─── 위젯 본체 ───────────────────────────────────────────────────────────────

const TunaCatchVolumeTrend = () => (
  <WidgetCard
    title="참치 어획량 추이"
    icon={TrendingUp}
    iconColor="#22d3ee"
    pillar="S1"
    cardDesc="WCPFC/IATTC 2025년 어획 통계 기반 월별 합산 어획량 추이"
    unit="(천 톤)"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    termTooltip={{
      term: 'WCPFC·IATTC',
      description: 'WCPFC(중서부태평양수산위원회)는 서태평양·중부태평양 참치 자원을 관리하는 국제기구. IATTC(전미열대참치위원회)는 동태평양 참치 어획을 관리하는 국제기구.',
    }}
    chartHeight={300}
    chart={
      <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="tunaCatchVolumeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis
          dataKey="month"
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
        />
        <YAxis
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          tickFormatter={(v) => v.toLocaleString()}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)' }} />
        <Line
          type="monotone"
          dataKey="catch"
          stroke="url(#tunaCatchVolumeGradient)"
          strokeWidth={2.5}
          dot={{ fill: '#22d3ee', r: 3, strokeWidth: 0 }}
          activeDot={{ fill: '#3b82f6', r: 5, strokeWidth: 0 }}
        />
      </LineChart>
    }
    takeaway={{
      situation: `<div>
<p>참치 어획은 양어종이지만 계절성이 매우 강합니다. <strong>7-8월 성수기에서 1-2월 비수기</strong>까지 어획량이 약 2배 진폭으로 변동.</p>
<p>추정치(업계추정): <strong>성수기 401천 톤(8월) vs 비수기 198천 톤(1-2월)</strong>. 9월부터 빠르게 하강하며 동절기 공급 부족 리스크 잠재. 업계 추정 가격 패턴: 성수기 단가 -15~20%, 비수기 단가 +25~30% 수준.</p>
<p>의미: 계절성은 단순 현상이 아니라 <strong>예측 가능한 매입·비축 기회 구간</strong>. 매년 동일 패턴이므로 미리 비축·헷징 가능한 구조적 기회.</p>
</div>`,
      actionPlan: `<div>
<p><strong>전략 방향</strong>: 계절성은 예측 가능한 매입 기회. 매년 5-7월 성수기 진입 전 사전 비축 → 11-2월 동절기 현물 매도 사이클을 체계적으로 운영할 것.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>5-7월 사전 비축</strong>: 성수기 진입 전 매입가 -10~15% 절감(업계추정). 동절기 단가 상승 회피.</li>
<li style="margin-bottom: 8px;"><strong>냉동창고 가용 용량 사전 점검</strong>: Q3 용량 한계 도달 시 마진 악화 우려. 외부 냉동창고 임대 계약을 사전에 확보.</li>
<li><strong>계절성 매입 규칙 수립</strong>: 매년 반복되는 어획 사이클을 매입 규칙(rule-based buying)으로 정형화. 담당자 교체에 무관하게 일관 운영.</li>
</ol>
</div>`,
      source: 'WCPFC 2025 Catch Statistics + IATTC 보고 (Stage 1 mock)',
    }}
  />
);

export default TunaCatchVolumeTrend;
