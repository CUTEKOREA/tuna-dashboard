// @ts-nocheck
'use client';
/**
 * KimDashboard — 김(Laver) 신규 commodity 시안→코드 환원 (Phase 4, 2026-06-27 [CC])
 *
 * ⚠️ WIP 스캐폴드: 본 대시보드의 데이터는 claude.ai/design "Prototype 김(Laver)" 시안에서
 * 환원된 **예시(illustrative) 데이터**입니다. 배포 전 다음 게이트를 통과해야 합니다:
 *   - A-01 Live API First: FAOSTAT(해조류) · 관세청 수출통계 · KAMIS · 해수부 수산정보포털 실연동
 *   - O-04 Forensic Audit: 4-Axis 평균 A등급(85+)
 * 따라서 telemetry는 정직하게 STATIC, source는 "시안 데이터(실연동 전)"로 표기.
 * 시그니처 그라디언트: 김 = #166534 → #a3e635 (해조류 deep green→lime, RULEBOOK D-04 등재 제안).
 */
import React, { useState } from 'react';
import { Sprout, Factory, Ship, Leaf, Waves } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import WidgetCard from './WidgetCard';
import { truncateXAxis } from '../lib/chart-standards';

const KIM_GRAD_FROM = '#166534';
const KIM_GRAD_TO = '#a3e635';

const KPIS = [
  { title: '한국 김 수출액 (역대)', value: '$1.0B+', trend: '🌊', desc: '수산물 수출 1위 — K-푸드 견인', color: '#65a30d' },
  { title: '양식 생산 (만 속)', value: '시안값', trend: '🌱', desc: '전남·전북 집중 · 황백화 변동성', color: '#16a34a' },
  { title: '조미김 가공 부가가치', value: '시안값', trend: '🏭', desc: '원초 대비 2차 가공 단가 우위', color: '#a3e635' },
  { title: '미·일 수출 점유율', value: '시안값', trend: '📈', desc: 'K-스낵 붐 — 프리미엄 채널', color: '#4d7c0f' },
];

const PILLARS = [
  { id: 'P1', label: '원료 수급', title: '🌱 Pillar I — 원료 수급', desc: '양식 작황·황백화 리스크·산지 단가', color: KIM_GRAD_FROM },
  { id: 'P2', label: '가공·생산', title: '🏭 Pillar II — 가공·생산', desc: '마른김 수율·조미김 부가가치', color: '#65a30d' },
  { id: 'P3', label: '물류·통관', title: '🚢 Pillar III — 물류·통관', desc: '콜드체인·검역 (시안 준비 중)', color: '#4d7c0f' },
  { id: 'P4', label: '판매·수요', title: '📈 Pillar IV — 판매·수요', desc: '수출 단가·미·일 점유율', color: '#a3e635' },
  { id: 'P5', label: 'ESG', title: '🌍 Pillar V — ESG·지속가능성', desc: '탄소·친환경 양식 (시안 준비 중)', color: '#15803d' },
];

const supplyData = [
  { year: '2020', production: 152, blanching: 8 },
  { year: '2021', production: 148, blanching: 12 },
  { year: '2022', production: 140, blanching: 18 },
  { year: '2023', production: 133, blanching: 26 },
  { year: '2024', production: 128, blanching: 34 },
];
const processData = [
  { stage: '원초', value: 100 },
  { stage: '마른김', value: 168 },
  { stage: '1차조미', value: 235 },
  { stage: '프리미엄', value: 320 },
];
const exportData = [
  { q: '1분기', usd: 7.2, share: 18 },
  { q: '2분기', usd: 7.8, share: 21 },
  { q: '3분기', usd: 8.4, share: 24 },
  { q: '4분기', usd: 9.1, share: 28 },
];

const tooltipStyle = { background: 'rgba(0,15,30,0.92)', border: '1px solid rgba(132,204,22,0.4)', borderRadius: '8px' };

