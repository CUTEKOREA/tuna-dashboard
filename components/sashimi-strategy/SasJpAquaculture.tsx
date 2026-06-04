'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

/* ── 일본 참다랑어 완전양식의 역설 (수산청·닛케이) ──
   검증(solid): 양식 BFT 출하 18,687t(2024 +11%), 완전양식(인공종묘) 405t/2%(2020 16%→2024 2%),
   WCPFC 2024.12 PBF 쿼터 대형(30kg+) 5,614→8,421t(+50%)·소형 4,007→4,407t(+10%).
   배경(인과 미확정): 2024.12 쿼터확대는 2025 적용이라 2020→2024 하락의 직접 원인일 수 없음.
   천연치어 저렴화·사료(고등어)값↑·완전양식 5년 소요가 후퇴 배경으로 지목되나 인과는 단정 보류. */
const FULLCYCLE = [
  // 닛케이 공개분(2020·2023·2024)만 수록. 중간년 2022=8%는 어떤 1차 출처에도 없어 제거.
  { yr: '2020', pct: 16 }, { yr: '2023', pct: 4 }, { yr: '2024', pct: 2 },
];

export default function SasJpAquaculture() {
  return (
    <WidgetCard
      id="W-SAS54"
      title="일본 참다랑어 완전양식의 역설"
      description="양식 생산 늘어도 인공종묘 비중 16%→2% 추락"
      pillar="S2"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      cardDesc="일본 양식 참다랑어 출하·완전양식(인공종묘) 비중·PBF 쿼터 — 수산청·닛케이"
      takeaway={{
        situation: "일본 양식 참다랑어 출하는 2024년 18,687톤(+11%)으로 늘었지만, 야생 치어가 아닌 인공종묘 기반 '완전양식' 비중은 405톤·2%로 2020년 최고 16%에서 1/8로 추락했습니다(닛케이 공개분 2020·2023·2024 기준, 중간년 2022 수치는 1차 출처 미확인). 배경으로는 천연 치어 포획의 상대적 저렴함, 사료(고등어) 값 상승, 완전양식의 5년 소요 부담이 지목됩니다. 다만 WCPFC의 2024년 12월 PBF 쿼터 확대(대형 +50%·소형 +10%)는 2025년 적용분이라 2020→2024 하락의 직접 원인으로 단정할 수 없어, 인과는 확정짓지 않고 배경 요인으로만 봅니다.",
        actionPlan: "완전양식 후퇴는 일본 BFT 공급이 '쿼터·야생 치어'에 다시 묶였음을 뜻합니다. ① 쿼터 확대(+50%)로 일본 국내 양식·자급이 늘면 한국·지중해의 對일본 BFT 수출 마진이 압박받으므로, 한국은 일본 단일 시장 의존을 낮추고 중국·미국 다변화를 가속하십시오. ② 완전양식 비중 추락은 ICCAT/WCPFC 야생 쿼터가 여전히 글로벌 BFT 공급의 결정 변수임을 재확인 — 쿼터 사이클을 BFT 가격 전망의 핵심 입력으로 삼으십시오.",
        source: "일본 수산청·닛케이·IBNEWS(양식 BFT 출하 18,687t·완전양식 405t 2%·2020 16%→2024 2%) / WCPFC 2024.12(PBF 쿼터 대형 +50%·소형 +10%)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>완전양식(인공종묘) 비중 추락 (%)</div>
          <div style={{ height: '170px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={FULLCYCLE} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="yr" fontSize={11} tickLine={false} axisLine={false} stroke="#64748b" />
                <YAxis domain={[0, 18]} tickFormatter={(v: number) => `${v}%`} fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#e2e8f0' }} formatter={(v: number) => [`${v}%`, '완전양식 비중']} />
                <Bar dataKey="pct" radius={[4, 4, 0, 0]} fill="#ef4444" isAnimationActive={false} />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#94a3b8' }}>
            양식 출하 <span style={{ color: '#10b981', fontWeight: 700 }}>18,687t(+11%)</span> · 배경(인과 미확정): 천연치어 저렴 + 사료값↑ + 완전양식 5년 (쿼터 +50%는 2025 적용분)
          </div>
        </div>
      }
    />
  );
}
