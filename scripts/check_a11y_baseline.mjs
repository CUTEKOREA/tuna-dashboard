#!/usr/bin/env node
// 접근성(axe) 기준선 게이트 — scripts/a11y_audit.mjs 의 report.json 을 기준선과 비교한다.
//
// 사용: node scripts/check_a11y_baseline.mjs --report artifacts/a11y/light/report.json [--md gate.md] [--counts-out counts.json] [--print-counts]
//       node scripts/check_a11y_baseline.mjs --update --report light/counts.json --report dark/counts.json [--out 후보.json] [--print]
//       node scripts/check_a11y_baseline.mjs --self-test
//
// - 비교 키: 테마 × 화면 × 뷰포트 × 규칙 × impact (critical·serious) 노드 수. 뷰포트를 합치지 않는다 —
//   데스크톱 3→2·모바일 2→3 이 상쇄되지 않고, 같은 노드 수로 serious→critical 이 바뀌면 critical 키가 늘어난 것으로 잡힌다.
// - 래칫: 기준선(+allow)보다 늘면 실패, 기준선보다 줄어도 실패 — 같은 PR 에서 기준선을 낮춰야 한다.
//   기준선은 CI(GitHub Actions ubuntu-latest) 측정값이어야 한다(로컬 리눅스와 일부 화면 노드 수가 다르다).
//   CI 의 `a11y-baseline-candidate` artifact 가 그 run 의 측정으로 다시 쓴 기준선이다 → 내려받아 그대로 커밋.
// - 완결성: 기준선 화면은 리포트에 있어야 하고(전체 누락 = 실패), 스킵·오류 없이 meta.viewports 의 모든 뷰포트가
//   측정돼야 한다(한 뷰포트 누락 = 실패). 기준선에 없는 새 화면도 모든 뷰포트가 측정돼야 하고 critical·serious 0 이어야 통과.
// - meta: 리포트의 axe 버전·태그·뷰포트·테마가 기준선 meta 와 다르면 실패(다른 조건의 숫자를 비교하지 않는다).
// - allow(허용폭)는 같은 커밋 반복 측정에서 흔들린 키에만, reason 과 함께 둔다. 전역 허용폭은 없다.
// - --update: 측정으로 기준선을 다시 쓴다. 같은 테마 리포트가 여럿이면 키마다 최솟값 + (최댓값-최솟값)을 allow 로.
//   기존 기준선 범위(nodes~nodes+allow) 안이면 기존 값을 그대로 두고, 범위보다 높아지는 키가 있으면
//   --accept-increase 없이는 거부한다(회귀를 기준선에 묻지 않도록).
import assert from 'node:assert/strict';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync, gzipSync } from 'node:zlib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_BASELINE = path.join(ROOT, 'scripts', 'a11y-baseline.json');
const BASELINE_FORMAT = 'a11y-baseline/2';
const COUNTS_FORMAT = 'a11y-counts/1';
const GATED = ['critical', 'serious'];
const CANDIDATE_ARTIFACT = 'a11y-baseline-candidate';
const LOG_BEGIN = '-----BEGIN A11Y GZIP BASE64-----';
const LOG_END = '-----END A11Y GZIP BASE64-----';

const routeSort = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const keyOf = (route, vp, rule, impact) => `${route} · ${vp} · ${rule} · ${impact}`;

/* ─── meta ─── */
// 비교에 쓰는 측정 조건만 남긴다(generatedAt 등은 뺀다)
export function measureMeta(meta) {
  return {
    axeVersion: meta?.axeVersion ?? null,
    tags: [...(meta?.tags || [])].sort(),
    viewports: (meta?.viewports || []).map(({ name, width, height }) => ({ name, width, height })),
  };
}

export function metaMismatches(baseMeta, reportMeta) {
  const b = measureMeta(baseMeta);
  const r = measureMeta(reportMeta);
  const out = [];
  if (b.axeVersion !== r.axeVersion) out.push(`axe 버전 ${b.axeVersion} ≠ 리포트 ${r.axeVersion}`);
  if (JSON.stringify(b.tags) !== JSON.stringify(r.tags)) out.push(`태그 ${b.tags.join('·')} ≠ 리포트 ${r.tags.join('·')}`);
  if (JSON.stringify(b.viewports) !== JSON.stringify(r.viewports)) {
    const f = (v) => v.map((x) => `${x.name} ${x.width}×${x.height}`).join(' / ');
    out.push(`뷰포트 ${f(b.viewports)} ≠ 리포트 ${f(r.viewports)}`);
  }
  return out;
}