export default function KimDashboard() {
  const [activePart, setActivePart] = useState('P1');

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
      {/* ═══ WIP 배너 ═══ */}
      <div style={{ margin: '1rem 0 1.5rem', padding: '12px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.35)', borderLeft: '3px solid #f59e0b', borderRadius: '8px', fontSize: '0.82rem', color: '#fcd9a8', lineHeight: 1.55 }}>
        ⚠️ <strong style={{ color: '#f59e0b' }}>시안(Prototype) — 배포 불가</strong>. 데이터는 claude.ai/design 김 시안에서 환원된 <strong>예시값</strong>입니다.
        배포 전 A-01(FAOSTAT·관세청·KAMIS·해수부 실연동) + O-04(Forensic Audit 85+) 게이트 통과 필요. 모든 위젯 telemetry는 정직하게 STATIC.
      </div>

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: `linear-gradient(135deg, ${KIM_GRAD_FROM}, ${KIM_GRAD_TO})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Waves size={24} color="#0f172a" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#f8fafc' }}>🌿 김(Laver) 글로벌 밸류체인 대시보드</h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>[Phase 4 시안] 한국 수산물 수출 1위 품목 · 디자인 시스템 환원 데모</p>
          </div>
        </div>
      </header>

      {/* ═══ KPIs ═══ */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {KPIS.map((kpi, idx) => (
          <div key={idx} style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: `radial-gradient(circle,${kpi.color}40,transparent)`, pointerEvents: 'none' }} />
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{kpi.title}</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: '6px 0 4px' }}>{kpi.value}</div>
            <div style={{ fontSize: '0.68rem', color: kpi.color, fontWeight: 600 }}>
              <span style={{ background: `${kpi.color}20`, padding: '2px 5px', borderRadius: '4px', marginRight: '4px' }}>{kpi.trend}</span>{kpi.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ═══ 5-Pillar 네비게이터 ═══ */}
      <div style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5), rgba(15,23,42,0.2))', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '6px', marginBottom: '2rem' }}>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {PILLARS.map((s, idx) => {
            const isActive = activePart === s.id;
            return (
              <button key={s.id} onClick={() => setActivePart(s.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px 8px 14px', background: isActive ? `${s.color}18` : 'transparent', border: `1.5px solid ${isActive ? s.color : 'transparent'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.25s' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? s.color : 'rgba(255,255,255,0.06)', color: isActive ? '#0f172a' : 'rgba(148,163,184,0.6)', fontSize: '0.75rem', fontWeight: 800 }}>{idx + 1}</div>
                <span style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 500, color: isActive ? s.color : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ Pillar 콘텐츠 ═══ */}
      {PILLARS.filter(s => s.id === activePart).map((sec) => (
        <div key={sec.id} style={{ marginBottom: '4rem' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '4px', height: '28px', background: `linear-gradient(180deg,${sec.color},${sec.color}99)`, borderRadius: '2px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>{sec.title}</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{sec.desc}</p>
            </div>
          </div>
          <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>

            {sec.id === 'P1' && (
              <WidgetCard
                title="김 양식 작황·황백화 리스크"
                icon={Sprout}
                iconColor="#65a30d"
                pillar="S1"
                cardDesc="전남·전북 양식장 생산량(만 속) vs 황백화 발생 지수 — 고수온·영양염 부족 (시안)"
                telemetry={{ status: 'STATIC', syncDate: '시안' }}
                chart={
                  <AreaChart data={supplyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="kimProd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.5} /><stop offset="95%" stopColor="#16a34a" stopOpacity={0.05} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickFormatter={truncateXAxis} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="production" name="생산량 (만 속)" stroke="#16a34a" fill="url(#kimProd)" strokeWidth={2} />
                    <Line type="monotone" dataKey="blanching" name="황백화 지수" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                  </AreaChart>
                }
                takeaway={{
                  situation: '<div><p>"황백화"란 고수온·영양염 부족으로 김이 누렇게 변해 상품성을 잃는 현상. 생산량 자체보다 등급 하락이 본질 리스크.</p><p>시안 추세: <strong>생산량 완만한 감소 + 황백화 지수 상승</strong> — 수급 변동성 확대 국면.</p></div>',
                  actionPlan: '<div><p><strong>재정의</strong>: 황백화는 단순 작황이 아닌 "조생종·고수온 내성 품종 입식 + 산지 직계약"으로 헤지할 운영 변수.</p><p><strong>3단계</strong>: ① 내성 품종 비중 확대 ② 산지 직계약 선점 ③ 황백화 조기경보 모니터링.</p></div>',
                  source: '시안 데이터(실연동 전) · 해수부 수산정보포털 연동 예정',
                }}
              />
            )}

            {sec.id === 'P2' && (
              <WidgetCard
                title="마른김 가공 수율·조미김 부가가치"
                icon={Factory}
                iconColor="#65a30d"
                pillar="S2"
                cardDesc="원초 단가를 100으로 본 가공 단계별 부가가치 지수 (시안)"
                telemetry={{ status: 'STATIC', syncDate: '시안' }}
                chart={
                  <BarChart data={processData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} tickFormatter={truncateXAxis} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="value" name="부가가치 지수 (원초=100)" fill="#84cc16" radius={[3, 3, 0, 0]} />
                  </BarChart>
                }
                takeaway={{
                  situation: '<div><p>조미김·김스낵 등 2차 가공은 원초 대비 단가 우위가 큼. 가공 단계가 올라갈수록 부가가치가 비선형 증가.</p><p>시안: <strong>프리미엄 단계 원초 대비 3배+</strong> 부가가치.</p></div>',
                  actionPlan: '<div><p><strong>재정의</strong>: 원초 단순 수출은 commodity trap. 조미김 OEM 라인 capex로 마진 내재화.</p><p><strong>3단계</strong>: ① 조미김 라인 capex ② 미국 PB 직납 ③ 프리미엄 김스낵 자체 브랜드.</p></div>',
                  source: '시안 데이터(실연동 전) · KAMIS·업계 통계 연동 예정',
                }}
              />
            )}

            {sec.id === 'P4' && (
              <WidgetCard
                title="김 수출 단가·미·일 점유율"
                icon={Ship}
                iconColor="#a3e635"
                pillar="S4"
                cardDesc="분기별 수출 단가($/속)와 K-스낵 점유율(%) 추이 (시안)"
                telemetry={{ status: 'STATIC', syncDate: '시안' }}
                chart={
                  <LineChart data={exportData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="q" stroke="#94a3b8" fontSize={11} tickFormatter={truncateXAxis} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="usd" name="수출 단가 ($/속)" stroke="#0072B2" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="share" name="K-스낵 점유율 (%)" stroke="#a3e635" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                }
                takeaway={{
                  situation: '<div><p>K-푸드 붐으로 미국·일본 김스낵 수요 급증 — 수출 단가·점유율 동반 상승.</p><p>시안: <strong>분기 단가·점유율 우상향</strong>.</p></div>',
                  actionPlan: '<div><p><strong>재정의</strong>: 단가 상승기일수록 PB·프리미엄 라인으로 단가 방어선 구축.</p><p><strong>3단계</strong>: ① 미국 대형 리테일 PB 직납 ② 프리미엄 라인 분리 ③ 일본 채널 다변화.</p></div>',
                  source: '시안 데이터(실연동 전) · 관세청 수출통계 연동 예정',
                }}
              />
            )}

            {(sec.id === 'P3' || sec.id === 'P5') && (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: '#64748b' }}>
                <Leaf size={28} style={{ opacity: 0.5, marginBottom: '8px' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{sec.label} 위젯 시안 준비 중</div>
                <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>실데이터 연동 후 확장 예정 (콜드체인·검역 / 탄소·친환경 양식)</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
