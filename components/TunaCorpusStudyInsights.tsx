/**
 * TunaCorpusStudyInsights — agri_data 코퍼스 교차 스터디에서 도출된 net-new 위젯.
 *
 * 출처: ~/tuna_rag 로컬 RAG 코퍼스(md 1,912건)를 bge-m3 임베딩 + qwen3-coder:30b /
 * gemma4:12b 교차 분석한 스터디 산출물(~/tuna_rag/study). 각 수치는 위젯화 전
 * 미러 원문(intelligence_reports/*)과 1:1 대조하여 검증함.
 *
 * - IotcTropicalTunaStockStatus (S1): IOTC SC28(2025) 열대참치 4종 자원상태
 * - AldfgGhostGearReadiness (S5): ISSF 2025-07 유실어구(ALDFG) POA 대응 프레임워크
 */
'use client';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ReferenceLine, LabelList,
} from 'recharts';
import { Activity, Waves } from 'lucide-react';
import WidgetCard from './WidgetCard';

// ─── Widget 1: IOTC 열대참치 자원상태 (S1) ──────────────────────────────────
// 출처: intelligence_reports/[1-A RFMO 자원평가] SC28 tuna stock-status executive
//       summaries (SC28-ES series).md — 종별 요약표 직접 추출.
// 판정 규칙(IOTC 공식): SB/SBMSY ≥ 1 → 자원량 건전 / F/FMSY ≤ 1 → 남획 아님.
const stockData = [
  { name: '가다랑어', sbRatio: 2.30, fRatio: 0.49, statusYear: '2022', catch: 624609, msy: 584 },
  { name: '황다랑어', sbRatio: 1.32, fRatio: 0.75, statusYear: '2023', catch: 489742, msy: 421 },
  { name: '눈다랑어', sbRatio: 0.98, fRatio: 0.94, statusYear: '2024', catch: 82874, msy: 100 },
  { name: '날개다랑어', sbRatio: 1.33, fRatio: 0.97, statusYear: '2023', catch: 37006, msy: 45 },
];

const StockTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 12px', color: 'var(--w-slate-50)', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.name} ({d.statusYear} 기준)</div>
      <div>산란자원비 (SB/SBMSY): <strong>{d.sbRatio.toFixed(2)}</strong> {d.sbRatio >= 1 ? '· 건전' : '· 목표 미달'}</div>
      <div>어획강도비 (F/FMSY): <strong>{d.fRatio.toFixed(2)}</strong> {d.fRatio <= 1 ? '· 남획 아님' : '· 남획'}</div>
      <div style={{ marginTop: 4, color: 'var(--w-slate-400)' }}>2024 어획량 {d.catch.toLocaleString()}톤 · MSY {d.msy.toLocaleString()}천톤</div>
    </div>
  );
};