/* ─── 리포트 → 테마·화면·뷰포트 집계(counts) ─── */
// report.json(a11y_audit) 또는 이미 집계된 counts 를 받는다.
// 반환(counts): { format, meta: { theme, axeVersion, tags, viewports }, routes: { '/x': { desktop: { critical, serious, moderate, minor, rules: { id: { impact: nodes } } } } },
//                 errors: [문자열], skipped: { '/x': 사유 }, incomplete: [{ route, missing: [뷰포트] }] }
export function aggregate(report) {
  if (report?.format === COUNTS_FORMAT) return report;
  const theme = report?.meta?.theme;
  assert.ok(theme === 'light' || theme === 'dark', '리포트에 meta.theme(light|dark)가 없습니다');
  const meta = { theme, ...measureMeta(report.meta) };
  assert.ok(meta.viewports.length > 0, '리포트에 meta.viewports 가 없습니다');
  const routes = {};
  const errors = [];
  const skipped = {};
  const seen = new Set();
  for (const r of report.results || []) {
    const id = `${r.route} ${r.viewport}`;
    if (seen.has(id)) {
      errors.push(`${r.route} (${r.viewport}) — 같은 화면·뷰포트 결과가 두 번 있습니다`);
      continue;
    }
    seen.add(id);
    if (r.error) {
      errors.push(`${r.route} (${r.viewport}) — ${r.error}`);
      continue;
    }
    if (r.skipped) {
      skipped[r.route] = r.skipped;
      continue;
    }
    if (!Array.isArray(r.violations)) {
      errors.push(`${r.route} (${r.viewport}) — violations 가 없습니다`);
      continue;
    }
    const vp = { critical: 0, serious: 0, moderate: 0, minor: 0, rules: {} };
    for (const v of r.violations) {
      vp[v.impact] = (vp[v.impact] || 0) + v.nodes;
      if (!GATED.includes(v.impact)) continue;
      const rule = vp.rules[v.id] || {};
      rule[v.impact] = (rule[v.impact] || 0) + v.nodes;
      vp.rules[v.id] = rule;
    }
    (routes[r.route] ||= {})[r.viewport] = vp;
  }
  // 측정된 화면은 meta.viewports 전부가 있어야 한다 — 한 뷰포트만 있는 화면은 집계에서 빼고 incomplete 로 남긴다
  const names = meta.viewports.map((v) => v.name);
  const incomplete = [];
  for (const route of Object.keys(routes)) {
    const missing = names.filter((n) => !routes[route][n]);
    const extra = Object.keys(routes[route]).filter((n) => !names.includes(n));
    if (missing.length || extra.length) {
      incomplete.push({ route, missing: [...missing, ...extra.map((n) => `${n}(meta 에 없음)`)] });
      delete routes[route];
    }
  }
  for (const [route] of Object.entries(skipped)) if (routes[route]) delete skipped[route];
  return { format: COUNTS_FORMAT, meta, routes, errors, skipped, incomplete };
}

// 한 화면(뷰포트별 집계) → Map(key → { route, vp, rule, impact, nodes, allow, reason })
function flattenRoute(route, entry) {
  const m = new Map();
  for (const [vp, data] of Object.entries(entry || {})) {
    for (const [rule, byImpact] of Object.entries(data.rules || {})) {
      for (const [impact, val] of Object.entries(byImpact)) {
        const nodes = typeof val === 'number' ? val : val.nodes;
        const allow = typeof val === 'number' ? 0 : (val.allow ?? 0);
        const reason = typeof val === 'number' ? undefined : val.reason;
        m.set(keyOf(route, vp, rule, impact), { route, vp, rule, impact, nodes, allow, reason });
      }
    }
  }
  return m;
}

function measurementFailures(agg, label = `[${agg.meta.theme}]`) {
  const f = [];
  if (Object.keys(agg.routes).length === 0) f.push(`${label} 측정된 화면이 0개입니다`);
  for (const e of agg.errors) f.push(`${label} 측정 오류: ${e}`);
  return f;
}

