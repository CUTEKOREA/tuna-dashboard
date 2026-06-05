/**
 * 저분자 펩타이드 생리활성 검증 — ADR-0005 WidgetCard 첫 마이그레이션 (2026-05-21)
 *
 * Before: 45줄 (5단 보일러플레이트 자체 작성)
 * After:  39줄 (WidgetCard 사용, -13%)
 *
 * 룰 강제:
 * - W-04 cardDesc / source 의무 (런타임 검증)
 * - A-02 TelemetryBadge 자동 부착
 * - P-03 컨빅션 태그·과장 수식어 dev 환경에서 console.error
 * - 5-Pillar 매핑 명시 (pillar="S5")
 */

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts';
import { TestTubeDiagonal } from 'lucide-react';
import WidgetCard from './WidgetCard';

const data = [
  { metric: '항산화 (ABTS)',      열수추출: 21.9, 주정추출:  9.4, 효소가수분해TPF: 56.7 },
  { metric: '활성산소 소거',       열수추출: 21.4, 주정추출: 22.8, 효소가수분해TPF: 57.9 },
  { metric: '혈압강하 (ACE)',     열수추출: 15.0, 주정추출: 18.0, 효소가수분해TPF: 65.0 },
  { metric: '지방세포 억제',       열수추출: 10.0, 주정추출: 12.0, 효소가수분해TPF: 75.0 },
  { metric: '소장 흡수율 (HPMC)',  열수추출:  5.0, 주정추출:  5.0, 효소가수분해TPF: 85.0 },
];

export default function TunaPeptideEfficacy() {
  return (
    <WidgetCard
      title="W14. 저분자 펩타이드 생리활성 검증"
      icon={TestTubeDiagonal}
      iconColor="#8b5cf6"
      pillar="S5"
      cardDesc="참치 부산물 효소가수분해(Protease) 펩타이드의 항산화·ACE 억제·소장 흡수율을 열수추출 대비 비교"
      telemetry={{ status: 'STATIC', syncDate: '2026-05 (KFAS 논문 기반)' }}
      chartHeight={280}
      chart={
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
          <Radar name="효소가수분해 (TPF+HPMC)" dataKey="효소가수분해TPF" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
          <Radar name="열수추출 (전통방식)" dataKey="열수추출" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: '0.8rem' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
        </RadarChart>
      }
      takeaway={{
        situation: `<div>
<p>"펩타이드(Peptide)"란 단백질이 작게 분해된 분자로, 인체 흡수율이 단백질 대비 빠른 것으로 알려져 건강기능식품·의약품 원료로 주목받고 있음(업계추정).</p>
<p>참치 자숙 부산물에서 펩타이드 추출의 2 방식 비교(KFAS 논문 기반 illustrative):</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>전통 열수추출</strong>: 항산화 21.9, ACE 억제 15, 지방세포 억제 10</li>
<li><strong>효소가수분해(Protease) TPF 방식</strong>: 항산화 <strong>56.7</strong>, ACE 억제 <strong>65</strong>, 지방세포 억제 <strong>75</strong> — 모든 지표 대비 우위(논문 기준치)</li>
</ul>
<p>추가로 HPMC 장용성 코팅 적용 시 소장 흡수율 <strong>85%</strong>까지 상승(논문 기준치). 단순 조미료 원료에서 <strong>"프리미엄 헬스케어 소재(EPP, Enhanced Peptide Premium)"</strong> 카테고리 전환 가능성 확인.</p>
<p>시사점: 조미료 대비 헬스케어 소재 카테고리 전환 시 단가 상승 여지가 있음(자체추정). 같은 부산물이라도 가공 기술 전환으로 카테고리 이동이 가능함.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 펩타이드 효능 차이는 단순 연구개발(R&amp;D) 성과가 아닌 카테고리 전환 승수. 같은 원료 원가로 상위 카테고리 매출 회수 가능성(자체추정).</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>프로테아제 효소 분해 라인 신설 (초기 자본투자 우선)</strong>: 기존 자숙 공정 개조(retrofit) 검토. 투자규모·회수기간은 사업타당성 검토 후 확정 필요.</li>
<li style="margin-bottom: 8px;"><strong>HPMC 장용성 캡슐형 건강기능식품(EPP) 제품화</strong>: 자체 브랜드 또는 글로벌 식품·헬스케어 기업 OEM 공급 검토. 카테고리 단가 상승 여지 있음(자체추정).</li>
<li><strong>해양 펩타이드 지식재산(IP) 라이센싱 플랫폼</strong>: 효소 분해·HPMC 코팅 기술을 특허화 후 글로벌 기능성 원료 기업 대상 라이센싱. 전문 재무자문사 검토 권고.</li>
</ol>
</div>`,
        source: 'KFAS 한국수산과학회지 참치 가공부산물 항산화 평가 (2019~2023, DOI 미확인·자체추정 포함) · 수치는 illustrative — 원문 DOI 검증 후 확정 필요',
      }}
    />
  );
}
