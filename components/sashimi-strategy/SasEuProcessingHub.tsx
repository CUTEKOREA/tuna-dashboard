'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── EU 참치 가공 허브: 스페인 (Pillar 2 가공·생산) ──
   검증(solid): 스페인 캔참치가 EU 통조림 생산의 65%+ 차지(ANFACO-CECOPESCA Balance 2024), 태국 다음 세계 2위급 가공국.
   가공클러스터(전 어종) 매출 €14.289B·252개사(2023말 기준), 협회사가 스페인 가공업 매출의 71.1%·고용의 72.4%를 차지.
   1차 출처: ANFACO-CECOPESCA 'Presentación datos sector 2024 / Balance 2024'(2025-03 발행).
   ※참치 단독 매출·고용 정량치는 1차출처 부재 — 과거 INTERATUN 인용 '€1.1B·62,000명'은 원문에 수치 없음(정성 'miles de empleos'만)·약 2010-11년 역사자료라 T-3y 미달로 제거. 헷지 유지.
   ※자급률·로인 ATQ는 타 위젯에 위임(중복 회피). */
const KPI = [
  { label: 'EU 캔참치 생산 비중', value: '65%+', sub: '태국 다음 세계 2위급 가공국', color: '#f59e0b' },
  { label: '가공클러스터 매출', value: '€14.3B', sub: '전 어종·252개사(2023말 기준)', color: '#38bdf8' },
  { label: '협회사 가공업 비중', value: '71.1% / 72.4%', sub: '스페인 가공 매출 / 고용 점유', color: '#10b981' },
];

export default function SasEuProcessingHub() {
  return (
    <WidgetCard
      id="W-SAS43"
      title="EU 참치 가공 허브 - 스페인"
      description="EU 캔참치 생산 65%+를 쥔 갈리시아 가공 클러스터"
      pillar="S2"
      telemetry={{ status: 'STATIC', syncDate: '2025-03-26' }}
      cardDesc="스페인 EU 캔참치 가공 점유·가공클러스터 규모 - ANFACO-CECOPESCA Balance 2024 협회 집계(참치 단독 매출·고용은 1차출처 부재로 헷지)"
      takeaway={{
        situation: "EU 참치 밸류체인의 가공 단계는 스페인이 사실상 독점합니다. 스페인 캔참치는 EU 통조림 생산의 65%+를 차지하는 태국 다음 세계 2위급 가공국으로, ANFACO-CECOPESCA 가공클러스터(전 어종 기준)는 매출 €14.289B·252개사(2023말)에 달하고 협회사가 스페인 가공업 매출의 71.1%·고용의 72.4%를 점유합니다. 클러스터는 97% 갈리시아·바스크에 집중돼 있습니다. (참치 단독 매출·고용 정량치는 1차출처가 부재해 별도 명시하지 않습니다.) 이 가공 허브는 냉동 로인을 수입해 EU 시장용 캔으로 재가공하는 구조라, 원료(로인) 조달 관세·쿼터와 직결됩니다. 기존 EU 위젯(축양·쿼터=원물, 소비·단가=수요)이 비워둔 '가공·생산' 기둥을 처음 메웁니다.",
        actionPlan: "스페인 가공 클러스터는 한국에게 두 갈래 기회입니다. ① 원료 공급자 관점 - 갈리시아 캔공장의 냉동 로인 수요에 한국 원양 가다랑어/황다랑어를 공급하되, 무관세 ATQ·EPA 경쟁(중국·PNG)을 감안해 단가가 아닌 추적성·MSC 인증으로 차별화하십시오. ② M&A 관점 - EU 캔 채널 진입이 목적이면 브랜드 신설보다 스페인 중소 가공사(Calvo·Jealsa 외 2차 벤더) 지분 인수가 EU 통조림의 65%+를 쥔 생산 인프라·EU 시장 접근을 동시에 확보하는 지렛대입니다.",
        source: "1차: ANFACO-CECOPESCA 'Presentación datos sector 2024 / Balance 2024'(2025-03-26 발행) - 스페인 캔참치가 EU 통조림 생산의 65%+, 가공클러스터(전 어종) 매출 €14.289B·252개사(2023말), 협회사가 스페인 가공업 매출의 71.1%·고용의 72.4% 차지. ※참치 단독 매출·고용 정량치는 1차출처 부재(과거 INTERATUN 인용 '€1.1B·62,000명'은 원문에 수치 없음·약 2010-11년 역사자료라 제거). 2차 보조: SeafoodSource·Eurofish·USDA FAS Spain Seafood.",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {KPI.map((k) => (
              <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: `${k.color}0d`, border: `1px solid ${k.color}2e`, borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.66rem', color: 'var(--w-slate-400)', marginBottom: '2px' }}>{k.label}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--w-slate-500)' }}>{k.sub}</div>
                </div>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: k.color }}>{k.value}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--w-slate-500)', lineHeight: 1.5, textAlign: 'center' }}>
            냉동 로인 수입 → EU용 캔 재가공 모델 - 원료 관세·쿼터(ATQ)와 직결
          </div>
        </div>
      }
    />
  );
}
