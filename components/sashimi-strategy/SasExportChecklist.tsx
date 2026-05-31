'use client';

import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const requirements = [
  {
    category: '어획 추적',
    items: [
      { req: 'SIMP Chain-of-Custody 데이터', us: true, uk: false, jp: false, note: '참치 5종 전부 적용' },
      { req: 'IUU Catch Certificate', us: false, uk: true, jp: false, note: '어선·어획구역 추적' },
      { req: '-60℃ 콜드체인 문서', us: true, uk: true, jp: true, note: '초저온 거래 전제' },
    ],
  },
  {
    category: '인증',
    items: [
      { req: 'HACCP (히스타민 CCP)', us: true, uk: true, jp: true, note: '-60℃가 핵심 강점' },
      { req: 'BRC/SQF', us: true, uk: true, jp: false, note: '서구 바이어 필수' },
      { req: 'MSC CoC', us: false, uk: true, jp: false, note: '영국 Itsu 등 전제' },
      { req: 'EU 등록번호', us: false, uk: false, jp: false, note: 'EU 수출 시 필요' },
    ],
  },
  {
    category: '관세/규제',
    items: [
      { req: 'Korea-UK FTA (MFN 18%→0%)', us: false, uk: true, jp: false, note: '결정적 가격 우위' },
      { req: 'CO 처리 라벨링', us: true, uk: false, jp: false, note: 'FDA "tasteless smoke" 표기' },
      { req: '수은규제 면제 (마구로類)', us: false, uk: false, jp: true, note: '통관 장벽 아님' },
      { req: 'EHC (위생증명서)', us: false, uk: true, jp: false, note: '국립수산물품질관리원' },
    ],
  },
  {
    category: '영업 문서',
    items: [
      { req: '영문 제품 스펙시트 (saku 200g 등)', us: true, uk: true, jp: false, note: '규격·그레이딩 명시' },
      { req: '일문 제품 데이터시트', us: false, uk: false, jp: true, note: '어종·등급·이력' },
      { req: '원산지증명서', us: true, uk: true, jp: true, note: 'FTA 특혜 적용용' },
    ],
  },
];

export default function SasExportChecklist() {
  return (
    <WidgetCard
      id="W-SAS24"
      title="수출 진입요건 체크리스트 — 시장별 비교"
      icon={ClipboardCheck}
      iconColor="#22d3ee"
      pillar="S2"
      cardDesc="미국(SIMP)·영국(IUU/FTA)·일본(-60℃) — 시장별 필수 인증·규제·문서 매트릭스"
      telemetry={{ status: 'STATIC', syncDate: '2025' }}
      takeaway={{
        situation: "3대 수출 시장의 진입요건은 명확히 다릅니다. 미국은 SIMP(어획 추적) + FDA CO 라벨이 핵심이며, 영국은 IUU Catch Certificate + EHC(위생증명) + Korea-UK FTA 원산지증명이 필수입니다. 일본은 -60℃ 콜드체인과 히스타민 HACCP가 거래 전제이며, 수은규제는 마구로類에 면제됩니다.",
        actionPlan: "공통 준비물 우선순위: ① SIMP/IUU 겸용 어획 chain-of-custody 데이터 패키지, ② -60℃ 콜드체인·히스타민 CCP 문서, ③ BRC/SQF 인증(서구 시장 필수), ④ Korea-UK FTA 원산지증명(18% 관세 회피), ⑤ 영문/일문 제품 스펙시트. KOTRA·aT K-FOOD TRADE를 통한 무역사절단·매칭이 초기 컨택 확보에 효과적입니다.",
        source: "KR_Export_Partners_Dossier (NOAA SIMP·UK Trade Tariff·MHLW·Seafish)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          {requirements.map((cat) => (
            <div key={cat.category}>
              <div style={{
                fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px',
                padding: '4px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px',
                display: 'inline-block',
              }}>
                {cat.category}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {cat.items.map((item) => (
                  <div key={item.req} style={{
                    display: 'grid', gridTemplateColumns: '2.5fr 0.5fr 0.5fr 0.5fr 1.5fr',
                    alignItems: 'center', padding: '6px 10px', borderRadius: '6px',
                    background: 'rgba(255,255,255,0.015)',
                    fontSize: '0.68rem',
                  }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{item.req}</span>
                    <span style={{ textAlign: 'center' }}>{item.us ? '🇺🇸 ✓' : '—'}</span>
                    <span style={{ textAlign: 'center' }}>{item.uk ? '🇬🇧 ✓' : '—'}</span>
                    <span style={{ textAlign: 'center' }}>{item.jp ? '🇯🇵 ✓' : '—'}</span>
                    <span style={{ color: '#64748b', fontSize: '0.6rem' }}>{item.note}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* FTA Highlight */}
          <div style={{
            padding: '10px 14px', borderRadius: '8px',
            background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)',
            fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center',
          }}>
            💡 <strong style={{ color: '#38bdf8' }}>Korea-UK FTA</strong>: 냉동참치필렛(HS 0304.87) MFN 18% → <strong style={{ color: '#10b981' }}>0%</strong> = 동남아 대비 결정적 가격 우위
          </div>
        </div>
      }
    />
  );
}
