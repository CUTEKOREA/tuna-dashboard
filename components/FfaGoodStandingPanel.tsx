'use client';

/**
 * FFA 조업허가 선단 + VMS 주간 보고현황.
 *
 * 다른 등록부 탭들이 「누가 등록돼 있나」를 보여준다면, 이 탭은 **「누가 실제로 신호를
 * 보내고 있나」** 를 본다. 같은 배가 등록부에는 멀쩡히 있으면서 2주 내내 위치보고가
 * 0건일 수 있고, 그 어긋남이 이 자료에만 있다.
 */

import React from 'react';
import { AlertTriangle, Radio, Ship, Flag } from 'lucide-react';
import { Bar, CartesianGrid, ComposedChart, Legend, Tooltip, XAxis, YAxis, Cell } from 'recharts';

import { truncateXAxis } from '@/lib/chart-standards';
import {
  activeButShort,
  ffaBelowNorm,
  ffaKorea,
  ffaMeta,
  ffaNotReporting,
  ffaSummary,
  ffaTypeNorms,
  koreaHoldsByUnit,
  topFlags,
} from '@/lib/data/ffa-vrst';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TelemetryBadge from './TelemetryBadge';
import TermTooltip from './TermTooltip';

const BASE = '#0ea5e9';
const WARN = '#f59e0b';

const card: React.CSSProperties = {
  background: 'var(--dsc-surface, rgba(255,255,255,0.04))',
  border: '1px solid var(--dsc-surface-border, rgba(128,128,128,0.18))',
  borderRadius: 14,
  padding: '1rem 1.1rem',
  marginBottom: 18,
};
const h3: React.CSSProperties = { fontSize: '1rem', fontWeight: 700, margin: '0 0 2px' };
const desc: React.CSSProperties = { fontSize: '0.78rem', opacity: 0.72, margin: '0 0 12px' };
const cell: React.CSSProperties = {
  padding: '0.4rem 0.6rem',
  borderBottom: '1px solid var(--dsc-surface-border, rgba(128,128,128,0.15))',
  fontSize: '0.8rem',
  whiteSpace: 'nowrap',
};
const th: React.CSSProperties = { ...cell, fontWeight: 700, textAlign: 'left', opacity: 0.85 };

function Kpi({ icon, label, value, unit, sub }: {
  icon: React.ReactNode; label: string; value: number | string; unit: string; sub: string;
}) {
  return (
    <div style={{ ...card, marginBottom: 0, flex: '1 1 170px', minWidth: 160 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.8, fontSize: '0.78rem' }}>
        {icon}{label}
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, margin: '6px 0 2px' }}>
        {typeof value === 'number' ? value.toLocaleString('ko-KR') : value}
        <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.7, marginLeft: 4 }}>{unit}</span>
      </div>
      <div style={{ fontSize: '0.72rem', opacity: 0.62 }}>{sub}</div>
    </div>
  );
}

function Tip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.3)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#f8fafc' }}>
      <div style={{ marginBottom: 4, opacity: 0.75 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name} {typeof p.value === 'number' ? p.value.toLocaleString('ko-KR') : p.value}
        </div>
      ))}
    </div>
  );
}

