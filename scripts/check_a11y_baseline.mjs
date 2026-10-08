#!/usr/bin/env node
// 접근성(axe) 기준선 게이트 — scripts/a11y_audit.mjs 의 report.json 을 기준선과 비교한다.
//
// 사용: node scripts/check_a11y_baseline.mjs --report artifacts/a11y/report.json [--report ...]
//       node scripts/check_a11y_baseline.mjs --update --report r1.json --report r2.json ...
//       node scripts/check_a11y_baseline.mjs --self-test
//
// - 비교 단위: 테마 × 화면 × 규칙(critical·serious) 노드 수(데스크톱+모바일 합).
//   기준선(+그 항목의 allow)보다 늘면 exit 1. 줄면 통과하고 「기준선 갱신 가능」을 알린다.
// - 측정 오류(error)가 하나라도 있거나, 측정한 화면이 0개거나, 기준선 화면이 측정되지 않았으면(스킵 등) exit 1.
// - 기준선에 없는 새 화면은 critical·serious 0 이어야 통과.
// - 리포트에 없는 테마·화면(샤드 밖)은 비교하지 않는다.
// - allow(허용폭)는 같은 커밋 반복 측정에서 흔들린 항목에만, 이유(reason)와 함께 둔다. 전역 허용폭은 없다.
// - --update: 리포트로 기준선을 다시 쓴다. 같은 테마 리포트가 여럿이면 화면·규칙마다 최솟값을 기준으로,
//   (최댓값-최솟값)을 allow 로 둔다. 기존 reason 은 보존한다.
import assert from 'node:assert/strict';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_BASELINE = path.join(ROOT, 'scripts', 'a11y-baseline.json');
const GATED = ['critical', 'serious'];
const IMPACTS = ['critical', 'serious', 'moderate', 'minor'];

/* ─── 리포트 → 테마·화면 집계 ─── */
// 반환: { theme, routes: { '/x': { critical, serious, moderate, minor, rules: { id: { impact, nodes } } } }, errors, unmeasured, viewports }
export function aggregate(report) {
  const theme = report?.meta?.theme;
  assert.ok(theme === 'light' || theme === 'dark', `리포트에 meta.theme(light|dark)가 없습니다`);
  const routes = {};
  const errors = [];
  const skipped = new Map();
  for (const r of report.results || []) {
    if (r.error) {
      errors.push(`${r.route} (${r.viewport}) — ${r.error}`);
      continue;
    }
    if (r.skipped) {
      skipped.set(r.route, r.skipped);
      continue;
    }
    if (!Array.isArray(r.violations)) continue;
    const p = routes[r.route] || { critical: 0, serious: 0, moderate: 0, minor: 0, rules: {} };
    for (const v of r.violations) {
      p[v.impact] = (p[v.impact] || 0) + v.nodes;
      if (!GATED.includes(v.impact)) continue;
      const k = p.rules[v.id] || { impact: v.impact, nodes: 0 };
      k.nodes += v.nodes;
      // 노드마다 impact 가 다를 수 있다 — 더 무거운 쪽을 남긴다
      if (GATED.indexOf(v.impact) < GATED.indexOf(k.impact)) k.impact = v.impact;
      p.rules[v.id] = k;
    }
    routes[r.route] = p;
  }
  // 스킵만 된 화면(어느 뷰포트도 측정 안 됨)
  const unmeasured = [...skipped].filter(([route]) => !routes[route]).map(([route, why]) => ({ route, why }));
  return { theme, routes, errors, unmeasured };
}

