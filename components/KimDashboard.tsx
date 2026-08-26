'use client';
/**
 * KimDashboard — 김(Laver) 신규 commodity 대시보드 (2026-06-27 [CC])
 *
 * v1 실데이터 반영: 5축 웹 리서치(FAOSTAT·관세청/KATI·통계청·해수부·국립수산과학원·KITA) →
 * 적대적 출처 검증(confirmed/partial 69건) → 검증 통과 수치만 반영.
 * telemetry SYNCED + 실출처/기준연도 표기 (LIVE API 라우트 연동은 후속 단계).
 * 시그니처 그라디언트: 김 = #166534 → #a3e635 (RULEBOOK D-04 등재).
 *
 * 데이터 출처(검증):
 *  - 생산: 통계청 어업생산동향조사 · 해양수산부 보도자료(KDI 게재)
 *  - 김플레이션: aT 한국농수산식품유통공사(KAMIS) · 해양수산부 · 수협
 *  - 수출: 관세청 · KATI/aT · 해양수산부 보도자료
 *  - 글로벌 시장: Grand View Research / Mordor Intelligence
 *  - 기후: 국립수산과학원(표층수온 1968–2022) · 해양수산부(황백화)
 */
import React, { useState } from 'react';
import { Factory, Ship, ThermometerSun, Waves } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import WidgetCard from './WidgetCard';
import KimLogisticsWidget from './KimLogisticsWidget';
import AnimatedNumber from './AnimatedNumber';
import KimSeasonedWidget from './KimSeasonedWidget';
import { KimProductionTrend, KimGlobalShare, KimExportTrend, KimExportDest, KimGlobalImporters, KimConsumption, KimFxPrice, KimWorldProduction, KimResearch } from './KimAgriDataWidgets';
import { truncateXAxis } from '../lib/chart-standards';

const KIM_FROM = '#166534';
const KIM_TO = '#a3e635';

const KPIS = [
  { title: '김 수출액 (2025)', value: '$11.3억', trend: '🌊', desc: '+13.7% 역대최고 · 수산식품 수출 1위', color: '#65a30d' },
  { title: '세계 김 시장 점유율', value: '70%+', trend: '🥇', desc: '글로벌 김 시장 한국 독점적 1위', color: '#16a34a' },
  { title: '물김 양식 생산 (2024)', value: '55.2만톤', trend: '🌱', desc: '전남이 전국의 80% · 마른김 1.5억속', color: '#a3e635' },
  { title: '한국 해역 수온 (1968→2022)', value: '+1.36℃', trend: '🌡️', desc: '세계평균(+0.52℃)의 2.6배 · 황백화 확산', color: '#f59e0b' },
];

const PILLARS = [
  { id: 'P1', label: '원료 수급', title: '🌱 Pillar I - 원료 수급', desc: '김 양식 생산량 추이·산지', color: KIM_FROM },
  { id: 'P2', label: '가공·생산', title: '🏭 Pillar II - 가공·생산', desc: '김플레이션·가공 부가가치', color: '#65a30d' },
  { id: 'P3', label: '물류·통관', title: '🚢 Pillar III - 물류·통관', desc: '관세청 KCS 마른김·조미김 수출 통관·대상국·단가 (LIVE)', color: '#4d7c0f' },
  { id: 'P4', label: '판매·수요', title: '📈 Pillar IV - 판매·수요', desc: '수출 실적·주요국·글로벌 시장', color: '#a3e635' },
  { id: 'P5', label: 'ESG', title: '🌍 Pillar V - ESG·지속가능성', desc: '기후(수온)·황백화 리스크', color: '#15803d' },
];

// ── 검증 실데이터 (생산·수출 국가별은 agri_data 실데이터 위젯으로 분리: KimAgriDataWidgets) ──
// 마른김 소매가 (원/10장) 추이 — aT (2024평균 1,271 → 2025.1 1,436 → 2026.1 1,555 역대최고)
const priceData = [
  { p: '2024 평균', retail: 1271 },
  { p: '2025.1', retail: 1436 },
  { p: '2026.1', retail: 1555 },
];
// 김 수출액 (백만 USD) — 관세청/KATI·해수부
const exportData = [
  { year: '2022', usd: 648 },
  { year: '2023', usd: 793 },
  { year: '2024', usd: 997 },
  { year: '2025', usd: 1133 },
];
const tip ={ background: 'rgba(10, 16, 40, 0.92)', border: '1px solid rgba(132,204,22,0.4)', borderRadius: '8px' };

