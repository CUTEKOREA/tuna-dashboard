/**
 * 「시장 이해 > 오징어」 맨 위 현황판 - 해부보고서 2026년 10월판 표 13개를 한 화면에 모은다.
 *
 * 수치는 `data/squid_status_board.json` 하나에서 온다(보고서 표를 옮긴 정적 값, 라이브 쿼리 없음).
 * 계열·기준이 다른 수치는 합산하지 않고, 부분연도(2026년 1~8월)는 점선·빈 점으로 따로 표시한다.
 * 차트는 고정 viewBox SVG 라 크기 측정이 없고, 툴팁은 SVG <title>(네이티브)로 둔다.
 */
'use client';

import React from 'react';

import { SQUID_STATUS_BOARD as D } from '@/lib/data/squid-status-board';
import { SERIES, SERIES_OTHER } from '@/lib/chart-palette';

import styles from './SquidStatusBoard.module.css';

const C0 = SERIES[0];
const C1 = SERIES[1];
const C2 = SERIES[2];
const C3 = SERIES[3];
const MUTED = SERIES_OTHER;

const fmt = (n: number) => n.toLocaleString('ko-KR');
const lin = (d0: number, d1: number, r0: number, r1: number) => (v: number) =>
  r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
const shortPeriod = (p: string) => p.replace(' 1~8월', '.1~8');
const isPartial = (p: string) => p.includes('월');

function Svg({ w, h, label, children }: { w: number; h: number; label: string; children: React.ReactNode }) {
  return (
    <svg className={styles.svg} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      {children}
    </svg>
  );
}

/* A. 공급 세 갈래 - 갈래마다 축이 다르다 */
function SupplyMini({ k, name, color }: { k: 'import_t' | 'distant_t' | 'coastal_t'; name: string; color: string }) {
  const W = 220, H = 150, top = 26, bot = 20;
  const rows = D.supply.map((r) => ({ y: String(r.year), v: r[k] }));
  const max = Math.max(...rows.map((r) => r.v)) * 1.15;
  const y = lin(0, max, H - bot, top);
  const bw = (W - 12) / rows.length;
  const last = rows[rows.length - 1];
  return (
    <Svg w={W} h={H} label={`${name} 연도별 톤`}>
      <text x={4} y={13} className={styles.strong}>{name}</text>
      {rows.map((r, i) => (
        <g key={r.y}>
          <rect x={6 + i * bw + bw * 0.14} width={bw * 0.72} y={y(r.v)} height={y(0) - y(r.v)} rx={3}
                fill={i === rows.length - 1 ? color : MUTED} opacity={i === rows.length - 1 ? 1 : 0.55}>
            <title>{`${name} ${r.y}: ${fmt(r.v)} t`}</title>
          </rect>
          <text x={6 + i * bw + bw / 2} y={H - 6} textAnchor="middle">{r.y}</text>
        </g>
      ))}
      <text x={6 + (rows.length - 1) * bw + bw / 2} y={y(last.v) - 5} textAnchor="middle" className={styles.strong}>
        {fmt(last.v)}
      </text>
    </Svg>
  );
}

/* B1. 수입액 증가 분해 워터폴 */
function Waterfall() {
  const W = 400, H = 220, l = 40, r = 8, top = 20, bot = 34;
  let run = 0;
  const rows = D.decomp.map((d) => {
    const a = d.kind === 'delta' ? run : 0;
    const b = d.kind === 'delta' ? run + d.value_musd : d.value_musd;
    run = b;
    return { ...d, a, b };
  });
  const y = lin(0, 800, H - bot, top);
  const bw = (W - l - r) / rows.length;
  return (
    <Svg w={W} h={H} label="수입액 증가 분해, 백만 달러">
      {[0, 200, 400, 600, 800].map((t) => (
        <g key={t}>
          <line x1={l} x2={W - r} y1={y(t)} y2={y(t)} className={styles.grid} />
          <text x={l - 6} y={y(t) + 4} textAnchor="end">{fmt(t)}</text>
        </g>
      ))}
      {rows.map((d, i) => {
        const x = l + i * bw + bw * 0.15;
        const fill = d.step === '단가 효과' ? C0 : d.kind === 'delta' ? C3 : MUTED;
        const lab = (d.kind === 'delta' ? '+' : '') + fmt(d.value_musd);
        return (
          <g key={d.step}>
            <rect x={x} width={bw * 0.7} y={y(d.b)} height={Math.max(1, y(d.a) - y(d.b))} rx={3} fill={fill}>
              <title>{`${d.step}: ${lab} 백만 USD`}</title>
            </rect>
            <text x={x + bw * 0.35} y={y(d.b) - 5} textAnchor="middle" className={styles.strong}>{lab}</text>
            <text x={x + bw * 0.35} y={H - 14} textAnchor="middle">{d.step}</text>
          </g>
        );
      })}
    </Svg>
  );
}