/* ─── 비교 ─── */
// 반환: { ok, increases, decreases, newRoutes, failures: [문자열], notices: [문자열] }
export function compare(baseline, aggregates) {
  const increases = [];
  const decreases = [];
  const failures = [];
  const notices = [];
  const newRoutes = [];
  if (baseline?.format !== BASELINE_FORMAT) {
    failures.push(`기준선 형식이 ${BASELINE_FORMAT} 가 아닙니다(${baseline?.format ?? '없음'}) — CI 의 ${CANDIDATE_ARTIFACT} 로 다시 만드세요`);
    return { ok: false, increases, decreases, newRoutes, failures, notices };
  }
  const themesSeen = new Set();
  for (const agg of aggregates) {
    const theme = agg.meta.theme;
    if (themesSeen.has(theme)) {
      failures.push(`[${theme}] 같은 테마 리포트가 두 개입니다 — 비교는 테마당 리포트 하나`);
      continue;
    }
    themesSeen.add(theme);
    const base = baseline.themes?.[theme];
    if (!base) {
      failures.push(`[${theme}] 기준선에 이 테마가 없습니다`);
      continue;
    }
    const mm = metaMismatches(baseline.meta, agg.meta);
    if (mm.length) {
      for (const m of mm) failures.push(`[${theme}] 측정 조건이 기준선과 다릅니다: ${m}`);
      continue; // 다른 조건의 숫자는 비교하지 않는다
    }
    failures.push(...measurementFailures(agg));
    for (const { route, missing } of agg.incomplete) failures.push(`[${theme}] ${route} 뷰포트 측정 누락: ${missing.join(', ')}`);
    for (const route of Object.keys(base).sort(routeSort)) {
      if (agg.routes[route]) continue;
      if (agg.incomplete.some((i) => i.route === route)) continue; // 위에서 이미 실패
      const why = agg.skipped[route] ? `skipped: ${agg.skipped[route]}` : '리포트에 없음';
      failures.push(`[${theme}] 기준선 화면 ${route} 이 측정되지 않았습니다(${why})`);
    }
    for (const route of Object.keys(agg.routes).sort(routeSort)) {
      const cur = flattenRoute(route, agg.routes[route]);
      if (!base[route]) {
        const gated = [...cur.values()].reduce((a, k) => a + k.nodes, 0);
        newRoutes.push({ theme, route, gated });
        for (const k of cur.values()) if (k.nodes > 0) increases.push({ theme, ...k, base: 0, allow: 0, now: k.nodes, isNew: true });
        continue;
      }
      const was = flattenRoute(route, base[route]);
      for (const key of [...new Set([...was.keys(), ...cur.keys()])].sort(routeSort)) {
        const b = was.get(key);
        const c = cur.get(key);
        const ref = c || b;
        const row = { theme, route, vp: ref.vp, rule: ref.rule, impact: ref.impact, base: b?.nodes ?? 0, allow: b?.allow ?? 0, now: c?.nodes ?? 0 };
        if (row.now > row.base + row.allow) increases.push(row);
        else if (row.now < row.base) decreases.push(row);
      }
    }
  }
  for (const i of increases) {
    failures.push(`[${i.theme}] ${i.route} · ${i.vp} · ${i.rule} (${i.impact}) ${i.base}${i.allow ? `(+${i.allow})` : ''} → ${i.now}  (+${i.now - i.base}${i.isNew ? ', 기준선에 없는 새 화면' : ''})`);
  }
  for (const d of decreases) {
    failures.push(`[${d.theme}] ${d.route} · ${d.vp} · ${d.rule} (${d.impact}) ${d.base} → ${d.now}  (${d.now - d.base}, 줄었음 — 기준선을 낮추세요)`);
  }
  if (decreases.length) {
    notices.push(`줄어든 키 ${decreases.length}개 — 래칫: 이 PR 에서 기준선을 낮춰야 통과합니다. `
      + `이 CI run 의 artifact \`${CANDIDATE_ARTIFACT}\`(a11y-baseline.json)를 내려받아 scripts/a11y-baseline.json 에 덮어쓰고 커밋하세요. `
      + `artifact 를 받을 수 없으면 같은 job 로그의 ${LOG_BEGIN} 블록을 \`node scripts/check_a11y_baseline.mjs --decode <로그파일>\` 로 풀면 같은 파일입니다. `
      + '기준선은 CI(ubuntu-latest) 측정값이어야 하므로 로컬 측정으로 --update 하지 마세요.');
  }
  for (const n of newRoutes.filter((r) => r.gated === 0)) notices.push(`[${n.theme}] 새 화면 ${n.route} — critical·serious 0 (통과). 기준선에 넣으려면 ${CANDIDATE_ARTIFACT} 를 커밋`);
  return { ok: failures.length === 0, increases, decreases, newRoutes, failures, notices };
}