export default function KimDashboard() {
  const [activePart, setActivePart] = useState('P1');

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--w-slate-50)', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
      {/* ═══ 데이터 출처 배너 (실데이터 v1) ═══ */}
      <div style={{ margin: '1rem 0 1.5rem', padding: '12px 16px', background: 'rgba(132,204,22,0.08)', border: '1px solid rgba(132,204,22,0.3)', borderLeft: `3px solid ${KIM_TO}`, borderRadius: '8px', fontSize: '0.82rem', color: '#d9f99d', lineHeight: 1.55 }}>
        ✅ <strong style={{ color: KIM_TO }}>실데이터 v1</strong> - 통계청·관세청/KATI·해양수산부·국립수산과학원·Grand View Research 검증 수치 반영(적대 출처검증 통과). 위젯 telemetry SYNCED + 실출처 표기.
        <span style={{ color: 'var(--w-slate-400)' }}> P3(물류·통관)은 관세청 KCS OpenAPI <strong style={{ color: KIM_TO }}>LIVE 연동</strong> - 마른김(HS 1212.21)·조미김(HS 2008.99.50.10) 분리 집계 + 대상국 비중·원초 vs 가공 단가. 실패 시 관세청 실수집 fallback.</span>
      </div>

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: `linear-gradient(135deg, ${KIM_FROM}, ${KIM_TO})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Waves size={24} color="#0a0f1f" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--w-slate-50)' }}>🌿 김(Laver) 글로벌 밸류체인 대시보드</h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--w-slate-400)' }}>[V4.2 S-Grade] 한국 수산식품 수출 1위 품목 · 세계 김 시장 70%+ 점유</p>
          </div>
        </div>
      </header>

      {/* ═══ KPIs ═══ */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {KPIS.map((kpi, idx) => (
          <div key={idx} style={{ background: '#11182f', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: `radial-gradient(circle,${kpi.color}40,transparent)`, pointerEvents: 'none' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)', fontWeight: 600 }}>{kpi.title}</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--w-slate-50)', margin: '6px 0 4px' }}><AnimatedNumber value={kpi.value} /></div>
            <div style={{ fontSize: '0.68rem', color: kpi.color, fontWeight: 600 }}>
              <span style={{ background: `${kpi.color}20`, padding: '2px 5px', borderRadius: '4px', marginRight: '4px' }}>{kpi.trend}</span>{kpi.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ═══ 5-Pillar 네비게이터 ═══ */}
      <div style={{ background: 'linear-gradient(180deg, rgba(20, 28, 52, 0.5), rgba(20, 28, 52, 0.2))', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '6px', marginBottom: '2rem' }}>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {PILLARS.map((s, idx) => {
            const isActive = activePart === s.id;
            return (
              <button key={s.id} onClick={() => setActivePart(s.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px 8px 14px', background: isActive ? `${s.color}18` : 'transparent', border: `1.5px solid ${isActive ? s.color : 'transparent'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.25s' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? s.color : 'rgba(140,170,255,0.12)', color: isActive ? '#0a0f1f' : 'rgba(var(--w-slate-400-rgb), 0.6)', fontSize: '0.75rem', fontWeight: 800 }}>{idx + 1}</div>
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
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--w-slate-50)' }}>{sec.title}</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--w-slate-400)' }}>{sec.desc}</p>
            </div>
          </div>
          <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>

            {sec.id === 'P1' && (
              <>
                <KimProductionTrend />
                <KimGlobalShare />
                <KimWorldProduction />
              </>
            )}

            {sec.id === 'P2' && (
              <>
              <WidgetCard
                title="김플레이션 - 마른김 소매가 급등"
                icon={Factory} iconColor="#65a30d" pillar="S2"
                cardDesc="마른김 소매가(원/10장) 추이 - 13개월 연속 상승, 2026.1 역대 최고 1,555원(+41.8%)"
                telemetry={{ status: 'SYNCED', syncDate: 'aT 2026.01' }}
                chart={
                  <LineChart data={priceData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
                    <XAxis dataKey="p" stroke="var(--w-slate-400)" fontSize={11} tickFormatter={truncateXAxis} />
                    <YAxis stroke="var(--w-slate-400)" fontSize={11} domain={[1000, 1700]} />
                    <Tooltip contentStyle={tip} formatter={(v) => [`${Number(v ?? 0).toLocaleString()}원/10장`, '소매가']} />
                    <Line type="monotone" dataKey="retail" name="마른김 소매가 (원/10장)" stroke="#84cc16" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                }
                takeaway={{
                  situation: '<div><p>"김플레이션" - 마른김 소매가 2024년 평균 1,271원 → 2026.1 <strong>1,555원/10장 역대 최고(+41.8%)</strong>, 도매는 속당 1만원 돌파(+80%). 조미김은 마른김 대비 2~4배. 정부 할당관세(700톤, 관세 20%→면제)로 대응.</p><p>역설: 같은 시기 <strong>원초(물김) 위판가는 763원/kg(2025.1)로 전년 1,604원의 절반</strong> - 산지 약세 vs 소비자가 급등 괴리.</p></div>',
                  actionPlan: '<div><p><strong>재정의</strong>: 산지-소매 가격 괴리는 "가공·유통 단계 마진 재배분" 기회.</p><p><strong>3단계</strong>: ① 원초 약세기 선매입·계약재배 ② 조미김 2차 가공 내재화로 2~4배 부가가치 ③ 직거래로 유통 마진 압축.</p></div>',
                  source: 'aT 한국농수산식품유통공사(KAMIS) · 해양수산부 · 수협중앙회',
                }}
              />
              <KimConsumption />
              </>
            )}

            {sec.id === 'P4' && (
              <>
                <WidgetCard
                  title="김 수출액 추이 ($648M→$1,133M)"
                  icon={Ship} iconColor="#a3e635" pillar="S4"
                  cardDesc="연간 김 수출액(백만 USD) - 2025년 11.3억 달러 역대최고(+13.7%), 수산식품 수출 1위"
                  telemetry={{ status: 'SYNCED', syncDate: 'KATI 2025' }}
                  chart={
                    <AreaChart data={exportData} margin={{ top: 10, right: 20, left: -5, bottom: 0 }}>
                      <defs><linearGradient id="kimExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a3e635" stopOpacity={0.5} /><stop offset="95%" stopColor="#a3e635" stopOpacity={0.05} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
                      <XAxis dataKey="year" stroke="var(--w-slate-400)" fontSize={11} tickFormatter={truncateXAxis} />
                      <YAxis stroke="var(--w-slate-400)" fontSize={11} tickFormatter={(v) => `$${v}M`} />
                      <Tooltip contentStyle={tip} formatter={(v) => [`$${v}M`, '수출액']} />
                      <Area type="monotone" dataKey="usd" name="김 수출액 (백만 USD)" stroke="#65a30d" fill="url(#kimExp)" strokeWidth={2.5} />
                    </AreaChart>
                  }
                  takeaway={{
                    situation: '<div><p>김 수출액은 4년 만에 $648M(2022)→<strong>$1,133M(2025, +13.7% 역대최고)</strong>. 2024년 $997M으로 <strong>수산식품 수출 1위</strong>(2위 참치 $589M의 1.7배), 전체 수산식품 수출의 약 1/3. 124개국 수출, 조미김이 67%.</p></div>',
                    actionPlan: '<div><p><strong>재정의</strong>: 김은 "수산물"이 아닌 K-푸드 대표 가공 수출재 - 단가·브랜드 게임.</p><p><strong>3단계</strong>: ① 조미김 고부가 비중 확대 ② 124개국 채널 중 상위4국(61%) 외 신흥국 발굴 ③ 원물 부족분 안정 조달로 수출 capa 방어.</p></div>',
                    source: '관세청 · KATI/aT · 해양수산부 보도자료(2025·2026)',
                  }}
                />
                <KimExportTrend />
                <KimExportDest />
                <KimGlobalImporters />
                <KimFxPrice />
              </>
            )}

            {sec.id === 'P5' && (
              <>
              <WidgetCard
                title="기후 리스크 - 표층수온 상승·황백화"
                icon={ThermometerSun} iconColor="#f59e0b" pillar="S5"
                cardDesc="한국 해역 표층수온 상승폭 vs 세계 평균(℃, 1968–2022) - 황백화 확산의 근본 동인"
                telemetry={{ status: 'SYNCED', syncDate: '수과원 2022' }}
                chart={
                  <BarChart data={[{ k: '세계 평균', v: 0.52 }, { k: '한국 해역', v: 1.36 }]} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" horizontal={false} />
                    <XAxis type="number" stroke="var(--w-slate-400)" fontSize={11} tickFormatter={(v) => `+${v}℃`} />
                    <YAxis type="category" dataKey="k" stroke="var(--w-slate-400)" fontSize={12} width={70} />
                    <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v) => [`+${v}℃`, '상승폭']} />
                    <Bar dataKey="v" name="표층수온 상승폭 (℃)" radius={[0, 3, 3, 0]}>
                      <Cell fill="var(--w-slate-500)" /><Cell fill="var(--w-amber-500)" />
                    </Bar>
                  </BarChart>
                }
                takeaway={{
                  situation: '<div><p>한국 해역 표층수온은 1968–2022년 <strong>+1.36℃</strong> 상승 - 세계 평균(+0.52℃)의 <strong>2.6배</strong>. 이로 인한 황백화(갯병)로 충남 서천 양식장 <strong>3,156ha(95%)</strong> 피해, 전남 작황 평년比 −15%. 생산 정점 대비 −15.6%의 근본 동인.</p></div>',
                  actionPlan: '<div><p><strong>재정의</strong>: 황백화는 일시 재해가 아닌 "상시 기후 리스크" - 양식 자체의 적응 설계 필요.</p><p><strong>3단계</strong>: ① 고수온 내성 품종 R&D·보급 ② 양식 시기·수심 조정 + 외해 양식 ③ 기후보험·재해 헤지 + 황백화 조기경보 모니터링.</p></div>',
                  source: '국립수산과학원(표층수온 1968–2022) · 해양수산부(황백화 피해)',
                }}
              />
              <KimResearch />
              </>
            )}

            {sec.id === 'P3' && (
              <>
                <KimLogisticsWidget />
                <KimSeasonedWidget />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