/* B2·C2. 연도 선 그래프 - 부분연도는 선에서 빼고 빈 점 */
function YearLine({ rows, d0, d1, ticks, color, label, digits, peak }: {
  rows: { p: string; v: number }[]; d0: number; d1: number; ticks: number[]; color: string;
  label: string; digits: number; peak?: boolean;
}) {
  const W = 400, H = 200, l = 42, r = 16, top = 22, bot = 26;
  const step = (W - l - r - 12) / (rows.length - 1);
  const x = (i: number) => l + 6 + i * step;
  const y = lin(d0, d1, H - bot, top);
  const f = (v: number) => (digits ? v.toFixed(digits) : fmt(v));
  const full = rows.map((r, i) => ({ ...r, i })).filter((r) => !isPartial(r.p));
  const mark = peak ? full.reduce((a, b) => (b.v > a.v ? b : a)) : full[full.length - 1];
  return (
    <Svg w={W} h={H} label={label}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={l} x2={W - r} y1={y(t)} y2={y(t)} className={styles.grid} />
          <text x={l - 6} y={y(t) + 4} textAnchor="end">{digits ? t.toFixed(1) : fmt(t)}</text>
        </g>
      ))}
      <polyline points={full.map((r) => `${x(r.i)},${y(r.v)}`).join(' ')} fill="none" stroke={color}
                strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {rows.map((r, i) => {
        const part = isPartial(r.p);
        return (
          <g key={r.p}>
            <circle cx={x(i)} cy={y(r.v)} r={4} fill={part ? 'none' : color} stroke={color} strokeWidth={2}>
              <title>{`${r.p}${part ? ' (부분연도)' : ''}: ${f(r.v)}`}</title>
            </circle>
            <text x={x(i)} y={H - 8} textAnchor="middle">{shortPeriod(r.p)}</text>
          </g>
        );
      })}
      <text x={x(mark.i)} y={y(mark.v) - 10} textAnchor="middle" className={styles.strong}>{f(mark.v)}</text>
    </Svg>
  );
}

/* B3. 유통 단계 계단 */
function ChainStairs() {
  const rows = D.chain;
  const W = 420, l = 70, r = 52, rowH = 34, H = rows.length * rowH + 26;
  const max = Math.max(...rows.map((d) => d.price_krw));
  const x = lin(0, max, l, W - r);
  return (
    <Svg w={W} h={H} label="수입 냉동 오징어 1kg 단계별 누계 가격, 원">
      {[0, 4000, 8000, 12000].map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={4} y2={H - 20} className={styles.grid} />
          <text x={x(t)} y={H - 6} textAnchor="middle">{fmt(t)}</text>
        </g>
      ))}
      {rows.map((d, i) => {
        const yy = 6 + i * rowH, bh = rowH * 0.62;
        const fill = d.stage === '소매상' ? C0 : d.stage.includes('관세') ? C3 : C1;
        return (
          <g key={d.stage}>
            <rect x={x(0)} y={yy} height={bh} width={x(d.price_krw - d.add_krw) - x(0)} fill={MUTED} opacity={0.3} rx={3} />
            <rect x={x(d.price_krw - d.add_krw)} y={yy} height={bh} rx={3} fill={fill}
                  width={Math.max(2, x(d.price_krw) - x(d.price_krw - d.add_krw))}>
              <title>{`${d.stage}: +${fmt(d.add_krw)}원 → ${fmt(d.price_krw)}원/kg${d.margin_krw ? ` · 이윤 ${fmt(d.margin_krw)}원` : ''}`}</title>
            </rect>
            <text x={l - 8} y={yy + bh / 2 + 4} textAnchor="end" className={styles.strong}>{d.stage}</text>
            <text x={x(d.price_krw) + 6} y={yy + bh / 2 + 4}>{fmt(d.price_krw)}</text>
          </g>
        );
      })}
    </Svg>
  );
}

