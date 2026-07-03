'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';

/* ── 영국 가공참치(HS1604) 수입 공급국 점유·관세 비대칭 (2024) ──
   share = 금액(value) 기준 점유율. 102K톤은 별도 물량(volume) 기준 총수입.
   출처: HMRC UK Trade Info 재가공(IndexBox UK Preserved/Canned Tuna 2024)·영국 trade-tariff.
   에콰도르 31%(금액 기준)·모리셔스14%·세이셸12%, 태국 등 비특혜국 UK Global Tariff 20%(확정),
   EPA 무관세 쿼터 10,000t(2024 증액). 에콰도르 $168M÷31%≈전체 $542M(금액 기준 정합).
   Korea-UK FTA 0%는 각주만(SasUkMarket과 경계). */
const SUPPLIERS = [
  { sup: '에콰도르', share: 31, tariff: '0% (DCTS)', color: '#10b981' },
  { sup: '모리셔스', share: 14, tariff: '0% (EPA)', color: '#34d399' },
  { sup: '세이셸', share: 12, tariff: '0% (EPA)', color: '#6ee7b7' },
  { sup: '태국·기타', share: 43, tariff: '태국 20% (MFN)', color: '#ef4444' },
];

export default function SasUkSupplierTariff() {
  return (
    <WidgetCard
      id="W-SAS35"
      title="영국 참치 수입 공급국 & 관세 비대칭"
      description="무관세 특혜국 장악 vs 태국 MFN 20% 핸디캡 (HS1604, 2024)"
      pillar="S3"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      cardDesc="영국 가공참치 수입 공급국별 점유율(금액 기준)·적용 관세 — HMRC UK Trade Info 재가공(IndexBox 2024) + 영국 공식 trade-tariff"
      takeaway={{
        situation: "영국 가공참치(HS1604) 수입은 무관세 특혜국이 장악합니다. 2024년 에콰도르가 금액 기준 31%($168M, DCTS 특혜 0%)로 1위, UK-ESA EPA로 무관세인 세이셸·모리셔스가 합산 26%를 점유합니다(EPA 캔 무관세 쿼터는 2024년 10,000t으로 증액). 반면 글로벌 캔참치 1위 수출국 태국은 영국과 FTA가 없어 UK Global Tariff 20% 확정세율을 부담합니다. 영국 캔참치 수입 총규모는 물량 약 102K톤, 금액 약 $542M(에콰도르 $168M÷금액점유 31% 환산, +16% YoY)입니다. 즉 '저원가 가공 태국 vs 무관세 특혜국'의 관세 비대칭이 공급국 순위를 결정합니다.",
        actionPlan: "한국산 완제품의 영국 진입은 '태국 대체 + 품질 차별화'입니다. ① 한국은 FTA로 완제품 0%라 태국의 20%p 관세차를 정량 무기로 쓸 수 있으나, 무관세 동급인 에콰도르·EPA 특혜국과는 관세 차별화가 불가능하므로 MSC·스시그레이드·트레이서빌리티로 포지셔닝하십시오. ② 영국 CPTPP 발효(2024.12)로 베트남산 관세 인하 일정을 모니터링해 5년 내 공급국 재편 리스크를 선반영하고, EPA 데로게이션 쿼터 소진 동향을 한국산 진입 창구로 활용하십시오.",
        source: "공급국 점유(금액 기준)·수입규모: HMRC UK Trade Info 원천 → IndexBox UK Preserved/Canned Tuna 2024 재가공 / trade-tariff.service.gov.uk(MFN 20%) / UK-ESA EPA Decision 1/2024(무관세 쿼터 10,000t). ※한국 FTA 0%는 SasUkMarket 참조",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ height: '215px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={SUPPLIERS} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="sup" fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" interval={0} />
                <YAxis domain={[0, 40]} tickFormatter={(v: unknown) => `${v}%`} fontSize={11} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', background: '#1a2442', color: '#e2e8f0' }}
                  formatter={(v: unknown, _n: unknown, p: any) => [`${v}% · 관세 ${p.payload.tariff}`, '수입 점유']}
                />
                <Bar dataKey="share" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {SUPPLIERS.map((d) => <Cell key={d.sup} fill={d.color} />)}
                  <LabelList dataKey="share" position="top" formatter={(v: unknown) => `${v}%`} fontSize={11} fill="#e2e8f0" />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', fontSize: '0.64rem', color: '#94a3b8', flexWrap: 'wrap' }}>
            <span><span style={{ color: '#10b981' }}>●</span> 무관세 특혜국(DCTS·EPA) 57%</span>
            <span><span style={{ color: '#ef4444' }}>●</span> 태국 MFN 20% 핸디캡</span>
            <span style={{ color: '#64748b' }}>캔수입 물량 102K톤 · +16% YoY</span>
          </div>
        </div>
      }
    />
  );
}
