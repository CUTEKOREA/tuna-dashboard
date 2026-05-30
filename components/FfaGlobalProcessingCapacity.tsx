/**
 * FfaGlobalProcessingCapacity — 글로벌 가공 캐파 모니터
 *
 * 국가별 참치 통조림 가공 용량(천 MT/년) 및 가동률을 수평 막대 차트로 시각화.
 * 태국의 글로벌 점유율(~54%)과 단일 국가 의존 리스크를 강조.
 */

'use client';
import React from 'react';
import { Factory } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, LabelList } from 'recharts';
import WidgetCard from './WidgetCard';
import { truncateKoreanLabel } from '../lib/chart-standards';

// ─── 데이터 ──────────────────────────────────────────────────────────────────

const processingData = [
  { 국가: '태국', 용량: 1200, 가동률: 80 },
  { 국가: '에콰도르', 용량: 350, 가동률: 75 },
  { 국가: '필리핀', 용량: 250, 가동률: 70 },
  { 국가: '인도네시아', 용량: 200, 가동률: 65 },
  { 국가: '베트남', 용량: 150, 가동률: 60 },
  { 국가: 'PNG', 용량: 70, 가동률: 85 },
];
// 용량 단위: 천 MT/년

// ─── 커스텀 툴팁 ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div style={{
      background: 'rgba(0,15,30,0.95)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: '0.82rem',
    }}>
      <p style={{ color: '#f8fafc', fontWeight: 700, margin: '0 0 6px 0' }}>
        {d.국가}
      </p>
      <p style={{ color: '#94a3b8', margin: '3px 0' }}>
        가공 용량:{' '}
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>
          {d.용량.toLocaleString()} 천MT/년
        </span>
      </p>
      <p style={{ color: '#94a3b8', margin: '3px 0' }}>
        가동률:{' '}
        <span style={{ color: '#f59e0b', fontWeight: 600 }}>
          {d.가동률}%
        </span>
      </p>
    </div>
  );
};

// ─── 위젯 본체 ──────────────────────────────────────────────────────────────

export default function FfaGlobalProcessingCapacity() {
  return (
    <WidgetCard
      title="글로벌 가공 캐파 모니터"
      icon={Factory}
      iconColor="#f59e0b"
      pillar="S2"
      cardDesc="국가별 참치 통조림 가공 용량 및 가동률 비교"
      telemetry={{ status: 'STATIC', syncDate: '2024 FFA/업계 추정' }}
      termTooltip={{
        term: '가공 캐파',
        description: '참치 통조림 연간 가공 용량(MT/년). 태국이 글로벌 60-65% 점유로 압도적 1위.',
      }}
      kpiPanel={[
        { label: '총 글로벌 용량', value: '2,220K MT/년', sub: '상위 6개국 합계' },
        { label: '태국 점유율', value: '54%', sub: '1,200K MT/년' },
        { label: '베트남 성장', value: '급성장', sub: '150K MT, 확장 중', trendColor: '#10b981' },
      ]}
      chartHeight={300}
      chart={
        <BarChart
          data={processingData}
          layout="vertical"
          margin={{ top: 10, right: 40, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
          <YAxis
            dataKey="국가"
            type="category"
            width={70}
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
            tickFormatter={(v) => truncateKoreanLabel(v, 7)}
          />
          <XAxis
            type="number"
            unit=" 천MT"
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Legend
            wrapperStyle={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}
            formatter={(value: string) => (
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>
            )}
          />
          <Bar dataKey="용량" name="가공 용량 (천MT/년)" barSize={22} radius={[0, 4, 4, 0]}>
            {processingData.map((entry, idx) => (
              <Cell
                key={`cap-${idx}`}
                fill={entry.국가 === '태국' ? '#22d3ee' : '#3b82f6'}
                fillOpacity={entry.국가 === '태국' ? 0.95 : 0.75}
              />
            ))}
            <LabelList
              dataKey="용량"
              position="right"
              style={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600 }}
              formatter={(v: number) => `${v.toLocaleString()}`}
            />
          </Bar>
        </BarChart>
      }
      takeaway={{
        situation: '태국이 글로벌 참치 통조림 가공의 54%(1,200K MT/년)를 점유하여 단일 국가 의존도 극단적. 가동률 80%로 여유 용량 제한적. 베트남(150K)이 급성장 중이나 태국 대비 1/8 수준.',
        actionPlan: '태국 단일 의존 리스크 분산 필수. 베트남·인도네시아 대안 공급처 개발, PNG 현지 가공 인프라 투자 검토 필요. 태국 내 정치적 리스크(노동법, 환경규제) 모니터링.',
        source: 'FFA 2024, 업계 추정치',
      }}
    />
  );
}