/* ─── 기준선 갱신 ─── */
// prev: 기존 기준선(없거나 형식이 다르면 무시), aggregates: counts 여러 개(테마별 1회 이상)
// 반환: { baseline, raised: [...], lowered: [...] } — raised 가 있고 acceptIncrease 가 아니면 throw
export function buildBaseline(prev, aggregates, { acceptIncrease = false, extraMeta = {} } = {}) {
  const usablePrev = prev?.format === BASELINE_FORMAT ? prev : null;
  const byTheme = new Map();
  let meta = null;
  for (const a of aggregates) {
    const f = [...measurementFailures(a), ...a.incomplete.map((i) => `[${a.meta.theme}] ${i.route} 뷰포트 측정 누락: ${i.missing.join(', ')}`)];
    assert.equal(f.length, 0, `불완전한 리포트로 기준선을 만들 수 없습니다:\n${f.join('\n')}`);
    const m = measureMeta(a.meta);
    if (meta) assert.deepEqual(m, meta, '측정 조건(axe 버전·태그·뷰포트)이 다른 리포트를 섞을 수 없습니다');
    meta = m;
    byTheme.set(a.meta.theme, [...(byTheme.get(a.meta.theme) || []), a]);
  }
  assert.ok(meta, '리포트가 없습니다');
  const themes = {};
  // 이번에 리포트가 없는 테마는 그대로 둔다 — 단 측정 조건이 같을 때만
  for (const [theme, data] of Object.entries(usablePrev?.themes || {})) {
    if (byTheme.has(theme)) continue;
    assert.equal(metaMismatches(usablePrev.meta, meta).length, 0, `측정 조건이 바뀌었습니다 — 테마 ${theme} 리포트도 함께 넣어 모든 테마를 갱신하세요`);
    themes[theme] = data;
  }
  const raised = [];
  const lowered = [];
  const dropped = [];
  for (const [theme, runs] of [...byTheme].sort()) {
    const out = {};
    const prevTheme = usablePrev?.themes?.[theme] || {};
    // 한 회라도 측정 못 한 화면은 기준선에 넣지 않는다(불완전한 최솟값 방지)
    const routes = [...new Set(runs.flatMap((r) => Object.keys(r.routes)))].filter((rt) => runs.every((r) => r.routes[rt])).sort(routeSort);
    for (const route of routes) {
      const present = runs.map((r) => r.routes[route]);
      const prevKeys = flattenRoute(route, prevTheme[route]);
      const entry = {};
      for (const vp of meta.viewports.map((v) => v.name)) {
        const vps = present.map((p) => p[vp]);
        // impact 합계(moderate·minor 포함)는 게이트가 쓰지 않아 기준선에 두지 않는다 — 측정마다 흔들리는 비교 밖 숫자로 diff 를 만들지 않도록
        const e = {};
        const rules = {};
        const pairs = new Set(vps.flatMap((p) => Object.entries(p.rules).flatMap(([id, by]) => Object.keys(by).map((im) => `${id}\u0000${im}`))));
        for (const pk of [...pairs].sort(routeSort)) {
          const [id, impact] = pk.split('\u0000');
          const counts = vps.map((p) => p.rules[id]?.[impact] ?? 0);
          const lo = Math.min(...counts);
          const hi = Math.max(...counts);
          const old = prevKeys.get(keyOf(route, vp, id, impact));
          let val;
          if (old && lo >= old.nodes && hi <= old.nodes + old.allow) {
            val = old.allow ? { nodes: old.nodes, allow: old.allow, ...(old.reason ? { reason: old.reason } : {}) } : old.nodes; // 범위 안 — 그대로
          } else {
            const oldTop = old ? old.nodes + old.allow : 0;
            if (usablePrev && hi > oldTop) raised.push({ theme, route, vp, rule: id, impact, from: old?.nodes ?? 0, allow: old?.allow ?? 0, to: hi });
            if (old && lo < old.nodes) lowered.push({ theme, route, vp, rule: id, impact, from: old.nodes, to: lo });
            const allow = Math.max(hi - lo, old && lo < old.nodes ? old.allow : 0);
            const reason = old?.reason || (hi > lo ? `${runs.length}회 측정 ${counts.join('/')} — 원인 미기록` : undefined);
            val = allow ? { nodes: lo, allow, reason } : lo;
          }
          if (val !== 0) (rules[id] ||= {})[impact] = val;
        }
        e.rules = rules;
        entry[vp] = e;
      }
      out[route] = entry;
    }
    // 기준선에 있던 키가 이번 측정에서 0 이 된 것도 낮춘 것으로 센다
    for (const route of Object.keys(prevTheme)) {
      for (const k of flattenRoute(route, prevTheme[route]).values()) {
        const now = out[route]?.[k.vp]?.rules?.[k.rule]?.[k.impact];
        if (out[route] && now === undefined && k.nodes > 0) lowered.push({ theme, route, vp: k.vp, rule: k.rule, impact: k.impact, from: k.nodes, to: 0 });
      }
      if (!out[route]) dropped.push({ theme, route });
    }
    themes[theme] = out;
  }
  if (raised.length && !acceptIncrease) {
    const lines = raised.map((r) => `  ↑ [${r.theme}] ${r.route} · ${r.vp} · ${r.rule} (${r.impact}) ${r.from}${r.allow ? `(+${r.allow})` : ''} → ${r.to}`);
    throw new Error(`기준선보다 높아지는 키 ${raised.length}개 — 회귀를 기준선에 묻을 수 없습니다. 화면을 고치세요(의도한 수용이면 --accept-increase 와 PR 에 근거).\n${lines.join('\n')}`);
  }
  const ordered = Object.fromEntries(Object.entries(themes).sort());
  return {
    baseline: {
      $comment: '접근성(axe) 기준선 — 테마 × 화면 × 뷰포트별 critical·serious 규칙×impact 노드 수(0 인 키는 생략). '
        + 'scripts/check_a11y_baseline.mjs 가 비교한다(늘어도·줄어도 실패 — 래칫). 손으로 고치지 말고 CI 의 a11y-baseline-candidate artifact 를 커밋한다. '
        + '값이 객체면 { nodes, allow, reason } — allow 는 반복 측정에서 흔들린 키에만.',
      format: BASELINE_FORMAT,
      meta: { ...(usablePrev?.meta || {}), ...extraMeta, ...meta },
      themes: ordered,
    },
    raised,
    lowered,
    dropped,
    fresh: !usablePrev,
  };
}

