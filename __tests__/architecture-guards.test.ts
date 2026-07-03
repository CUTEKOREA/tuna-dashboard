import { describe, expect, it } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIRS = ['app', 'components', 'lib'];
const APP_COMPONENT_DIRS = ['app', 'components'];
const API_DIR = path.join(ROOT, 'app', 'api');
const TEST_DIR = path.join(ROOT, '__tests__');
const MIN_CONTRACTED_API_ROUTES = 30;

const IGNORED_DIRS = new Set([
  '.git',
  '.next',
  '.vercel',
  'node_modules',
  'artifacts',
  '_archive',
]);

async function listFiles(dir: string, extensions = new Set(['.ts', '.tsx', '.js', '.jsx'])): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) return [];
      return listFiles(fullPath, extensions);
    }
    if (!entry.isFile() || !extensions.has(path.extname(entry.name))) return [];
    return [fullPath];
  }));

  return files.flat();
}

async function filesWithMatches(files: string[], pattern: RegExp) {
  const matches: string[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    if (pattern.test(source)) {
      matches.push(path.relative(ROOT, file));
    }
  }

  return matches.sort();
}

function toApiRoute(file: string) {
  return `/api/${path.relative(API_DIR, file).replace(/\/route\.ts$/, '').replace(/\\/g, '/')}`;
}

function addRouteMatches(source: string, pattern: RegExp, routes: Set<string>) {
  for (const match of source.matchAll(pattern)) {
    routes.add(match[1].split('?')[0]);
  }
}

async function listContractedApiRoutes() {
  const testFiles = await listFiles(TEST_DIR, new Set(['.ts']));
  const routes = new Set<string>();

  for (const file of testFiles) {
    const source = await readFile(file, 'utf8');
    addRouteMatches(source, /label:\s*['"`](\/api\/[a-zA-Z0-9_./-]+)['"`]/g, routes);
    addRouteMatches(source, /describe\(\s*['"`](\/api\/[a-zA-Z0-9_./-]+)(?:\?|\s|['"`])/g, routes);
    addRouteMatches(source, /new Request\(\s*['"`]http:\/\/localhost(\/api\/[a-zA-Z0-9_?=&./-]+)['"`]/g, routes);
  }

  return Array.from(routes).sort();
}

describe('architecture guards', () => {
  it('keeps app and component code behind the data intake layer', async () => {
    const files = (await Promise.all(
      APP_COMPONENT_DIRS.map((dir) => listFiles(path.join(ROOT, dir)))
    )).flat();

    const directJsonImport = /from\s+['"](?:\.\.\/data|\.\.\/\.\.\/data)\/[^'"]+\.json['"]/;
    expect(await filesWithMatches(files, directJsonImport)).toEqual([]);

    const componentFiles = await listFiles(path.join(ROOT, 'components'));
    const componentPublicJsonImport = /from\s+['"](?:\.\.\/public\/data|\.\.\/\.\.\/public\/data)\/[^'"]+\.json['"]/;
    expect(await filesWithMatches(componentFiles, componentPublicJsonImport)).toEqual([]);
  });

  it('keeps dashboard API routes behind the data intake layer', async () => {
    const apiFiles = await listFiles(API_DIR);
    const dashboardRoutes = apiFiles.filter((file) => file.endsWith('/dashboard/route.ts'));
    const directJsonImport = /from\s+['"][^'"]+\.json['"]/;

    expect(await filesWithMatches(dashboardRoutes, directJsonImport)).toEqual([]);
  });

  it('confines raw JSON imports to lib/data intake modules', async () => {
    const files = (await Promise.all(
      SOURCE_DIRS.map((dir) => listFiles(path.join(ROOT, dir)))
    )).flat();
    const directJsonImport = /from\s+['"][^'"]+\.json['"]/;
    const offenders = (await filesWithMatches(files, directJsonImport))
      .filter((file) => !file.startsWith('lib/data/'));

    expect(offenders).toEqual([]);
  });

  it('keeps TypeScript and Next build gates enabled', async () => {
    const sourceFiles = (await Promise.all(
      SOURCE_DIRS.map((dir) => listFiles(path.join(ROOT, dir)))
    )).flat();
    expect(await filesWithMatches(sourceFiles, /^\/\/\s*@ts-nocheck/m)).toEqual([]);

    const configFiles = await listFiles(ROOT, new Set(['.js', '.mjs', '.ts', '.mts']));
    const nextConfigs = configFiles.filter((file) => /next\.config\.(mjs|js|ts|mts)$/.test(file));
    expect(await filesWithMatches(nextConfigs, /ignoreBuildErrors\s*:\s*true/)).toEqual([]);
  });

  it('keeps core KCS HS codes sourced from the shared mapping', async () => {
    const apiFiles = (await listFiles(API_DIR)).filter((file) => !file.endsWith('app/api/_shared/hs-codes.ts'));
    const forbiddenHsLiterals = [
      /const\s+HS_CODES\s*=\s*\{/,
      /hsSgn=(?:121221|030354|030367|0801320000|0801310000|0307599000|0307510000|0307521000|0307600000|1605550000|0302230000|0303330000|0304310000)(?:[&'"`]|$)/,
      /hsSgn:\s*['"]030617['"]/,
      /cmdCode=(?:030617|030367)(?:[&'"`]|$)/,
      /startsWith\(['"]1212211['"]\)/,
      /const\s+HSK\s*=\s*['"](?:2008995010|0303892000)['"]/,
      /statKor\s*!==\s*['"]김['"]/,
    ];

    for (const pattern of forbiddenHsLiterals) {
      expect(await filesWithMatches(apiFiles, pattern)).toEqual([]);
    }
  });

  it('keeps WITS commodity HS lookup in the shared mapping', async () => {
    const source = await readFile(path.join(API_DIR, 'wits', 'route.ts'), 'utf8');

    expect(source).not.toMatch(/const\s+COMMODITY_HS_MAP\s*:/);
    expect(source).toMatch(/WITS_COMMODITY_HS_MAP/);
  });

  it('keeps LIVE telemetry labels backed by runtime signals', async () => {
    const files = (await Promise.all(
      APP_COMPONENT_DIRS.map((dir) => listFiles(path.join(ROOT, dir)))
    )).flat();
    const hardcodedLiveTelemetry = [
      /telemetry=\{\{[^}]*status:\s*['"](?:LIVE|live)['"]/,
      /<TelemetryBadge\b[^>]*\bstatus=["'](?:LIVE|live)["']/,
      /<TelemetryBadge\b[^>]*\bstatus=\{\s*["'](?:LIVE|live)["']\s*\}/,
    ];

    for (const pattern of hardcodedLiveTelemetry) {
      expect(await filesWithMatches(files, pattern)).toEqual([]);
    }
  });

  it('keeps KeepAlivePanel activation state out of the render path', async () => {
    const source = await readFile(path.join(ROOT, 'components', 'KeepAlivePanel.tsx'), 'utf8');

    expect(source).not.toMatch(/if\s*\(\s*active\s*&&\s*!hasBeenActive\s*\)\s*\{\s*setHasBeenActive\(true\)/);
  });

  it('keeps at least 30 API routes under explicit contract-test coverage', async () => {
    const apiRoutes = new Set((await listFiles(API_DIR)).map(toApiRoute));
    const contractedRoutes = await listContractedApiRoutes();
    const missingRoutes = contractedRoutes.filter((route) => !apiRoutes.has(route));

    expect(missingRoutes).toEqual([]);
    expect(contractedRoutes.length).toBeGreaterThanOrEqual(MIN_CONTRACTED_API_ROUTES);
  });
});
