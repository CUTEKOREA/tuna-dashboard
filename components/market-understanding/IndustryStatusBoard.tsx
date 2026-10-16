/**
 * 시장 이해 품목 현황판 - 히어로 바로 아래에 해부보고서 표를 한 화면으로 모은다.
 *
 * 품목마다 스펙 JSON(lib/data/industry-status-boards) 하나만 쓰고, 그리는 규칙은 여기 한 곳에 둔다.
 * 계열·기준이 다른 수치는 합산하지 않는다(작은 차트를 나란히, 축은 각자). 부분연도는 점선·빈 점.
 * 차트는 고정 viewBox SVG 라 크기 측정이 없고, 툴팁은 SVG <title>(네이티브)이다.
 */
'use client';

import React from 'react';

import { SERIES, SERIES_OTHER } from '@/lib/chart-palette';
import { industryStatusBoard, type BoardCard, type BoardChart } from '@/lib/data/industry-status-boards';

import styles from './IndustryStatusBoard.module.css';

const MUTED = SERIES_OTHER;
const fmt = (n: number, d?: number) =>
  n.toLocaleString('ko-KR', d === undefined ? { maximumFractionDigits: 2 } : { minimumFractionDigits: d, maximumFractionDigits: d });
const lin = (d0: number, d1: number, r0: number, r1: number) => (v: number) =>
  d1 === d0 ? r0 : r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
const shortX = (x: string) => x.replace(/ ?(\d+)~(\d+)월/, '.$1~$2');

/** 0 을 포함하는 깔끔한 눈금 4~5개 */
function ticks(lo: number, hi: number): number[] {
  const span = hi - lo || 1;
  const raw = span / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= 5) ?? raw;
  const out: number[] = [];
  for (let t = Math.floor(lo / step) * step; ; t += step) {
    out.push(Number(t.toPrecision(12)));
    if (t >= hi - step * 1e-9) break;
  }
  return out;
}

/** 눈금 라벨: every 칸마다, 마지막은 앞 라벨과 반 칸 이상 떨어질 때만 */
const showTick = (i: number, n: number, every: number) =>
  i % every === 0 || (i === n - 1 && (n - 1) % every >= every / 2);

function Svg({ w, h, label, children }: { w: number; h: number; label: string; children: React.ReactNode }) {
  return (
    <svg className={styles.svg} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      {children}
    </svg>
  );
}

/* 연도 막대 - 계열 여럿이면 축을 따로 둔 작은 차트를 나란히 */
function Bars({ c, W: WW = 420 }: { c: Extract<BoardChart, { type: 'bars' }>; W?: number }) {
  return (
    <div className={c.series.length > 1 ? styles.multi : undefined}>
      {c.series.map((s, si) => {
        const W = c.series.length > 1 ? 240 : WW, H = c.series.length > 1 ? 160 : 210, top = 26, bot = 20;
        const vals = s.points.map((p) => p.v);
        const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals) * 1.15 || 1;
        const y = lin(lo, hi, H - bot, top);
        const bw = (W - 12) / s.points.length;
        const color = SERIES[si % SERIES.length];
        const lastFull = s.points.map((p) => !p.partial).lastIndexOf(true);
        const every = Math.ceil(s.points.length / (W / 44));
        return (
          <Svg key={s.name} w={W} h={H} label={`${s.name} (${c.unit})`}>
            <text x={4} y={13} className={styles.strong}>{s.name}</text>
            <line x1={4} x2={W - 4} y1={y(0)} y2={y(0)} className={styles.grid} />
            {s.points.map((p, i) => {
              const hl = i === lastFull;
              const x = 6 + i * bw + bw * 0.14;
              return (
                <g key={p.x}>
                  <rect x={x} width={bw * 0.72} y={Math.min(y(p.v), y(0))} height={Math.abs(y(0) - y(p.v))} rx={3}
                        fill={p.partial ? 'none' : hl ? color : MUTED} opacity={hl || p.partial ? 1 : 0.55}
                        stroke={p.partial ? color : 'none'} strokeDasharray={p.partial ? '3 2' : undefined}>
                    <title>{`${s.name} ${p.x}${p.partial ? ' (부분)' : ''}: ${fmt(p.v, s.digits ?? c.digits)} ${c.unit}`}</title>
                  </rect>
                  {showTick(i, s.points.length, every) && (
                    <text x={x + bw * 0.36} y={H - 6} textAnchor="middle">{shortX(p.x)}</text>
                  )}
                  {hl && (
                    <text x={x + bw * 0.36} y={y(p.v) - 5} textAnchor="middle" className={styles.strong}>{fmt(p.v, s.digits ?? c.digits)}</text>
                  )}
                </g>
              );
            })}
          </Svg>
        );
      })}
    </div>
  );
}

