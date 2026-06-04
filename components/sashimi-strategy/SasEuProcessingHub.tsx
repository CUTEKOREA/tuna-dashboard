'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── EU 참치 가공 허브: 스페인 (Pillar 2 가공·생산) ──
   검증(solid): 스페인 EU 캔참치 생산 ~70%·세계 2위(태국 다음, FAO GLOBEFISH·Eurofish),
   스페인 참치산업 매출 ~€1.1B·직간접 고용 62,000명(97% 갈리시아·바스크).
   1차 출처: FAO·INTERATUN(산업협회 집계치) — SeafoodSource·ANFACO·Eurofish는 이를 인용한 2차 매체. 업계 표준 인용치(2025 ANFACO 컨퍼런스·USDA FAS Spain Seafood 2025 동일 수치).
   ※자급률·로인 ATQ는 타 위젯에 위임(중복 회피). */
const KPI = [
  { label: 'EU 캔참치 생산 비중', value: '약 70%', sub: '세계 2위 가공국(태국 다음)', color: '#f59e0b' },
  { label: '스페인 참치산업 매출', value: '€1.1B', sub: '갈리시아·바스크 클러스터', color: '#38bdf8' },
  { label: '직간접 고용', value: '62,000명', sub: '97% 갈리시아·바스크 집중', color: '#10b981' },
];

export default function SasEuProcessingHub() {
  return (
    <WidgetCard
      id="W-SAS43"
      title="EU 참치 가공 허브 — 스페인"
      description="EU 캔참치 생산 70%를 쥔 갈리시아 가공 클러스터"
      pillar="S2"
      telemetry={{ status: 'STATIC', syncDate: '2025' }}
      cardDesc="스페인 EU 캔참치 가공 점유·산업 규모·고용 — FAO·INTERATUN 산업협회 집계(매출·고용은 업계 추정치, ANFACO·Eurofish 재인용)"
      takeaway={{
        situation: "EU 참치 밸류체인의 가공 단계는 스페인이 사실상 독점합니다. 스페인은 EU 캔참치 생산의 약 70%를 차지하는 세계 2위 가공국(태국 다음)으로, 참치산업 매출 약 €1.1B, 직간접 고용 62,000명이 97% 갈리시아·바스크 클러스터에 집중돼 있습니다. 이 가공 허브는 냉동 로인을 수입해 EU 시장용 캔으로 재가공하는 구조라, 원료(로인) 조달 관세·쿼터와 직결됩니다. 기존 EU 위젯(축양·쿼터=원물, 소비·단가=수요)이 비워둔 '가공·생산' 기둥을 처음 메웁니다.",
        actionPlan: "스페인 가공 클러스터는 한국에게 두 갈래 기회입니다. ① 원료 공급자 관점 — 갈리시아 캔공장의 냉동 로인 수요에 한국 원양 가다랑어/황다랑어를 공급하되, 무관세 ATQ·EPA 경쟁(중국·PNG)을 감안해 단가가 아닌 추적성·MSC 인증으로 차별화하십시오. ② M&A 관점 — EU 캔 채널 진입이 목적이면 브랜드 신설보다 스페인 중소 가공사(Calvo·Jealsa 외 2차 벤더) 지분 인수가 70% 생산 인프라·EU 시장 접근을 동시에 확보하는 지렛대입니다.",
        source: "1차: FAO·INTERATUN 산업협회 집계 — 스페인 EU 캔 생산 ~70%·세계 2위(FAO GLOBEFISH), 매출 ~€1.1B·고용 62,000명(FAO·INTERATUN, 업계 추정). 2차 재인용: SeafoodSource·Eurofish·ANFACO·WeAreAquaculture. ※2025 USDA FAS·ANFACO 컨퍼런스에 동일 수치 지속 인용.",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {KPI.map((k) => (
              <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: `${k.color}0d`, border: `1px solid ${k.color}2e`, borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.66rem', color: '#94a3b8', marginBottom: '2px' }}>{k.label}</div>
                  <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{k.sub}</div>
                </div>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: k.color }}>{k.value}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.62rem', color: '#64748b', lineHeight: 1.5, textAlign: 'center' }}>
            냉동 로인 수입 → EU용 캔 재가공 모델 — 원료 관세·쿼터(ATQ)와 직결
          </div>
        </div>
      }
    />
  );
}
