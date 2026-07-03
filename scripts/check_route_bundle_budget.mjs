#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const DEFAULT_STATS_PATH = '.next/diagnostics/route-bundle-stats.json';
const DEFAULT_MAX_ROUTE_BYTES = 1_300_000;
const DEFAULT_MAX_CATEGORY_BYTES = 750_000;

function parseByteArg(value, label) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive number of bytes.`);
  }
  return parsed;
}

function parseArgs(argv) {
  const args = {
    statsPath: DEFAULT_STATS_PATH,
    maxRouteBytes: DEFAULT_MAX_ROUTE_BYTES,
    maxCategoryBytes: DEFAULT_MAX_CATEGORY_BYTES,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const nextValue = argv[index + 1];

    if (arg === '--stats' && nextValue) {
      args.statsPath = nextValue;
      index += 1;
    } else if (arg === '--max-route-bytes' && nextValue) {
      args.maxRouteBytes = parseByteArg(nextValue, '--max-route-bytes');
      index += 1;
    } else if (arg === '--max-category-bytes' && nextValue) {
      args.maxCategoryBytes = parseByteArg(nextValue, '--max-category-bytes');
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
  console.log(`Usage: node scripts/check_route_bundle_budget.mjs [options]

Options:
  --stats <path>                 Route bundle stats JSON path. Default: ${DEFAULT_STATS_PATH}
  --max-route-bytes <bytes>      Max first-load JS bytes for any route. Default: ${DEFAULT_MAX_ROUTE_BYTES}
  --max-category-bytes <bytes>   Max first-load JS bytes for /[category]. Default: ${DEFAULT_MAX_CATEGORY_BYTES}
`);
}

function assertStatsShape(value) {
  if (!Array.isArray(value)) {
    throw new Error('Route bundle stats must be a JSON array.');
  }

  return value.map((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`Route bundle stats entry ${index} must be an object.`);
    }

    const { route, firstLoadUncompressedJsBytes, firstLoadChunkPaths } = entry;

    if (typeof route !== 'string' || route.length === 0) {
      throw new Error(`Route bundle stats entry ${index} is missing a route string.`);
    }
    if (!Number.isFinite(firstLoadUncompressedJsBytes)) {
      throw new Error(`Route bundle stats entry ${route} is missing firstLoadUncompressedJsBytes.`);
    }
    if (!Array.isArray(firstLoadChunkPaths)) {
      throw new Error(`Route bundle stats entry ${route} is missing firstLoadChunkPaths.`);
    }

    return {
      route,
      firstLoadUncompressedJsBytes,
      firstLoadChunkPaths,
    };
  });
}

function formatBytes(bytes) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
  return `${(bytes / 1_000).toFixed(0)} KB`;
}

function budgetForRoute(route, args) {
  return route === '/[category]' ? args.maxCategoryBytes : args.maxRouteBytes;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  let rawStats;
  try {
    rawStats = await readFile(args.statsPath, 'utf8');
  } catch (error) {
    throw new Error(`Could not read route bundle stats at ${args.statsPath}. Run npm run build first. (${error.message})`);
  }

  const stats = assertStatsShape(JSON.parse(rawStats))
    .sort((a, b) => b.firstLoadUncompressedJsBytes - a.firstLoadUncompressedJsBytes);

  const violations = stats
    .map((entry) => ({
      ...entry,
      budgetBytes: budgetForRoute(entry.route, args),
    }))
    .filter((entry) => entry.firstLoadUncompressedJsBytes > entry.budgetBytes);

  if (violations.length > 0) {
    const details = violations
      .map((entry) => (
        `- ${entry.route}: ${formatBytes(entry.firstLoadUncompressedJsBytes)} > ${formatBytes(entry.budgetBytes)} ` +
        `(${entry.firstLoadChunkPaths.length} first-load chunks)`
      ))
      .join('\n');

    console.error(`Bundle budget exceeded:\n${details}`);
    process.exit(1);
  }

  const topRoutes = stats
    .slice(0, 5)
    .map((entry) => `- ${entry.route}: ${formatBytes(entry.firstLoadUncompressedJsBytes)} (${entry.firstLoadChunkPaths.length} chunks)`)
    .join('\n');

  console.log(`Bundle budget OK: ${stats.length} routes checked.\nTop first-load routes:\n${topRoutes}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
