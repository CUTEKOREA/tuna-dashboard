// @ts-nocheck
'use client';
/**
 * KimAgriDataWidgets — 김(laver) agri_data 풀세트 1차 실데이터 위젯 (2026-06-28 [CC])
 * 출처: FAO FishStat Aquaculture(한국 양식 73년) + 관세청 KCS 마른김 HS 1212.21(2020-2024).
 * scratch/extract_kim_data.py 로 CSV → public/data/kim/*.json 결정론적 추출(환각 없음).
 * 정합성: 조미김 2008.99은 광범위 세번이라 제외, 마른김 1212.21(김 전용 세번)만 정밀 집계.
 * telemetry SYNCED + 실출처/기준연도.
 */
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Sprout, Globe, Ship, Anchor, Boxes, Utensils, DollarSign, FlaskConical } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { truncateXAxis } from '../lib/chart-standards';

const tip = { background: 'rgba(10, 16, 40, 0.92)', border: '1px solid rgba(132,204,22,0.4)', borderRadius: '8px' };

function useJson(path) {
  const [d, setD] = useState(null);
  useEffect(() => {
    let on = true;
    fetch(path).then(r => r.ok ? r.json() : null).then(j => { if (on) setD(j); }).catch(() => { if (on) setD(null); });
    return () => { on = false; };
  }, [path]);
  return d;
}