/* C1. 원산지 덤벨 */
function OriginDumbbell() {
  const rows = D.origins;
  const W = 420, l = 70, r = 44, rowH = 28, H = rows.length * rowH + 28;
  const x = lin(0, 55, l, W - r);
  return (
    <Svg w={W} h={H} label="원산지 비중 2020·2025·2026년 1~8월, 퍼센트">
      {[0, 10, 20, 30, 40, 50].map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={4} y2={H - 20} className={styles.grid} />
          <text x={x(t)} y={H - 6} textAnchor="middle">{t}%</text>
        </g>
      ))}
      {rows.map((d, i) => {
        const cy = 18 + i * rowH;
        const tip = `${d.country}: 2020 ${d.s2020 ?? '-'}% · 2025 ${d.s2025}% · 2026.1~8 ${d.s2026 ?? '-'}%`;
        const right = Math.max(d.s2020 ?? 0, d.s2025, d.s2026 ?? 0);
        return (
          <g key={d.country}>
            <title>{tip}</title>
            {d.s2020 !== null && (
              <>
                <line x1={x(d.s2020)} x2={x(d.s2025)} y1={cy} y2={cy} strokeWidth={2}
                      stroke={d.s2025 > d.s2020 ? C0 : MUTED} />
                <circle cx={x(d.s2020)} cy={cy} r={4} fill={MUTED} />
              </>
            )}
            {d.s2026 !== null && <circle cx={x(d.s2026)} cy={cy} r={4} fill="none" stroke={C0} strokeWidth={1.5} />}
            <circle cx={x(d.s2025)} cy={cy} r={5} fill={C0} />
            <text x={l - 8} y={cy + 4} textAnchor="end" className={styles.strong}>{d.country}</text>
            <text x={x(right) + 8} y={cy + 4}>{d.s2025}%</text>
          </g>
        );
      })}
    </Svg>
  );
}

/* F1. 시도별 양방향 막대 - 왼쪽 생산량, 오른쪽 업소 수 */
function RegionButterfly() {
  const rows = D.regions;
  const W = 420, l = 70, rowH = 26, H = rows.length * rowH + 24, mid = l + (W - l) / 2;
  const xl = lin(0, Math.max(...rows.map((d) => d.prod_t)), mid - 4, l + 40);
  const xr = lin(0, Math.max(...rows.map((d) => d.firms)), mid + 4, W - 30);
  return (
    <Svg w={W} h={H} label="상위 8개 시도 생산량과 업소 수">
      <text x={mid - 4} y={12} textAnchor="end">생산량 t</text>
      <text x={mid + 4} y={12}>업소 수</text>
      {rows.map((d, i) => {
        const yy = 20 + i * rowH, bh = rowH * 0.7;
        return (
          <g key={d.region}>
            <rect x={xl(d.prod_t)} width={xl(0) - xl(d.prod_t)} y={yy} height={bh} rx={3}
                  fill={d.region === '부산' ? C0 : MUTED} opacity={d.region === '부산' ? 1 : 0.55}>
              <title>{`${d.region}: ${fmt(d.prod_t)} t · 업소당 ${d.per_firm} t`}</title>
            </rect>
            <rect x={xr(0)} width={xr(d.firms) - xr(0)} y={yy} height={bh} rx={3}
                  fill={d.region === '경기' ? C2 : MUTED} opacity={d.region === '경기' ? 1 : 0.55}>
              <title>{`${d.region}: ${fmt(d.firms)}곳`}</title>
            </rect>
            <text x={l - 8} y={yy + bh / 2 + 4} textAnchor="end" className={styles.strong}>{d.region}</text>
            <text x={xl(d.prod_t) - 4} y={yy + bh / 2 + 4} textAnchor="end">{fmt(d.prod_t)}</text>
            <text x={xr(d.firms) + 4} y={yy + bh / 2 + 4}>{d.firms}</text>
          </g>
        );
      })}
    </Svg>
  );
}