/* 선 - 부분 구간은 선에서 빼고 빈 점 */
function Line({ c, W = 420 }: { c: Extract<BoardChart, { type: 'line' }>; W?: number }) {
  const H = 210, l = 46, r = 16, top = 24, bot = 26;
  const xs = [...new Set(c.series.flatMap((s) => s.points.map((p) => p.x)))];
  const vals = c.series.flatMap((s) => s.points.map((p) => p.v));
  const pad = (Math.max(...vals) - Math.min(...vals)) * 0.12 || Math.abs(vals[0]) * 0.1 || 1;
  const tk = ticks(Math.min(...vals) - pad, Math.max(...vals) + pad);
  const y = lin(tk[0], tk[tk.length - 1], H - bot, top);
  const step = (W - l - r - 12) / Math.max(1, xs.length - 1);
  const x = (k: string) => l + 6 + xs.indexOf(k) * step;
    const every = Math.ceil(xs.length / 7);
  return (
    <Svg w={W} h={H} label={`${c.series.map((s) => s.name).join(', ')} (${c.unit})`}>
      {tk.map((t) => (
        <g key={t}>
          <line x1={l} x2={W - r} y1={y(t)} y2={y(t)} className={styles.grid} />
          <text x={l - 6} y={y(t) + 4} textAnchor="end">{fmt(t)}</text>
        </g>
      ))}
      {xs.map((k, i) => showTick(i, xs.length, every) && (
        <text key={k} x={x(k)} y={H - 8} textAnchor="middle">{shortX(k)}</text>
      ))}
      {c.series.map((s, si) => {
        const color = SERIES[si % SERIES.length];
        const full = s.points.filter((p) => !p.partial);
        const mark = full.length
          ? (c.mark === 'peak' ? full.reduce((a, b) => (b.v > a.v ? b : a)) : full[full.length - 1])
          : undefined;
        return (
          <g key={s.name}>
            <polyline points={full.map((p) => `${x(p.x)},${y(p.v)}`).join(' ')} fill="none" stroke={color}
                      strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {s.points.map((p) => (
              <circle key={p.x} cx={x(p.x)} cy={y(p.v)} r={3.5} fill={p.partial ? 'none' : color} stroke={color} strokeWidth={2}>
                <title>{`${s.name} ${p.x}${p.partial ? ' (부분)' : ''}: ${fmt(p.v, s.digits ?? c.digits)} ${c.unit}`}</title>
              </circle>
            ))}
            {mark && <text x={x(mark.x)} y={y(mark.v) - 9} textAnchor="middle" className={styles.strong}>{fmt(mark.v, s.digits ?? c.digits)}</text>}
          </g>
        );
      })}
      {c.series.length > 1 && c.series.map((s, si) => (
        <g key={`lg-${s.name}`} transform={`translate(${l + si * 110}, 8)`}>
          <rect width={10} height={3} y={-4} fill={SERIES[si % SERIES.length]} />
          <text x={14} y={0}>{s.name}</text>
        </g>
      ))}
    </Svg>
  );
}

/* 가로 막대 - 음수 허용 */
function HBars({ c, W = 420 }: { c: Extract<BoardChart, { type: 'hbars' }>; W?: number }) {
  const rowH = 30, H = c.rows.length * rowH + 8;
  const l = Math.min(W * 0.4, 14 + Math.max(...c.rows.map((d) => d.label.length)) * 11.5);
  const vals = c.rows.map((d) => d.v);
  const x = lin(Math.min(0, ...vals), Math.max(0, ...vals), l, W - 96);
  const anyHl = c.rows.some((d) => d.hl);
  return (
    <Svg w={W} h={H} label={c.unit}>
      {c.rows.map((d, i) => {
        const yy = 4 + i * rowH, bh = rowH * 0.62, hl = anyHl ? d.hl : i === 0;
        return (
          <g key={d.label}>
            <rect x={Math.min(x(0), x(d.v))} y={yy} height={bh} width={Math.max(1, Math.abs(x(d.v) - x(0)))} rx={3}
                  fill={hl ? SERIES[0] : MUTED} opacity={hl ? 1 : 0.55}>
              <title>{`${d.label}: ${d.text ?? `${fmt(d.v, c.digits)} ${c.unit}`}`}</title>
            </rect>
            <text x={l - 8} y={yy + bh / 2 + 4} textAnchor="end" className={styles.strong}>{d.label}</text>
            <text x={Math.max(x(0), x(d.v)) + 6} y={yy + bh / 2 + 4}>{d.text ?? `${fmt(d.v, c.digits)} ${c.unit}`}</text>
          </g>
        );
      })}
    </Svg>
  );
}