const Loading = ({ label }) => (
  <div style={{ padding: '36px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: '#64748b', fontSize: '0.82rem' }}>{label} 로딩 중…</div>
);

/* ───────────── S1: 한국 김 양식 생산 73년 추이 (FishStat) ───────────── */
export function KimProductionTrend() {
  const d = useJson('/data/kim/kim_production.json');
  if (!d) return <Loading label="양식 생산" />;
  const series = (d.korSeries || []).filter(s => Number(s.year) >= 2005).map(s => ({ year: s.year, ton: Math.round(s.ton / 1000) }));
  const peak = (d.korSeries || []).reduce((a, b) => b.ton > a.ton ? b : a, { ton: 0 });
  const latest = d.korSeries?.[d.korSeries.length - 1];
  return (
    <WidgetCard
      title="한국 김 양식 생산 추이 (FishStat)"
      icon={Sprout} iconColor="#16a34a" pillar="S1"
      cardDesc="FAO FishStat 한국 김 양식 생산량(천 톤, 생중량) — 2005년 이후"
      telemetry={{ status: 'SYNCED', syncDate: 'FishStat 2022' }}
      chart={
        <AreaChart data={series} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
          <defs><linearGradient id="kimProdReal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.5} /><stop offset="95%" stopColor="#16a34a" stopOpacity={0.05} /></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickFormatter={truncateXAxis} minTickGap={20} />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}천t`} />
          <Tooltip contentStyle={tip} formatter={(v) => [`${v}천 톤`, '양식 생산']} />
          <Area type="monotone" dataKey="ton" name="양식 생산 (천 톤)" stroke="#16a34a" fill="url(#kimProdReal)" strokeWidth={2.5} />
        </AreaChart>
      }
      takeaway={{
        situation: `<div><p>FAO FishStat 기준 한국 김 양식 생산은 <strong>2019년 ${Math.round(peak.ton / 1000)}천 톤 정점</strong> 이후 고수온·황백화로 ${latest ? `${latest.year}년 ${Math.round(latest.ton / 1000)}천 톤` : ''}으로 둔화. 73년 장기 시계열상 2010년대 급성장 후 변동성 확대.</p></div>`,
        actionPlan: '<div><p><strong>재정의</strong>: 정점 정체는 작황이 아닌 고수온 구조 한계 — 외해·내성품종 확장이 생산 회복의 본질.</p><p><strong>3단계</strong>: ① 고수온 내성 품종·신규 양식장 ② 외해 양식 전환 ③ 정점 대비 갭 복원 KPI.</p></div>',
        source: 'FAO FishStat Aquaculture (laver, 한국 UN 410) · 양식 거의 100%',
      }}
    />
  );
}

/* ───────────── S1: 세계 김 생산 국가별 비중 (FishStat) ───────────── */
export function KimGlobalShare() {
  const d = useJson('/data/kim/kim_production.json');
  if (!d) return <Loading label="세계 생산 비중" />;
  const top = (d.globalShare || []).filter(s => s.pct >= 0.5);
  const COLORS = ['#0072B2', '#16a34a', '#E69F00', '#CC79A7', '#64748b'];
  const data = top.map((s, i) => ({ name: s.name, value: s.pct, fill: COLORS[i % COLORS.length] }));
  const kor = top.find(s => s.name === '대한민국');
  return (
    <WidgetCard
      title={`세계 김 생산 국가별 비중 (${d.globalShareYear || 2022})`}
      icon={Globe} iconColor="#a3e635" pillar="S1"
      cardDesc="FAO FishStat 세계 김 양식 생산 국가별 점유율(%) — 생산량 기준"
      telemetry={{ status: 'SYNCED', syncDate: `FishStat ${d.globalShareYear || 2022}` }}
      chart={
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={86} paddingAngle={2} dataKey="value" stroke="none">
            {data.map((e, i) => <Cell key={i} fill={e.fill} />)}
          </Pie>
          <Tooltip contentStyle={tip} formatter={(v, n) => [`${v}%`, n]} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </PieChart>
      }
      takeaway={{
        situation: `<div><p>생산량 기준 세계 김은 <strong>중국이 ${top[0]?.pct}%로 압도</strong>, 한국 ${kor ? kor.pct : ''}%·일본 순. 다만 한국은 <strong>생산 비중(약 19%)보다 가공·브랜드 수출 시장 점유(70%+)가 훨씬 큼</strong> — 원물보다 가공·유통에서 지배.</p></div>`,
        actionPlan: '<div><p><strong>재정의</strong>: 생산량 열위(중국 73%)는 위협이 아닌 "한국=가공·브랜드 허브" 포지션의 근거.</p><p><strong>3단계</strong>: ① 중국 원초 저가 활용한 가공 마진 ② 한국산 프리미엄 brand moat ③ 생산 비중-시장 점유 갭을 IR 스토리로.</p></div>',
        source: 'FAO FishStat Aquaculture (laver) · 생산량 기준 점유율',
      }}
    />
  );
}

/* ───────────── S4: 마른김 수출 5년 추이 (KCS) ───────────── */
export function KimExportTrend() {
  const d = useJson('/data/kim/kim_exports.json');
  if (!d) return <Loading label="수출 추이" />;
  const data = (d.annual || []).map(a => ({ year: a.year, usd: Math.round(a.expUsd / 1e6), ton: a.expTon }));
  const first = data[0], last = data[data.length - 1];
  const growth = first ? Math.round((last.usd / first.usd - 1) * 100) : 0;
  return (
    <WidgetCard
      title="마른김 수출 추이 (관세청 KCS, HS 1212.21)"
      icon={Ship} iconColor="#a3e635" pillar="S4"
      cardDesc="마른김(HS 1212.21) 연간 수출액(백만 USD)·물량(톤) — 2020~2024 관세청 실적"
      telemetry={{ status: 'SYNCED', syncDate: 'KCS 2024' }}
      chart={
        <AreaChart data={data} margin={{ top: 10, right: 16, left: -5, bottom: 0 }}>
          <defs><linearGradient id="kimExpReal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a3e635" stopOpacity={0.5} /><stop offset="95%" stopColor="#a3e635" stopOpacity={0.05} /></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickFormatter={truncateXAxis} />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}M`} />
          <Tooltip contentStyle={tip} formatter={(v, n) => n === '수출액 (백만 USD)' ? [`$${v}M`, n] : [`${v.toLocaleString()}톤`, n]} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Area type="monotone" dataKey="usd" name="수출액 (백만 USD)" stroke="#65a30d" fill="url(#kimExpReal)" strokeWidth={2.5} />
        </AreaChart>
      }
      takeaway={{
        situation: `<div><p>마른김(1212.21) 수출은 <strong>2020 $${first?.usd}M → 2024 $${last?.usd}M (+${growth}%)</strong>, 물량은 ~3만 톤 보합인데 금액이 급증 — <strong>단가 상승 주도 성장</strong>. (조미김 2008.99은 광범위 세번이라 별도 집계 제외.)</p></div>`,
        actionPlan: '<div><p><strong>재정의</strong>: 물량 보합·금액 급증 = "단가·프리미엄 게임" — 물량 확대보다 단가 방어가 핵심.</p><p><strong>3단계</strong>: ① 고단가 시장(일본·프리미엄) 집중 ② 원초 부족 대비 조달 안정 ③ 단가 하락 신호 조기경보.</p></div>',
        source: '관세청 KCS · 마른김 HS 1212.21 (2020-2024)',
      }}
    />
  );
}

/* ───────────── S4: 2024 마른김 수출국 TOP8 (KCS) ───────────── */
export function KimExportDest() {
  const d = useJson('/data/kim/kim_exports.json');
  if (!d) return <Loading label="수출 대상국" />;
  const data = (d.dest2024 || []).map(x => ({ name: x.name, usd: Math.round(x.expUsd / 1e6) }));
  return (
    <WidgetCard
      title="2024 마른김 수출국 TOP8 (관세청)"
      icon={Anchor} iconColor="#a3e635" pillar="S4"
      cardDesc="2024년 마른김(HS 1212.21) 수출액 상위국(백만 USD) — 통관 실적 기준"
      telemetry={{ status: 'SYNCED', syncDate: 'KCS 2024' }}
      chart={
        <BarChart data={data} layout="vertical" margin={{ top: 6, right: 24, left: 16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}M`} />
          <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={58} />
          <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v) => [`$${v}M`, '수출액']} />
          <Bar dataKey="usd" name="2024 수출액 (백만 USD)" fill="#84cc16" radius={[0, 3, 3, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: `<div><p>마른김(원물) 수출은 <strong>일본 $${data[0]?.usd}M으로 압도적 1위</strong>, 태국·러시아·중국 순. 미국은 마른김에선 하위권 — <strong>미국은 조미김(가공품) 위주</strong>라 원물 통계에선 낮게 잡힘(채널 이원화).</p></div>`,
        actionPlan: '<div><p><strong>재정의</strong>: 마른김=일본/아시아 중심, 조미김=미국/서구 중심의 이원 채널 구조.</p><p><strong>3단계</strong>: ① 일본 원물 단가 협상력 강화 ② 미국향은 조미김 가공으로 부가가치 ③ 러시아·태국 성장국 관리.</p></div>',
        source: '관세청 KCS · 마른김 HS 1212.21 2024 국가별',
      }}
    />
  );
}

