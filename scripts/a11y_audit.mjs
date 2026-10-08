#!/usr/bin/env node
// 접근성(axe-core) 전수 감사 — 빌드된 앱(next start)을 띄워 모든 화면을 두 뷰포트로 돈다.
//
// 사용: npm run build && npm run a11y
//       node scripts/a11y_audit.mjs [--routes market,fleet] [--out artifacts/a11y] [--theme light|dark]
//
// - 접속은 e2e/measure-chart-layout.js 와 같은 로컬 E2E 경계를 쓴다
//   (DASHBOARD_E2E_MODE=local + 루프백 + x-dashboard-e2e-secret, lib/auth/local-e2e-access.ts).
// - 라우트 목록: app/sitemap.ts 의 PUBLIC_ROUTES + lib/dashboard-registry.ts 메뉴 키([category] 실제 값)
//   + app/ 정적 폴더. notFound() 한 줄짜리 은퇴 화면은 `skipped: retired`,
//   로그인·권한 화면(404·로그인 리다이렉트·401/403)은 `skipped: auth`, 5xx 는 오류로 적는다.
// - 규칙은 끄지 않는다. 태그 wcag2a·wcag2aa·wcag21aa 만 고른다.
// - 위반이 있어도 exit 0 (리포트 도구). 서버가 안 뜨거나, 측정한 화면이 0개거나, 화면 오류가 하나라도 있으면 exit 1.
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');

const args = process.argv.slice(2);
const argOf = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const OUT_DIR = path.resolve(ROOT, argOf('--out') || 'artifacts/a11y');
const ONLY = argOf('--routes')?.split(',').map((r) => r.replace(/^\//, ''));
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'];
// 라이트가 기본, 다크는 사이드바 토글(localStorage 'theme-mode') — app/page.tsx
const THEME = argOf('--theme') === 'dark' ? 'dark' : 'light';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];
const IMPACTS = ['critical', 'serious', 'moderate', 'minor'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ─── 라우트 목록 ─── */
function quotedList(src, name) {
  const m = src.match(new RegExp(`${name}\\s*=\\s*\\[([\\s\\S]*?)\\]`));
  return m ? [...m[1].matchAll(/'([^']*)'/g)].map((x) => x[1]) : [];
}

function collectRoutes() {
  const sitemap = readFileSync(path.join(ROOT, 'app/sitemap.ts'), 'utf8');
  const registry = readFileSync(path.join(ROOT, 'lib/dashboard-registry.ts'), 'utf8');
  // sitemap 은 PUBLIC_DASHBOARD_ROUTES(현재 빈 배열)를 펼친다 → [category] 실제 값은 레지스트리 메뉴 키에서
  const menuKeys = [...registry.matchAll(/\{\s*key:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]);
  const fromSitemap = quotedList(sitemap, 'PUBLIC_ROUTES');

  const statics = [];
  const retired = [];
  const walk = (dir, prefix) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name === 'api' || e.name.startsWith('[') || e.name.startsWith('(') || e.name.startsWith('_')) continue;
      const route = prefix ? `${prefix}/${e.name}` : e.name;
      const page = path.join(dir, e.name, 'page.tsx');
      if (existsSync(page)) {
        // scripts/feature_map.mjs 와 같은 판정: 조건 없는 notFound() 만 은퇴
        const body = readFileSync(page, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
        const guarded = /(if\s*\([^)]*\)[^;{]*notFound\(\))|(&&\s*notFound\(\))|(\?[^;]*notFound\(\))/.test(body);
        (/notFound\(\)/.test(body) && !guarded ? retired : statics).push(route);
      }
      walk(path.join(dir, e.name), route);
    }
  };
  walk(path.join(ROOT, 'app'), '');

  const live = [...new Set(['', ...fromSitemap, ...menuKeys, ...statics, 'login'])]
    .filter((r) => !retired.includes(r));
  return { live, retired: retired.sort() };
}

/* ─── 서버 ─── */
function freePort(start) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(freePort(start + 1)));
    srv.once('listening', () => srv.close(() => resolve(start)));
    srv.listen(start, '127.0.0.1');
  });
}

