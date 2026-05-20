/**
 * K-피시소스 글로벌 할랄 포텐셜 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 71줄 → After 50줄 (-29%)
 */

'use client';
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Globe2 } from 'lucide-react';
import WidgetCard from './WidgetCard';

export default function TunaGlobalHalalStrategy() {
  const [data, setData] = useState<any[] | null>(null);

  useEffect(() => {
    fetch('/api/tuna-extract')
      .then((r) => r.json())
      .then((j) => setData(j.d_n2_global_fishsauce))
      .catch(() => setData([]));
  }, []);

  if (!data) return null;

  return (
    <WidgetCard
      title="N2. K-피시소스 글로벌 할랄 침투 포텐셜"
      icon={Globe2}
      iconColor="#3b82f6"
      pillar="S4"
      cardDesc="글로벌 피시소스 시장($4.5B)·할랄 시장($1.2B) vs 한국 참치액(700~1,000억원) 규모 비교"
      unit="(단위: 십억 달러)"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05 (UNIDO + KOTRA)' }}
      chartHeight={280}
      chart={
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="size" nameKey="market" label={({ name, value }: any) => `${name}: $${value.toFixed(2)}B`}>
            {data.map((entry: any, i: number) => <Cell key={i} fill={entry.fill} />)}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc' }} itemStyle={{ color: '#f8fafc' }} />
          <Legend />
        </PieChart>
      }
      takeaway={{
        situation: '한국 참치액 시장(약 700~1,000억원 — 출처별 편차, 식약처·aT FIS 단일화 대기)은 내수 포화 진입 중이나, 글로벌 피시소스 시장($4.5B)과 할랄 시장($1.2B)은 여전히 구시대 발효 공정과 비린내 한계를 겪고 있음. 참치액은 훈연 공정으로 비린내 완화한 프리미엄 K-피시소스로서 품질 차별화 우위.',
        actionPlan: '1) 인도네시아·말레이시아 타겟팅을 위해 JAKIM(말레이시아 할랄) 또는 MUI(인도네시아 할랄) 인증 획득을 최우선 추진. 2) 현지 피시소스 1위 브랜드들과 B2B 원료(베이스 액) 납품 계약을 체결해 마케팅 비용 없이 시장 파이 확보.',
        source: 'UNIDO 동남아 피시소스 공정 현대화 보고서 · KOTRA 글로벌 할랄 푸드 시장 트렌드',
      }}
    />
  );
}
