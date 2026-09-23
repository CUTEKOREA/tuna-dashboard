#!/usr/bin/env node
/**
 * 묵은 기준일 래칫 — 18개월 넘은 위젯이 «늘어나면» 실패한다.
 *
 *   node --experimental-strip-types scripts/check_stale_widgets.mjs            검사
 *   node --experimental-strip-types scripts/check_stale_widgets.mjs --baseline 기준선 갱신
 *
 * 왜 «늘어나면»인가 — 지금 이미 100건 안팎이 18개월을 넘겼다. 오늘 0으로 만들 수는 없다.
 * 대신 더 나빠지는 것만 막는다. 기준선을 내리는 것은 언제든 환영이고(--baseline 으로 갱신),
 * 올리려면 그 커밋에서 이유를 적게 된다.
 *
 * 판정 규칙은 여기서 다시 쓰지 않는다 — 화면이 쓰는 lib/sync-freshness.ts 를 그대로 부른다.
 * 규칙이 두 곳에 박히면 한쪽만 고쳐져 조용히 어긋난다(이 저장소에서 반복된 사고다).
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { freshnessOf } from '../lib/sync-freshness.ts';

const ROOT = process.cwd();
const BASELINE_PATH = 'docs/agent/stale-baseline.json';
const SCAN_DIRS = ['components', 'app', 'lib'];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', 'graphify-out', '__pycache__'].includes(entry.name)) continue;
      yield* walk(full);
    } else if (/\.tsx?$/.test(entry.name)) {
      yield full;
    }
  }
}

const now = new Date();
const counts = { fresh: 0, ok: 0, stale: 0, unknown: 0, live: 0 };
const staleByFile = new Map();

for (const dir of SCAN_DIRS) {
  const base = path.join(ROOT, dir);
  if (!existsSync(base)) continue;
  for await (const file of walk(base)) {
    const src = await readFile(file, 'utf8');
    for (const [, raw] of src.matchAll(/syncDate:\s*'([^']*)'/g)) {
      const { tier } = freshnessOf('STATIC', raw, now);
      counts[tier] = (counts[tier] ?? 0) + 1;
      if (tier === 'stale') {
        const rel = path.relative(ROOT, file);
        staleByFile.set(rel, (staleByFile.get(rel) ?? 0) + 1);
      }
    }
  }
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);
const summary = `기준일 ${total}건 — 최신 ${counts.fresh} · 보통 ${counts.ok} · `
  + `18개월 초과 ${counts.stale} · 판독 불가 ${counts.unknown}`;

if (process.argv.includes('--baseline')) {
  const worst = [...staleByFile.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  await writeFile(path.join(ROOT, BASELINE_PATH), `${JSON.stringify({
    updatedAt: now.toISOString().slice(0, 10),
    stale: counts.stale,
    unknown: counts.unknown,
    note: '이 수치보다 늘면 check:stale-widgets 가 실패한다. 줄었으면 이 파일을 갱신해 잠가라.',
    worstFiles: Object.fromEntries(worst),
  }, null, 2)}\n`);
  console.log(`✓ 기준선 갱신 — ${summary}`);
  process.exit(0);
}

const baselineFile = path.join(ROOT, BASELINE_PATH);
if (!existsSync(baselineFile)) {
  console.error(`✗ ${BASELINE_PATH} 가 없다. \`--baseline\` 으로 먼저 만들어라.`);
  process.exit(1);
}
const baseline = JSON.parse(await readFile(baselineFile, 'utf8'));

console.log(summary);
console.log(`기준선 — 18개월 초과 ${baseline.stale} · 판독 불가 ${baseline.unknown}`);

const overStale = counts.stale - baseline.stale;
const overUnknown = counts.unknown - baseline.unknown;

if (overStale > 0 || overUnknown > 0) {
  console.error(`\n✗ 묵은 기준일이 늘었다 — 18개월 초과 +${Math.max(0, overStale)} · 판독 불가 +${Math.max(0, overUnknown)}`);
  const worst = [...staleByFile.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [file, n] of worst) console.error(`   ${file} (${n}건)`);
  console.error('\n  기준일을 갱신하거나, 정말 그대로 둘 값이면 --baseline 으로 기준선을 올리고 이유를 커밋에 적어라.');
  process.exit(1);
}

if (overStale < 0 || overUnknown < 0) {
  console.log(`\n✓ 기준선보다 좋아졌다 (${overStale} / ${overUnknown}). --baseline 으로 잠가 두면 되돌아가지 않는다.`);
} else {
  console.log('\n✓ 기준선 유지');
}
