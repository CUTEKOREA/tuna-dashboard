#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_API_DIR = 'app/api';
// 라쳇. 캐시 정책이 명시된 라우트 수가 이 아래로 떨어지면 실패한다.
// 2026-08-13: squid-v5 병합이 라우트 8개를 삭제하면서 145 → 143이 되어 main이 red가 됐다.
// 커버리지는 143/143 = 100%로 온전하므로 라쳇의 취지(정책 누락 방지)는 그대로 두고
// 실제 라우트 수에 맞춘다. 라우트를 지울 때는 이 값도 함께 내려야 한다.
const DEFAULT_MIN_EXPLICIT_POLICY = 143;

function parsePositiveInteger(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
  return parsed;
}

function parseArgs(argv) {
  const args = {
    apiDir: DEFAULT_API_DIR,
    minExplicitPolicy: DEFAULT_MIN_EXPLICIT_POLICY,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const nextValue = argv[index + 1];

    if (arg === '--api-dir' && nextValue) {
      args.apiDir = nextValue;
      index += 1;
    } else if (arg === '--min-explicit-policy' && nextValue) {
      args.minExplicitPolicy = parsePositiveInteger(nextValue, '--min-explicit-policy');
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/audit_api_cache_policy.mjs [options]

Options:
  --api-dir <path>                 API route root. Default: ${DEFAULT_API_DIR}
  --min-explicit-policy <count>    Minimum routes with revalidate, dynamic, or Cache-Control. Default: ${DEFAULT_MIN_EXPLICIT_POLICY}
`);
}

async function listRouteFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) return listRouteFiles(fullPath);
    if (entry.isFile() && entry.name === 'route.ts') return [fullPath];
    return [];
  }));

  return files.flat();
}

function toRoute(apiDir, file) {
  const relative = path.relative(apiDir, file).split(path.sep).join('/');
  return `/api/${relative.replace(/\/route\.ts$/, '')}`;
}

function classifyRoute(source) {
  const hasRevalidate = /export\s+const\s+revalidate\s*=/.test(source);
  const hasDynamic = /export\s+const\s+dynamic\s*=/.test(source);
  const hasCacheControl = /Cache-Control/i.test(source);

  return {
    hasRevalidate,
    hasDynamic,
    hasCacheControl,
    hasExplicitPolicy: hasRevalidate || hasDynamic || hasCacheControl,
  };
}

async function inspectRoutes(apiDir) {
  const files = await listRouteFiles(apiDir);
  const routes = await Promise.all(files.map(async (file) => {
    const source = await readFile(file, 'utf8');

    return {
      route: toRoute(apiDir, file),
      file,
      ...classifyRoute(source),
    };
  }));

  return routes.sort((a, b) => a.route.localeCompare(b.route));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const routes = await inspectRoutes(args.apiDir);
  const explicitRoutes = routes.filter((route) => route.hasExplicitPolicy);
  const missingRoutes = routes.filter((route) => !route.hasExplicitPolicy);

  if (explicitRoutes.length < args.minExplicitPolicy) {
    const sample = missingRoutes
      .slice(0, 20)
      .map((route) => `- ${route.route}`)
      .join('\n');

    console.error(
      `API cache policy floor missed: ${explicitRoutes.length}/${routes.length} explicit, ` +
      `minimum ${args.minExplicitPolicy}.\nMissing policy sample:\n${sample}`,
    );
    process.exit(1);
  }

  const breakdown = {
    revalidate: routes.filter((route) => route.hasRevalidate).length,
    dynamic: routes.filter((route) => route.hasDynamic).length,
    cacheControl: routes.filter((route) => route.hasCacheControl).length,
  };
  const sample = missingRoutes
    .slice(0, 10)
    .map((route) => `- ${route.route}`)
    .join('\n');

  console.log(
    `API cache policy OK: ${explicitRoutes.length}/${routes.length} routes explicit ` +
    `(min ${args.minExplicitPolicy}).\n` +
    `Breakdown: revalidate=${breakdown.revalidate}, dynamic=${breakdown.dynamic}, Cache-Control=${breakdown.cacheControl}.\n` +
    `Missing policy sample:\n${sample}`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