/* ─── 로그 전달용 인코딩 (artifact 를 못 받을 때) ─── */
export function encodeForLog(obj) {
  const b64 = gzipSync(Buffer.from(JSON.stringify(obj))).toString('base64');
  const lines = b64.match(/.{1,120}/g) || [];
  return [LOG_BEGIN, ...lines, LOG_END].join('\n');
}

export function decodeFromLog(text) {
  const blocks = [];
  let cur = null;
  for (const raw of text.split(/\r?\n/)) {
    // GitHub 로그는 줄 앞에 타임스탬프가 붙는다
    const line = raw.replace(/^\S*\d{4}-\d{2}-\d{2}T[\d:.]+Z\s?/, '').trim();
    if (line === LOG_BEGIN) cur = [];
    else if (line === LOG_END && cur) {
      blocks.push(JSON.parse(gunzipSync(Buffer.from(cur.join(''), 'base64')).toString('utf8')));
      cur = null;
    } else if (cur) cur.push(line);
  }
  return blocks;
}

/* ─── 출력 ─── */
export function toMarkdown(res) {
  const L = ['## 접근성 기준선 게이트', ''];
  L.push(res.ok ? '**통과** — 모든 테마·화면·뷰포트·규칙·impact 가 기준선과 같습니다.' : `**실패** — ${res.failures.length}건`, '');
  const row = (i, sign) => `| ${i.theme} | \`${i.route}\`${i.isNew ? ' (새 화면)' : ''} | ${i.vp} | \`${i.rule}\` | ${i.impact} | ${i.base} | ${i.allow} | ${i.now} | ${sign}${i.now - i.base} |`;
  const head = ['| 테마 | 화면 | 뷰포트 | 규칙 | impact | 기준선 | 허용폭 | 지금 | 차이 |', '|---|---|---|---|---|---:|---:|---:|---:|'];
  if (res.increases.length) L.push('### 늘어난 키', '', ...head, ...res.increases.map((i) => row(i, '+')), '');
  if (res.decreases.length) L.push('### 줄어든 키 (래칫 — 기준선을 낮춰야 통과)', '', ...head, ...res.decreases.map((d) => row(d, '')), '');
  const counted = res.increases.length + res.decreases.length;
  const other = res.failures.slice(0, res.failures.length - counted);
  if (other.length) L.push('### 측정 문제', '', ...other.map((f) => `- ${f}`), '');
  if (res.notices.length) L.push(...res.notices.map((n) => `- ${n}`), '');
  return `${L.join('\n')}\n`;
}

