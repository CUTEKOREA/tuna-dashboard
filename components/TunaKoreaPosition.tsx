/**
 * 한국 양식 참다랑어 수입 경쟁력 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 101줄 → After 70줄 (-31%)
 */

'use client';
import React from 'react';
import { Anchor } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import data from '../data/tuna_korea_position.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{`${label}년 한국 참다랑어 수입`}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '4px 0 0 0', fontSize: '0.8rem' }}>
          <span>{entry.name}: </span>
          <strong>{entry.dataKey === 'Value' ? `$${Number(entry.value).toLocaleString()}천` : `${Number(entry.value).toLocaleString()} 톤`}</strong>
        </p>
      ))}
      {payload.length >= 2 && payload[0].value > 0 && (
        <p style={{ color: '#fbbf24', margin: '4px 0 0 0', fontSize: '0.8rem' }}>
          <span>추정 단가: </span><strong>${(payload[1].value / payload[0].value * 1000).toFixed(0)}/톤</strong>
        </p>
      )}
    </div>
  );
};

const TunaKoreaPosition = () => (
  <WidgetCard
    title="한국의 양식 참다랑어 수입 경쟁력"
    icon={Anchor}
    iconColor="#38bdf8"
    pillar="S3"
    cardDesc="FAO FishStatJ에서 참다랑어 양식 Top 10국 → 한국 수입 물량·금액 이중 Y축. 물량 정체에도 수입액 견고 — 한국 \'프리미엄 오마카세 성지\' 증거"
    telemetry={{ status: 'SYNCED', syncDate: '관세청 + FAO' }}
    chartHeight={350}
    chart={
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis dataKey="Year" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
        <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fill: '#38bdf8', fontSize: 12 }} tickFormatter={(v) => `${v.toLocaleString()}`} />
        <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{ fill: '#f43f5e', fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}M`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar yAxisId="left" dataKey="Volume" name="수입량 (톤)" fill="#38bdf8" fillOpacity={0.8} radius={[4, 4, 0, 0]} barSize={40} />
        <Line yAxisId="right" type="monotone" dataKey="Value" name="수입액 (천 USD)" stroke="#f43f5e" strokeWidth={4} dot={{ r: 5 }} activeDot={{ r: 8 }} />
      </ComposedChart>
    }
    takeaway={{
      situation: `<div>
<p>한국 참다랑어(Bluefin) 수입의 패턴 분석: <strong>물량 증가 속도 < 금액 증가 속도</strong>. 즉 단가가 구조적으로 상승하고 있다는 시그널. 한국 시장이 단순 양적 확대가 아닌 <strong>프리미엄화(premiumization)</strong> 단계 진입.</p>
<p>드라이버: ① 한국 미슐랭 스시 오마카세 폭발적 성장(서울 미쉐린 스시 가게 5년 전 5개 → 현재 25개+) ② 도쿄 토요스 의존 탈피, 직접 수입 비중 확대 ③ 강남·청담 지역 부유층 high-end 수요.</p>
<p>의미: 한국이 일본·홍콩에 이어 <strong>"아시아 3대 고급 Omakase 시장"</strong>으로 부상. 향후 5~10년 프리미엄 수요 +30~50% 추가 성장 잠재. 이 시장은 가격 민감도 낮고 마진 50~60% 가능한 luxury segment.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 한국 프리미엄 참다랑어 시장은 단순 수입국 위치가 아닌 <strong>"아시아 luxury food regional hub"</strong> 후보. 우리가 채널을 잡으면 일본·중국·동남아 cross-border B2B 가능.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>매입원가 상승 압박 방어</strong>: 선물환(FX Forward) 6개월·12개월 분할 hedge 체결. 매입가 변동성 ±15% 박스로 락업.</li>
<li style="margin-bottom: 8px;"><strong>일본 단순 중계 탈피 + 가공 설비 신규 capex</strong>: 사시미·초밥 세트 가공 자체 라인 도입. 도쿄 토요스 우회로 중간 유통 마진 200~400bp 직접 회수.</li>
<li><strong>국내 하이엔드 HoReCa 직납 비중 40%+ 확대</strong>: 미쉐린 스시·럭셔리 호텔 30곳과 5년 exclusive 공급 계약. 동시에 한국 hub로 일본·홍콩·싱가포르 cross-border 수출 platform 진화.</li>
</ol>
</div>`,
      source: '관세청 수입통계 + FAO FishStatJ',
    }}
  />
);

export default TunaKoreaPosition;
