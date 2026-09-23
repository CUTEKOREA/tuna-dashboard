#!/usr/bin/env node
/**
 * 라이브 화면 증거 수집 — 「반영했습니다」를 주장이 아니라 사실로 만든다.
 *
 *   node scripts/verify_live.mjs                 기본 화면들을 훑는다
 *   node scripts/verify_live.mjs /market /fleet  화면을 지정한다
 *   node scripts/verify_live.mjs --json out.json 결과를 파일로
 *
 * 무엇을 세나 — 화면마다 위젯 수, 텔레메트리 배지의 신선도 분포(최신·오래됨·기준일 미상),
 * 가장 묵은 기준일. 배포 기록에 이 숫자를 붙이면 화면을 안 열어 보고도 상태를 안다.
 *
 * 왜 Aside 인가 — 운영 화면은 로그인 뒤에 있다. 로컬 서버는 프로덕션 시크릿이 없어
 * `/` 가 503 으로 막힌다(app/auth/start/route.ts). 사용자의 로그인 세션을 쓰는 Aside
 * 브라우저만 실제 화면을 볼 수 있다. 그래서 이 스크립트는 `aside repl` 을 호출한다.
 *
 * ⚠ 읽기만 한다. 클릭·입력·제출을 하지 않는다.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile, mkdir, copyFile } from 'node:fs/promises';

const run = promisify(execFile);
const EVIDENCE_DIR = `${process.cwd()}/artifacts/live-evidence`;

const BASE = process.env.DASHBOARD_URL ?? 'https://leedonggun.co.kr';
const DEFAULT_ROUTES = ['/market', '/logistics', '/unloading', '/port-intel', '/tuna-industry'];

const args = process.argv.slice(2);
const jsonAt = args.indexOf('--json');
const jsonPath = jsonAt >= 0 ? args[jsonAt + 1] : null;
/* ⚠ --json 뒤의 절대경로도 «/» 로 시작한다. 그 자리를 빼고 골라야 한다 —
   안 그러면 결과 파일 경로를 화면 주소로 열러 간다(실제로 그랬다). */
const routes = args.filter((a, i) => a.startsWith('/') && !(jsonAt >= 0 && i === jsonAt + 1));
const targets = routes.length ? routes : DEFAULT_ROUTES;

/** 페이지 안에서 돌 코드. 배지 DOM 은 components/TelemetryBadge.tsx 가 만든다. */
const PAGE_SCRIPT = `() => {
  const badges = [...document.querySelectorAll('[data-telemetry-tone]')];
  const tones = {};
  for (const b of badges) {
    const t = b.getAttribute('data-telemetry-tone') || '?';
    tones[t] = (tones[t] || 0) + 1;
  }
  const stale = badges
    .filter((b) => b.getAttribute('data-telemetry-tone') === 'stale')
    .map((b) => b.textContent.replace(/\\s+/g, ' ').trim())
    .slice(0, 5);
  return {
    title: document.title,
    widgets: document.querySelectorAll('[data-widget-card], .widget-card').length,
    badges: badges.length,
    tones,
    staleSamples: stale,
  };
}`;

const replCode = `
const sessionDir = typeof pwd === 'function' ? await pwd() : (typeof pwd === 'string' ? pwd : '.');
const out = [];
const page = await openTab(${JSON.stringify(BASE + targets[0])});
for (const route of ${JSON.stringify(targets)}) {
  await page.goto(${JSON.stringify(BASE)} + route);
  // SPA 라 배지가 늦게 붙는다. 다 그려질 때까지 기다린다(최대 25초).
  for (let t = 0; t < 10; t++) {
    await sleep(2500);
    const n = await page.evaluate(() => document.querySelectorAll('[data-telemetry-tone]').length);
    if (n > 0) break;
  }
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 3000); await sleep(400); }
  const data = await page.evaluate(${PAGE_SCRIPT});
  // ⚠ Aside 는 자기 세션 폴더 밖으로 못 쓴다("Path escapes session roots").
  //   그래서 여기서는 세션 폴더에 찍고, 경로만 돌려준다. 저장소로 옮기는 건 부르는 쪽 몫이다.
  const shot = './' + (route.replace(/\\//g, '') || 'home') + '.png';
  const shotError = await page.screenshot({ path: shot, fullPage: false }).then(() => null, (e) => String(e).slice(0, 120));
  const shotAbs = shotError ? null : (sessionDir + '/' + shot.replace('./', ''));
  out.push({ route, shot: shotAbs, shotError, ...data });
}
await closeTab(page);
console.log('###RESULT###' + JSON.stringify(out));
`;

let stdout = '';
try {
  ({ stdout } = await run('aside', ['repl', replCode], { maxBuffer: 20 * 1024 * 1024, timeout: 15 * 60_000 }));
} catch (error) {
  console.error('✗ aside repl 실패 — Aside 앱이 떠 있고 로그인돼 있어야 한다.');
  console.error(String(error.stderr || error.message).slice(0, 400));
  process.exit(2);
}

const marker = stdout.indexOf('###RESULT###');
if (marker < 0) {
  console.error('✗ 결과를 못 읽었다. aside repl 출력:');
  console.error(stdout.slice(-800));
  process.exit(2);
}
const results = JSON.parse(stdout.slice(marker + '###RESULT###'.length).split('\n')[0]);

await mkdir(EVIDENCE_DIR, { recursive: true });
for (const r of results) {
  if (!r.shot) continue;
  const dest = `${EVIDENCE_DIR}/${(r.route.replace(/\//g, '') || 'home')}.png`;
  try { await copyFile(r.shot, dest); r.shot = dest; }
  catch (e) { r.shotError = `복사 실패: ${String(e).slice(0, 100)}`; }
}

let stale = 0;
let unknown = 0;
for (const r of results) {
  const t = r.tones || {};
  stale += t.stale || 0;
  unknown += t.unknown || 0;
  const parts = Object.entries(t).map(([k, v]) => `${k} ${v}`).join(' · ') || '배지 없음';
  console.log(`${r.route.padEnd(18)} 배지 ${String(r.badges).padStart(3)}  ${parts}`);
  for (const s of r.staleSamples || []) console.log(`    오래됨: ${s.slice(0, 70)}`);
  if (r.shot) console.log(`    증거: ${r.shot}`);
}

console.log(`\n합계 — 화면 ${results.length}개 · 18개월 초과 ${stale}건 · 기준일 미상 ${unknown}건`);

if (jsonPath) {
  await writeFile(jsonPath, JSON.stringify({ at: new Date().toISOString(), base: BASE, results }, null, 2));
  console.log(`기록: ${jsonPath}`);
}

/* 종료코드는 0 으로 둔다 — 이 스크립트는 «증거를 남기는» 도구지 게이트가 아니다.
   게이트로 쓰려면 호출하는 쪽에서 stale 임계를 정해 판단한다. */