/* F2. 수입 명의 × 가공 명부 일치율 */
function OverlapBars() {
  const rows = D.overlap;
  const W = 420, l = 84, rowH = 32, H = rows.length * rowH + 20;
  const x = lin(0, 30, l, W - 90);
  return (
    <Svg w={W} h={H} label="수입 유형별 가공 명부 일치율">
      {[0, 10, 20, 30].map((t) => (
        <text key={t} x={x(t)} y={H - 4} textAnchor="middle">{t}%</text>
      ))}
      {rows.map((d, i) => {
        const yy = 4 + i * rowH, bh = rowH * 0.62;
        return (
          <g key={d.type}>
            <rect x={x(0)} y={yy} height={bh} width={x(d.rate) - x(0)} rx={3}
                  fill={i === 0 ? C0 : MUTED} opacity={i === 0 ? 1 : 0.55}>
              <title>{`${d.type}: ${d.matched} / ${d.total} 명의 · ${d.rate}%`}</title>
            </rect>
            <text x={l - 8} y={yy + bh / 2 + 4} textAnchor="end" className={styles.strong}>{d.type}</text>
            <text x={x(d.rate) + 6} y={yy + bh / 2 + 4}>{`${d.rate}% (${d.matched}/${d.total})`}</text>
          </g>
        );
      })}
    </Svg>
  );
}

function Card({ title, note, children, wide }: { title: string; note: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`${styles.card} ${wide ? styles.wide : ''}`}>
      <h4>{title}</h4>
      <p className={styles.note}>{note}</p>
      {children}
    </div>
  );
}

const FLOW = ['산지', '수입', '가공', '유통', '조달', '소비'];