/* ─── 비교 ─── */
// 반환: { ok, increases: [...], decreases: [...], newRoutes: [...], failures: [문자열], notices: [문자열] }
export function compare(baseline, aggregates) {
  const increases = [];
  const decreases = [];
  const failures = [];
  const notices = [];
  const newRoutes = [];
  for (const agg of aggregates) {
    const base = baseline.themes?.[agg.theme] || {};
    const measured = Object.keys(agg.routes);
    if (measured.length === 0) failures.push(`[${agg.theme}] 측정된 화면이 0개입니다`);
    for (const e of agg.errors) failures.push(`[${agg.theme}] 측정 오류: ${e}`);
    for (const u of agg.unmeasured) {
      if (base[u.route]) failures.push(`[${agg.theme}] 기준선 화면 ${u.route} 이 측정되지 않았습니다(skipped: ${u.why})`);
    }
    for (const route of measured.sort()) {
      const cur = agg.routes[route];
      const b = base[route];
      if (!b) {
        const bad = GATED.reduce((a, i) => a + (cur[i] || 0), 0);
        newRoutes.push({ theme: agg.theme, route, gated: bad });
        if (bad > 0) {
          for (const [id, r] of Object.entries(cur.rules)) {
            increases.push({ theme: agg.theme, route, rule: id, impact: r.impact, base: 0, allow: 0, now: r.nodes, isNew: true });
          }
        }
        continue;
      }
      const ids = new Set([...Object.keys(b.rules || {}), ...Object.keys(cur.rules)]);
      for (const id of [...ids].sort()) {
        const br = b.rules?.[id];
        const was = br?.nodes ?? 0;
        const allow = br?.allow ?? 0;
        const now = cur.rules[id]?.nodes ?? 0;
        const impact = cur.rules[id]?.impact ?? br?.impact;
        if (now > was + allow) increases.push({ theme: agg.theme, route, rule: id, impact, base: was, allow, now });
        else if (now < was) decreases.push({ theme: agg.theme, route, rule: id, impact, base: was, now });
      }
    }
  }
  for (const i of increases) {
    failures.push(`[${i.theme}] ${i.route} · ${i.rule} (${i.impact}) ${i.base}${i.allow ? `(+${i.allow})` : ''} → ${i.now}  (+${i.now - i.base}${i.isNew ? ', 기준선에 없는 새 화면' : ''})`);
  }
  if (decreases.length) notices.push(`줄어든 항목 ${decreases.length}개 — 기준선 갱신 가능: node scripts/check_a11y_baseline.mjs --update --report <report.json>`);
  for (const n of newRoutes.filter((r) => r.gated === 0)) notices.push(`[${n.theme}] 새 화면 ${n.route} — critical·serious 0 (통과). 기준선에 넣으려면 --update`);
  return { ok: failures.length === 0, increases, decreases, newRoutes, failures, notices };
}

/* ─── 기준선 갱신 ─── */
export function buildBaseline(prev, aggregates, meta = {}) {
  const themes = {};
  const byTheme = new Map();
  for (const a of aggregates) {
    assert.equal(a.errors.length, 0, `[${a.theme}] 측정 오류가 있는 리포트로 기준선을 만들 수 없습니다`);
    assert.ok(Object.keys(a.routes).length > 0, `[${a.theme}] 측정 화면 0개 리포트로 기준선을 만들 수 없습니다`);
    byTheme.set(a.theme, [...(byTheme.get(a.theme) || []), a]);
  }
  // 이번에 리포트가 없는 테마는 그대로 둔다
  for (const [theme, data] of Object.entries(prev?.themes || {})) if (!byTheme.has(theme)) themes[theme] = data;
  for (const [theme, runs] of byTheme) {
    const out = {};
    const allRoutes = new Set(runs.flatMap((r) => Object.keys(r.routes)));
    for (const route of [...allRoutes].sort()) {
      // 한 회라도 측정 못 한 화면은 기준선에 넣지 않는다(불완전한 최솟값 방지)
      const present = runs.map((r) => r.routes[route]);
      if (present.some((p) => !p)) continue;
      const entry = {};
      for (const i of IMPACTS) entry[i] = Math.min(...present.map((p) => p[i] || 0));
      const ids = new Set(present.flatMap((p) => Object.keys(p.rules)));
      const rules = {};
      for (const id of [...ids].sort()) {
        const counts = present.map((p) => p.rules[id]?.nodes ?? 0);
        const lo = Math.min(...counts);
        const hi = Math.max(...counts);
        const impact = present.map((p) => p.rules[id]?.impact).find(Boolean);
        const old = prev?.themes?.[theme]?.[route]?.rules?.[id];
        const rule = { impact, nodes: lo };
        if (hi > lo) {
          rule.allow = hi - lo;
          rule.reason = old?.reason || `${runs.length}회 측정 ${counts.join('/')} — 원인 미기록`;
        }
        rules[id] = rule;
      }
      entry.rules = rules;
      out[route] = entry;
    }
    themes[theme] = out;
  }
  return {
    $comment: '접근성(axe) 기준선 — 테마×화면별 impact 노드 수(데스크톱+모바일 합)와 critical·serious 규칙별 노드 수. '
      + 'scripts/check_a11y_baseline.mjs 가 비교한다. 손으로 늘리지 말고 --update 로 다시 쓴다. allow 는 반복 측정에서 흔들린 항목에만, reason 과 함께.',
    meta: { ...(prev?.meta || {}), ...meta },
    themes,
  };
}