async function waitUp(base, secret, deadline) {
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${base}/market`, { headers: { 'x-dashboard-e2e-secret': secret }, redirect: 'manual' });
      if (res.status < 500) return;
    } catch { /* 아직 안 뜸 */ }
    await sleep(1000);
  }
  throw new Error('next start 가 응답하지 않습니다');
}

/* ─── 페이지 준비: 동적 영역 로드 대기 ─── */
async function settle(page) {
  // 지연 마운트 위젯을 깨우려고 끝까지 스크롤했다가 돌아온다
  for (let i = 0; i < 60; i++) {
    const done = await page.evaluate(() => {
      const el = document.scrollingElement;
      const before = el.scrollTop;
      el.scrollTop += window.innerHeight * 0.9;
      return el.scrollTop === before;
    });
    await sleep(250);
    if (done) break;
  }
  await page.evaluate(() => { document.scrollingElement.scrollTop = 0; });
  // DOM 노드 수가 1.5초 동안 변하지 않을 때까지(최대 25초 — feature-map 함정 6)
  let last = -1;
  let stable = 0;
  const deadline = Date.now() + 25_000;
  while (Date.now() < deadline && stable < 3) {
    const n = await page.evaluate(() => document.getElementsByTagName('*').length);
    stable = n === last ? stable + 1 : 0;
    last = n;
    await sleep(500);
  }
}

function classifySkip(status, finalUrl) {
  const u = new URL(finalUrl);
  if (u.pathname === '/login' || u.pathname.endsWith('/login') || u.pathname.startsWith('/auth')) return 'auth';
  if ([401, 403, 404].includes(status)) return 'auth';
  return null;
}

async function auditRoute(browser, base, secret, route, vp) {
  const page = await browser.newPage();
  const rec = { route: `/${route}`, viewport: vp.name };
  try {
    await page.setViewport(vp);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setExtraHTTPHeaders({ 'x-dashboard-e2e-secret': secret });
    await page.evaluateOnNewDocument((mode) => {
      try { window.localStorage.setItem('theme-mode', mode); } catch { /* 저장소 차단 시 기본(라이트) */ }
    }, THEME);
    const res = await page.goto(`${base}/${route}`, { waitUntil: 'networkidle2', timeout: 120_000 }).catch(async (e) => {
      // 폴링하는 화면은 networkidle 에 못 닿는다 — load 까지만 기다리고 계속
      if (!/timeout/i.test(String(e))) throw e;
      return null;
    });
    const status = res?.status() ?? 200;
    rec.status = status;
    // 로그인 화면은 그 자체로 보호 경계 — 측정 대상이 아니다
    const skip = route === 'login' || route.endsWith('/login') ? 'auth' : classifySkip(status, page.url());
    if (skip) {
      rec.skipped = skip;
      return rec;
    }
    // 5xx 는 인증 경계가 아니라 서버 오류 — 스킵으로 숨기지 않는다
    if (status >= 500) {
      rec.error = `HTTP ${status}`;
      return rec;
    }
    await settle(page);
    // 메뉴 키가 아니면 /market 으로 폴백한다(feature-map 함정 1) — 실제 화면 경로를 남긴다
    rec.finalPath = new URL(page.url()).pathname;
    rec.title = await page.evaluate(() => (document.querySelector('h1')?.textContent || document.title || '').trim().slice(0, 80));
    const result = await new AxePuppeteer(page).withTags(AXE_TAGS).analyze();
    rec.violations = result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length,
      // 공유 컴포넌트를 가려내려면 노드 표본이 넉넉해야 한다(대비는 전경·배경·비율까지)
      targets: v.nodes.slice(0, 60).map((n) => {
        const d = n.any?.find((c) => c.data?.contrastRatio)?.data;
        return {
          target: n.target.join(' '),
          html: n.html.slice(0, 200),
          ...(d ? { fg: d.fgColor, bg: d.bgColor, ratio: d.contrastRatio, expected: d.expectedContrastRatio } : {}),
        };
      }),
    }));
    rec.incomplete = result.incomplete.length;
    rec.passes = result.passes.length;
  } catch (e) {
    rec.error = String(e).slice(0, 300);
  } finally {
    await page.close().catch(() => {});
  }
  return rec;
}

/* ─── 리포트 ─── */
function summarize(records, retired) {
  const measured = records.filter((r) => r.violations);
  const byImpact = Object.fromEntries(IMPACTS.map((i) => [i, 0]));
  const byRule = new Map();
  const byPage = new Map();
  for (const r of measured) {
    const p = byPage.get(r.route) || { route: r.route, critical: 0, serious: 0, moderate: 0, minor: 0, desktop: 0, mobile: 0 };
    for (const v of r.violations) {
      byImpact[v.impact] = (byImpact[v.impact] || 0) + v.nodes;
      p[v.impact] += v.nodes;
      p[r.viewport] += v.nodes;
      const k = byRule.get(v.id) || { id: v.id, impact: v.impact, help: v.help, nodes: 0, pages: new Set() };
      k.nodes += v.nodes;
      k.pages.add(r.route);
      byRule.set(v.id, k);
    }
    byPage.set(r.route, p);
  }
  const rules = [...byRule.values()].map((r) => ({ ...r, pages: r.pages.size })).sort((a, b) => b.nodes - a.nodes);
  const pages = [...byPage.values()].sort((a, b) => (b.critical + b.serious) - (a.critical + a.serious));
  const skipped = records.filter((r) => r.skipped);
  const errors = records.filter((r) => r.error);
  return { measuredPages: byPage.size, measuredRuns: measured.length, skipped, errors, retired, byImpact, rules, pages };
}

function toMarkdown(s, meta) {
  const L = [];
  L.push('# 접근성 감사 (axe-core)', '');
  L.push(`- 측정: ${meta.generatedAt} · axe-core ${meta.axeVersion} · 태그 ${AXE_TAGS.join('·')} · 뷰포트 데스크톱 1280×800 / 모바일 390×844 · 테마 ${meta.theme}`);
  L.push(`- 서버: \`next start\`(빌드 산출물) + 로컬 E2E 경계 · 페이지마다 끝까지 스크롤 → DOM 안정(1.5초) 대기 후 측정 · reduced-motion`);
  L.push(`- 측정 페이지 ${s.measuredPages}개(실행 ${s.measuredRuns}회) · 스킵 ${new Set(s.skipped.map((r) => r.route)).size}개 · 은퇴(404) ${s.retired.length}개 · 오류 ${s.errors.length}회`, '');
  L.push('## impact 별 합계 (노드 수, 두 뷰포트 합)', '', '| critical | serious | moderate | minor |', '|---:|---:|---:|---:|');
  L.push(`| ${IMPACTS.map((i) => s.byImpact[i] || 0).join(' | ')} |`, '');
  L.push('## 규칙 상위 15', '', '| 규칙 | impact | 노드 | 페이지 | 설명 |', '|---|---|---:|---:|---|');
  for (const r of s.rules.slice(0, 15)) L.push(`| \`${r.id}\` | ${r.impact} | ${r.nodes} | ${r.pages} | ${r.help} |`);
  L.push('', '## 페이지별 critical / serious (나쁜 순)', '', '| 페이지 | critical | serious | moderate | minor | 데스크톱 | 모바일 |', '|---|---:|---:|---:|---:|---:|---:|');
  for (const p of s.pages) L.push(`| \`${p.route}\` | ${p.critical} | ${p.serious} | ${p.moderate} | ${p.minor} | ${p.desktop} | ${p.mobile} |`);
  if (s.skipped.length) {
    L.push('', '## 스킵', '');
    const seen = new Set();
    for (const r of s.skipped) {
      if (seen.has(r.route)) continue;
      seen.add(r.route);
      L.push(`- \`${r.route}\` — skipped: ${r.skipped} (HTTP ${r.status})`);
    }
  }
  if (s.retired.length) L.push('', `## 은퇴(notFound) — 측정 제외`, '', s.retired.map((r) => `\`/${r}\``).join(' · '));
  if (s.errors.length) {
    L.push('', '## 오류', '');
    for (const r of s.errors) L.push(`- \`${r.route}\` (${r.viewport}) — ${r.error}`);
  }
  return `${L.join('\n')}\n`;
}