/* ─── 자체 점검 ─── */
function selfTest() {
  const VPS = [{ name: 'desktop', width: 1280, height: 800 }, { name: 'mobile', width: 390, height: 844 }];
  const META = { axeVersion: '4.13.0', tags: ['wcag2a', 'wcag2aa', 'wcag21aa'], viewports: VPS };
  const rep = (theme, results, meta = {}) => ({ meta: { ...META, theme, ...meta }, results });
  const v = (id, impact, nodes) => ({ id, impact, nodes });
  const both = (route, desktop, mobile = desktop) => [
    { route, viewport: 'desktop', violations: desktop },
    { route, viewport: 'mobile', violations: mobile },
  ];
  const run = (base, results, meta) => compare(base, [aggregate(rep('light', results, meta))]);
  const build = (prev, results, opts) => buildBaseline(prev, [aggregate(rep('light', results))], opts).baseline;
  const base = build(null, [
    ...both('/a', [v('color-contrast', 'serious', 3), v('region', 'moderate', 9)], [v('color-contrast', 'serious', 2)]),
    ...both('/b', []),
  ]);
  assert.equal(base.format, BASELINE_FORMAT);
  assert.equal(base.themes.light['/a'].desktop.rules['color-contrast'].serious, 3);
  assert.equal(base.themes.light['/a'].mobile.rules['color-contrast'].serious, 2);
  assert.equal(base.themes.light['/a'].desktop.rules.region, undefined, 'moderate 는 규칙 비교 대상이 아니다');
  const same = [...both('/a', [v('color-contrast', 'serious', 3)], [v('color-contrast', 'serious', 2)]), ...both('/b', [])];
  assert.equal(run(base, same).ok, true, '같으면 통과');

  // 1) 증가 → 실패, 화면·뷰포트·규칙·증가량이 보인다
  let r = run(base, [...both('/a', [v('color-contrast', 'serious', 4)], [v('color-contrast', 'serious', 2), v('button-name', 'critical', 1)]), ...both('/b', [])]);
  assert.equal(r.ok, false);
  assert.deepEqual(r.increases.map((i) => [i.route, i.vp, i.rule, i.impact, i.base, i.now]), [
    ['/a', 'desktop', 'color-contrast', 'serious', 3, 4], ['/a', 'mobile', 'button-name', 'critical', 0, 1]]);

  // 2) 뷰포트 상쇄(데스크톱 3→2·모바일 2→3, 합 5 그대로) → 실패
  r = run(base, [...both('/a', [v('color-contrast', 'serious', 2)], [v('color-contrast', 'serious', 3)]), ...both('/b', [])]);
  assert.equal(r.ok, false, '뷰포트 상쇄를 놓치면 안 된다');
  assert.deepEqual(r.increases.map((i) => [i.vp, i.base, i.now]), [['mobile', 2, 3]]);

  // 3) 모바일 결과 누락 · 한 뷰포트 스킵 · 기준선 화면 전체 누락 → 실패
  r = run(base, [{ route: '/a', viewport: 'desktop', violations: [v('color-contrast', 'serious', 3)] }, ...both('/b', [])]);
  assert.equal(r.ok, false);
  assert.match(r.failures.join('\n'), /\/a 뷰포트 측정 누락: mobile/);
  r = run(base, [{ route: '/a', viewport: 'desktop', violations: [v('color-contrast', 'serious', 3)] }, { route: '/a', viewport: 'mobile', skipped: 'auth' }, ...both('/b', [])]);
  assert.equal(r.ok, false, '한 뷰포트 스킵');
  assert.match(r.failures.join('\n'), /뷰포트 측정 누락: mobile/);
  r = run(base, both('/b', []));
  assert.equal(r.ok, false, '기준선 화면 전체 누락');
  assert.match(r.failures.join('\n'), /기준선 화면 \/a 이 측정되지 않았습니다\(리포트에 없음\)/);
  r = run(base, [{ route: '/a', viewport: 'desktop', skipped: 'auth', status: 404 }, ...both('/b', [])]);
  assert.match(r.failures.join('\n'), /\/a 이 측정되지 않았습니다\(skipped: auth\)/);

  // 4) impact 승격 — 같은 노드 수로 serious→critical → 실패
  r = run(base, [...both('/a', [v('color-contrast', 'critical', 3)], [v('color-contrast', 'serious', 2)]), ...both('/b', [])]);
  assert.equal(r.ok, false, 'impact 승격을 놓치면 안 된다');
  assert.deepEqual(r.increases.map((i) => [i.vp, i.impact, i.base, i.now]), [['desktop', 'critical', 0, 3]]);

  // 5) 래칫 5→3→5 — 감소도 실패, 낮춘 기준선에서 다시 5 면 실패
  const b5 = build(null, both('/a', [v('color-contrast', 'serious', 5)]));
  const r3 = both('/a', [v('color-contrast', 'serious', 3)]);
  r = run(b5, r3);
  assert.equal(r.ok, false, '감소는 기준선을 낮출 때까지 실패');
  assert.equal(r.decreases.length, 2);
  assert.match(r.notices.join('\n'), new RegExp(CANDIDATE_ARTIFACT));
  const upd = buildBaseline(b5, [aggregate(rep('light', r3))]);
  assert.equal(upd.lowered.length, 2);
  const b3 = upd.baseline;
  assert.equal(run(b3, r3).ok, true, '낮춘 기준선이면 통과');
  r = run(b3, both('/a', [v('color-contrast', 'serious', 5)]));
  assert.equal(r.ok, false, '5→3→5 재악화');
  assert.deepEqual(r.increases.map((i) => [i.base, i.now]), [[3, 5], [3, 5]]);
  // --update 로 회귀를 묻지 못한다
  assert.throws(() => buildBaseline(b3, [aggregate(rep('light', both('/a', [v('color-contrast', 'serious', 5)])))]), /높아지는 키 2개/);
  assert.equal(buildBaseline(b3, [aggregate(rep('light', both('/a', [v('color-contrast', 'serious', 5)])))], { acceptIncrease: true }).raised.length, 2);
  // 키가 0 으로 사라져도 감소
  r = run(b5, both('/a', []));
  assert.equal(r.ok, false);
  assert.deepEqual(r.decreases.map((d) => [d.base, d.now]), [[5, 0], [5, 0]]);

  // 6) meta 불일치(axe 버전·태그·뷰포트·테마) → 실패
  assert.match(run(base, same, { axeVersion: '4.14.0' }).failures.join('\n'), /axe 버전 4\.13\.0 ≠ 리포트 4\.14\.0/);
  assert.match(run(base, same, { tags: ['wcag2a'] }).failures.join('\n'), /태그/);
  assert.match(run(base, same, { viewports: [VPS[0], { name: 'mobile', width: 375, height: 667 }] }).failures.join('\n'), /뷰포트 .* ≠ 리포트/);
  r = compare(base, [aggregate(rep('dark', same))]);
  assert.equal(r.ok, false);
  assert.match(r.failures.join('\n'), /기준선에 이 테마가 없습니다/);
  assert.equal(compare({ themes: base.themes }, [aggregate(rep('light', same))]).ok, false, '옛 형식 기준선은 실패');

  // 7) 새 화면 — 모든 뷰포트 측정 + critical·serious 0 이면 통과, 있으면 실패
  r = run(base, [...same, ...both('/c', [v('region', 'moderate', 2)])]);
  assert.equal(r.ok, true);
  r = run(base, [...same, ...both('/c', [], [v('link-name', 'serious', 1)])]);
  assert.equal(r.ok, false);
  assert.equal(r.increases[0].isNew, true);

  // 8) 오류·측정 0 → 실패
  r = run(base, [{ route: '/a', viewport: 'desktop', error: 'TimeoutError' }, ...both('/b', [])]);
  assert.match(r.failures.join('\n'), /측정 오류/);
  r = run(base, [{ route: '/a', viewport: 'desktop', skipped: 'auth', status: 404 }]);
  assert.match(r.failures.join('\n'), /측정된 화면이 0개/);

  // 9) 허용폭 — 반복 측정 최솟값 + 흔들림만큼, 범위 안 측정은 기준선을 바꾸지 않는다
  const tol = buildBaseline(null, [3, 5, 4].map((n) => aggregate(rep('light', both('/a', [v('color-contrast', 'serious', n)]))))).baseline;
  assert.deepEqual(tol.themes.light['/a'].desktop.rules['color-contrast'].serious, { nodes: 3, allow: 2, reason: '3회 측정 3/5/4 — 원인 미기록' });
  for (const [n, ok] of [[2, false], [3, true], [5, true], [6, false]]) assert.equal(run(tol, both('/a', [v('color-contrast', 'serious', n)])).ok, ok, `허용폭 ${n}`);
  const kept = buildBaseline(tol, [aggregate(rep('light', both('/a', [v('color-contrast', 'serious', 4)])))]);
  assert.deepEqual(kept.baseline.themes, tol.themes);
  assert.equal(kept.lowered.length + kept.raised.length, 0);

  // 10) 로그 블록 왕복
  const log = encodeForLog(b3).split('\n').map((l) => `2026-10-08T15:18:55.5493693Z ${l}`).join('\n');
  assert.deepEqual(decodeFromLog(`앞\n${log}\n뒤`)[0], b3);
  console.log('자체 점검 통과 (증가·뷰포트 상쇄·뷰포트 누락·화면 누락·impact 승격·래칫 5→3→5·meta 불일치·새 화면·오류·허용폭·로그 블록)');
}

