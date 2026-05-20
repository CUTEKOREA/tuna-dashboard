/**
 * Upcycling 2개 위젯 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 159줄 → After 100줄 (-37%)
 */

'use client';
import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Recycle, TestTube } from 'lucide-react';
import WidgetCard from './WidgetCard';

const BYPRODUCT_DATA = [
  { name: '머리/뼈', value: 35, color: '#06b6d4' },
  { name: '내장', value: 20, color: '#f59e0b' },
  { name: '피/혈합육', value: 15, color: '#ef4444' },
  { name: '껍질', value: 10, color: '#a78bfa' },
  { name: '기타(지느러미 등)', value: 20, color: '#22c55e' },
];

const UPCYCLE_PRODUCTS = [
  { product: 'DHA/EPA 오메가3', rawMaterial: '내장유', marketSize: 48.2, margin: 65, status: '상용화' },
  { product: '해양 콜라겐 펩타이드', rawMaterial: '피부/비늘', marketSize: 12.8, margin: 72, status: '상용화' },
  { product: '참치 뼈 칼슘제', rawMaterial: '뼈/골분', marketSize: 5.4, margin: 45, status: '성장' },
  { product: '참치 단백질 가수분해물', rawMaterial: '혈합육', marketSize: 3.2, margin: 58, status: 'R&D' },
  { product: '바이오 비료/사료', rawMaterial: '잔사', marketSize: 8.7, margin: 25, status: '상용화' },
  { product: '기능성 펩타이드 (항산화)', rawMaterial: '내장', marketSize: 2.1, margin: 80, status: 'R&D' },
];

export function TunaUpcyclingOpportunity() {
  return (
    <WidgetCard
      title="참치 부산물 업사이클링 기회 분석"
      icon={Recycle}
      iconColor="#22c55e"
      pillar="S5"
      cardDesc="참치 가공 부산물 구성비(머리·내장·혈합육·껍질·기타) + 6대 업사이클 제품 파이프라인 (상용화·성장·R&D)"
      unit="(단위: % / USD Billion)"
      telemetry={{ status: 'STATIC', syncDate: '2025-11 기준' }}
      customBody={
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>
          <div style={{ height: 280 }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4, textAlign: 'center' }}>부산물 구성비 (가공 후)</div>
            <PieChart width={350} height={260}>
              <Pie data={BYPRODUCT_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
                labelLine={{ stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1 }}
                isAnimationActive={false}
              >
                {BYPRODUCT_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.75rem' }} />
            </PieChart>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 2 }}>업사이클 제품 파이프라인</div>
            {UPCYCLE_PRODUCTS.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.78rem' }}>
                <span style={{ color: '#f8fafc', fontWeight: 600, flex: 1 }}>{p.product}</span>
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600, background: p.status === '상용화' ? 'rgba(34,197,94,0.15)' : p.status === '성장' ? 'rgba(245,158,11,0.15)' : 'rgba(168,85,247,0.15)', color: p.status === '상용화' ? '#22c55e' : p.status === '성장' ? '#f59e0b' : '#a855f7' }}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      }
      takeaway={{
        situation: '참치 가공 시 총 중량의 40~55%가 머리(35%)·내장(20%)·혈합육(15%)·껍질(10%) 등 부산물. 한국 다랑어 어획량 290천톤(MOF 2024) 기준 부산물 116~160천톤 발생. 글로벌 EPA/DHA·해양 콜라겐 시장 모두 두 자릿수 CAGR 성장(시장 규모는 보고서별 편차, Grand View Research 2025 재확인 대상). 기존 폐기 비용 톤당 $50~80을 고부가 매출로 전환할 수 있는 기회.',
        actionPlan: 'Phase 1 (즉시): DHA/EPA 추출(마진 65%) + 해양 콜라겐 펩타이드(마진 72%) 라인 증설로 연 ₩50억+ 추가 매출. Phase 2 (3년): KFAS/NIFS 공동 R&D로 ACE 억제 기능성 펩타이드(마진 80%) 상용화. 부산물 10% 고부가 전환 시 연매출 $50M+.',
        source: '(기본 2025-11) 수산물 업사이클링 생태계 조성 방안 연구 · MOF 2024 어업생산통계 (시장 규모는 추정·재확인 대상)',
      }}
    />
  );
}

export function TunaUpcyclingMarginMap() {
  const marginData = UPCYCLE_PRODUCTS.map((p) => ({
    name: p.product.length > 6 ? p.product.substring(0, 6) + '…' : p.product,
    fullName: p.product, margin: p.margin, market: p.marketSize, status: p.status,
  }));

  return (
    <WidgetCard
      title="바이오 업사이클 마진 매트릭스"
      icon={TestTube}
      iconColor="#a78bfa"
      pillar="S5"
      cardDesc="6대 업사이클 제품의 마진율(%) vs 시장규모($B) 매트릭스 — 마진과 시장 규모의 역상관 패턴 시각화"
      unit="(단위: 마진율 % / 시장규모 $B)"
      telemetry={{ status: 'STATIC', syncDate: '2025-11 기준' }}
      chartHeight={280}
      chart={
        <BarChart data={marginData} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 500 }} stroke="#64748b" height={55} />
          <YAxis tick={{ fill: '#cbd5e1', fontSize: 10 }} stroke="#64748b" />
          <Tooltip
            contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
            itemStyle={{ color: '#e2e8f0', fontWeight: 500, fontSize: '13px' }}
            labelStyle={{ color: '#cbd5e1', fontWeight: 'bold', marginBottom: '8px' }}
            formatter={(value: any, name: any) => [typeof value === 'number' ? value.toFixed(1) : value, String(name)]}
            labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.fullName || String(label)}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="margin" fill="#a78bfa" name="마진율(%)" radius={[4, 4, 0, 0]} fillOpacity={0.85} isAnimationActive={false} />
          <Bar dataKey="market" fill="#06b6d4" name="시장규모($B)" radius={[4, 4, 0, 0]} fillOpacity={0.85} isAnimationActive={false} />
        </BarChart>
      }
      takeaway={{
        situation: '기능성 펩타이드(마진 80%)가 DHA(65%)·콜라겐(72%) 상회하나 현재 R&D 단계. 시장 규모는 DHA > 콜라겐 > 바이오사료 순(보고서별 편차)이며 마진율과 시장 규모는 역상관 경향. 상용화 완료 제품 중 콜라겐 펩타이드(마진 72%)가 투자 효율 최적.',
        actionPlan: '① 즉시 수익: 해양 콜라겐 펩타이드 라인 증설(마진 72%, 상용화). ② 중기 성장: 칼슘제 양산화(마진 45%, 성장기 — 원료 자급 우위). ③ 장기 고수익: KFAS/NIFS 공동 R&D로 기능성 펩타이드(ACE 억제 활성 82%) 3년 파이프라인. 바이오사료(마진 25%)는 대량 부산물 처리용 투트랙.',
        source: '(기본 2025-11) 업사이클링 생태계 연구 · KFAS 바이오 가치사슬 분석 (시장 규모는 Grand View Research 2025 등 재확인 대상)',
      }}
    />
  );
}