function Dumbbell({ c, W = 420 }: { c: Extract<BoardChart, { type: 'dumbbell' }>; W?: number }) {
  const rowH = 28, H = c.rows.length * rowH + 44;
  const l = Math.min(W * 0.4, 14 + Math.max(...c.rows.map((d) => d.label.length)) * 11.5);
  const max = Math.max(...c.rows.flatMap((d) => [d.a ?? 0, d.b, d.c ?? 0]));
  const tk = ticks(0, max * 1.05);
  const x = lin(0, tk[tk.length - 1], l, W - 50);
  const [la, lb, lc] = c.legend;
  return (
    <Svg w={W} h={H} label={`${la} → ${lb} (${c.unit})`}>
      <g transform="translate(0, 10)">
        <circle cx={l} cy={-3} r={4} fill={MUTED} /><text x={l + 8} y={1}>{la}</text>
        <circle cx={l + 90} cy={-3} r={5} fill={SERIES[0]} /><text x={l + 99} y={1}>{lb}</text>
        {lc && (<><circle cx={l + 180} cy={-3} r={4} fill="none" stroke={SERIES[0]} strokeWidth={1.5} /><text x={l + 188} y={1}>{lc}</text></>)}
      </g>
      {tk.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={20} y2={H - 20} className={styles.grid} />
          <text x={x(t)} y={H - 6} textAnchor="middle">{fmt(t)}{c.unit === '%' ? '%' : ''}</text>
        </g>
      ))}
      {c.rows.map((d, i) => {
        const cy = 34 + i * rowH;
        const right = Math.max(d.a ?? 0, d.b, d.c ?? 0);
        return (
          <g key={d.label}>
            <title>{`${d.label}: ${la} ${d.a ?? '-'} · ${lb} ${d.b}${lc ? ` · ${lc} ${d.c ?? '-'}` : ''} (${c.unit})`}</title>
            {d.a !== null && (
              <>
                <line x1={x(d.a)} x2={x(d.b)} y1={cy} y2={cy} strokeWidth={2} stroke={d.b > d.a ? SERIES[0] : MUTED} />
                <circle cx={x(d.a)} cy={cy} r={4} fill={MUTED} />
              </>
            )}
            {d.c != null && <circle cx={x(d.c)} cy={cy} r={4} fill="none" stroke={SERIES[0]} strokeWidth={1.5} />}
            <circle cx={x(d.b)} cy={cy} r={5} fill={SERIES[0]} />
            <text x={l - 8} y={cy + 4} textAnchor="end" className={styles.strong}>{d.label}</text>
            <text x={x(right) + 8} y={cy + 4}>{fmt(d.b, c.digits)}{c.unit === '%' ? '%' : ''}</text>
          </g>
        );
      })}
    </Svg>
  );
}

