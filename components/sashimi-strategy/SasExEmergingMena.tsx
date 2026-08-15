'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── 중동 할랄 사시미 교두보: 신흥시장 (VASEP·Mordor Intelligence·농식품부·해수부) ──
   검증(solid): 중동 참치 수입 비중 이집트21%·사우디19%·이스라엘11%(출처 VASEP 단일), MEA 캔·가공 $3.20B→$4.45B(CAGR 6.81%, 2025→30, Mordor),
   한국 할랄식품 OIC 57개국 수출 $1.19B(+7.8%, 2024, 농식품부), 한국 참치 수출 총 $589M(+4.7%, 수출 2위, 해수부).
   정정(audit 2026-06-04): (1) 중동 수입비중·베트남 +28%의 KMI 귀속은 명의도용 — 실제 단일출처 VASEP로 교정.
   (2) 베트남 중동 +42%→실제 +28%(2024 ~$113M). (3) 일본$659M/미국$479M은 전체 수산식품(참치 아님)으로 제외. */
const STAT = [
  { label: '한국 참치 수출 총액', value: '$589M', sub: '+4.7% YoY · 수출 2위 품목 (해수부)', color: '#22d3ee' },
  { label: '중동·아프리카 캔·가공 수산물 시장', value: '$3.20B→$4.45B', sub: '연평균성장률 6.81% (2025→2030, Mordor)', color: '#10b981' },
  { label: '중동 참치 수입 상위국', value: '이집트 21%', sub: '사우디 19%·이스라엘 11% (VASEP)', color: '#38bdf8' },
  { label: '한국 할랄식품 수출(이슬람협력기구 57국)', value: '$1.19B', sub: '+7.8% 전년대비 (2024, 농식품부)', color: '#f59e0b' },
  { label: '베트남의 중동 참치 추격', value: '+28%', sub: '2024 약 $113M (포괄적경제동반자협정 가속)', color: '#ef4444' },
];

export default function SasExEmergingMena() {
  return (
    <WidgetCard
      id="W-SAS60"
      title="중동 할랄 사시미 교두보 — 신흥 수출시장"
      description="MEA 가공수산 6.8% 성장 · 베트남 추격 vs 한국 진입창"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      cardDesc="중동 참치 수입·중동아프리카 가공수산 성장·한국 할랄 수출·베트남 추격 — 출처: VASEP·Mordor Intelligence·농식품부·해수부 (2024 기준)"
      takeaway={{
        situation: "중동은 한국 참치 수출(총 $589M, +4.7%, 수출 2위 품목)의 다음 개척지입니다. 중동·아프리카(MEA) 캔·가공 수산물 시장은 $3.20B에서 $4.45B(2025→2030, CAGR 6.81%)로 성장하고, 참치 수입은 이집트 21%·사우디 19%·이스라엘 11%로 집중돼 있습니다. 한국 할랄식품의 이슬람협력기구(OIC) 57개국 수출은 $1.19B(+7.8%)로 성장 중이나, 베트남이 포괄적경제동반자협정(CEPA)을 무기로 중동 참치 수출을 +28%(2024 ~$113M) 늘리며 추격하고 있어 한국의 진입창이 좁아지고 있습니다.",
        actionPlan: "중동은 '베트남이 선점하기 전 할랄 인증으로 들어가는' 속도전입니다. ① 베트남 포괄적경제동반자협정(CEPA) 추격(+28%)에 대응해 한국도 걸프협력회의(GCC)·이집트 향 할랄 인증(한국이슬람교중앙회 KMF·말레이시아 JAKIM 상호인정) 참치 가공 라인을 선제 구축하고, ② 무슬림 인구의 사시미·스시 외식 성장(두바이·리야드 고급 외식)을 겨냥한 -60℃ 사시미급 직공급으로 캔 저마진 경쟁을 우회하십시오. ③ 한국 할랄식품 수출 +7.8% 모멘텀에 참치를 끼워 정부 할랄 수출 지원·물류를 레버리지하십시오.",
        source: "VASEP 베트남수산물수출가공협회(중동 참치 수입 이집트21%·사우디19%·이스라엘11%·베트남 중동 +28% 약 $113M) / Mordor Intelligence(중동·아프리카 캔·가공 $3.20B→$4.45B, 연평균성장률 6.81%) / 농식품부(한국 할랄식품 이슬람협력기구 OIC 57국 수출 $1.19B +7.8%, 2024) / 해수부(한국 참치 수출 총 $589M +4.7%, 수출 2위)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '9px' }}>
            {STAT.map((s) => (
              <div key={s.label} style={{ background: `${s.color}0f`, border: `1px solid ${s.color}2e`, borderRadius: '10px', padding: '11px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--w-slate-400)' }}>{s.label}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: '0.54rem', color: 'var(--w-slate-500)' }}>{s.sub}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--w-slate-500)', lineHeight: 1.5, textAlign: 'center' }}>
            할랄 인증 + -60℃ 사시미급 직공급 = 베트남(포괄적경제동반자협정) 추격 전 진입 창구
          </div>
        </div>
      }
    />
  );
}
