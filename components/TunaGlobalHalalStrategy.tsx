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
      telemetry={{ status: data && data.length > 0 ? 'SYNCED' : 'STATIC', syncDate: '2026-05' }}
      chartHeight={280}
      chart={
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="size" nameKey="market" label={({ name, value }: any) => `${name}: $${value.toFixed(2)}B`}>
            {data.map((entry: any, i: number) => <Cell key={i} fill={entry.fill} />)}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.9)', borderColor: '#334155', color: 'var(--w-slate-50)' }} itemStyle={{ color: 'var(--w-slate-50)' }} />
          <Legend />
        </PieChart>
      }
      takeaway={{
        situation: `<div>
<p>한국 참치액 시장은 약 <strong>700~1,000억원</strong>(출처별 편차)으로 내수 포화 진입. 반면 글로벌 시장:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>글로벌 피시소스 시장 $4.5B</strong> (한국 시장의 50~70배)</li>
<li><strong>할랄 식품 시장 $1.2B</strong> (이슬람 인구 19억의 식품 구매력)</li>
</ul>
<p>핵심 차별화 기회: 글로벌 피시소스(태국 nampla·베트남 nuoc mam)는 구시대 발효 공정으로 <strong>비린내·짠맛 한계</strong>. 참치액은 훈연 공정으로 비린내 완화한 프리미엄 K-피시소스 — <strong>품질 차별화 잠재 우위(업계추정)</strong>.</p>
<p>의미: 인도네시아(인구 2.7억) + 말레이시아(3,200만) + 사우디(3,400만) + UAE(990만) 무슬림 시장 진입 시 한국 시장 대비 복수 배 매출 잠재(illustrative). 할랄 인증 취득이 진입 전제 조건.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 글로벌 할랄 피시소스 시장은 한국 참치액의 <strong>"가장 큰 미회수 글로벌 매출 옵션"</strong>. 한국 키코만이 1970년 미국 진입한 모델 차용.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>JAKIM(말레이시아) / MUI(인도네시아) 할랄 인증 최우선 획득</strong>: 인증 비용 $200~500K(업계추정), 초기 회수 기간 12~24개월 예상.</li>
<li style="margin-bottom: 8px;"><strong>현지 피시소스 1위 브랜드와 B2B 원료 납품 계약</strong>: ABC Indonesia·Cap Kapal Bola(말레이시아)에 원액 OEM 공급. 자체 마케팅 비용 최소화로 초기 시장 진입.</li>
<li><strong>"K-Halal Premium" 자체 브랜드</strong>: 5년 후 자체 브랜드 출시 — K-팝·K-드라마 연계 홍보. 글로벌 할랄 무역 허브(두바이 DMCC)에 물류센터 구축. 5년 매출 $50~100M(illustrative 시나리오).</li>
</ol>
</div>`,
        source: 'UNIDO 동남아 수산 가공 현대화 보고서 · KOTRA 글로벌 할랄 푸드 시장 트렌드 (수치 일부 자체추정)',
      }}
    />
  );
}