/* ─── 출력 ─── */
export function toMarkdown(res) {
  const L = ['## 접근성 기준선 게이트', ''];
  L.push(res.ok ? '**통과** — critical·serious 가 기준선보다 늘어난 화면이 없습니다.' : `**실패** — ${res.failures.length}건`, '');
  if (res.increases.length) {
    L.push('### 늘어난 항목', '', '| 테마 | 화면 | 규칙 | impact | 기준선 | 허용폭 | 지금 | 증가 |', '|---|---|---|---|---:|---:|---:|---:|');
    for (const i of res.increases) L.push(`| ${i.theme} | \`${i.route}\`${i.isNew ? ' (새 화면)' : ''} | \`${i.rule}\` | ${i.impact} | ${i.base} | ${i.allow} | ${i.now} | +${i.now - i.base} |`);
    L.push('');
  }
  const other = res.failures.filter((f) => !res.increases.some((i) => f.includes(`${i.route} · ${i.rule}`)));
  if (other.length) L.push('### 측정 문제', '', ...other.map((f) => `- ${f}`), '');
  if (res.decreases.length) {
    L.push('### 줄어든 항목 (기준선 갱신 가능)', '', '| 테마 | 화면 | 규칙 | 기준선 | 지금 |', '|---|---|---|---:|---:|');
    for (const d of res.decreases) L.push(`| ${d.theme} | \`${d.route}\` | \`${d.rule}\` | ${d.base} | ${d.now} |`);
    L.push('');
  }
  if (res.notices.length) L.push(...res.notices.map((n) => `- ${n}`), '');
  return `${L.join('\n')}\n`;
}

/* ─── 자체 점검 (증가·감소·새 화면·오류) ─── */
function selfTest() {
  const rep = (theme, results) => ({ meta: { theme }, results });
  const v = (id, impact, nodes) => ({ id, impact, nodes });
  const baseline = buildBaseline(null, [aggregate(rep('light', [
    { route: '/a', viewport: 'desktop', violations: [v('color-contrast', 'serious', 3), v('region', 'moderate', 9)] },
    { route: '/a', viewport: 'mobile', violations: [v('color-contrast', 'serious', 2)] },
    { route: '/b', viewport: 'desktop', violations: [] },
  ]))]);
  assert.equal(baseline.themes.light['/a'].rules['color-contrast'].nodes, 5);
  assert.equal(baseline.themes.light['/a'].rules.region, undefined, 'moderate 는 규칙 비교 대상이 아니다');

  // 1) 증가 → 실패, 화면·규칙·증가량이 보인다
  let r = compare(baseline, [aggregate(rep('light', [
    { route: '/a', viewport: 'desktop', violations: [v('color-contrast', 'serious', 4)] },
    { route: '/a', viewport: 'mobile', violations: [v('color-contrast', 'serious', 2), v('button-name', 'critical', 1)] },
    { route: '/b', viewport: 'desktop', violations: [] },
  ]))]);
  assert.equal(r.ok, false);
  assert.deepEqual(r.increases.map((i) => [i.route, i.rule, i.base, i.now]), [['/a', 'button-name', 0, 1], ['/a', 'color-contrast', 5, 6]]);

  // 2) 감소 → 통과 + 갱신 안내, moderate 증가는 무시
  r = compare(baseline, [aggregate(rep('light', [
    { route: '/a', viewport: 'desktop', violations: [v('color-contrast', 'serious', 1), v('region', 'moderate', 30)] },
    { route: '/b', viewport: 'desktop', violations: [] },
  ]))]);
  assert.equal(r.ok, true);
  assert.equal(r.decreases.length, 1);
  assert.match(r.notices[0], /기준선 갱신 가능/);

  // 3) 새 화면 — critical·serious 0 이면 통과, 있으면 실패
  r = compare(baseline, [aggregate(rep('light', [{ route: '/c', viewport: 'desktop', violations: [v('region', 'moderate', 2)] }]))]);
  assert.equal(r.ok, true);
  r = compare(baseline, [aggregate(rep('light', [{ route: '/c', viewport: 'desktop', violations: [v('link-name', 'serious', 1)] }]))]);
  assert.equal(r.ok, false);
  assert.equal(r.increases[0].isNew, true);

  // 4) 오류·측정 0·기준선 화면 스킵 → 실패
  r = compare(baseline, [aggregate(rep('light', [
    { route: '/a', viewport: 'desktop', error: 'TimeoutError' },
    { route: '/b', viewport: 'desktop', violations: [] },
  ]))]);
  assert.equal(r.ok, false);
  assert.match(r.failures.join('\n'), /측정 오류/);
  r = compare(baseline, [aggregate(rep('light', [{ route: '/a', viewport: 'desktop', skipped: 'auth', status: 404 }]))]);
  assert.equal(r.ok, false);
  assert.match(r.failures.join('\n'), /측정된 화면이 0개/);
  assert.match(r.failures.join('\n'), /측정되지 않았습니다/);

  // 허용폭: 반복 측정 최솟값 기준 + 흔들림만큼만
  const tol = buildBaseline(null, [3, 5, 4].map((n) => aggregate(rep('dark', [{ route: '/a', viewport: 'desktop', violations: [v('color-contrast', 'serious', n)] }]))));
  assert.deepEqual([tol.themes.dark['/a'].rules['color-contrast'].nodes, tol.themes.dark['/a'].rules['color-contrast'].allow], [3, 2]);
  assert.equal(compare(tol, [aggregate(rep('dark', [{ route: '/a', viewport: 'desktop', violations: [v('color-contrast', 'serious', 5)] }]))]).ok, true);
  assert.equal(compare(tol, [aggregate(rep('dark', [{ route: '/a', viewport: 'desktop', violations: [v('color-contrast', 'serious', 6)] }]))]).ok, false);
  console.log('자체 점검 통과 (증가·감소·새 화면·오류·허용폭)');
}