export default function FfaGoodStandingPanel() {
  const flags = topFlags(8);
  const active = activeButShort();
  const holdsM3 = koreaHoldsByUnit('㎥');
  const holdsT = koreaHoldsByUnit('t');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px' }}>
            <Ship size={19} style={{ verticalAlign: -3, marginRight: 6 }} aria-hidden="true" />
            FFA 조업허가 선단과 위치보고 — {ffaMeta.기간}
          </h2>
          <p style={{ ...desc, marginBottom: 0, maxWidth: 780 }}>
            <TermTooltip term="FFA" description="태평양도서국포럼수산기구. 회원국 수역에서 조업할 자격(Good Standing)을 관리합니다." />
            {' '}회원국 수역 조업자격을 얻은 선박 전수와, 그 선박들의{' '}
            <TermTooltip term="VMS" description="선박위치추적장치. 위성으로 선박 위치를 정해진 주기마다 자동 보고합니다." />
            {' '}일별 위치보고 건수입니다. 자격이지 조업 실적이 아닙니다.
          </p>
        </div>
        <TelemetryBadge status="STATIC" syncDate={ffaMeta.기간.slice(-10)} label="주간 보고서" />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <Kpi icon={<Ship size={16} />} label="조업허가 선박" value={ffaSummary.총척수} unit="(척)" sub={`${ffaSummary.국기수}개 선적국`} />
        <Kpi icon={<Flag size={16} />} label="한국 선적" value={ffaSummary.한국척수} unit="(척)" sub="선망 22 · 운반 29 · 급유 2" />
        <Kpi icon={<Radio size={16} />} label="FFA 미보고 표기" value={ffaSummary.미보고척수} unit="(척)" sub="FFA 가 직접 표기한 수" />
        <Kpi icon={<AlertTriangle size={16} />} label="선종 표준 미달" value={ffaBelowNorm.length} unit="(척)" sub={`그중 ${active.length}척은 FFA 표기가 정상`} />
      </div>

      {/* 표기와 실제의 어긋남 — 이 자료의 값이 여기 있다 */}
      <section style={{ ...card, borderColor: 'rgba(245,158,11,0.35)' }}>
        <h3 style={h3}>정상 표기인데 보고가 모자란 선박 ({active.length}척)</h3>
        <p style={desc}>
          FFA 는 장비 상태를 정상(ACTIVE)으로 표기했지만, 실제 일별 보고건수의 중앙값이 같은 선종의
          표준 주기에 못 미치는 배입니다. 선종 표준은 다른 배들의 최빈 주기로 잡았습니다 —
          {ffaTypeNorms.filter((n) => n.표준주기 > 0).map((n) => `${n.선종} ${n.표준주기}건/일`).join(' · ')}.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>선명</th><th style={th}>선적</th><th style={th}>선종</th>
                <th style={{ ...th, textAlign: 'right' }}>자체 주기 (건/일)</th>
                <th style={{ ...th, textAlign: 'right' }}>선종 표준 (건/일)</th>
              </tr>
            </thead>
            <tbody>
              {active.map((r) => (
                <tr key={r.선명}>
                  <td style={cell}>{r.선명}</td>
                  <td style={cell}>{r.국기}</td>
                  <td style={cell}>{r.선종}</td>
                  <td style={{ ...cell, textAlign: 'right', color: WARN, fontWeight: 700 }}>{r.자체주기}</td>
                  <td style={{ ...cell, textAlign: 'right', opacity: 0.7 }}>{r.선종표준}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        <section style={card}>
          <h3 style={h3}>선적국별 조업허가 선박 (척)</h3>
          <p style={desc}>상위 8개국과 그 외. 노란 막대가 한국입니다.</p>
          <SafeResponsiveContainer width="100%" height={280}>
            <ComposedChart data={flags} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="var(--mu-grid, rgba(148,163,184,0.15))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="국기" tickFormatter={truncateXAxis} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="척수" name="선박 (척)">
                {flags.map((f) => <Cell key={f.국기} fill={f.국기 === '한국' ? WARN : BASE} />)}
              </Bar>
            </ComposedChart>
          </SafeResponsiveContainer>
        </section>

        <section style={card}>
          <h3 style={h3}>한국 선망선 선주별 (척)</h3>
          <p style={desc}>
            등록부 표기가 흔들려(&ldquo;Silla Co., Ltd&rdquo; / &ldquo;Silla Co. Ltd&rdquo; 등) 법인격 접미를 지우고 묶었습니다.
            괄호는 원본에 있던 표기 가짓수입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>선주</th>
                  <th style={{ ...th, textAlign: 'right' }}>척수</th>
                  <th style={th}>선박</th>
                </tr>
              </thead>
              <tbody>
                {ffaKorea.선주별.map((o) => (
                  <tr key={o.선주}>
                    <td style={cell}>
                      {o.선주}
                      {o.표기수 > 1 && <span style={{ opacity: 0.6 }}> ({o.표기수}가지 표기)</span>}
                    </td>
                    <td style={{ ...cell, textAlign: 'right', fontWeight: 700 }}>{o.척수}</td>
                    <td style={{ ...cell, whiteSpace: 'normal', fontSize: '0.74rem', opacity: 0.8 }}>
                      {o.선박.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section style={card}>
        <h3 style={h3}>FFA 가 미보고로 표기한 선박 ({ffaNotReporting.length}척)</h3>
        <p style={desc}>
          결손일은 자체 주기에 못 미친 날이며, 무보고일보다 적게 세지 않습니다.
          적용일은 등록일 이후의 날만 셉니다 — 기간 중에 등록한 배가 등록 전 날짜까지 결손으로 잡히지 않도록.
        </p>
        <div style={{ overflowX: 'auto', maxHeight: 420 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>선명</th><th style={th}>선적</th><th style={th}>선종</th>
                <th style={{ ...th, textAlign: 'right' }}>무보고일</th>
                <th style={{ ...th, textAlign: 'right' }}>결손일</th>
                <th style={{ ...th, textAlign: 'right' }}>적용일</th>
                <th style={th}>FFA 표기 사유</th>
              </tr>
            </thead>
            <tbody>
              {ffaNotReporting.map((r) => (
                <tr key={r.선명}>
                  <td style={{ ...cell, color: r.국기 === '한국' ? WARN : undefined, fontWeight: r.국기 === '한국' ? 700 : 400 }}>{r.선명}</td>
                  <td style={cell}>{r.국기}</td>
                  <td style={cell}>{r.선종}</td>
                  <td style={{ ...cell, textAlign: 'right' }}>{r.무보고일}</td>
                  <td style={{ ...cell, textAlign: 'right', fontWeight: 700 }}>{r.결손일}</td>
                  <td style={{ ...cell, textAlign: 'right', opacity: 0.65 }}>{r.적용일}</td>
                  <td style={{ ...cell, fontSize: '0.74rem', opacity: 0.8 }}>{r.사유}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={card}>
        <h3 style={h3}>한국 선단 어창 용량</h3>
        <p style={desc}>
          ⚠ 원본이 부피(㎥ · {holdsM3.length}척)와 무게(t · {holdsT.length}척) 두 단위를 섞어 적었습니다.
          변환 계수가 어종·동결방식마다 달라 **합치거나 한 축에 얹지 않고** 단위별로 나눠 둡니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {[{ u: '㎥', rows: holdsM3 }, { u: 't', rows: holdsT }].map(({ u, rows }) => (
            <div key={u}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 6 }}>{u} 표기 ({rows.length}척)</div>
              <div style={{ overflowX: 'auto', maxHeight: 260 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={th}>선명</th><th style={th}>선종</th>
                      <th style={{ ...th, textAlign: 'right' }}>용량 ({u})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((h) => (
                      <tr key={h.선명}>
                        <td style={cell}>{h.선명}</td>
                        <td style={cell}>{h.선종}</td>
                        <td style={{ ...cell, textAlign: 'right' }}>{h.용량.toLocaleString('ko-KR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p style={{ fontSize: '0.74rem', opacity: 0.62, lineHeight: 1.7 }}>
        출처: {ffaMeta.출처} · 기간 {ffaMeta.기간} · 등급 {ffaMeta.등급}<br />
        {ffaMeta.주의}<br />
        측정 경계: {ffaMeta.측정경계}<br />
        갱신: <code>{ffaMeta.갱신방법}</code>
      </p>
    </div>
  );
}
