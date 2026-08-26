'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── EU 캔참치 국가별 시장·브랜드 과점 구도 (Round2 검증 정정 반영) ──
   검증(solid): 스페인 EU 캔참치 생산 ~70%(FAO GLOBEFISH·SeafoodSource).
   확정(Round2 Track C): 이탈리아 Rio Mare(Bolton Food)는 유럽 캔참치 1위·40개국 진출
     (Bolton Group FY2024 식품부문 매출 €2.4B, +9.5% / ESM Magazine 2025).
     이탈리아 캔참치 생산 77,400톤·가구침투율 96%(MSC 2024 Italy Tuna Market Analysis).
   헷지 유지: 정확한 점유율 % 1차출처 부재(Bolton 38%는 2016년 역사적 수치) → '1위'까지만 단정. */
const COUNTRIES = [
  { flag: '🇮🇹', name: '이탈리아', rc: '#10b981', role: '브랜드 프리미엄 시장',
    rows: [['선도 브랜드', 'Rio Mare (Bolton)'], ['위상', '유럽 캔참치 1위·40개국 진출 (점유율 % 미검증)'], ['진입장벽', '자국 챔피언 브랜드 충성도']] },
  { flag: '🇫🇷', name: '프랑스', rc: '#38bdf8', role: 'Thai Union 종속',
    rows: [['선도 브랜드', 'Petit Navire·John West'], ['소유', 'Thai Union(태국) 계열'], ['특징', '글로벌 가공사 수직지배']] },
  { flag: '🇪🇸', name: '스페인', rc: '#f59e0b', role: 'EU 최대 생산 거점',
    rows: [['EU 캔 생산 비중', '약 70%'], ['주요사', 'Calvo·Jealsa·Frinsa·Isabel'], ['강점', '갈리시아 가공 클러스터']] },
];

export default function SasEuBrandMap() {
  return (
    <WidgetCard
      id="W-SAS42"
      title="EU 캔참치 국가별 시장·브랜드 구도"
      description="이탈리아 브랜드·스페인 생산·프랑스 Thai Union 종속의 3분할"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2025-03' }}
      cardDesc="EU 3대 캔참치 소비국×챔피언 브랜드 경쟁 지형 - 스페인 생산 ~70%(FAO GLOBEFISH)·이탈리아 Rio Mare 유럽 1위(Bolton FY2024) 검증, 정확한 점유율 %는 1차출처 부재로 헷지"
      takeaway={{
        situation: "EU 캔참치는 3대 소비국이 시장을 분할하고 각국마다 단일 챔피언 브랜드가 두드러집니다. 이탈리아는 볼턴(Bolton)의 리오마레(Rio Mare)가 유럽 캔참치 1위 브랜드로 40개국에 진출(Bolton Group FY2024 식품부문 매출 €24억, +9.5%)했고 이탈리아 캔참치 가구침투율은 96%(MSC 2024)에 달합니다 - 다만 정확한 시장 점유율 %는 1차출처가 부재합니다. 프랑스는 타이유니온(Thai Union·태국 계열)의 프티나비르(Petit Navire)·존웨스트(John West)가 글로벌 가공사로 수직 지배하며, 스페인은 자국 가공거점(칼보·헤알사·프린사·이사벨)이 EU 캔참치 생산의 약 70%(FAO GLOBEFISH 검증)를 등에 업고 시장을 잡습니다. 기존 위젯(소매침투·신선vs통조림·수입단가)이 다루지 않은 '국가×브랜드 경쟁 지형'을 한 화면에 보여줍니다.",
        actionPlan: "EU 캔/가공 채널 진입 또는 M&A 타깃 스크리닝 시 '이탈리아=브랜드 프리미엄·스페인=생산능력·프랑스=Thai Union 종속'이라는 구조적 진입장벽을 인지하십시오. 신선·축양 고부가 라인은 이 캔 과점 구도와 직접 경쟁하지 않으므로, 남유럽 소매 진열대 협상 시 자국 챔피언 브랜드와 정면 충돌을 피하는 프리미엄·비(非)캔 사시미 포지셔닝이 유효합니다. 캔 진입이 목적이면 스페인 가공 거점 제휴(70% 생산 인프라 활용)가 브랜드 신설보다 현실적입니다.",
        source: "검증: FAO GLOBEFISH·SeafoodSource(스페인 EU 캔 생산 ~70%) / Rio Mare 유럽 캔참치 1위·40개국 진출·Bolton Group FY2024 식품부문 €24억(+9.5%) - ESM Magazine 2025(esmmagazine.com), 이탈리아 캔참치 생산 77,400톤·가구침투율 96% - Marine Stewardship Council 'Tuna Market Analysis 2024: Italy'(msc.org) / 정확한 시장 점유율 %는 1차출처 부재로 헷지(Bolton 이탈리아 38%는 2016년 역사적 수치) / 프랑스 Petit Navire·John West의 Thai Union 계열, 스페인 가공사 구성은 업계 일반 인식",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          {COUNTRIES.map((c) => (
            <div key={c.name} style={{ background: `${c.rc}0d`, border: `1px solid ${c.rc}2e`, borderLeft: `3px solid ${c.rc}`, borderRadius: '10px', padding: '11px 13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                <span style={{ fontSize: '1.05rem' }}>{c.flag}</span>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f1f5f9' }}>{c.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: c.rc, background: `${c.rc}1f`, padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>{c.role}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {c.rows.map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '0.56rem', color: 'var(--w-slate-500)' }}>{k}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--w-slate-200)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      }
    />
  );
}
