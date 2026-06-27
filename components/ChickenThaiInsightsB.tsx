'use client';
import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell } from 'recharts';
import { Factory, AlertTriangle, Building2 } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE, getA11yBarProps } from './ChartPatterns';

const koreaSpecialData = [
  { spec: '일본향(1.8kg)', yield: 62, margin: 15, fcr: 1.58 },
  { spec: '표준(2.2kg)', yield: 68, margin: 18, fcr: 1.65 },
  { spec: '코리아 스페셜(2.5kg+)', yield: 74, margin: 25, fcr: 1.72 },
  { spec: '브라질 장닭(3kg+)', yield: 78, margin: 10, fcr: 1.85 },
];

const riskRadarData = [
  { risk: '환율(KRW/THB)', thai: 65, brazil: 70 },
  { risk: '사료비(CBOT)', thai: 60, brazil: 55 },
  { risk: '해상운임', thai: 30, brazil: 85 },
  { risk: 'HPAI 리스크', thai: 10, brazil: 90 },
  { risk: '중국 덤핑', thai: 50, brazil: 20 },
  { risk: 'TRQ/관세', thai: 45, brazil: 40 },
];

const partnerRadarData = [
  { axis: '생산능력', CP: 95, Betagro: 70, GFPT: 85 },
  { axis: '품질/위생', CP: 80, Betagro: 95, GFPT: 90 },
  { axis: '맞춤 유연성', CP: 60, Betagro: 80, GFPT: 95 },
  { axis: '가격경쟁력', CP: 90, Betagro: 65, GFPT: 75 },
  { axis: 'ESG/트레이스', CP: 75, Betagro: 95, GFPT: 80 },
];

