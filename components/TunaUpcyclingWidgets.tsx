"use client";
import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { Recycle, TestTube } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TakeawayBox from './TakeawayBox';
import styles from './TunaInsightsDashboard.module.css';

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
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Recycle size={20} style={{ color: '#22c55e' }} />
          [제로 웨이스트] 참치 부산물 업사이클링 기회 분석
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>(단위: % / USD Billion)</span>
        </h3>
        <p className={styles.cardDesc}>
          참치 가공 시 발생하는 40~55% 부산물(머리/뼈/내장/피부 등)의 구성비와, 각 부산물을 활용한 고부가가치 제품(DHA, 콜라겐 등) 파이프라인의 시장 규모와 마진율을 시각화합니다.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: 4, textAlign: 'center' }}>부산물 구성비 (가공 후)</div>
          <SafeResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={BYPRODUCT_DATA} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                {BYPRODUCT_DATA.map((d, i) => (<Cell key={i} fill={d.color} />))}
              </Pie>
              <RechartsTooltip contentStyle={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.75rem' }} />
            </PieChart>
          </SafeResponsiveContainer>
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>업사이클 제품 파이프라인</div>
          {UPCYCLE_PRODUCTS.map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.7fr auto auto', gap: 8, padding: '6px 10px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.73rem' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.product}</span>
              <span style={{ color: 'var(--text-tertiary)' }}>${p.marketSize}B</span>
              <span style={{ color: '#22c55e', fontWeight: 700 }}>{p.margin}%</span>
              <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600, background: p.status === '상용화' ? 'rgba(34,197,94,0.15)' : p.status === '성장' ? 'rgba(245,158,11,0.15)' : 'rgba(168,85,247,0.15)', color: p.status === '상용화' ? '#22c55e' : p.status === '성장' ? '#f59e0b' : '#a855f7' }}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>
      <TakeawayBox situation="참치 가공 시 40~55%가 부산물. 글로벌 해양 콜라겐($12.8B) + DHA($48.2B) 시장 급성장." actionPlan="Phase 1: DHA/콜라겐 상용화 라인 증설 → Phase 2: 기능성 펩타이드 R&D 파트너십(KFAS 연계)." source="(기본 2025-11) 수산물 업사이클링 생태계 조성 방안 연구 - 이남수" />
    </div>
  );
}

export function TunaUpcyclingMarginMap() {
  const marginData = UPCYCLE_PRODUCTS.map(p => ({ name: p.product.split(' ')[0], margin: p.margin, market: p.marketSize }));
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <TestTube size={20} style={{ color: '#a78bfa' }} />
          [마진 분석] 바이오 업사이클 마진 매트릭스
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>(단위: 마진율 % / 시장규모 $B)</span>
        </h3>
        <p className={styles.cardDesc}>
          참치 부산물 활용 제품별 마진율과 글로벌 시장 규모를 비교하여 최적의 투자 우선순위를 식별합니다. R&D 단계일수록 높은 마진이 기대됩니다.
        </p>
      </div>
      <SafeResponsiveContainer width="100%" height={200}>
        <BarChart data={marginData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 9 }} />
          <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} />
          <RechartsTooltip contentStyle={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.75rem' }} />
          <Bar dataKey="margin" fill="#a78bfa" name="마진율(%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="market" fill="#06b6d4" name="시장규모($B)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </SafeResponsiveContainer>
      <TakeawayBox situation="기능성 펩타이드(80%) > 콜라겐(72%) > DHA(65%) 순 마진율. R&D 단계가 고마진." actionPlan="KFAS/NIFS 공동연구 + 바이오벤처 투자로 R&D→상용화 파이프라인 3년 내 구축." source="(기본 2025-11) 업사이클링 연구 + KFAS 바이오 가치사슬 분석" />
    </div>
  );
}