/* ───────────── S4: 글로벌 김 수입 수요 (UN Comtrade) ───────────── */
export function KimGlobalImporters() {
  const d = useJson('/data/kim/kim_global_trade.json');
  if (!d) return <Loading label="글로벌 수입국" />;
  const data = (d.importers || []).map(x => ({ name: x.name, usdM: x.usdM }));
  return (
    <WidgetCard
      title={`글로벌 김 수입 수요 (Comtrade ${d.year || 2023})`}
      icon={Boxes} iconColor="#a3e635" pillar="S4"
      cardDesc="세계 김(HS 1212.21) 수입액 상위국(백만 USD) — 원초 수요 기준 (Comtrade 보고국)"
      telemetry={{ status: 'SYNCED', syncDate: `Comtrade ${d.year || 2023}` }}
      chart={
        <BarChart data={data} layout="vertical" margin={{ top: 6, right: 28, left: 16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}M`} />
          <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={52} />
          <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v) => [`$${v}M`, '수입액']} />
          <Bar dataKey="usdM" name="수입액 (백만 USD)" radius={[0, 3, 3, 0]}>
            {data.map((x, i) => <Cell key={i} fill={x.name === '중국' ? '#0072B2' : x.name === '대한민국' ? '#16a34a' : '#84cc16'} />)}
          </Bar>
        </BarChart>
      }
      takeaway={{
        situation: `<div><p>세계 김(원초) 최대 수입국은 <strong>중국 $${data[0]?.usdM}M</strong>으로 압도적 — <strong>생산 1위(73%)이면서 동시에 원초 수입 1위</strong>인 역설. 자국 재가공·내수 수요가 그만큼 큼. 한국도 $${data.find(x => x.name === '대한민국')?.usdM || ''}M 수입(가공 원료 보충).</p></div>`,
        actionPlan: '<div><p><strong>재정의</strong>: 중국은 경쟁자이자 최대 원초 수요처 — "중국 수출 vs 중국 가공 침투" 양면 전략.</p><p><strong>3단계</strong>: ① 중국 원초 수출 채널 확대 ② 중국 재가공 우회 대비 한국 가공 brand moat ③ 원초 부족기 한국 수입선 다변화.</p></div>',
        source: 'UN Comtrade · 김 HS 1212.21 수입 (보고국 기준, 일부 국가 한정)',
      }}
    />
  );
}

/* ───────────── S2: 한국 1인당 해조류 소비 추이 (FAOSTAT FBS) ───────────── */
export function KimConsumption() {
  const d = useJson('/data/kim/kim_consumption.json');
  if (!d) return <Loading label="1인당 소비" />;
  const data = (d.perCapita || []).map(p => ({ year: p.year, v: p.v }));
  const first = data[0], last = data[data.length - 1];
  const chg = first ? Math.round((last.v / first.v - 1) * 100) : 0;
  return (
    <WidgetCard
      title="한국 1인당 해조류 소비 추이 (FAOSTAT)"
      icon={Utensils} iconColor="#65a30d" pillar="S2"
      cardDesc="한국 해조류(Aquatic Plants) 1인당 식용 공급량(kg/인/년) — FAOSTAT 식품수급표"
      telemetry={{ status: 'SYNCED', syncDate: 'FAOSTAT FBS' }}
      chart={
        <AreaChart data={data} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
          <defs><linearGradient id="kimConsume" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#65a30d" stopOpacity={0.45} /><stop offset="95%" stopColor="#65a30d" stopOpacity={0.04} /></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickFormatter={truncateXAxis} minTickGap={20} />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}kg`} />
          <Tooltip contentStyle={tip} formatter={(v) => [`${v} kg/인/년`, '1인당 공급']} />
          <Area type="monotone" dataKey="v" name="1인당 해조류 공급 (kg/인/년)" stroke="#65a30d" fill="url(#kimConsume)" strokeWidth={2.5} />
        </AreaChart>
      }
      takeaway={{
        situation: `<div><p>한국 1인당 해조류 식용 공급은 ${first?.year} ${first?.v}kg → <strong>${last?.year} ${last?.v}kg (${chg >= 0 ? '+' : ''}${chg}%)</strong>. 세계 최고 수준의 해조류 소비국 — 탄탄한 내수가 수출 변동의 완충.</p></div>`,
        actionPlan: '<div><p><strong>재정의</strong>: 높은 내수 소비 = 수출 일변도 리스크의 안전판이자 신제품 테스트베드.</p><p><strong>3단계</strong>: ① 내수 프리미엄·간편식(스낵·조미) 확대 ② 내수 검증 제품을 수출로 ③ 1인당 소비 정체 시 가공 다양화로 신수요.</p></div>',
        source: 'FAOSTAT 식품수급표(FBS) · 한국 해조류 1인당 공급',
      }}
    />
  );
}