export function InsightKoreaSpecialLine() {
  return (
    <WidgetCard
      title="Insight D. 코리아 스페셜 라인 — 맞춤형 대형 정육 라인"
      icon={Factory}
      iconColor="#f59e0b"
      pillar="S2"
      cardDesc='태국 일본향 1.8kg 소형닭으로는 한국 프랜차이즈 스펙 불충족. 사육기간 연장형 2.5kg+ "코리아 스페셜" 듀얼 라인 신설이 관건. 수율·마진·FCR 수치는 업계 추정치(illustrative)'
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={320}
      chart={
        <ComposedChart data={koreaSpecialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="spec" stroke="#94a3b8" />
          <YAxis yAxisId="left" stroke="#94a3b8" unit="%" />
          <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
          <RTooltip contentStyle={{ backgroundColor: '#1a2442', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Bar yAxisId="left" dataKey="yield" name="순살 수율(%)" radius={[4, 4, 0, 0]}>
            {koreaSpecialData.map((entry, idx) => {
              const p = getA11yBarProps(idx);
              return <Cell key={idx} fill={p.fill} color={p.color} stroke={p.stroke} />;
            })}
          </Bar>
          <Bar yAxisId="left" dataKey="margin" name="예상 마진(%)" fill={A11Y_PALETTE[2]} radius={[4, 4, 0, 0]} fillOpacity={0.85} />
          <Line yAxisId="right" type="monotone" dataKey="fcr" name="FCR(사료요구율)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
        </ComposedChart>
      }
      kpiPanel={[
        { label: '코리아 스페셜 마진', value: '25%', sub: '수율 74% · FCR 1.72', trendColor: '#f59e0b' },
      ]}
      takeaway={{
        situation: `<div>
<p>"FCR(Feed Conversion Ratio, 사료요구율)"이란 1kg 증체에 필요한 사료량. 1.7 이하 = 글로벌 최상위, 2.0+ = 영세 농가. "코리아 스페셜 라인"이란 한국 프랜차이즈 표준(2.5kg+) 맞춤 듀얼 사육 라인을 의미.</p>
<p>업계추정(illustrative): <strong>태국 표준 1.8~2.3kg 소형닭은 일본 수출 특화 → 한국 프랜차이즈 스펙(3kg+) 불충족. 그러나 코리아 스페셜 2.5kg+ 라인은 수율 74% (브라질 78% 대비 -4%p), FCR 1.72로 생산효율 브라질 대비 우위</strong>. 사이즈 갭은 단순 스펙 문제가 아닌 전체 가공·유통 시스템의 재설계 필요.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 사이즈 갭은 한계점이 아닌 <strong>"GFPT·Betagro와 한국 공급사가 독점 공유할 듀얼 라인 연구개발 협업 기회"</strong>. 다른 한국 공급사는 진입 불가능한 진입 장벽.</p>
<p><strong>3단계</strong>: ① GFPT/Betagro에 사육기간 연장형 2.5kg+ 라인 신설 — 독점 스펙 계약 즉시 체결 ② 일본향 소형 + 한국향 대형 듀얼 라인 — 양 시장 동시 공략으로 생산 효율 극대화 ③ 코리아 스페셜 순살 수율 74% + 잔뼈 zero → "1인분당 원가단위" 프레임워크로 프랜차이즈 본사 영업 — 브라질산 대비 우위 정량 입증.</p>
</div>`,
        source: 'GFPT Annual Report 2023 (도계 15→30만 마리 증설) · Thai DLD 2023 가공수율 보고서',
      }}
    />
  );
}

export function InsightRiskNexus() {
  return (
    <WidgetCard
      title="Insight E. 리스크 상관관계 넥서스 — 태국 vs 브라질 6축"
      icon={AlertTriangle}
      iconColor="#ef4444"
      pillar="S3"
      cardDesc="해상운임(10일 vs 56일)과 HPAI 청정 지위에서 태국이 우위. 중국산 덤핑만이 유일한 경계 대상"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={320}
      chart={
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={riskRadarData}>
          <PolarGrid stroke="rgba(255,255,255,0.15)" />
          <PolarAngleAxis dataKey="risk" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
          <RTooltip contentStyle={{ backgroundColor: '#1a2442', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Radar name="🇹🇭 태국 리스크" dataKey="thai" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
          <Radar name="🇧🇷 브라질 리스크" dataKey="brazil" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
        </RadarChart>
      }
      kpiPanel={[
        { label: '태국 HPAI 청정', value: '2007~', sub: '19년 연속 무발생', trendColor: '#10b981' },
      ]}
      takeaway={{
        situation: `<div>
<p>"리스크 넥서스(Risk Nexus)"란 단일 조달처의 6축 리스크(환율·사료·운임·HPAI·덤핑·관세)를 동시 비교해 공급사 포트폴리오 분산 결정을 내리는 프레임워크. 한 축만 봐서는 비교 무의미 — 6축 동시 분석이 본질.</p>
<p>자체평가(6축 점수는 추정): <strong>태국 vs 브라질 6축 비교 결과 — 태국 열위는 "환율(KRW/THB) + 중국산 덤핑(13~14% 저가)" 2개뿐. 해상운임(태국 10~14일 vs 브라질 56일), HPAI(태국 19년 청정 vs 브라질 2025 발발), CBOT $4.15(2025E) 저점 등 4축에서 압도적 우위</strong>. 6축 가중 합산 시 태국 우위 명확.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 중국산 덤핑은 위협이 아닌 <strong>"중국 식품 위생 부적격 이슈를 역이용해 '안전한 프리미엄' 브랜딩 고착 기회"</strong>. 태국 구획화(Compartmentalization)는 공급망 보험.</p>
<p><strong>3단계</strong>: ① 환율 — USD 선물환 분기별 리밸런싱으로 헷지 ② CBOT 저점($4.15) 즉시 고정가 장기공급계약 체결 ③ 중국산 덤핑 → 중국 위생 부적격 매월 모니터링 보고서 발행 — "한국 안전 프리미엄" 브랜드 고착화. 태국 램차방→부산 10일 직항 최적화로 한국 시장 결품 zero.</p>
</div>`,
        source: 'OIE WAHIS · CBOT 선물 데이터 · BDI 해상운임 지수 · KCS HS 0207 수입통계',
      }}
    />
  );
}

export function InsightPartnerMatch() {
  return (
    <WidgetCard
      title="Insight F. 태국 3대 파트너사 전략 매칭 — CP·Betagro·GFPT"
      icon={Building2}
      iconColor="#8b5cf6"
      pillar="S2"
      cardDesc="GFPT(스펙 맞춤 연구개발) + Betagro(프리미엄 무항생제) + CP Foods(볼륨 백본). 유통채널별 최적 파트너 매칭. 레이더 점수는 업계 추정치(illustrative)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={320}
      chart={
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={partnerRadarData}>
          <PolarGrid stroke="rgba(255,255,255,0.15)" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
          <RTooltip contentStyle={{ backgroundColor: '#1a2442', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Radar name="CP Foods" dataKey="CP" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} />
          <Radar name="Betagro" dataKey="Betagro" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
          <Radar name="GFPT" dataKey="GFPT" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
        </RadarChart>
      }
      kpiPanel={[
        { label: 'GFPT 도계능력 증설', value: '30만/일', sub: '15→30만 마리 (2배)', trendColor: '#8b5cf6' },
      ]}
      takeaway={{
        situation: `<div>
<p>"파트너 포트폴리오 매칭"이란 단일 공급사 의존 대신 채널별 최적 공급사를 매칭해 리스크를 횡적 분산하는 조달 전략. CP·Betagro·GFPT 3사는 각각 채널 특화 강점이 다른 상호보완 포지션.</p>
<p>추정(업계 기준): <strong>CP Foods (생산능력 95) = 세계 최대 + 가격경쟁력 / Betagro (품질·위생 95 + ESG 95) = 무항생제 프리미엄 / GFPT (맞춤 유연성 95 + 도계 15→30만/일 2배 증설) = 프랜차이즈 맞춤 연구개발 최적</strong>. 3사 모두 고유 경쟁우위 보유 — 1개사 의존은 자본 배분 오류.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 3사 분산은 단순 리스크 헷지가 아닌 <strong>"채널별 공급사 강점을 1:1 매칭해 한국 시장 전 채널 동시 장악할 포트폴리오 전략"</strong>.</p>
<p><strong>3단계</strong>: ① GFPT = 프랜차이즈 맞춤 코리아 스페셜 라인 연구개발 파트너 — 순살 스펙 최적화 독점 ② Betagro = 편의점 가정간편식(HMR) 프리미엄 — 무항생제 "윤리적 치킨" ESG 브랜딩 ③ CP Foods = 볼륨 백본 — 식자재마트·급식 대량 납품 기반. 단일 공급사 50%+ 의존 금지 → 3사 분산으로 한국 시장 공급사 고착화.</p>
</div>`,
        source: 'GFPT Annual Report 2023 · Betagro IR 2023 · CP Foods 2023 Value Chain Analysis',
      }}
    />
  );
}