function Butterfly({ c, W = 420 }: { c: Extract<BoardChart, { type: 'butterfly' }>; W?: number }) {
  const rowH = 26, H = c.rows.length * rowH + 24;
  const l = Math.min(W * 0.35, 14 + Math.max(...c.rows.map((d) => d.label.length)) * 11.5), mid = l + (W - l) / 2;
  const xl = lin(0, Math.max(...c.rows.map((d) => d.l)), mid - 4, l + 44);
  const xr = lin(0, Math.max(...c.rows.map((d) => d.r)), mid + 4, W - 36);
  return (
    <Svg w={W} h={H} label={`${c.left} · ${c.right}`}>
      <text x={mid - 4} y={12} textAnchor="end">{c.left}</text>
      <text x={mid + 4} y={12}>{c.right}</text>
      {c.rows.map((d, i) => {
        const yy = 20 + i * rowH, bh = rowH * 0.7;
        return (
          <g key={d.label}>
            <rect x={xl(d.l)} width={xl(0) - xl(d.l)} y={yy} height={bh} rx={3}
                  fill={d.hlL ? SERIES[0] : MUTED} opacity={d.hlL ? 1 : 0.55}>
              <title>{`${d.label} ${c.left}: ${fmt(d.l)}`}</title>
            </rect>
            <rect x={xr(0)} width={xr(d.r) - xr(0)} y={yy} height={bh} rx={3}
                  fill={d.hlR ? SERIES[2] : MUTED} opacity={d.hlR ? 1 : 0.55}>
              <title>{`${d.label} ${c.right}: ${fmt(d.r)}`}</title>
            </rect>
            <text x={l - 8} y={yy + bh / 2 + 4} textAnchor="end" className={styles.strong}>{d.label}</text>
            <text x={xl(d.l) - 4} y={yy + bh / 2 + 4} textAnchor="end">{fmt(d.l)}</text>
            <text x={xr(d.r) + 4} y={yy + bh / 2 + 4}>{fmt(d.r)}</text>
          </g>
        );
      })}
    </Svg>
  );
}

function Waterfall({ c, W = 420 }: { c: Extract<BoardChart, { type: 'waterfall' }>; W?: number }) {
  const H = 220, l = 46, r = 8, top = 20, bot = 34;
  let run = 0;
  const rows = c.steps.map((d) => {
    const a = d.kind === 'delta' ? run : 0;
    const b = d.kind === 'delta' ? run + d.v : d.v;
    run = b;
    return { ...d, a, b };
  });
  const tk = ticks(Math.min(0, ...rows.map((d) => Math.min(d.a, d.b))), Math.max(...rows.map((d) => Math.max(d.a, d.b))) * 1.12);
  const y = lin(tk[0], tk[tk.length - 1], H - bot, top);
  const bw = (W - l - r) / rows.length;
  return (
    <Svg w={W} h={H} label={c.unit}>
      {tk.map((t) => (
        <g key={t}>
          <line x1={l} x2={W - r} y1={y(t)} y2={y(t)} className={styles.grid} />
          <text x={l - 6} y={y(t) + 4} textAnchor="end">{fmt(t)}</text>
        </g>
      ))}
      {rows.map((d, i) => {
        const x = l + i * bw + bw * 0.15;
        const fill = d.kind !== 'delta' ? MUTED : d.v >= 0 ? SERIES[0] : SERIES[1];
        const lab = (d.kind === 'delta' && d.v > 0 ? '+' : '') + fmt(d.v);
        return (
          <g key={d.label}>
            <rect x={x} width={bw * 0.7} y={y(Math.max(d.a, d.b))} height={Math.max(1, Math.abs(y(d.a) - y(d.b)))} rx={3} fill={fill}>
              <title>{`${d.label}: ${lab} ${c.unit}`}</title>
            </rect>
            <text x={x + bw * 0.35} y={y(Math.max(d.a, d.b)) - 5} textAnchor="middle" className={styles.strong}>{lab}</text>
            <text x={x + bw * 0.35} y={H - 14} textAnchor="middle">{d.label}</text>
          </g>
        );
      })}
    </Svg>
  );
}

function Stairs({ c, W = 420 }: { c: Extract<BoardChart, { type: 'stairs' }>; W?: number }) {
  const rowH = 34, H = c.rows.length * rowH + 26;
  const l = Math.min(W * 0.4, 14 + Math.max(...c.rows.map((d) => d.label.length)) * 11.5), r = 56;
  const tk = ticks(0, Math.max(...c.rows.map((d) => d.price)));
  const x = lin(0, tk[tk.length - 1], l, W - r);
  return (
    <Svg w={W} h={H} label={c.unit}>
      {tk.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={4} y2={H - 20} className={styles.grid} />
          <text x={x(t)} y={H - 6} textAnchor="middle">{fmt(t)}</text>
        </g>
      ))}
      {c.rows.map((d, i) => {
        const yy = 6 + i * rowH, bh = rowH * 0.62, base = d.price - d.add;
        return (
          <g key={d.label}>
            <rect x={x(0)} y={yy} height={bh} width={Math.max(0, x(base) - x(0))} fill={MUTED} opacity={0.3} rx={3} />
            <rect x={x(base)} y={yy} height={bh} rx={3} fill={i === c.rows.length - 1 ? SERIES[0] : SERIES[1]}
                  width={Math.max(2, x(d.price) - x(base))}>
              <title>{`${d.label}: +${fmt(d.add)} → ${fmt(d.price)} ${c.unit}${d.note ? ` · ${d.note}` : ''}`}</title>
            </rect>
            <text x={l - 8} y={yy + bh / 2 + 4} textAnchor="end" className={styles.strong}>{d.label}</text>
            <text x={x(d.price) + 6} y={yy + bh / 2 + 4}>{fmt(d.price)}</text>
          </g>
        );
      })}
    </Svg>
  );
}