/* ─── CLI ─── */
function parseArgs(argv) {
  const a = { reports: [], baseline: DEFAULT_BASELINE, update: false, selfTest: false, md: null, out: null, countsOut: null, print: false, printCounts: false, acceptIncrease: false, decode: null };
  for (let i = 0; i < argv.length; i += 1) {
    const x = argv[i];
    if (x === '--report') a.reports.push(argv[++i]);
    else if (x === '--baseline') a.baseline = argv[++i];
    else if (x === '--md') a.md = argv[++i];
    else if (x === '--out') a.out = argv[++i];
    else if (x === '--counts-out') a.countsOut = argv[++i];
    else if (x === '--decode') a.decode = argv[++i];
    else if (x === '--update') a.update = true;
    else if (x === '--print') a.print = true;
    else if (x === '--print-counts') a.printCounts = true;
    else if (x === '--accept-increase') a.acceptIncrease = true;
    else if (x === '--self-test') a.selfTest = true;
    else throw new Error(`알 수 없는 인자: ${x}`);
  }
  if (!a.selfTest && !a.decode && a.reports.length === 0) a.reports.push(path.join(ROOT, 'artifacts', 'a11y', 'report.json'));
  return a;
}

const writeJson = (p, obj) => {
  mkdirSync(path.dirname(path.resolve(p)), { recursive: true });
  writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`);
};

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.selfTest) return selfTest();
  if (args.decode) {
    // CI 로그 → 파일: 블록이 하나면 --out(기본: 기준선 경로)에, 여럿이면 순서대로 출력
    const blocks = decodeFromLog(readFileSync(path.resolve(args.decode), 'utf8'));
    assert.ok(blocks.length > 0, `${LOG_BEGIN} 블록을 찾지 못했습니다`);
    const target = args.out || args.baseline;
    writeJson(target, blocks.at(-1));
    console.log(`로그 블록 ${blocks.length}개 중 마지막을 ${path.relative(ROOT, path.resolve(target))} 에 썼습니다`);
    return;
  }
  const aggs = args.reports.map((p) => aggregate(JSON.parse(readFileSync(path.resolve(p), 'utf8'))));
  const prev = existsSync(args.baseline) ? JSON.parse(readFileSync(args.baseline, 'utf8')) : null;

  if (args.update) {
    const target = args.out || args.baseline;
    let res;
    try {
      res = buildBaseline(prev, aggs, { acceptIncrease: args.acceptIncrease, extraMeta: {
        updatedAt: new Date().toISOString().slice(0, 10),
        ...(process.env.GITHUB_RUN_ID ? { measuredAt: `CI run ${process.env.GITHUB_RUN_ID} · ${(process.env.GITHUB_SHA || '').slice(0, 7)} · ${process.env.RUNNER_OS || ''} ${process.env.ImageOS || ''}`.trim() } : {}),
      } });
    } catch (e) {
      console.error(String(e.message || e));
      process.exit(1);
    }
    writeJson(target, res.baseline);
    for (const l of res.lowered) console.log(`  ↓ [${l.theme}] ${l.route} · ${l.vp} · ${l.rule} (${l.impact}) ${l.from} → ${l.to}`);
    for (const d of res.dropped) console.log(`  − [${d.theme}] ${d.route} — 이번 측정에 없어 기준선에서 뺌`);
    for (const l of res.raised) console.log(`  ↑ [${l.theme}] ${l.route} · ${l.vp} · ${l.rule} (${l.impact}) ${l.from} → ${l.to}  (--accept-increase)`);
    const n = Object.entries(res.baseline.themes).map(([t, r]) => `${t} ${Object.keys(r).length}화면`).join(' · ');
    const changed = res.lowered.length + res.raised.length + res.dropped.length;
    console.log(`기준선 ${res.fresh ? '새로 작성(이전 기준선 없음·옛 형식)' : changed ? `갱신(낮춤 ${res.lowered.length} · 올림 ${res.raised.length} · 뺀 화면 ${res.dropped.length})` : '변화 없음'}: ${path.relative(ROOT, path.resolve(target))} (${n})`);
    if (args.print) console.log(`\n기준선 후보(로그 전달용 — --decode 로 풀기):\n${encodeForLog(res.baseline)}`);
    return;
  }

  if (!prev) {
    console.error(`기준선이 없습니다: ${args.baseline}`);
    process.exit(1);
  }
  for (const a of aggs) {
    if (args.countsOut) writeJson(args.countsOut, a);
    if (args.printCounts) console.log(`[${a.meta.theme}] 측정 집계(로그 전달용 — --decode 로 풀기):\n${encodeForLog(a)}\n`);
  }
  const res = compare(prev, aggs);
  const md = toMarkdown(res);
  for (const a of aggs) {
    console.log(`[${a.meta.theme}] 측정 ${Object.keys(a.routes).length}화면 · 오류 ${a.errors.length} · 스킵 ${Object.keys(a.skipped).length} · 뷰포트 누락 ${a.incomplete.length}`);
  }
  for (const f of res.failures) console.log(`  ✗ ${f}`);
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
