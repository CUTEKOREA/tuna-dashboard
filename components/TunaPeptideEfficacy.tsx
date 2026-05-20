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
        situation: '효소가수분해(Protease) 방식 저분자 펩타이드(TPF)가 5개 생리활성 지표 모두에서 전통 열수추출 대비 우위 — 항산화 56.7 vs 21.9, ACE 억제 65 vs 15, 지방세포 억제 75 vs 10. HPMC 장용성 코팅 적용 시 소장 흡수율 85%까지 상승하며 \'프리미엄 헬스케어 소재(EPP)\' 카테고리 전환 근거가 충분.',
        actionPlan: '1) 기존 자숙 공정에 프로테아제 효소 분해 라인 신설을 우선 CapEx 항목으로. 열수추출 대비 3~7배 높은 생리활성이 B2B 납품 단가 프리미엄으로 직결. 2) HPMC 장용성 캡슐형 건기식(EPP) 제품화로 카테고리 단가 $4.8/kg(조미료) → $12.5+/kg(헬스케어 소재) 업그레이드.',
        source: 'KFAS 한국수산과학회지 참치 가공부산물 항산화 평가 (2019~2023) · Silla Co. R&D — 구체적 DOI 매칭 필요',
      }}
    />
  );
}