function Closed({ c }: { c: Extract<BoardChart, { type: 'closed' }> }) {
  const shut = new Set(c.cells.map((d) => d.stage));
  return (
    <>
      <div className={styles.flow} aria-label="가치사슬 흐름">
        {c.flow.map((s, i) => (
          <React.Fragment key={s}>
            <b className={shut.has(s) ? styles.shut : undefined}>{s}</b>
            {i < c.flow.length - 1 && <span aria-hidden>→</span>}
          </React.Fragment>
        ))}
      </div>
      <div className={styles.closed}>
        {c.cells.map((d) => (
          <div key={d.system} className={styles.gap}>
            <span className={styles.gst}>{d.stage}</span>
            <span className={styles.gsy}>{d.system}</span>
            <span className={styles.ghw}>{d.how}</span>
            <span className={styles.gbs}>{d.basis}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Table({ c, title }: { c: Extract<BoardChart, { type: 'table' }>; title: string }) {
  return (
    <div className={styles.tblWrap} tabIndex={0} role="region" aria-label={`${title} 표`}>
      <table className={styles.tbl}>
        <thead><tr>{c.columns.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {c.rows.map((row) => (
            <tr key={row.join('|')}>
              {row.map((cell, i) => (
                <td key={i}>{i === 0 ? <span className={styles.pill}>{cell}</span> : cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Chart({ card }: { card: BoardCard }) {
  const c = card.chart;
  const W = card.wide ? 860 : 420;
  switch (c.type) {
    case 'bars': return <Bars c={c} W={W} />;
    case 'line': return <Line c={c} W={W} />;
    case 'hbars': return <HBars c={c} W={W} />;
    case 'dumbbell': return <Dumbbell c={c} W={W} />;
    case 'butterfly': return <Butterfly c={c} W={W} />;
    case 'waterfall': return <Waterfall c={c} W={W} />;
    case 'stairs': return <Stairs c={c} W={W} />;
    case 'closed': return <Closed c={c} />;
    case 'table': return <Table c={c} title={card.title} />;
    default: return null;
  }
}

export default function IndustryStatusBoard({ commodityKey }: { commodityKey: string }) {
  const b = industryStatusBoard(commodityKey);
  if (!b) return null;
  const id = `${commodityKey}-board-title`;
  return (
    <section className={styles.board} aria-labelledby={id} data-testid="industry-status-board">
      <header className={styles.head}>
        <h2 id={id}>{b.title}</h2>
        <p className={styles.lede}>{b.lede}</p>
        <p className={styles.src}>{b.src}</p>
      </header>

      <div className={styles.kpis}>
        {b.kpis.map((k) => (
          <div key={`${k.label}-${k.basis}`} className={`${styles.kpi} ${k.partial ? styles.partial : ''}`}>
            <span className={styles.kl}>{k.label}</span>
            <span className={styles.kv}>{fmt(k.value, k.digits)}<small>{k.unit}</small></span>
            {k.note && <span className={styles.kn}>{k.note}</span>}
            <span className={styles.kb}>{k.basis}</span>
          </div>
        ))}
      </div>

      {b.sections.map((s) => (
        <React.Fragment key={s.title}>
          <h3 className={styles.sec}>{s.title} {s.sub && <span>{s.sub}</span>}</h3>
          <div className={s.cards.length > 1 ? styles.grid2 : undefined}>
            {s.cards.map((card) => (
              <div key={card.title} className={`${styles.card} ${card.wide ? styles.wide : ''}`}>
                <h4>{card.title}</h4>
                <p className={styles.note}>{card.note}</p>
                <Chart card={card} />
              </div>
            ))}
          </div>
        </React.Fragment>
      ))}
    </section>
  );
}