/* ─── CLI ─── */
function parseArgs(argv) {
  const a = { reports: [], baseline: DEFAULT_BASELINE, update: false, selfTest: false, md: null };
  for (let i = 0; i < argv.length; i += 1) {
    const x = argv[i];
    if (x === '--report') a.reports.push(argv[++i]);
    else if (x === '--baseline') a.baseline = argv[++i];
    else if (x === '--md') a.md = argv[++i];
    else if (x === '--update') a.update = true;
    else if (x === '--self-test') a.selfTest = true;
    else throw new Error(`알 수 없는 인자: ${x}`);
  }
  if (!a.selfTest && a.reports.length === 0) a.reports.push(path.join(ROOT, 'artifacts', 'a11y', 'report.json'));
  return a;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.selfTest) return selfTest();
  const reports = args.reports.map((p) => JSON.parse(readFileSync(path.resolve(p), 'utf8')));
  const aggs = reports.map(aggregate);
  const prev = existsSync(args.baseline) ? JSON.parse(readFileSync(args.baseline, 'utf8')) : null;

  if (args.update) {
    const axe = [...new Set(reports.map((r) => r.meta?.axeVersion).filter(Boolean))];
    const next = buildBaseline(prev, aggs, { axeVersion: axe.join(','), updatedAt: new Date().toISOString().slice(0, 10) });
    writeFileSync(args.baseline, `${JSON.stringify(next, null, 2)}\n`);
    const n = Object.entries(next.themes).map(([t, r]) => `${t} ${Object.keys(r).length}화면`).join(' · ');
    console.log(`기준선 갱신: ${path.relative(ROOT, args.baseline)} (${n})`);
    return;
  }

  if (!prev) {
    console.error(`기준선이 없습니다: ${args.baseline} — --update 로 먼저 만드세요`);
    process.exit(1);
  }
  const res = compare(prev, aggs);
  const md = toMarkdown(res);
  for (const a of aggs) console.log(`[${a.theme}] 측정 ${Object.keys(a.routes).length}화면 · 오류 ${a.errors.length} · 스킵 ${a.unmeasured.length}`);
  if (res.increases.length) {
    console.log('\n늘어난 항목 (테마 · 화면 · 규칙 · impact · 기준선(+허용) → 지금):');
    for (const f of res.failures) console.log(`  ✗ ${f}`);
  } else if (res.failures.length) {
    for (const f of res.failures) console.log(`  ✗ ${f}`);
  }
  for (const d of res.decreases) console.log(`  ↓ [${d.theme}] ${d.route} · ${d.rule} ${d.base} → ${d.now}`);
  for (const n of res.notices) console.log(`  · ${n}`);
  console.log(res.ok ? '\n접근성 기준선 OK' : `\n접근성 기준선 실패 — ${res.failures.length}건`);
  if (args.md) {
    mkdirSync(path.dirname(path.resolve(args.md)), { recursive: true });
    writeFileSync(args.md, md);
  }
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  if (!res.ok) process.exitCode = 1;
}

main();