export function IotcTropicalTunaStockStatus() {
  return (
    <WidgetCard
      title="인도양 열대참치 자원상태"
      icon={Activity}
      iconColor="#22d3ee"
      pillar="S1"
      cardDesc="IOTC 과학위원회 SC28(2025.12) 자원평가 - 4종별 산란자원비(SB/SBMSY)와 어획강도비(F/FMSY). 기준선 1.0: 자원비는 위, 어획비는 아래일수록 건전."
      termTooltip={{ term: 'SB/SBMSY · F/FMSY', description: 'SB/SBMSY=현재 산란자원량÷최대지속생산 자원량(≥1 건전). F/FMSY=현재 어획강도÷MSY 어획강도(≤1 남획 아님). IOTC Kobe 판정 2축.' }}
      telemetry={{ status: 'STATIC', syncDate: 'IOTC SC28 (2025-12)' }}
      kpiPanel={[
        { label: '가다랑어 자원비', value: '2.30', sub: 'SB/SBMSY · 4종 중 최건전', trendColor: '#10b981' },
        { label: '눈다랑어 어획비', value: '0.94', sub: 'F/FMSY · 남획 임계 근접', trendColor: '#f59e0b' },
      ]}
      chartHeight={300}
      chart={
        <BarChart data={stockData} margin={{ top: 20, right: 20, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--w-slate-300)', fontSize: 12 }} />
          <YAxis tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} domain={[0, 2.6]} label={{ value: '비율 (배)', angle: -90, position: 'insideLeft', fill: 'var(--w-slate-400)', fontSize: 11 }} />
          <Tooltip content={<StockTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine y={1} stroke="#f43f5e" strokeDasharray="5 4" label={{ value: '기준선 1.0', fill: '#f43f5e', fontSize: 10, position: 'right' }} />
          <Bar dataKey="sbRatio" name="산란자원비 (SB/SBMSY)" radius={[4, 4, 0, 0]}>
            {stockData.map((d, i) => <Cell key={i} fill={d.sbRatio >= 1 ? 'var(--w-emerald-500)' : 'var(--w-amber-500)'} />)}
            <LabelList dataKey="sbRatio" position="top" formatter={(v: any) => Number(v).toFixed(2)} fill="var(--w-slate-200)" fontSize={10} />
          </Bar>
          <Bar dataKey="fRatio" name="어획강도비 (F/FMSY)" radius={[4, 4, 0, 0]}>
            {stockData.map((d, i) => <Cell key={i} fill={d.fRatio <= 1 ? 'var(--w-sky-400)' : 'var(--w-red-500)'} />)}
            <LabelList dataKey="fRatio" position="top" formatter={(v: any) => Number(v).toFixed(2)} fill="var(--w-slate-200)" fontSize={10} />
          </Bar>
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>IOTC 과학위원회가 2025년 12월 확정한 최신 자원평가에서 인도양 <strong>열대참치 4종 모두 남획 상태가 아님(F/FMSY ≤ 1)</strong>으로 판정됐습니다. 다만 종별 여유도는 크게 갈립니다.</p>
<p>캔 원료인 <strong>가다랑어는 가장 건전</strong>합니다 - 산란자원비 2.30배, 어획강도비 0.49배로 자원·어획 양면 모두 여유. 2024년 어획량 62.5만톤으로 4종 중 최대.</p>
<p>반면 사시미 원료인 <strong>눈다랑어는 어획강도비 0.94배, 산란자원비 0.98배로 남획 임계에 가장 근접</strong>했습니다. 날개다랑어도 어획강도비 0.97배로 여유가 얇습니다. 두 종은 F가 조금만 더 오르면 남획 구간에 진입합니다.</p>
</div>`,
        actionPlan: `<div>
<p>눈다랑어·날개다랑어는 어획강도가 이미 상한 부근이라 IOTC가 향후 어획한도(TAC) 강화에 나설 여지가 큽니다. <strong>사시미 등급 눈다랑어 소싱은 규제 발동 전 선망·연승 물량을 선확보</strong>하고 공급국을 분산해 두는 편이 안전합니다.</p>
<p>가다랑어의 넓은 자원 여유(2.30배)는 캔 원료 가격·물량 안정 신호입니다. 캔 라인은 인도양 가다랑어 비중을 늘려 원료비 변동을 흡수하고, 임계 근접 종에 걸린 자본을 여유 종으로 이전하는 포트폴리오 재배치가 유효합니다.</p>
</div>`,
        source: 'IOTC Scientific Committee SC28-ES series (2025-12), Appendices 9–11',
      }}
    />
  );
}

// ─── Widget 2: ALDFG 유실어구 대응 프레임워크 (S5) ──────────────────────────
// 출처: intelligence_reports/ISSF 2025-07 Guidelines for Developing Plans of
//       Action on Managing Abandoned, Lost and Discarded Fishing Gear.
// 정량 지표가 없는 정성 프레임워크 위젯 — 차트 대신 구조도로 표현(수치 위조 금지).
const aldfgTypes = [
  { key: '유기(Abandoned)', desc: '회수 시도 없이 의도적으로 바다에 남긴 어구' },
  { key: '유실(Lost)', desc: '악천후·조업 사고로 통제를 벗어나 분실된 어구' },
  { key: '폐기(Discarded)', desc: '회수 의사 없이 해상에 버린 어구·부속' },
];
const poaSteps = [
  { n: '1', label: '범위 정의', desc: '어업·해역·어구 유형별 적용 범위 설정' },
  { n: '2', label: '측정가능 목표', desc: '기한이 있는 정량 목표·성과 지표 수립' },
  { n: '3', label: '활동·마일스톤', desc: '활동별 담당·예산·마일스톤 배정' },
  { n: '4', label: '대안 평가', desc: '어업 맥락 4기준 + 개별 조치 9기준으로 관리방안 비교' },
  { n: '5', label: '성과 점검·개선', desc: '정기 성과 평가 후 계획 갱신(적응 관리)' },
];

function AldfgBody() {
  return (
    <div style={{ padding: '4px 20px 8px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--w-slate-300)', marginBottom: 8 }}>유실어구 3유형 (해상 유출 경로)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {aldfgTypes.map((t) => (
            <div key={t.key} style={{ background: 'rgba(20,28,52,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#5eead4', marginBottom: 4 }}>{t.key}</div>
              <div style={{ fontSize: 11, color: 'var(--w-slate-400)', lineHeight: 1.5 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--w-slate-300)', marginBottom: 8 }}>POA-ALDFG 대응계획 5단계 (ISSF 2025-07 권고 구성)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {poaSteps.map((s) => (
            <div key={s.n} style={{ flex: '1 1 30%', minWidth: 150, background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(45,212,191,0.25)', borderRadius: 8, padding: '10px 12px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.n}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--w-slate-200)' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--w-slate-400)', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AldfgGhostGearReadiness() {
  return (
    <WidgetCard
      title="유실어구 대응 프레임워크"
      icon={Waves}
      iconColor="#2dd4bf"
      pillar="S5"
      cardDesc="ISSF 2025-07 유실어구(ALDFG) 관리계획 지침 - 참치 선망의 부유물집어장치(FAD)와 MSC 인증 요건에 직결되는 대응계획(POA) 구조. 정성 프레임워크(정량 지표 없음)."
      termTooltip={{ term: 'ALDFG · FAD · POA', description: 'ALDFG=유기·유실·폐기 어구(Abandoned, Lost and Discarded Fishing Gear). FAD=부유물집어장치. POA=대응계획(Plan of Action). 지침 근거: ISSF 2025-07.' }}
      telemetry={{ status: 'STATIC', syncDate: 'ISSF 2025-07' }}
      customBody={<AldfgBody />}
      takeaway={{
        situation: `<div>
<p>유실어구는 방치된 뒤에도 수년간 어류를 잡아 죽이는 <strong>유령어업(ghost fishing)</strong>을 일으키고, 미세플라스틱·독성물질을 먹이사슬에 전이시키며 서식처를 훼손합니다. ISSF 2025-07 지침은 이를 관리하는 대응계획(POA)의 표준 구성을 제시합니다.</p>
<p>참치 산업과 직결되는 지점은 둘입니다. 첫째, 열대참치 선망이 대량 사용하는 <strong>부유물집어장치(FAD)가 지침의 관리 대상에 포함</strong>됩니다. 둘째, <strong>MSC 어업표준은 유실어구·유령어업에 더 엄격한 요건</strong>을 부과하며, POA 수립이 이 요건 충족을 돕습니다.</p>
<p>지침은 어구 표식(gear marking)을 흔히 '만능 해법'처럼 제시하지만, 견고한 관리체계와 결합될 때만 효과가 있다고 명시합니다. 표식은 소유주 추적으로 유기·폐기를 억제하고 공급망 추적성과 생산자책임(EPR)을 가능하게 합니다.</p>
</div>`,
        actionPlan: `<div>
<p>MSC 인증을 확보·유지하려는 참치 소싱에서는 <strong>공급 어업의 FAD 회수·표식 체계를 vendor 평가 항목으로 표준화</strong>하는 것이 규제 선제 대응입니다. POA 5단계 중 '측정가능 목표'와 '성과 점검'을 계약 조건으로 요구하면 인증 심사 리스크를 낮춥니다.</p>
<p>어구 표식 기반 추적성은 규제 비용이 아니라 자산이 될 수 있습니다. 회수·표식 데이터를 확보한 공급선은 EU·미국의 유령어업 규제가 강화될 때 채널 접근을 유지하며, 표식된 지속가능 원료에 프리미엄을 붙일 근거가 됩니다.</p>
</div>`,
        source: 'ISSF 2025-07 Guidelines for Developing Plans of Action on Managing ALDFG',
      }}
    />
  );
}