export default function SquidStatusBoard() {
  const dc = Object.fromEntries(D.decomp.map((d) => [d.step, d.value_musd]));
  const shut = new Set(D.closed.map((c) => c.stage));
  return (
    <section className={styles.board} aria-labelledby="squid-board-title">
      <header className={styles.head}>
        <h2 id="squid-board-title">한국 오징어 산업 현황판</h2>
        <p className={styles.lede}>
          2020년에서 2025년 사이 수입액은 <b>{fmt(dc['2020 수입액'])}</b>백만 달러에서{' '}
          <b>{fmt(dc['2025 수입액'])}</b>백만 달러로 늘었고, 증가분의 대부분은 물량(+{fmt(dc['물량 효과'])})이 아니라
          단가(+{fmt(dc['단가 효과'])})에서 나왔다. 공급처는 중국에서 남미로 옮겨 가는 중이다.
        </p>
        <p className={styles.src}>
          해부보고서 2026년 10월판 표를 옮긴 값({D._meta.as_of} 기준). 계열·기준이 다른 수치는 합산하지 않는다.
          점선 테두리·빈 점은 2026년 1~8월 부분연도.
        </p>
      </header>

      <div className={styles.kpis}>
        {D.kpi.map((k) => (
          <div key={k.key} className={`${styles.kpi} ${k.basis.includes('부분연도') ? styles.partial : ''}`}>
            <span className={styles.kl}>{k.label}</span>
            <span className={styles.kv}>
              {Number.isInteger(k.value) ? fmt(k.value) : k.value.toFixed(k.value < 10 ? 2 : 1)}
              <small>{k.unit}</small>
            </span>
            <span className={styles.kn}>{k.note}</span>
            <span className={styles.kb}>{k.basis}</span>
          </div>
        ))}
      </div>

      <h3 className={styles.sec}>공급은 세 갈래로 들어온다 <span>연도별 t · 갈래마다 축이 다르다</span></h3>
      <Card wide title="수입 · 원양 · 연근해"
            note="세 계열은 통계원이 다르다. 같은 축에 쌓지 않고 나란히 놓았다. 연근해는 2024년 1960년 이후 최저, 2025년 잠정치에서 반등.">
        <div className={styles.multi}>
          <SupplyMini k="import_t" name="수입" color={C0} />
          <SupplyMini k="distant_t" name="원양" color={C1} />
          <SupplyMini k="coastal_t" name="연근해 살오징어" color={C2} />
        </div>
      </Card>

      <h3 className={styles.sec}>왜 비싸졌나 <span>수입액 분해 · 단가 · 유통 단계</span></h3>
      <div className={styles.grid3}>
        <Card title="수입액 증가 분해 2020 → 2025"
              note="백만 USD. 2020년 단가로 늘어난 물량 몫과, 2025년 물량에 오른 단가 몫.">
          <Waterfall />
        </Card>
        <Card title="수입 통관단가" note="USD/kg. 2026년은 1~8월 부분연도(빈 점)라 연간값과 직접 비교하지 않는다.">
          <YearLine rows={D.imports.map((r) => ({ p: r.period, v: r.unit_usd_kg }))} d0={2} d1={4.5}
                    ticks={[2, 2.5, 3, 3.5, 4, 4.5]} color={C0} label="수입 통관단가 USD/kg" digits={2} />
        </Card>
        <Card title="수입 냉동 오징어 1kg이 소매에 닿기까지"
              note="원/kg, 중품, 2024 실태조사. 막대 끝이 단계 누계 가격, 진한 칸이 그 단계에서 더해진 몫.">
          <ChainStairs />
        </Card>
      </div>

      <h3 className={styles.sec}>조달선 <span>금액 기준 원산지 비중</span></h3>
      <div className={styles.grid2}>
        <Card title="원산지 비중 2020 → 2025"
              note="%. 회색 점 2020, 색 점 2025, 빈 점 2026년 1~8월. 중국 몫이 페루·칠레·에콰도르로 옮겨 갔다.">
          <OriginDumbbell />
        </Card>
        <Card title="원산지 집중도(HHI)" note="상위 12개국 비중 제곱합(전체 HHI의 하한). 2024년 정점 뒤 2025년 크게 분산.">
          <YearLine rows={D.hhi.map((r) => ({ p: r.period, v: r.hhi }))} d0={2000} d1={3200}
                    ticks={[2000, 2400, 2800, 3200]} color={C1} label="원산지 허핀달 지수" digits={0} peak />
        </Card>
      </div>

      <h3 className={styles.sec}>가공과 경쟁 <span>2025 식약처 생산실적 · 수입 명의 대조</span></h3>
      <div className={styles.grid2}>
        <Card title="업소는 경기, 물량은 부산"
              note="상위 8개 시도. 왼쪽 생산량(t), 오른쪽 업소 수. 경기는 업소가 가장 많고 업소당 물량은 가장 적다.">
          <RegionButterfly />
        </Card>
        <Card title="수입 명의가 가공 명부와 겹치는 비율" note="수입 유형별, 상호 일치 기준. 소유관계나 물량 이동을 뜻하지 않는다.">
          <OverlapBars />
        </Card>
      </div>

      <h3 className={styles.sec}>닫힌 칸 <span>업체별 물량이 공개자료에서 사라지는 자리</span></h3>
      <Card wide title="가치사슬에서 닫힌 자리"
            note="빗금 칸은 데이터가 없는 게 아니라 법·공표 규정·데이터 설계 때문에 닫혀 있다. 거래로도 열리지 않는다.">
        <div className={styles.flow} aria-label="가치사슬 흐름">
          {FLOW.map((s, i) => (
            <React.Fragment key={s}>
              <b className={shut.has(s) ? styles.shut : undefined}>{s}</b>
              {i < FLOW.length - 1 && <span aria-hidden>→</span>}
            </React.Fragment>
          ))}
        </div>
        <div className={styles.closed}>
          {D.closed.map((c) => (
            <div key={c.system} className={styles.gap}>
              <span className={styles.gst}>{c.stage}</span>
              <span className={styles.gsy}>{c.system}</span>
              <span className={styles.ghw}>{c.how}</span>
              <span className={styles.gbs}>{c.basis}</span>
            </div>
          ))}
        </div>
      </Card>

      <h3 className={styles.sec}>지켜볼 지표 <span>보고서 16절 · 갈래별</span></h3>
      <div className={styles.card}>
        <div className={styles.tblWrap} tabIndex={0} role="region" aria-label="지켜볼 지표 표">
          <table className={styles.tbl}>
            <thead>
              <tr><th>갈래</th><th>지표</th><th>지금 값</th><th className={styles.hideSm}>어디서 보나</th></tr>
            </thead>
            <tbody>
              {D.watch.map((w) => (
                <tr key={w.indicator}>
                  <td><span className={styles.pill}>{w.branch}</span></td>
                  <td>{w.indicator}</td>
                  <td>{w.now}</td>
                  <td className={styles.hideSm}>{w.where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
