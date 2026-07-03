import { describe, expect, it } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIRS = ['app', 'components', 'lib'];
const APP_COMPONENT_DIRS = ['app', 'components'];
const API_DIR = path.join(ROOT, 'app', 'api');

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

describe('architecture guards', () => {
  it('keeps app and component code behind the data intake layer', async () => {
    const files = (await Promise.all(
      APP_COMPONENT_DIRS.map((dir) => listFiles(path.join(ROOT, dir)))
    )).flat();

    const directJsonImport = /from\s+['"](?:\.\.\/data|\.\.\/\.\.\/data)\/[^'"]+\.json['"]/;
    expect(await filesWithMatches(files, directJsonImport)).toEqual([]);
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
      /hsSgn=(?:121221|030354)(?:[&'"`]|$)/,
      /startsWith\(['"]1212211['"]\)/,
      /const\s+HSK\s*=\s*['"](?:2008995010|0303892000)['"]/,
      /statKor\s*!==\s*['"]김['"]/,
    ];

    for (const pattern of forbiddenHsLiterals) {
      expect(await filesWithMatches(apiFiles, pattern)).toEqual([]);
    }
  });
});