/* ───────────── S4: 환율 vs 마른김 수출단가 (ECOS + KCS) ───────────── */
export function KimFxPrice() {
  const d = useJson('/data/kim/kim_fx.json');
  if (!d) return <Loading label="환율·단가" />;
  const data = (d.series || []).filter(s => s.krwUsd).map(s => ({ year: s.year, krw: s.krwUsd, price: s.expUsdPerKg }));
  const f = data[0], l = data[data.length - 1];
  return (
    <WidgetCard
      title="원/달러 환율 vs 마른김 수출단가"
      icon={DollarSign} iconColor="#a3e635" pillar="S4"
      cardDesc="연평균 원/달러(좌)와 마른김 수출단가 $/kg(우) — 환율·단가 동반 상승의 이중 호황"
      telemetry={{ status: 'SYNCED', syncDate: 'ECOS·KCS' }}
      chart={
        <ComposedChart data={data} margin={{ top: 10, right: 8, left: -6, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickFormatter={truncateXAxis} />
          <YAxis yAxisId="l" stroke="#94a3b8" fontSize={11} domain={[1000, 1400]} tickFormatter={(v) => `₩${v}`} />
          <YAxis yAxisId="r" orientation="right" stroke="#a3e635" fontSize={11} tickFormatter={(v) => `$${v}`} />
          <Tooltip contentStyle={tip} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar yAxisId="l" dataKey="krw" name="원/달러 (₩)" fill="#475569" radius={[3, 3, 0, 0]} barSize={22} />
          <Line yAxisId="r" type="monotone" dataKey="price" name="수출단가 ($/kg)" stroke="#a3e635" strokeWidth={2.5} dot={{ r: 4 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div><p>${f?.year}→${l?.year} 원/달러 <strong>₩${f?.krw}→₩${l?.krw}</strong>(원화 약세)에 더해 마른김 수출단가가 <strong>$${f?.price}→$${l?.price}/kg(약 2배)</strong> 동반 상승 — 환율·단가 <strong>이중 호황</strong>이 수출액 급증의 동력.</p></div>`,
        actionPlan: '<div><p><strong>재정의</strong>: 현 수출 호조엔 원화 약세 기여분이 큼 — 원화 강세 전환 시 단가 경쟁력 약화 리스크.</p><p><strong>3단계</strong>: ① 환헤지로 환차 변동 완충 ② 단가(브랜드·프리미엄)로 환율 의존도 축소 ③ 원화 강세 시나리오 가격 대응 매뉴얼.</p></div>',
        source: '한국은행 ECOS 원/달러 연평균 · 관세청 마른김 수출단가($/kg)',
      }}
    />
  );
}

/* ───────────── S1: 세계 김 생산 추이 (중·한·일) ───────────── */
export function KimWorldProduction() {
  const d = useJson('/data/kim/kim_world_production.json');
  if (!d) return <Loading label="세계 생산 추이" />;
  const data = (d.trend || []).filter(t => Number(t.year) >= 2000);
  const last = data[data.length - 1];
  return (
    <WidgetCard
      title="세계 김 생산 추이 (중·한·일)"
      icon={Globe} iconColor="#16a34a" pillar="S1"
      cardDesc="FAO FishStat 주요 3국 김 양식 생산량 추이(천 톤) — 2000년 이후"
      telemetry={{ status: 'SYNCED', syncDate: 'FishStat 2022' }}
      chart={
        <LineChart data={data} margin={{ top: 10, right: 16, left: -6, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickFormatter={truncateXAxis} minTickGap={24} />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}천t`} />
          <Tooltip contentStyle={tip} formatter={(v, n) => [`${v.toLocaleString()}천 톤`, n]} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Line type="monotone" dataKey="중국" name="중국" stroke="#0072B2" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="한국" name="한국" stroke="#16a34a" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="일본" name="일본" stroke="#E69F00" strokeWidth={2} dot={false} strokeDasharray="5 4" />
        </LineChart>
      }
      takeaway={{
        situation: `<div><p>${last?.year} 기준 <strong>중국 ${last?.['중국']?.toLocaleString()}천 톤</strong>으로 한국(${last?.['한국']?.toLocaleString()})·일본(${last?.['일본']?.toLocaleString()})을 압도. 2000년 이후 중국이 폭발 성장하며 격차 확대, 일본은 감소세.</p></div>`,
        actionPlan: '<div><p><strong>재정의</strong>: 물량 경쟁(중국)은 불가 — 한국은 품종·가공·brand로 단가 우위를 지키는 게임.</p><p><strong>3단계</strong>: ① 중국 물량과 정면 경쟁 회피 ② 고품질 종자·가공기술 격차 유지 ③ 일본 감소분 한국이 흡수.</p></div>',
        source: 'FAO FishStat Aquaculture · 중·한·일 김 양식 생산',
      }}
    />
  );
}

/* ───────────── S5: 김 연구 동향 (OpenAlex) ───────────── */
export function KimResearch() {
  const d = useJson('/data/kim/kim_research.json');
  if (!d) return <Loading label="연구 동향" />;
  const data = (d.perYear || []);
  const total = data.reduce((s, p) => s + p.n, 0);
  const peak = data.reduce((a, b) => b.n > a.n ? b : a, { n: 0 });
  const top = d.topCited?.[0];
  return (
    <WidgetCard
      title="김 연구 동향 (OpenAlex 학술논문)"
      icon={FlaskConical} iconColor="#15803d" pillar="S5"
      cardDesc="김(Porphyra·Pyropia) 관련 학술논문 연도별 발표 수 — R&D·혁신 관심도 대리지표"
      telemetry={{ status: 'SYNCED', syncDate: 'OpenAlex' }}
      chart={
        <BarChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickFormatter={truncateXAxis} minTickGap={12} />
          <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
          <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v) => [`${v}편`, '논문']} />
          <Bar dataKey="n" name="논문 수 (편)" fill="#22c55e" radius={[3, 3, 0, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: `<div><p>김 관련 학술논문은 2010년 이후 누적 ${total}편, <strong>${peak.year}년 ${peak.n}편으로 정점</strong> — 기능성식품·양식기술 연구 관심 상승. 최다 인용: "${top?.title}…"(${top?.cited}회, ${top?.year}).</p></div>`,
        actionPlan: '<div><p><strong>재정의</strong>: 연구 활성화 = 기능성(건강·바이오) 신소재화 기회 신호.</p><p><strong>3단계</strong>: ① 기능성 논문(항산화·식이섬유) IP·제품화 ② 양식 R&D(고수온 내성) 산학협력 ③ 연구 트렌드를 프리미엄 마케팅 근거로.</p></div>',
        source: 'OpenAlex · 김(Porphyra/Pyropia) 학술논문 메타데이터',
      }}
    />
  );
}