async function main() {
  if (!existsSync(path.join(ROOT, '.next', 'BUILD_ID'))) {
    console.error('빌드 산출물이 없습니다 — 먼저 `npm run build`');
    process.exit(1);
  }
  const { live, retired } = collectRoutes();
  const routes = ONLY ? live.filter((r) => ONLY.includes(r)) : live;
  const port = await freePort(Number(process.env.A11Y_PORT || 3931));
  const base = `http://127.0.0.1:${port}`;
  const secret = crypto.randomBytes(32).toString('hex');
  const env = { ...process.env, DASHBOARD_E2E_MODE: 'local', DASHBOARD_E2E_AUTH_SECRET: secret, NEXT_TELEMETRY_DISABLED: '1' };
  delete env.VERCEL;
  delete env.VERCEL_ENV;
  const server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '-p', String(port), '-H', '127.0.0.1'],
    { cwd: ROOT, env, stdio: 'ignore' });

  const records = [];
  let browser;
  try {
    await waitUp(base, secret, Date.now() + 120_000);
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'], protocolTimeout: 300_000 });
    for (const route of routes) {
      for (const vp of VIEWPORTS) {
        const rec = await auditRoute(browser, base, secret, route, vp);
        records.push(rec);
        const n = rec.violations?.reduce((a, v) => a + v.nodes, 0);
        console.log(`/${route}\t${vp.name}\t${rec.skipped ? `skipped: ${rec.skipped}` : rec.error ? `error: ${rec.error.slice(0, 80)}` : `${rec.violations.length} rules · ${n} nodes`}`);
        if (rec.skipped) break; // 스킵은 뷰포트와 무관
      }
    }
  } finally {
    await browser?.close().catch(() => {});
    server.kill('SIGTERM');
  }

  const axeVersion = JSON.parse(readFileSync(require.resolve('axe-core/package.json'), 'utf8')).version;
  const meta = { generatedAt: new Date().toISOString(), axeVersion, tags: AXE_TAGS, theme: THEME, viewports: VIEWPORTS.map(({ name, width, height }) => ({ name, width, height })) };
  const summary = summarize(records, retired);
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path.join(OUT_DIR, 'report.json'), `${JSON.stringify({
    meta,
    summary: { measuredPages: summary.measuredPages, byImpact: summary.byImpact, rules: summary.rules, pages: summary.pages, retired },
    results: records,
  }, null, 1)}\n`);
  writeFileSync(path.join(OUT_DIR, 'report.md'), toMarkdown(summary, meta));
  console.log(`\n측정 ${summary.measuredPages}페이지 · 스킵 ${new Set(summary.skipped.map((r) => r.route)).size} · 은퇴 ${retired.length} · 오류 ${summary.errors.length}`);
  console.log(`impact: ${IMPACTS.map((i) => `${i} ${summary.byImpact[i] || 0}`).join(' · ')}`);
  console.log(`리포트: ${path.relative(ROOT, OUT_DIR)}/report.{json,md}`);
  if (summary.measuredPages === 0 || summary.errors.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
